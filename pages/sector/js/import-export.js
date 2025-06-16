/**
 * وظائف استيراد وتصدير البيانات - نسخة محدثة
 * يدعم تصدير جميع الطبقات بجميع الصيغ المطلوبة
 * 
 * المكتبات المطلوبة (يجب إضافتها في HTML):
 * 
 * <!-- للتصدير كـ Excel -->
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
 * 
 * <!-- للتصدير كـ PDF -->
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 * 
 * <!-- للتصدير كـ Shapefile -->
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
 * <script src="https://unpkg.com/shp-write@0.3.2/shp-write.js"></script>
 * 
 * استخدام:
 * 1. تأكد من تحميل بيانات الأحياء (neighborhoodsData) ودوائر الخدمات (serviceSectorsData)
 * 2. تأكد من وجود العناصر HTML: exportLayerSelect, exportFormat, exportLayerBtn
 * 3. الملف سيتم تهيئته تلقائياً عند تحميل الصفحة
 */

document.addEventListener("DOMContentLoaded", function () {
  // تجنب التهيئة المتكررة
  if (window.importExportInitialized) {
    return;
  }
  window.importExportInitialized = true;
  
  console.log("تهيئة نظام الاستيراد والتصدير...");
  
  // تهيئة واجهة الاستيراد/التصدير
  initImportExport();
});

/**
 * تهيئة واجهة الاستيراد/التصدير
 */
function initImportExport() {
  // التأكد من توفر البيانات كمتغيرات عامة
  if (typeof neighborhoodsData !== 'undefined' && !window.neighborhoodsData) {
    window.neighborhoodsData = neighborhoodsData;
  }
  
  if (typeof serviceSectorsData !== 'undefined' && !window.serviceSectorsData) {
    window.serviceSectorsData = serviceSectorsData;
  }
  
  // الاستماع لحدث تحميل بيانات دوائر الخدمات
  document.addEventListener('serviceSectorsLoaded', function() {
    console.log("تم استلام إشعار تحميل بيانات دوائر الخدمات");
    // تحديث مرجع البيانات في النافذة العامة إذا لم تكن متوفرة
    if (!window.serviceSectorsData && typeof serviceSectorsData !== 'undefined') {
      window.serviceSectorsData = serviceSectorsData;
    }
  });
  
  // عناصر واجهة المستخدم
  const exportLayerSelect = document.getElementById("exportLayerSelect");
  const exportFormatSelect = document.getElementById("exportFormat");
  const exportButton = document.getElementById("exportLayerBtn");

  // تهيئة زر التصدير
  if (exportButton) {
    // إزالة مستمع الأحداث السابق إن وجد
    const oldExportHandler = exportButton._exportHandler;
    if (oldExportHandler) {
      exportButton.removeEventListener("click", oldExportHandler);
    }
    
    // إنشاء مستمع أحداث جديد
    const newExportHandler = function () {
      const layerName = exportLayerSelect ? exportLayerSelect.value : null;
      const format = exportFormatSelect ? exportFormatSelect.value : null;

      if (!layerName || layerName.trim() === "" || layerName === "-- اختر طبقة --") {
        showAlert("الرجاء اختيار طبقة للتصدير", "warning");
        return;
      }

      if (!format || format.trim() === "" || format === "اختر صيغة التصدير") {
        showAlert("الرجاء اختيار صيغة التصدير", "warning");
        return;
      }

      exportLayer(layerName, format);
    };
    
    // حفظ مرجع للمستمع الجديد
    exportButton._exportHandler = newExportHandler;
    exportButton.addEventListener("click", newExportHandler);
  }

  console.log("تم تهيئة نظام الاستيراد والتصدير بنجاح");
  
  // إضافة مستمع لإعادة المحاولة التلقائية عند تحميل البيانات
  setupAutoRetryOnDataLoad();
}

/**
 * إعداد إعادة المحاولة التلقائية عند تحميل البيانات
 */
function setupAutoRetryOnDataLoad() {
  let pendingExport = null;
  
  // مستمع للحصول على البيانات المعلقة
  document.addEventListener('serviceSectorsLoaded', function(event) {
    console.log("تم تحميل بيانات دوائر الخدمات، فحص الطلبات المعلقة...");
    
    if (pendingExport) {
      console.log(`إعادة محاولة تصدير ${pendingExport.layer} بصيغة ${pendingExport.format}`);
      
      setTimeout(() => {
        try {
          exportLayer(pendingExport.layer, pendingExport.format);
          showAlert("تم إعادة محاولة التصدير تلقائياً بعد تحميل البيانات", "success");
        } catch (error) {
          console.error("فشلت إعادة المحاولة:", error);
          showAlert("فشلت إعادة المحاولة: " + error.message, "error");
        } finally {
          pendingExport = null;
        }
      }, 500); // انتظار قصير للتأكد من استقرار البيانات
    }
  });
  
  // تحسين معالجة الأخطاء في التصدير
  const originalExportLayer = window.exportLayer || exportLayer;
  
  // التأكد من توفر exportLayer في النطاق العام
  window.exportLayer = function(layerName, format) {
    try {
      return originalExportLayer(layerName, format);
    } catch (error) {
      // إذا كان الخطأ متعلقاً بعدم تحميل بيانات دوائر الخدمات
      if (error.message.includes("لم يتم تحميلها بعد") && 
         (layerName === "service-sectors" || layerName === "service-sector-labels")) {
        
        console.log("حفظ طلب التصدير للمحاولة لاحقاً...");
        pendingExport = { layer: layerName, format: format };
        
        showAlert("جاري تحميل البيانات، سيتم التصدير تلقائياً عند الانتهاء...", "info");
        return;
      }
      
      // إعادة رمي الخطأ للأخطاء الأخرى
      throw error;
    }
  };
}

/**
 * تصدير طبقة معينة بالصيغة المحددة
 * @param {string} layerName - اسم الطبقة
 * @param {string} format - صيغة التصدير
 */
function exportLayer(layerName, format) {
  // منع التصدير المتعدد
  if (window.exportInProgress) {
    showAlert("جاري تصدير طبقة أخرى، يرجى الانتظار", "info");
    return;
  }
  
  window.exportInProgress = true;
  showAlert("جاري تصدير الطبقة...", "info");

  try {
    let data = null;
    let fileName = "";

    // الحصول على بيانات الطبقة المحددة
    switch (layerName) {
      case "neighborhoods":
        data = getNeighborhoodsData();
        fileName = `neighborhoods_${formatDate()}`;
        break;
        
      case "neighborhood-labels":
        data = getNeighborhoodLabelsData();
        fileName = `neighborhood_labels_${formatDate()}`;
        break;
        
      case "service-sectors":
        // التحقق من حالة التحميل أولاً
        if (window.serviceSectorsDataLoaded === false) {
          throw new Error("بيانات دوائر الخدمات لم يتم تحميلها بعد، يرجى المحاولة لاحقاً");
        }
        data = getServiceSectorsData();
        fileName = `service_sectors_${formatDate()}`;
        break;
        
      case "service-sector-labels":
        // التحقق من حالة التحميل أولاً
        if (window.serviceSectorsDataLoaded === false) {
          throw new Error("بيانات دوائر الخدمات لم يتم تحميلها بعد، يرجى المحاولة لاحقاً");
        }
        data = getServiceSectorLabelsData();
        fileName = `service_sector_labels_${formatDate()}`;
        break;
        
      default:
        throw new Error(`الطبقة "${layerName}" غير مدعومة`);
    }

    if (!data) {
      throw new Error("لا توجد بيانات للطبقة المحددة");
    }

    // تصدير البيانات بالصيغة المطلوبة
    exportDataInFormat(data, fileName, format);
    
    showAlert("تم تصدير الطبقة بنجاح", "success");
    
  } catch (error) {
    console.error("خطأ في تصدير الطبقة:", error);
    showAlert("حدث خطأ أثناء تصدير الطبقة: " + error.message, "error");
  } finally {
    window.exportInProgress = false;
  }
}

/**
 * الحصول على بيانات الأحياء
 */
function getNeighborhoodsData() {
  const neighborhoodsSource = window.neighborhoodsData || 
                             (typeof neighborhoodsData !== 'undefined' ? neighborhoodsData : null);
  
  if (!neighborhoodsSource || !neighborhoodsSource.features) {
    throw new Error("بيانات الأحياء غير متوفرة");
  }
  
  return neighborhoodsSource;
}

/**
 * الحصول على بيانات مسميات الأحياء
 */
function getNeighborhoodLabelsData() {
  const neighborhoodsSource = window.neighborhoodsData || 
                             (typeof neighborhoodsData !== 'undefined' ? neighborhoodsData : null);
  
  if (!neighborhoodsSource || !neighborhoodsSource.features) {
    throw new Error("بيانات الأحياء غير متوفرة لإنشاء المسميات");
  }
  
  // تحويل مضلعات الأحياء إلى نقاط للمسميات
  const features = neighborhoodsSource.features.map((feature) => {
    if (!feature.geometry || !feature.geometry.coordinates || !feature.geometry.coordinates[0]) {
      return null;
    }
    
    const center = calculatePolygonCenter(feature.geometry.coordinates[0]);
    const name = feature.properties.Names || 
                 feature.properties.Name_En || 
                 feature.properties.name || 
                 feature.properties.NAME || 
                 "غير معروف";
    
    return {
      type: "Feature",
      geometry: { 
        type: "Point", 
        coordinates: [center.lng, center.lat] 
      },
      properties: { 
        name: name,
        original_id: feature.properties.OBJECTID || feature.properties.id,
        ...feature.properties
      }
    };
  }).filter(f => f !== null);
  
  return { type: "FeatureCollection", features };
}

/**
 * الحصول على بيانات دوائر الخدمات
 */
function getServiceSectorsData() {
  // محاولة الحصول على البيانات من مصادر مختلفة
  let serviceSectorsSource = window.serviceSectorsData ||
                            (typeof serviceSectorsData !== 'undefined' ? serviceSectorsData : null);
  
  // إذا لم تكن البيانات متوفرة، نتحقق من التحميل المؤجل
  if (!serviceSectorsSource || !serviceSectorsSource.features) {
    console.log("بيانات دوائر الخدمات غير متوفرة، محاولة إعادة التحقق...");
    
    // التحقق من حالة التحميل
    if (window.serviceSectorsDataLoaded === false) {
      throw new Error("بيانات دوائر الخدمات لم يتم تحميلها بعد، يرجى المحاولة لاحقاً");
    }
    
    // إعادة التحقق من المتغيرات العامة
    if (typeof serviceSectorsData !== 'undefined') {
      serviceSectorsSource = serviceSectorsData;
      if (serviceSectorsSource && serviceSectorsSource.features) {
        window.serviceSectorsData = serviceSectorsData;
      }
    }
  }
  
  if (!serviceSectorsSource || !serviceSectorsSource.features) {
    console.error("فشل في العثور على بيانات دوائر الخدمات");
    throw new Error("بيانات دوائر الخدمات غير متوفرة");
  }
  
  console.log("تم العثور على بيانات دوائر الخدمات:", serviceSectorsSource.features.length, "عنصر");
  return serviceSectorsSource;
}

/**
 * الحصول على بيانات مسميات دوائر الخدمات
 */
function getServiceSectorLabelsData() {
  // محاولة الحصول على البيانات من مصادر مختلفة
  let serviceSectorsSource = window.serviceSectorsData ||
                            (typeof serviceSectorsData !== 'undefined' ? serviceSectorsData : null);
  
  // إذا لم تكن البيانات متوفرة، نتحقق من التحميل المؤجل
  if (!serviceSectorsSource) {
    console.log("بيانات دوائر الخدمات غير متوفرة لإنشاء المسميات، محاولة إعادة التحقق...");
    
    // إعادة التحقق من المتغيرات العامة
    if (typeof serviceSectorsData !== 'undefined') {
      serviceSectorsSource = serviceSectorsData;
      window.serviceSectorsData = serviceSectorsData;
    }
  }
  
  if (!serviceSectorsSource || !serviceSectorsSource.features) {
    console.error("فشل في العثور على بيانات دوائر الخدمات لإنشاء المسميات");
    throw new Error("بيانات دوائر الخدمات غير متوفرة لإنشاء المسميات");
  }
  
  // تحويل مضلعات دوائر الخدمات إلى نقاط للمسميات
  const features = serviceSectorsSource.features.map((feature) => {
    if (!feature.geometry || !feature.geometry.coordinates || !feature.geometry.coordinates[0]) {
      return null;
    }
    
    const center = calculatePolygonCenter(feature.geometry.coordinates[0]);
    const name = feature.properties.Name || 
                 feature.properties.Name_En || 
                 feature.properties.name || 
                 feature.properties.NAME || 
                 "غير معروف";
    
    return {
      type: "Feature",
      geometry: { 
        type: "Point", 
        coordinates: [center.lng, center.lat] 
      },
      properties: { 
        name: name,
        name_en: feature.properties.Name_En,
        original_id: feature.properties.OBJECTID || feature.properties.id,
        population: feature.properties.Pop,
        ...feature.properties
      }
    };
  }).filter(f => f !== null);
  
  return { type: "FeatureCollection", features };
}

/**
 * حساب مركز المضلع
 */
function calculatePolygonCenter(coordinates) {
  let totalLat = 0;
  let totalLng = 0;
  let pointCount = 0;
  
  coordinates.forEach((coord) => {
    totalLng += coord[0];
    totalLat += coord[1];
    pointCount++;
  });
  
  return {
    lat: totalLat / pointCount,
    lng: totalLng / pointCount
  };
}

/**
 * تصدير البيانات بالصيغة المحددة
 */
function exportDataInFormat(data, fileName, format) {
  let content = "";
  let contentType = "";
  let fileExtension = "";

  switch (format) {
    case "geojson":
      content = JSON.stringify(data, null, 2);
      contentType = "application/json";
      fileExtension = ".geojson";
      break;
      
    case "kml":
      content = convertToKML(data);
      contentType = "application/vnd.google-earth.kml+xml";
      fileExtension = ".kml";
      break;
      
    case "shp":
      exportAsShapefile(data, fileName);
      return; // الدالة تتعامل مع التصدير بنفسها
      
    case "csv":
      content = convertToCSV(data);
      contentType = "text/csv";
      fileExtension = ".csv";
      break;
      
    case "excel":
      exportAsExcel(data, fileName);
      return; // الدالة تتعامل مع التصدير بنفسها
      
    case "pdf":
      exportAsPDF(data, fileName);
      return; // الدالة تتعامل مع التصدير بنفسها
      
    default:
      throw new Error(`صيغة التصدير "${format}" غير مدعومة`);
  }

  // تنزيل الملف
  downloadFile(content, fileName + fileExtension, contentType);
}

/**
 * تحويل GeoJSON إلى KML
 */
function convertToKML(geoJSON) {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>البيانات المصدرة</name>
    <description>تم التصدير من نظام الأحياء</description>
`;

  geoJSON.features.forEach((feature, index) => {
    const properties = feature.properties;
    const geometry = feature.geometry;
    
    kml += `    <Placemark>
      <name>${escapeXML(properties.name || properties.Names || properties.Name || `عنصر ${index + 1}`)}</name>
      <description><![CDATA[`;
    
    // إضافة خصائص العنصر
    Object.keys(properties).forEach(key => {
      if (properties[key] !== null && properties[key] !== undefined) {
        kml += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
      }
    });
    
    kml += `]]></description>`;
    
    // إضافة الهندسة
    if (geometry.type === "Point") {
      kml += `      <Point>
        <coordinates>${geometry.coordinates[0]},${geometry.coordinates[1]},0</coordinates>
      </Point>`;
    } else if (geometry.type === "Polygon") {
      kml += `      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>`;
      geometry.coordinates[0].forEach(coord => {
        kml += `${coord[0]},${coord[1]},0 `;
      });
      kml += `</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>`;
    }
    
    kml += `    </Placemark>
`;
  });

  kml += `  </Document>
</kml>`;

  return kml;
}

/**
 * تحويل GeoJSON إلى CSV
 */
function convertToCSV(geoJSON) {
  if (!geoJSON || !geoJSON.features || !geoJSON.features.length) {
    return "لا توجد بيانات للتصدير";
  }

  // جمع جميع خصائص العناصر لإنشاء العناوين
  const allHeaders = new Set();
  geoJSON.features.forEach(feature => {
    Object.keys(feature.properties).forEach(key => {
      allHeaders.add(key);
    });
  });

  // إضافة أعمدة الإحداثيات
  const headers = Array.from(allHeaders);
  if (geoJSON.features.some(f => f.geometry && f.geometry.type === "Point")) {
    headers.push("longitude", "latitude");
  }

  // إنشاء سطر العناوين
  let csv = headers.map(h => `"${h}"`).join(",") + "\n";

  // إضافة بيانات كل عنصر
  geoJSON.features.forEach(feature => {
    const row = [];

    headers.forEach(header => {
      if (header === "longitude") {
        if (feature.geometry && feature.geometry.type === "Point") {
          row.push(feature.geometry.coordinates[0]);
        } else {
          row.push("");
        }
      } else if (header === "latitude") {
        if (feature.geometry && feature.geometry.type === "Point") {
          row.push(feature.geometry.coordinates[1]);
        } else {
          row.push("");
        }
      } else {
        const value = feature.properties[header] || "";
        row.push(typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value);
      }
    });

    csv += row.join(",") + "\n";
  });

  return csv;
}

/**
 * تصدير كـ Shapefile
 */
function exportAsShapefile(geoJSON, fileName) {
  try {
    // تحقق من وجود مكتبة shp-write
    if (typeof shpwrite === 'undefined') {
      // استخدام طريقة بديلة - تحويل إلى GeoJSON مضغوط
      const content = JSON.stringify(geoJSON, null, 2);
      const zip = new JSZip();
      zip.file(fileName + ".geojson", content);
      zip.file("README.txt", "هذا ملف GeoJSON بدلاً من Shapefile لأن المكتبة المطلوبة غير متوفرة.");
      
      zip.generateAsync({type:"blob"}).then(function(content) {
        downloadFile(content, fileName + "_geojson.zip", "application/zip");
      });
      return;
    }

    // استخدام مكتبة shp-write إذا كانت متوفرة
    const options = {
      folder: fileName,
      types: {
        point: 'points',
        polygon: 'polygons',
        line: 'lines'
      }
    };

    const zip = shpwrite.zip(geoJSON, options);
    downloadFile(zip, fileName + ".zip", "application/zip");
    
  } catch (error) {
    console.error("خطأ في تصدير Shapefile:", error);
    // تصدير كـ GeoJSON بدلاً من ذلك
    const content = JSON.stringify(geoJSON, null, 2);
    downloadFile(content, fileName + ".geojson", "application/json");
    showAlert("تم التصدير كـ GeoJSON بدلاً من Shapefile", "warning");
  }
}

/**
 * تصدير كـ Excel
 */
function exportAsExcel(geoJSON, fileName) {
  try {
    // تحقق من وجود مكتبة XLSX
    if (typeof XLSX === 'undefined') {
      // تصدير كـ CSV بدلاً من ذلك
      const csvContent = convertToCSV(geoJSON);
      downloadFile(csvContent, fileName + ".csv", "text/csv");
      showAlert("تم التصدير كـ CSV بدلاً من Excel", "warning");
      return;
    }

    // تحويل GeoJSON إلى تنسيق Excel
    const worksheet_data = [];
    
    // إضافة العناوين
    if (geoJSON.features.length > 0) {
      const headers = Object.keys(geoJSON.features[0].properties);
      if (geoJSON.features[0].geometry && geoJSON.features[0].geometry.type === "Point") {
        headers.push("longitude", "latitude");
      }
      worksheet_data.push(headers);
      
      // إضافة البيانات
      geoJSON.features.forEach(feature => {
        const row = [];
        Object.keys(feature.properties).forEach(key => {
          row.push(feature.properties[key]);
        });
        
        if (feature.geometry && feature.geometry.type === "Point") {
          row.push(feature.geometry.coordinates[0]);
          row.push(feature.geometry.coordinates[1]);
        }
        
        worksheet_data.push(row);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(worksheet_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");
    
    XLSX.writeFile(wb, fileName + ".xlsx");
    
  } catch (error) {
    console.error("خطأ في تصدير Excel:", error);
    // تصدير كـ CSV بدلاً من ذلك
    const csvContent = convertToCSV(geoJSON);
    downloadFile(csvContent, fileName + ".csv", "text/csv");
    showAlert("تم التصدير كـ CSV بدلاً من Excel", "warning");
  }
}

/**
 * تصدير كـ PDF (خريطة)
 */
function exportAsPDF(geoJSON, fileName) {
  try {
    // تحقق من وجود مكتبة jsPDF
    if (typeof jsPDF === 'undefined') {
      showAlert("مكتبة PDF غير متوفرة، سيتم تصدير كـ GeoJSON", "warning");
      const content = JSON.stringify(geoJSON, null, 2);
      downloadFile(content, fileName + ".geojson", "application/json");
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // إعداد الخط العربي إذا كان متوفراً
    doc.setFont('Arial', 'normal');
    
    // عنوان الخريطة
    doc.setFontSize(16);
    doc.text('خريطة البيانات المصدرة', 15, 20);
    
    // معلومات أساسية
    doc.setFontSize(12);
    doc.text(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-SY')}`, 15, 30);
    doc.text(`عدد العناصر: ${geoJSON.features.length}`, 15, 40);
    
    // رسم خريطة بسيطة إذا كانت البيانات تحتوي على إحداثيات
    if (geoJSON.features.length > 0 && geoJSON.features[0].geometry) {
      drawSimpleMap(doc, geoJSON, 15, 50, 260, 150);
    }
    
    // جدول البيانات
    let yPosition = 210;
    doc.setFontSize(10);
    
    geoJSON.features.slice(0, 10).forEach((feature, index) => {
      if (yPosition > 280) return; // تجنب تجاوز حدود الصفحة
      
      const name = feature.properties.name || 
                   feature.properties.Names || 
                   feature.properties.Name || 
                   `عنصر ${index + 1}`;
      
      doc.text(`${index + 1}. ${name}`, 15, yPosition);
      yPosition += 5;
    });
    
    if (geoJSON.features.length > 10) {
      doc.text(`... و ${geoJSON.features.length - 10} عنصر آخر`, 15, yPosition);
    }
    
    doc.save(fileName + '.pdf');
    
  } catch (error) {
    console.error("خطأ في تصدير PDF:", error);
    showAlert("حدث خطأ في تصدير PDF، سيتم تصدير كـ GeoJSON", "warning");
    const content = JSON.stringify(geoJSON, null, 2);
    downloadFile(content, fileName + ".geojson", "application/json");
  }
}

/**
 * رسم خريطة بسيطة في PDF
 */
function drawSimpleMap(doc, geoJSON, x, y, width, height) {
  try {
    // حساب حدود البيانات
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    geoJSON.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        } else if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach(coord => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          });
        }
      }
    });
    
    // رسم إطار الخريطة
    doc.rect(x, y, width, height);
    
    // رسم العناصر
    geoJSON.features.forEach(feature => {
      if (feature.geometry) {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          const screenX = x + ((lng - minLng) / (maxLng - minLng)) * width;
          const screenY = y + height - ((lat - minLat) / (maxLat - minLat)) * height;
          doc.circle(screenX, screenY, 1, 'F');
        }
      }
    });
    
  } catch (error) {
    console.error("خطأ في رسم الخريطة:", error);
  }
}

/**
 * تنزيل ملف
 */
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * تنسيق التاريخ
 */
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * تخطي الأحرف الخاصة في XML
 */
function escapeXML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * عرض تنبيه للمستخدم
 */
function showAlert(message, type = "info") {
  // استخدام نظام التنبيهات الموجود أو alert عادي
  if (typeof showNotification === 'function') {
    showNotification(message, type);
  } else {
    alert(message);
  }
  console.log(`${type.toUpperCase()}: ${message}`);
}

/**
 * إضافة طبقة مستوردة إلى قائمة الطبقات
 * @param {string} layerName - اسم الطبقة
 * @param {Object} layer - كائن الطبقة
 */
function addImportedLayerToList(layerName, layer) {
  // الحصول على قائمة الطبقات من الشريط الجانبي
  const layersList = document.getElementById("layersList");
  if (!layersList) {
    console.warn("لم يتم العثور على قائمة الطبقات");
    return;
  }

  // إنشاء معرف فريد للطبقة
  const layerId = "imported-layer-" + Date.now();

  // حفظ الطبقة في متغير عام للوصول إليها لاحقًا
  window.importedLayers = window.importedLayers || {};
  window.importedLayers[layerId] = layer;

  // إنشاء عنصر HTML للطبقة المستوردة
  const layerItem = document.createElement("div");
  layerItem.className = "layer-item imported-layer";
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
    checkbox.addEventListener("change", function () {
      toggleImportedLayer(layerId, this.checked);
    });
  }

  // زر التكبير
  const zoomBtn = layerItem.querySelector('[data-action="zoom"]');
  if (zoomBtn) {
    zoomBtn.addEventListener("click", function () {
      zoomToImportedLayer(layerId);
    });
  }

  // زر الحذف
  const removeBtn = layerItem.querySelector('[data-action="remove"]');
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      removeImportedLayer(layerId, layerItem);
      // إزالة الطبقة من قائمة التصدير
      const exportLayerSelect = document.getElementById("exportLayerSelect");
      if (exportLayerSelect) {
        const opt = exportLayerSelect.querySelector(
          `option[value="${layerId}"]`
        );
        if (opt) exportLayerSelect.removeChild(opt);
      }
    });
  }

  // إضافة الطبقة إلى قائمة التصدير
  const exportLayerSelect = document.getElementById("exportLayerSelect");
  if (exportLayerSelect) {
    // تحقق من عدم وجود الخيار مسبقاً
    if (!exportLayerSelect.querySelector(`option[value="${layerId}"]`)) {
      const opt = document.createElement("option");
      opt.value = layerId;
      opt.textContent = `${layerName} (مستورد)`;
      exportLayerSelect.appendChild(opt);
    }
  }
}

/**
 * تبديل حالة ظهور الطبقة المستوردة
 * @param {string} layerId - معرف الطبقة
 * @param {boolean} visible - حالة الظهور
 */
function toggleImportedLayer(layerId, visible) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer || !window.map) return;

  if (visible) {
    if (!window.map.hasLayer(layer)) {
      window.map.addLayer(layer);
    }
  } else {
    if (window.map.hasLayer(layer)) {
      window.map.removeLayer(layer);
    }
  }
}

/**
 * التكبير على الطبقة المستوردة
 * @param {string} layerId - معرف الطبقة
 */
function zoomToImportedLayer(layerId) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer || !window.map) return;

  if (layer.getBounds) {
    window.map.fitBounds(layer.getBounds());
  }
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
  if (window.map && window.map.hasLayer && window.map.hasLayer(layer)) {
    window.map.removeLayer(layer);
  }

  // حذف الطبقة من الكائن
  delete window.importedLayers[layerId];

  // إزالة العنصر من القائمة
  if (layerItem && layerItem.parentNode) {
    layerItem.parentNode.removeChild(layerItem);
  }
}

// تصدير الوظائف للاستخدام العام
window.exportLayer = exportLayer;
window.initImportExport = initImportExport;
window.addImportedLayerToList = addImportedLayerToList;
window.toggleImportedLayer = toggleImportedLayer;
window.zoomToImportedLayer = zoomToImportedLayer;
window.removeImportedLayer = removeImportedLayer;

console.log("تم تحميل وحدة الاستيراد والتصدير بنجاح");
