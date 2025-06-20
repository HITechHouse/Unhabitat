/**
 * main.js
 * الملف الرئيسي لتطبيق تحليل أحياء حلب
 * يحتوي على وظائف استيراد الطبقات فقط
 * (وظائف التصدير موجودة في import-export.js)
 */

// استيراد البيانات من ملف aleppo-data.js
// const aleppoNeighborhoods, sectors, infrastructureData, etc. are imported from aleppo-data.js

/**
 * استيراد طبقة من ملف خارجي
 * تنفيذ واجهة للاستخدام مع الأزرار في واجهة المستخدم
 * @param {File} file - الملف المراد استيراده
 */
function importLayerFromFile(file) {
  if (!file) return;

  const reader = new FileReader();
  const fileExtension = file.name.split(".").pop().toLowerCase();

  reader.onload = function (e) {
    try {
      let importedData;
      let layerType;

      // معالجة الملف حسب نوعه
      if (fileExtension === "geojson" || fileExtension === "json") {
        importedData = JSON.parse(e.target.result);
        layerType = "geojson";

        // التحقق من صحة بيانات GeoJSON
        if (!importedData.type || !importedData.features) {
          throw new Error("تنسيق GeoJSON غير صالح");
        }
      } else if (fileExtension === "kml") {
        // تحويل KML إلى GeoJSON باستخدام مكتبة toGeoJSON
        // في هذه المرحلة التطويرية نعرض فقط إشعارًا
        alert("استيراد ملفات KML قيد التطوير");
        return;
      } else if (fileExtension === "zip" || fileExtension === "shp") {
        // معالجة ملفات Shapefile المضغوطة
        // في هذه المرحلة التطويرية نعرض فقط إشعارًا
        alert("استيراد ملفات Shapefile قيد التطوير");
        return;
      } else {
        throw new Error("تنسيق ملف غير مدعوم");
      }

      // إضافة الطبقة المستوردة إلى الخريطة
      if (layerType === "geojson" && map) {
        // إزالة الطبقة الحالية إذا كانت موجودة
        if (window.importedLayer) {
          map.removeLayer(window.importedLayer);
        }

        // إنشاء طبقة جديدة
        window.importedLayer = L.geoJSON(importedData, {
          style: {
            fillColor: "#4caf50",
            weight: 2,
            opacity: 1,
            color: "#388e3c",
            fillOpacity: 0.5,
          },
          onEachFeature: function (feature, layer) {
            // إضافة النافذة المنبثقة مع المعلومات المتاحة
            const properties = feature.properties;
            const popupContent = `
              <div class="popup-header">
                <h3 class="popup-title">${
                  properties.name || properties.Name || "معلم مستورد"
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

        // التكبير على الطبقة المستوردة
        map.fitBounds(window.importedLayer.getBounds());

        // إضافة الطبقة إلى قائمة الطبقات
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

          // إضافة أحداث للأزرار
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

  // قراءة الملف كنص
  reader.readAsText(file);
}



// ملاحظة: تم نقل event listener إلى features.js لتجنب التضارب
// تم الاحتفاظ بالدالة فقط للاستخدام المرجعي إذا لزم الأمر

// كشف الدوال للاستخدام الخارجي
window.importLayerFromFile = importLayerFromFile;
