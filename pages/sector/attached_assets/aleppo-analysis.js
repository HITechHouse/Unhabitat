/**
 * aleppo-analysis.js
 * ملف لتحليل ومعالجة بيانات أحياء حلب
 */

// وظائف التحليل المكاني

/**
 * حساب إحصائيات أساسية لمجموعة بيانات GeoJSON
 * @param {Object} geojsonData - بيانات GeoJSON
 * @return {Object} إحصائيات أساسية
 */
function calculateBasicStatistics(geojsonData) {
  if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
    console.error('بيانات GeoJSON غير صالحة أو فارغة');
    return {
      count: 0,
      totalArea: 0,
      avgArea: 0,
      minArea: 0,
      maxArea: 0,
      sectors: {},
      sectorCount: 0
    };
  }
  
  const features = geojsonData.features;
  const count = features.length;
  
  // حساب المساحات
  let totalArea = 0;
  let minArea = Infinity;
  let maxArea = 0;
  
  // إحصاء القطاعات
  const sectors = {};
  
  features.forEach(feature => {
    // حساب المساحة
    const area = feature.properties.Shape_Area || 0;
    totalArea += area;
    
    if (area < minArea) minArea = area;
    if (area > maxArea) maxArea = area;
    
    // إحصاء القطاع
    const sector = feature.properties.Sector_01 || 'غير محدد';
    if (sectors[sector]) {
      sectors[sector]++;
    } else {
      sectors[sector] = 1;
    }
  });
  
  // تحويل المساحات إلى كيلومتر مربع
  totalArea = totalArea / 1000000;
  minArea = minArea / 1000000;
  maxArea = maxArea / 1000000;
  const avgArea = totalArea / count;
  
  return {
    count,
    totalArea,
    avgArea,
    minArea,
    maxArea,
    sectors,
    sectorCount: Object.keys(sectors).length
  };
}

/**
 * تحليل التوزيع المساحي للأحياء
 * @param {Object} geojsonData - بيانات GeoJSON
 * @return {Object} بيانات التوزيع المساحي
 */
function analyzeAreaDistribution(geojsonData) {
  if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
    console.error('بيانات GeoJSON غير صالحة أو فارغة');
    return [];
  }
  
  // تصنيف الأحياء حسب المساحة
  const areaRanges = {
    '< 1 كم²': 0,
    '1 - 2 كم²': 0,
    '2 - 5 كم²': 0,
    '5 - 10 كم²': 0,
    '> 10 كم²': 0
  };
  
  geojsonData.features.forEach(feature => {
    const areaKm2 = feature.properties.Shape_Area / 1000000;
    
    if (areaKm2 < 1) {
      areaRanges['< 1 كم²']++;
    } else if (areaKm2 < 2) {
      areaRanges['1 - 2 كم²']++;
    } else if (areaKm2 < 5) {
      areaRanges['2 - 5 كم²']++;
    } else if (areaKm2 < 10) {
      areaRanges['5 - 10 كم²']++;
    } else {
      areaRanges['> 10 كم²']++;
    }
  });
  
  // تحويل إلى مصفوفة من الكائنات للرسم البياني
  return Object.keys(areaRanges).map(range => {
    return {
      range,
      count: areaRanges[range]
    };
  });
}

/**
 * تحليل التوزيع القطاعي للأحياء
 * @param {Object} geojsonData - بيانات GeoJSON
 * @return {Object} بيانات التوزيع القطاعي
 */
function analyzeSectorDistribution(geojsonData) {
  if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
    console.error('بيانات GeoJSON غير صالحة أو فارغة');
    return [];
  }
  
  // إحصاء القطاعات
  const sectors = {};
  
  geojsonData.features.forEach(feature => {
    const sector = feature.properties.Sector_01 || 'غير محدد';
    if (sectors[sector]) {
      sectors[sector]++;
    } else {
      sectors[sector] = 1;
    }
  });
  
  // تحويل إلى مصفوفة من الكائنات للرسم البياني
  return Object.keys(sectors).map(sector => {
    return {
      sector,
      count: sectors[sector]
    };
  }).sort((a, b) => b.count - a.count); // ترتيب تنازلي حسب العدد
}

/**
 * تصنيف البيانات باستخدام طريقة الفواصل المتساوية
 * @param {Array} data - مصفوفة من القيم
 * @param {Number} classCount - عدد الفئات
 * @return {Array} فواصل الفئات
 */
function calculateEqualIntervals(data, classCount) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const interval = (max - min) / classCount;
  
  const breaks = [min];
  for (let i = 1; i < classCount; i++) {
    breaks.push(min + i * interval);
  }
  breaks.push(max);
  
  return breaks;
}

/**
 * تصنيف البيانات باستخدام طريقة الفواصل الكمية
 * @param {Array} data - مصفوفة من القيم
 * @param {Number} classCount - عدد الفئات
 * @return {Array} فواصل الفئات
 */
function calculateQuantileBreaks(data, classCount) {
  // ترتيب البيانات تصاعديًا
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  const breaks = [sortedData[0]]; // أقل قيمة
  
  for (let i = 1; i < classCount; i++) {
    const position = Math.floor((i * n) / classCount);
    breaks.push(sortedData[position]);
  }
  
  breaks.push(sortedData[n - 1]); // أكبر قيمة
  
  return breaks;
}

/**
 * تصنيف البيانات باستخدام طريقة الفواصل الطبيعية (خوارزمية Jenks)
 * @param {Array} data - مصفوفة من القيم
 * @param {Number} classCount - عدد الفئات
 * @return {Array} فواصل الفئات
 */
function calculateNaturalBreaks(data, classCount) {
  // ملاحظة: هذه نسخة مبسطة من خوارزمية Jenks Natural Breaks
  // للتطبيق الحقيقي يفضل استخدام مكتبة متخصصة
  
  // ترتيب البيانات تصاعديًا
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  // للتبسيط، نستخدم طريقة بسيطة لاختيار الفواصل الطبيعية
  const breaks = [sortedData[0]]; // أقل قيمة
  
  // حساب الفروق بين القيم المتتالية
  const differences = [];
  for (let i = 1; i < n; i++) {
    differences.push({
      value: sortedData[i],
      diff: sortedData[i] - sortedData[i-1]
    });
  }
  
  // ترتيب الفروق تنازليًا
  differences.sort((a, b) => b.diff - a.diff);
  
  // اختيار أكبر الفروق كفواصل
  const breakPoints = differences.slice(0, classCount - 1).map(d => d.value);
  breakPoints.sort((a, b) => a - b);
  
  // إضافة نقاط الفواصل
  breaks.push(...breakPoints);
  breaks.push(sortedData[n - 1]); // أكبر قيمة
  
  return breaks;
}

/**
 * تحديد فئة القيمة باستخدام فواصل محددة
 * @param {Number} value - القيمة
 * @param {Array} breaks - فواصل الفئات
 * @return {Number} رقم الفئة (0 إلى عدد الفواصل - 1)
 */
function getClassForValue(value, breaks) {
  for (let i = 1; i < breaks.length; i++) {
    if (value <= breaks[i]) {
      return i - 1;
    }
  }
  return breaks.length - 2; // الفئة الأخيرة
}

/**
 * الحصول على لون بناءً على الفئة
 * @param {Number} classIndex - رقم الفئة
 * @param {Array} colorScale - مقياس الألوان
 * @return {String} قيمة اللون (HEX)
 */
function getColorForClass(classIndex, colorScale) {
  const defaultColorScale = [
    '#edf8fb',
    '#b2e2e2',
    '#66c2a4',
    '#2ca25f',
    '#006d2c'
  ];
  
  const colors = colorScale || defaultColorScale;
  return colors[Math.min(classIndex, colors.length - 1)];
}

/**
 * تطبيق التحليل المكاني على بيانات GeoJSON
 * @param {Object} geojsonData - بيانات GeoJSON
 * @param {String} field - حقل التحليل
 * @param {String} method - طريقة التحليل
 * @param {Number} classCount - عدد الفئات
 * @param {Array} colorScale - مقياس الألوان
 * @return {Object} بيانات GeoJSON مع خصائص التحليل المضافة
 */
function applySpatialAnalysis(geojsonData, field, method, classCount, colorScale) {
  if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
    console.error('بيانات GeoJSON غير صالحة أو فارغة');
    return geojsonData;
  }
  
  classCount = classCount || 5;
  
  // استخراج قيم الحقل من البيانات
  const fieldValues = [];
  
  geojsonData.features.forEach(feature => {
    let value;
    
    // استخراج القيمة بناءً على نوع الحقل
    switch (field) {
      case 'area':
        value = feature.properties.Shape_Area / 1000000; // تحويل إلى كم²
        break;
      case 'population':
        // استخدام قيمة وهمية ثابتة
        value = getSimulatedValue(feature.properties.ID, 1000, 10000);
        break;
      case 'damage':
        // استخدام قيمة وهمية ثابتة
        value = getSimulatedValue(feature.properties.ID, 0, 100);
        break;
      case 'priority':
        // استخدام قيمة وهمية ثابتة
        value = getSimulatedValue(feature.properties.ID, 1, 5);
        break;
      default:
        value = 0;
    }
    
    fieldValues.push(value);
  });
  
  // حساب فواصل الفئات بناءً على طريقة التحليل
  let breaks;
  
  switch (method) {
    case 'equal':
      breaks = calculateEqualIntervals(fieldValues, classCount);
      break;
    case 'quantile':
      breaks = calculateQuantileBreaks(fieldValues, classCount);
      break;
    case 'natural':
      breaks = calculateNaturalBreaks(fieldValues, classCount);
      break;
    default:
      breaks = calculateEqualIntervals(fieldValues, classCount);
  }
  
  // إنشاء نسخة عميقة من بيانات GeoJSON
  const analyzedData = JSON.parse(JSON.stringify(geojsonData));
  
  // إضافة خصائص التحليل لكل معلم
  analyzedData.features.forEach((feature, index) => {
    let value;
    
    // استخراج القيمة مرة أخرى (يمكن تحسين هذا الجزء)
    switch (field) {
      case 'area':
        value = feature.properties.Shape_Area / 1000000;
        break;
      case 'population':
        value = getSimulatedValue(feature.properties.ID, 1000, 10000);
        break;
      case 'damage':
        value = getSimulatedValue(feature.properties.ID, 0, 100);
        break;
      case 'priority':
        value = getSimulatedValue(feature.properties.ID, 1, 5);
        break;
      default:
        value = 0;
    }
    
    // تحديد الفئة واللون
    const classIndex = getClassForValue(value, breaks);
    const color = getColorForClass(classIndex, colorScale);
    
    // إضافة خصائص التحليل
    feature.properties.analysisValue = value;
    feature.properties.analysisClass = classIndex;
    feature.properties.analysisColor = color;
  });
  
  // إضافة معلومات التحليل
  analyzedData.analysisInfo = {
    field,
    method,
    classCount,
    breaks,
    colorScale: colorScale || getDefaultColorScale(field)
  };
  
  return analyzedData;
}

/**
 * الحصول على مقياس الألوان الافتراضي لنوع التحليل
 * @param {String} field - حقل التحليل
 * @return {Array} مقياس الألوان
 */
function getDefaultColorScale(field) {
  switch (field) {
    case 'area':
      return [
        '#edf8fb',
        '#b2e2e2',
        '#66c2a4',
        '#2ca25f',
        '#006d2c'
      ];
    case 'population':
      return [
        '#f1eef6',
        '#d4b9da',
        '#a980bb',
        '#7a5195',
        '#581b7c'
      ];
    case 'damage':
      return [
        '#ffffcc',
        '#ffeda0',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c'
      ];
    case 'priority':
      return [
        '#00796b',
        '#26a69a',
        '#ffb300',
        '#f57c00',
        '#d32f2f'
      ];
    default:
      return [
        '#ffffcc',
        '#a1dab4',
        '#41b6c4',
        '#2c7fb8',
        '#253494'
      ];
  }
}

/**
 * حساب مساحة مضلع باستخدام الطريقة الجيوديسية
 * @param {Array} latLngs - مصفوفة من النقاط [lat, lng]
 * @return {Number} المساحة بالمتر المربع
 */
function calculateGeodesicArea(latLngs) {
  // تنفيذ خوارزمية حساب المساحة الجيوديسية
  const earthRadius = 6371000; // نصف قطر الأرض بالمتر
  
  // تحويل النقاط إلى راديان
  const points = latLngs.map(point => ({
    lat: point[0] * Math.PI / 180,
    lng: point[1] * Math.PI / 180
  }));
  
  let area = 0;
  
  // حساب المساحة باستخدام صيغة المضلع الكروي
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    area += (p2.lng - p1.lng) * Math.sin((p1.lat + p2.lat) / 2);
  }
  
  // إغلاق المضلع
  const pn = points[points.length - 1];
  const p0 = points[0];
  area += (p0.lng - pn.lng) * Math.sin((pn.lat + p0.lat) / 2);
  
  // حساب المساحة النهائية
  area = Math.abs(area * earthRadius * earthRadius / 2);
  
  return area;
}

/**
 * حساب المسافة بين نقطتين باستخدام صيغة هافرساين
 * @param {Array} point1 - النقطة الأولى [lat, lng]
 * @param {Array} point2 - النقطة الثانية [lat, lng]
 * @return {Number} المسافة بالمتر
 */
function calculateHaversineDistance(point1, point2) {
  const R = 6371000; // نصف قطر الأرض بالمتر
  const dLat = (point2[0] - point1[0]) * Math.PI / 180;
  const dLon = (point2[1] - point1[1]) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * الحصول على قيمة وهمية ثابتة بناءً على المعرف
 * @param {Number} id - رقم المعرف
 * @param {Number} min - الحد الأدنى
 * @param {Number} max - الحد الأقصى
 * @return {Number} قيمة ثابتة في النطاق [min, max]
 */
function getSimulatedValue(id, min, max) {
  // استخدام المعرف كبذرة لإنشاء قيم ثابتة
  const seed = id * 1000;
  const rand = Math.sin(seed) * 10000;
  const normalized = (rand - Math.floor(rand));
  
  return min + normalized * (max - min);
}

// تصدير الوظائف
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateBasicStatistics,
    analyzeAreaDistribution,
    analyzeSectorDistribution,
    calculateEqualIntervals,
    calculateQuantileBreaks,
    calculateNaturalBreaks,
    getClassForValue,
    getColorForClass,
    applySpatialAnalysis,
    getDefaultColorScale,
    calculateGeodesicArea,
    calculateHaversineDistance,
    getSimulatedValue
  };
}