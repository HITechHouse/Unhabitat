/**
 * Advanced Layer Manager - ArcMap-style layer management
 * Provides drag-and-drop, grouping, and advanced layer controls
 */

class AdvancedLayerManager {
  constructor(map) {
    this.map = map;
    this.layers = new Map();
    this.layerGroups = new Map();
    this.selectedLayer = null;
    this.draggedElement = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeDefaultLayers();
  }

  setupEventListeners() {
    // Layer group toggle functionality
    document.addEventListener('click', (e) => {
      if (e.target.closest('.layer-group-toggle')) {
        this.toggleLayerGroup(e.target.closest('.layer-group-toggle'));
      }
    });

    // Layer group checkbox functionality
    document.addEventListener('change', (e) => {
      if (e.target.closest('.layer-group-checkbox input')) {
        this.toggleLayerGroupVisibility(e.target);
      }
    });

    // Individual layer checkbox functionality
    document.addEventListener('change', (e) => {
      if (e.target.closest('.layer-checkbox input')) {
        this.toggleLayerVisibility(e.target);
      }
    });

    // Layer action buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.layer-action-btn')) {
        this.handleLayerAction(e.target.closest('.layer-action-btn'));
      }
    });

    // Layer selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.layer-item')) {
        this.selectLayer(e.target.closest('.layer-item'));
      }
    });

    // Base layer selection
    document.addEventListener('change', (e) => {
      if (e.target.name === 'basemap') {
        this.changeBaseLayer(e.target.id);
      }
    });

    // Drag and drop functionality
    this.setupDragAndDrop();

    // Toolbar buttons
    document.getElementById('addLayerBtn')?.addEventListener('click', () => this.showAddLayerDialog());
    document.getElementById('removeLayerBtn')?.addEventListener('click', () => this.removeSelectedLayer());
    document.getElementById('layerPropertiesBtn')?.addEventListener('click', () => this.showLayerProperties());

    // Import/Export enhanced functionality
    this.setupImportExportHandlers();
  }

  toggleLayerGroup(toggleBtn) {
    const layerGroup = toggleBtn.closest('.layer-group');
    const content = layerGroup.querySelector('.layer-group-content');
    const isExpanded = toggleBtn.getAttribute('data-expanded') === 'true';
    
    toggleBtn.setAttribute('data-expanded', !isExpanded);
    content.setAttribute('data-collapsed', isExpanded);
    
    // Animate the toggle
    if (isExpanded) {
      content.style.maxHeight = '0px';
      content.style.overflow = 'hidden';
      setTimeout(() => {
        content.style.display = 'none';
      }, 200);
    } else {
      content.style.display = 'block';
      content.style.maxHeight = 'none';
      content.style.overflow = 'visible';
    }
  }

  toggleLayerGroupVisibility(checkbox) {
    const layerGroup = checkbox.closest('.layer-group');
    const groupName = layerGroup.getAttribute('data-layer-group');
    const isVisible = checkbox.checked;

    console.log('Toggling layer group visibility:', groupName, isVisible);

    // Get the global map object
    const map = window.map;
    if (!map) {
      console.error('Map object not found');
      return;
    }

    // Handle main layers group specially
    if (groupName === 'main-layers' && window.mainLayersGroup) {
      if (isVisible) {
        if (!map.hasLayer(window.mainLayersGroup)) {
          map.addLayer(window.mainLayersGroup);
          console.log('Added main layers group to map');
        }
      } else {
        if (map.hasLayer(window.mainLayersGroup)) {
          map.removeLayer(window.mainLayersGroup);
          console.log('Removed main layers group from map');
        }
      }
    }

    // Toggle all layers in the group
    const layerItems = layerGroup.querySelectorAll('.layer-item input[type="checkbox"]');
    layerItems.forEach(layerCheckbox => {
      layerCheckbox.checked = isVisible;
      this.toggleLayerVisibility(layerCheckbox);
    });

    // Update visual state of the group
    layerGroup.style.opacity = isVisible ? '1' : '0.5';
  }

  toggleLayerVisibility(checkbox) {
    const layerItem = checkbox.closest('.layer-item');
    const layerName = layerItem.getAttribute('data-layer');
    const isVisible = checkbox.checked;

    console.log('Toggling layer visibility:', layerName, isVisible);

    // Get the global map object
    const map = window.map;
    if (!map) {
      console.error('Map object not found');
      return;
    }

    // Map layer names to actual global layer variables
    let layer = null;
    switch(layerName) {
      case 'neighborhoods-polygons':
        layer = window.neighborhoodsLayer;
        break;
      case 'neighborhoods-labels':
        layer = window.neighborhoodLabelsLayer;
        break;
      case 'service-sectors-polygons':
        layer = window.serviceSectorsLayer || window.serviceSectorsGeoJsonLayer;
        break;
      case 'service-sectors-labels':
        layer = window.serviceSectorLabelsLayer;
        break;
    }

    // Update map layer visibility
    if (layer && map) {
      if (isVisible) {
        if (!map.hasLayer(layer)) {
          map.addLayer(layer);
          console.log('Added layer to map:', layerName);
        }
      } else {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
          console.log('Removed layer from map:', layerName);
        }
      }
    } else {
      console.warn('Layer not found:', layerName, 'Available layers:', {
        neighborhoodsLayer: !!window.neighborhoodsLayer,
        neighborhoodLabelsLayer: !!window.neighborhoodLabelsLayer,
        serviceSectorsLayer: !!window.serviceSectorsLayer,
        serviceSectorLabelsLayer: !!window.serviceSectorLabelsLayer
      });
    }

    // Update visual state
    layerItem.style.opacity = isVisible ? '1' : '0.5';
  }

  handleLayerAction(actionBtn) {
    const action = actionBtn.getAttribute('data-action');
    const layerName = actionBtn.getAttribute('data-layer');

    console.log('Layer action:', action, 'for layer:', layerName);

    switch (action) {
      case 'zoom':
        this.zoomToLayer(layerName);
        break;
      case 'properties':
        this.showLayerProperties(layerName);
        break;
      case 'style':
        this.showStyleDialog(layerName);
        break;
      case 'table':
        this.showAttributeTable(layerName);
        break;
      case 'visibility':
        this.showVisibilitySettings(layerName);
        break;
      case 'remove':
        this.removeLayer(layerName);
        break;
    }
  }

  selectLayer(layerItem) {
    // Remove previous selection
    document.querySelectorAll('.layer-item.selected').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Add selection to current item
    layerItem.classList.add('selected');
    this.selectedLayer = layerItem.getAttribute('data-layer');
  }

  setupDragAndDrop() {
    console.log('Setting up drag and drop functionality...');

    // For now, disable drag and drop to avoid errors
    // We can implement a simpler version later
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
      item.setAttribute('draggable', 'false');
    });

    // Add up/down buttons instead for layer ordering
    this.addLayerOrderButtons();
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.layer-item:not(.dragging)')];

    if (draggableElements.length === 0) {
      return null;
    }

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  addLayerOrderButtons() {
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
      const actions = item.querySelector('.layer-actions');
      if (actions && !actions.querySelector('.layer-order-btn')) {
        // Add up button
        const upBtn = document.createElement('button');
        upBtn.className = 'layer-action-btn layer-order-btn';
        upBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        upBtn.title = 'تحريك لأعلى';
        upBtn.addEventListener('click', () => this.moveLayerUp(item));

        // Add down button
        const downBtn = document.createElement('button');
        downBtn.className = 'layer-action-btn layer-order-btn';
        downBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        downBtn.title = 'تحريك لأسفل';
        downBtn.addEventListener('click', () => this.moveLayerDown(item));

        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
      }
    });
  }

  moveLayerUp(layerItem) {
    const parent = layerItem.parentNode;
    const previousSibling = layerItem.previousElementSibling;
    if (previousSibling) {
      parent.insertBefore(layerItem, previousSibling);
      this.updateLayerOrder();
    }
  }

  moveLayerDown(layerItem) {
    const parent = layerItem.parentNode;
    const nextSibling = layerItem.nextElementSibling;
    if (nextSibling) {
      parent.insertBefore(nextSibling, layerItem);
      this.updateLayerOrder();
    }
  }

  updateLayerOrder() {
    // Update z-index of layers based on their position in the list
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach((item, index) => {
      const layerName = item.getAttribute('data-layer');
      if (this.layers.has(layerName)) {
        const layer = this.layers.get(layerName);
        if (layer.setZIndex) {
          layer.setZIndex(1000 - index);
        }
      }
    });
  }

  initializeDefaultLayers() {
    // Initialize with existing map layers
    if (window.neighborhoodsLayer) {
      this.layers.set('neighborhoods-polygons', window.neighborhoodsLayer);
    }
    if (window.serviceSectorsLayer) {
      this.layers.set('service-sectors-polygons', window.serviceSectorsLayer);
    }
    if (window.neighborhoodLabelsLayer) {
      this.layers.set('neighborhoods-labels', window.neighborhoodLabelsLayer);
    }
    if (window.serviceSectorLabelsLayer) {
      this.layers.set('service-sectors-labels', window.serviceSectorLabelsLayer);
    }
  }

  zoomToLayer(layerName) {
    console.log('Zooming to layer:', layerName);

    // Get the global map object
    const map = window.map;
    if (!map) {
      console.error('Map object not found');
      return;
    }

    let layer = null;

    // Check if it's in our layers map first
    if (this.layers.has(layerName)) {
      layer = this.layers.get(layerName);
    } else {
      // Map to global layer variables
      switch(layerName) {
        case 'neighborhoods':
        case 'neighborhoods-polygons':
          layer = window.neighborhoodsLayer;
          break;
        case 'neighborhoods-labels':
          layer = window.neighborhoodLabelsLayer;
          break;
        case 'service-sectors':
        case 'service-sectors-polygons':
          layer = window.serviceSectorsLayer || window.serviceSectorsGeoJsonLayer;
          break;
        case 'service-sectors-labels':
          layer = window.serviceSectorLabelsLayer;
          break;
      }
    }

    if (layer && layer.getBounds && layer.getBounds().isValid()) {
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      console.log('Zoomed to layer successfully');
    } else {
      console.warn('Cannot zoom to layer - layer not found or has no bounds:', layerName);
      alert('لا يمكن التكبير على هذه الطبقة');
    }
  }

  showLayerProperties(layerName) {
    // Show layer properties dialog
    const layer = this.layers.get(layerName);
    if (layer) {
      // Create and show properties dialog
      this.createPropertiesDialog(layerName, layer);
    }
  }

  showStyleDialog(layerName) {
    // Show style configuration dialog
    console.log('Opening style dialog for:', layerName);

    // Simple style dialog implementation
    const color = prompt('أدخل لون الطبقة (hex code):', '#ff0000');
    if (color) {
      this.applyLayerStyle(layerName, { color: color });
    }
  }

  showAttributeTable(layerName) {
    // Show attribute table
    console.log('Opening attribute table for:', layerName);

    let layer = this.getLayerByName(layerName);
    if (layer && layer.toGeoJSON) {
      const features = layer.toGeoJSON().features;
      if (features.length > 0) {
        const properties = features[0].properties;
        const tableContent = Object.entries(properties)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        alert('خصائص الطبقة:\n' + tableContent);
      } else {
        alert('لا توجد بيانات في هذه الطبقة');
      }
    } else {
      alert('لا يمكن عرض جدول البيانات لهذه الطبقة');
    }
  }

  showVisibilitySettings(layerName) {
    // Show visibility settings
    console.log('Opening visibility settings for:', layerName);
    alert('إعدادات الرؤية ستتوفر قريباً');
  }

  applyLayerStyle(layerName, style) {
    let layer = this.getLayerByName(layerName);
    if (layer && layer.setStyle) {
      layer.setStyle({
        color: style.color,
        weight: style.weight || 2,
        opacity: style.opacity || 0.8,
        fillColor: style.color,
        fillOpacity: style.fillOpacity || 0.5
      });
      console.log('Style applied to layer:', layerName);
    }
  }

  getLayerByName(layerName) {
    if (this.layers.has(layerName)) {
      return this.layers.get(layerName);
    }

    switch(layerName) {
      case 'neighborhoods':
      case 'neighborhoods-polygons':
        return window.neighborhoodsLayer;
      case 'neighborhoods-labels':
        return window.neighborhoodLabelsLayer;
      case 'service-sectors':
      case 'service-sectors-polygons':
        return window.serviceSectorsLayer || window.serviceSectorsGeoJsonLayer;
      case 'service-sectors-labels':
        return window.serviceSectorLabelsLayer;
      default:
        return null;
    }
  }

  showAddLayerDialog() {
    // Show add layer dialog
    console.log('Opening add layer dialog');
    // Implementation for add layer dialog
  }

  removeLayer(layerName) {
    if (confirm('هل أنت متأكد من حذف هذه الطبقة؟')) {
      // Get the global map object
      const map = window.map;
      if (!map) {
        console.error('Map object not found');
        return;
      }

      // Remove from map
      if (this.layers.has(layerName)) {
        const layer = this.layers.get(layerName);
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
        this.layers.delete(layerName);
      }

      // Remove from UI
      const layerElement = document.querySelector(`[data-layer="${layerName}"]`);
      if (layerElement) {
        const layerGroup = layerElement.closest('.layer-group');
        if (layerGroup) {
          layerGroup.remove();
        }
      }

      console.log('Layer removed:', layerName);
    }
  }

  removeSelectedLayer() {
    if (this.selectedLayer) {
      this.removeLayer(this.selectedLayer);
      this.selectedLayer = null;
    } else {
      alert('يرجى تحديد طبقة أولاً');
    }
  }

  createPropertiesDialog(layerName, layer) {
    // Create properties dialog implementation
    console.log('Creating properties dialog for:', layerName);
    // Implementation for properties dialog
  }

  setupImportExportHandlers() {
    // Enhanced import/export functionality
    document.getElementById('importLayerBtn')?.addEventListener('click', () => this.importLayer());
    document.getElementById('importFromUrlBtn')?.addEventListener('click', () => this.importFromUrl());
    document.getElementById('importFromServiceBtn')?.addEventListener('click', () => this.importFromService());
    document.getElementById('exportLayerBtn')?.addEventListener('click', () => this.exportLayer());
    document.getElementById('exportSelectedBtn')?.addEventListener('click', () => this.exportSelected());
    document.getElementById('printMapBtn')?.addEventListener('click', () => this.printMap());
    document.getElementById('saveMapImageBtn')?.addEventListener('click', () => this.saveMapImage());
    document.getElementById('generateReportBtn')?.addEventListener('click', () => this.generateReport());

    // File input handler
    document.getElementById('layerFileInput')?.addEventListener('change', (e) => this.handleFileImport(e));

    // Section toggle
    document.getElementById('dataManagerToggle')?.addEventListener('click', (e) => {
      const controls = document.querySelector('.import-export-controls');
      const icon = e.target.querySelector('i') || e.target;

      if (controls.style.display === 'none') {
        controls.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
      } else {
        controls.style.display = 'none';
        icon.className = 'fas fa-chevron-right';
      }
    });
  }

  importLayer() {
    const fileInput = document.getElementById('layerFileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data;
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
          data = JSON.parse(e.target.result);
          this.addGeoJSONLayer(data, file.name);
        } else if (fileName.endsWith('.kml')) {
          // For KML files, you'd need a KML parser
          alert('دعم ملفات KML سيتم إضافته قريباً');
        } else {
          alert('نوع الملف غير مدعوم. يرجى استخدام GeoJSON.');
        }
      } catch (error) {
        console.error('Error importing file:', error);
        alert('خطأ في استيراد الملف: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  addGeoJSONLayer(data, name) {
    // Get the global map object
    const map = window.map;
    if (!map) {
      console.error('Map object not found');
      return;
    }

    const layer = L.geoJSON(data, {
      style: {
        color: '#ff7800',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          layer.bindPopup(popupContent);
        }
      }
    }).addTo(map);

    // Add to layers list
    this.addImportedLayerToList(name, layer);

    // Zoom to layer
    map.fitBounds(layer.getBounds());

    alert('تم استيراد الطبقة بنجاح: ' + name);
  }

  addImportedLayerToList(name, layer) {
    const layersList = document.getElementById('layersList');
    const layerId = 'imported-' + Date.now();

    const layerGroup = document.createElement('div');
    layerGroup.className = 'layer-group';
    layerGroup.innerHTML = `
      <div class="layer-group-header">
        <button class="layer-group-toggle" data-expanded="true">
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="layer-group-checkbox">
          <input type="checkbox" id="group-${layerId}" checked />
        </div>
        <div class="layer-group-icon">
          <i class="fas fa-file-import"></i>
        </div>
        <span class="layer-group-name">${name}</span>
        <div class="layer-group-actions">
          <button class="layer-action-btn" data-action="zoom" data-layer="${layerId}">
            <i class="fas fa-search-plus"></i>
          </button>
          <button class="layer-action-btn" data-action="remove" data-layer="${layerId}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    layersList.appendChild(layerGroup);
    this.layers.set(layerId, layer);
  }

  exportLayer() {
    const layerSelect = document.getElementById('exportLayerSelect');
    const formatSelect = document.getElementById('exportFormat');

    if (!layerSelect.value) {
      alert('يرجى اختيار طبقة للتصدير');
      return;
    }

    const layerName = layerSelect.value;
    const format = formatSelect.value || 'geojson';

    let layer = null;
    switch(layerName) {
      case 'neighborhoods':
        layer = window.neighborhoodsLayer;
        break;
      case 'service-sectors':
        layer = window.serviceSectorsLayer || window.serviceSectorsGeoJsonLayer;
        break;
      default:
        layer = this.layers.get(layerName);
    }

    if (!layer) {
      alert('الطبقة المحددة غير موجودة');
      return;
    }

    this.downloadLayer(layer, layerName, format);
  }

  downloadLayer(layer, name, format) {
    try {
      let data, filename, mimeType;

      if (format === 'geojson') {
        data = JSON.stringify(layer.toGeoJSON(), null, 2);
        filename = `${name}.geojson`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        data = this.layerToCSV(layer);
        filename = `${name}.csv`;
        mimeType = 'text/csv';
      } else {
        alert('صيغة التصدير غير مدعومة حالياً');
        return;
      }

      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      alert('تم تصدير الطبقة بنجاح');
    } catch (error) {
      console.error('Export error:', error);
      alert('خطأ في تصدير الطبقة: ' + error.message);
    }
  }

  layerToCSV(layer) {
    const features = layer.toGeoJSON().features;
    if (features.length === 0) return '';

    const headers = Object.keys(features[0].properties || {});
    const csvRows = [headers.join(',')];

    features.forEach(feature => {
      const row = headers.map(header =>
        JSON.stringify(feature.properties[header] || '')
      );
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  printMap() {
    window.print();
  }

  saveMapImage() {
    // This would require additional libraries like html2canvas
    alert('ميزة حفظ الخريطة كصورة ستتوفر قريباً');
  }

  generateReport() {
    alert('ميزة إنشاء التقارير ستتوفر قريباً');
  }

  importFromUrl() {
    const url = prompt('أدخل رابط الطبقة (GeoJSON):');
    if (url) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.addGeoJSONLayer(data, 'طبقة من رابط');
        })
        .catch(error => {
          console.error('Error importing from URL:', error);
          alert('خطأ في استيراد الطبقة من الرابط');
        });
    }
  }

  importFromService() {
    alert('ميزة الاستيراد من الخدمات ستتوفر قريباً');
  }

  exportSelected() {
    if (this.selectedLayer) {
      const layer = this.layers.get(this.selectedLayer);
      if (layer) {
        this.downloadLayer(layer, this.selectedLayer, 'geojson');
      }
    } else {
      alert('يرجى تحديد طبقة أولاً');
    }
  }

  changeBaseLayer(layerId) {
    console.log('Changing base layer to:', layerId);

    // Use the existing base layer switching functionality from map.js
    if (window.setBaseLayer) {
      let index = 0;
      switch(layerId) {
        case 'osm':
          index = 0;
          break;
        case 'satellite':
          index = 1;
          break;
        case 'terrain':
          index = 2;
          break;
      }
      window.setBaseLayer(index);
    } else {
      console.warn('Base layer switching function not available');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for map to be initialized
  if (window.map) {
    window.advancedLayerManager = new AdvancedLayerManager(window.map);
  } else {
    // Wait for map initialization
    const checkMap = setInterval(() => {
      if (window.map) {
        window.advancedLayerManager = new AdvancedLayerManager(window.map);
        clearInterval(checkMap);
      }
    }, 100);
  }
});
