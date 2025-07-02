/**
 * map.js
 * manages the map setup and interaction
 */

// global variables for the map
let map;
let neighborhoodsLayer;
let serviceSectorsLayer;
let serviceSectorsGeoJsonLayer;
let currentAnalysis = null;
let neighborhoodLabelsLayer = null; // define the labels layer here
let layersControl = null; // define the layers control variable here
let mainLayersGroup = null; // the main layers group (neighborhoods and service sectors)

// Base layer switching variables
let currentBaseIndex = 0;
let baseLayersArr = [];
let currentBaseLayer = null;

// Global variable for draw control
let drawControl = null;
let drawnItems = null;
let measureControl = null;
let measureMode = null; // 'distance' or 'area'
let activeDraw = null;

// Dummy data for dropdowns
const dummyData = {
  status: ["جيد", "متوسط", "سيء", "تحت الصيانة"],
  type: ["سكني", "تجاري", "صناعي", "مختلط"],
  priority: ["عالي", "متوسط", "منخفض"],
  department: ["المياه", "الكهرباء", "الصرف الصحي", "الطرق", "الحدائق"],
};

// Base layer definitions
const baseLayers = {
  osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }),
  satellite: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    }
  ),
  terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
  }),
};

/**
 * calculate the area of a polygon from GeoJSON data
 * @param {Object} geometry - the geometry of the polygon from GeoJSON
 * @returns {number} - the area in square meters
 */
function calculateArea(geometry) {
  if (!geometry || !geometry.coordinates || geometry.type !== "Polygon") {
    console.error("Invalid geometry provided to calculateArea");
    return 0;
  }

  try {
    // Get the coordinates of the polygon
    const coordinates = geometry.coordinates[0];

    // Calculate area using the Shoelace formula (Gauss's area formula)
    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      area += x1 * y2 - x2 * y1;
    }

    // Take the absolute value and divide by 2
    area = Math.abs(area) / 2;

    // Convert to square meters (assuming coordinates are in degrees)
    // Using a rough approximation: 1 degree ≈ 111,319.9 meters at the equator
    const METERS_PER_DEGREE = 111319.9;
    area = area * Math.pow(METERS_PER_DEGREE, 2);

    return area;
  } catch (error) {
    console.error("Error calculating area:", error);
    return 0;
  }
}

// initialize the map when the page is loaded
window.addEventListener("DOMContentLoaded", function () {
  initMap();
  // setupMapControls and loadLayers are called inside initMap
  updateStatistics();
  // Toolbar button event listeners
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const homeBtn = document.getElementById("home-btn");
  const layersBtn = document.getElementById("layers-btn");
  const measureBtn = document.getElementById("measure-btn");
  const drawBtn = document.getElementById("draw-btn");
  const basemapGallery = document.getElementById("basemap-gallery");

  // Home view settings
  const homeView = [36.2021, 37.1343];
  const homeZoom = 12;

  if (zoomInBtn) zoomInBtn.onclick = () => map && map.zoomIn();
  if (zoomOutBtn) zoomOutBtn.onclick = () => map && map.zoomOut();
  if (homeBtn) homeBtn.onclick = () => map && map.setView(homeView, homeZoom);

  // Basemap gallery logic
  const basemaps = [
    {
      name: "Streets",
      layer: baseLayers.osm,
      img: "https://a.tile.openstreetmap.org/10/563/402.png",
    },
    {
      name: "Satellite",
      layer: baseLayers.satellite,
      img: "https://mt1.google.com/vt/lyrs=s&x=563&y=402&z=10",
    },
    {
      name: "Terrain",
      layer: baseLayers.terrain,
      img: "https://a.tile.opentopomap.org/10/563/402.png",
    },
  ];
  basemapGallery.innerHTML = "";
  basemaps.forEach((bm, idx) => {
    const thumb = document.createElement("div");
    thumb.className =
      "basemap-thumb" + (map.hasLayer(bm.layer) ? " selected" : "");
    thumb.innerHTML = `<img src="${bm.img}" alt="${bm.name}"><div class="basemap-label">${bm.name}</div>`;
    thumb.addEventListener("click", () => {
      basemaps.forEach((b) => map.removeLayer(b.layer));
      map.addLayer(bm.layer);
      document
        .querySelectorAll(".basemap-thumb")
        .forEach((t) => t.classList.remove("selected"));
      thumb.classList.add("selected");
    });
    basemapGallery.appendChild(thumb);
  });
  // Show/hide gallery on layers button click
  if (layersBtn) {
    layersBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      basemapGallery.classList.toggle("open");
    });
  }
  // Hide basemap gallery when clicking outside
  document.addEventListener("click", function (e) {
    if (basemapGallery.classList.contains("open")) {
      if (!basemapGallery.contains(e.target) && e.target !== layersBtn) {
        basemapGallery.classList.remove("open");
      }
    }

    // Hide drawing toolbar when clicking outside
    if (isDrawingToolsVisible) {
      if (!drawingToolsToolbar.contains(e.target) && e.target !== drawBtn) {
        hideDrawingToolbar();
        if (activeDrawShape) {
          activeDrawShape.disable();
          activeDrawShape = null;
        }
      }
    }

    // Hide measurement toolbar when clicking outside
    if (isMeasurementToolsVisible) {
      if (
        !measurementToolsToolbar.contains(e.target) &&
        e.target !== measureBtn
      ) {
        hideMeasurementToolbar();
        if (activeDraw) {
          activeDraw.disable();
          activeDraw = null;
        }
        measureMode = null;
        const measureResultBox = document.getElementById("measure-result-box");
        if (measureResultBox) {
          measureResultBox.style.display = "none";
        }
      }
    }
  });

  // --- Measurement Tools Toolbar Toggle ---
  // Get the measurement tools toolbar
  const measurementToolsToolbar = document.getElementById(
    "measurement-tools-toolbar"
  );
  let isMeasurementToolsVisible = false;

  // Helper function to hide measurement toolbar
  function hideMeasurementToolbar() {
    if (measurementToolsToolbar) {
      measurementToolsToolbar.classList.remove("visible");
      measurementToolsToolbar.style.display = "none";
      isMeasurementToolsVisible = false;
    }
  }

  // Toggle measurement tools toolbar when measure button is clicked
  if (measureBtn) {
    measureBtn.onclick = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      // Hide drawing toolbar if visible
      if (isDrawingToolsVisible) {
        hideDrawingToolbar();
      }

      if (isMeasurementToolsVisible) {
        // Hide the toolbar
        hideMeasurementToolbar();
        // Disable any active measurement tool
        if (activeDraw) {
          activeDraw.disable();
          activeDraw = null;
        }
        measureMode = null;
        // Hide measurement result box
        const measureResultBox = document.getElementById("measure-result-box");
        if (measureResultBox) {
          measureResultBox.style.display = "none";
        }
      } else {
        // Position the toolbar below the measure button
        const measureBtnRect = measureBtn.getBoundingClientRect();
        const toolbarWidth = 120;
        const leftPosition =
          measureBtnRect.left + measureBtnRect.width / 2 - toolbarWidth / 2;

        measurementToolsToolbar.style.left = leftPosition + "px";
        measurementToolsToolbar.style.top = measureBtnRect.bottom + 5 + "px";
        measurementToolsToolbar.style.transform = "none";
        measurementToolsToolbar.style.right = "auto";

        // Show the toolbar
        measurementToolsToolbar.style.display = "flex";
        setTimeout(() => {
          measurementToolsToolbar.classList.add("visible");
        }, 10);
        isMeasurementToolsVisible = true;
      }
    };
  }

  // Urban Sectoral Functionality button event listener (now handled by sidebar buttons)
  // Event listeners for toolbar buttons removed - functionality moved to sidebar

  // Add event listener for the randomize button
  const randomizeBtn = document.getElementById("randomize-functionality-btn");
  if (randomizeBtn) {
    randomizeBtn.addEventListener("click", function () {
      generateRandomSectoralFunctionalityForAll();
      populateSectoralFunctionalityTable(); // Update the table
      showNotification("تم تحديث الفعالية القطاعية بنجاح", "success");
    });
  }

  // Add event listener for apply sectoral mapping button
  const applySectoralMappingBtn = document.getElementById(
    "apply-sectoral-mapping-btn"
  );
  if (applySectoralMappingBtn) {
    applySectoralMappingBtn.addEventListener("click", function () {
      showSectoralMappingInterface();
    });
  }

  // Full screen popup elements and event listeners
  const fullscreenPopup = document.getElementById("fullscreen-popup");
  const fullscreenPopupClose = document.getElementById(
    "fullscreen-popup-close"
  );

  if (fullscreenPopupClose) {
    fullscreenPopupClose.addEventListener("click", function () {
      hideFullscreenPopup();
    });
  }

  // Close popup when clicking outside content area
  if (fullscreenPopup) {
    fullscreenPopup.addEventListener("click", function (e) {
      if (e.target === fullscreenPopup) {
        hideFullscreenPopup();
      }
    });
  }

  // Close popup with Escape key
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      fullscreenPopup &&
      fullscreenPopup.classList.contains("show")
    ) {
      hideFullscreenPopup();
    }
  });

  // Drawing tool toggle
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // --- Drawing Tools Toolbar Toggle ---
  // Get the drawing tools toolbar
  const drawingToolsToolbar = document.getElementById("drawing-tools-toolbar");

  // Drawing tool logic
  let activeDrawShape = null;
  let isDrawingToolsVisible = false;

  // Helper function to hide drawing toolbar
  function hideDrawingToolbar() {
    if (drawingToolsToolbar) {
      drawingToolsToolbar.classList.remove("visible");
      drawingToolsToolbar.style.display = "none";
      isDrawingToolsVisible = false;
    }
  }

  // Toggle drawing tools toolbar when draw button is clicked
  if (drawBtn) {
    drawBtn.onclick = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      // Hide measurement toolbar if visible
      if (isMeasurementToolsVisible) {
        hideMeasurementToolbar();
      }

      if (isDrawingToolsVisible) {
        // Hide the toolbar
        hideDrawingToolbar();
        // Disable any active drawing tool
        if (activeDrawShape) {
          activeDrawShape.disable();
          activeDrawShape = null;
        }
      } else {
        // Position the toolbar below the draw button
        const drawBtnRect = drawBtn.getBoundingClientRect();
        const toolbarWidth = 120;
        const leftPosition =
          drawBtnRect.left + drawBtnRect.width / 2 - toolbarWidth / 2;

        drawingToolsToolbar.style.left = leftPosition + "px";
        drawingToolsToolbar.style.top = drawBtnRect.bottom + 5 + "px";
        drawingToolsToolbar.style.transform = "none";
        drawingToolsToolbar.style.right = "auto";

        // Show the toolbar
        drawingToolsToolbar.style.display = "flex";
        setTimeout(() => {
          drawingToolsToolbar.classList.add("visible");
        }, 10);
        isDrawingToolsVisible = true;
      }
    };
  }

  // Drawing toolbar button handlers
  const drawPolylineBtn = document.getElementById("draw-polyline-btn");
  const drawPolygonBtn = document.getElementById("draw-polygon-btn");
  const drawRectangleBtn = document.getElementById("draw-rectangle-btn");
  const drawCircleBtn = document.getElementById("draw-circle-btn");
  const drawMarkerBtn = document.getElementById("draw-marker-btn");

  if (drawPolylineBtn) {
    drawPolylineBtn.onclick = function (e) {
      e.stopPropagation(); // Prevent event bubbling
      if (activeDrawShape) activeDrawShape.disable();
      if (activeDraw) activeDraw.disable(); // Disable measurement tools
      measureMode = null;
      activeDrawShape = new L.Draw.Polyline(map, {
        shapeOptions: { color: "#ff5722", weight: 4 },
      });
      activeDrawShape.enable();
      hideDrawingToolbar(); // Auto-hide after selection
    };
  }

  if (drawPolygonBtn) {
    drawPolygonBtn.onclick = function (e) {
      e.stopPropagation(); // Prevent event bubbling
      if (activeDrawShape) activeDrawShape.disable();
      if (activeDraw) activeDraw.disable(); // Disable measurement tools
      measureMode = null;
      activeDrawShape = new L.Draw.Polygon(map, {
        shapeOptions: { color: "#2196f3", weight: 3 },
      });
      activeDrawShape.enable();
      hideDrawingToolbar(); // Auto-hide after selection
    };
  }

  if (drawRectangleBtn) {
    drawRectangleBtn.onclick = function (e) {
      e.stopPropagation(); // Prevent event bubbling
      if (activeDrawShape) activeDrawShape.disable();
      if (activeDraw) activeDraw.disable(); // Disable measurement tools
      measureMode = null;
      activeDrawShape = new L.Draw.Rectangle(map, {
        shapeOptions: { color: "#4caf50", weight: 3 },
      });
      activeDrawShape.enable();
      hideDrawingToolbar(); // Auto-hide after selection
    };
  }

  if (drawCircleBtn) {
    drawCircleBtn.onclick = function (e) {
      e.stopPropagation(); // Prevent event bubbling
      if (activeDrawShape) activeDrawShape.disable();
      if (activeDraw) activeDraw.disable(); // Disable measurement tools
      measureMode = null;
      activeDrawShape = new L.Draw.Circle(map, {
        shapeOptions: { color: "#ff9800", weight: 3 },
      });
      activeDrawShape.enable();
      hideDrawingToolbar(); // Auto-hide after selection
    };
  }

  if (drawMarkerBtn) {
    drawMarkerBtn.onclick = function (e) {
      e.stopPropagation(); // Prevent event bubbling
      if (activeDrawShape) activeDrawShape.disable();
      if (activeDraw) activeDraw.disable(); // Disable measurement tools
      measureMode = null;
      activeDrawShape = new L.Draw.Marker(map, {});
      activeDrawShape.enable();
      hideDrawingToolbar(); // Auto-hide after selection
    };
  }

  // Draw created event for custom popup with delete
  map.on("draw:created", function (e) {
    const layer = e.layer;
    // Create custom popup content with delete button
    const popupContent = document.createElement("div");
    popupContent.className = "draw-popup";
    popupContent.style.padding = "10px";
    popupContent.style.textAlign = "center";
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-draw-btn";
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> حذف الشكل';
    deleteButton.style.backgroundColor = "#dc3545";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "5px 10px";
    deleteButton.style.borderRadius = "4px";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.marginTop = "5px";
    deleteButton.style.width = "100%";
    deleteButton.onclick = function () {
      if (drawnItems) {
        drawnItems.removeLayer(layer);
      }
    };
    popupContent.appendChild(deleteButton);
    layer.bindPopup(popupContent);
    layer.openPopup();
    if (drawnItems) drawnItems.addLayer(layer);
    if (activeDrawShape) activeDrawShape.disable();
  });

  // Measurement toolbar button handlers
  const measureDistanceBtnToolbar = document.getElementById(
    "measure-distance-btn"
  );
  const measureAreaBtnToolbar = document.getElementById("measure-area-btn");

  if (measureDistanceBtnToolbar) {
    measureDistanceBtnToolbar.onclick = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      startMeasureMode("distance");
      hideMeasurementToolbar(); // Auto-hide after selection
    };
  }

  if (measureAreaBtnToolbar) {
    measureAreaBtnToolbar.onclick = (e) => {
      e.stopPropagation(); // Prevent event bubbling
      startMeasureMode("area");
      hideMeasurementToolbar(); // Auto-hide after selection
    };
  }

  // Function to start measurement mode
  function startMeasureMode(type) {
    // Disable any previous active drawing tool
    if (activeDraw) {
      activeDraw.disable();
    }

    // Disable any active drawing shape from drawing tools
    if (activeDrawShape) {
      activeDrawShape.disable();
    }

    measureMode = type;

    if (type === "distance") {
      activeDraw = new L.Draw.Polyline(map, {
        shapeOptions: {
          color: "#dc3545",
          weight: 4,
        },
      });
    } else if (type === "area") {
      activeDraw = new L.Draw.Polygon(map, {
        shapeOptions: {
          color: "#28a745",
          weight: 3,
          fillOpacity: 0.2,
        },
      });
    }

    if (activeDraw) {
      activeDraw.enable();
    }
  }

  // Function to show measure result box
  function showMeasureResultBox(result, type) {
    const resultBox = document.createElement("div");
    resultBox.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Cairo', sans-serif;
      text-align: center;
      min-width: 300px;
    `;

    const typeText = type === "distance" ? "المسافة" : "المساحة";
    const unit = type === "distance" ? "متر" : "متر مربع";

    resultBox.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">نتيجة القياس</h3>
      <p style="margin: 10px 0; font-size: 16px;">
        <strong>${typeText}:</strong> ${result.toFixed(2)} ${unit}
      </p>
      <button onclick="this.parentElement.remove()" style="
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      ">إغلاق</button>
    `;

    document.body.appendChild(resultBox);

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (resultBox.parentElement) {
        resultBox.remove();
      }
    }, 10000);
  }

  // Make functions available globally
  window.startMeasureMode = startMeasureMode;
  window.showMeasureResultBox = showMeasureResultBox;

  // Remove automatic layer switching based on zoom level
  // Layers will now be controlled only through the layer management interface
  console.log(
    "Layer visibility will be controlled through the layer management interface only"
  );

  // Symbol Editor Event Listeners
  const layerStyleSelect = document.getElementById("layerStyleSelect");
  const neighborhoodColoringSection = document.getElementById(
    "neighborhoodColoringSection"
  );
  const colorByColumnSelect = document.getElementById("colorByColumnSelect");
  const applyColumnColoringBtn = document.getElementById(
    "applyColumnColoringBtn"
  );

  // Show/hide neighborhood coloring section based on layer selection
  if (layerStyleSelect) {
    layerStyleSelect.addEventListener("change", function () {
      console.log("Layer style select changed to:", this.value);
      if (this.value === "neighborhoods") {
        if (neighborhoodColoringSection) {
          neighborhoodColoringSection.style.display = "block";
          // Function is defined in sectoral-analysis.js
          console.log("Attempting to populate column dropdown...");
          if (window.populateColumnDropdown) {
            window.populateColumnDropdown();
          } else {
            console.error("populateColumnDropdown function not available");
            // Try again after a short delay
            setTimeout(() => {
              if (window.populateColumnDropdown) {
                console.log("Retrying populateColumnDropdown...");
                window.populateColumnDropdown();
              }
            }, 500);
          }
        }
      } else {
        if (neighborhoodColoringSection) {
          neighborhoodColoringSection.style.display = "none";
        }
        // Reset coloring if switching away from neighborhoods
        if (window.resetNeighborhoodColoring) {
          window.resetNeighborhoodColoring();
        }
      }
    });
  }

  // Try to populate dropdown on initial load if neighborhoods is selected
  setTimeout(() => {
    if (layerStyleSelect && layerStyleSelect.value === "neighborhoods") {
      console.log("Initial load - neighborhoods selected, populating dropdown");
      if (window.populateColumnDropdown) {
        window.populateColumnDropdown();
      }
    }
  }, 3000);

  // Apply column-based coloring with enhanced UX
  if (applyColumnColoringBtn) {
    applyColumnColoringBtn.addEventListener("click", function () {
      const selectedColumn = colorByColumnSelect
        ? colorByColumnSelect.value
        : "";
      if (selectedColumn) {
        // Add loading state
        this.classList.add("loading-state");
        this.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> جاري التطبيق...';
        this.disabled = true;

        // Apply coloring with a slight delay for better UX
        setTimeout(() => {
          // Function is defined in sectoral-analysis.js
          if (window.applyColumnColoring) {
            window.applyColumnColoring(selectedColumn);
          }

          // Show success state
          this.classList.remove("loading-state");
          this.classList.add("success-state");
          this.innerHTML = '<i class="fas fa-check"></i> تم التطبيق بنجاح';

          // Reset button after 2 seconds
          setTimeout(() => {
            this.classList.remove("success-state");
            this.innerHTML = '<i class="fas fa-palette"></i> تطبيق التلوين';
            this.disabled = false;
          }, 2000);
        }, 500);
      } else {
        // Enhanced error feedback
        this.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
          this.style.animation = "";
        }, 500);

        // Show tooltip-style error message
        showTooltipMessage(this, "يرجى اختيار عمود للتلوين أولاً");
      }
    });
  }

  // Reset coloring when column selection changes to empty
  if (colorByColumnSelect) {
    colorByColumnSelect.addEventListener("change", function () {
      if (!this.value) {
        if (window.resetNeighborhoodColoring) {
          window.resetNeighborhoodColoring();
        }
      }
    });
  }

  // Enhanced apply style button functionality
  const applyStyleBtn = document.getElementById("applyStyleBtn");
  if (applyStyleBtn) {
    applyStyleBtn.addEventListener("click", function () {
      const layerSelect = document.getElementById("layerStyleSelect");
      const layerColor = document.getElementById("layerColor");
      const layerOpacity = document.getElementById("layerOpacity");
      const lineWeight = document.getElementById("lineWeight");

      if (!layerSelect || !layerSelect.value) {
        this.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
          this.style.animation = "";
        }, 500);
        showTooltipMessage(this, "يرجى اختيار طبقة أولاً");
        return;
      }

      // Add loading state
      this.classList.add("loading-state");
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التطبيق...';
      this.disabled = true;

      // Apply styling with delay for better UX
      setTimeout(() => {
        const style = {
          color: layerColor ? layerColor.value : "#1e40af",
          opacity: layerOpacity ? parseFloat(layerOpacity.value) : 0.8,
          weight: lineWeight ? parseInt(lineWeight.value) : 2,
        };

        // Apply the style (this function should be defined elsewhere)
        if (window.applyMapLayerStyle) {
          window.applyMapLayerStyle(layerSelect.value, style);
        }

        // Show success state
        this.classList.remove("loading-state");
        this.classList.add("success-state");
        this.innerHTML = '<i class="fas fa-check"></i> تم التطبيق بنجاح';

        // Reset button after 2 seconds
        setTimeout(() => {
          this.classList.remove("success-state");
          this.innerHTML = '<i class="fas fa-check"></i> تطبيق';
          this.disabled = false;
        }, 2000);
      }, 500);
    });
  }
});

// Helper function to show tooltip messages
function showTooltipMessage(element, message) {
  // Remove existing tooltip
  const existingTooltip = element.querySelector(".tooltiptext");
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Create tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "tooltiptext";
  tooltip.textContent = message;

  // Add tooltip class to element
  element.classList.add("tooltip");
  element.appendChild(tooltip);

  // Show tooltip
  setTimeout(() => {
    tooltip.style.visibility = "visible";
    tooltip.style.opacity = "1";
  }, 100);

  // Hide tooltip after 3 seconds
  setTimeout(() => {
    tooltip.style.visibility = "hidden";
    tooltip.style.opacity = "0";
    setTimeout(() => {
      element.classList.remove("tooltip");
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 300);
  }, 3000);
}

// Fix for white space issue - force map resize when window is resized
window.addEventListener("resize", function () {
  if (map) {
    map.invalidateSize(true);
  }
});

// Fix for white space issue - force map resize after a short delay
setTimeout(function () {
  if (map) {
    map.invalidateSize(true);
  }
}, 500);

/**
 * initialize the map
 */
function initMap() {
  // Remove previous map instance if exists
  if (map) {
    map.remove();
    map = null;
  }

  // check if the map element exists in the page
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("the map element is not found");
    return;
  }

  // create the map in the DOM element
  map = L.map("map", {
    center: [36.2021, 37.1343], // coordinates of Aleppo
    zoom: 12,
    zoomControl: false, // we will add the zoom control elements manually
    attributionControl: true,
  });

  // add the basic OpenStreetMap layer
  const streetsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }
  );
  streetsLayer.addTo(map);

  // add the Google satellite layer
  const satelliteLayer = L.tileLayer(
    "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
      attribution: "&copy; Google",
      maxZoom: 19,
    }
  );

  // add the terrain layer
  const terrainLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
      maxZoom: 17,
    }
  );

  // add the base layers control
  const baseLayers = {
    "خريطة الشوارع": streetsLayer,
    "صور الأقمار الصناعية": satelliteLayer,
    "الخريطة الطبوغرافية": terrainLayer,
  };

  // setup the base layers array
  baseLayersArr = [
    { name: "streets", layer: streetsLayer },
    { name: "satellite", layer: satelliteLayer },
    { name: "terrain", layer: terrainLayer },
  ];
  currentBaseLayer = baseLayersArr[0].layer;
  currentBaseIndex = 0;

  // --- add additional layers (Overlays) ---
  // we will add the labels layer later after loading the neighborhoods
  const overlays = {};

  // function to switch the base layer
  function setBaseLayer(index) {
    baseLayersArr.forEach(function (obj) {
      if (map.hasLayer(obj.layer)) map.removeLayer(obj.layer);
    });
    map.addLayer(baseLayersArr[index].layer);
    currentBaseIndex = index;
  }

  // Make setBaseLayer available globally
  window.setBaseLayer = setBaseLayer;

  // Make layer variables available globally
  window.neighborhoodsLayer = neighborhoodsLayer;
  window.serviceSectorsLayer = serviceSectorsLayer;
  window.serviceSectorsGeoJsonLayer = serviceSectorsGeoJsonLayer;
  window.neighborhoodLabelsLayer = neighborhoodLabelsLayer;

  // the default base layer
  setBaseLayer(0);

  // add the layers control to the map
  L.control
    .layers(baseLayers, null, {
      position: "topleft",
      collapsed: true,
    })
    .addTo(map);

  // add the zoom control to the map
  L.control
    .zoom({
      position: "topleft",
    })
    .addTo(map);

  // add the scale control to the map (always)
  L.control
    .scale({
      position: "bottomleft",
      imperial: false,
    })
    .addTo(map);

  // add the drawing tools (always)
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
    },
  });
  map.addControl(drawControl);

  // Add draw:created event listener
  map.on("draw:created", function (e) {
    const layer = e.layer;
    let result = "";
    if (e.layerType === "polyline") {
      // Calculate distance
      const latlngs = layer.getLatLngs();
      let distance = 0;
      for (let i = 1; i < latlngs.length; i++) {
        distance += latlngs[i - 1].distanceTo(latlngs[i]);
      }
      result = `المسافة: ${(distance / 1000).toFixed(2)} كم`;
    } else if (e.layerType === "polygon") {
      // Calculate area
      const latlngs = layer.getLatLngs()[0];
      const area = L.GeometryUtil ? L.GeometryUtil.geodesicArea(latlngs) : 0;
      result = `المساحة: ${(area / 1000000).toFixed(2)} كم²`;
    }

    // Create custom popup content with buttons
    const popupContent = document.createElement("div");
    popupContent.className = "measurement-popup";
    popupContent.style.padding = "10px";
    popupContent.style.textAlign = "center";

    // Add measurement result
    const resultDiv = document.createElement("div");
    resultDiv.style.marginBottom = "10px";
    resultDiv.style.fontWeight = "bold";
    resultDiv.textContent = result;
    popupContent.appendChild(resultDiv);

    // Add delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-measurement-btn";
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> حذف القياس';
    deleteButton.style.backgroundColor = "#dc3545";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "5px 10px";
    deleteButton.style.borderRadius = "4px";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.marginTop = "5px";
    deleteButton.style.width = "100%";

    deleteButton.onclick = function () {
      if (drawnItems) {
        drawnItems.removeLayer(layer);
      }
    };

    popupContent.appendChild(deleteButton);

    // Bind the custom popup to the layer
    layer.bindPopup(popupContent);
    layer.openPopup();

    // Add the layer to drawnItems
    if (drawnItems) drawnItems.addLayer(layer);

    // Disable the draw control
    if (activeDraw) {
      activeDraw.disable();
    }
    measureMode = null;

    // Show result in floating box
    showMeasureResultBox(result);
  });

  // create the main layers group
  mainLayersGroup = L.layerGroup().addTo(map);

  // setup the map controls
  setupMapControls();

  // load the layers
  loadLayers();

  // Initialize base layer controls
  initBaseLayerControls();

  // Add default base layer
  currentBaseLayer.addTo(map);

  // add the scale bar (always visible)
  L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

  // basemap gallery logic
  const basemapGallery = document.getElementById("basemap-gallery");
  const basemaps = [
    {
      name: "Streets",
      layer: streetsLayer,
      img: "https://a.tile.openstreetmap.org/10/563/402.png",
    },
    {
      name: "Satellite",
      layer: satelliteLayer,
      img: "https://mt1.google.com/vt/lyrs=s&x=563&y=402&z=10",
    },
    {
      name: "Terrain",
      layer: terrainLayer,
      img: "https://a.tile.opentopomap.org/10/563/402.png",
    },
  ];
  basemapGallery.innerHTML = "";
  basemaps.forEach((bm, idx) => {
    const thumb = document.createElement("div");
    thumb.className =
      "basemap-thumb" + (map.hasLayer(bm.layer) ? " selected" : "");
    thumb.innerHTML = `<img src="${bm.img}" alt="${bm.name}"><div class="basemap-label">${bm.name}</div>`;
    thumb.addEventListener("click", () => {
      basemaps.forEach((b) => map.removeLayer(b.layer));
      map.addLayer(bm.layer);
      document
        .querySelectorAll(".basemap-thumb")
        .forEach((t) => t.classList.remove("selected"));
      thumb.classList.add("selected");
    });
    basemapGallery.appendChild(thumb);
  });
  // show/hide gallery on layers button click
  const layersBtn = document.getElementById("layers-btn");
  if (layersBtn) {
    layersBtn.addEventListener("click", () => {
      basemapGallery.classList.toggle("open");
    });
  }

  // add the clear measurements button
  addClearMeasurementsButton();

  // at the end of initMap, set window.map = map
  window.map = map;

  // modify the layers button position and style
  if (layersBtn) {
    // update the button position and style
    layersBtn.style.position = "fixed";
    layersBtn.style.left = "20px";
    layersBtn.style.bottom = "80px"; // position above footer
    layersBtn.style.zIndex = "1000";
    layersBtn.style.backgroundColor = "#fff";
    layersBtn.style.border = "none";
    layersBtn.style.borderRadius = "50%"; // make it circular
    layersBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    layersBtn.style.padding = "12px";
    layersBtn.style.cursor = "pointer";
    layersBtn.style.display = "flex";
    layersBtn.style.alignItems = "center";
    layersBtn.style.justifyContent = "center";
    layersBtn.style.transition = "all 0.3s ease";
    layersBtn.style.width = "48px";
    layersBtn.style.height = "48px";

    // Add hover effect
    layersBtn.onmouseover = function () {
      this.style.transform = "scale(1.1)";
      this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    };
    layersBtn.onmouseout = function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    };

    // Add image to button
    const layersIcon = document.createElement("img");
    // layersIcon.src = "../../assets/img/images.png";
    layersIcon.alt = "Layers";
    layersIcon.style.width = "24px";
    layersIcon.style.height = "24px";

    // Clear existing content and add new content
    layersBtn.innerHTML = "";
    layersBtn.appendChild(layersIcon);

    // Update basemap gallery position and style
    const basemapGallery = document.getElementById("basemap-gallery");
    if (basemapGallery) {
      // Reset any existing styles
      basemapGallery.style.cssText = "";

      // Apply new styles
      Object.assign(basemapGallery.style, {
        position: "fixed",
        left: "20px",
        bottom: "140px",
        zIndex: "999",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        padding: "20px",
        display: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: "0",
        transform: "translateY(20px)",
        maxWidth: "320px",
        width: "100%",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        direction: "rtl",
      });

      // Clear existing content
      basemapGallery.innerHTML = "";

      // Add title to gallery
      const galleryTitle = document.createElement("div");
      Object.assign(galleryTitle.style, {
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "15px",
        color: "#333",
        textAlign: "center",
        paddingBottom: "10px",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        fontFamily: "Cairo, sans-serif",
      });
      galleryTitle.textContent = "اختر نوع الخريطة";
      basemapGallery.appendChild(galleryTitle);

      // Create container for basemap options
      const optionsContainer = document.createElement("div");
      Object.assign(optionsContainer.style, {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      });

      // Add basemap options
      const basemaps = [
        {
          name: "خريطة الشوارع",
          layer: baseLayers.osm,
          img: "https://a.tile.openstreetmap.org/10/563/402.png",
        },
        {
          name: "صور الأقمار الصناعية",
          layer: baseLayers.satellite,
          img: "https://mt1.google.com/vt/lyrs=s&x=563&y=402&z=10",
        },
        {
          name: "الخريطة الطبوغرافية",
          layer: baseLayers.terrain,
          img: "https://a.tile.opentopomap.org/10/563/402.png",
        },
      ];

      basemaps.forEach((bm, idx) => {
        const option = document.createElement("div");
        Object.assign(option.style, {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px",
          borderRadius: "12px",
          backgroundColor: "#f8f9fa",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: "1px solid rgba(0,0,0,0.05)",
        });

        const img = document.createElement("img");
        Object.assign(img.style, {
          width: "60px",
          height: "60px",
          borderRadius: "8px",
          objectFit: "cover",
        });
        img.src = bm.img;
        img.alt = bm.name;

        const label = document.createElement("div");
        Object.assign(label.style, {
          fontSize: "14px",
          fontWeight: "500",
          color: "#333",
          fontFamily: "Cairo, sans-serif",
        });
        label.textContent = bm.name;

        option.appendChild(img);
        option.appendChild(label);

        // Add hover effect
        option.onmouseover = function () {
          this.style.transform = "translateY(-2px)";
          this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          this.style.backgroundColor = "#f1f3f5";
        };
        option.onmouseout = function () {
          this.style.transform = "translateY(0)";
          this.style.boxShadow = "none";
          if (!this.classList.contains("selected")) {
            this.style.backgroundColor = "#f8f9fa";
          }
        };

        // Add click handler
        option.onclick = function () {
          // Remove selected class from all options
          optionsContainer.querySelectorAll("div").forEach((opt) => {
            opt.classList.remove("selected");
            opt.style.backgroundColor = "#f8f9fa";
            opt.style.boxShadow = "none";
          });

          // Add selected class to clicked option
          this.classList.add("selected");
          this.style.backgroundColor = "#e3f2fd";
          this.style.boxShadow = "0 2px 8px rgba(33,150,243,0.15)";

          // Switch basemap
          basemaps.forEach((b) => map.removeLayer(b.layer));
          map.addLayer(bm.layer);
        };

        optionsContainer.appendChild(option);
      });

      basemapGallery.appendChild(optionsContainer);

      // Add close button
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "×";
      Object.assign(closeButton.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "none",
        border: "none",
        fontSize: "24px",
        color: "#666",
        cursor: "pointer",
        padding: "5px",
        lineHeight: "1",
        transition: "color 0.2s ease",
        fontFamily: "Cairo, sans-serif",
      });

      closeButton.onmouseover = function () {
        this.style.color = "#333";
      };
      closeButton.onmouseout = function () {
        this.style.color = "#666";
      };

      closeButton.onclick = function (e) {
        e.stopPropagation();
        basemapGallery.style.opacity = "0";
        basemapGallery.style.transform = "translateY(20px)";
        setTimeout(() => {
          basemapGallery.style.display = "none";
        }, 300);
      };

      basemapGallery.appendChild(closeButton);

      // Add click handler for layers button (show/hide gallery with animation)
      if (layersBtn) {
        layersBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          const isOpen = basemapGallery.style.display === "block";
          if (isOpen) {
            basemapGallery.style.opacity = "0";
            basemapGallery.style.transform = "translateY(20px)";
            setTimeout(() => {
              basemapGallery.style.display = "none";
            }, 300);
          } else {
            basemapGallery.style.display = "block";
            setTimeout(() => {
              basemapGallery.style.opacity = "1";
              basemapGallery.style.transform = "translateY(0)";
            }, 10);
          }
        });
      }
      // Close gallery when clicking outside
      document.addEventListener("click", function (e) {
        if (
          basemapGallery &&
          !basemapGallery.contains(e.target) &&
          e.target !== layersBtn
        ) {
          basemapGallery.style.opacity = "0";
          basemapGallery.style.transform = "translateY(20px)";
          setTimeout(() => {
            basemapGallery.style.display = "none";
          }, 300);
        }
      });
    }
  }

  // بعد تحميل طبقة الأحياء وطبقة التسميات، أضفهم إلى لوحة التحكم
  setTimeout(function () {
    if (neighborhoodsLayer) overlays["طبقة الأحياء"] = neighborhoodsLayer;
    if (neighborhoodLabelsLayer)
      overlays["مسميات الأحياء"] = neighborhoodLabelsLayer;
    if (serviceSectorsLayer) overlays["دوائر الخدمات"] = serviceSectorsLayer;
    // إعادة إنشاء لوحة التحكم بالطبقات
    L.control
      .layers(baseLayers, overlays, {
        position: "topleft",
        collapsed: false,
      })
      .addTo(map);
  }, 800);
}

/**
 * إعداد عناصر التحكم في الخريطة
 */
function setupMapControls() {
  // زر التحليل
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", function () {
      showAnalysisPanel();
    });
  }

  // زر القياس
  const measureBtn = document.getElementById("measureBtn");
  if (measureBtn) {
    measureBtn.addEventListener("click", function () {
      toggleMeasureTool();
    });
  }

  // زر التصفية
  const filterBtn = document.getElementById("filterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", function () {
      showFilterPanel();
    });
  }

  // إغلاق لوحة المعلومات
  const closeInfoPanel = document.getElementById("closeInfoPanel");
  if (closeInfoPanel) {
    closeInfoPanel.addEventListener("click", function () {
      hideInfoPanel();
    });
  }
}

/**
 * تحميل طبقات الخريطة (الأحياء والقطاعات)
 */
function loadLayers() {
  // التحقق من وجود بيانات الأحياء
  if (typeof neighborhoodsData !== "undefined") {
    loadNeighborhoodsLayer();
  } else {
    console.error("لم يتم العثور على بيانات الأحياء");
  }

  // تحميل طبقة دوائر الخدمات إذا كانت البيانات جاهزة
  if (serviceSectorsData) {
    loadServiceSectorsLayer();
  } else {
    // الاستماع إلى حدث تحميل البيانات
    document.addEventListener("serviceSectorsLoaded", function () {
      loadServiceSectorsLayer();
    });
  }
}

/**
 * معالجة كل حي عند تحميل طبقة الأحياء
 * @param {Object} feature - بيانات الحي من GeoJSON
 * @param {L.Layer} layer - طبقة Leaflet للحي
 */
function onEachNeighborhood(feature, layer) {
  // إنشاء محتوى النافذة المنبثقة
  createNeighborhoodPopup(feature, layer);

  // إضافة مستمع حدث النقر
  layer.on("click", function () {
    // تحديث العنوان في لوحة المعلومات
    const infoTitle = document.getElementById("info-title");
    if (infoTitle) {
      infoTitle.textContent =
        feature.properties.Names || feature.properties.name || "غير معروف";
    }

    // تحديث محتوى لوحة المعلومات
    handleNeighborhoodSelect(
      feature.properties.ID,
      feature.properties.Names || feature.properties.name
    );
  });

  // إضافة تأثيرات حركية عند التحويم
  layer.on("mouseover", function () {
    this.setStyle({
      fillOpacity: 0.7,
      weight: 2,
    });
  });

  layer.on("mouseout", function () {
    this.setStyle({
      fillOpacity: 0.5,
      weight: 1,
    });
  });
}

/**
 * تحميل طبقة أحياء حلب
 */
function loadNeighborhoodsLayer() {
  // Remove existing layer if it exists
  if (neighborhoodsLayer) {
    map.removeLayer(neighborhoodsLayer);
  }
  if (neighborhoodLabelsLayer) {
    map.removeLayer(neighborhoodLabelsLayer);
  }

  neighborhoodsLayer = L.geoJSON(neighborhoodsData, {
    style: {
      fillColor: "#3388ff",
      weight: 1,
      opacity: 1,
      color: "#ffffff",
      fillOpacity: 0.5,
    },
    onEachFeature: onEachNeighborhood,
  });

  // Add labels for each neighborhood
  neighborhoodLabelsLayer = L.layerGroup();
  neighborhoodsData.features.forEach((feature) => {
    try {
      let coords = feature.geometry.coordinates[0];
      let sumLat = 0,
        sumLng = 0;
      coords.forEach((coord) => {
        sumLat += coord[1];
        sumLng += coord[0];
      });
      let centerLat = sumLat / coords.length;
      let centerLng = sumLng / coords.length;
      let name =
        feature.properties.Names || feature.properties.name || "غير معروف";
      let label = L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: "neighborhood-label",
          html: `<div style="background:rgba(255,255,255,0.85);border-radius:8px;padding:2px 10px;font-size:13px;font-weight:600;color:#3066ff;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-family:'Noto Naskh Arabic',sans-serif;">${name}</div>`,
          iconSize: [100, 24],
          iconAnchor: [50, 12],
        }),
      });
      neighborhoodLabelsLayer.addLayer(label);
    } catch (e) { }
  });

  // إعادة إنشاء لوحة التحكم بالطبقات بعد إنشاء طبقة المسميات
  if (layersControl) {
    map.removeControl(layersControl);
  }
  const baseLayers = {
    "خريطة الشوارع": baseLayersArr[0].layer,
    "صور الأقمار الصناعية": baseLayersArr[1].layer,
    "الخريطة الطبوغرافية": baseLayersArr[2].layer,
  };
  const overlays = {
    "طبقة الأحياء": neighborhoodsLayer,
    "مسميات الأحياء": neighborhoodLabelsLayer,
  };
  if (serviceSectorsLayer) overlays["دوائر الخدمات"] = serviceSectorsLayer;
  layersControl = L.control
    .layers(baseLayers, overlays, {
      position: "topleft",
      collapsed: false,
    })
    .addTo(map);

  // إضافة الطبقات إلى المجموعة الرئيسية
  if (mainLayersGroup) {
    mainLayersGroup.addLayer(neighborhoodsLayer);
    mainLayersGroup.addLayer(neighborhoodLabelsLayer);
  } else {
    // إضافة مباشرة إلى الخريطة إذا لم تكن المجموعة متاحة
    neighborhoodsLayer.addTo(map);
    neighborhoodLabelsLayer.addTo(map);
  }

  // Fit map bounds to show all neighborhoods
  map.fitBounds(neighborhoodsLayer.getBounds());

  // Update global window variables
  window.neighborhoodsLayer = neighborhoodsLayer;
  window.neighborhoodLabelsLayer = neighborhoodLabelsLayer;
  window.mainLayersGroup = mainLayersGroup;

  // Call populateReportDropdown after loading neighborhoods
  if (typeof populateReportDropdown === "function") {
    populateReportDropdown();
  }
}

// Function to create popup content for neighborhood
function createNeighborhoodPopup(feature, layer) {
  const properties = feature.properties;
  const name = properties.Names || properties.name || "غير معروف";
  const area = calculateArea(feature.geometry);
  const areaInHectares = (area / 10000).toFixed(2); // Convert to hectares
  const sector = properties.Sector || "";

  const popupContent = document.createElement("div");
  popupContent.className = "neighborhood-popup";
  popupContent.style.padding = "0";
  popupContent.style.maxWidth = "320px";
  popupContent.style.direction = "rtl";
  popupContent.style.borderRadius = "10px";
  popupContent.style.overflow = "hidden";
  popupContent.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
  popupContent.style.background = "#fff";
  popupContent.style.fontFamily = '"Cairo", sans-serif';

  // Create header with styles
  const header = document.createElement("h3");
  header.textContent = name;
  header.style.margin = "0";
  header.style.fontSize = "18px";
  header.style.color = "#fff";
  header.style.padding = "14px 15px";
  header.style.background = "linear-gradient(135deg, #007bff, #3066ff)";
  header.style.textAlign = "center";
  header.style.fontWeight = "600";
  header.style.position = "relative";
  header.style.overflow = "hidden";
  header.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.2)";
  header.style.letterSpacing = "0.5px";

  // Create info container
  const infoContainer = document.createElement("div");
  infoContainer.className = "popup-info";
  infoContainer.style.margin = "0";
  infoContainer.style.padding = "15px";
  infoContainer.style.background = "rgba(248, 250, 252, 0.8)";
  infoContainer.style.borderBottom = "1px solid #eef2f7";

  // Create ID paragraph
  const idPara = document.createElement("p");
  idPara.style.margin = "8px 0";
  idPara.style.fontSize = "14px";
  idPara.style.color = "#4a5568";
  idPara.style.display = "flex";
  idPara.style.alignItems = "center";
  idPara.style.justifyContent = "space-between";
  idPara.style.padding = "8px 0";
  idPara.style.borderBottom = "1px dashed rgba(203, 213, 224, 0.5)";

  const idStrong = document.createElement("strong");
  idStrong.style.color = "#2d3748";
  idStrong.style.fontWeight = "600";
  idStrong.style.marginLeft = "8px";
  idStrong.style.display = "flex";
  idStrong.style.alignItems = "center";
  idStrong.style.gap = "6px";

  const idIcon = document.createElement("i");
  idIcon.className = "fas fa-fingerprint";
  idIcon.style.color = "#3066ff";
  idIcon.style.fontSize = "14px";
  idIcon.style.width = "16px";
  idIcon.style.textAlign = "center";

  idStrong.appendChild(idIcon);
  idStrong.appendChild(document.createTextNode(" المعرف:"));

  const idSpan = document.createElement("span");
  idSpan.textContent = properties.ID || "غير متوفر";
  idSpan.style.fontWeight = "500";
  idSpan.style.background = "rgba(237, 242, 247, 0.5)";
  idSpan.style.padding = "3px 8px";
  idSpan.style.borderRadius = "4px";

  idPara.appendChild(idStrong);
  idPara.appendChild(idSpan);

  // Create sector paragraph (similar structure)

  // Create export report paragraph (replacing the composite calculation)
  const exportPara = document.createElement("p");
  exportPara.style.margin = "8px 0";
  exportPara.style.fontSize = "14px";
  exportPara.style.color = "#4a5568";
  exportPara.style.display = "flex";
  exportPara.style.alignItems = "center";
  exportPara.style.justifyContent = "space-between";
  exportPara.style.padding = "8px 0";
  exportPara.style.cursor = "pointer";
  exportPara.style.transition = "background-color 0.2s ease";

  const exportStrong = document.createElement("strong");
  exportStrong.style.color = "#2d3748";
  exportStrong.style.fontWeight = "600";
  exportStrong.style.marginLeft = "8px";
  exportStrong.style.display = "flex";
  exportStrong.style.alignItems = "center";
  exportStrong.style.gap = "6px";

  const exportIcon = document.createElement("i");
  exportIcon.className = "fas fa-file-pdf";
  exportIcon.style.color = "#dc3545";
  exportIcon.style.fontSize = "14px";
  exportIcon.style.width = "16px";
  exportIcon.style.textAlign = "center";

  exportStrong.appendChild(exportIcon);
  exportStrong.appendChild(document.createTextNode(" تصدير تقرير الحي"));

  const exportSpan = document.createElement("span");
  exportSpan.innerHTML = `<i class="fas fa-chevron-left" style="color: #6c757d;"></i>`;
  exportSpan.style.fontWeight = "500";
  exportSpan.style.background = "rgba(220, 53, 69, 0.1)";
  exportSpan.style.padding = "3px 8px";
  exportSpan.style.borderRadius = "4px";

  exportPara.appendChild(exportStrong);
  exportPara.appendChild(exportSpan);

  // Add hover effects and click handler for export
  exportPara.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
  });
  exportPara.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "transparent";
  });
  exportPara.addEventListener("click", function () {
    showExportOptionsMenu(properties.ID, name, exportPara);
  });

  // Create area paragraph (similar structure)
  const areaPara = document.createElement("p");
  areaPara.style.margin = "8px 0";
  areaPara.style.fontSize = "14px";
  areaPara.style.color = "#4a5568";
  areaPara.style.display = "flex";
  areaPara.style.alignItems = "center";
  areaPara.style.justifyContent = "space-between";
  areaPara.style.padding = "8px 0";

  const areaStrong = document.createElement("strong");
  areaStrong.style.color = "#2d3748";
  areaStrong.style.fontWeight = "600";
  areaStrong.style.marginLeft = "8px";
  areaStrong.style.display = "flex";
  areaStrong.style.alignItems = "center";
  areaStrong.style.gap = "6px";

  const areaIcon = document.createElement("i");
  areaIcon.className = "fas fa-chart-area";
  areaIcon.style.color = "#3066ff";
  areaIcon.style.fontSize = "14px";
  areaIcon.style.width = "16px";
  areaIcon.style.textAlign = "center";

  areaStrong.appendChild(areaIcon);
  areaStrong.appendChild(document.createTextNode(" المساحة:"));

  const areaSpan = document.createElement("span");
  areaSpan.textContent = `${areaInHectares} هكتار`;
  areaSpan.style.fontWeight = "500";
  areaSpan.style.background = "rgba(237, 242, 247, 0.5)";
  areaSpan.style.padding = "3px 8px";
  areaSpan.style.borderRadius = "4px";

  areaPara.appendChild(areaStrong);
  areaPara.appendChild(areaSpan);

  // Add paragraphs to info container
  infoContainer.appendChild(idPara);
  infoContainer.appendChild(areaPara);
  infoContainer.appendChild(exportPara);

  // Create button
  const button = document.createElement("button");
  button.className = "view-details-btn";
  button.onclick = function () {
    const firstTab = Object.keys(window.tablesData)[0];
    if (firstTab) {
      // إغلاق النافذة المنبثقة
      map.closePopup();

      // عمل zoom على الحي المختار
      if (layer && layer.getBounds) {
        map.fitBounds(layer.getBounds(), {
          padding: [20, 20],
          maxZoom: 16,
        });
      }

      // تحديث اسم ومعرف الحي وعرض التفاصيل
      window.setSelectedNeighborhood(properties.ID, name);
      window.renderInfoPanel(firstTab, properties.ID);
    } else {
      alert("لا توجد بيانات جداول متاحة");
    }
  };
  button.style.width = "100%";
  button.style.padding = "12px 15px";
  button.style.background = "linear-gradient(to right, #3066ff, #007bff)";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "0";
  button.style.cursor = "pointer";
  button.style.fontSize = "15px";
  button.style.fontWeight = "600";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.gap = "10px";
  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.2)";

  const buttonIcon = document.createElement("i");
  buttonIcon.className = "fas fa-info-circle";
  buttonIcon.style.fontSize = "16px";

  button.appendChild(buttonIcon);
  button.appendChild(document.createTextNode(" عرض التفاصيل"));

  // Add all elements to popup content
  popupContent.innerHTML = "";
  popupContent.appendChild(header);
  popupContent.appendChild(infoContainer);
  popupContent.appendChild(button);

  layer.bindPopup(popupContent);
}

/**
 * حساب المتوسط الحسابي الافتراضي للمركبة
 * @return {string} المتوسط الحسابي
 */
function calculateDefaultComposite() {
  // الحصول على أسماء التبويبات من tablesData
  const tabNames = Object.keys(window.tablesData || {});
  const values = [];

  // حساب قيمة لكل تبويب بناءً على البيانات
  tabNames.slice(0, 13).forEach((tabName) => {
    const value = calculateTabValue(tabName);
    values.push(value);
  });

  // إضافة قيم افتراضية إذا كان عدد التبويبات أقل من 13
  while (values.length < 13) {
    values.push(5.5); // قيمة متوسطة
  }

  // حساب المتوسط الحسابي
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = (sum / values.length).toFixed(2);

  return average;
}

/**
 * حساب قيمة التبويب بناءً على سطر واحد محدد من البيانات
 * @param {string} tabName - اسم التبويب
 * @return {number} القيمة المحسوبة بين 1-10
 */
function calculateTabValue(tabName) {
  const tabData = window.tablesData[tabName];
  if (!tabData || !tabData.sampleData) {
    return 5.5; // قيمة افتراضية متوسطة
  }

  const sampleData = tabData.sampleData;

  // تحديد الحقل الرئيسي لكل تبويب
  const primaryFieldKey = getPrimaryFieldForTab(tabName);

  if (!primaryFieldKey || sampleData[primaryFieldKey] === undefined) {
    return 5.5; // قيمة افتراضية إذا لم يوجد الحقل
  }

  // العثور على معلومات الحقل
  const field = tabData.fields.find((f) => f.key === primaryFieldKey);
  if (!field) {
    return 5.5;
  }

  const value = sampleData[primaryFieldKey];
  const score = convertValueToScore(value, field);

  return score !== null ? score : 5.5;
}

/**
 * تحديد الحقل الرئيسي لكل تبويب
 * @param {string} tabName - اسم التبويب
 * @return {string} مفتاح الحقل الرئيسي
 */
function getPrimaryFieldForTab(tabName) {
  const primaryFields = {
    التدخلات_الإنسانية: "health", // الصحة
    الأسواق_الأساسية: "status", // حالة التشغيل
    إدارة_النفايات_الصلبة: "cleanliness", // مستوى نظافة الشوارع
    الحدائق_والمساحات_المعيشية: "status", // حالة التشغيل
    المرافق_التعليمية: "status", // حالة التشغيل
    المراكز_الصحية: "status", // حالة التشغيل
    شبكة_الكهرباء: "status", // حالة الشبكة
    شبكة_الاتصالات: "status", // حالة الشبكة
    إمدادات_المياه: "main_status", // التشغيل
    شبكة_الصرف_الصحي: "main_status", // التشغيل
    أضرار_الإسكان: "severe_damage", // ضرر شديد
    النسيج_الحضري: "urbn_status", // الحالة العمرانية
    التغيرات_السكانية: "population", // عدد السكان
  };

  return primaryFields[tabName] || null;
}

/**
 * تحويل قيمة الحقل إلى نقاط بين 1-10
 * @param {any} value - القيمة
 * @param {Object} field - معلومات الحقل
 * @return {number|null} النقاط أو null إذا لم يمكن التحويل
 */
function convertValueToScore(value, field) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // استخدام القيم الثابتة المحددة لكل معيار
  return getFixedScoreForCriteria(value, field);
}

/**
 * الحصول على نقاط ثابتة لكل خيار في المعايير
 * @param {any} value - القيمة
 * @param {Object} field - معلومات الحقل
 * @return {number} النقاط بين 1-10
 */
function getFixedScoreForCriteria(value, field) {
  // تحويل القيمة إلى نص للمقارنة
  const stringValue = String(value).trim();

  // قيم ثابتة لكل معيار حسب اسم الحقل
  const criteriaScores = {
    // 1. التدخلات الإنسانية - الصحة
    health: {
      جيد: 9.0,
      مقبول: 6.5,
      ضعيف: 3.0,
      ضغيف: 3.0,
    },

    // 2. الأسواق الأساسية - حالة التشغيل
    status: {
      "يعمل بشكل اعتيادي": 9.0,
      "يعمل بشكل مقبول": 6.5,
      "يعمل بشكل متقطع": 4.0,
      "لا يعمل (معدوم)": 1.5,
      تعمل: 8.5,
      "تعمل جزئيا": 5.0,
      "لا تعمل": 1.5,
    },

    // 3. إدارة النفايات الصلبة - مستوى نظافة الشوارع
    cleanliness: {
      جيدة: 9.0,
      مقبول: 6.5,
      ضعيف: 3.0,
      معدوم: 1.0,
    },

    // 4. إمدادات المياه والصرف الصحي - التشغيل
    main_status: {
      "يعمل كاملاً": 9.5,
      "يعمل جزئياً": 5.0,
      متوقف: 1.5,
    },

    // 5. أضرار الإسكان - ضرر شديد (نسب مئوية)
    severe_damage: {
      "0%": 10.0,
      "10%": 9.0,
      "20%": 8.0,
      "30%": 7.0,
      "40%": 6.0,
      "50%": 5.0,
      "60%": 4.0,
      "70%": 3.0,
      "80%": 2.0,
      "90%": 1.5,
      "100%": 1.0,
    },

    // 6. النسيج الحضري - الحالة العمرانية
    urbn_status: {
      منظم: 8.5,
      عشوائي: 4.0,
      "بلدة قديمة": 6.0,
      مختلط: 6.0,
    },
  };

  // البحث عن النقاط في المعيار المحدد
  if (
    criteriaScores[field.key] &&
    criteriaScores[field.key][stringValue] !== undefined
  ) {
    return criteriaScores[field.key][stringValue];
  }

  // معالجة القيم الرقمية (مثل عدد السكان)
  if (field.key === "population" && !isNaN(Number(value))) {
    const numValue = Number(value);
    if (numValue === 0) return 1.0;
    if (numValue < 5000) return 3.0;
    if (numValue < 10000) return 5.0;
    if (numValue < 20000) return 7.0;
    if (numValue < 30000) return 8.5;
    return 10.0;
  }

  // قيمة افتراضية للقيم غير المعرّفة
  return 5.5;
}

/**
 * تحليل القيم النصية غير المعرّفة مسبقاً وإرجاع نقاط بين 1-10
 * @param {string} value - القيمة النصية
 * @param {Object} field - معلومات الحقل
 * @return {number} النقاط بين 1-10
 */
function analyzeTextValue(value, field) {
  if (!value || typeof value !== "string") {
    return 5.5; // قيمة افتراضية
  }

  const lowerValue = value.toLowerCase().trim();

  // تحليل بناءً على الكلمات المفتاحية

  // كلمات إيجابية (8-10)
  const positiveKeywords = [
    "ممتاز",
    "جيد",
    "عالي",
    "قوي",
    "نشط",
    "فعال",
    "مستقر",
    "آمن",
    "صحي",
    "نظيف",
    "منظم",
    "متطور",
    "حديث",
    "متقدم",
    "ناجح",
  ];

  // كلمات متوسطة (5-7)
  const neutralKeywords = [
    "مقبول",
    "عادي",
    "متوسط",
    "طبيعي",
    "معتدل",
    "مناسب",
    "كافي",
  ];

  // كلمات سلبية (1-4)
  const negativeKeywords = [
    "ضعيف",
    "سيء",
    "متدهور",
    "خطير",
    "غير آمن",
    "ملوث",
    "فوضوي",
    "قديم",
    "متهالك",
    "مهجور",
    "معطل",
    "مكسور",
    "تالف",
  ];

  // إنشاء hash ثابت للنص لضمان ثبات النتيجة
  const textHash = simpleHash(value);

  // فحص الكلمات الإيجابية
  for (const keyword of positiveKeywords) {
    if (lowerValue.includes(keyword)) {
      return 8 + (textHash % 200) / 100; // بين 8-10
    }
  }

  // فحص الكلمات السلبية
  for (const keyword of negativeKeywords) {
    if (lowerValue.includes(keyword)) {
      return 1 + (textHash % 300) / 100; // بين 1-4
    }
  }

  // فحص الكلمات المتوسطة
  for (const keyword of neutralKeywords) {
    if (lowerValue.includes(keyword)) {
      return 5 + (textHash % 200) / 100; // بين 5-7
    }
  }

  // تحليل بناءً على طول النص (النصوص الأطول قد تكون أكثر تفصيلاً)
  if (value.length > 50) {
    return 6 + (textHash % 200) / 100; // بين 6-8 للنصوص المفصلة
  } else if (value.length > 20) {
    return 4 + (textHash % 300) / 100; // بين 4-7 للنصوص المتوسطة
  } else if (value.length > 5) {
    return 3 + (textHash % 400) / 100; // بين 3-7 للنصوص القصيرة
  }

  // تحليل بناءً على نوع الحقل
  if (field && field.key) {
    // حقول الاحتياجات والملاحظات (وجود نص يعني وجود احتياجات)
    if (
      field.key.includes("needs") ||
      field.key.includes("notes") ||
      field.key.includes("احتياج")
    ) {
      return 3 + (textHash % 300) / 100; // بين 3-6 (وجود احتياجات = تقييم أقل)
    }

    // حقول الأسماء والمعرفات
    if (
      field.key.includes("name") ||
      field.key.includes("id") ||
      field.key.includes("اسم")
    ) {
      return 7 + (textHash % 200) / 100; // بين 7-9 (وجود اسم = إيجابي)
    }
  }

  // قيمة افتراضية للنصوص غير المصنفة
  return 4 + (textHash % 400) / 100; // بين 4-8
}

/**
 * إنشاء hash بسيط للنص لضمان ثبات النتائج
 * @param {string} str - النص
 * @return {number} قيمة hash
 */
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // تحويل إلى 32bit integer
  }

  return Math.abs(hash);
}

/**
 * الحصول على وصف المعايير المستخدمة لحساب قيمة التبويب
 * @param {string} tabName - اسم التبويب
 * @return {string} وصف المعايير
 */
function getTabCriteria(tabName) {
  const criteriaMap = {
    التدخلات_الإنسانية: "الصحة",
    الأسواق_الأساسية: "حالة التشغيل",
    إدارة_النفايات_الصلبة: "مستوى نظافة الشوارع",
    الحدائق_والمساحات_المعيشية: "حالة التشغيل",
    المرافق_التعليمية: "حالة التشغيل",
    المراكز_الصحية: "حالة التشغيل",
    شبكة_الكهرباء: "حالة الشبكة",
    شبكة_الاتصالات: "حالة الشبكة",
    إمدادات_المياه: "التشغيل",
    شبكة_الصرف_الصحي: "التشغيل",
    أضرار_الإسكان: "ضرر شديد",
    النسيج_الحضري: "الحالة العمرانية",
    التغيرات_السكانية: "عدد السكان",
  };

  return criteriaMap[tabName] || "معيار عام من البيانات المتاحة";
}

// Function to handle neighborhood selection
function handleNeighborhoodSelect(id, name, tabName) {
  const infoContent = document.getElementById("info-content");
  const infoTitle = document.getElementById("info-title");

  // تحديث العنوان ليشمل اسم التاب
  if (infoTitle) {
    infoTitle.textContent = tabName ? `${name} - ${tabName}` : name;
  }

  // جلب بيانات الجدول الافتراضية من tablesData
  let fields = [];
  let sampleData = {};
  if (typeof tablesData !== "undefined" && tabName && tablesData[tabName]) {
    fields = tablesData[tabName].fields || [];
    sampleData = tablesData[tabName].sampleData || {};
  }

  // إذا لم تتوفر بيانات افتراضية، أظهر رسالة
  if (!fields.length) {
    infoContent.innerHTML =
      '<div style="color:red">لا توجد بيانات افتراضية لهذا التاب.</div>';
    return;
  }

  // إنشاء جدول منسق
  const table = document.createElement("table");
  table.className = "info-table";

  // رأس الجدول
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["الحقل", "القيمة"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // جسم الجدول
  const tbody = document.createElement("tbody");
  fields.forEach((field) => {
    const row = document.createElement("tr");
    const labelCell = document.createElement("td");
    labelCell.textContent = field.name;
    row.appendChild(labelCell);
    const valueCell = document.createElement("td");
    valueCell.textContent = sampleData[field.key] || "-";
    row.appendChild(valueCell);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  // عرض الجدول
  infoContent.innerHTML = "";
  infoContent.appendChild(table);

  // إظهار لوحة المعلومات
  const infoPanel = document.getElementById("info-panel");
  infoPanel.classList.add("show");
}

/**
 * ترجمة حالة البنية التحتية
 * @param {string} status - الحالة بالإنجليزية
 * @return {string} - الحالة بالعربية
 */
function getStatusTranslation(status) {
  const translations = {
    good: "جيدة",
    medium: "متوسطة",
    poor: "ضعيفة",
    unavailable: "غير متوفرة",
    available: "متوفرة",
    limited: "محدودة",
  };

  return translations[status] || status;
}

/**
 * إخفاء لوحة المعلومات
 */
function hideInfoPanel() {
  const infoPanel = document.getElementById("infoPanel");
  if (infoPanel) {
    infoPanel.style.display = "none";
  }
}

/**
 * تحديث الإحصائيات العامة
 */
function updateStatistics() {
  // التحقق من وجود بيانات الأحياء
  if (
    typeof neighborhoodsData !== "undefined" &&
    typeof calculateBasicStatistics !== "undefined"
  ) {
    const stats = calculateBasicStatistics(neighborhoodsData);

    // تحديث عناصر العرض
    const neighborhoodCountElement =
      document.getElementById("neighborhoodCount");
    const totalAreaElement = document.getElementById("totalArea");
    const sectorCountElement = document.getElementById("sectorCount");
    const avgAreaElement = document.getElementById("avgArea");

    if (neighborhoodCountElement) {
      neighborhoodCountElement.textContent = stats.count;
    }

    if (totalAreaElement) {
      totalAreaElement.textContent = `${stats.totalArea.toFixed(2)} كم²`;
    }

    if (sectorCountElement) {
      sectorCountElement.textContent = stats.sectorCount;
    }

    if (avgAreaElement) {
      avgAreaElement.textContent = `${stats.avgArea.toFixed(2)} كم²`;
    }
  }
}

/**
 * تبديل رؤية طبقة معينة
 * @param {string} layerName - اسم الطبقة
 * @param {boolean} visible - حالة الرؤية
 */
function mapLayerToggle(layerName, visible) {
  if (layerName === "neighborhoods" && neighborhoodsLayer) {
    if (visible) {
      if (!map.hasLayer(neighborhoodsLayer)) {
        map.addLayer(neighborhoodsLayer);
      }
    } else {
      if (map.hasLayer(neighborhoodsLayer)) {
        map.removeLayer(neighborhoodsLayer);
      }
    }
  } else if (layerName === "service-sectors" && serviceSectorsLayer) {
    if (visible) {
      if (!map.hasLayer(serviceSectorsLayer)) {
        map.addLayer(serviceSectorsLayer);
      }
    } else {
      if (map.hasLayer(serviceSectorsLayer)) {
        map.removeLayer(serviceSectorsLayer);
      }
    }
  }
}

/**
 * التكبير على طبقة معينة
 * @param {string} layerName - اسم الطبقة
 */
function zoomToMapLayer(layerName) {
  if (layerName === "neighborhoods" && neighborhoodsLayer) {
    map.fitBounds(neighborhoodsLayer.getBounds());
  } else if (layerName === "service-sectors" && serviceSectorsLayer) {
    try {
      const bounds = L.geoJSON(serviceSectorsData).getBounds();
      map.fitBounds(bounds);
    } catch (error) {
      console.error("خطأ في التكبير على طبقة دوائر الخدمات:", error);
      if (neighborhoodsLayer) {
        map.fitBounds(neighborhoodsLayer.getBounds());
      }
    }
  }
}

/**
 * عرض معلومات طبقة معينة
 * @param {string} layerName - اسم الطبقة
 */
function showMapLayerInfo(layerName) {
  const infoPanel = document.getElementById("infoPanel");
  const infoPanelTitle = document.getElementById("infoPanelTitle");
  const infoPanelContent = document.getElementById("infoPanelContent");

  if (infoPanel && infoPanelTitle && infoPanelContent) {
    if (layerName === "neighborhoods") {
      infoPanelTitle.textContent = "معلومات طبقة الأحياء";

      if (
        typeof neighborhoodsData !== "undefined" &&
        typeof calculateBasicStatistics !== "undefined"
      ) {
        const stats = calculateBasicStatistics(neighborhoodsData);

        infoPanelContent.innerHTML = `
          <p><strong>عدد الأحياء:</strong> ${stats.count}</p>
          <p><strong>المساحة الإجمالية:</strong> ${stats.totalArea.toFixed(
          2
        )} كم²</p>
          <p><strong>متوسط المساحة:</strong> ${stats.avgArea.toFixed(2)} كم²</p>
          <p><strong>أكبر حي:</strong> ${stats.maxArea.toFixed(2)} كم²</p>
          <p><strong>أصغر حي:</strong> ${stats.minArea.toFixed(2)} كم²</p>
        `;
      } else {
        infoPanelContent.innerHTML = "<p>بيانات الأحياء غير متاحة</p>";
      }
    } else if (layerName === "service-sectors") {
      infoPanelTitle.textContent = "معلومات طبقة دوائر الخدمات";

      if (serviceSectorsData && serviceSectorsData.features) {
        let totalPopulation = 0;
        serviceSectorsData.features.forEach((feature) => {
          totalPopulation += feature.properties.Pop || 0;
        });

        const areas = serviceSectorsData.features.map((feature) => {
          return {
            name: feature.properties.Name,
            area: feature.properties.Shape_Area / 1000000,
          };
        });

        areas.sort((a, b) => b.area - a.area);

        infoPanelContent.innerHTML = `
          <div class="futuristic-panel">
            <p><strong>عدد دوائر الخدمات:</strong> ${serviceSectorsData.features.length
          }</p>
            <p><strong>إجمالي عدد السكان:</strong> ${totalPopulation.toLocaleString(
            "ar-SY"
          )}</p>
            <p><strong>أكبر دوائر الخدمات (من حيث المساحة):</strong></p>
            <ul style="padding-right: 20px; margin-top: 5px;">
              ${areas
            .slice(0, 3)
            .map(
              (item) =>
                `<li>${item.name} (${item.area.toFixed(2)} كم²)</li>`
            )
            .join("")}
            </ul>
          </div>

          <h4 style="margin-top: 15px;">دوائر الخدمات والوظائف:</h4>
          <div class="futuristic-panel">
            <p>تعرض هذه الطبقة دوائر خدمات مياه مدينة حلب، ويمكن استخدامها لتحليل:</p>
            <ul style="padding-right: 20px; margin-top: 5px;">
              <li>توزيع خدمات المياه في المدينة</li>
              <li>مناطق تغطية كل دائرة خدمات</li>
              <li>بيانات الهيدروليك لكل منطقة</li>
              <li>معدلات تحصيل الفواتير</li>
            </ul>
          </div>
        `;
      } else {
        infoPanelContent.innerHTML = "<p>بيانات دوائر الخدمات غير متاحة</p>";
      }
    }

    infoPanel.style.display = "block";
  }
}

/**
 * عرض لوحة التحليل
 */
function showAnalysisPanel() {
  // فتح الشريط الجانبي الأيمن إذا كان مغلقًا
  if (
    window.toggleSidebar &&
    typeof rightSidebarActive !== "undefined" &&
    !rightSidebarActive
  ) {
    window.toggleSidebar("right");
  }
}

/**
 * تحميل طبقة دوائر الخدمات من بيانات GeoJSON
 */
function loadServiceSectorsLayer() {
  // Remove existing layer if it exists
  if (serviceSectorsLayer) {
    map.removeLayer(serviceSectorsLayer);
    serviceSectorsLayer = null;
  }

  // Create a new layer group
  serviceSectorsLayer = L.layerGroup().addTo(map);

  // Create a separate layer group for service sector labels
  let serviceSectorLabelsLayer = L.layerGroup();

  // Define sector colors
  const sectorColors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Blue
    "#96CEB4", // Green
    "#FFEEAD", // Yellow
    "#D4A5A5", // Pink
    "#9B59B6", // Purple
    "#3498DB", // Light Blue
    "#E67E22", // Orange
    "#2ECC71", // Emerald
    "#1ABC9C", // Turquoise
    "#F1C40F", // Gold
  ];

  // Create GeoJSON layer
  serviceSectorsGeoJsonLayer = L.geoJSON(serviceSectorsData, {
    style: function (feature) {
      const index = (feature.properties.OBJECTID - 1) % sectorColors.length;
      const color = sectorColors[index];
      return {
        fillColor: color,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5,
        className: `service-sector-${feature.properties.OBJECTID}`,
      };
    },
    onEachFeature: function (feature, layer) {
      const properties = feature.properties;
      const popupContent = `
        <div class="popup-header futuristic">
          <h3 class="popup-title">${properties.Name}</h3>
        </div>
        <div class="popup-body">
          <div class="popup-stat">
            <span>الاسم بالإنجليزية:</span>
            <strong>${properties.Name_En}</strong>
          </div>
          <div class="popup-stat">
            <span>عدد السكان:</span>
            <strong>${properties.Pop
          ? properties.Pop.toLocaleString("ar-SY")
          : "غير متاح"
        }</strong>
          </div>
          <div class="popup-stat">
            <span>المساحة:</span>
            <strong>${(properties.Shape_Area / 10000).toFixed(2)} هكتار</strong>
          </div>
        </div>
      `;

      layer.bindPopup(popupContent);
      // Remove the click event that calls undefined function
      // The popup will show the information instead
    },
  });

  // Add GeoJSON layer to the layer group
  serviceSectorsGeoJsonLayer.addTo(serviceSectorsLayer);

  // Add labels
  serviceSectorsData.features.forEach((feature) => {
    try {
      const polygon = feature.geometry.coordinates[0][0];
      let sumLat = 0,
        sumLng = 0;

      polygon.forEach((coord) => {
        sumLat += coord[1];
        sumLng += coord[0];
      });

      const centerLat = sumLat / polygon.length;
      const centerLng = sumLng / polygon.length;

      const index = (feature.properties.OBJECTID - 1) % sectorColors.length;
      const color = sectorColors[index];

      L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: "service-sector-label",
          html: `
            <div class="sector-marker futuristic" style="background-color: ${color}; border: 2px solid #ffffff;">
              ${feature.properties.Name}
            </div>
          `,
          iconSize: [120, 40],
          iconAnchor: [60, 20],
        }),
      }).addTo(serviceSectorLabelsLayer);
    } catch (error) {
      console.error("خطأ في إضافة تسمية دائرة الخدمات:", error);
    }
  });

  // Update the checkbox event listener
  const layersList = document.getElementById("layersList");
  if (layersList && !document.getElementById("layer-service-sectors")) {
    const layerItem = document.createElement("div");
    layerItem.className = "layer-item";
    layerItem.innerHTML = `
      <div class="layer-toggle">
        <input type="checkbox" id="layer-service-sectors" checked>
        <label for="layer-service-sectors">دوائر الخدمات</label>
      </div>
      <div class="layer-actions">
        <button class="layer-action-btn" data-action="zoom" data-layer="service-sectors">
          <i class="fas fa-search-plus"></i>
        </button>
        <button class="layer-action-btn" data-action="info" data-layer="service-sectors">
          <i class="fas fa-info-circle"></i>
        </button>
      </div>
    `;

    layersList.appendChild(layerItem);

    const checkbox = layerItem.querySelector("#layer-service-sectors");
    if (checkbox) {
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          if (!map.hasLayer(serviceSectorsLayer)) {
            serviceSectorsLayer.addTo(map);
          }
        } else {
          if (map.hasLayer(serviceSectorsLayer)) {
            map.removeLayer(serviceSectorsLayer);
          }
        }
      });
    }

    const zoomBtn = layerItem.querySelector('[data-action="zoom"]');
    if (zoomBtn) {
      zoomBtn.addEventListener("click", function () {
        zoomToMapLayer("service-sectors");
      });
    }

    const infoBtn = layerItem.querySelector('[data-action="info"]');
    if (infoBtn) {
      infoBtn.addEventListener("click", function () {
        showMapLayerInfo("service-sectors");
      });
    }
  }

  // إضافة طبقات دوائر الخدمات إلى المجموعة الرئيسية
  if (mainLayersGroup) {
    mainLayersGroup.addLayer(serviceSectorsLayer);
    mainLayersGroup.addLayer(serviceSectorLabelsLayer);
  } else {
    // إضافة مباشرة إلى الخريطة إذا لم تكن المجموعة متاحة
    serviceSectorsLayer.addTo(map);
    serviceSectorLabelsLayer.addTo(map);
  }

  // Update global window variables
  window.serviceSectorsLayer = serviceSectorsLayer;
  window.serviceSectorsGeoJsonLayer = serviceSectorsGeoJsonLayer;
  window.serviceSectorLabelsLayer = serviceSectorLabelsLayer;
  window.mainLayersGroup = mainLayersGroup;
}

/**
 * عرض معلومات دائرة خدمات معينة
 * @param {Object} properties - خصائص دائرة الخدمات
 */

// Function to initialize base layer controls
function initBaseLayerControls() {
  const baseLayerOptions = document.querySelectorAll(".base-layer-option");

  baseLayerOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const basemap = this.getAttribute("data-basemap");
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;

      // Remove current base layer
      if (currentBaseLayer) {
        map.removeLayer(currentBaseLayer);
      }

      // Add new base layer
      currentBaseLayer = baseLayers[basemap];
      currentBaseLayer.addTo(map);
    });
  });
}

/**
 * دالة مساعدة لإنشاء محتوى النوافذ المنبثقة بتنسيق موحد
 */

// Add clear measurements button to the map
function addClearMeasurementsButton() {
  const clearButton = L.control({ position: "topright" });

  clearButton.onAdd = function (map) {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML = `
      <a href="#" title="مسح جميع القياسات" style="background-color: #fff; color: #333; padding: 6px 10px; display: block; text-decoration: none; font-size: 14px;">
        <i class="fas fa-trash"></i> مسح القياسات
      </a>
    `;

    div.onclick = function (e) {
      e.preventDefault();
      if (drawnItems) {
        drawnItems.clearLayers();
      }
    };

    return div;
  };

  clearButton.addTo(map);
}

// Function to hide fullscreen popup
function hideFullscreenPopup() {
  const fullscreenPopup = document.getElementById("fullscreen-popup");
  const blueGradientLegend = document.getElementById("blueGradientLegend");

  if (fullscreenPopup) {
    fullscreenPopup.classList.remove("show");
    // Allow body scrolling
    document.body.style.overflow = "";

    // Hide the blue gradient legend
    if (blueGradientLegend) {
      blueGradientLegend.style.display = "none";
    }

    // Hide the popup after animation completes
    setTimeout(() => {
      fullscreenPopup.style.display = "none";
    }, 300); // Match the CSS transition duration
  }
}

// Function to show fullscreen popup (Original Abstract Urban Effectiveness)
function showFullscreenPopup() {
  const fullscreenPopup = document.getElementById("fullscreen-popup");
  const popupContentContainer = document.getElementById(
    "popup-content-container"
  );
  const sectoralFunctionalityContainer = document.getElementById(
    "sectoral-functionality-container"
  );
  const sectoralMappingContainer = document.getElementById(
    "sectoral-mapping-container"
  );
  const popupLoading = document.getElementById("popup-loading");

  if (fullscreenPopup) {
    // Hide loading indicator
    if (popupLoading) popupLoading.style.display = "none";

    // Hide all other containers and show only the composite functionality container
    if (sectoralFunctionalityContainer)
      sectoralFunctionalityContainer.style.display = "none";
    if (sectoralMappingContainer)
      sectoralMappingContainer.style.display = "none";

    // Show the main popup content
    if (popupContentContainer) {
      popupContentContainer.style.display = "block";
      // Always create the Abstract Urban Effectiveness interface
      popupContentContainer.innerHTML = `
        <div style="padding: 20px; font-family: 'Cairo', sans-serif; height: 100%; overflow-y: auto;">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">
            <i class="fas fa-calculator" style="color: #28a745;"></i> الفعالية العمرانية المجردة
          </h2>

          <!-- Weights Section -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #495057; margin-bottom: 15px;">
              <i class="fas fa-balance-scale"></i> تحديد أوزان القطاعات (المجموع يجب أن يساوي 100)
            </h4>
            <div id="weightsGrid" style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 15px;
              margin-bottom: 15px;
            ">
              <!-- Weights will be populated by JavaScript -->
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #dee2e6;">
              <span style="font-weight: bold; color: #495057;">مجموع الأوزان:</span>
              <span id="totalWeight" style="font-size: 18px; font-weight: bold; color: #007bff;">0</span>
              <span style="color: #6c757d;">/ 100</span>
            </div>

            <div style="text-align: center; margin-top: 15px;">
              <button id="calculateCompositeBtn" class="sidebar-button" style="
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(40,167,69,0.3);
                transition: all 0.3s ease;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-calculator"></i> حساب الفعالية المجردة
              </button>
            </div>
          </div>

          <!-- Results Section -->
          <div id="compositeResultsSection" style="display: none;">
            <h4 style="color: #495057; margin-bottom: 15px;">
              <i class="fas fa-chart-bar"></i> نتائج الفعالية العمرانية المجردة
            </h4>

            <div style="overflow-y: auto; max-height: 400px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 15px;">
              <table id="composite-results-table" class="info-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">اسم الحي</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">الفعالية المركبة (%)</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">التصنيف</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">اللون</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Results will be populated by JavaScript -->
                </tbody>
              </table>
            </div>

            <div style="text-align: center;">
              <button id="applyCompositeColoringBtn" class="sidebar-button" style="
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,123,255,0.3);
                transition: all 0.3s ease;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-paint-brush"></i> تطبيق التلوين على الخريطة
              </button>
            </div>
          </div>
        </div>
      `;

      // Initialize the weights interface
      initializeWeightsInterface();
    }
    if (sectoralFunctionalityContainer)
      sectoralFunctionalityContainer.style.display = "none";

    // Show the fullscreen popup
    fullscreenPopup.style.display = "flex";
    // Force a reflow
    fullscreenPopup.offsetHeight;
    // Add the show class to trigger animations
    fullscreenPopup.classList.add("show");
    // Prevent body scrolling
    document.body.style.overflow = "hidden";
  }
}

// Function to show Final Urban Effectiveness popup
function showFinalUrbanEffectivenessPopup() {
  const fullscreenPopup = document.getElementById("fullscreen-popup");
  const popupContentContainer = document.getElementById(
    "popup-content-container"
  );
  const sectoralFunctionalityContainer = document.getElementById(
    "sectoral-functionality-container"
  );
  const sectoralMappingContainer = document.getElementById(
    "sectoral-mapping-container"
  );
  const popupLoading = document.getElementById("popup-loading");

  if (fullscreenPopup) {
    // Hide loading indicator
    if (popupLoading) popupLoading.style.display = "none";

    // Hide all other containers and show only the main popup content
    if (sectoralFunctionalityContainer)
      sectoralFunctionalityContainer.style.display = "none";
    if (sectoralMappingContainer)
      sectoralMappingContainer.style.display = "none";

    // Show the main popup content
    if (popupContentContainer) {
      popupContentContainer.style.display = "block";
      // Create the Final Urban Effectiveness interface
      popupContentContainer.innerHTML = `
        <div style="padding: 20px; font-family: 'Cairo', sans-serif; height: 100%; overflow-y: auto;">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">
            <i class="fas fa-chart-line" style="color: #28a745;"></i> الفعالية العمرانية النهائية
          </h2>

          <!-- Weights Section -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #495057; margin-bottom: 15px;">
              <i class="fas fa-balance-scale"></i> تحديد أوزان المكونات (المجموع يجب أن يساوي 100)
            </h4>
            <div id="finalWeightsGrid" style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 15px;
              margin-bottom: 15px;
            ">
              <!-- Weights will be populated by JavaScript -->
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #dee2e6;">
              <span style="font-weight: bold; color: #495057;">مجموع الأوزان:</span>
              <span id="finalTotalWeight" style="font-size: 18px; font-weight: bold; color: #007bff;">0</span>
              <span style="color: #6c757d;">/ 100</span>
            </div>

            <div style="text-align: center; margin-top: 15px;">
              <button id="calculateFinalBtn" class="sidebar-button" style="
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(40,167,69,0.3);
                transition: all 0.3s ease;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-calculator"></i> حساب الفعالية النهائية
              </button>
            </div>
          </div>

          <!-- Results Section -->
          <div id="finalResultsSection" style="display: none;">
            <h4 style="color: #495057; margin-bottom: 15px;">
              <i class="fas fa-chart-bar"></i> نتائج الفعالية العمرانية النهائية
            </h4>

            <div style="overflow-y: auto; max-height: 400px; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 15px;">
              <table id="final-results-table" class="info-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">اسم الحي</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">الفعالية النهائية (%)</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">التصنيف</th>
                    <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">اللون</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Results will be populated by JavaScript -->
                </tbody>
              </table>
            </div>

            <div style="text-align: center;">
              <button id="applyFinalColoringBtn" class="sidebar-button" style="
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,123,255,0.3);
                transition: all 0.3s ease;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-paint-brush"></i> تطبيق التلوين على الخريطة
              </button>
            </div>
          </div>
        </div>
      `;

      // Initialize the final weights interface
      initializeFinalWeightsInterface();
    }

    // Show the fullscreen popup
    fullscreenPopup.style.display = "flex";
    // Force a reflow
    fullscreenPopup.offsetHeight;
    // Add the show class to trigger animations
    fullscreenPopup.classList.add("show");
    // Prevent body scrolling
    document.body.style.overflow = "hidden";
  }
}

// Export functions for external use
window.showFullscreenPopup = showFullscreenPopup;
window.hideFullscreenPopup = hideFullscreenPopup;
window.showFinalUrbanEffectivenessPopup = showFinalUrbanEffectivenessPopup;
// Functions defined in this file
window.showFullscreenPopup = showFullscreenPopup;
window.hideFullscreenPopup = hideFullscreenPopup;
window.showFinalUrbanEffectivenessPopup = showFinalUrbanEffectivenessPopup;

// Note: showSectoralFunctionalityCalculation is defined in sectoral-effectiveness.js
// Note: All sectoral analysis functions are defined in sectoral-analysis.js
