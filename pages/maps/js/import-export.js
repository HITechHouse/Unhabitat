/**
 * وظائف استيراد وتصدير البيانات وتصفية الأحياء حسب القطاع
 */

document.addEventListener('DOMContentLoaded', function() {
  // تهيئة واجهة الاستيراد/التصدير
  initImportExport();
  
  // تهيئة واجهة التصفية حسب القطاعات
  initSectorFilter();
});

/**
 * تهيئة واجهة الاستيراد/التصدير
 */
function initImportExport() {
  // عناصر واجهة المستخدم
  const fileInput = document.getElementById('fileImport');
  const selectedFileName = document.getElementById('selectedFileName');
  const importButton = document.getElementById('importFileBtn');
  const exportLayerSelect = document.getElementById('exportLayerSelect');
  const exportFormatSelect = document.getElementById('exportFormatSelect');
  const exportButton = document.getElementById('exportLayerBtn');
  
  // إظهار اسم الملف المحدد عند اختياره
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        selectedFileName.textContent = this.files[0].name;
      } else {
        selectedFileName.textContent = 'لم يتم اختيار ملف';
      }
    });
  }
  
  // زر استيراد الملف
  if (importButton) {
    importButton.addEventListener('click', function() {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        importFile(file);
      } else {
        alert('الرجاء اختيار ملف للاستيراد');
      }
    });
  }
  
  // زر تصدير الطبقة
  if (exportButton) {
    exportButton.addEventListener('click', function() {
      const layerName = exportLayerSelect.value;
      const format = exportFormatSelect.value;
      
      if (!layerName) {
        alert('الرجاء اختيار طبقة للتصدير');
        return;
      }
      
      if (!format) {
        alert('الرجاء اختيار صيغة التصدير');
        return;
      }
      
      exportLayer(layerName, format);
    });
  }
  
  // أزرار تصدير النتائج
  const exportResultsBtn = document.getElementById('exportResultsBtn');
  if (exportResultsBtn) {
    exportResultsBtn.addEventListener('click', function() {
      exportQueryResults();
    });
  }
  
  const printResultsBtn = document.getElementById('printResultsBtn');
  if (printResultsBtn) {
    printResultsBtn.addEventListener('click', function() {
      printQueryResults();
    });
  }
  
  const exportFilteredBtn = document.getElementById('exportFilteredBtn');
  if (exportFilteredBtn) {
    exportFilteredBtn.addEventListener('click', function() {
      exportFilteredResults();
    });
  }
}

/**
 * استيراد ملف إلى الخريطة
 * @param {File} file - الملف المراد استيراده
 */
function importFile(file) {
  const reader = new FileReader();
  const fileName = file.name.toLowerCase();
  
  reader.onload = function(e) {
    try {
      // التحقق من نوع الملف واستدعاء الدالة المناسبة
      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        // استيراد ملف GeoJSON
        importGeoJSON(e.target.result);
      } else if (fileName.endsWith('.kml')) {
        // استيراد ملف KML
        alert('سيتم دعم استيراد ملفات KML قريباً');
      } else if (fileName.endsWith('.gpx')) {
        // استيراد ملف GPX
        alert('سيتم دعم استيراد ملفات GPX قريباً');
      } else if (fileName.endsWith('.zip')) {
        // استيراد ملف Shapefile مضغوط
        alert('سيتم دعم استيراد ملفات Shapefile قريباً. يمكنك استيراد ملف GeoJSON بدلاً من ذلك.');
      } else {
        alert('صيغة الملف غير مدعومة. الرجاء استخدام ملفات GeoJSON, KML, GPX, أو Shapefile (zip).');
      }
    } catch (error) {
      console.error('خطأ في استيراد الملف:', error);
      alert('حدث خطأ أثناء استيراد الملف: ' + error.message);
    }
  };
  
  reader.onerror = function() {
    alert('حدث خطأ أثناء قراءة الملف');
  };
  
  // قراءة الملف كنص
  if (fileName.endsWith('.zip')) {
    // قراءة الملف كـ ArrayBuffer للملفات المضغوطة
    reader.readAsArrayBuffer(file);
  } else {
    // قراءة الملف كنص لباقي الأنواع
    reader.readAsText(file);
  }
}

/**
 * استيراد بيانات GeoJSON إلى الخريطة
 * @param {string} geoJSONData - بيانات GeoJSON كنص
 */
function importGeoJSON(geoJSONData) {
  try {
    // تحويل النص إلى كائن JSON
    const data = JSON.parse(geoJSONData);
    
    // التحقق من أن البيانات هي GeoJSON صالحة
    if (!data.type || !data.features) {
      throw new Error('ملف GeoJSON غير صالح');
    }
    
    // استخدام المكتبة المناسبة لإضافة البيانات إلى الخريطة
    if (typeof L !== 'undefined' && typeof map !== 'undefined') {
      // إضافة طبقة GeoJSON جديدة إلى الخريطة
      const importedLayer = L.geoJSON(data, {
        style: function(feature) {
          // تعيين نمط افتراضي للطبقة المستوردة
          return {
            fillColor: '#00ffff',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
          };
        },
        onEachFeature: function(feature, layer) {
          // إضافة نافذة منبثقة تعرض خصائص العنصر
          if (feature.properties) {
            const popupContent = `
              <div class="popup-header futuristic">
                <h3 class="popup-title">${feature.properties.Name || 'عنصر مستورد'}</h3>
              </div>
              <div class="popup-body">
                ${Object.entries(feature.properties).map(([key, value]) => `
                  <div class="popup-stat">
                    <span>${key}:</span>
                    <strong>${value}</strong>
                  </div>
                `).join('')}
              </div>
            `;
            layer.bindPopup(popupContent);
          }
        }
      }).addTo(map);
      
      // التكبير على الطبقة المستوردة
      map.fitBounds(importedLayer.getBounds());
      
      // إضافة الطبقة إلى قائمة الطبقات
      addImportedLayerToList(data.name || 'طبقة مستوردة', importedLayer);
      
      alert('تم استيراد الطبقة بنجاح');
    } else {
      throw new Error('مكتبة Leaflet غير محملة');
    }
  } catch (error) {
    console.error('خطأ في استيراد GeoJSON:', error);
    alert('حدث خطأ أثناء استيراد GeoJSON: ' + error.message);
  }
}

/**
 * إضافة الطبقة المستوردة إلى قائمة الطبقات
 * @param {string} layerName - اسم الطبقة
 * @param {Object} layer - كائن الطبقة
 */
function addImportedLayerToList(layerName, layer) {
  // الحصول على قائمة الطبقات من الشريط الجانبي
  const layersList = document.getElementById('layersList');
  if (!layersList) return;
  
  // إنشاء معرف فريد للطبقة
  const layerId = 'imported-layer-' + Date.now();
  
  // حفظ الطبقة في متغير عام للوصول إليها لاحقًا
  window.importedLayers = window.importedLayers || {};
  window.importedLayers[layerId] = layer;
  
  // إنشاء عنصر HTML للطبقة المستوردة
  const layerItem = document.createElement('div');
  layerItem.className = 'layer-item imported-layer';
  layerItem.innerHTML = `
    <div class="layer-toggle">
      <input type="checkbox" id="${layerId}" checked>
      <label for="${layerId}">${layerName} (مستورد)</label>
    </div>
    <div class="layer-actions">
      <button class="layer-action-btn" data-action="zoom" data-layer="${layerId}">
        <i class="fas fa-search-plus"></i>
      </button>
      <button class="layer-action-btn" data-action="remove" data-layer="${layerId}">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `;
  
  // إضافة العنصر إلى القائمة
  layersList.appendChild(layerItem);
  
  // إضافة مستمعات الأحداث
  const checkbox = layerItem.querySelector(`#${layerId}`);
  if (checkbox) {
    checkbox.addEventListener('change', function() {
      toggleImportedLayer(layerId, this.checked);
    });
  }
  
  // زر التكبير
  const zoomBtn = layerItem.querySelector('[data-action="zoom"]');
  if (zoomBtn) {
    zoomBtn.addEventListener('click', function() {
      zoomToImportedLayer(layerId);
    });
  }
  
  // زر الحذف
  const removeBtn = layerItem.querySelector('[data-action="remove"]');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      removeImportedLayer(layerId, layerItem);
    });
  }
}

/**
 * تبديل حالة ظهور الطبقة المستوردة
 * @param {string} layerId - معرف الطبقة
 * @param {boolean} visible - حالة الظهور
 */
function toggleImportedLayer(layerId, visible) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer) return;
  
  if (visible) {
    if (!map.hasLayer(layer)) {
      map.addLayer(layer);
    }
  } else {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  }
}

/**
 * التكبير على الطبقة المستوردة
 * @param {string} layerId - معرف الطبقة
 */
function zoomToImportedLayer(layerId) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer) return;
  
  map.fitBounds(layer.getBounds());
}

/**
 * حذف الطبقة المستوردة
 * @param {string} layerId - معرف الطبقة
 * @param {HTMLElement} layerItem - عنصر HTML للطبقة
 */
function removeImportedLayer(layerId, layerItem) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer) return;
  
  // إزالة الطبقة من الخريطة
  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
  }
  
  // حذف الطبقة من الكائن
  delete window.importedLayers[layerId];
  
  // إزالة العنصر من القائمة
  if (layerItem && layerItem.parentNode) {
    layerItem.parentNode.removeChild(layerItem);
  }
}

/**
 * تصدير طبقة إلى ملف
 * @param {string} layerName - اسم الطبقة
 * @param {string} format - صيغة التصدير
 */
function exportLayer(layerName, format) {
  try {
    let data;
    let fileName;
    let contentType;
    
    // الحصول على بيانات الطبقة المطلوبة
    if (layerName === 'neighborhoods' && typeof neighborhoodsData !== 'undefined') {
      data = neighborhoodsData;
      fileName = `aleppo_neighborhoods_${formatDate()}`;
    } else if (layerName === 'sectors' && typeof sectors !== 'undefined') {
      // تحويل بيانات القطاعات إلى GeoJSON
      // (هذا مثال مبسط، يجب تعديله حسب هيكل البيانات الفعلي)
      data = {
        type: 'FeatureCollection',
        features: sectors.map(sector => ({
          type: 'Feature',
          properties: {
            id: sector.id,
            name: sector.name
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[]]
          }
        }))
      };
      fileName = `aleppo_sectors_${formatDate()}`;
    } else if (layerName === 'service-sectors' && typeof serviceSectorsData !== 'undefined') {
      data = serviceSectorsData;
      fileName = `service_directorate_${formatDate()}`;
    } else if (window.importedLayers && Object.keys(window.importedLayers).length > 0) {
      // البحث عن الطبقة المستوردة
      const layerId = layerName;
      const layer = window.importedLayers[layerId];
      if (layer && layer.toGeoJSON) {
        data = layer.toGeoJSON();
        fileName = `exported_layer_${formatDate()}`;
      }
    }
    
    if (!data) {
      throw new Error('لم يتم العثور على بيانات الطبقة');
    }
    
    // تصدير البيانات بالصيغة المطلوبة
    if (format === 'geojson') {
      contentType = 'application/json';
      data = JSON.stringify(data, null, 2);
      fileName += '.geojson';
    } else if (format === 'kml') {
      alert('سيتم دعم تصدير KML قريباً');
      return;
    } else if (format === 'csv') {
      contentType = 'text/csv';
      // تحويل البيانات إلى CSV
      data = convertToCSV(data);
      fileName += '.csv';
    } else {
      throw new Error('صيغة التصدير غير مدعومة');
    }
    
    // إنشاء رابط تنزيل وتفعيله
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('خطأ في تصدير الطبقة:', error);
    alert('حدث خطأ أثناء تصدير الطبقة: ' + error.message);
  }
}

/**
 * تنسيق التاريخ الحالي للاستخدام في اسم الملف
 * @return {string} - التاريخ المنسق
 */
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
}

/**
 * تحويل بيانات GeoJSON إلى تنسيق CSV
 * @param {Object} geoJSON - بيانات GeoJSON
 * @return {string} - بيانات CSV
 */
function convertToCSV(geoJSON) {
  if (!geoJSON || !geoJSON.features || !geoJSON.features.length) {
    return '';
  }
  
  // استخراج خصائص العنصر الأول لتحديد العناوين
  const firstFeature = geoJSON.features[0];
  const headers = Object.keys(firstFeature.properties);
  
  // إضافة أعمدة الإحداثيات
  headers.push('longitude', 'latitude');
  
  // إنشاء سطر العناوين
  let csv = headers.join(',') + '\n';
  
  // إضافة بيانات كل عنصر
  geoJSON.features.forEach(feature => {
    const row = [];
    
    // إضافة قيم الخصائص
    headers.forEach(header => {
      if (header === 'longitude') {
        // استخراج إحداثيات الطول من الهندسة
        if (feature.geometry && feature.geometry.type === 'Point') {
          row.push(feature.geometry.coordinates[0]);
        } else {
          row.push('');
        }
      } else if (header === 'latitude') {
        // استخراج إحداثيات العرض من الهندسة
        if (feature.geometry && feature.geometry.type === 'Point') {
          row.push(feature.geometry.coordinates[1]);
        } else {
          row.push('');
        }
      } else {
        // قيمة الخاصية
        const value = feature.properties[header] || '';
        row.push(typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value);
      }
    });
    
    // إضافة السطر إلى الـ CSV
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * تصدير نتائج الاستعلام
 */
function exportQueryResults() {
  const queryResults = document.getElementById('queryResults');
  if (!queryResults) return;
  
  // التحقق من وجود نتائج
  if (queryResults.querySelector('.empty-state')) {
    alert('لا توجد نتائج للتصدير');
    return;
  }
  
  // تحويل نتائج الاستعلام إلى CSV
  try {
    // استرجاع البيانات من نتائج الاستعلام المعروضة
    const resultItems = queryResults.querySelectorAll('.result-item');
    if (!resultItems.length) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    
    // استخلاص العناوين من العناصر
    let csv = '';
    const headers = ['ID', 'Name', 'Type', 'Details'];
    csv += headers.join(',') + '\n';
    
    // إضافة كل نتيجة
    resultItems.forEach(item => {
      const id = item.getAttribute('data-id') || '';
      const name = item.querySelector('.result-title')?.textContent || '';
      const type = item.getAttribute('data-type') || '';
      const details = item.querySelector('.result-details')?.textContent.replace(/,/g, ';') || '';
      
      const row = [
        id,
        `"${name.replace(/"/g, '""')}"`,
        type,
        `"${details.replace(/"/g, '""')}"`
      ];
      
      csv += row.join(',') + '\n';
    });
    
    // إنشاء ملف للتنزيل
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${formatDate()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('خطأ في تصدير نتائج الاستعلام:', error);
    alert('حدث خطأ أثناء تصدير النتائج: ' + error.message);
  }
}

/**
 * طباعة نتائج الاستعلام
 */
function printQueryResults() {
  const queryResults = document.getElementById('queryResults');
  if (!queryResults) return;
  
  // التحقق من وجود نتائج
  if (queryResults.querySelector('.empty-state')) {
    alert('لا توجد نتائج للطباعة');
    return;
  }
  
  // إنشاء نافذة الطباعة
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لهذا الموقع');
    return;
  }
  
  // إعداد محتوى نافذة الطباعة
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>نتائج الاستعلام - تحليل أحياء حلب</title>
      <style>
        body {
          font-family: 'Cairo', sans-serif;
          padding: 20px;
          direction: rtl;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        .result-item {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .result-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .result-details {
          font-size: 14px;
          color: #555;
        }
        .print-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>نتائج الاستعلام - تحليل أحياء حلب</h1>
      <div class="results-container">
        ${queryResults.innerHTML}
      </div>
      <div class="print-footer">
        تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleDateString('ar-SY')}
      </div>
      <div class="no-print">
        <button onclick="window.print()">طباعة</button>
        <button onclick="window.close()">إغلاق</button>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * تهيئة واجهة التصفية حسب القطاعات
 */
function initSectorFilter() {
  // تعبئة قائمة القطاعات
  populateSectorFilterSelect();
  
  // إضافة المستمع لزر التطبيق
  const applySectorFilterBtn = document.getElementById('applySectorFilterBtn');
  if (applySectorFilterBtn) {
    applySectorFilterBtn.addEventListener('click', function() {
      filterNeighborhoodsBySector();
    });
  }
  
  // إضافة المستمع لزر تصدير النتائج المصفاة
  const exportFilteredBtn = document.getElementById('exportFilteredBtn');
  if (exportFilteredBtn) {
    exportFilteredBtn.addEventListener('click', function() {
      exportFilteredResults();
    });
  }
}

/**
 * تعبئة قائمة القطاعات للتصفية
 */
function populateSectorFilterSelect() {
  const sectorFilterSelect = document.getElementById('sectorFilterSelect');
  if (!sectorFilterSelect) return;
  
  // مسح الخيارات السابقة ماعدا الخيار الافتراضي
  while (sectorFilterSelect.options.length > 1) {
    sectorFilterSelect.remove(1);
  }
  
  // الحصول على القطاعات من بيانات الأحياء إذا كانت متاحة
  if (typeof neighborhoodsData !== 'undefined' && neighborhoodsData.features) {
    // استخراج القطاعات الفريدة
    const uniqueSectors = new Set();
    neighborhoodsData.features.forEach(feature => {
      const sector = feature.properties.Sector_01;
      if (sector) {
        uniqueSectors.add(sector);
      }
    });
    
    // إضافة كل قطاع إلى القائمة
    uniqueSectors.forEach(sector => {
      const option = document.createElement('option');
      option.value = sector;
      option.textContent = sector;
      sectorFilterSelect.appendChild(option);
    });
  }
  
  // إضافة خيارات دوائر الخدمات إذا كانت متاحة
  if (typeof serviceSectors !== 'undefined' && serviceSectors.length) {
    // إضافة عنوان المجموعة
    const optgroup = document.createElement('optgroup');
    optgroup.label = 'دوائر الخدمات';
    
    // إضافة دوائر الخدمات
    serviceSectors.forEach(sector => {
      const option = document.createElement('option');
      option.value = 'service_' + sector.id;
      option.textContent = sector.name;
      optgroup.appendChild(option);
    });
    
    sectorFilterSelect.appendChild(optgroup);
  }
}

/**
 * تصفية الأحياء حسب القطاع المحدد
 */
function filterNeighborhoodsBySector() {
  const sectorFilterSelect = document.getElementById('sectorFilterSelect');
  const filterResults = document.getElementById('filterResults');
  
  if (!sectorFilterSelect || !filterResults) return;
  
  const selectedValue = sectorFilterSelect.value;
  
  // مسح النتائج السابقة
  filterResults.innerHTML = '';
  
  // إذا لم يتم اختيار قطاع
  if (!selectedValue) {
    filterResults.innerHTML = '<div class="empty-state">اختر قطاعًا لعرض الأحياء</div>';
    return;
  }
  
  // التحقق مما إذا كانت القيمة المحددة هي دائرة خدمات
  if (selectedValue.startsWith('service_')) {
    // استخراج معرف دائرة الخدمات
    const serviceId = parseInt(selectedValue.replace('service_', ''));
    filterNeighborhoodsByServiceSector(serviceId);
    return;
  }
  
  // تصفية الأحياء بناءً على القطاع المحدد
  if (typeof neighborhoodsData !== 'undefined' && neighborhoodsData.features) {
    // الحصول على الأحياء في القطاع المحدد
    const filteredNeighborhoods = neighborhoodsData.features.filter(feature => 
      feature.properties.Sector_01 === selectedValue
    );
    
    // إذا لم يتم العثور على أحياء
    if (filteredNeighborhoods.length === 0) {
      filterResults.innerHTML = '<div class="empty-state">لا توجد أحياء في القطاع المحدد</div>';
      return;
    }
    
    // إنشاء قائمة بالأحياء
    const resultsList = document.createElement('div');
    resultsList.className = 'filter-results-list';
    
    // إضافة كل حي إلى القائمة
    filteredNeighborhoods.forEach(neighborhood => {
      const resultItem = document.createElement('div');
      resultItem.className = 'filter-result-item';
      resultItem.setAttribute('data-id', neighborhood.properties.ID);
      
      resultItem.innerHTML = `
        <span>${neighborhood.properties.Names || neighborhood.properties.Name_En || 'حي رقم ' + neighborhood.properties.ID}</span>
        <button class="zoom-btn" data-id="${neighborhood.properties.ID}" title="التكبير على الحي">
          <i class="fas fa-search-plus"></i>
        </button>
      `;
      
      resultsList.appendChild(resultItem);
      
      // إضافة مستمع لزر التكبير
      const zoomBtn = resultItem.querySelector('.zoom-btn');
      if (zoomBtn) {
        zoomBtn.addEventListener('click', function() {
          zoomToNeighborhood(this.getAttribute('data-id'));
        });
      }
    });
    
    // إضافة القائمة إلى نتائج التصفية
    filterResults.appendChild(resultsList);
    
    // تسليط الضوء على الأحياء في الخريطة
    highlightFilteredNeighborhoods(filteredNeighborhoods);
  } else {
    filterResults.innerHTML = '<div class="empty-state">بيانات الأحياء غير متاحة</div>';
  }
}

/**
 * تصفية الأحياء حسب دائرة الخدمات
 * @param {number} serviceId - معرف دائرة الخدمات
 */
function filterNeighborhoodsByServiceSector(serviceId) {
  const filterResults = document.getElementById('filterResults');
  
  // التحقق من وجود دائرة الخدمات
  const serviceSector = serviceSectors.find(s => s.id === serviceId);
  if (!serviceSector) {
    filterResults.innerHTML = '<div class="empty-state">لم يتم العثور على دائرة الخدمات</div>';
    return;
  }
  
  // الحصول على نطاق دائرة الخدمات من طبقة GeoJSON
  if (typeof serviceSectorsData !== 'undefined' && serviceSectorsData.features) {
    const serviceSectorFeature = serviceSectorsData.features.find(
      feature => feature.properties.OBJECTID === serviceId
    );
    
    if (serviceSectorFeature) {
      // استخدام leaflet لإنشاء حدود الـ bounds
      try {
        // إنشاء كائن GeoJSON مؤقت للحصول على الحدود
        const tempLayer = L.geoJSON({
          type: 'Feature',
          geometry: serviceSectorFeature.geometry
        });
        
        // الحصول على حدود دائرة الخدمات
        const serviceBounds = tempLayer.getBounds();
        
        // البحث عن الأحياء الموجودة ضمن حدود دائرة الخدمات
        const neighborhoodsInService = [];
        
        if (typeof neighborhoodsData !== 'undefined' && neighborhoodsData.features) {
          neighborhoodsData.features.forEach(feature => {
            // إنشاء كائن GeoJSON مؤقت للحي
            const neighborhoodLayer = L.geoJSON({
              type: 'Feature',
              geometry: feature.geometry
            });
            
            // التحقق من تداخل الحي مع دائرة الخدمات (تقريبي)
            const neighborhoodBounds = neighborhoodLayer.getBounds();
            if (serviceBounds.intersects(neighborhoodBounds)) {
              neighborhoodsInService.push(feature);
            }
          });
        }
        
        // عرض الأحياء في القائمة
        if (neighborhoodsInService.length === 0) {
          filterResults.innerHTML = `<div class="empty-state">لم يتم العثور على أحياء في دائرة خدمات ${serviceSector.name}</div>`;
        } else {
          // إنشاء قائمة بالأحياء
          const resultsList = document.createElement('div');
          resultsList.className = 'filter-results-list';
          
          // إضافة العنوان
          const header = document.createElement('div');
          header.className = 'filter-results-header';
          header.innerHTML = `<strong>الأحياء في دائرة خدمات ${serviceSector.name}:</strong> (${neighborhoodsInService.length} حي)`;
          resultsList.appendChild(header);
          
          // إضافة كل حي إلى القائمة
          neighborhoodsInService.forEach(neighborhood => {
            const resultItem = document.createElement('div');
            resultItem.className = 'filter-result-item';
            resultItem.setAttribute('data-id', neighborhood.properties.ID);
            
            resultItem.innerHTML = `
              <span>${neighborhood.properties.Names || neighborhood.properties.Name_En || 'حي رقم ' + neighborhood.properties.ID}</span>
              <button class="zoom-btn" data-id="${neighborhood.properties.ID}" title="التكبير على الحي">
                <i class="fas fa-search-plus"></i>
              </button>
            `;
            
            resultsList.appendChild(resultItem);
            
            // إضافة مستمع لزر التكبير
            const zoomBtn = resultItem.querySelector('.zoom-btn');
            if (zoomBtn) {
              zoomBtn.addEventListener('click', function() {
                zoomToNeighborhood(this.getAttribute('data-id'));
              });
            }
          });
          
          // مسح النتائج السابقة وإضافة القائمة الجديدة
          filterResults.innerHTML = '';
          filterResults.appendChild(resultsList);
          
          // تسليط الضوء على الأحياء في الخريطة
          highlightFilteredNeighborhoods(neighborhoodsInService);
          
          // تسليط الضوء على دائرة الخدمات
          highlightServiceSector(serviceId);
        }
      } catch (error) {
        console.error('خطأ في تصفية الأحياء حسب دائرة الخدمات:', error);
        filterResults.innerHTML = `<div class="empty-state">حدث خطأ أثناء تصفية الأحياء: ${error.message}</div>`;
      }
    } else {
      filterResults.innerHTML = '<div class="empty-state">لم يتم العثور على بيانات دائرة الخدمات</div>';
    }
  } else {
    filterResults.innerHTML = '<div class="empty-state">بيانات دوائر الخدمات غير متاحة</div>';
  }
}

/**
 * تسليط الضوء على الأحياء المصفاة في الخريطة
 * @param {Array} neighborhoods - قائمة الأحياء المصفاة
 */
function highlightFilteredNeighborhoods(neighborhoods) {
  // إزالة التسليط السابق
  if (window.highlightedFilterLayer && map.hasLayer(window.highlightedFilterLayer)) {
    map.removeLayer(window.highlightedFilterLayer);
  }
  
  // إنشاء طبقة جديدة للأحياء المسلط عليها الضوء
  window.highlightedFilterLayer = L.geoJSON({
    type: 'FeatureCollection',
    features: neighborhoods
  }, {
    style: function() {
      return {
        color: '#00ffff',
        weight: 3,
        opacity: 1,
        fillColor: '#00ffff',
        fillOpacity: 0.3
      };
    }
  }).addTo(map);
  
  // التكبير على الأحياء المصفاة
  map.fitBounds(window.highlightedFilterLayer.getBounds());
}

/**
 * التكبير على حي محدد
 * @param {string} id - معرف الحي
 */
function zoomToNeighborhood(id) {
  if (typeof neighborhoodsData === 'undefined' || !neighborhoodsData.features) {
    return;
  }
  
  // البحث عن الحي بالمعرف
  const neighborhood = neighborhoodsData.features.find(
    feature => feature.properties.ID.toString() === id.toString()
  );
  
  if (!neighborhood) {
    return;
  }
  
  // إنشاء طبقة مؤقتة للحي
  const tempLayer = L.geoJSON({
    type: 'Feature',
    geometry: neighborhood.geometry
  });
  
  // التكبير على الحي
  map.fitBounds(tempLayer.getBounds());
  
  // تسليط الضوء على الحي لفترة مؤقتة
  const highlightLayer = L.geoJSON({
    type: 'Feature',
    geometry: neighborhood.geometry
  }, {
    style: function() {
      return {
        color: '#ff00ff',
        weight: 3,
        opacity: 1,
        fillColor: '#ff00ff',
        fillOpacity: 0.5
      };
    }
  }).addTo(map);
  
  // إزالة التسليط بعد 3 ثوانٍ
  setTimeout(function() {
    map.removeLayer(highlightLayer);
  }, 3000);
}

/**
 * تصدير النتائج المصفاة إلى ملف
 */
function exportFilteredResults() {
  const filterResults = document.getElementById('filterResults');
  
  if (!filterResults) return;
  
  // التحقق من وجود نتائج
  if (filterResults.querySelector('.empty-state')) {
    alert('لا توجد نتائج للتصدير');
    return;
  }
  
  // الحصول على القطاع المحدد
  const sectorFilterSelect = document.getElementById('sectorFilterSelect');
  const selectedSector = sectorFilterSelect ? sectorFilterSelect.options[sectorFilterSelect.selectedIndex].text : '';
  
  try {
    // البحث عن الأحياء التي تم تصفيتها
    const filteredItems = filterResults.querySelectorAll('.filter-result-item');
    if (!filteredItems.length) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    
    // جمع معرفات الأحياء المصفاة
    const filteredIds = Array.from(filteredItems).map(item => 
      item.getAttribute('data-id')
    ).filter(id => id);
    
    // الحصول على بيانات الأحياء المصفاة
    const filteredNeighborhoods = [];
    if (typeof neighborhoodsData !== 'undefined' && neighborhoodsData.features) {
      neighborhoodsData.features.forEach(feature => {
        if (filteredIds.includes(feature.properties.ID.toString())) {
          filteredNeighborhoods.push(feature);
        }
      });
    }
    
    // إنشاء كائن GeoJSON للتصدير
    const exportData = {
      type: 'FeatureCollection',
      features: filteredNeighborhoods
    };
    
    // تصدير البيانات كملف GeoJSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_neighborhoods_${selectedSector.replace(/\s+/g, '_')}_${formatDate()}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('خطأ في تصدير النتائج المصفاة:', error);
    alert('حدث خطأ أثناء تصدير النتائج: ' + error.message);
  }
}

// كشف عن الوظائف المطلوبة للاستخدام العام
window.importFile = importFile;
window.exportLayer = exportLayer;
window.exportQueryResults = exportQueryResults;
window.printQueryResults = printQueryResults;
window.filterNeighborhoodsBySector = filterNeighborhoodsBySector;
window.exportFilteredResults = exportFilteredResults;