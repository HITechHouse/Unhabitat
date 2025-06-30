/**
 * main.js
 * the main file for the Aleppo analysis application
 * it contains only the import functions
 * (export functions are in import-export.js)
 */

// import the data from the aleppo-data.js file
// const aleppoNeighborhoods, sectors, infrastructureData, etc. are imported from aleppo-data.js

/**
 * import a layer from a file
 * implement a user interface with buttons in the user interface
 * @param {File} file - the file to import
 */
function importLayerFromFile(file) {
  if (!file) return;

  const reader = new FileReader();
  const fileExtension = file.name.split(".").pop().toLowerCase();

  reader.onload = function (e) {
    try {
      let importedData;
      let layerType;

      // process the file based on its type
      if (fileExtension === "geojson" || fileExtension === "json") {
        importedData = JSON.parse(e.target.result);
        layerType = "geojson";

        // check if the GeoJSON data is valid
        if (!importedData.type || !importedData.features) {
          throw new Error("تنسيق GeoJSON غير صالح");
        }
      } else if (fileExtension === "kml") {
        // convert KML to GeoJSON using the toGeoJSON library
        // in this development phase we only show an alert
        alert("استيراد ملفات KML قيد التطوير");
        return;
      } else if (fileExtension === "zip" || fileExtension === "shp") {
        // process the compressed Shapefile files
        // in this development phase we only show an alert
        alert("استيراد ملفات Shapefile قيد التطوير");
        return;
      } else {
        throw new Error("تنسيق ملف غير مدعوم");
      }

      // add the imported layer to the map
      if (layerType === "geojson" && map) {
        // remove the current layer if it exists
        if (window.importedLayer) {
          map.removeLayer(window.importedLayer);
        }

        // create a new layer
        window.importedLayer = L.geoJSON(importedData, {
          style: {
            fillColor: "#4caf50",
            weight: 2,
            opacity: 1,
            color: "#388e3c",
            fillOpacity: 0.5,
          },
          onEachFeature: function (feature, layer) {
            // add the popup with the available information
            const properties = feature.properties;
            const popupContent = `
              <div class="popup-header">
                <h3 class="popup-title">${properties.name || properties.Name || "معلم مستورد"
              }</h3>
              </div>
              <div class="popup-body">
                ${Object.entries(properties)
                .filter(([key]) => key !== "name" && key !== "Name")
                .map(
                  ([key, value]) => `
                    <div class="popup-stat">
                      <span>${key}:</span>
                      <strong>${value}</strong>
                    </div>
                  `
                )
                .join("")}
              </div>
            `;

            layer.bindPopup(popupContent);
          },
        }).addTo(map);

        // zoom to the imported layer
        map.fitBounds(window.importedLayer.getBounds());

        // add the layer to the layers list
        const layersList = document.getElementById("layersList");
        if (layersList) {
          const importedLayerItem = document.createElement("div");
          importedLayerItem.className = "layer-item";
          importedLayerItem.innerHTML = `
            <div class="layer-toggle">
              <input type="checkbox" id="layer-imported" checked>
              <label for="layer-imported">طبقة مستوردة (${file.name})</label>
            </div>
            <div class="layer-actions">
              <button class="layer-action-btn" data-action="zoom" data-layer="imported">
                <i class="fas fa-search-plus"></i>
              </button>
              <button class="layer-action-btn" data-action="remove" data-layer="imported">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;

          layersList.appendChild(importedLayerItem);

          // add events to the buttons
          const zoomBtn = importedLayerItem.querySelector(
            '[data-action="zoom"]'
          );
          const removeBtn = importedLayerItem.querySelector(
            '[data-action="remove"]'
          );
          const checkbox = importedLayerItem.querySelector("#layer-imported");

          if (zoomBtn) {
            zoomBtn.addEventListener("click", function () {
              map.fitBounds(window.importedLayer.getBounds());
            });
          }

          if (removeBtn) {
            removeBtn.addEventListener("click", function () {
              map.removeLayer(window.importedLayer);
              importedLayerItem.remove();
              window.importedLayer = null;
            });
          }

          if (checkbox) {
            checkbox.addEventListener("change", function () {
              if (this.checked) {
                map.addLayer(window.importedLayer);
              } else {
                map.removeLayer(window.importedLayer);
              }
            });
          }
        }

        alert(`تم استيراد الطبقة بنجاح: ${file.name}`);
      }
    } catch (error) {
      console.error("خطأ في استيراد الملف:", error);
      alert(`خطأ في استيراد الملف: ${error.message}`);
    }
  };

  reader.onerror = function () {
    console.error("خطأ في قراءة الملف");
    alert("خطأ في قراءة الملف");
  };

  // read the file as text
  reader.readAsText(file);
}

// كشف الدوال للاستخدام الخارجي
window.importLayerFromFile = importLayerFromFile;
