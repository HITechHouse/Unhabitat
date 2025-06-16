/**
 * map.js
 * يدير إعداد وتفاعل الخريطة
 */

// متغيرات عامة للخريطة
let map;
let neighborhoodsLayer;
let serviceSectorsLayer;
let serviceSectorsGeoJsonLayer;
let currentAnalysis = null;
let neighborhoodLabelsLayer = null; // تعريف متغير التسميات هنا
let layersControl = null; // تعريف متغير لوحة التحكم بالطبقات هنا
let mainLayersGroup = null; // مجموعة الطبقات الرئيسية (الأحياء ودوائر الخدمات)

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
 * حساب مساحة المضلع من بيانات GeoJSON
 * @param {Object} geometry - هندسة المضلع من GeoJSON
 * @returns {number} - المساحة بالمتر المربع
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

// تهيئة الخريطة عند تحميل الصفحة
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

  // Note: Measurement modal elements removed - now using toolbar buttons

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
      if (this.value === "neighborhoods") {
        if (neighborhoodColoringSection) {
          neighborhoodColoringSection.style.display = "block";
          populateColumnDropdown();
        }
      } else {
        if (neighborhoodColoringSection) {
          neighborhoodColoringSection.style.display = "none";
        }
        // Reset coloring if switching away from neighborhoods
        resetNeighborhoodColoring();
      }
    });
  }

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
          applyColumnColoring(selectedColumn);

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
        resetNeighborhoodColoring();
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
 * تهيئة خريطة Leaflet
 */
function initMap() {
  // Remove previous map instance if exists
  if (map) {
    map.remove();
    map = null;
  }

  // التحقق من وجود عنصر الخريطة في الصفحة
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("عنصر الخريطة غير موجود");
    return;
  }

  // إنشاء الخريطة في عنصر DOM
  map = L.map("map", {
    center: [36.2021, 37.1343], // إحداثيات مدينة حلب
    zoom: 12,
    zoomControl: false, // سنضيف عناصر التحكم في الزوم يدويًا
    attributionControl: true,
  });

  // إضافة طبقة OpenStreetMap الأساسية
  const streetsLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }
  );
  streetsLayer.addTo(map);

  // إضافة طبقة صور الأقمار الصناعية من Google
  const satelliteLayer = L.tileLayer(
    "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
      attribution: "&copy; Google",
      maxZoom: 19,
    }
  );

  // إضافة طبقة طبوغرافية
  const terrainLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
      maxZoom: 17,
    }
  );

  // إضافة متحكم الطبقات الأساسية
  const baseLayers = {
    "خريطة الشوارع": streetsLayer,
    "صور الأقمار الصناعية": satelliteLayer,
    "الخريطة الطبوغرافية": terrainLayer,
  };

  // إعداد مصفوفة طبقات الأساس
  baseLayersArr = [
    { name: "streets", layer: streetsLayer },
    { name: "satellite", layer: satelliteLayer },
    { name: "terrain", layer: terrainLayer },
  ];
  currentBaseLayer = baseLayersArr[0].layer;
  currentBaseIndex = 0;

  // --- إضافة طبقات إضافية (Overlays) ---
  // سنضيف طبقة التسميات لاحقٍ بعد تحميل الأحياء
  const overlays = {};

  // وظيفة تبديل طبقة الأساس
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

  // طبقة الأساس الافتراضية
  setBaseLayer(0);

  // إضافة متحكم الطبقات إلى الخريطة
  L.control
    .layers(baseLayers, null, {
      position: "topleft",
      collapsed: true,
    })
    .addTo(map);

  // إضافة متحكم الزوم إلى الخريطة
  L.control
    .zoom({
      position: "topleft",
    })
    .addTo(map);

  // إضافة مقياس للخريطة (دائماً)
  L.control
    .scale({
      position: "bottomleft",
      imperial: false,
    })
    .addTo(map);

  // إضافة أدوات الرسم دائماً
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

  // إنشاء مجموعة الطبقات الرئيسية
  mainLayersGroup = L.layerGroup().addTo(map);

  // إعداد عناصر التحكم في الخريطة
  setupMapControls();

  // تحميل الطبقات
  loadLayers();

  // Initialize base layer controls
  initBaseLayerControls();

  // Add default base layer
  currentBaseLayer.addTo(map);

  // Add scale bar (always visible)
  L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

  // Basemap gallery logic
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
  // Show/hide gallery on layers button click
  const layersBtn = document.getElementById("layers-btn");
  if (layersBtn) {
    layersBtn.addEventListener("click", () => {
      basemapGallery.classList.toggle("open");
    });
  }

  // Add clear measurements button
  addClearMeasurementsButton();

  // At the end of initMap, set window.map = map
  window.map = map;

  // Modify layers button position and style
  if (layersBtn) {
    // Update button position and style
    layersBtn.style.position = "fixed";
    layersBtn.style.left = "20px";
    layersBtn.style.bottom = "80px"; // Position above footer
    layersBtn.style.zIndex = "1000";
    layersBtn.style.backgroundColor = "#fff";
    layersBtn.style.border = "none";
    layersBtn.style.borderRadius = "50%"; // Make it circular
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
    } catch (e) {}
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
          maxZoom: 16
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

// Export report functions have been moved to exportReportPDF.js

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
            <p><strong>عدد دوائر الخدمات:</strong> ${
              serviceSectorsData.features.length
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
            <strong>${
              properties.Pop
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

// At the end of initMap, set window.map = map

// Function to show fullscreen popup
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
      // Add some default content if empty
      if (
        popupContentContainer.innerHTML.trim() ===
        "<!-- Content from window.html will be loaded here -->"
      ) {
        popupContentContainer.innerHTML = `
          <div style="padding: 20px; font-family: 'Cairo', sans-serif; height: 100%; overflow-y: auto;">
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">
              <i class="fas fa-calculator" style="color: #28a745;"></i> الفعالية العمرانية المجردة            </h2>

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
                <i class="fas fa-chart-bar"></i> نتائج الفعالية العمرانية المجردة              </h4>

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
window.showSectoralFunctionalityCalculation =
  showSectoralFunctionalityCalculation;
window.showSectoralMappingInterface = showSectoralMappingInterface;
window.applySectoralColoring = applySectoralColoring;
window.showSectorPreview = showSectorPreview;
window.populateSectoralMappingGridWithMaps =
  populateSectoralMappingGridWithMaps;
window.createMiniMapForSector = createMiniMapForSector;
window.debugSectoralData = debugSectoralData;
window.testSectoralColoring = testSectoralColoring;
window.createSimpleSectoralInterface = createSimpleSectoralInterface;
window.refreshSectoralData = refreshSectoralData;
window.showSectoralMaps = showSectoralMaps;
window.createSectoralMapsGrid = createSectoralMapsGrid;
window.generateRandomSectoralFunctionalityForAll =
  generateRandomSectoralFunctionalityForAll;
window.initializeWeightsInterface = initializeWeightsInterface;
window.calculateCompositeEfficiency = calculateCompositeEfficiency;
window.applyCompositeColoring = applyCompositeColoring;
window.updateWeight = updateWeight;
window.updateTotalWeight = updateTotalWeight;
window.initializeFinalWeightsInterface = initializeFinalWeightsInterface;
window.calculateFinalUrbanEffectiveness = calculateFinalUrbanEffectiveness;
window.updateFinalWeight = updateFinalWeight;
window.updateFinalTotalWeight = updateFinalTotalWeight;
window.applyFinalColoring = applyFinalColoring;

// Function to show the Urban Sectoral Functionality calculation interface
function showSectoralFunctionalityCalculation() {
  const fullscreenPopup = document.getElementById("fullscreen-popup");
  const popupContentContainer = document.getElementById(
    "popup-content-container"
  );
  const sectoralFunctionalityContainer = document.getElementById(
    "sectoral-functionality-container"
  );
  const popupLoading = document.getElementById("popup-loading");

  if (fullscreenPopup && sectoralFunctionalityContainer) {
    // Hide loading indicator
    if (popupLoading) popupLoading.style.display = "none";

    // Hide all other containers
    if (popupContentContainer) popupContentContainer.style.display = "none";
    const sectoralMappingContainer = document.getElementById(
      "sectoral-mapping-container"
    );
    if (sectoralMappingContainer)
      sectoralMappingContainer.style.display = "none";

    // Show sectoral functionality container
    sectoralFunctionalityContainer.style.display = "flex";

    // Show the main fullscreen popup if it's hidden
    if (!fullscreenPopup.classList.contains("show")) {
      fullscreenPopup.style.display = "flex";
      // Force a reflow
      fullscreenPopup.offsetHeight;
      // Add the show class to trigger animations
      fullscreenPopup.classList.add("show");
      // Prevent body scrolling
      document.body.style.overflow = "hidden";
    }

    // Populate the table with real data
    populateSectoralFunctionalityTable();
  }
}

// Function to hide the Urban Sectoral Functionality calculation interface
function hideSectoralFunctionalityCalculation() {
  const sectoralFunctionalityContainer = document.getElementById(
    "sectoral-functionality-container"
  );
  const modalBackdrop = document.getElementById("modal-backdrop");

  if (sectoralFunctionalityContainer) {
    sectoralFunctionalityContainer.style.display = "none";
    // Reset styles applied to make it a modal
    sectoralFunctionalityContainer.style.position = "";
    sectoralFunctionalityContainer.style.top = "";
    sectoralFunctionalityContainer.style.left = "";
    sectoralFunctionalityContainer.style.width = "";
    sectoralFunctionalityContainer.style.height = "";
    sectoralFunctionalityContainer.style.zIndex = "";
    sectoralFunctionalityContainer.style.backgroundColor = "";
    sectoralFunctionalityContainer.style.overflowY = "";

    const contentDiv = sectoralFunctionalityContainer.querySelector(
      'div[style*="overflow-y: auto"]'
    );
    if (contentDiv) {
      contentDiv.style.maxWidth = "";
      contentDiv.style.margin = "";
      contentDiv.style.backgroundColor = "";
      contentDiv.style.padding = "";
      contentDiv.style.borderRadius = "";
      contentDiv.style.boxShadow = "";
    }

    // Remove the click outside listener to prevent memory leaks
    const closeSectoralView = arguments.callee.caller; // This is not reliable, better to use a named function or clean reference
    // A more robust way to remove the listener would involve storing the function reference when adding it.
  }

  if (modalBackdrop) {
    modalBackdrop.classList.remove("show");
    modalBackdrop.style.zIndex = "";
  }
}

// Find the close button within the sectoral functionality container and add an event listener
document.addEventListener("DOMContentLoaded", function () {
  const sectoralFunctionalityContainer = document.getElementById(
    "sectoral-functionality-container"
  );
  if (sectoralFunctionalityContainer) {
    // Assuming there is a close button with class 'close-btn' or similar within the header
    const closeButton =
      sectoralFunctionalityContainer.querySelector(".close-btn"); // Adjust selector as needed
    if (closeButton) {
      closeButton.addEventListener(
        "click",
        hideSectoralFunctionalityCalculation
      );
    }
    // Also add click outside listener here, so we can easily remove it in hide function
    sectoralFunctionalityContainer.addEventListener("click", function (event) {
      // Check if the click was directly on the container background
      if (event.target === sectoralFunctionalityContainer) {
        hideSectoralFunctionalityCalculation();
      }
    });
  }
});

// Function to populate the Urban Sectoral Functionality table
function populateSectoralFunctionalityTable() {
  const tableBody = document.querySelector(
    "#sectoral-functionality-table tbody"
  );

  if (!tableBody) {
    console.error("Sectoral functionality table body not found");
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = "";

  // Check if tablesData is available
  if (typeof window.tablesData === "undefined") {
    console.warn("tablesData not available, loading tabs.js...");
    // Try to load tabs.js if not already loaded
    const script = document.createElement("script");
    script.src = "js/tabs.js";
    script.onload = () => {
      console.log("tabs.js loaded, retrying table population...");
      setTimeout(() => populateSectoralFunctionalityTable(), 100);
    };
    document.head.appendChild(script);
    return;
  }

  // Get current date in Gregorian format
  const currentDate = new Date().toLocaleDateString("en-US");

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    "التدخلات الإنسانية",
    "الأسواق الأساسية",
    "إدارة النفايات الصلبة",
    "شبكة الكهرباء",
    "شبكة الاتصالات",
    "إمدادات المياه",
    "شبكة الصرف الصحي",
    "أضرار الإسكان",
    "النسيج الحضري",
    "التغيرات السكانية",
  ];

  // Initialize global sectoral functionality data storage
  if (!window.sectoralFunctionalityData) {
    window.sectoralFunctionalityData = {};
  }

  // Get neighborhoods data
  if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
    neighborhoodsData.features.forEach((feature, index) => {
      const properties = feature.properties;
      const neighborhoodName =
        properties.Names ||
        properties.Name_En ||
        properties.Name ||
        `الحي ${index + 1}`;

      const tr = document.createElement("tr");

      // Initialize neighborhood data in global storage
      if (!window.sectoralFunctionalityData[neighborhoodName]) {
        window.sectoralFunctionalityData[neighborhoodName] = {};
      }

      // Create row HTML
      let rowHTML = `
        <td style="font-weight: bold; background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6;">${neighborhoodName}</td>
        <td style="text-align: center; color: #6c757d; padding: 8px; border: 1px solid #dee2e6;">${currentDate}</td>
      `;

      // Calculate sectoral functionality for each column
      sectoralColumns.forEach((columnName) => {
        let functionality;

        // Check if we already have data for this neighborhood and sector
        if (
          window.sectoralFunctionalityData[neighborhoodName] &&
          window.sectoralFunctionalityData[neighborhoodName][columnName]
        ) {
          functionality =
            window.sectoralFunctionalityData[neighborhoodName][columnName];
        } else {
          // Generate new data if not exists
          functionality = generateRandomSectoralFunctionality(columnName);

          // Store the data in global storage for mapping use
          if (!window.sectoralFunctionalityData[neighborhoodName]) {
            window.sectoralFunctionalityData[neighborhoodName] = {};
          }
          window.sectoralFunctionalityData[neighborhoodName][columnName] =
            functionality;
        }

        const functionalityClass = getFunctionalityClass(functionality.status);
        const functionalityColor = getFunctionalityColor(
          functionality.percentage
        );

        rowHTML += `
          <td style="text-align: center; padding: 6px; border: 1px solid #dee2e6;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="
                background: ${functionalityColor};
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                min-width: 35px;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              ">${functionality.percentage}%</span>
              <span style="font-size: 9px; color: #6c757d; font-weight: 500;">${functionality.status}</span>
            </div>
          </td>
        `;
      });

      tr.innerHTML = rowHTML;
      tr.style.transition = "background-color 0.2s ease";
      tableBody.appendChild(tr);
    });

    console.log(
      `Populated sectoral functionality table with ${neighborhoodsData.features.length} neighborhoods`
    );
  } else {
    // Create sample data if no neighborhoods data available
    const sampleNeighborhoods = [
      "الخالدية",
      "صلاح الدين",
      "الميدان",
      "العزيزية",
      "الشعار",
      "باب النيرب",
      "المحافظة",
      "الجميلية",
      "السبيل",
      "الكلاسة",
    ];

    sampleNeighborhoods.forEach((neighborhoodName) => {
      const tr = document.createElement("tr");

      // Initialize neighborhood data in global storage
      if (!window.sectoralFunctionalityData[neighborhoodName]) {
        window.sectoralFunctionalityData[neighborhoodName] = {};
      }

      let rowHTML = `
        <td style="font-weight: bold; background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6;">${neighborhoodName}</td>
        <td style="text-align: center; color: #6c757d; padding: 8px; border: 1px solid #dee2e6;">${currentDate}</td>
      `;

      sectoralColumns.forEach((columnName) => {
        let functionality;

        // Check if we already have data for this neighborhood and sector
        if (
          window.sectoralFunctionalityData[neighborhoodName] &&
          window.sectoralFunctionalityData[neighborhoodName][columnName]
        ) {
          functionality =
            window.sectoralFunctionalityData[neighborhoodName][columnName];
        } else {
          // Generate new data if not exists
          functionality = generateRandomSectoralFunctionality(columnName);

          // Store the data in global storage for mapping use
          if (!window.sectoralFunctionalityData[neighborhoodName]) {
            window.sectoralFunctionalityData[neighborhoodName] = {};
          }
          window.sectoralFunctionalityData[neighborhoodName][columnName] =
            functionality;
        }

        const functionalityColor = getFunctionalityColor(
          functionality.percentage
        );

        rowHTML += `
          <td style="text-align: center; padding: 6px; border: 1px solid #dee2e6;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="
                background: ${functionalityColor};
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                min-width: 35px;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              ">${functionality.percentage}%</span>
              <span style="font-size: 9px; color: #6c757d; font-weight: 500;">${functionality.status}</span>
            </div>
          </td>
        `;
      });

      tr.innerHTML = rowHTML;
      tr.style.transition = "background-color 0.2s ease";
      tableBody.appendChild(tr);
    });

    console.log("Populated sectoral functionality table with sample data");
  }
}

// Function to calculate sectoral functionality based on tablesData
function calculateSectoralFunctionality(properties, sectorName) {
  try {
    // Get tablesData from window object
    const tablesData = window.tablesData;
    if (!tablesData) {
      console.warn("tablesData not available for sector:", sectorName);
      return {
        percentage: Math.floor(Math.random() * 100),
        status: "غير متاح",
      };
    }

    let percentage = 0;
    let status = "ضعيف";

    // Map sector names to tablesData keys
    const sectorMapping = {
      "التدخلات الإنسانية": "التدخلات_الإنسانية",
      "الأسواق الأساسية": "الأسواق_الأساسية",
      "إدارة النفايات الصلبة": "إدارة_النفايات_الصلبة",
      "شبكة الكهرباء": "شبكة_الكهرباء",
      "شبكة الاتصالات": "شبكة_الاتصالات",
      "إمدادات المياه": "إمدادات_المياه",
      "شبكة الصرف الصحي": "شبكة_الصرف_الصحي",
      "أضرار الإسكان": "أضرار_الإسكان",
      "النسيج الحضري": "النسيج_الحضري",
      "التغيرات السكانية": "التغيرات_السكانية",
    };

    const tableKey = sectorMapping[sectorName];
    if (!tableKey || !tablesData[tableKey]) {
      return {
        percentage: Math.floor(Math.random() * 100),
        status: "غير محدد",
      };
    }

    const sampleData = tablesData[tableKey].sampleData;

    // Calculate functionality based on sector type and sample data
    switch (sectorName) {
      case "التدخلات الإنسانية":
        // Calculate based on humanitarian intervention quality
        const interventionScores = {
          جيد: 100,
          مقبول: 70,
          ضعيف: 30,
        };
        const healthScore = interventionScores[sampleData.health] || 0;
        const foodScore = interventionScores[sampleData.food] || 0;
        const clothesScore = interventionScores[sampleData.clothes] || 0;
        const housingScore = interventionScores[sampleData.housing] || 0;
        const eduScore = interventionScores[sampleData.edu] || 0;
        const learningScore = interventionScores[sampleData.learning] || 0;
        const incomeScore = interventionScores[sampleData.incom_improve] || 0;

        percentage = Math.round(
          (healthScore +
            foodScore +
            clothesScore +
            housingScore +
            eduScore +
            learningScore +
            incomeScore) /
            7
        );
        break;

      case "الأسواق الأساسية":
        // Calculate based on market operational status and shop count
        const marketStatusScores = {
          "يعمل بشكل اعتيادي": 100,
          "يعمل بشكل مقبول": 75,
          "يعمل بشكل متقطع": 40,
          "لا يعمل (معدوم)": 0,
        };
        const statusScore = marketStatusScores[sampleData.status] || 0;
        const shopsCount = parseInt(sampleData.shops) || 0;
        const shopsScore = Math.min(100, (shopsCount / 100) * 100); // Normalize to 100 shops = 100%

        percentage = Math.round(statusScore * 0.7 + shopsScore * 0.3);
        break;

      case "إدارة النفايات الصلبة":
        // Calculate based on waste management indicators
        const cleanlinessScores = {
          جيدة: 100,
          مقبول: 70,
          ضعيف: 40,
          معدوم: 0,
        };
        const pestControlScores = {
          دائما: 100,
          احيانا: 60,
          "لا يوجد": 0,
        };
        const rubbleRemovalScores = {
          "بشكل دائم": 100,
          "بشكل جزئي": 60,
          "لا يوجد ترحيل": 0,
        };
        const dumpingSitesScore =
          sampleData.dumping_sites === "لا يوجد" ? 100 : 0;

        const cleanScore = cleanlinessScores[sampleData.cleanliness] || 0;
        const pestScore = pestControlScores[sampleData.pest_control] || 0;
        const rubbleScore = rubbleRemovalScores[sampleData.rubble_removal] || 0;

        percentage = Math.round(
          dumpingSitesScore * 0.3 +
            cleanScore * 0.3 +
            pestScore * 0.2 +
            rubbleScore * 0.2
        );
        break;

      case "شبكة الكهرباء":
        // Calculate based on electrical network damage and status
        const damageScores2 = {
          معدوم: 100,
          خفيف: 80,
          متوسط: 50,
          شديد: 20,
        };
        const networkStatusScores = {
          تعمل: 100,
          "تعمل جزئيا": 60,
          "لا تعمل": 0,
        };

        const transformerScore =
          damageScores2[sampleData.transformer_damage] || 0;
        const lineScore = damageScores2[sampleData.line_damage] || 0;
        const networkStatus = networkStatusScores[sampleData.status] || 0;

        percentage = Math.round(
          transformerScore * 0.4 + lineScore * 0.3 + networkStatus * 0.3
        );
        break;

      case "شبكة الاتصالات":
        // Same calculation as electrical network
        const teleDamageScores = {
          معدوم: 100,
          خفيف: 80,
          متوسط: 50,
          شديد: 20,
        };
        const teleNetworkStatusScores = {
          تعمل: 100,
          "تعمل جزئيا": 60,
          "لا تعمل": 0,
        };

        const teleTransformerScore =
          teleDamageScores[sampleData.transformer_damage] || 0;
        const teleLineScore = teleDamageScores[sampleData.line_damage] || 0;
        const teleNetworkStatus =
          teleNetworkStatusScores[sampleData.status] || 0;

        percentage = Math.round(
          teleTransformerScore * 0.4 +
            teleLineScore * 0.3 +
            teleNetworkStatus * 0.3
        );
        break;

      case "إمدادات المياه":
        // Calculate based on water supply status and damage
        const connectionScore = sampleData.connected === "نعم" ? 100 : 0;
        const waterDamageScores = {
          منخفض: 100,
          متوسط: 70,
          مرتفع: 40,
          "عالٍ جداً": 10,
        };
        const waterStatusScores = {
          "يعمل كاملاً": 100,
          "يعمل جزئياً": 60,
          متوقف: 0,
        };

        const waterDamageScore = waterDamageScores[sampleData.main_damage] || 0;
        const waterStatus = waterStatusScores[sampleData.main_status] || 0;
        const operationRatio =
          parseInt(sampleData.secondary_status?.replace("%", "")) || 0;

        percentage = Math.round(
          connectionScore * 0.2 +
            waterDamageScore * 0.3 +
            waterStatus * 0.3 +
            operationRatio * 0.2
        );
        break;

      case "شبكة الصرف الصحي":
        // Same calculation as water supply
        const sewerConnectionScore = sampleData.connected === "نعم" ? 100 : 0;
        const sewerDamageScores = {
          منخفض: 100,
          متوسط: 70,
          مرتفع: 40,
          "عالٍ جداً": 10,
        };
        const sewerStatusScores = {
          "يعمل كاملاً": 100,
          "يعمل جزئياً": 60,
          متوقف: 0,
        };

        const sewerDamageScore = sewerDamageScores[sampleData.main_damage] || 0;
        const sewerStatus = sewerStatusScores[sampleData.main_status] || 0;
        const sewerOperationRatio =
          parseInt(sampleData.secondary_status?.replace("%", "")) || 0;

        percentage = Math.round(
          sewerConnectionScore * 0.2 +
            sewerDamageScore * 0.3 +
            sewerStatus * 0.3 +
            sewerOperationRatio * 0.2
        );
        break;

      case "أضرار الإسكان":
        // Calculate based on housing damage (inverse - less damage = higher functionality)
        const severeDamage =
          parseInt(sampleData.severe_damage?.replace("%", "")) || 0;
        const mediumDamage =
          parseInt(sampleData.medium_damage?.replace("%", "")) || 0;
        const lightDamage =
          parseInt(sampleData.light_damage?.replace("%", "")) || 0;
        const undamagedUnits =
          parseInt(sampleData.undamaged_units?.replace("%", "")) || 0;

        // Higher undamaged percentage = higher functionality
        // Lower damage percentages = higher functionality
        percentage = Math.round(
          undamagedUnits +
            (100 - severeDamage - mediumDamage - lightDamage) * 0.3
        );
        percentage = Math.min(100, Math.max(0, percentage));
        break;

      case "النسيج الحضري":
        // Calculate based on urban fabric quality
        const urbanStatusScores = {
          منظم: 100,
          مختلط: 70,
          "بلدة قديمة": 60,
          عشوائي: 30,
        };
        const urbanScore = urbanStatusScores[sampleData.urbn_status] || 0;
        const informalPercent =
          parseInt(sampleData.informal_percent?.replace("%", "")) || 0;
        const traditionalPercent =
          parseInt(sampleData.traditional_percent?.replace("%", "")) || 0;

        // Lower informal housing = higher functionality
        // Higher traditional housing = moderate functionality
        percentage = Math.round(
          urbanScore * 0.5 +
            (100 - informalPercent) * 0.3 +
            traditionalPercent * 0.2
        );
        break;

      case "التغيرات السكانية":
        // Calculate based on population stability
        const population = parseInt(sampleData.population) || 0;
        const migrantsPercent =
          parseInt(sampleData.migrants?.replace("%", "")) || 0;
        const returneesPercent =
          parseInt(sampleData.returnees?.replace("%", "")) || 0;

        // Higher returnees = positive, lower migrants = more stable
        const stabilityScore = Math.max(
          0,
          100 - migrantsPercent + returneesPercent * 0.5
        );
        const populationScore = Math.min(100, (population / 50000) * 100); // Normalize to 50k population

        percentage = Math.round(stabilityScore * 0.7 + populationScore * 0.3);
        break;

      default:
        percentage = Math.floor(Math.random() * 100);
    }

    // Ensure percentage is within bounds
    percentage = Math.min(100, Math.max(0, percentage));

    // Determine status based on percentage
    if (percentage >= 80) {
      status = "ممتاز";
    } else if (percentage >= 65) {
      status = "جيد";
    } else if (percentage >= 50) {
      status = "متوسط";
    } else if (percentage >= 30) {
      status = "ضعيف";
    } else {
      status = "سيء";
    }

    return {
      percentage: percentage,
      status: status,
    };
  } catch (error) {
    console.error(
      "Error calculating sectoral functionality for",
      sectorName,
      ":",
      error
    );
    return {
      percentage: Math.floor(Math.random() * 100),
      status: "خطأ في الحساب",
    };
  }
}

// Helper function to get color based on functionality percentage
function getFunctionalityColor(percentage) {
  if (percentage >= 80) {
    return "#28a745"; // Green - Excellent
  } else if (percentage >= 65) {
    return "#20c997"; // Teal - Good
  } else if (percentage >= 50) {
    return "#ffc107"; // Yellow - Average
  } else if (percentage >= 30) {
    return "#fd7e14"; // Orange - Poor
  } else {
    return "#dc3545"; // Red - Bad
  }
}

// Helper function to get CSS class for functionality status
function getFunctionalityClass(functionality) {
  switch (functionality) {
    case "ممتاز":
      return "excellent";
    case "جيد":
      return "good";
    case "متوسط":
      return "average";
    case "ضعيف":
      return "poor";
    case "سيء":
      return "bad";
    default:
      return "average";
  }
}

// Function to randomize sectoral functionality data
function randomizeSectoralFunctionality() {
  console.log("Randomizing sectoral functionality data...");

  // Check if tablesData is available
  if (typeof window.tablesData === "undefined") {
    console.warn("tablesData not available for randomization");
    return;
  }

  // Create randomized data for each neighborhood
  const tableBody = document.querySelector(
    "#sectoral-functionality-table tbody"
  );
  if (!tableBody) {
    console.error("Table body not found");
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get current date in Gregorian format
  const currentDate = new Date().toLocaleDateString("en-US");

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    "التدخلات الإنسانية",
    "الأسواق الأساسية",
    "إدارة النفايات الصلبة",
    "شبكة الكهرباء",
    "شبكة الاتصالات",
    "إمدادات المياه",
    "شبكة الصرف الصحي",
    "أضرار الإسكان",
    "النسيج الحضري",
    "التغيرات السكانية",
  ];

  // Get neighborhoods data or use sample data
  let neighborhoods = [];
  if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
    neighborhoods = neighborhoodsData.features
      .map((feature, index) => {
        const properties = feature.properties;
        return (
          properties.Names ||
          properties.Name_En ||
          properties.name ||
          properties.NAME ||
          `الحي ${index + 1}`
        );
      })
      .filter((name) => name); // Remove any null/undefined names
    console.log("Using neighborhoods from GeoJSON data:", neighborhoods);
  } else {
    neighborhoods = [
      "الخالدية",
      "صلاح الدين",
      "الميدان",
      "العزيزية",
      "الشعار",
      "باب النيرب",
      "المحافظة",
      "الجميلية",
      "السبيل",
      "الكلاسة",
    ];
    console.log("Using fallback neighborhood names:", neighborhoods);
  }

  // Initialize global sectoral functionality data storage
  if (!window.sectoralFunctionalityData) {
    window.sectoralFunctionalityData = {};
  }

  // Generate randomized data for each neighborhood
  neighborhoods.forEach((neighborhoodName) => {
    const tr = document.createElement("tr");

    let rowHTML = `
      <td style="font-weight: bold; background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6;">${neighborhoodName}</td>
      <td style="text-align: center; color: #6c757d; padding: 8px; border: 1px solid #dee2e6;">${currentDate}</td>
    `;

    // Initialize neighborhood data in global storage
    if (!window.sectoralFunctionalityData[neighborhoodName]) {
      window.sectoralFunctionalityData[neighborhoodName] = {};
    }

    // Generate random functionality for each sector for this specific neighborhood
    sectoralColumns.forEach((columnName) => {
      const functionality = generateRandomSectoralFunctionality(columnName);
      const functionalityColor = getFunctionalityColor(
        functionality.percentage
      );

      // Store the data in global storage for mapping use
      window.sectoralFunctionalityData[neighborhoodName][columnName] = {
        percentage: functionality.percentage,
        status: functionality.status,
      };

      rowHTML += `
        <td style="text-align: center; padding: 6px; border: 1px solid #dee2e6;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="
              background: ${functionalityColor};
              color: white;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              min-width: 35px;
              display: inline-block;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            ">${functionality.percentage}%</span>
            <span style="font-size: 9px; color: #6c757d; font-weight: 500;">${functionality.status}</span>
          </div>
        </td>
      `;
    });

    tr.innerHTML = rowHTML;
    tr.style.transition = "background-color 0.2s ease";
    tableBody.appendChild(tr);
  });

  console.log(
    "Sectoral functionality data randomized successfully for",
    neighborhoods.length,
    "neighborhoods"
  );
}

// Debug function to check sectoral data
function debugSectoralData() {
  console.log("=== SECTORAL DATA DEBUG ===");
  console.log(
    "neighborhoodsData available:",
    typeof neighborhoodsData !== "undefined"
  );
  console.log(
    "sectoralFunctionalityData available:",
    !!window.sectoralFunctionalityData
  );

  if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
    console.log(
      "Number of neighborhoods in GeoJSON:",
      neighborhoodsData.features.length
    );
    console.log(
      "Sample neighborhood properties:",
      neighborhoodsData.features[0].properties
    );

    const sampleNames = neighborhoodsData.features
      .slice(0, 5)
      .map((feature) => {
        return {
          Names: feature.properties.Names,
          Name_En: feature.properties.Name_En,
          name: feature.properties.name,
          NAME: feature.properties.NAME,
        };
      });
    console.log("Sample neighborhood names:", sampleNames);
  }

  if (window.sectoralFunctionalityData) {
    console.log(
      "Number of neighborhoods in sectoral data:",
      Object.keys(window.sectoralFunctionalityData).length
    );
    console.log(
      "Sample neighborhood names in data:",
      Object.keys(window.sectoralFunctionalityData).slice(0, 5)
    );

    const firstNeighborhood = Object.keys(window.sectoralFunctionalityData)[0];
    if (firstNeighborhood) {
      console.log(
        "Sample data for",
        firstNeighborhood,
        ":",
        window.sectoralFunctionalityData[firstNeighborhood]
      );
    }
  }

  console.log("=== END DEBUG ===");
}

// Test function to force regenerate data and apply composite coloring
function testCompositeColoring() {
  console.log("Testing composite coloring...");

  // Force regenerate sectoral data
  populateSectoralFunctionalityTable();

  // Wait a bit then try composite coloring
  setTimeout(() => {
    applyCompositeColoring();
  }, 1000);
}

// Test function to apply sectoral coloring directly
function testSectoralColoring() {
  console.log("Testing sectoral coloring...");

  // Check if data exists
  if (
    !window.sectoralFunctionalityData ||
    Object.keys(window.sectoralFunctionalityData).length === 0
  ) {
    alert("يرجى حساب الفعالية القطاعية أولاً من خلال الجدول");
    return;
  }

  // Apply coloring for the first sector as a test
  const firstSector = "التدخلات الإنسانية";
  applySectoralColoring(firstSector);

  showNotification(`تم تطبيق تلوين ${firstSector} كاختبار`, "success");
}

// Function to create simple sectoral interface
function createSimpleSectoralInterface() {
  console.log("Creating simple sectoral interface...");

  const grid = document.getElementById("sectoralMappingGrid");
  if (!grid) return;

  // Clear existing content
  grid.innerHTML = "";

  // Set grid style for better layout
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  `;

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    {
      name: "التدخلات الإنسانية",
      icon: "fas fa-hands-helping",
      color: "#e74c3c",
    },
    { name: "الأسواق الأساسية", icon: "fas fa-store", color: "#3498db" },
    { name: "إدارة النفايات الصلبة", icon: "fas fa-trash", color: "#2ecc71" },
    { name: "شبكة الكهرباء", icon: "fas fa-bolt", color: "#f1c40f" },
    { name: "شبكة الاتصالات", icon: "fas fa-wifi", color: "#9b59b6" },
    { name: "إمدادات المياه", icon: "fas fa-tint", color: "#3498db" },
    { name: "شبكة الصرف الصحي", icon: "fas fa-water", color: "#34495e" },
    { name: "أضرار الإسكان", icon: "fas fa-home", color: "#e74c3c" },
    { name: "النسيج الحضري", icon: "fas fa-city", color: "#95a5a6" },
    { name: "التغيرات السكانية", icon: "fas fa-users", color: "#16a085" },
  ];

  // Show the blue gradient legend
  const legend = document.getElementById("blueGradientLegend");
  if (legend) {
    legend.style.display = "block";
  }

  // Create simple cards for each sector
  sectoralColumns.forEach((sector, index) => {
    const card = document.createElement("div");
    card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      cursor: pointer;
      text-align: center;
    `;

    // Calculate statistics for this sector
    const stats = calculateSectorStatistics(sector.name);

    card.innerHTML = `
      <div style="margin-bottom: 15px;">
        <div style="
          width: 50px;
          height: 50px;
          background: ${sector.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          margin: 0 auto 10px auto;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">${sector.name}</h4>
      </div>

      <button onclick="applySectoralColoring('${sector.name}')" style="
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        font-weight: bold;
        margin-bottom: 15px;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-paint-brush"></i> تطبيق التلوين الأزرق
      </button>

      <div style="padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 12px;">
        <div style="margin-bottom: 5px; color: #495057; font-weight: bold;">
          إجمالي الأحياء: ${stats.total}
        </div>
        <div style="display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="flex: ${stats.excellent}; background: #0d47a1;" title="ممتاز: ${stats.excellent}"></div>
          <div style="flex: ${stats.good}; background: #1976d2;" title="جيد: ${stats.good}"></div>
          <div style="flex: ${stats.average}; background: #42a5f5;" title="متوسط: ${stats.average}"></div>
          <div style="flex: ${stats.poor}; background: #90caf9;" title="ضعيف: ${stats.poor}"></div>
          <div style="flex: ${stats.bad}; background: #e3f2fd;" title="سيء: ${stats.bad}"></div>
        </div>
      </div>
    `;

    // Add hover effects
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    });

    grid.appendChild(card);
  });

  console.log(
    "Simple sectoral interface created with",
    sectoralColumns.length,
    "sectors"
  );
}

// Function to refresh sectoral data
function refreshSectoralData() {
  console.log("Refreshing sectoral data...");

  // Generate random data for all neighborhoods and sectors
  generateRandomSectoralFunctionalityForAll();

  // Show success message
  showNotification("تم تحديث البيانات بنجاح", "success");

  // Update status message
  const statusMessage = document.getElementById("statusMessage");
  if (statusMessage) {
    statusMessage.innerHTML = `
      <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 20px; color: #28a745;"></i><br>
      تم تحديث البيانات بنجاح! اضغط على "إظهار القطاعات" لعرض الخرائط الملونة
    `;
  }
}

// Function to show sectoral maps
function showSectoralMaps() {
  console.log("Showing sectoral maps...");

  // Check if data exists
  if (
    !window.sectoralFunctionalityData ||
    Object.keys(window.sectoralFunctionalityData).length === 0
  ) {
    alert("يرجى تحديث البيانات أولاً");
    return;
  }

  // Hide status message and show maps container
  const statusMessage = document.getElementById("statusMessage");
  const mapsContainer = document.getElementById("sectoralMapsContainer");

  if (statusMessage) statusMessage.style.display = "none";
  if (mapsContainer) {
    mapsContainer.style.display = "block";
    createSectoralMapsGrid();
  }
}

// Function to create sectoral maps grid
function createSectoralMapsGrid() {
  const container = document.getElementById("sectoralMapsContainer");
  if (!container) return;

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    {
      name: "التدخلات الإنسانية",
      icon: "fas fa-hands-helping",
      color: "#e74c3c",
    },
    { name: "الأسواق الأساسية", icon: "fas fa-store", color: "#3498db" },
    { name: "إدارة النفايات الصلبة", icon: "fas fa-trash", color: "#2ecc71" },
    { name: "شبكة الكهرباء", icon: "fas fa-bolt", color: "#f1c40f" },
    { name: "شبكة الاتصالات", icon: "fas fa-wifi", color: "#9b59b6" },
    { name: "إمدادات المياه", icon: "fas fa-tint", color: "#3498db" },
    { name: "شبكة الصرف الصحي", icon: "fas fa-water", color: "#34495e" },
    { name: "أضرار الإسكان", icon: "fas fa-home", color: "#e74c3c" },
    { name: "النسيج الحضري", icon: "fas fa-city", color: "#95a5a6" },
    { name: "التغيرات السكانية", icon: "fas fa-users", color: "#16a085" },
  ];

  container.innerHTML = `
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
    ">
      ${sectoralColumns
        .map(
          (sector) => `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="
              width: 40px;
              height: 40px;
              background: ${sector.color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
            ">
              <i class="${sector.icon}"></i>
            </div>
            <h4 style="margin: 0; color: #333; font-size: 14px; font-weight: bold;">${
              sector.name
            }</h4>
          </div>

          <div id="miniMap-${sector.name.replace(/\s+/g, "-")}" style="
            height: 200px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            margin-bottom: 10px;
          "></div>

          <button onclick="applySectoralColoring('${sector.name}')" style="
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
            font-weight: bold;
          ">
            <i class="fas fa-paint-brush"></i> تطبيق على الخريطة الرئيسية
          </button>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  // Create mini maps for each sector
  setTimeout(() => {
    sectoralColumns.forEach((sector) => {
      createMiniMapForSector(
        sector.name,
        `miniMap-${sector.name.replace(/\s+/g, "-")}`
      );
    });
  }, 100);
}

// Function to generate random sectoral functionality for all neighborhoods and sectors
function generateRandomSectoralFunctionalityForAll() {
  console.log("Generating random sectoral functionality for all...");

  // Initialize the global data object
  window.sectoralFunctionalityData = {};

  // Get neighborhood names
  if (typeof neighborhoodsData === "undefined" || !neighborhoodsData.features) {
    console.error("Neighborhoods data not available");
    return;
  }

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    "التدخلات الإنسانية",
    "الأسواق الأساسية",
    "إدارة النفايات الصلبة",
    "شبكة الكهرباء",
    "شبكة الاتصالات",
    "إمدادات المياه",
    "شبكة الصرف الصحي",
    "أضرار الإسكان",
    "النسيج الحضري",
    "التغيرات السكانية",
  ];

  // Generate data for each neighborhood
  neighborhoodsData.features.forEach((feature) => {
    const properties = feature.properties;
    const neighborhoodName =
      properties.Names ||
      properties.Name_En ||
      properties.name ||
      properties.NAME;

    if (neighborhoodName) {
      window.sectoralFunctionalityData[neighborhoodName] = {};

      // Generate data for each sector
      sectoralColumns.forEach((sectorName) => {
        const sectorData = generateRandomSectoralFunctionality(sectorName);
        window.sectoralFunctionalityData[neighborhoodName][sectorName] =
          sectorData;
      });
    }
  });

  console.log(
    "Generated sectoral functionality data for neighborhoods:",
    Object.keys(window.sectoralFunctionalityData)
  );

  console.log(
    "Generated sectoral functionality data for",
    Object.keys(window.sectoralFunctionalityData).length,
    "neighborhoods"
  );
}

// Function to initialize weights interface
function initializeWeightsInterface() {
  console.log("Initializing weights interface...");

  const weightsGrid = document.getElementById("weightsGrid");
  if (!weightsGrid) return;

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    {
      name: "التدخلات الإنسانية",
      icon: "fas fa-hands-helping",
      color: "#e74c3c",
    },
    { name: "الأسواق الأساسية", icon: "fas fa-store", color: "#3498db" },
    { name: "إدارة النفايات الصلبة", icon: "fas fa-trash", color: "#2ecc71" },
    { name: "شبكة الكهرباء", icon: "fas fa-bolt", color: "#f1c40f" },
    { name: "شبكة الاتصالات", icon: "fas fa-wifi", color: "#9b59b6" },
    { name: "إمدادات المياه", icon: "fas fa-tint", color: "#3498db" },
    { name: "شبكة الصرف الصحي", icon: "fas fa-water", color: "#34495e" },
    { name: "أضرار الإسكان", icon: "fas fa-home", color: "#e74c3c" },
    { name: "النسيج الحضري", icon: "fas fa-city", color: "#95a5a6" },
    { name: "التغيرات السكانية", icon: "fas fa-users", color: "#16a085" },
  ];

  // Initialize weights storage
  if (!window.sectorWeights) {
    window.sectorWeights = {};
    // Set default equal weights
    const defaultWeight = Math.floor(100 / sectoralColumns.length);
    const remainder = 100 - defaultWeight * sectoralColumns.length;

    sectoralColumns.forEach((sector, index) => {
      window.sectorWeights[sector.name] =
        index === 0 ? defaultWeight + remainder : defaultWeight;
    });
  }

  // Create weight input cards
  weightsGrid.innerHTML = sectoralColumns
    .map(
      (sector) => `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 15px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${sector.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <span style="font-size: 13px; font-weight: bold; color: #333; flex: 1;">${
          sector.name
        }</span>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <input
          type="number"
          id="weight-${sector.name.replace(/\s+/g, "-")}"
          min="0"
          max="100"
          value="${window.sectorWeights[sector.name] || 0}"
          style="
            flex: 1;
            padding: 8px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
          "
          onchange="updateWeight('${sector.name}', this.value)"
        />
        <span style="font-size: 12px; color: #6c757d;">%</span>
      </div>
    </div>
  `
    )
    .join("");

  // Update total weight display
  updateTotalWeight();

  // Add event listener for calculate button
  const calculateBtn = document.getElementById("calculateCompositeBtn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateCompositeEfficiency);
  }

  // Add event listener for apply coloring button
  const applyColoringBtn = document.getElementById("applyCompositeColoringBtn");
  if (applyColoringBtn) {
    applyColoringBtn.addEventListener("click", function () {
      console.log("=== APPLY COMPOSITE COLORING BUTTON CLICKED ===");

      // First, show the sectoral mapping container
      const sectoralMappingContainer = document.getElementById(
        "sectoral-mapping-container"
      );
      if (sectoralMappingContainer) {
        console.log("Showing sectoral mapping container...");
        sectoralMappingContainer.style.display = "flex";

        // Hide other containers
        const containers = [
          "popup-content-container",
          "sectoral-functionality-container",
          "composite-functionality-container",
        ];
        containers.forEach((containerId) => {
          const container = document.getElementById(containerId);
          if (container) {
            container.style.display = "none";
          }
        });

        // Now call the function to create the interface
        showCompositeColoringWithSectoralGrid();
      } else {
        console.error("Sectoral mapping container not found!");
      }
    });
  }
}

// Function to initialize final weights interface
function initializeFinalWeightsInterface() {
  console.log("Initializing final weights interface...");

  const weightsGrid = document.getElementById("finalWeightsGrid");
  if (!weightsGrid) return;

  // Final urban effectiveness components (only 2 components)
  const finalComponents = [
    {
      name: "التغيرات السكانية",
      icon: "fas fa-users",
      color: "#16a085",
      description: "التغيرات الديموغرافية والسكانية",
    },
    {
      name: "الفعالية العمرانية المجردة",
      icon: "fas fa-sliders",
      color: "#3498db",
      description: "الفعالية المحسوبة من القطاعات",
    },
  ];

  // Initialize final weights storage
  if (!window.finalWeights) {
    window.finalWeights = {};
    // Set default equal weights (50% each)
    finalComponents.forEach((component) => {
      window.finalWeights[component.name] = 50;
    });
  }

  // Create weight input cards
  weightsGrid.innerHTML = finalComponents
    .map(
      (component) => `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="
          width: 40px;
          height: 40px;
          background: ${component.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        ">
          <i class="${component.icon}"></i>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px;">${
            component.name
          }</div>
          <div style="font-size: 12px; color: #6c757d;">${
            component.description
          }</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <input
          type="number"
          id="final-weight-${component.name.replace(/\s+/g, "-")}"
          min="0"
          max="100"
          value="${window.finalWeights[component.name] || 0}"
          style="
            flex: 1;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 16px;
            text-align: center;
            font-weight: bold;
          "
          onchange="updateFinalWeight('${component.name}', this.value)"
        />
        <span style="font-size: 14px; color: #6c757d; font-weight: bold;">%</span>
      </div>
    </div>
  `
    )
    .join("");

  // Update total weight display
  updateFinalTotalWeight();

  // Add event listener for calculate button
  const calculateBtn = document.getElementById("calculateFinalBtn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateFinalUrbanEffectiveness);
  }

  // Add event listener for apply coloring button
  const applyColoringBtn = document.getElementById("applyFinalColoringBtn");
  if (applyColoringBtn) {
    applyColoringBtn.addEventListener("click", function () {
      applyFinalColoring();
    });
  }
}

// Function to update final weight value
function updateFinalWeight(componentName, value) {
  const numValue = parseInt(value) || 0;
  window.finalWeights[componentName] = Math.max(0, Math.min(100, numValue));
  updateFinalTotalWeight();
}

// Function to update final total weight display
function updateFinalTotalWeight() {
  const totalWeightElement = document.getElementById("finalTotalWeight");
  if (!totalWeightElement || !window.finalWeights) return;

  const total = Object.values(window.finalWeights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  totalWeightElement.textContent = total;

  // Change color based on total
  if (total === 100) {
    totalWeightElement.style.color = "#28a745"; // Green
  } else if (total > 100) {
    totalWeightElement.style.color = "#dc3545"; // Red
  } else {
    totalWeightElement.style.color = "#ffc107"; // Yellow
  }
}

// Function to update weight value
function updateWeight(sectorName, value) {
  const numValue = parseInt(value) || 0;
  window.sectorWeights[sectorName] = Math.max(0, Math.min(100, numValue));
  updateTotalWeight();
}

// Function to update total weight display
function updateTotalWeight() {
  const totalWeightElement = document.getElementById("totalWeight");
  if (!totalWeightElement || !window.sectorWeights) return;

  const total = Object.values(window.sectorWeights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  totalWeightElement.textContent = total;

  // Change color based on total
  if (total === 100) {
    totalWeightElement.style.color = "#28a745"; // Green
  } else if (total > 100) {
    totalWeightElement.style.color = "#dc3545"; // Red
  } else {
    totalWeightElement.style.color = "#ffc107"; // Yellow
  }
}

// Function to calculate final urban effectiveness
function calculateFinalUrbanEffectiveness() {
  console.log("Calculating final urban effectiveness...");

  // Check if weights sum to 100
  const totalWeight = Object.values(window.finalWeights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  if (totalWeight !== 100) {
    alert(`مجموع الأوزان يجب أن يساوي 100. المجموع الحالي: ${totalWeight}`);
    return;
  }

  // Ensure we have both required data sources
  let populationChangesData = {};
  let abstractUrbanEffectivenessData = {};

  // Get population changes data from sectoral functionality data
  if (window.sectoralFunctionalityData) {
    Object.keys(window.sectoralFunctionalityData).forEach(
      (neighborhoodName) => {
        const sectorData =
          window.sectoralFunctionalityData[neighborhoodName][
            "التغيرات السكانية"
          ];
        if (sectorData) {
          populationChangesData[neighborhoodName] = sectorData.percentage;
        }
      }
    );
  }

  // Get abstract urban effectiveness data from composite efficiency data
  if (window.compositeEfficiencyData) {
    Object.keys(window.compositeEfficiencyData).forEach((neighborhoodName) => {
      abstractUrbanEffectivenessData[neighborhoodName] =
        window.compositeEfficiencyData[neighborhoodName].value;
    });
  }

  // Check if we have data for both components
  if (Object.keys(populationChangesData).length === 0) {
    alert(
      "لا توجد بيانات للتغيرات السكانية. يرجى تحديث البيانات القطاعية أولاً."
    );
    return;
  }

  if (Object.keys(abstractUrbanEffectivenessData).length === 0) {
    alert(
      "لا توجد بيانات للفعالية العمرانية المجردة. يرجى حساب الفعالية المركبة أولاً."
    );
    return;
  }

  // Calculate final urban effectiveness for each neighborhood
  window.finalUrbanEffectivenessData = {};

  // Get all neighborhoods that have both data types
  const allNeighborhoods = new Set([
    ...Object.keys(populationChangesData),
    ...Object.keys(abstractUrbanEffectivenessData),
  ]);

  allNeighborhoods.forEach((neighborhoodName) => {
    const populationValue = populationChangesData[neighborhoodName] || 0;
    const abstractValue = abstractUrbanEffectivenessData[neighborhoodName] || 0;

    // Calculate weighted final effectiveness
    const populationWeight = window.finalWeights["التغيرات السكانية"] || 0;
    const abstractWeight =
      window.finalWeights["الفعالية العمرانية المجردة"] || 0;

    const finalValue =
      (populationValue * populationWeight) / 100 +
      (abstractValue * abstractWeight) / 100;

    // Determine status based on final value
    let status = "";
    if (finalValue >= 80) {
      status = "ممتاز";
    } else if (finalValue >= 65) {
      status = "جيد";
    } else if (finalValue >= 50) {
      status = "متوسط";
    } else if (finalValue >= 30) {
      status = "ضعيف";
    } else {
      status = "سيء";
    }

    window.finalUrbanEffectivenessData[neighborhoodName] = {
      value: Math.round(finalValue * 100) / 100, // Round to 2 decimal places
      status: status,
      color: getFinalColor(finalValue),
      populationComponent: populationValue,
      abstractComponent: abstractValue,
    };
  });

  // Populate results table
  populateFinalResultsTable();

  // Show results section
  const resultsSection = document.getElementById("finalResultsSection");
  if (resultsSection) {
    resultsSection.style.display = "block";
  }

  showNotification("تم حساب الفعالية العمرانية النهائية بنجاح", "success");
}

// Function to get color for final urban effectiveness value
function getFinalColor(value) {
  if (value >= 80) {
    return "#0d47a1"; // Dark blue - Excellent
  } else if (value >= 65) {
    return "#1976d2"; // Medium dark blue - Good
  } else if (value >= 50) {
    return "#42a5f5"; // Medium blue - Average
  } else if (value >= 30) {
    return "#90caf9"; // Light blue - Poor
  } else {
    return "#e3f2fd"; // Very light blue - Bad
  }
}

// Function to populate final results table
function populateFinalResultsTable() {
  const tableBody = document.querySelector("#final-results-table tbody");
  if (!tableBody || !window.finalUrbanEffectivenessData) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Sort neighborhoods by final value (descending)
  const sortedNeighborhoods = Object.keys(
    window.finalUrbanEffectivenessData
  ).sort((a, b) => {
    return (
      window.finalUrbanEffectivenessData[b].value -
      window.finalUrbanEffectivenessData[a].value
    );
  });

  // Create table rows
  sortedNeighborhoods.forEach((neighborhoodName) => {
    const data = window.finalUrbanEffectivenessData[neighborhoodName];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">${neighborhoodName}</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center; font-weight: bold; color: ${
        data.color
      };">${data.value.toFixed(1)}%</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <span style="
          background: ${data.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        ">${data.status}</span>
      </td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <div style="
          width: 30px;
          height: 20px;
          background: ${data.color};
          border-radius: 4px;
          margin: 0 auto;
          border: 1px solid #ddd;
        "></div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  console.log(
    "Populated final results table with",
    sortedNeighborhoods.length,
    "neighborhoods"
  );
}

// Function to apply final coloring to the map
function applyFinalColoring() {
  console.log("Applying final urban effectiveness coloring...");

  // Check if we have final data
  if (
    !window.finalUrbanEffectivenessData ||
    Object.keys(window.finalUrbanEffectivenessData).length === 0
  ) {
    alert(
      "لا توجد بيانات للفعالية النهائية. يرجى حساب الفعالية النهائية أولاً."
    );
    return;
  }

  // Check if neighborhoods layer exists
  if (!window.neighborhoodsLayer) {
    alert("طبقة الأحياء غير متوفرة");
    return;
  }

  // Apply coloring to neighborhoods layer
  window.neighborhoodsLayer.eachLayer(function (layer) {
    if (layer.feature && layer.feature.properties) {
      const props = layer.feature.properties;
      const neighborhoodName =
        props.Names || props.Name_En || props.name || props.NAME;

      if (
        neighborhoodName &&
        window.finalUrbanEffectivenessData[neighborhoodName]
      ) {
        const finalData = window.finalUrbanEffectivenessData[neighborhoodName];

        // Apply the color
        layer.setStyle({
          fillColor: finalData.color,
          weight: 1,
          opacity: 1,
          color: "#ffffff",
          fillOpacity: 0.8,
        });

        // Update popup with final effectiveness information
        const popupContent = `
          <div style="text-align: center; padding: 15px; min-width: 250px; font-family: 'Cairo', sans-serif;">
            <h5 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">
              ${neighborhoodName}
            </h5>
            <div style="margin: 15px 0;">
              <div style="font-size: 28px; font-weight: bold; margin: 15px 0; color: ${
                finalData.color
              };">
                ${finalData.value.toFixed(1)}%
              </div>
              <div style="
                padding: 8px 15px;
                background: ${finalData.color};
                border-radius: 20px;
                color: white;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 15px;
              ">
                ${finalData.status}
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">تفاصيل المكونات:</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6c757d;">التغيرات السكانية:</span>
                <span style="font-weight: bold; color: #16a085;">${finalData.populationComponent.toFixed(
                  1
                )}%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6c757d;">الفعالية المجردة:</span>
                <span style="font-weight: bold; color: #3498db;">${finalData.abstractComponent.toFixed(
                  1
                )}%</span>
              </div>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: #6c757d;">
              الفعالية العمرانية النهائية
            </div>
          </div>
        `;

        layer.bindPopup(popupContent, {
          maxWidth: 300,
          className: "final-effectiveness-popup",
        });
      } else {
        // Reset to default style if no data
        layer.setStyle({
          fillColor: "#e9ecef",
          weight: 1,
          opacity: 1,
          color: "#ffffff",
          fillOpacity: 0.5,
        });
      }
    }
  });

  // Show success notification
  showNotification(
    "تم تطبيق تلوين الفعالية العمرانية النهائية على الخريطة",
    "success"
  );

  // Hide the popup after applying coloring
  setTimeout(() => {
    hideFullscreenPopup();
  }, 1500);
}

// Function to calculate composite efficiency
function calculateCompositeEfficiency() {
  console.log("Calculating composite efficiency...");

  // Check if weights sum to 100
  const totalWeight = Object.values(window.sectorWeights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  if (totalWeight !== 100) {
    alert(`مجموع الأوزان يجب أن يساوي 100. المجموع الحالي: ${totalWeight}`);
    return;
  }

  // Check if sectoral data exists
  if (
    !window.sectoralFunctionalityData ||
    Object.keys(window.sectoralFunctionalityData).length === 0
  ) {
    alert("يرجى تحديث الفعالية القطاعية أولاً من الواجهة الأخرى");
    return;
  }

  // Calculate composite efficiency for each neighborhood
  window.compositeEfficiencyData = {};

  Object.keys(window.sectoralFunctionalityData).forEach((neighborhoodName) => {
    let compositeValue = 0;

    // Calculate weighted sum: ∑(sector functionality × weight)
    Object.keys(window.sectorWeights).forEach((sectorName) => {
      const sectorData =
        window.sectoralFunctionalityData[neighborhoodName][sectorName];
      const weight = window.sectorWeights[sectorName];

      if (sectorData && typeof sectorData.percentage !== "undefined") {
        compositeValue += (sectorData.percentage * weight) / 100;
      }
    });

    // Determine status based on composite value
    let status = "";
    if (compositeValue >= 80) {
      status = "ممتاز";
    } else if (compositeValue >= 65) {
      status = "جيد";
    } else if (compositeValue >= 50) {
      status = "متوسط";
    } else if (compositeValue >= 30) {
      status = "ضعيف";
    } else {
      status = "سيء";
    }

    window.compositeEfficiencyData[neighborhoodName] = {
      value: Math.round(compositeValue * 100) / 100, // Round to 2 decimal places
      status: status,
      color: getCompositeColor(compositeValue),
    };
  });

  // Populate results table
  populateCompositeResultsTable();

  // Show results section
  const resultsSection = document.getElementById("compositeResultsSection");
  if (resultsSection) {
    resultsSection.style.display = "block";
  }

  showNotification("تم حساب الفعالية المركبة بنجاح", "success");
}

// Function to get color for composite efficiency value
function getCompositeColor(value) {
  if (value >= 80) {
    return "#0d47a1"; // Dark blue - Excellent
  } else if (value >= 65) {
    return "#1976d2"; // Medium dark blue - Good
  } else if (value >= 50) {
    return "#42a5f5"; // Medium blue - Average
  } else if (value >= 30) {
    return "#90caf9"; // Light blue - Poor
  } else {
    return "#e3f2fd"; // Very light blue - Bad
  }
}

// Function to populate composite results table
function populateCompositeResultsTable() {
  const tableBody = document.querySelector("#composite-results-table tbody");
  if (!tableBody || !window.compositeEfficiencyData) return;

  // Clear existing rows
  tableBody.innerHTML = "";

  // Sort neighborhoods by composite value (descending)
  const sortedNeighborhoods = Object.keys(window.compositeEfficiencyData).sort(
    (a, b) => {
      return (
        window.compositeEfficiencyData[b].value -
        window.compositeEfficiencyData[a].value
      );
    }
  );

  // Create table rows
  sortedNeighborhoods.forEach((neighborhoodName) => {
    const data = window.compositeEfficiencyData[neighborhoodName];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">${neighborhoodName}</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center; font-weight: bold; color: ${
        data.color
      };">${data.value.toFixed(1)}%</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <span style="
          background: ${data.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        ">${data.status}</span>
      </td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <div style="
          width: 30px;
          height: 20px;
          background: ${data.color};
          border-radius: 4px;
          margin: 0 auto;
          border: 1px solid #ddd;
        "></div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  console.log(
    "Populated composite results table with",
    sortedNeighborhoods.length,
    "neighborhoods"
  );
}

// Function to debug neighborhood data matching
function debugNeighborhoodDataMatching() {
  console.log("=== NEIGHBORHOOD DATA MATCHING DEBUG ===");

  // Check map data
  let mapNeighborhoods = [];
  if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
    mapNeighborhoods = neighborhoodsData.features
      .map((feature) => {
        const props = feature.properties;
        return props.Names || props.Name_En || props.name || props.NAME;
      })
      .filter((name) => name);
    console.log("Map neighborhoods:", mapNeighborhoods);
  } else {
    console.log("No neighborhoodsData available");
  }

  // Check sectoral data
  if (window.sectoralFunctionalityData) {
    const dataNeighborhoods = Object.keys(window.sectoralFunctionalityData);
    console.log("Sectoral data neighborhoods:", dataNeighborhoods);

    // Check for matches
    const matches = [];
    const mismatches = [];

    mapNeighborhoods.forEach((mapName) => {
      const normalizedMapName = normalizeNeighborhoodName(mapName);
      let found = false;

      for (const dataName of dataNeighborhoods) {
        if (normalizeNeighborhoodName(dataName) === normalizedMapName) {
          matches.push({ map: mapName, data: dataName });
          found = true;
          break;
        }
      }

      if (!found) {
        mismatches.push(mapName);
      }
    });

    console.log("Matches found:", matches);
    console.log("Mismatches:", mismatches);
  } else {
    console.log("No sectoralFunctionalityData available");
  }

  console.log("=== END DEBUG ===");
}

// Function to show composite coloring using sectoral grid interface
function showCompositeColoringWithSectoralGrid() {
  console.log("Showing composite coloring with sectoral grid interface...");

  // First, try to populate sectoral functionality data
  populateSectoralFunctionalityTable();

  // Wait a bit for data to be populated
  setTimeout(() => {
    if (
      window.sectoralFunctionalityData &&
      Object.keys(window.sectoralFunctionalityData).length > 0
    ) {
      // Calculate composite efficiency
      calculateCompositeEfficiencyFromSectoralData();

      // Show the sectoral mapping grid with composite coloring option
      const grid = document.getElementById("sectoralMappingGrid");
      if (grid) {
        // Clear existing content
        grid.innerHTML = "";

        // Create a simple composite interface directly
        createSimpleCompositeInterface(grid);

        // Show notification about the interface
        showNotification(
          "تم إنشاء واجهة التلوين المركب. يمكنك الآن تطبيق التلوين على الخريطة.",
          "info"
        );
      }
    } else {
      // Show the regular sectoral mapping grid as fallback
      populateSectoralMappingGrid();
      showNotification(
        "يرجى استخدام الأزرار أدناه لتطبيق التلوين القطاعي أولاً",
        "info"
      );
    }
  }, 1000);
}

// Function to create simple composite interface
function createSimpleCompositeInterface(grid) {
  console.log("Creating simple composite interface...");

  // Set grid style
  grid.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  `;

  // Create main composite card with mini map
  const compositeCard = document.createElement("div");
  compositeCard.style.cssText = `
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(220,53,69,0.3);
    text-align: center;
  `;

  compositeCard.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; font-size: 24px;">الفعالية العمرانية المركبة</h3>
      <p style="margin: 0; opacity: 0.9;">تلوين شامل بتدريجات اللون الأحمر</p>
    </div>

    <div id="simpleMiniMapContainer" style="
      background: white;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 20px;
      color: #333;
    ">
      <h4 style="margin: 0 0 10px 0;">معاينة الخريطة</h4>
      <div id="simpleMiniMap" style="
        height: 300px;
        background: #f8f9fa;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        position: relative;
      ">
        <div>
          <i class="fas fa-map-marked-alt" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
          <div>جاري تحميل الخريطة المصغرة...</div>
          <button onclick="loadSimpleMiniMap()" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            margin-top: 10px;
            cursor: pointer;
          ">
            تحميل الخريطة
          </button>
        </div>
      </div>
    </div>

    <button onclick="tryApplyCompositeColoring()" style="
      background: white;
      color: #dc3545;
      border: none;
      padding: 15px 40px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    ">
      <i class="fas fa-paint-brush"></i> تطبيق التلوين على الخريطة الرئيسية
    </button>
  `;

  grid.appendChild(compositeCard);

  // Try to load the mini map automatically
  setTimeout(() => {
    loadSimpleMiniMap();
  }, 1000);
}

// Function to load simple mini map
function loadSimpleMiniMap() {
  console.log("Loading simple mini map...");

  const miniMapContainer = document.getElementById("simpleMiniMap");
  if (!miniMapContainer) {
    console.error("Simple mini map container not found");
    return;
  }

  // Clear the container
  miniMapContainer.innerHTML = "";

  // Check if we have neighborhoods data
  if (typeof neighborhoodsData === "undefined" || !neighborhoodsData.features) {
    miniMapContainer.innerHTML = `
      <div style="color: #dc3545;">
        <i class="fas fa-exclamation-triangle"></i><br>
        بيانات الأحياء غير متوفرة
      </div>
    `;
    return;
  }

  // Ensure we have composite data
  if (
    !window.compositeEfficiencyData ||
    Object.keys(window.compositeEfficiencyData).length === 0
  ) {
    console.log("Calculating composite data...");
    if (
      window.sectoralFunctionalityData &&
      Object.keys(window.sectoralFunctionalityData).length > 0
    ) {
      calculateCompositeEfficiencyFromSectoralData();
    }
  }

  try {
    // Create mini map
    const miniMap = L.map(miniMapContainer, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    // Add base layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution: "",
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(miniMap);

    // Function to get red gradient color
    function getRedColor(value) {
      if (value >= 80) return "#8B0000";
      else if (value >= 65) return "#DC143C";
      else if (value >= 50) return "#FF6347";
      else if (value >= 30) return "#FFA07A";
      else return "#FFE4E1";
    }

    // Create neighborhoods layer
    const miniNeighborhoodsLayer = L.geoJSON(neighborhoodsData, {
      style: function (feature) {
        const props = feature.properties;
        const neighborhoodName =
          props.Names || props.Name_En || props.name || props.NAME;

        let fillColor = "#e9ecef";

        if (window.compositeEfficiencyData && neighborhoodName) {
          const dataNames = Object.keys(window.compositeEfficiencyData);
          const matchingDataName = findMatchingNeighborhoodName(
            neighborhoodName,
            dataNames
          );

          if (
            matchingDataName &&
            window.compositeEfficiencyData[matchingDataName]
          ) {
            const compositeValue =
              window.compositeEfficiencyData[matchingDataName].value;
            fillColor = getRedColor(compositeValue);
          }
        }

        return {
          fillColor: fillColor,
          weight: 1,
          opacity: 1,
          color: "#ffffff",
          fillOpacity: 0.8,
        };
      },
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        const neighborhoodName =
          props.Names || props.Name_En || props.name || props.NAME;

        if (neighborhoodName && window.compositeEfficiencyData) {
          const dataNames = Object.keys(window.compositeEfficiencyData);
          const matchingDataName = findMatchingNeighborhoodName(
            neighborhoodName,
            dataNames
          );

          if (
            matchingDataName &&
            window.compositeEfficiencyData[matchingDataName]
          ) {
            const compositeData =
              window.compositeEfficiencyData[matchingDataName];

            // Function to get status text based on value
            function getStatusText(value) {
              if (value >= 80) return "ممتاز";
              else if (value >= 65) return "جيد";
              else if (value >= 50) return "متوسط";
              else if (value >= 30) return "ضعيف";
              else return "سيء";
            }

            const popupContent = `
              <div style="text-align: center; padding: 10px; min-width: 200px;">
                <h5 style="margin: 0 0 10px 0; color: #333; font-size: 16px; border-bottom: 2px solid #dee2e6; padding-bottom: 8px;">
                  ${neighborhoodName}
                </h5>
                <div style="margin: 10px 0;">
                  <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: ${getRedColor(
                    compositeData.value
                  )};">
                    ${compositeData.value.toFixed(1)}%
                  </div>
                  <div style="
                    padding: 6px 12px;
                    background: ${getRedColor(compositeData.value)};
                    border-radius: 15px;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    display: inline-block;
                  ">
                    ${getStatusText(compositeData.value)}
                  </div>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #6c757d;">
                  الفعالية العمرانية المجردة                </div>
              </div>
            `;

            layer.bindPopup(popupContent, {
              maxWidth: 250,
              className: "mini-map-popup",
            });

            // Add hover effects
            layer.on("mouseover", function (e) {
              this.setStyle({
                weight: 3,
                color: "#333",
                fillOpacity: 0.9,
              });
            });

            layer.on("mouseout", function (e) {
              this.setStyle({
                weight: 1,
                color: "#ffffff",
                fillOpacity: 0.8,
              });
            });
          }
        }
      },
    });

    miniNeighborhoodsLayer.addTo(miniMap);

    // Fit bounds
    if (miniNeighborhoodsLayer.getBounds().isValid()) {
      miniMap.fitBounds(miniNeighborhoodsLayer.getBounds(), {
        padding: [10, 10],
      });
    }

    // Add legend for red gradient colors
    const legendContainer = document.createElement("div");
    legendContainer.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(255,255,255,0.95);
      padding: 12px;
      border-radius: 8px;
      font-size: 11px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      border: 1px solid #dee2e6;
      z-index: 1000;
      min-width: 140px;
    `;

    legendContainer.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #333; text-align: center; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">
        مفتاح الألوان
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #8B0000; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">ممتاز (80%+)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #DC143C; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">جيد (65-79%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #FF6347; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">متوسط (50-64%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #FFA07A; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">ضعيف (30-49%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #FFE4E1; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">سيء (أقل من 30%)</span>
        </div>
      </div>
      <div style="margin-top: 6px; text-align: center; font-size: 9px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 4px;">
        اضغط على الأحياء للتفاصيل
      </div>
    `;

    miniMapContainer.appendChild(legendContainer);

    console.log("Simple mini map loaded successfully");
    showNotification("تم تحميل الخريطة المصغرة بنجاح!", "success");
  } catch (error) {
    console.error("Error creating mini map:", error);
    miniMapContainer.innerHTML = `
      <div style="color: #dc3545;">
        <i class="fas fa-exclamation-triangle"></i><br>
        خطأ في تحميل الخريطة<br>
        <button onclick="loadSimpleMiniMap()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          margin-top: 5px;
          cursor: pointer;
        ">
          إعادة المحاولة
        </button>
      </div>
    `;
  }
}

// Function to create composite coloring interface
function createCompositeColoringInterface(grid) {
  console.log("Creating composite coloring interface...");

  // Set grid style
  grid.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  `;

  // Create main composite coloring card
  const compositeCard = document.createElement("div");
  compositeCard.style.cssText = `
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(0,123,255,0.3);
    text-align: center;
    position: relative;
    overflow: hidden;
  `;

  compositeCard.innerHTML = `
    <div style="position: relative; z-index: 2;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
        <div style="
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">
          <i class="fas fa-layer-group"></i>
        </div>
        <div>
          <h3 style="margin: 0; font-size: 24px; font-weight: bold;">الفعالية العمرانية المركبة</h3>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">تلوين شامل يجمع جميع القطاعات</p>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">
          يتم حساب الفعالية المركبة من خلال دمج جميع القطاعات الـ13 بأوزان متساوية لإعطاء تقييم شامل لكل حي
        </p>
      </div>

      <!-- Mini Map Container -->
      <div id="compositeMiniMapContainer" style="
        background: white;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      ">
        <div style="text-align: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #333; font-size: 16px;">معاينة التلوين المركب</h4>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">خريطة مصغرة بتدريجات اللون الأحمر</p>
          <button onclick="createCompositeMiniMap()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            cursor: pointer;
            margin-top: 5px;
          ">
            <i class="fas fa-redo"></i> إعادة تحميل الخريطة
          </button>
        </div>
        <div id="compositeMiniMap" style="
          height: 200px;
          border-radius: 8px;
          border: 2px solid #dee2e6;
          position: relative;
          overflow: hidden;
        "></div>
      </div>

      <button onclick="tryApplyCompositeColoring()" style="
        background: white;
        color: #007bff;
        border: none;
        padding: 15px 40px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-paint-brush"></i> تطبيق التلوين على الخريطة الرئيسية
      </button>
    </div>

    <div style="
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    "></div>
  `;

  grid.appendChild(compositeCard);

  // Create the mini map after adding the card to DOM
  setTimeout(() => {
    createCompositeMiniMap();
  }, 500);

  // Create sectoral options grid
  const sectoralGrid = document.createElement("div");
  sectoralGrid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  `;

  // Add a separator
  const separator = document.createElement("div");
  separator.style.cssText = `
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #dee2e6 50%, transparent 100%);
    margin: 20px 0;
  `;
  grid.appendChild(separator);

  // Add title for sectoral options
  const sectoralTitle = document.createElement("div");
  sectoralTitle.style.cssText = `
    text-align: center;
    margin-bottom: 20px;
  `;
  sectoralTitle.innerHTML = `
    <h4 style="margin: 0; color: #495057; font-size: 18px;">
      <i class="fas fa-th-large"></i> أو اختر تلوين قطاعي محدد
    </h4>
    <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
      يمكنك تطبيق التلوين لقطاع واحد فقط
    </p>
  `;
  grid.appendChild(sectoralTitle);

  // Add sectoral options (create them manually instead of using populateSectoralMappingGrid)
  createSectoralOptionsForComposite(grid);
}

// Function to create sectoral options for composite interface
function createSectoralOptionsForComposite(parentGrid) {
  console.log("Creating sectoral options for composite interface...");

  // Create a container for sectoral options
  const sectoralContainer = document.createElement("div");
  sectoralContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  `;

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    {
      name: "التدخلات الإنسانية",
      icon: "fas fa-hands-helping",
      description: "تقييم التدخلات الإنسانية والمساعدات",
    },
    {
      name: "الأسواق الأساسية",
      icon: "fas fa-store",
      description: "حالة الأسواق والمحلات التجارية",
    },
    {
      name: "إدارة النفايات الصلبة",
      icon: "fas fa-trash",
      description: "نظافة الحي وإدارة النفايات",
    },
    {
      name: "شبكة الكهرباء",
      icon: "fas fa-bolt",
      description: "شبكة الكهرباء والتغذية",
    },
    {
      name: "شبكة الاتصالات",
      icon: "fas fa-wifi",
      description: "شبكات الاتصالات والإنترنت",
    },
    {
      name: "إمدادات المياه",
      icon: "fas fa-tint",
      description: "شبكة المياه والتوزيع",
    },
    {
      name: "شبكة الصرف الصحي",
      icon: "fas fa-water",
      description: "شبكة الصرف الصحي",
    },
    {
      name: "أضرار الإسكان",
      icon: "fas fa-home",
      description: "حالة المباني والإسكان",
    },
    {
      name: "النسيج الحضري",
      icon: "fas fa-city",
      description: "التخطيط العمراني والنسيج",
    },
    {
      name: "التغيرات السكانية",
      icon: "fas fa-users",
      description: "التغيرات في عدد السكان",
    },
  ];

  // Create cards for each sector
  sectoralColumns.forEach((sector) => {
    const card = document.createElement("div");
    card.className = "sectoral-mapping-card";
    card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${sector.name}</h4>
          <p style="margin: 0; color: #6c757d; font-size: 12px;">${sector.description}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: center;">
        <button onclick="applySectoralColoring('${sector.name}')" style="
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        ">
          <i class="fas fa-paint-brush"></i> تطبيق التلوين
        </button>
      </div>
    `;

    // Add hover effects
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    });

    sectoralContainer.appendChild(card);
  });

  parentGrid.appendChild(sectoralContainer);
  console.log("Sectoral options created for composite interface");
}

// Function to create composite mini map with red gradient
function createCompositeMiniMap() {
  console.log("Creating composite mini map...");

  const miniMapContainer = document.getElementById("compositeMiniMap");
  if (!miniMapContainer) {
    console.warn("Mini map container not found, retrying...");
    // Try again after a longer delay
    setTimeout(() => {
      const retryContainer = document.getElementById("compositeMiniMap");
      if (retryContainer) {
        console.log("Found mini map container on retry");
        createCompositeMiniMapInternal(retryContainer);
      } else {
        console.error("Mini map container still not found after retry");
      }
    }, 1000);
    return;
  }

  createCompositeMiniMapInternal(miniMapContainer);
}

// Internal function to create the mini map
function createCompositeMiniMapInternal(miniMapContainer) {
  console.log("Creating composite mini map internal...");

  // Clear any existing content
  miniMapContainer.innerHTML = "";

  // Check if we have neighborhoods data
  if (typeof neighborhoodsData === "undefined" || !neighborhoodsData.features) {
    miniMapContainer.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #6c757d;
        font-size: 14px;
      ">
        <i class="fas fa-map-marked-alt" style="margin-right: 8px;"></i>
        جاري تحميل بيانات الخريطة...
      </div>
    `;
    return;
  }

  // Ensure we have composite data
  if (
    !window.compositeEfficiencyData ||
    Object.keys(window.compositeEfficiencyData).length === 0
  ) {
    console.log("No composite data available, calculating...");
    if (
      window.sectoralFunctionalityData &&
      Object.keys(window.sectoralFunctionalityData).length > 0
    ) {
      calculateCompositeEfficiencyFromSectoralData();
    }
  }

  // Create mini map
  const miniMap = L.map(miniMapContainer, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
  });

  // Add base layer (simple gray background)
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: "",
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(miniMap);

  // Function to get red gradient color based on composite value
  function getRedGradientColor(value) {
    if (value >= 80) {
      return "#8B0000"; // Dark red - excellent
    } else if (value >= 65) {
      return "#DC143C"; // Crimson - good
    } else if (value >= 50) {
      return "#FF6347"; // Tomato - average
    } else if (value >= 30) {
      return "#FFA07A"; // Light salmon - poor
    } else {
      return "#FFE4E1"; // Misty rose - very poor
    }
  }

  // Create neighborhoods layer with composite coloring
  const miniNeighborhoodsLayer = L.geoJSON(neighborhoodsData, {
    style: function (feature) {
      const props = feature.properties;
      const neighborhoodName =
        props.Names || props.Name_En || props.name || props.NAME;

      let fillColor = "#e9ecef"; // Default gray
      let fillOpacity = 0.7;

      // Try to find composite data for this neighborhood
      if (window.compositeEfficiencyData && neighborhoodName) {
        const dataNames = Object.keys(window.compositeEfficiencyData);
        const matchingDataName = findMatchingNeighborhoodName(
          neighborhoodName,
          dataNames
        );

        if (
          matchingDataName &&
          window.compositeEfficiencyData[matchingDataName]
        ) {
          const compositeValue =
            window.compositeEfficiencyData[matchingDataName].value;
          fillColor = getRedGradientColor(compositeValue);
          fillOpacity = 0.8;
        }
      }

      return {
        fillColor: fillColor,
        weight: 1,
        opacity: 1,
        color: "#ffffff",
        fillOpacity: fillOpacity,
      };
    },
    onEachFeature: function (feature, layer) {
      const props = feature.properties;
      const neighborhoodName =
        props.Names || props.Name_En || props.name || props.NAME;

      if (neighborhoodName && window.compositeEfficiencyData) {
        const dataNames = Object.keys(window.compositeEfficiencyData);
        const matchingDataName = findMatchingNeighborhoodName(
          neighborhoodName,
          dataNames
        );

        if (
          matchingDataName &&
          window.compositeEfficiencyData[matchingDataName]
        ) {
          const compositeData =
            window.compositeEfficiencyData[matchingDataName];

          const popupContent = `
            <div style="text-align: center; padding: 8px;">
              <h5 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${neighborhoodName}</h5>
              <div style="font-size: 16px; font-weight: bold; margin: 8px 0; color: #333;">
                ${compositeData.value.toFixed(1)}%
              </div>
              <div style="padding: 4px 8px; background: ${getRedGradientColor(
                compositeData.value
              )}; border-radius: 10px; color: white; font-size: 11px;">
                ${compositeData.status}
              </div>
            </div>
          `;

          layer.bindPopup(popupContent);
        }
      }
    },
  });

  miniNeighborhoodsLayer.addTo(miniMap);

  // Fit bounds to show all neighborhoods
  if (miniNeighborhoodsLayer.getBounds().isValid()) {
    miniMap.fitBounds(miniNeighborhoodsLayer.getBounds(), {
      padding: [5, 5],
    });
  }

  // Add red gradient legend
  const legendContainer = document.createElement("div");
  legendContainer.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(255,255,255,0.9);
    padding: 8px;
    border-radius: 6px;
    font-size: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
  `;

  legendContainer.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px; color: #333;">الفعالية المركبة</div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #8B0000; border-radius: 2px;"></div>
      <span>ممتاز (80%+)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #DC143C; border-radius: 2px;"></div>
      <span>جيد (65-79%)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #FF6347; border-radius: 2px;"></div>
      <span>متوسط (50-64%)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #FFA07A; border-radius: 2px;"></div>
      <span>ضعيف (30-49%)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px;">
      <div style="width: 12px; height: 12px; background: #FFE4E1; border-radius: 2px;"></div>
      <span>سيء (أقل من 30%)</span>
    </div>
  `;

  miniMapContainer.appendChild(legendContainer);

  console.log("Composite mini map created successfully");
}

// Test function to create mini map
function testCreateMiniMap() {
  console.log("Test: Creating mini map...");

  // First, let's create a simple div to test
  const testContainer = document.createElement("div");
  testContainer.id = "testMiniMap";
  testContainer.style.cssText = `
    height: 200px;
    background: #f8f9fa;
    border: 2px solid #007bff;
    border-radius: 8px;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007bff;
    font-weight: bold;
  `;
  testContainer.innerHTML = "خريطة مصغرة اختبارية - تم الإنشاء بنجاح!";

  // Find the grid and add the test container
  const grid = document.getElementById("sectoralMappingGrid");
  if (grid) {
    grid.appendChild(testContainer);
    showNotification("تم إنشاء خريطة اختبارية بنجاح!", "success");
  } else {
    console.error("Grid not found");
    showNotification("لم يتم العثور على الشبكة", "error");
  }
}

// Function to try applying composite coloring with better error handling
function tryApplyCompositeColoring() {
  console.log("Trying to apply composite coloring...");

  // Check if we have the necessary data
  if (
    !window.compositeEfficiencyData ||
    Object.keys(window.compositeEfficiencyData).length === 0
  ) {
    showNotification("جاري حساب البيانات المركبة...", "info");

    // Try to calculate composite data
    if (
      window.sectoralFunctionalityData &&
      Object.keys(window.sectoralFunctionalityData).length > 0
    ) {
      calculateCompositeEfficiencyFromSectoralData();
    }

    // Wait and try again
    setTimeout(() => {
      if (
        window.compositeEfficiencyData &&
        Object.keys(window.compositeEfficiencyData).length > 0
      ) {
        applyCompositeColoringFromData();
      } else {
        showNotification(
          "لم يتم العثور على بيانات كافية. يرجى المحاولة مرة أخرى.",
          "warning"
        );
      }
    }, 500);
  } else {
    // We have composite data, try to apply it
    applyCompositeColoringFromData();
  }
}

// Function to apply composite coloring to neighborhoods
function applyCompositeColoring() {
  console.log("Applying composite coloring to neighborhoods...");

  // Debug current data state
  debugNeighborhoodDataMatching();

  // Check if composite data exists, if not try to calculate it from sectoral data
  if (
    !window.compositeEfficiencyData ||
    Object.keys(window.compositeEfficiencyData).length === 0
  ) {
    console.log(
      "No composite data found, trying to calculate from sectoral data..."
    );

    // Try to calculate composite efficiency from sectoral data
    if (
      window.sectoralFunctionalityData &&
      Object.keys(window.sectoralFunctionalityData).length > 0
    ) {
      console.log("Calculating composite efficiency from sectoral data...");
      calculateCompositeEfficiencyFromSectoralData();

      // Check again if we now have composite data
      if (
        !window.compositeEfficiencyData ||
        Object.keys(window.compositeEfficiencyData).length === 0
      ) {
        showNotification(
          "فشل في حساب الفعالية المركبة من البيانات القطاعية",
          "error"
        );
        return;
      }
    } else {
      // Instead of showing error, use the sectoral mapping grid interface
      console.log(
        "No sectoral data found, showing sectoral mapping interface..."
      );
      showCompositeColoringWithSectoralGrid();
      return;
    }
  }

  // Show the blue gradient legend
  const legend = document.getElementById("blueGradientLegend");
  if (legend) {
    legend.style.display = "block";
  }

  // Try to find neighborhoods layer
  let neighborhoodsLayer = findNeighborhoodsLayer();

  // If layer not found, try alternative approach using sectoral data
  if (!neighborhoodsLayer) {
    console.log(
      "Neighborhoods layer not found, trying alternative approach..."
    );

    // Check if we have sectoral functionality data with neighborhood names
    if (
      window.sectoralFunctionalityData &&
      Object.keys(window.sectoralFunctionalityData).length > 0
    ) {
      console.log(
        "Using sectoral functionality data to apply composite coloring..."
      );
      applyCompositeColoringFromData();
      return;
    }

    // Last resort: wait and try again
    setTimeout(() => {
      neighborhoodsLayer = findNeighborhoodsLayer();
      if (neighborhoodsLayer) {
        applyCompositeColoringToLayer(neighborhoodsLayer);
      } else {
        console.warn("Neighborhoods layer still not found after retry");
        showNotification(
          "لم يتم العثور على طبقة الأحياء. تأكد من تحميل الخريطة بالكامل.",
          "warning"
        );
      }
    }, 1000);
    return;
  }

  applyCompositeColoringToLayer(neighborhoodsLayer);
}

// Function to calculate composite efficiency from sectoral data
function calculateCompositeEfficiencyFromSectoralData() {
  console.log("Calculating composite efficiency from sectoral data...");

  if (!window.sectoralFunctionalityData) {
    console.warn("No sectoral functionality data available");
    return;
  }

  // Initialize composite efficiency data
  window.compositeEfficiencyData = {};

  // Default weights (equal weights for all sectors - 10 columns)
  const defaultWeights = {
    "التدخلات الإنسانية": 10,
    "الأسواق الأساسية": 10,
    "إدارة النفايات الصلبة": 10,
    "شبكة الكهرباء": 10,
    "شبكة الاتصالات": 10,
    "إمدادات المياه": 10,
    "شبكة الصرف الصحي": 10,
    "أضرار الإسكان": 10,
    "النسيج الحضري": 10,
    "التغيرات السكانية": 10,
  };

  // Calculate composite efficiency for each neighborhood
  Object.keys(window.sectoralFunctionalityData).forEach((neighborhoodName) => {
    const neighborhoodData = window.sectoralFunctionalityData[neighborhoodName];
    let totalWeightedValue = 0;
    let totalWeight = 0;

    // Calculate weighted average
    Object.keys(defaultWeights).forEach((sectorName) => {
      if (neighborhoodData[sectorName]) {
        const sectorValue = neighborhoodData[sectorName].percentage || 0;
        const weight = defaultWeights[sectorName];
        totalWeightedValue += sectorValue * weight;
        totalWeight += weight;
      }
    });

    // Calculate final composite value
    const compositeValue =
      totalWeight > 0 ? totalWeightedValue / totalWeight : 0;

    // Determine status and color based on composite value (using red gradient)
    let status, color;
    if (compositeValue >= 80) {
      status = "ممتاز";
      color = "#8B0000"; // Dark red
    } else if (compositeValue >= 65) {
      status = "جيد";
      color = "#DC143C"; // Crimson
    } else if (compositeValue >= 50) {
      status = "متوسط";
      color = "#FF6347"; // Tomato
    } else if (compositeValue >= 30) {
      status = "ضعيف";
      color = "#FFA07A"; // Light salmon
    } else {
      status = "سيء";
      color = "#FFE4E1"; // Misty rose
    }

    window.compositeEfficiencyData[neighborhoodName] = {
      value: compositeValue,
      status: status,
      color: color,
    };
  });

  console.log(
    "Composite efficiency calculated for",
    Object.keys(window.compositeEfficiencyData).length,
    "neighborhoods"
  );
}

// Function to normalize neighborhood names for better matching
function normalizeNeighborhoodName(name) {
  if (!name) return "";
  return name
    .toString()
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[أإآ]/g, "ا") // Normalize Arabic alif
    .replace(/[ىي]/g, "ي") // Normalize Arabic yaa
    .replace(/ة/g, "ه") // Normalize Arabic taa marbouta
    .replace(/[()]/g, "") // Remove parentheses
    .replace(/\d+/g, "") // Remove numbers
    .replace(/وتوابعها?/g, "") // Remove "وتوابعها" or "وتوابعه"
    .replace(/حي\s*/g, "") // Remove "حي" prefix
    .replace(/\s+/g, " ") // Clean up spaces again
    .trim()
    .toLowerCase();
}

// Function to find matching neighborhood name
function findMatchingNeighborhoodName(mapName, dataNames) {
  const normalizedMapName = normalizeNeighborhoodName(mapName);

  // Try exact match first
  for (const dataName of dataNames) {
    if (normalizeNeighborhoodName(dataName) === normalizedMapName) {
      return dataName;
    }
  }

  // Try partial match (both directions)
  for (const dataName of dataNames) {
    const normalizedDataName = normalizeNeighborhoodName(dataName);
    if (
      normalizedMapName.includes(normalizedDataName) ||
      normalizedDataName.includes(normalizedMapName)
    ) {
      return dataName;
    }
  }

  // Try word-based matching (split by spaces and check if any words match)
  const mapWords = normalizedMapName
    .split(" ")
    .filter((word) => word.length > 2);
  for (const dataName of dataNames) {
    const normalizedDataName = normalizeNeighborhoodName(dataName);
    const dataWords = normalizedDataName
      .split(" ")
      .filter((word) => word.length > 2);

    // Check if any significant words match
    for (const mapWord of mapWords) {
      for (const dataWord of dataWords) {
        if (
          mapWord === dataWord ||
          mapWord.includes(dataWord) ||
          dataWord.includes(mapWord)
        ) {
          return dataName;
        }
      }
    }
  }

  return null;
}

// Function to apply composite coloring using alternative data approach
function applyCompositeColoringFromData() {
  console.log("Applying composite coloring from sectoral data...");

  let processedCount = 0;
  const neighborhoodNames = Object.keys(window.sectoralFunctionalityData);
  console.log("Available neighborhood names in data:", neighborhoodNames);

  // Create a visual representation using the existing table or create markers
  if (neighborhoodNames.length > 0) {
    // Try to find any GeoJSON features that match our neighborhood names
    let foundAnyLayer = false;
    let mapNeighborhoods = [];

    if (window.map) {
      window.map.eachLayer(function (layer) {
        if (
          layer instanceof L.GeoJSON &&
          typeof layer.eachLayer === "function"
        ) {
          layer.eachLayer(function (subLayer) {
            if (subLayer.feature && subLayer.feature.properties) {
              const props = subLayer.feature.properties;
              const mapNeighborhoodName =
                props.Names || props.Name_En || props.name || props.NAME;

              if (mapNeighborhoodName) {
                mapNeighborhoods.push(mapNeighborhoodName);

                // Try to find a matching neighborhood in our data
                const matchingDataName = findMatchingNeighborhoodName(
                  mapNeighborhoodName,
                  neighborhoodNames
                );

                if (
                  matchingDataName &&
                  window.compositeEfficiencyData[matchingDataName]
                ) {
                  const compositeData =
                    window.compositeEfficiencyData[matchingDataName];
                  console.log(
                    `Matched: "${mapNeighborhoodName}" -> "${matchingDataName}"`
                  );

                  if (typeof subLayer.setStyle === "function") {
                    subLayer.setStyle({
                      fillColor: compositeData.color,
                      fillOpacity: 0.8,
                      color: "#ffffff",
                      weight: 2,
                      opacity: 1,
                    });

                    // Add popup with composite efficiency information
                    const popupContent = `
                      <div style="text-align: center; padding: 10px;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">${mapNeighborhoodName}</h4>
                        <div style="margin-bottom: 10px;">
                          <strong style="color: #007bff;">الفعالية العمرانية المركبة</strong>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                          <div style="width: 20px; height: 20px; background: ${
                            compositeData.color
                          }; border-radius: 4px; border: 1px solid #ddd;"></div>
                          <span style="font-size: 18px; font-weight: bold; color: ${
                            compositeData.color
                          };">${compositeData.value.toFixed(1)}%</span>
                        </div>
                        <div style="padding: 5px 10px; background: ${
                          compositeData.color
                        }; border-radius: 15px; color: white; font-size: 12px;">
                          ${compositeData.status}
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; color: #6c757d;">
                          محسوبة من البيانات القطاعية (${matchingDataName})
                        </div>
                      </div>
                    `;

                    if (typeof subLayer.bindPopup === "function") {
                      subLayer.bindPopup(popupContent);
                    }

                    foundAnyLayer = true;
                    processedCount++;
                  }
                } else {
                  console.log(`No match found for: "${mapNeighborhoodName}"`);
                }
              }
            }
          });
        }
      });

      console.log("Available neighborhood names in map:", mapNeighborhoods);
    }

    if (foundAnyLayer && processedCount > 0) {
      currentColoredColumn = "الفعالية العمرانية المركبة";
      showNotification(
        `تم تطبيق تلوين الفعالية المركبة على ${processedCount} حي`,
        "success"
      );
    } else {
      console.log("No matches found. Data names:", neighborhoodNames);
      console.log("Map names:", mapNeighborhoods);

      // Instead of showing error, show the sectoral grid interface
      showCompositeColoringWithSectoralGrid();
      showNotification(
        "تم إنشاء واجهة التلوين البديلة. يمكنك استخدام الأزرار أدناه لتطبيق التلوين.",
        "info"
      );
    }
  } else {
    showNotification("لا توجد بيانات أحياء متاحة", "warning");
  }
}

function applyCompositeColoringToLayer(neighborhoodsLayer) {
  console.log("applyCompositeColoringToLayer called with:", neighborhoodsLayer);

  if (!neighborhoodsLayer) {
    console.warn("Neighborhoods layer is null or undefined");
    showNotification("لم يتم العثور على طبقة الأحياء", "warning");
    return;
  }

  // Check if it's a valid layer with eachLayer method
  if (typeof neighborhoodsLayer.eachLayer !== "function") {
    console.warn(
      "Invalid neighborhoods layer - no eachLayer method:",
      neighborhoodsLayer
    );
    showNotification("طبقة الأحياء غير صالحة", "warning");
    return;
  }

  let processedCount = 0;

  try {
    neighborhoodsLayer.eachLayer(function (layer) {
      if (!layer.feature || !layer.feature.properties) {
        return; // Skip layers without feature properties
      }

      const neighborhoodName =
        layer.feature.properties.Names ||
        layer.feature.properties.Name_En ||
        layer.feature.properties.name ||
        layer.feature.properties.NAME;

      if (neighborhoodName) {
        // Try to find a matching neighborhood in composite data
        const dataNames = Object.keys(window.compositeEfficiencyData);
        const matchingDataName = findMatchingNeighborhoodName(
          neighborhoodName,
          dataNames
        );

        if (
          matchingDataName &&
          window.compositeEfficiencyData[matchingDataName]
        ) {
          const compositeData =
            window.compositeEfficiencyData[matchingDataName];
          console.log(
            `Matched: "${neighborhoodName}" -> "${matchingDataName}"`
          );

          // Check if layer has setStyle method
          if (typeof layer.setStyle === "function") {
            layer.setStyle({
              fillColor: compositeData.color,
              fillOpacity: 0.8,
              color: "#ffffff",
              weight: 2,
              opacity: 1,
            });

            // Update popup content to show composite efficiency information
            const popupContent = `
            <div style="text-align: center; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">${neighborhoodName}</h4>
              <div style="margin-bottom: 10px;">
                <strong style="color: #007bff;">الفعالية العمرانية المركبة</strong>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: 20px; height: 20px; background: ${
                  compositeData.color
                }; border-radius: 4px; border: 1px solid #ddd;"></div>
                <span style="font-size: 18px; font-weight: bold; color: ${
                  compositeData.color
                };">${compositeData.value.toFixed(1)}%</span>
              </div>
              <div style="padding: 5px 10px; background: ${
                compositeData.color
              }; border-radius: 15px; color: white; font-size: 12px;">
                ${compositeData.status}
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: #6c757d;">
                محسوبة وفق الأوزان المحددة للقطاعات الـ13
              </div>
            </div>
          `;

            // Check if layer has bindPopup method
            if (typeof layer.bindPopup === "function") {
              layer.bindPopup(popupContent);
            }

            processedCount++;
          }
        } else {
          console.log(`No match found for: "${neighborhoodName}"`);
        }
      }
    });

    if (processedCount > 0) {
      // Update current colored column
      currentColoredColumn = "الفعالية العمرانية المركبة";

      // Show success message
      showNotification(
        `تم تطبيق تلوين الفعالية المركبة على ${processedCount} حي`,
        "success"
      );
    } else {
      // Instead of showing error, show the sectoral grid interface
      showCompositeColoringWithSectoralGrid();
      showNotification(
        "تم إنشاء واجهة التلوين البديلة. يمكنك استخدام الأزرار أدناه لتطبيق التلوين.",
        "info"
      );
    }
  } catch (error) {
    console.error("Error in applyCompositeColoring:", error);
    showNotification("حدث خطأ أثناء تطبيق التلوين", "error");
  }
}

// Function to generate random sectoral functionality for a specific sector
function generateRandomSectoralFunctionality(sectorName) {
  let percentage = 0;
  let status = "ضعيف";

  // Generate different random ranges for different sectors to make it more realistic
  switch (sectorName) {
    case "التدخلات الإنسانية":
      // Humanitarian interventions tend to be moderate to good
      percentage = Math.floor(Math.random() * 60) + 40; // 40-100%
      break;

    case "الأسواق الأساسية":
      // Markets can vary widely
      percentage = Math.floor(Math.random() * 80) + 20; // 20-100%
      break;

    case "إدارة النفايات الصلبة":
      // Waste management often has issues
      percentage = Math.floor(Math.random() * 70) + 10; // 10-80%
      break;

    case "شبكة الكهرباء":
      // Electricity can be problematic
      percentage = Math.floor(Math.random() * 80) + 15; // 15-95%
      break;

    case "شبكة الاتصالات":
      // Communications generally better
      percentage = Math.floor(Math.random() * 40) + 60; // 60-100%
      break;

    case "إمدادات المياه":
      // Water supply varies significantly
      percentage = Math.floor(Math.random() * 70) + 25; // 25-95%
      break;

    case "شبكة الصرف الصحي":
      // Sewage often problematic
      percentage = Math.floor(Math.random() * 65) + 15; // 15-80%
      break;

    case "أضرار الإسكان":
      // Housing damage varies (higher percentage = less damage = better)
      percentage = Math.floor(Math.random() * 80) + 20; // 20-100%
      break;

    case "النسيج الحضري":
      // Urban fabric varies
      percentage = Math.floor(Math.random() * 70) + 30; // 30-100%
      break;

    case "التغيرات السكانية":
      // Population changes vary
      percentage = Math.floor(Math.random() * 60) + 35; // 35-95%
      break;

    default:
      percentage = Math.floor(Math.random() * 100);
  }

  // Ensure percentage is within bounds
  percentage = Math.min(100, Math.max(0, percentage));

  // Determine status based on percentage
  if (percentage >= 80) {
    status = "ممتاز";
  } else if (percentage >= 65) {
    status = "جيد";
  } else if (percentage >= 50) {
    status = "متوسط";
  } else if (percentage >= 30) {
    status = "ضعيف";
  } else {
    status = "سيء";
  }

  return {
    percentage: percentage,
    status: status,
  };
}

// Function to show sectoral mapping interface
function showSectoralMappingInterface() {
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

  if (fullscreenPopup && sectoralMappingContainer) {
    // Hide loading indicator
    if (popupLoading) popupLoading.style.display = "none";

    // Hide other containers and show sectoral mapping container
    if (popupContentContainer) popupContentContainer.style.display = "none";
    if (sectoralFunctionalityContainer)
      sectoralFunctionalityContainer.style.display = "none";
    sectoralMappingContainer.style.display = "flex";

    // Show the main fullscreen popup if it's hidden
    if (!fullscreenPopup.classList.contains("show")) {
      fullscreenPopup.style.display = "flex";
      fullscreenPopup.offsetHeight;
      fullscreenPopup.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    // Check if sectoral functionality data exists
    if (
      !window.sectoralFunctionalityData ||
      Object.keys(window.sectoralFunctionalityData).length === 0
    ) {
      alert("يرجى تحديث الفعالية القطاعية أولاً من خلال الزر الأخضر");
      return;
    }

    // Show the blue gradient legend
    const legend = document.getElementById("blueGradientLegend");
    if (legend) {
      legend.style.display = "block";
    }

    // Show sectoral maps directly
    const grid = document.getElementById("sectoralMappingGrid");
    if (grid) {
      grid.innerHTML =
        '<div id="sectoralMapsContainer" style="width: 100%;"></div>';
      createSectoralMapsGrid();
    }
  }
}

// Function to populate sectoral mapping grid
function populateSectoralMappingGrid() {
  const grid = document.getElementById("sectoralMappingGrid");
  if (!grid) return;

  // Clear existing content
  grid.innerHTML = "";

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    {
      name: "التدخلات الإنسانية",
      icon: "fas fa-hands-helping",
      description: "تقييم التدخلات الإنسانية والمساعدات",
    },
    {
      name: "الأسواق الأساسية",
      icon: "fas fa-store",
      description: "حالة الأسواق والمحلات التجارية",
    },
    {
      name: "إدارة النفايات الصلبة",
      icon: "fas fa-trash",
      description: "نظافة الحي وإدارة النفايات",
    },
    {
      name: "شبكة الكهرباء",
      icon: "fas fa-bolt",
      description: "شبكة الكهرباء والتغذية",
    },
    {
      name: "شبكة الاتصالات",
      icon: "fas fa-wifi",
      description: "شبكات الاتصالات والإنترنت",
    },
    {
      name: "إمدادات المياه",
      icon: "fas fa-tint",
      description: "شبكة المياه والتوزيع",
    },
    {
      name: "شبكة الصرف الصحي",
      icon: "fas fa-water",
      description: "شبكة الصرف الصحي",
    },
    {
      name: "أضرار الإسكان",
      icon: "fas fa-home",
      description: "حالة المباني والإسكان",
    },
    {
      name: "النسيج الحضري",
      icon: "fas fa-city",
      description: "التخطيط العمراني والنسيج",
    },
    {
      name: "التغيرات السكانية",
      icon: "fas fa-users",
      description: "التغيرات في عدد السكان",
    },
  ];

  // Create cards for each sector
  sectoralColumns.forEach((sector) => {
    const card = document.createElement("div");
    card.className = "sectoral-mapping-card";
    card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${
            sector.name
          }</h4>
          <p style="margin: 0; color: #6c757d; font-size: 12px;">${
            sector.description
          }</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <button onclick="applySectoralColoring('${sector.name}')" style="
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          margin-right: 10px;
        ">
          <i class="fas fa-paint-brush"></i> تطبيق التلوين
        </button>

        <button onclick="showSectorPreview('${sector.name}')" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          <i class="fas fa-eye"></i> معاينة
        </button>
      </div>

      <div class="sector-preview" style="
        margin-top: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        display: none;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #495057;">معاينة التوزيع:</span>
          <span id="preview-${sector.name.replace(
            /\s+/g,
            "-"
          )}" style="font-size: 12px; color: #007bff;"></span>
        </div>
        <div style="display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="flex: 1; background: #0d47a1;" title="ممتاز"></div>
          <div style="flex: 1; background: #1976d2;" title="جيد"></div>
          <div style="flex: 1; background: #42a5f5;" title="متوسط"></div>
          <div style="flex: 1; background: #90caf9;" title="ضعيف"></div>
          <div style="flex: 1; background: #e3f2fd;" title="سيء"></div>
        </div>
      </div>
    `;

    // Add hover effects
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    });

    grid.appendChild(card);
  });

  console.log(
    "Sectoral mapping grid populated with",
    sectoralColumns.length,
    "sectors"
  );
}

// Function to populate sectoral mapping grid with mini maps
function populateSectoralMappingGridWithMaps() {
  const grid = document.getElementById("sectoralMappingGrid");
  if (!grid) return;

  // Clear existing content
  grid.innerHTML = "";

  // Sectoral functionality column names (10 columns after removing 3 deleted columns)
  const sectoralColumns = [
    {
      name: "التدخلات الإنسانية",
      icon: "fas fa-hands-helping",
      description: "تقييم التدخلات الإنسانية والمساعدات",
    },
    {
      name: "الأسواق الأساسية",
      icon: "fas fa-store",
      description: "حالة الأسواق والمحلات التجارية",
    },
    {
      name: "إدارة النفايات الصلبة",
      icon: "fas fa-trash",
      description: "نظافة الحي وإدارة النفايات",
    },
    {
      name: "شبكة الكهرباء",
      icon: "fas fa-bolt",
      description: "شبكة الكهرباء والتغذية",
    },
    {
      name: "شبكة الاتصالات",
      icon: "fas fa-wifi",
      description: "شبكات الاتصالات والإنترنت",
    },
    {
      name: "إمدادات المياه",
      icon: "fas fa-tint",
      description: "شبكة المياه والتوزيع",
    },
    {
      name: "شبكة الصرف الصحي",
      icon: "fas fa-water",
      description: "شبكة الصرف الصحي",
    },
    {
      name: "أضرار الإسكان",
      icon: "fas fa-home",
      description: "حالة المباني والإسكان",
    },
    {
      name: "النسيج الحضري",
      icon: "fas fa-city",
      description: "التخطيط العمراني والنسيج",
    },
    {
      name: "التغيرات السكانية",
      icon: "fas fa-users",
      description: "التغيرات في عدد السكان",
    },
  ];

  // Show the blue gradient legend
  const legend = document.getElementById("blueGradientLegend");
  if (legend) {
    legend.style.display = "block";
  }

  // Create cards for each sector with mini maps
  sectoralColumns.forEach((sector, index) => {
    const card = document.createElement("div");
    card.className = "sectoral-mapping-card-with-map";
    card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 300px;
    `;

    // Calculate statistics for this sector
    const stats = calculateSectorStatistics(sector.name);

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-shrink: 0;">
        <div style="
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
          <h5 style="margin: 0 0 3px 0; color: #333; font-size: 13px; font-weight: bold;">${sector.name}</h5>
          <p style="margin: 0; color: #6c757d; font-size: 10px; line-height: 1.2;">${sector.description}</p>
        </div>
      </div>

      <div style="
        flex: 1;
        border-radius: 8px;
        border: 1px solid #dee2e6;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <button onclick="applySectoralColoring('${sector.name}')" style="
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,123,255,0.3);
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fas fa-paint-brush"></i><br>
          تطبيق التلوين
        </button>
      </div>

      <div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-size: 11px; color: #495057; font-weight: bold;">إحصائيات التوزيع:</span>
          <span style="font-size: 11px; color: #007bff;">${stats.total} حي</span>
        </div>
        <div style="display: flex; gap: 1px; height: 6px; border-radius: 3px; overflow: hidden;">
          <div style="flex: ${stats.excellent}; background: #0d47a1;" title="ممتاز: ${stats.excellent}"></div>
          <div style="flex: ${stats.good}; background: #1976d2;" title="جيد: ${stats.good}"></div>
          <div style="flex: ${stats.average}; background: #42a5f5;" title="متوسط: ${stats.average}"></div>
          <div style="flex: ${stats.poor}; background: #90caf9;" title="ضعيف: ${stats.poor}"></div>
          <div style="flex: ${stats.bad}; background: #e3f2fd;" title="سيء: ${stats.bad}"></div>
        </div>
      </div>
    `;

    // Add hover effects
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px)";
      this.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    });

    grid.appendChild(card);
  });

  console.log(
    "Sectoral mapping grid with mini maps populated with",
    sectoralColumns.length,
    "sectors"
  );
}

// Function to create mini map for a specific sector
function createMiniMapForSector(sectorName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.log("Container not found:", containerId);
    return;
  }

  try {
    // Clear container first
    container.innerHTML = "";

    // Create mini map
    const miniMap = L.map(containerId, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
    });

    // Add base layer (simple OSM)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      opacity: 0.3,
    }).addTo(miniMap);

    // Create neighborhoods layer for mini map
    if (
      typeof neighborhoodsData !== "undefined" &&
      window.sectoralFunctionalityData
    ) {
      const miniNeighborhoodsLayer = L.geoJSON(neighborhoodsData, {
        style: function (feature) {
          const neighborhoodName =
            feature.properties.Names ||
            feature.properties.Name_En ||
            feature.properties.name ||
            feature.properties.NAME;

          if (
            neighborhoodName &&
            window.sectoralFunctionalityData &&
            window.sectoralFunctionalityData[neighborhoodName]
          ) {
            const sectorData =
              window.sectoralFunctionalityData[neighborhoodName][sectorName];

            if (sectorData && typeof sectorData.percentage !== "undefined") {
              const color = getBlueGradientColor(sectorData.percentage);
              return {
                fillColor: color,
                fillOpacity: 0.8,
                color: "#ffffff",
                weight: 1,
                opacity: 1,
              };
            }
          }

          // Default style for neighborhoods without data
          return {
            fillColor: "#e9ecef",
            fillOpacity: 0.5,
            color: "#ffffff",
            weight: 1,
            opacity: 1,
          };
        },
        onEachFeature: function (feature, layer) {
          const neighborhoodName =
            feature.properties.Names ||
            feature.properties.Name_En ||
            feature.properties.name ||
            feature.properties.NAME;

          if (
            neighborhoodName &&
            window.sectoralFunctionalityData[neighborhoodName]
          ) {
            const sectorData =
              window.sectoralFunctionalityData[neighborhoodName][sectorName];

            if (sectorData && typeof sectorData.percentage !== "undefined") {
              const color = getBlueGradientColor(sectorData.percentage);

              // Simple tooltip on hover
              layer.bindTooltip(
                `
                <div style="text-align: center; font-size: 11px;">
                  <strong>${neighborhoodName}</strong><br>
                  <span style="color: ${color};">${sectorData.percentage.toFixed(
                  1
                )}%</span><br>
                  <small>${sectorData.status}</small>
                </div>
              `,
                {
                  permanent: false,
                  direction: "top",
                  className: "mini-map-tooltip",
                }
              );
            }
          }
        },
      });

      miniNeighborhoodsLayer.addTo(miniMap);

      // Fit bounds to show all neighborhoods
      miniMap.fitBounds(miniNeighborhoodsLayer.getBounds(), {
        padding: [5, 5],
      });
    }

    // Add click handler to apply this sector's coloring to main map
    container.addEventListener("click", function () {
      applySectoralColoring(sectorName);
      showNotification(
        `تم تطبيق تلوين ${sectorName} على الخريطة الرئيسية`,
        "success"
      );
    });

    // Add cursor pointer to indicate clickability
    container.style.cursor = "pointer";

    // Add title attribute for accessibility
    container.title = `انقر لتطبيق تلوين ${sectorName} على الخريطة الرئيسية`;
  } catch (error) {
    console.error("Error creating mini map for sector:", sectorName, error);
    // Show error message in container
    container.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #6c757d;
        font-size: 12px;
        text-align: center;
      ">
        <div>
          <i class="fas fa-exclamation-triangle" style="font-size: 20px; margin-bottom: 5px;"></i><br>
          خطأ في تحميل الخريطة
        </div>
      </div>
    `;
  }
}

// Function to apply sectoral coloring to neighborhoods
function applySectoralColoring(sectorName) {
  console.log("Applying sectoral coloring for:", sectorName);

  // Check if sectoral functionality data exists
  if (
    !window.sectoralFunctionalityData ||
    Object.keys(window.sectoralFunctionalityData).length === 0
  ) {
    alert("يرجى حساب الفعالية القطاعية أولاً من خلال الجدول");
    return;
  }

  // Get the blue gradient legend
  const legend = document.getElementById("blueGradientLegend");
  if (legend) {
    legend.style.display = "block";
  }

  // Apply coloring to neighborhoods based on the selected sector
  if (window.neighborhoodsLayer) {
    window.neighborhoodsLayer.eachLayer(function (layer) {
      const neighborhoodName =
        layer.feature.properties.Names ||
        layer.feature.properties.Name_En ||
        layer.feature.properties.name ||
        layer.feature.properties.NAME;

      if (
        neighborhoodName &&
        window.sectoralFunctionalityData[neighborhoodName]
      ) {
        const sectorData =
          window.sectoralFunctionalityData[neighborhoodName][sectorName];

        if (sectorData && typeof sectorData.percentage !== "undefined") {
          const color = getBlueGradientColor(sectorData.percentage);

          layer.setStyle({
            fillColor: color,
            fillOpacity: 0.8,
            color: "#ffffff",
            weight: 2,
            opacity: 1,
          });

          // Update popup content to show sector-specific information
          const popupContent = `
            <div style="text-align: center; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">${neighborhoodName}</h4>
              <div style="margin-bottom: 10px;">
                <strong style="color: #007bff;">${sectorName}</strong>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: 20px; height: 20px; background: ${color}; border-radius: 4px; border: 1px solid #ddd;"></div>
                <span style="font-size: 16px; font-weight: bold;">${sectorData.percentage.toFixed(
                  1
                )}%</span>
              </div>
              <div style="padding: 5px 10px; background: ${getStatusBackgroundColor(
                sectorData.status
              )}; border-radius: 15px; color: white; font-size: 12px;">
                ${sectorData.status}
              </div>
            </div>
          `;

          layer.bindPopup(popupContent);
        }
      }
    });
  }

  // Update current colored column
  currentColoredColumn = sectorName;

  // Show success message
  showNotification(`تم تطبيق تلوين ${sectorName} على الأحياء`, "success");
}

// Function to get blue gradient color based on percentage
function getBlueGradientColor(percentage) {
  if (percentage >= 80) {
    return "#0d47a1"; // Dark blue - Excellent
  } else if (percentage >= 65) {
    return "#1976d2"; // Medium dark blue - Good
  } else if (percentage >= 50) {
    return "#42a5f5"; // Medium blue - Average
  } else if (percentage >= 30) {
    return "#90caf9"; // Light blue - Poor
  } else {
    return "#e3f2fd"; // Very light blue - Bad
  }
}

// Function to get status background color
function getStatusBackgroundColor(status) {
  switch (status) {
    case "ممتاز":
      return "#0d47a1";
    case "جيد":
      return "#1976d2";
    case "متوسط":
      return "#42a5f5";
    case "ضعيف":
      return "#90caf9";
    case "سيء":
      return "#e3f2fd";
    default:
      return "#6c757d";
  }
}

// Function to show sector preview
function showSectorPreview(sectorName) {
  console.log("Showing preview for:", sectorName);

  // Find the preview element
  const previewId = `preview-${sectorName.replace(/\s+/g, "-")}`;
  const previewElement = document.getElementById(previewId);
  const previewContainer = previewElement?.closest(".sector-preview");

  if (previewContainer) {
    const isVisible = previewContainer.style.display !== "none";

    if (isVisible) {
      // Hide preview
      previewContainer.style.display = "none";
    } else {
      // Show preview and calculate statistics
      previewContainer.style.display = "block";

      if (
        window.sectoralFunctionalityData &&
        Object.keys(window.sectoralFunctionalityData).length > 0
      ) {
        const stats = calculateSectorStatistics(sectorName);
        if (previewElement) {
          previewElement.textContent = `${stats.total} حي`;
        }
      } else {
        if (previewElement) {
          previewElement.textContent = "لا توجد بيانات";
        }
      }
    }
  }
}

// Function to calculate sector statistics
function calculateSectorStatistics(sectorName) {
  let total = 0;
  let excellent = 0,
    good = 0,
    average = 0,
    poor = 0,
    bad = 0;

  if (window.sectoralFunctionalityData) {
    Object.keys(window.sectoralFunctionalityData).forEach(
      (neighborhoodName) => {
        const sectorData =
          window.sectoralFunctionalityData[neighborhoodName][sectorName];
        if (sectorData && typeof sectorData.percentage !== "undefined") {
          total++;
          const percentage = sectorData.percentage;

          if (percentage >= 80) excellent++;
          else if (percentage >= 65) good++;
          else if (percentage >= 50) average++;
          else if (percentage >= 30) poor++;
          else bad++;
        }
      }
    );
  }

  return { total, excellent, good, average, poor, bad };
}

// Function to find neighborhoods layer
function findNeighborhoodsLayer() {
  if (!window.map) {
    console.warn("Map not available");
    return null;
  }

  let foundLayer = null;

  // First try to find in global variables
  if (
    window.neighborhoodsLayer &&
    typeof window.neighborhoodsLayer.eachLayer === "function"
  ) {
    console.log("Found cached neighborhoods layer");
    return window.neighborhoodsLayer;
  }

  console.log("Searching for neighborhoods layer...");

  // Search through all map layers
  window.map.eachLayer(function (layer) {
    if (foundLayer) return; // Stop if already found

    // Check if it's a GeoJSON layer with neighborhood properties
    if (layer instanceof L.GeoJSON && typeof layer.eachLayer === "function") {
      let hasNeighborhoods = false;
      let neighborhoodCount = 0;

      try {
        layer.eachLayer(function (subLayer) {
          if (subLayer.feature && subLayer.feature.properties) {
            const props = subLayer.feature.properties;
            if (props.Names || props.Name_En || props.name || props.NAME) {
              hasNeighborhoods = true;
              neighborhoodCount++;
            }
          }
        });

        if (hasNeighborhoods && neighborhoodCount > 0) {
          console.log(
            `Found neighborhoods layer with ${neighborhoodCount} neighborhoods`
          );
          foundLayer = layer;
          window.neighborhoodsLayer = layer; // Cache for future use
          return;
        }
      } catch (e) {
        console.warn("Error checking GeoJSON layer:", e);
      }
    }

    // Check if it's a layer group containing neighborhoods
    if (
      layer.eachLayer &&
      typeof layer.eachLayer === "function" &&
      !(layer instanceof L.GeoJSON)
    ) {
      try {
        layer.eachLayer(function (subLayer) {
          if (foundLayer) return; // Stop if already found

          if (
            subLayer instanceof L.GeoJSON &&
            typeof subLayer.eachLayer === "function"
          ) {
            let hasNeighborhoods = false;
            let neighborhoodCount = 0;

            try {
              subLayer.eachLayer(function (geoLayer) {
                if (geoLayer.feature && geoLayer.feature.properties) {
                  const props = geoLayer.feature.properties;
                  if (
                    props.Names ||
                    props.Name_En ||
                    props.name ||
                    props.NAME
                  ) {
                    hasNeighborhoods = true;
                    neighborhoodCount++;
                  }
                }
              });

              if (hasNeighborhoods && neighborhoodCount > 0) {
                console.log(
                  `Found neighborhoods layer in group with ${neighborhoodCount} neighborhoods`
                );
                foundLayer = subLayer;
                window.neighborhoodsLayer = subLayer; // Cache for future use
                return;
              }
            } catch (e) {
              console.warn("Error checking nested GeoJSON layer:", e);
            }
          }
        });
      } catch (e) {
        console.warn("Error checking layer group:", e);
      }
    }
  });

  if (!foundLayer) {
    console.warn("No neighborhoods layer found");
  }

  return foundLayer;
}

// Function to diagnose map layers (for debugging)
function diagnoseMapLayers() {
  if (!window.map) {
    console.log("Map not available");
    return;
  }

  console.log("=== MAP LAYERS DIAGNOSIS ===");
  let layerCount = 0;

  window.map.eachLayer(function (layer) {
    layerCount++;
    console.log(`Layer ${layerCount}:`, layer);
    console.log("  - Type:", layer.constructor.name);
    console.log("  - Has eachLayer:", typeof layer.eachLayer === "function");

    if (layer instanceof L.GeoJSON && typeof layer.eachLayer === "function") {
      let featureCount = 0;
      let sampleFeature = null;

      layer.eachLayer(function (subLayer) {
        featureCount++;
        if (!sampleFeature && subLayer.feature) {
          sampleFeature = subLayer.feature;
        }
      });

      console.log(`  - GeoJSON with ${featureCount} features`);
      if (sampleFeature) {
        console.log(
          "  - Sample feature properties:",
          Object.keys(sampleFeature.properties || {})
        );
      }
    }

    if (
      layer.eachLayer &&
      typeof layer.eachLayer === "function" &&
      !(layer instanceof L.GeoJSON)
    ) {
      let subLayerCount = 0;
      layer.eachLayer(function (subLayer) {
        subLayerCount++;
        if (subLayer instanceof L.GeoJSON) {
          console.log(`  - Contains GeoJSON sublayer ${subLayerCount}`);
        }
      });
      console.log(`  - Layer group with ${subLayerCount} sublayers`);
    }
  });

  console.log(`Total layers: ${layerCount}`);
  console.log("=== END DIAGNOSIS ===");
}

// Make functions available globally
window.diagnoseMapLayers = diagnoseMapLayers;
window.applyCompositeColoring = applyCompositeColoring;
window.calculateCompositeEfficiencyFromSectoralData =
  calculateCompositeEfficiencyFromSectoralData;

// Function to show notifications
function showNotification(message, type = "info") {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(notification);
  }

  // Set background color based on type
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#007bff",
  };

  notification.style.background = colors[type] || colors.info;
  notification.textContent = message;

  // Show notification
  notification.style.transform = "translateX(0)";

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
  }, 3000);
}

// Neighborhood coloring functionality
let currentColoredColumn = null;
let originalNeighborhoodStyle = null;

// Function to populate column dropdown for neighborhood coloring
function populateColumnDropdown() {
  const select = document.getElementById("colorByColumnSelect");
  if (!select) return;

  // Clear existing options except the first one
  select.innerHTML = '<option value="">اختر عمود...</option>';

  // Get available columns from neighborhood data
  if (
    typeof neighborhoodsData !== "undefined" &&
    neighborhoodsData.features &&
    neighborhoodsData.features.length > 0
  ) {
    const sampleFeature = neighborhoodsData.features[0];
    const properties = sampleFeature.properties;

    // Define columns that make sense for coloring
    const colorableColumns = [
      { key: "ID", label: "المعرف" },
      { key: "Sector_01", label: "القطاع الأول" },
      { key: "OBJECTID_1", label: "معرف الكائن" },
      { key: "Sector_02", label: "القطاع الثاني" },
    ];

    colorableColumns.forEach((col) => {
      if (properties.hasOwnProperty(col.key)) {
        const option = document.createElement("option");
        option.value = col.key;
        option.textContent = col.label;
        select.appendChild(option);
      }
    });
  }
}

// Function to get color based on value and color scheme
function getColorForValue(value, min, max, colorScheme) {
  if (value === null || value === undefined || value === "") {
    return "#cccccc"; // Gray for null/empty values
  }

  // Normalize value to 0-1 range
  const normalized = (value - min) / (max - min);

  // Four gradient colors as requested
  const colors = [
    "#d73027", // Red (high values)
    "#fc8d59", // Orange
    "#fee08b", // Yellow
    "#91cf60", // Green (low values)
  ];

  // Determine which color segment the value falls into
  const segmentSize = 1 / (colors.length - 1);
  const segmentIndex = Math.floor(normalized / segmentSize);
  const segmentProgress = (normalized % segmentSize) / segmentSize;

  if (segmentIndex >= colors.length - 1) {
    return colors[colors.length - 1];
  }

  // Interpolate between two colors
  const color1 = hexToRgb(colors[segmentIndex]);
  const color2 = hexToRgb(colors[segmentIndex + 1]);

  const r = Math.round(color1.r + (color2.r - color1.r) * segmentProgress);
  const g = Math.round(color1.g + (color2.g - color1.g) * segmentProgress);
  const b = Math.round(color1.b + (color2.b - color1.b) * segmentProgress);

  return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Function to apply column-based coloring to neighborhoods
function applyColumnColoring(columnName) {
  if (!neighborhoodsLayer || !columnName) {
    console.error("Neighborhoods layer or column name not available");
    return;
  }

  // Store original style if not already stored
  if (!originalNeighborhoodStyle) {
    originalNeighborhoodStyle = {
      color: "#1e40af",
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.6,
    };
  }

  // Get all values for the selected column
  const values = [];
  const categoricalValues = new Set();
  let isNumerical = true;

  neighborhoodsLayer.eachLayer((layer) => {
    const value = layer.feature.properties[columnName];
    if (value !== null && value !== undefined && value !== "") {
      values.push(value);
      categoricalValues.add(value);

      // Check if value is numerical
      if (isNaN(parseFloat(value))) {
        isNumerical = false;
      }
    }
  });

  if (values.length === 0) {
    console.error("No valid values found for column:", columnName);
    return;
  }

  let colorMapping = {};
  let legendItems = [];

  if (isNumerical) {
    // Numerical coloring with gradient
    const numValues = values.map((v) => parseFloat(v));
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);

    // Create legend for numerical values
    const colors = ["#91cf60", "#fee08b", "#fc8d59", "#d73027"];
    const ranges = [
      {
        min: min,
        max: min + (max - min) * 0.25,
        color: colors[0],
        label: `${min.toFixed(1)} - ${(min + (max - min) * 0.25).toFixed(1)}`,
      },
      {
        min: min + (max - min) * 0.25,
        max: min + (max - min) * 0.5,
        color: colors[1],
        label: `${(min + (max - min) * 0.25).toFixed(1)} - ${(
          min +
          (max - min) * 0.5
        ).toFixed(1)}`,
      },
      {
        min: min + (max - min) * 0.5,
        max: min + (max - min) * 0.75,
        color: colors[2],
        label: `${(min + (max - min) * 0.5).toFixed(1)} - ${(
          min +
          (max - min) * 0.75
        ).toFixed(1)}`,
      },
      {
        min: min + (max - min) * 0.75,
        max: max,
        color: colors[3],
        label: `${(min + (max - min) * 0.75).toFixed(1)} - ${max.toFixed(1)}`,
      },
    ];

    legendItems = ranges;

    // Apply coloring to each layer
    neighborhoodsLayer.eachLayer((layer) => {
      const value = parseFloat(layer.feature.properties[columnName]);
      const color = isNaN(value)
        ? "#cccccc"
        : getColorForValue(value, min, max);

      layer.setStyle({
        fillColor: color,
        color: "#333333",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7,
      });
    });
  } else {
    // Categorical coloring
    const uniqueValues = Array.from(categoricalValues);
    const colors = [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
    ];

    uniqueValues.forEach((value, index) => {
      const color = colors[index % colors.length];
      colorMapping[value] = color;
      legendItems.push({ label: value, color: color });
    });

    // Apply coloring to each layer
    neighborhoodsLayer.eachLayer((layer) => {
      const value = layer.feature.properties[columnName];
      const color = colorMapping[value] || "#cccccc";

      layer.setStyle({
        fillColor: color,
        color: "#333333",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7,
      });
    });
  }

  // Update legend
  updateColorLegend(legendItems, isNumerical);

  // Store current colored column
  currentColoredColumn = columnName;
}

// Enhanced function to update color legend with animations
function updateColorLegend(legendItems, isNumerical) {
  const legendContainer = document.getElementById("colorLegend");
  const legendItemsContainer = document.getElementById("legendItems");

  if (!legendContainer || !legendItemsContainer) return;

  // Hide legend first if it's visible
  if (legendContainer.style.display === "block") {
    legendContainer.style.opacity = "0";
    legendContainer.style.transform = "translateY(-10px)";

    setTimeout(() => {
      updateLegendContent();
    }, 300);
  } else {
    updateLegendContent();
  }

  function updateLegendContent() {
    // Clear existing legend items
    legendItemsContainer.innerHTML = "";

    // Add new legend items with staggered animation
    legendItems.forEach((item, index) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.style.opacity = "0";
      legendItem.style.transform = "translateX(-20px)";

      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = item.color;

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = item.label;

      if (isNumerical && item.min !== undefined) {
        const range = document.createElement("span");
        range.className = "legend-range";
        range.textContent = item.label;
        legendItem.appendChild(range);
      } else {
        legendItem.appendChild(label);
      }

      legendItem.appendChild(colorBox);
      legendItemsContainer.appendChild(legendItem);

      // Animate item appearance with stagger
      setTimeout(() => {
        legendItem.style.transition = "all 0.4s ease";
        legendItem.style.opacity = "1";
        legendItem.style.transform = "translateX(0)";
      }, index * 100 + 100);
    });

    // Show legend container
    legendContainer.style.display = "block";
    setTimeout(() => {
      legendContainer.style.transition = "all 0.4s ease";
      legendContainer.style.opacity = "1";
      legendContainer.style.transform = "translateY(0)";
    }, 50);
  }
}

// Function to reset neighborhood coloring
function resetNeighborhoodColoring() {
  if (!neighborhoodsLayer || !originalNeighborhoodStyle) return;

  neighborhoodsLayer.eachLayer((layer) => {
    layer.setStyle(originalNeighborhoodStyle);
  });

  // Hide legend
  const legendContainer = document.getElementById("colorLegend");
  if (legendContainer) {
    legendContainer.style.display = "none";
  }

  currentColoredColumn = null;
}

// Function to load composite analysis content
function loadCompositeAnalysis() {
  const popupContentContainer = document.getElementById(
    "popup-content-container"
  );

  if (popupContentContainer) {
    popupContentContainer.innerHTML = `
      <div style="padding: 20px; font-family: 'Cairo', sans-serif; height: 100%; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 15px;">
          <h2 style="color: #333; margin: 0;">تحليل الكفاءة الحضرية المركبة</h2>
          <button onclick="showFullscreenPopup()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">
            <i class="fas fa-arrow-left"></i> العودة
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef;">
              <h4 style="color: #495057; margin-bottom: 15px;">
                <i class="fas fa-map-marked-alt" style="color: #007bff;"></i> اختيار المنطقة
              </h4>
              <select id="analysisAreaSelect" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-family: 'Cairo', sans-serif;">
                <option value="">اختر منطقة للتحليل...</option>
                <option value="all">جميع الأحياء</option>
                <option value="sector">حسب القطاع</option>
                <option value="custom">منطقة مخصصة</option>
              </select>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef;">
              <h4 style="color: #495057; margin-bottom: 15px;">
                <i class="fas fa-sliders-h" style="color: #28a745;"></i> معايير التحليل
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> البنية التحتية
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> الخدمات العامة
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> الكثافة السكانية
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> جودة البيئة
                </label>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <button onclick="runCompositeAnalysis()" style="
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s ease;
              box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              <i class="fas fa-play"></i> تشغيل التحليل
            </button>
          </div>

          <div id="analysisResults" style="
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 20px;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
          ">
            <div style="text-align: center;">
              <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
              <p>اختر المعايير واضغط "تشغيل التحليل" لعرض النتائج</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Function to run composite analysis
function runCompositeAnalysis() {
  const resultsContainer = document.getElementById("analysisResults");

  if (resultsContainer) {
    // Show loading state
    resultsContainer.innerHTML = `
      <div style="text-align: center;">
        <div style="
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        "></div>
        <p>جاري تشغيل التحليل...</p>
      </div>
    `;

    // Simulate analysis process
    setTimeout(() => {
      resultsContainer.innerHTML = `
        <div style="height: 100%; overflow-y: auto;">
          <h4 style="color: #333; margin-bottom: 20px; text-align: center;">
            <i class="fas fa-chart-line"></i> نتائج تحليل الكفاءة الحضرية المركبة
          </h4>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">85%</div>
              <div style="font-size: 12px; opacity: 0.9;">الكفاءة الإجمالية</div>
            </div>
            <div style="background: linear-gradient(135deg, #28a745, #1e7e34); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">92%</div>
              <div style="font-size: 12px; opacity: 0.9;">البنية التحتية</div>
            </div>
            <div style="background: linear-gradient(135deg, #ffc107, #e0a800); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">78%</div>
              <div style="font-size: 12px; opacity: 0.9;">الخدمات العامة</div>
            </div>
            <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">71%</div>
              <div style="font-size: 12px; opacity: 0.9;">جودة البيئة</div>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h5 style="color: #495057; margin-bottom: 10px;">أفضل الأحياء أداءً:</h5>
            <ol style="margin: 0; padding-right: 20px;">
              <li>الشيخ مقصود - 94%</li>
              <li>حلب الجديدة الشمالي - 91%</li>
              <li>السليمانية - 88%</li>
              <li>الحيدرية - 85%</li>
            </ol>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h5 style="color: #856404; margin-bottom: 10px;">توصيات التحسين:</h5>
            <ul style="margin: 0; padding-right: 20px; color: #856404;">
              <li>تحسين شبكة النقل العام في المناطق الجنوبية</li>
              <li>زيادة المساحات الخضراء في الأحياء الكثيفة</li>
              <li>تطوير الخدمات الصحية في الأحياء النائية</li>
            </ul>
          </div>
        </div>
      `;
    }, 2000);
  }
}
