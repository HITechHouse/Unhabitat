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

// Base layer switching variables
let currentBaseIndex = 0;
let baseLayersArr = [];
let currentBaseLayer = null;

// Dummy data for dropdowns
const dummyData = {
  status: ['جيد', 'متوسط', 'سيء', 'تحت الصيانة'],
  type: ['سكني', 'تجاري', 'صناعي', 'مختلط'],
  priority: ['عالي', 'متوسط', 'منخفض'],
  department: ['المياه', 'الكهرباء', 'الصرف الصحي', 'الطرق', 'الحدائق']
};

// Base layer definitions
const baseLayers = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  }),
  terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
  })
};

/**
 * حساب مساحة المضلع من بيانات GeoJSON
 * @param {Object} geometry - هندسة المضلع من GeoJSON
 * @returns {number} - المساحة بالمتر المربع
 */
function calculateArea(geometry) {
  if (!geometry || !geometry.coordinates || geometry.type !== 'Polygon') {
    console.error('Invalid geometry provided to calculateArea');
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
    console.error('Error calculating area:', error);
    return 0;
  }
}

// تهيئة الخريطة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function () {
  initMap();
  // setupMapControls and loadLayers are called inside initMap
  updateStatistics();
});

// Fix for white space issue - force map resize when window is resized
window.addEventListener('resize', function () {
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
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('عنصر الخريطة غير موجود');
    return;
  }

  // إنشاء الخريطة في عنصر DOM
  map = L.map('map', {
    center: [36.2021, 37.1343], // إحداثيات مدينة حلب
    zoom: 12,
    zoomControl: false, // سنضيف عناصر التحكم في الزوم يدويًا
    attributionControl: true
  });

  // إضافة طبقة OpenStreetMap الأساسية
  const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });
  streetsLayer.addTo(map);

  // إضافة طبقة صور الأقمار الصناعية من Google
  const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google',
    maxZoom: 19
  });

  // إضافة طبقة طبوغرافية
  const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    maxZoom: 17
  });

  // إضافة متحكم الطبقات الأساسية
  const baseLayers = {
    "خريطة الشوارع": streetsLayer,
    "صور الأقمار الصناعية": satelliteLayer,
    "الخريطة الطبوغرافية": terrainLayer
  };

  // إعداد مصفوفة طبقات الأساس
  baseLayersArr = [
    { name: "streets", layer: streetsLayer },
    { name: "satellite", layer: satelliteLayer },
    { name: "terrain", layer: terrainLayer }
  ];
  currentBaseLayer = baseLayersArr[0].layer;
  currentBaseIndex = 0;

  // وظيفة تبديل طبقة الأساس
  function setBaseLayer(index) {
    baseLayersArr.forEach(function (obj) {
      if (map.hasLayer(obj.layer)) map.removeLayer(obj.layer);
    });
    map.addLayer(baseLayersArr[index].layer);
    currentBaseIndex = index;
  }

  // طبقة الأساس الافتراضية
  setBaseLayer(0);

  // زر تبديل طبقة الأساس (الدائري)
  const baseLayerBtn = document.getElementById('baseLayerBtn');
  if (baseLayerBtn) {
    baseLayerBtn.onclick = function () {
      var nextIndex = (currentBaseIndex + 1) % baseLayersArr.length;
      setBaseLayer(nextIndex);
    };
  }

  // راديو اختيار طبقة الأساس في المودال
  const baseLayerForm = document.getElementById('baseLayerForm');
  if (baseLayerForm) {
    baseLayerForm.addEventListener('change', function (e) {
      if (e.target.name === 'baseLayer') {
        let idx = 0;
        if (e.target.value === 'satellite') idx = 1;
        else if (e.target.value === 'terrain') idx = 2;
        setBaseLayer(idx);
        if (typeof toggleLayersPanel === 'function') toggleLayersPanel();
      }
    });
  }

  // إضافة متحكم الطبقات إلى الخريطة
  L.control.layers(baseLayers, null, {
    position: 'topleft',
    collapsed: true
  }).addTo(map);

  // إضافة متحكم الزوم إلى الخريطة
  L.control.zoom({
    position: 'topleft'
  }).addTo(map);

  // إضافة مقياس للخريطة
  L.control.scale({
    position: 'bottomleft',
    imperial: false
  }).addTo(map);

  // إعداد عناصر التحكم في الخريطة
  setupMapControls();

  // تحميل الطبقات
  loadLayers();

  // Initialize base layer controls
  initBaseLayerControls();

  // Add default base layer
  currentBaseLayer.addTo(map);
}

/**
 * إعداد عناصر التحكم في الخريطة
 */
function setupMapControls() {
  // زر التحليل
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', function () {
      showAnalysisPanel();
    });
  }

  // زر القياس
  const measureBtn = document.getElementById('measureBtn');
  if (measureBtn) {
    measureBtn.addEventListener('click', function () {
      toggleMeasureTool();
    });
  }

  // زر التصفية
  const filterBtn = document.getElementById('filterBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', function () {
      showFilterPanel();
    });
  }

  // إغلاق لوحة المعلومات
  const closeInfoPanel = document.getElementById('closeInfoPanel');
  if (closeInfoPanel) {
    closeInfoPanel.addEventListener('click', function () {
      hideInfoPanel();
    });
  }
}

/**
 * تحميل طبقات الخريطة (الأحياء والقطاعات)
 */
function loadLayers() {
  // التحقق من وجود بيانات الأحياء
  if (typeof neighborhoodsData !== 'undefined') {
    loadNeighborhoodsLayer();
  } else {
    console.error('لم يتم العثور على بيانات الأحياء');
  }

  // تحميل طبقة دوائر الخدمات إذا كانت البيانات جاهزة
  if (serviceSectorsData) {
    loadServiceSectorsLayer();
  } else {
    // الاستماع إلى حدث تحميل البيانات
    document.addEventListener('serviceSectorsLoaded', function () {
      loadServiceSectorsLayer();
    });
  }
}

/**
 * تحميل طبقة أحياء حلب
 */
function loadNeighborhoodsLayer() {
  // Remove existing layer if it exists
  if (neighborhoodsLayer) {
    map.removeLayer(neighborhoodsLayer);
  }

  neighborhoodsLayer = L.geoJSON(neighborhoodsData, {
    style: {
      fillColor: '#3388ff',
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.5
    },
    onEachFeature: onEachNeighborhood
  }).addTo(map);

  // Fit map bounds to show all neighborhoods
  map.fitBounds(neighborhoodsLayer.getBounds());
}

// Function to create popup content for neighborhood
function createNeighborhoodPopup(feature, layer) {
  const properties = feature.properties;
  const name = properties.Names || properties.name || 'غير معروف';
  const area = calculateArea(feature.geometry);
  const areaInKm = (area / 1000000).toFixed(2); // Convert to square kilometers
  const sector = properties.Sector || 'غير محدد';

  const popupContent = document.createElement('div');
  popupContent.className = 'neighborhood-popup';
  popupContent.style.padding = '0';
  popupContent.style.maxWidth = '320px';
  popupContent.style.direction = 'rtl';
  popupContent.style.borderRadius = '10px';
  popupContent.style.overflow = 'hidden';
  popupContent.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  popupContent.style.background = '#fff';
  popupContent.style.fontFamily = '"Cairo", sans-serif';

  // Create header with styles
  const header = document.createElement('h3');
  header.textContent = name;
  header.style.margin = '0';
  header.style.fontSize = '18px';
  header.style.color = '#fff';
  header.style.padding = '14px 15px';
  header.style.background = 'linear-gradient(135deg, #007bff, #3066ff)';
  header.style.textAlign = 'center';
  header.style.fontWeight = '600';
  header.style.position = 'relative';
  header.style.overflow = 'hidden';
  header.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
  header.style.letterSpacing = '0.5px';

  // Create info container
  const infoContainer = document.createElement('div');
  infoContainer.className = 'popup-info';
  infoContainer.style.margin = '0';
  infoContainer.style.padding = '15px';
  infoContainer.style.background = 'rgba(248, 250, 252, 0.8)';
  infoContainer.style.borderBottom = '1px solid #eef2f7';

  // Create ID paragraph
  const idPara = document.createElement('p');
  idPara.style.margin = '8px 0';
  idPara.style.fontSize = '14px';
  idPara.style.color = '#4a5568';
  idPara.style.display = 'flex';
  idPara.style.alignItems = 'center';
  idPara.style.justifyContent = 'space-between';
  idPara.style.padding = '8px 0';
  idPara.style.borderBottom = '1px dashed rgba(203, 213, 224, 0.5)';

  const idStrong = document.createElement('strong');
  idStrong.style.color = '#2d3748';
  idStrong.style.fontWeight = '600';
  idStrong.style.marginLeft = '8px';
  idStrong.style.display = 'flex';
  idStrong.style.alignItems = 'center';
  idStrong.style.gap = '6px';

  const idIcon = document.createElement('i');
  idIcon.className = 'fas fa-fingerprint';
  idIcon.style.color = '#3066ff';
  idIcon.style.fontSize = '14px';
  idIcon.style.width = '16px';
  idIcon.style.textAlign = 'center';

  idStrong.appendChild(idIcon);
  idStrong.appendChild(document.createTextNode(' المعرف:'));

  const idSpan = document.createElement('span');
  idSpan.textContent = properties.ID || 'غير متوفر';
  idSpan.style.fontWeight = '500';
  idSpan.style.background = 'rgba(237, 242, 247, 0.5)';
  idSpan.style.padding = '3px 8px';
  idSpan.style.borderRadius = '4px';

  idPara.appendChild(idStrong);
  idPara.appendChild(idSpan);

  // Create sector paragraph (similar structure)
  const sectorPara = document.createElement('p');
  sectorPara.style.margin = '8px 0';
  sectorPara.style.fontSize = '14px';
  sectorPara.style.color = '#4a5568';
  sectorPara.style.display = 'flex';
  sectorPara.style.alignItems = 'center';
  sectorPara.style.justifyContent = 'space-between';
  sectorPara.style.padding = '8px 0';
  sectorPara.style.borderBottom = '1px dashed rgba(203, 213, 224, 0.5)';

  const sectorStrong = document.createElement('strong');
  sectorStrong.style.color = '#2d3748';
  sectorStrong.style.fontWeight = '600';
  sectorStrong.style.marginLeft = '8px';
  sectorStrong.style.display = 'flex';
  sectorStrong.style.alignItems = 'center';
  sectorStrong.style.gap = '6px';

  const sectorIcon = document.createElement('i');
  sectorIcon.className = 'fas fa-layer-group';
  sectorIcon.style.color = '#3066ff';
  sectorIcon.style.fontSize = '14px';
  sectorIcon.style.width = '16px';
  sectorIcon.style.textAlign = 'center';

  sectorStrong.appendChild(sectorIcon);
  sectorStrong.appendChild(document.createTextNode(' القطاع:'));

  const sectorSpan = document.createElement('span');
  sectorSpan.textContent = sector;
  sectorSpan.style.fontWeight = '500';
  sectorSpan.style.background = 'rgba(237, 242, 247, 0.5)';
  sectorSpan.style.padding = '3px 8px';
  sectorSpan.style.borderRadius = '4px';

  sectorPara.appendChild(sectorStrong);
  sectorPara.appendChild(sectorSpan);

  // Create area paragraph (similar structure)
  const areaPara = document.createElement('p');
  areaPara.style.margin = '8px 0';
  areaPara.style.fontSize = '14px';
  areaPara.style.color = '#4a5568';
  areaPara.style.display = 'flex';
  areaPara.style.alignItems = 'center';
  areaPara.style.justifyContent = 'space-between';
  areaPara.style.padding = '8px 0';

  const areaStrong = document.createElement('strong');
  areaStrong.style.color = '#2d3748';
  areaStrong.style.fontWeight = '600';
  areaStrong.style.marginLeft = '8px';
  areaStrong.style.display = 'flex';
  areaStrong.style.alignItems = 'center';
  areaStrong.style.gap = '6px';

  const areaIcon = document.createElement('i');
  areaIcon.className = 'fas fa-chart-area';
  areaIcon.style.color = '#3066ff';
  areaIcon.style.fontSize = '14px';
  areaIcon.style.width = '16px';
  areaIcon.style.textAlign = 'center';

  areaStrong.appendChild(areaIcon);
  areaStrong.appendChild(document.createTextNode(' المساحة:'));

  const areaSpan = document.createElement('span');
  areaSpan.textContent = `${areaInKm} كم²`;
  areaSpan.style.fontWeight = '500';
  areaSpan.style.background = 'rgba(237, 242, 247, 0.5)';
  areaSpan.style.padding = '3px 8px';
  areaSpan.style.borderRadius = '4px';

  areaPara.appendChild(areaStrong);
  areaPara.appendChild(areaSpan);

  // Add paragraphs to info container
  infoContainer.appendChild(idPara);
  infoContainer.appendChild(sectorPara);
  infoContainer.appendChild(areaPara);

  // Create button
  const button = document.createElement('button');
  button.className = 'view-details-btn';
  button.onclick = function () { handleNeighborhoodSelect(properties.ID, name); };
  button.style.width = '100%';
  button.style.padding = '12px 15px';
  button.style.background = 'linear-gradient(to right, #3066ff, #007bff)';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '0';
  button.style.cursor = 'pointer';
  button.style.fontSize = '15px';
  button.style.fontWeight = '600';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.gap = '10px';
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';

  const buttonIcon = document.createElement('i');
  buttonIcon.className = 'fas fa-info-circle';
  buttonIcon.style.fontSize = '16px';

  button.appendChild(buttonIcon);
  button.appendChild(document.createTextNode(' عرض التفاصيل'));

  // Add all elements to popup content
  popupContent.innerHTML = '';
  popupContent.appendChild(header);
  popupContent.appendChild(infoContainer);
  popupContent.appendChild(button);

  layer.bindPopup(popupContent);
}

// Function to handle neighborhood selection
function handleNeighborhoodSelect(id, name) {
  const infoPanel = document.getElementById('info-panel');
  const backdrop = document.getElementById('modal-backdrop');
  const infoTitle = document.getElementById('info-title');
  const infoContent = document.getElementById('info-content');

  // Show the panel and backdrop
  infoPanel.classList.add('show');
  backdrop.style.display = 'block';

  // Set the title
  infoTitle.textContent = name || 'تفاصيل الحي';

  // Clear previous content
  infoContent.innerHTML = '';

  // Get the active tab
  const activeTab = document.querySelector('.tab-button.active');
  const tabId = activeTab ? activeTab.getAttribute('data-tab') : null;

  // Store the selected neighborhood data for later use
  const selectedNeighborhood = {
    id: id,
    name: name
  };

  // Create a form to hold the fields
  const form = document.createElement('form');
  form.className = 'info-form';

  if (tabId && tablesData[tabId]) {
    const tableData = tablesData[tabId];

    // Add each field from the table definition
    tableData.fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'field-container';

      const label = document.createElement('label');
      label.textContent = field.name;
      label.className = 'field-label';

      let input;
      if (field.key === 'neighborhood_id') {
        // Set the neighborhood ID
        input = document.createElement('input');
        input.type = 'text';
        input.value = id || '';
        input.readOnly = true;
      } else {
        // Create appropriate input based on field type
        input = document.createElement('input');
        input.type = 'text';
        input.value = tableData.sampleData[field.key] || '';
        input.readOnly = !field.editable;
      }

      input.className = 'editable-field';
      input.setAttribute('data-field', field.key);
      input.setAttribute('data-original-value', input.value);

      fieldContainer.appendChild(label);
      fieldContainer.appendChild(input);
      form.appendChild(fieldContainer);
    });

    infoContent.appendChild(form);
  } else {
    // Fallback to basic properties display if no tab is selected
    const section = document.createElement('div');
    section.className = 'info-section';

    const idLabel = document.createElement('div');
    idLabel.className = 'info-label';
    idLabel.textContent = 'معرف الحي';

    const idField = document.createElement('input');
    idField.className = 'editable-field';
    idField.type = 'text';
    idField.value = id;
    idField.readOnly = true;

    section.appendChild(idLabel);
    section.appendChild(idField);
    infoContent.appendChild(section);
  }

  // Add event listener for tab changes
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const newTabId = this.getAttribute('data-tab');
      if (newTabId && tablesData[newTabId]) {
        // Clear previous content
        infoContent.innerHTML = '';

        // Create new form for the selected tab
        const newForm = document.createElement('form');
        newForm.className = 'info-form';

        const tableData = tablesData[newTabId];

        // Add each field from the table definition
        tableData.fields.forEach(field => {
          const fieldContainer = document.createElement('div');
          fieldContainer.className = 'field-container';

          const label = document.createElement('label');
          label.textContent = field.name;
          label.className = 'field-label';

          let input;
          if (field.key === 'neighborhood_id') {
            // Set the neighborhood ID
            input = document.createElement('input');
            input.type = 'text';
            input.value = selectedNeighborhood.id || '';
            input.readOnly = true;
          } else {
            // Create appropriate input based on field type
            input = document.createElement('input');
            input.type = 'text';
            input.value = tableData.sampleData[field.key] || '';
            input.readOnly = !field.editable;
          }

          input.className = 'editable-field';
          input.setAttribute('data-field', field.key);
          input.setAttribute('data-original-value', input.value);

          fieldContainer.appendChild(label);
          fieldContainer.appendChild(input);
          newForm.appendChild(fieldContainer);
        });

        infoContent.appendChild(newForm);
      }
    });
  });
}

// Add event handlers for neighborhood layer
function onEachNeighborhood(feature, layer) {
  // Popup
  createNeighborhoodPopup(feature, layer);

  // Highlight on hover
  layer.on({
    mouseover: function (e) {
      const layer = e.target;
      layer.setStyle({
        weight: 2,
        fillOpacity: 0.7
      });
    },
    mouseout: function (e) {
      const layer = e.target;
      layer.setStyle({
        weight: 1,
        fillOpacity: 0.5
      });
    }
  });
}

/**
 * ترجمة حالة البنية التحتية
 * @param {string} status - الحالة بالإنجليزية
 * @return {string} - الحالة بالعربية
 */
function getStatusTranslation(status) {
  const translations = {
    'good': 'جيدة',
    'medium': 'متوسطة',
    'poor': 'ضعيفة',
    'unavailable': 'غير متوفرة',
    'available': 'متوفرة',
    'limited': 'محدودة'
  };

  return translations[status] || status;
}

/**
 * إخفاء لوحة المعلومات
 */
function hideInfoPanel() {
  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel) {
    infoPanel.style.display = 'none';
  }
}

/**
 * تحديث الإحصائيات العامة
 */
function updateStatistics() {
  // التحقق من وجود بيانات الأحياء
  if (typeof neighborhoodsData !== 'undefined' && typeof calculateBasicStatistics !== 'undefined') {
    const stats = calculateBasicStatistics(neighborhoodsData);

    // تحديث عناصر العرض
    const neighborhoodCountElement = document.getElementById('neighborhoodCount');
    const totalAreaElement = document.getElementById('totalArea');
    const sectorCountElement = document.getElementById('sectorCount');
    const avgAreaElement = document.getElementById('avgArea');

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
  if (layerName === 'neighborhoods' && neighborhoodsLayer) {
    if (visible) {
      if (!map.hasLayer(neighborhoodsLayer)) {
        map.addLayer(neighborhoodsLayer);
      }
    } else {
      if (map.hasLayer(neighborhoodsLayer)) {
        map.removeLayer(neighborhoodsLayer);
      }
    }
  } else if (layerName === 'service-sectors' && serviceSectorsLayer) {
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
  if (layerName === 'neighborhoods' && neighborhoodsLayer) {
    map.fitBounds(neighborhoodsLayer.getBounds());
  } else if (layerName === 'service-sectors' && serviceSectorsLayer) {
    try {
      const bounds = L.geoJSON(serviceSectorsData).getBounds();
      map.fitBounds(bounds);
    } catch (error) {
      console.error('خطأ في التكبير على طبقة دوائر الخدمات:', error);
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
  const infoPanel = document.getElementById('infoPanel');
  const infoPanelTitle = document.getElementById('infoPanelTitle');
  const infoPanelContent = document.getElementById('infoPanelContent');

  if (infoPanel && infoPanelTitle && infoPanelContent) {
    if (layerName === 'neighborhoods') {
      infoPanelTitle.textContent = 'معلومات طبقة الأحياء';

      if (typeof neighborhoodsData !== 'undefined' && typeof calculateBasicStatistics !== 'undefined') {
        const stats = calculateBasicStatistics(neighborhoodsData);

        infoPanelContent.innerHTML = `
          <p><strong>عدد الأحياء:</strong> ${stats.count}</p>
          <p><strong>المساحة الإجمالية:</strong> ${stats.totalArea.toFixed(2)} كم²</p>
          <p><strong>متوسط المساحة:</strong> ${stats.avgArea.toFixed(2)} كم²</p>
          <p><strong>أكبر حي:</strong> ${stats.maxArea.toFixed(2)} كم²</p>
          <p><strong>أصغر حي:</strong> ${stats.minArea.toFixed(2)} كم²</p>
        `;
      } else {
        infoPanelContent.innerHTML = '<p>بيانات الأحياء غير متاحة</p>';
      }
    } else if (layerName === 'service-sectors') {
      infoPanelTitle.textContent = 'معلومات طبقة دوائر الخدمات';

      if (serviceSectorsData && serviceSectorsData.features) {
        let totalPopulation = 0;
        serviceSectorsData.features.forEach(feature => {
          totalPopulation += feature.properties.Pop || 0;
        });

        const areas = serviceSectorsData.features.map(feature => {
          return {
            name: feature.properties.Name,
            area: feature.properties.Shape_Area / 1000000
          };
        });

        areas.sort((a, b) => b.area - a.area);

        infoPanelContent.innerHTML = `
          <div class="futuristic-panel">
            <p><strong>عدد دوائر الخدمات:</strong> ${serviceSectorsData.features.length}</p>
            <p><strong>إجمالي عدد السكان:</strong> ${totalPopulation.toLocaleString('ar-SY')}</p>
            <p><strong>أكبر دوائر الخدمات (من حيث المساحة):</strong></p>
            <ul style="padding-right: 20px; margin-top: 5px;">
              ${areas.slice(0, 3).map(item => `<li>${item.name} (${item.area.toFixed(2)} كم²)</li>`).join('')}
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
        infoPanelContent.innerHTML = '<p>بيانات دوائر الخدمات غير متاحة</p>';
      }
    }

    infoPanel.style.display = 'block';
  }
}

/**
 * عرض لوحة التحليل
 */
function showAnalysisPanel() {
  // فتح الشريط الجانبي الأيمن إذا كان مغلقًا
  if (window.toggleSidebar && typeof rightSidebarActive !== 'undefined' && !rightSidebarActive) {
    window.toggleSidebar('right');
  }
}

/**
 * تبديل أداة القياس
 */
function toggleMeasureTool() {
  console.log('تشغيل أداة القياس - سيتم تنفيذها لاحق');
}

/**
 * عرض لوحة التصفية
 */
function showFilterPanel() {
  // فتح الشريط الجانبي الأيمن إذا كان مغلقًا
  if (window.toggleSidebar && typeof rightSidebarActive !== 'undefined' && !rightSidebarActive) {
    window.toggleSidebar('right');
  }
}

/**
 * تسليط الضوء على دائرة خدمات معينة على الخريطة
 * @param {number} sectorId - معرف دائرة الخدمات
 */
function highlightServiceSector(sectorId) {
  // البحث عن دائرة الخدمات في بيانات دوائر الخدمات
  const sector = serviceSectors.find(s => s.id === sectorId);

  if (!sector) {
    console.error(`لم يتم العثور على دائرة خدمات بالمعرف: ${sectorId}`);
    return;
  }

  // إزالة أي تسليط ضوء سابق
  const highlightedElements = document.querySelectorAll('.highlighted-sector');
  highlightedElements.forEach(el => el.classList.remove('highlighted-sector'));

  // إظهار رسالة
  const infoPanel = document.getElementById('infoPanel');
  const infoPanelTitle = document.getElementById('infoPanelTitle');
  const infoPanelContent = document.getElementById('infoPanelContent');

  if (infoPanel && infoPanelTitle && infoPanelContent) {
    // تعيين العنوان
    infoPanelTitle.textContent = `دائرة خدمات: ${sector.name}`;

    // الحصول على بيانات الهيدروليك لهذه الدائرة
    const hydraulicData = hydraulicServiceData.find(data => data.sectorId === sectorId);

    // تحديث المحتوى
    infoPanelContent.innerHTML = `
      <div style="margin-bottom: 15px; padding: 10px; background-color: #e8f4ff; border-radius: 4px; border-right: 3px solid #3b82f6;">
        <p style="margin: 0;"><strong>خريطة التغطية المائية:</strong> تعرض توزيع خدمات المياه في دائرة خدمات ${sector.name}</p>
      </div>
      <p><strong>المعرّف:</strong> ${sector.id}</p>
      <p><strong>عدد السكان:</strong> ${sector.population ? sector.population.toLocaleString('ar-SY') : 'غير متاح'}</p>
    `;

    // إضافة بيانات الهيدروليك إذا كانت متاحة
    if (hydraulicData) {
      infoPanelContent.innerHTML += `
        <h4 style="margin-top: 15px; margin-bottom: 5px;">بيانات المياه:</h4>
        <p><strong>ساعات التغذية اليومية:</strong> ${hydraulicData.waterSupplyHours} ساعة</p>
        <p><strong>ضغط المياه:</strong> ${hydraulicData.waterPressure}</p>
        <p><strong>عدد محطات الضخ:</strong> ${hydraulicData.pumpStations}</p>
      `;
    }

    // عرض لوحة المعلومات
    infoPanel.style.display = 'block';
  }

  // تطبيق نمط مميز لدائرة الخدمات على الخريطة (يمكن تنفيذه عندما تكون طبقة دوائر الخدمات متاحة)
  // للأغراض التوضيحية، سنقوم بتكبير الخريطة على منطقة القطاع
  if (serviceSectorsLayer) {
    // الانتقال إلى موقع القطاع
    map.setView([36.2021, 37.1343], 13);

    // إضافة نمط مميز (يمكن تحسين هذا عندما تكون طبقة دوائر الخدمات متاحة)
    setTimeout(() => {
      alert(`تم تفعيل طبقة تغطية المياه لدائرة خدمات ${sector.name}`);

      // إضافة طبقة وهمية لتمثيل تغطية المياه (كمثال)
      const waterCoverageLayer = L.circle([36.2021, 37.1343], {
        radius: 2000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2,
        className: 'highlighted-sector water-coverage-layer'
      }).addTo(map);

      // إضافة تسمية
      const marker = L.marker([36.2021, 37.1343], {
        icon: L.divIcon({
          className: 'highlighted-sector',
          html: `<div class="sector-marker" style="background-color: #3b82f6;">تغطية المياه - ${sector.name}</div>`,
          iconSize: [150, 40],
          iconAnchor: [75, 20]
        })
      }).addTo(map);

      // إزالة الطبقة بعد 10 ثوانٍ
      setTimeout(() => {
        map.removeLayer(waterCoverageLayer);
        map.removeLayer(marker);
      }, 10000);
    }, 500);
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

  // Define sector colors
  const sectorColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5', // Pink
    '#9B59B6', // Purple
    '#3498DB', // Light Blue
    '#E67E22', // Orange
    '#2ECC71', // Emerald
    '#1ABC9C', // Turquoise
    '#F1C40F'  // Gold
  ];

  // Create GeoJSON layer
  serviceSectorsGeoJsonLayer = L.geoJSON(serviceSectorsData, {
    style: function (feature) {
      const index = (feature.properties.OBJECTID - 1) % sectorColors.length;
      const color = sectorColors[index];
      return {
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5,
        className: `service-sector-${feature.properties.OBJECTID}`
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
            <strong>${properties.Pop ? properties.Pop.toLocaleString('ar-SY') : 'غير متاح'}</strong>
          </div>
          <div class="popup-stat">
            <span>المساحة:</span>
            <strong>${(properties.Shape_Area / 1000000).toFixed(2)} كم²</strong>
          </div>
        </div>
      `;

      layer.bindPopup(popupContent);
      layer.on('click', function () {
        showServiceSectorInfo(feature.properties);
      });
    }
  });

  // Add GeoJSON layer to the layer group
  serviceSectorsGeoJsonLayer.addTo(serviceSectorsLayer);

  // Add labels
  serviceSectorsData.features.forEach(feature => {
    try {
      const polygon = feature.geometry.coordinates[0][0];
      let sumLat = 0, sumLng = 0;

      polygon.forEach(coord => {
        sumLat += coord[1];
        sumLng += coord[0];
      });

      const centerLat = sumLat / polygon.length;
      const centerLng = sumLng / polygon.length;

      const index = (feature.properties.OBJECTID - 1) % sectorColors.length;
      const color = sectorColors[index];

      L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: 'service-sector-label',
          html: `
            <div class="sector-marker futuristic" style="background-color: ${color}; border: 2px solid #ffffff;">
              ${feature.properties.Name}
            </div>
          `,
          iconSize: [120, 40],
          iconAnchor: [60, 20]
        })
      }).addTo(serviceSectorsLayer);
    } catch (error) {
      console.error('خطأ في إضافة تسمية دائرة الخدمات:', error);
    }
  });

  // Update the checkbox event listener
  const layersList = document.getElementById('layersList');
  if (layersList && !document.getElementById('layer-service-sectors')) {
    const layerItem = document.createElement('div');
    layerItem.className = 'layer-item';
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

    const checkbox = layerItem.querySelector('#layer-service-sectors');
    if (checkbox) {
      checkbox.addEventListener('change', function () {
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
      zoomBtn.addEventListener('click', function () {
        zoomToMapLayer('service-sectors');
      });
    }

    const infoBtn = layerItem.querySelector('[data-action="info"]');
    if (infoBtn) {
      infoBtn.addEventListener('click', function () {
        showMapLayerInfo('service-sectors');
      });
    }
  }
}

/**
 * عرض معلومات دائرة خدمات معينة
 * @param {Object} properties - خصائص دائرة الخدمات
 */
function showServiceSectorInfo(properties) {
  const infoPanel = document.getElementById('infoPanel');
  const infoPanelTitle = document.getElementById('infoPanelTitle');
  const infoPanelContent = document.getElementById('infoPanelContent');

  if (infoPanel && infoPanelTitle && infoPanelContent) {
    // تعيين العنوان
    infoPanelTitle.textContent = `دائرة خدمات: ${properties.Name}`;

    // البحث عن بيانات الهيدروليك المرتبطة
    const hydraulicData = hydraulicServiceData.find(data => data.sectorId === properties.OBJECTID);
    const billingData = billingServiceData.find(data => data.sectorId === properties.OBJECTID);

    // تحديث المحتوى
    infoPanelContent.innerHTML = `
      <div class="futuristic-panel">
        <p><strong>المعرّف:</strong> ${properties.OBJECTID}</p>
        <p><strong>الاسم بالإنجليزية:</strong> ${properties.Name_En || 'غير متاح'}</p>
        <p><strong>عدد السكان:</strong> ${properties.Pop ? properties.Pop.toLocaleString('ar-SY') : 'غير متاح'}</p>
        <p><strong>المساحة:</strong> ${(properties.Shape_Area / 1000000).toFixed(2)} كم²</p>
      </div>
    `;

    // إضافة بيانات الهيدروليك إذا كانت متاحة
    if (hydraulicData) {
      infoPanelContent.innerHTML += `
        <h4 style="margin-top: 15px; margin-bottom: 10px;">بيانات المياه</h4>
        <div class="futuristic-panel hydra-panel">
          <p><strong>ساعات التغذية اليومية:</strong> ${hydraulicData.waterSupplyHours} ساعة</p>
          <p><strong>ضغط المياه:</strong> ${hydraulicData.waterPressure}</p>
          <p><strong>عدد محطات الضخ:</strong> ${hydraulicData.pumpStations}</p>
          <p><strong>ملاحظات الصيانة:</strong> ${hydraulicData.maintenanceNotes}</p>
        </div>
      `;
    }

    // إضافة بيانات الفواتير إذا كانت متاحة
    if (billingData) {
      infoPanelContent.innerHTML += `
        <h4 style="margin-top: 15px; margin-bottom: 10px;">بيانات الفواتير</h4>
        <div class="futuristic-panel billing-panel">
          <p><strong>عدد المشتركين:</strong> ${billingData.totalSubscribers.toLocaleString('ar-SY')}</p>
          <p><strong>معدل التحصيل:</strong> ${billingData.collectionRate}%</p>
          <p><strong>المبلغ المستحق:</strong> ${billingData.outstandingAmount.toLocaleString('ar-SY')} ل.س</p>
        </div>
      `;
    }

    // إضافة أزرار للإجراءات
    infoPanelContent.innerHTML += `
      <div class="action-buttons futuristic-buttons" style="margin-top: 15px; display: flex; gap: 10px;">
        <button class="sidebar-button" onclick="window.highlightServiceSector(${properties.OBJECTID})">
          <i class="fas fa-tint"></i> عرض تغطية المياه
        </button>
        <button class="sidebar-button" onclick="window.toggleSidebar('right')">
          <i class="fas fa-chart-bar"></i> عرض التحليلات
        </button>
      </div>
    `;

    // عرض لوحة المعلومات
    infoPanel.style.display = 'block';
  }
}

// تطبيق نمط على طبقة الخريطة
function applyMapLayerStyle(layerName, style) {
  if (layerName === 'neighborhoods' && neighborhoodsLayer) {
    neighborhoodsLayer.setStyle({
      color: style.color,
      weight: style.weight,
      opacity: style.opacity,
      fillColor: style.color,
      fillOpacity: style.opacity * 0.5
    });
  } else if (layerName === 'service-sectors' && serviceSectorsGeoJsonLayer) {
    serviceSectorsGeoJsonLayer.setStyle({
      color: style.color,
      weight: style.weight,
      opacity: style.opacity,
      fillColor: style.color,
      fillOpacity: style.opacity * 0.5
    });
  } else {
    alert('لا يمكن تطبيق النمط على هذه الطبقة');
  }
}

// كشف عن وظائف الخريطة للاستخدام الخارجي
window.mapLayerToggle = mapLayerToggle;
window.zoomToMapLayer = zoomToMapLayer;
window.showMapLayerInfo = showMapLayerInfo;
window.applyMapLayerStyle = applyMapLayerStyle;
window.highlightServiceSector = highlightServiceSector;
window.initMap = initMap; // Export initMap function

// Add event listeners for panel buttons
document.getElementById('close-info-panel').addEventListener('click', function () {
  document.getElementById('info-panel').classList.remove('show');
  document.getElementById('modal-backdrop').style.display = 'none';
  resetPanelState();
});

document.getElementById('cancel-changes').addEventListener('click', function () {
  document.getElementById('info-panel').classList.remove('show');
  document.getElementById('modal-backdrop').style.display = 'none';
  resetPanelState();
});

document.getElementById('save-changes').addEventListener('click', function () {
  // Here you can add your save logic
  document.getElementById('info-panel').classList.remove('show');
  document.getElementById('modal-backdrop').style.display = 'none';
  resetPanelState();
});

function resetPanelState() {
  // Reset all editable fields to their original values
  const editableFields = document.querySelectorAll('.editable-field');
  editableFields.forEach(field => {
    const originalValue = field.getAttribute('data-original-value');
    if (originalValue) {
      field.value = originalValue;
    }
    field.classList.remove('active-edit');
  });

  // Reset dropdowns
  const dropdowns = document.querySelectorAll('.editable-dropdown');
  dropdowns.forEach(dropdown => {
    const originalValue = dropdown.getAttribute('data-original-value');
    if (originalValue) {
      dropdown.value = originalValue;
    }
  });

  // Reset date fields
  const dateFields = document.querySelectorAll('.editable-date');
  dateFields.forEach(dateField => {
    const originalValue = dateField.getAttribute('data-original-value');
    if (originalValue) {
      dateField.value = originalValue;
    }
  });

  // Remove any active states
  document.querySelectorAll('.active-edit').forEach(element => {
    element.classList.remove('active-edit');
  });
}

function createDropdownField(label, id, options, value) {
  const container = document.createElement('div');
  container.className = 'info-section';

  const labelElement = document.createElement('div');
  labelElement.className = 'info-label';
  labelElement.textContent = label;

  const dropdown = document.createElement('select');
  dropdown.className = 'editable-dropdown';
  dropdown.id = id;
  dropdown.setAttribute('data-original-value', value);

  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    if (option === value) {
      optionElement.selected = true;
    }
    dropdown.appendChild(optionElement);
  });

  container.appendChild(labelElement);
  container.appendChild(dropdown);
  return container;
}

function createDateField(label, id, value) {
  const container = document.createElement('div');
  container.className = 'info-section';

  const labelElement = document.createElement('div');
  labelElement.className = 'info-label';
  labelElement.textContent = label;

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'editable-date';
  dateInput.id = id;
  dateInput.value = value;
  dateInput.setAttribute('data-original-value', value);

  container.appendChild(labelElement);
  container.appendChild(dateInput);
  return container;
}

// Function to initialize base layer controls
function initBaseLayerControls() {
  const baseLayerOptions = document.querySelectorAll('.base-layer-option');

  baseLayerOptions.forEach(option => {
    option.addEventListener('click', function () {
      const basemap = this.getAttribute('data-basemap');
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
 * @param {string} title - عنوان النافذة المنبثقة
 * @param {Object} data - بيانات النافذة المنبثقة كأزواج من المفاتيح والقيم
 * @param {string} headerColor - لون خلفية العنوان (اختياري)
 * @returns {string} - محتوى HTML للنافذة المنبثقة
 */
function createPopupContent(title, data, headerColor = null) {
  const headerStyle = headerColor ? ` style="background-color:${headerColor}"` : '';

  let tableRows = '';
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'title') { // تجنب تكرار العنوان
      tableRows += `
        <tr>
          <td>${key}:</td>
          <td>${value}</td>
        </tr>
      `;
    }
  }

  return `
    <div class="popup-header"${headerStyle}>
      <h3 class="popup-title">${title}</h3>
    </div>
    <div class="popup-body">
      <table class="popup-table">
        ${tableRows}
      </table>
    </div>
  `;
}
