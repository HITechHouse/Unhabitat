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
  // Toolbar button event listeners
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const homeBtn = document.getElementById('home-btn');
  const layersBtn = document.getElementById('layers-btn');
  const measureBtn = document.getElementById('measure-btn');
  const drawBtn = document.getElementById('draw-btn');
  const basemapGallery = document.getElementById('basemap-gallery');

  // Measurement modal elements
  const measureTypeModal = document.getElementById('measure-type-modal');
  const measureDistanceBtn = document.getElementById('measure-distance-btn');
  const measureAreaBtn = document.getElementById('measure-area-btn');
  const measureCancelBtn = document.getElementById('measure-cancel-btn');

  // Home view settings
  const homeView = [36.2021, 37.1343];
  const homeZoom = 12;

  if (zoomInBtn) zoomInBtn.onclick = () => map && map.zoomIn();
  if (zoomOutBtn) zoomOutBtn.onclick = () => map && map.zoomOut();
  if (homeBtn) homeBtn.onclick = () => map && map.setView(homeView, homeZoom);

  // Basemap gallery logic
  const basemaps = [
    { name: 'Streets', layer: baseLayers.osm, img: 'https://a.tile.openstreetmap.org/10/563/402.png' },
    { name: 'Satellite', layer: baseLayers.satellite, img: 'https://mt1.google.com/vt/lyrs=s&x=563&y=402&z=10' },
    { name: 'Terrain', layer: baseLayers.terrain, img: 'https://a.tile.opentopomap.org/10/563/402.png' }
  ];
  basemapGallery.innerHTML = '';
  basemaps.forEach((bm, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'basemap-thumb' + (map.hasLayer(bm.layer) ? ' selected' : '');
    thumb.innerHTML = `<img src="${bm.img}" alt="${bm.name}"><div class="basemap-label">${bm.name}</div>`;
    thumb.addEventListener('click', () => {
      basemaps.forEach(b => map.removeLayer(b.layer));
      map.addLayer(bm.layer);
      document.querySelectorAll('.basemap-thumb').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
    });
    basemapGallery.appendChild(thumb);
  });
  // Show/hide gallery on layers button click
  if (layersBtn) {
    layersBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      basemapGallery.classList.toggle('open');
    });
  }
  // Hide basemap gallery when clicking outside
  document.addEventListener('click', function (e) {
    if (basemapGallery.classList.contains('open')) {
      if (!basemapGallery.contains(e.target) && e.target !== layersBtn) {
        basemapGallery.classList.remove('open');
      }
    }
  });

  // Measurement tool toggle
  if (measureBtn) measureBtn.onclick = () => {
    if (measureTypeModal) measureTypeModal.style.display = 'flex';
  };

  // Drawing tool toggle
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // --- Drawing Modal ---
  // Create drawing modal if not exists
  let drawTypeModal = document.getElementById('draw-type-modal');
  if (!drawTypeModal) {
    drawTypeModal = document.createElement('div');
    drawTypeModal.id = 'draw-type-modal';
    drawTypeModal.style.position = 'fixed';
    drawTypeModal.style.top = '0';
    drawTypeModal.style.left = '0';
    drawTypeModal.style.width = '100vw';
    drawTypeModal.style.height = '100vh';
    drawTypeModal.style.background = 'rgba(0,0,0,0.3)';
    drawTypeModal.style.display = 'none';
    drawTypeModal.style.alignItems = 'center';
    drawTypeModal.style.justifyContent = 'center';
    drawTypeModal.style.zIndex = '2000';
    drawTypeModal.innerHTML = `
      <div style="background:#fff;padding:32px 24px;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);min-width:320px;text-align:center;direction:rtl;">
        <div style="font-size:18px;font-weight:600;margin-bottom:18px;">اختر نوع الشكل المراد رسمه</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button id="draw-polyline-btn" style="padding:10px 0;font-size:15px;border:none;background:#e3f2fd;border-radius:8px;cursor:pointer;">رسم خط</button>
          <button id="draw-polygon-btn" style="padding:10px 0;font-size:15px;border:none;background:#e3f2fd;border-radius:8px;cursor:pointer;">رسم مضلع</button>
          <button id="draw-rectangle-btn" style="padding:10px 0;font-size:15px;border:none;background:#e3f2fd;border-radius:8px;cursor:pointer;">رسم مستطيل</button>
          <button id="draw-circle-btn" style="padding:10px 0;font-size:15px;border:none;background:#e3f2fd;border-radius:8px;cursor:pointer;">رسم دائرة</button>
          <button id="draw-marker-btn" style="padding:10px 0;font-size:15px;border:none;background:#e3f2fd;border-radius:8px;cursor:pointer;">إضافة نقطة</button>
          <button id="draw-cancel-btn" style="padding:10px 0;font-size:15px;border:none;background:#eee;border-radius:8px;cursor:pointer;">إلغاء</button>
        </div>
      </div>
    `;
    document.body.appendChild(drawTypeModal);
  }

  // Drawing tool logic
  let activeDrawShape = null;
  if (drawBtn) drawBtn.onclick = () => {
    drawTypeModal.style.display = 'flex';
  };

  // Modal button handlers
  drawTypeModal.querySelector('#draw-polyline-btn').onclick = function() {
    drawTypeModal.style.display = 'none';
    if (activeDrawShape) activeDrawShape.disable();
    activeDrawShape = new L.Draw.Polyline(map, { shapeOptions: { color: '#db4a29', weight: 4 } });
    activeDrawShape.enable();
  };
  drawTypeModal.querySelector('#draw-polygon-btn').onclick = function() {
    drawTypeModal.style.display = 'none';
    if (activeDrawShape) activeDrawShape.disable();
    activeDrawShape = new L.Draw.Polygon(map, { shapeOptions: { color: '#2196f3', weight: 3 } });
    activeDrawShape.enable();
  };
  drawTypeModal.querySelector('#draw-rectangle-btn').onclick = function() {
    drawTypeModal.style.display = 'none';
    if (activeDrawShape) activeDrawShape.disable();
    activeDrawShape = new L.Draw.Rectangle(map, { shapeOptions: { color: '#43a047', weight: 3 } });
    activeDrawShape.enable();
  };
  drawTypeModal.querySelector('#draw-circle-btn').onclick = function() {
    drawTypeModal.style.display = 'none';
    if (activeDrawShape) activeDrawShape.disable();
    activeDrawShape = new L.Draw.Circle(map, { shapeOptions: { color: '#fbc02d', weight: 3 } });
    activeDrawShape.enable();
  };
  drawTypeModal.querySelector('#draw-marker-btn').onclick = function() {
    drawTypeModal.style.display = 'none';
    if (activeDrawShape) activeDrawShape.disable();
    activeDrawShape = new L.Draw.Marker(map, {});
    activeDrawShape.enable();
  };
  drawTypeModal.querySelector('#draw-cancel-btn').onclick = function() {
    drawTypeModal.style.display = 'none';
    if (activeDrawShape) activeDrawShape.disable();
  };

  // Draw created event for custom popup with delete
  map.on('draw:created', function (e) {
    const layer = e.layer;
    // Create custom popup content with delete button
    const popupContent = document.createElement('div');
    popupContent.className = 'draw-popup';
    popupContent.style.padding = '10px';
    popupContent.style.textAlign = 'center';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-draw-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> حذف الشكل';
    deleteButton.style.backgroundColor = '#dc3545';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.borderRadius = '4px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginTop = '5px';
    deleteButton.style.width = '100%';
    deleteButton.onclick = function() {
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

  if (measureCancelBtn) measureCancelBtn.onclick = () => {
    if (measureTypeModal) measureTypeModal.style.display = 'none';
    if (activeDraw) { activeDraw.disable(); }
    measureMode = null;
  };
  if (measureDistanceBtn) measureDistanceBtn.onclick = () => {
    if (measureTypeModal) measureTypeModal.style.display = 'none';
    startMeasureMode('distance');
  };
  if (measureAreaBtn) measureAreaBtn.onclick = () => {
    if (measureTypeModal) measureTypeModal.style.display = 'none';
    startMeasureMode('area');
  };

  // أضف مستمع zoomend بعد تهيئة الخريطة
  if (map) {
    map.on('zoomend', function() {
      const zoom = map.getZoom();
      if (zoom >= 14) {
        if (neighborhoodsLayer && !map.hasLayer(neighborhoodsLayer)) map.addLayer(neighborhoodsLayer);
        if (neighborhoodLabelsLayer && !map.hasLayer(neighborhoodLabelsLayer)) map.addLayer(neighborhoodLabelsLayer);
        if (serviceSectorsLayer && map.hasLayer(serviceSectorsLayer)) map.removeLayer(serviceSectorsLayer);
      } else {
        if (serviceSectorsLayer && !map.hasLayer(serviceSectorsLayer)) map.addLayer(serviceSectorsLayer);
        if (neighborhoodsLayer && map.hasLayer(neighborhoodsLayer)) map.removeLayer(neighborhoodsLayer);
        if (neighborhoodLabelsLayer && map.hasLayer(neighborhoodLabelsLayer)) map.removeLayer(neighborhoodLabelsLayer);
      }
    });
  }
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

  // --- إضافة طبقات إضافية (Overlays) ---
  // سنضيف طبقة التسميات لاحقاً بعد تحميل الأحياء
  const overlays = {};

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

  // إضافة متحكم الطبقات إلى الخريطة
  L.control.layers(baseLayers, null, {
    position: 'topleft',
    collapsed: true
  }).addTo(map);

  // إضافة متحكم الزوم إلى الخريطة
  L.control.zoom({
    position: 'topleft'
  }).addTo(map);

  // إضافة مقياس للخريطة (دائماً)
  L.control.scale({
    position: 'bottomleft',
    imperial: false
  }).addTo(map);

  // إضافة أدوات الرسم دائماً
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);

  // Add draw:created event listener
  map.on('draw:created', function (e) {
    const layer = e.layer;
    let result = '';
    if (e.layerType === 'polyline') {
      // Calculate distance
      const latlngs = layer.getLatLngs();
      let distance = 0;
      for (let i = 1; i < latlngs.length; i++) {
        distance += latlngs[i - 1].distanceTo(latlngs[i]);
      }
      result = `المسافة: ${(distance / 1000).toFixed(2)} كم`;
    } else if (e.layerType === 'polygon') {
      // Calculate area
      const latlngs = layer.getLatLngs()[0];
      const area = L.GeometryUtil ? L.GeometryUtil.geodesicArea(latlngs) : 0;
      result = `المساحة: ${(area / 1000000).toFixed(2)} كم²`;
    }

    // Create custom popup content with buttons
    const popupContent = document.createElement('div');
    popupContent.className = 'measurement-popup';
    popupContent.style.padding = '10px';
    popupContent.style.textAlign = 'center';
    
    // Add measurement result
    const resultDiv = document.createElement('div');
    resultDiv.style.marginBottom = '10px';
    resultDiv.style.fontWeight = 'bold';
    resultDiv.textContent = result;
    popupContent.appendChild(resultDiv);

    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-measurement-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> حذف القياس';
    deleteButton.style.backgroundColor = '#dc3545';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.borderRadius = '4px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginTop = '5px';
    deleteButton.style.width = '100%';
    
    deleteButton.onclick = function() {
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
    if (activeDraw) { activeDraw.disable(); }
    measureMode = null;
    
    // Show result in floating box
    showMeasureResultBox(result);
  });

  // إعداد عناصر التحكم في الخريطة
  setupMapControls();

  // تحميل الطبقات
  loadLayers();

  // Initialize base layer controls
  initBaseLayerControls();

  // Add default base layer
  currentBaseLayer.addTo(map);

  // Add scale bar (always visible)
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

  // Basemap gallery logic
  const basemapGallery = document.getElementById('basemap-gallery');
  const basemaps = [
    { name: 'Streets', layer: streetsLayer, img: 'https://a.tile.openstreetmap.org/10/563/402.png' },
    { name: 'Satellite', layer: satelliteLayer, img: 'https://mt1.google.com/vt/lyrs=s&x=563&y=402&z=10' },
    { name: 'Terrain', layer: terrainLayer, img: 'https://a.tile.opentopomap.org/10/563/402.png' }
  ];
  basemapGallery.innerHTML = '';
  basemaps.forEach((bm, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'basemap-thumb' + (map.hasLayer(bm.layer) ? ' selected' : '');
    thumb.innerHTML = `<img src="${bm.img}" alt="${bm.name}"><div class="basemap-label">${bm.name}</div>`;
    thumb.addEventListener('click', () => {
      basemaps.forEach(b => map.removeLayer(b.layer));
      map.addLayer(bm.layer);
      document.querySelectorAll('.basemap-thumb').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
    });
    basemapGallery.appendChild(thumb);
  });
  // Show/hide gallery on layers button click
  const layersBtn = document.getElementById('layers-btn');
  if (layersBtn) {
    layersBtn.addEventListener('click', () => {
      basemapGallery.classList.toggle('open');
    });
  }

  // Add clear measurements button
  addClearMeasurementsButton();

  // At the end of initMap, set window.map = map
  window.map = map;

  // Modify layers button position and style
  if (layersBtn) {
    // Update button position and style
    layersBtn.style.position = 'fixed';
    layersBtn.style.left = '20px';
    layersBtn.style.bottom = '80px'; // Position above footer
    layersBtn.style.zIndex = '1000';
    layersBtn.style.backgroundColor = '#fff';
    layersBtn.style.border = 'none';
    layersBtn.style.borderRadius = '50%'; // Make it circular
    layersBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    layersBtn.style.padding = '12px';
    layersBtn.style.cursor = 'pointer';
    layersBtn.style.display = 'flex';
    layersBtn.style.alignItems = 'center';
    layersBtn.style.justifyContent = 'center';
    layersBtn.style.transition = 'all 0.3s ease';
    layersBtn.style.width = '48px';
    layersBtn.style.height = '48px';
    
    // Add hover effect
    layersBtn.onmouseover = function() {
      this.style.transform = 'scale(1.1)';
      this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    };
    layersBtn.onmouseout = function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    };
    
    // Add image to button
    const layersIcon = document.createElement('img');
    layersIcon.src = '../maps/assets/img/images.jpg';
    layersIcon.alt = 'Layers';
    layersIcon.style.width = '24px';
    layersIcon.style.height = '24px';
    
    // Clear existing content and add new content
    layersBtn.innerHTML = '';
    layersBtn.appendChild(layersIcon);
    
    // Update basemap gallery position and style
    const basemapGallery = document.getElementById('basemap-gallery');
    if (basemapGallery) {
      // Reset any existing styles
      basemapGallery.style.cssText = '';
      
      // Apply new styles
      Object.assign(basemapGallery.style, {
        position: 'fixed',
        left: '20px',
        bottom: '140px',
        zIndex: '999',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        padding: '20px',
        display: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: '0',
        transform: 'translateY(20px)',
        maxWidth: '320px',
        width: '100%',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        direction: 'rtl'
      });

      // Clear existing content
      basemapGallery.innerHTML = '';

      // Add title to gallery
      const galleryTitle = document.createElement('div');
      Object.assign(galleryTitle.style, {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
        textAlign: 'center',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        fontFamily: 'Cairo, sans-serif'
      });
      galleryTitle.textContent = 'اختر نوع الخريطة';
      basemapGallery.appendChild(galleryTitle);

      // Create container for basemap options
      const optionsContainer = document.createElement('div');
      Object.assign(optionsContainer.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      });

      // Add basemap options
      const basemaps = [
        { name: 'خريطة الشوارع', layer: baseLayers.osm, img: 'https://a.tile.openstreetmap.org/10/563/402.png' },
        { name: 'صور الأقمار الصناعية', layer: baseLayers.satellite, img: 'https://mt1.google.com/vt/lyrs=s&x=563&y=402&z=10' },
        { name: 'الخريطة الطبوغرافية', layer: baseLayers.terrain, img: 'https://a.tile.opentopomap.org/10/563/402.png' }
      ];

      basemaps.forEach((bm, idx) => {
        const option = document.createElement('div');
        Object.assign(option.style, {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(0,0,0,0.05)'
        });

        const img = document.createElement('img');
        Object.assign(img.style, {
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          objectFit: 'cover'
        });
        img.src = bm.img;
        img.alt = bm.name;

        const label = document.createElement('div');
        Object.assign(label.style, {
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          fontFamily: 'Cairo, sans-serif'
        });
        label.textContent = bm.name;

        option.appendChild(img);
        option.appendChild(label);

        // Add hover effect
        option.onmouseover = function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          this.style.backgroundColor = '#f1f3f5';
        };
        option.onmouseout = function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
          if (!this.classList.contains('selected')) {
            this.style.backgroundColor = '#f8f9fa';
          }
        };

        // Add click handler
        option.onclick = function() {
          // Remove selected class from all options
          optionsContainer.querySelectorAll('div').forEach(opt => {
            opt.classList.remove('selected');
            opt.style.backgroundColor = '#f8f9fa';
            opt.style.boxShadow = 'none';
          });

          // Add selected class to clicked option
          this.classList.add('selected');
          this.style.backgroundColor = '#e3f2fd';
          this.style.boxShadow = '0 2px 8px rgba(33,150,243,0.15)';

          // Switch basemap
          basemaps.forEach(b => map.removeLayer(b.layer));
          map.addLayer(bm.layer);
        };

        optionsContainer.appendChild(option);
      });

      basemapGallery.appendChild(optionsContainer);

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      Object.assign(closeButton.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        color: '#666',
        cursor: 'pointer',
        padding: '5px',
        lineHeight: '1',
        transition: 'color 0.2s ease',
        fontFamily: 'Cairo, sans-serif'
      });

      closeButton.onmouseover = function() {
        this.style.color = '#333';
      };
      closeButton.onmouseout = function() {
        this.style.color = '#666';
      };

      closeButton.onclick = function(e) {
        e.stopPropagation();
        basemapGallery.style.opacity = '0';
        basemapGallery.style.transform = 'translateY(20px)';
        setTimeout(() => {
          basemapGallery.style.display = 'none';
        }, 300);
      };

      basemapGallery.appendChild(closeButton);

      // Add click handler for layers button (show/hide gallery with animation)
      if (layersBtn) {
        layersBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const isOpen = basemapGallery.style.display === 'block';
          if (isOpen) {
            basemapGallery.style.opacity = '0';
            basemapGallery.style.transform = 'translateY(20px)';
            setTimeout(() => {
              basemapGallery.style.display = 'none';
            }, 300);
          } else {
            basemapGallery.style.display = 'block';
            setTimeout(() => {
              basemapGallery.style.opacity = '1';
              basemapGallery.style.transform = 'translateY(0)';
            }, 10);
          }
        });
      }
      // Close gallery when clicking outside
      document.addEventListener('click', function(e) {
        if (basemapGallery && !basemapGallery.contains(e.target) && e.target !== layersBtn) {
          basemapGallery.style.opacity = '0';
          basemapGallery.style.transform = 'translateY(20px)';
          setTimeout(() => {
            basemapGallery.style.display = 'none';
          }, 300);
        }
      });
    }
  }

  // بعد تحميل طبقة الأحياء وطبقة التسميات، أضفهم إلى لوحة التحكم
  setTimeout(function() {
    if (neighborhoodsLayer) overlays["طبقة الأحياء"] = neighborhoodsLayer;
    if (neighborhoodLabelsLayer) overlays["مسميات الأحياء"] = neighborhoodLabelsLayer;
    if (serviceSectorsLayer) overlays["دوائر الخدمات"] = serviceSectorsLayer;
    // إعادة إنشاء لوحة التحكم بالطبقات
    L.control.layers(baseLayers, overlays, {
      position: 'topleft',
      collapsed: false
    }).addTo(map);
  }, 800);
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
  if (neighborhoodLabelsLayer) {
    map.removeLayer(neighborhoodLabelsLayer);
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
  });

  // Add labels for each neighborhood
  neighborhoodLabelsLayer = L.layerGroup();
  neighborhoodsData.features.forEach(feature => {
    try {
      let coords = feature.geometry.coordinates[0];
      let sumLat = 0, sumLng = 0;
      coords.forEach(coord => {
        sumLat += coord[1];
        sumLng += coord[0];
      });
      let centerLat = sumLat / coords.length;
      let centerLng = sumLng / coords.length;
      let name = feature.properties.Names || feature.properties.name || 'غير معروف';
      let label = L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: 'neighborhood-label',
          html: `<div style="background:rgba(255,255,255,0.85);border-radius:8px;padding:2px 10px;font-size:13px;font-weight:600;color:#3066ff;box-shadow:0 2px 8px rgba(0,0,0,0.08);font-family:'Cairo',sans-serif;">${name}</div>`,
          iconSize: [100, 24],
          iconAnchor: [50, 12]
        })
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
    "الخريطة الطبوغرافية": baseLayersArr[2].layer
  };
  const overlays = {
    "طبقة الأحياء": neighborhoodsLayer,
    "مسميات الأحياء": neighborhoodLabelsLayer
  };
  if (serviceSectorsLayer) overlays["دوائر الخدمات"] = serviceSectorsLayer;
  layersControl = L.control.layers(baseLayers, overlays, {
    position: 'topleft',
    collapsed: false
  }).addTo(map);

  // Fit map bounds to show all neighborhoods
  map.fitBounds(neighborhoodsLayer.getBounds());
}

// Function to create popup content for neighborhood
function createNeighborhoodPopup(feature, layer) {
  const properties = feature.properties;
  const name = properties.Names || properties.name || 'غير معروف';
  const area = calculateArea(feature.geometry);
  const areaInHectares = (area / 10000).toFixed(2); // Convert to hectares
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
  areaSpan.textContent = `${areaInHectares} هكتار`;
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

  // فقط المعلومات، بدون أي أزرار أو button-group
  popupContent.appendChild(header);
  popupContent.appendChild(infoContainer);

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

  // Get the active tab
  const activeTab = document.querySelector('.tab-button.active');
  const tabName = activeTab ? activeTab.textContent.trim() : '';
  const tabId = activeTab ? activeTab.getAttribute('data-tab') : null;

  // Set the title
  infoTitle.textContent = name + (tabName ? ' - ' + tabName : '') || 'تفاصيل الحي';

  // Clear previous content
  infoContent.innerHTML = '';

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

    // إنشاء جدول info-table
    const table = document.createElement('table');
    table.className = 'info-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '1rem';

    // رأس الجدول
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.textContent = 'المعرف';
    th1.style.width = '40%';
    th1.style.textAlign = 'right';
    th1.style.padding = '12px 15px';
    th1.style.backgroundColor = '#1e40af';
    th1.style.color = 'white';
    const th2 = document.createElement('th');
    th2.textContent = 'القيمة';
    th2.style.width = '60%';
    th2.style.textAlign = 'right';
    th2.style.padding = '12px 15px';
    th2.style.backgroundColor = '#1e40af';
    th2.style.color = 'white';
    headerRow.appendChild(th1);
    headerRow.appendChild(th2);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // جسم الجدول
    const tbody = document.createElement('tbody');
    tableData.fields.forEach((field, index) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #ddd';
      if (index % 2 === 0) {
        row.style.backgroundColor = '#f8fafc';
      }
      // اسم الحقل
      let fieldName = field.name;
      const currentLang = document.documentElement.lang || 'ar';
      if (window.fieldTranslations && window.fieldTranslations[currentLang] && window.fieldTranslations[currentLang][field.key]) {
        fieldName = window.fieldTranslations[currentLang][field.key];
      }
      const labelCell = document.createElement('td');
      labelCell.textContent = fieldName;
      labelCell.style.fontWeight = '600';
      labelCell.style.padding = '12px 15px';
      labelCell.style.borderRight = '1px solid #ddd';
      labelCell.style.textAlign = 'right';
      // قيمة الحقل
      const valueCell = document.createElement('td');
      valueCell.style.padding = '12px 15px';
      let input;
      if (field.key === 'neighborhood_id') {
        input = document.createElement('input');
        input.type = 'text';
        input.value = id || '';
        input.readOnly = true;
      } else if (field.type === 'select') {
        input = document.createElement('select');
        input.className = 'editable-field';
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          input.appendChild(optionElement);
        });
        input.value = tableData.sampleData[field.key] || '';
        input.readOnly = !field.editable;
      } else if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'editable-field';
        input.rows = 3;
        input.value = tableData.sampleData[field.key] || '';
        input.readOnly = !field.editable;
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        input.value = tableData.sampleData[field.key] || '';
        input.readOnly = !field.editable;
      }
      input.className = 'editable-field';
      input.setAttribute('data-field', field.key);
      input.setAttribute('data-original-value', input.value);
      input.style.width = '100%';
      input.style.padding = '8px';
      input.style.border = '1px solid #ddd';
      input.style.borderRadius = '4px';
      valueCell.appendChild(input);
      row.appendChild(labelCell);
      row.appendChild(valueCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    form.appendChild(table);
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

  // Add button group
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'button-group';
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'space-between';
  buttonGroup.style.gap = '10px';
  buttonGroup.style.marginTop = '1rem';

  const cancelButton = document.createElement('button');
  cancelButton.id = 'cancel-changes';
  cancelButton.textContent = 'إلغاء التعديلات';
  cancelButton.style.flex = '1';
  cancelButton.style.padding = '0.6rem 1rem';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '6px';
  cancelButton.style.backgroundColor = '#f3f4f6';
  cancelButton.style.color = '#4b5563';
  cancelButton.style.cursor = 'pointer';

  const saveButton = document.createElement('button');
  saveButton.id = 'save-changes';
  saveButton.textContent = 'حفظ التغييرات';
  saveButton.style.flex = '1';
  saveButton.style.padding = '0.6rem 1rem';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '6px';
  saveButton.style.backgroundColor = '#1e40af';
  saveButton.style.color = 'white';
  saveButton.style.cursor = 'pointer';

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(saveButton);
  infoContent.appendChild(buttonGroup);
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
  // Toggle between distance and area mode
  if (!measureMode || measureMode === 'area') {
    // Start distance measurement
    measureMode = 'distance';
    if (activeDraw) { activeDraw.disable(); }
    activeDraw = new L.Draw.Polyline(map, {
      shapeOptions: { color: '#db4a29', weight: 4 },
      metric: true
    });
    activeDraw.enable();
    alert('انقر على الخريطة لرسم خط لقياس المسافة. عند الانتهاء، انقر مرتين.');
  } else if (measureMode === 'distance') {
    // Start area measurement
    measureMode = 'area';
    if (activeDraw) { activeDraw.disable(); }
    activeDraw = new L.Draw.Polygon(map, {
      shapeOptions: { color: '#2196f3', weight: 3 },
      showArea: true,
      metric: true
    });
    activeDraw.enable();
    alert('انقر على الخريطة لرسم مضلع لقياس المساحة. عند الانتهاء، انقر على النقطة الأولى لإغلاق المضلع.');
  }
}

function startMeasureMode(type) {
  measureMode = type;
  if (activeDraw) { activeDraw.disable(); }
  if (type === 'distance') {
    activeDraw = new L.Draw.Polyline(map, {
      shapeOptions: { color: '#db4a29', weight: 4 },
      metric: true
    });
    activeDraw.enable();
  } else if (type === 'area') {
    activeDraw = new L.Draw.Polygon(map, {
      shapeOptions: { color: '#2196f3', weight: 3 },
      showArea: true,
      metric: true
    });
    activeDraw.enable();
  }
}

function showMeasureResultBox(result) {
  const box = document.getElementById('measure-result-box');
  if (!box) return;
  box.textContent = result;
  box.style.display = 'block';
  box.style.opacity = '1';
}

// Add clear measurements button to the map
function addClearMeasurementsButton() {
  const clearButton = L.control({ position: 'topright' });
  
  clearButton.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = `
      <a href="#" title="مسح جميع القياسات" style="background-color: #fff; color: #333; padding: 6px 10px; display: block; text-decoration: none; font-size: 14px;">
        <i class="fas fa-trash"></i> مسح القياسات
      </a>
    `;
    
    div.onclick = function(e) {
      e.preventDefault();
      if (drawnItems) {
        drawnItems.clearLayers();
      }
    };
    
    return div;
  };
  
  clearButton.addTo(map);
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
    onEachFeature: createServiceSectorPopup
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
        <p><strong>المساحة:</strong> ${(properties.Shape_Area / 10000).toFixed(2)} هكتار</p>
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

function createServiceSectorPopup(feature, layer) {
  const properties = feature.properties;
  const name = properties.Name || properties.name || 'دائرة خدمات';
  const sectorId = properties.OBJECTID;

  const popupContent = document.createElement('div');
  popupContent.className = 'popup-info';
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

  // Add basic info
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
  idSpan.textContent = properties.OBJECTID || 'غير متوفر';
  idSpan.style.fontWeight = '500';
  idSpan.style.background = 'rgba(237, 242, 247, 0.5)';
  idSpan.style.padding = '3px 8px';
  idSpan.style.borderRadius = '4px';

  idPara.appendChild(idStrong);
  idPara.appendChild(idSpan);

  // Add population info if available
  if (properties.Pop) {
    const popPara = document.createElement('p');
    popPara.style.margin = '8px 0';
    popPara.style.fontSize = '14px';
    popPara.style.color = '#4a5568';
    popPara.style.display = 'flex';
    popPara.style.alignItems = 'center';
    popPara.style.justifyContent = 'space-between';
    popPara.style.padding = '8px 0';
    popPara.style.borderBottom = '1px dashed rgba(203, 213, 224, 0.5)';

    const popStrong = document.createElement('strong');
    popStrong.style.color = '#2d3748';
    popStrong.style.fontWeight = '600';
    popStrong.style.marginLeft = '8px';
    popStrong.style.display = 'flex';
    popStrong.style.alignItems = 'center';
    popStrong.style.gap = '6px';

    const popIcon = document.createElement('i');
    popIcon.className = 'fas fa-users';
    popIcon.style.color = '#3066ff';
    popIcon.style.fontSize = '14px';
    popIcon.style.width = '16px';
    popIcon.style.textAlign = 'center';

    popStrong.appendChild(popIcon);
    popStrong.appendChild(document.createTextNode(' عدد السكان:'));

    const popSpan = document.createElement('span');
    popSpan.textContent = properties.Pop.toLocaleString('ar-SY');
    popSpan.style.fontWeight = '500';
    popSpan.style.background = 'rgba(237, 242, 247, 0.5)';
    popSpan.style.padding = '3px 8px';
    popSpan.style.borderRadius = '4px';

    popPara.appendChild(popStrong);
    popPara.appendChild(popSpan);
    infoContainer.appendChild(popPara);
  }

  // Add area info
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
  areaSpan.textContent = `${(properties.Shape_Area / 10000).toFixed(2)} هكتار`;
  areaSpan.style.fontWeight = '500';
  areaSpan.style.background = 'rgba(237, 242, 247, 0.5)';
  areaSpan.style.padding = '3px 8px';
  areaSpan.style.borderRadius = '4px';

  areaPara.appendChild(areaStrong);
  areaPara.appendChild(areaSpan);

  // Add all info to container
  infoContainer.appendChild(idPara);
  infoContainer.appendChild(areaPara);

  // Create button
  const button = document.createElement('button');
  button.className = 'view-details-btn';
  button.onclick = function () {
    if (window.setSelectedSector) {
      window.setSelectedSector(sectorId, name);
    }
  };
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
  popupContent.appendChild(header);
  popupContent.appendChild(infoContainer);
  popupContent.appendChild(button);

  layer.bindPopup(popupContent);
}
