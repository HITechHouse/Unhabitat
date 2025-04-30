// Filter functionality
function initializeFilter() {
    const sectorFilterSelect = document.getElementById('sectorFilterSelect');
    const applySectorFilterBtn = document.getElementById('applySectorFilterBtn');
    const filterResults = document.getElementById('filterResults');
    const exportFilteredBtn = document.getElementById('exportFilteredBtn');

    // Populate sector filter select
    if (sectorFilterSelect && neighborhoodsData) {
        const sectors = new Set();
        neighborhoodsData.features.forEach(feature => {
            if (feature.properties.Sector_01) {
                sectors.add(feature.properties.Sector_01);
            }
        });

        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            sectorFilterSelect.appendChild(option);
        });
    }

    // Apply filter
    if (applySectorFilterBtn) {
        applySectorFilterBtn.addEventListener('click', function() {
            const selectedSector = sectorFilterSelect.value;
            const filteredFeatures = neighborhoodsData.features.filter(feature => 
                !selectedSector || feature.properties.Sector_01 === selectedSector
            );

            // Update filter results
            if (filterResults) {
                filterResults.innerHTML = `
                    <div class="result-item">
                        <span class="result-label">عدد الأحياء المصفاة:</span>
                        <span class="result-value">${filteredFeatures.length}</span>
                    </div>
                `;
            }

            // Update map layer
            if (layers.neighborhoods) {
                layers.neighborhoods.setStyle(function(feature) {
                    return {
                        color: !selectedSector || feature.properties.Sector_01 === selectedSector ? 
                            '#1e40af' : '#9ca3af',
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.3
                    };
                });
            }
        });
    }

    // Export filtered data
    if (exportFilteredBtn) {
        exportFilteredBtn.addEventListener('click', function() {
            const selectedSector = sectorFilterSelect.value;
            const filteredFeatures = neighborhoodsData.features.filter(feature => 
                !selectedSector || feature.properties.Sector_01 === selectedSector
            );

            const filteredGeoJSON = {
                type: "FeatureCollection",
                features: filteredFeatures
            };

            const blob = new Blob([JSON.stringify(filteredGeoJSON)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `filtered_neighborhoods_${selectedSector || 'all'}.geojson`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}

// Import/Export functionality
function initializeImportExport() {
    const importLayerBtn = document.getElementById('importLayerBtn');
    const layerFileInput = document.getElementById('layerFileInput');
    const exportLayerBtn = document.getElementById('exportLayerBtn');
    const exportFormat = document.getElementById('exportFormat');

    // File import
    if (importLayerBtn && layerFileInput) {
        importLayerBtn.addEventListener('click', function() {
            layerFileInput.click();
        });

        layerFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.type === 'FeatureCollection') {
                            // Handle imported GeoJSON
                            console.log('Imported GeoJSON:', data);
                            // Add to map or process as needed
                        }
                    } catch (error) {
                        console.error('Error importing file:', error);
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // Layer export
    if (exportLayerBtn && exportFormat) {
        exportLayerBtn.addEventListener('click', function() {
            const selectedFormat = exportFormat.value;

            if (!selectedFormat) {
                alert('الرجاء اختيار صيغة التصدير');
                return;
            }

            let data;
            // Get the currently selected layer data
            if (layers.neighborhoods) {
                data = neighborhoodsData;
            }

            if (data) {
                let blob;
                switch (selectedFormat) {
                    case 'geojson':
                        blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                        break;
                    case 'kml':
                        // Convert to KML
                        break;
                    case 'shp':
                        // Convert to Shapefile
                        break;
                }

                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `exported_data.${selectedFormat}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }
        });
    }
}

// Analysis functionality
function initializeAnalysis() {
    const chartType = document.getElementById('chartType');
    const chartData = document.getElementById('chartData');
    const generateChartBtn = document.getElementById('generateChartBtn');
    const analysisChart = document.getElementById('analysisChart');

    // Advanced analysis buttons
    const densityAnalysisBtn = document.getElementById('densityAnalysisBtn');
    const infrastructureAnalysisBtn = document.getElementById('infrastructureAnalysisBtn');
    const serviceAccessAnalysisBtn = document.getElementById('serviceAccessAnalysisBtn');
    const damageAnalysisBtn = document.getElementById('damageAnalysisBtn');

    // Chart generation
    if (generateChartBtn && analysisChart) {
        generateChartBtn.addEventListener('click', function() {
            const type = chartType.value;
            const dataType = chartData.value;

            if (!type || !dataType) {
                alert('الرجاء اختيار نوع الرسم البياني والبيانات');
                return;
            }

            // Create chart based on selected options
            const ctx = analysisChart.getContext('2d');
            // Add chart creation logic here
        });
    }

    // Advanced analysis buttons
    if (densityAnalysisBtn) {
        densityAnalysisBtn.addEventListener('click', function() {
            // Handle density analysis
            console.log('Density analysis clicked');
        });
    }

    if (infrastructureAnalysisBtn) {
        infrastructureAnalysisBtn.addEventListener('click', function() {
            // Handle infrastructure analysis
            console.log('Infrastructure analysis clicked');
        });
    }

    if (serviceAccessAnalysisBtn) {
        serviceAccessAnalysisBtn.addEventListener('click', function() {
            // Handle service access analysis
            console.log('Service access analysis clicked');
        });
    }

    if (damageAnalysisBtn) {
        damageAnalysisBtn.addEventListener('click', function() {
            // Handle damage analysis
            console.log('Damage analysis clicked');
        });
    }
}

// Query Builder functionality
function initializeQueryBuilder() {
    console.log('Initializing query builder...');
    
    const queryTableSelect = document.getElementById('queryTableSelect');
    const queryFieldSelect = document.getElementById('queryFieldSelect');
    const valueListBtn = document.getElementById('valueListBtn');
    
    console.log('Query builder elements:', {
        queryTableSelect: queryTableSelect,
        queryFieldSelect: queryFieldSelect,
        valueListBtn: valueListBtn
    });

    if (!queryTableSelect || !queryFieldSelect || !valueListBtn) {
        console.error('Required query builder elements not found');
        return;
    }

    // Define fields for each layer
    const layerFields = {
        'neighborhoods': [
            { value: 'ID', label: 'المعرّف' },
            { value: 'Names', label: 'اسم الحي' },
            { value: 'Name_En', label: 'الاسم بالإنجليزية' },
            { value: 'Sector_01', label: 'القطاع' },
            { value: 'Shape_Area', label: 'المساحة' },
            { value: 'Shape_Leng', label: 'المحيط' },
            { value: 'Pop', label: 'عدد السكان' },
            { value: 'damage_level', label: 'مستوى الضرر' },
            { value: 'infrastructure_status', label: 'حالة البنية التحتية' },
            { value: 'services_access', label: 'الوصول للخدمات' }
        ],
        'service-sectors': [
            { value: 'OBJECTID', label: 'المعرّف' },
            { value: 'Name', label: 'اسم دائرة الخدمات' },
            { value: 'Name_En', label: 'الاسم بالإنجليزية' },
            { value: 'Pop', label: 'عدد السكان' },
            { value: 'Shape_Area', label: 'المساحة' },
            { value: 'Shape_Leng', label: 'المحيط' },
            { value: 'waterSupplyHours', label: 'ساعات التغذية المائية' },
            { value: 'waterPressure', label: 'ضغط المياه' },
            { value: 'pumpStations', label: 'عدد محطات الضخ' },
            { value: 'totalSubscribers', label: 'عدد المشتركين' },
            { value: 'collectionRate', label: 'معدل التحصيل' }
        ]
    };

    // Function to populate fields based on selected layer
    function populateFields(selectedLayer) {
        console.log('Populating fields for layer:', selectedLayer);
        queryFieldSelect.innerHTML = '<option value="">اختر الحقل</option>';
        
        const fields = layerFields[selectedLayer];
        if (!fields) {
            console.error('No fields found for layer:', selectedLayer);
            return;
        }

        fields.forEach(field => {
            const option = document.createElement('option');
            option.value = field.value;
            option.textContent = field.label;
            queryFieldSelect.appendChild(option);
        });
        
        console.log('Fields populated:', fields);
    }

    // Event listener for layer selection
    queryTableSelect.addEventListener('change', function() {
        console.log('Layer selection changed:', this.value);
        populateFields(this.value);
    });

    // Event listener for value list button
    valueListBtn.addEventListener('click', function() {
        const selectedLayer = queryTableSelect.value;
        const selectedField = queryFieldSelect.value;
        
        console.log('Value list button clicked:', {
            layer: selectedLayer,
            field: selectedField
        });

        if (!selectedLayer || !selectedField) {
            console.error('Layer or field not selected');
            return;
        }

        showValueList(selectedLayer, selectedField);
    });

    // Trigger initial population if a layer is selected
    if (queryTableSelect.value) {
        console.log('Initial layer selected:', queryTableSelect.value);
        populateFields(queryTableSelect.value);
    }
}

// Function to show value list
function showValueList(layer, field) {
    console.log('Showing value list for:', { layer, field });
    
    // Remove any existing dialogs
    const existingDialogs = document.querySelectorAll('.value-selector-dialog');
    existingDialogs.forEach(dialog => dialog.remove());
    
    // Get field label for header
    let fieldLabel = field;
    const layerFields = {
        'neighborhoods': [
            { value: 'ID', label: 'المعرّف' },
            { value: 'Names', label: 'اسم الحي' },
            { value: 'Name_En', label: 'الاسم بالإنجليزية' },
            { value: 'Sector_01', label: 'القطاع' },
            { value: 'Shape_Area', label: 'المساحة' },
            { value: 'Shape_Leng', label: 'المحيط' },
            { value: 'Pop', label: 'عدد السكان' },
            { value: 'damage_level', label: 'مستوى الضرر' },
            { value: 'infrastructure_status', label: 'حالة البنية التحتية' },
            { value: 'services_access', label: 'الوصول للخدمات' }
        ],
        'service-sectors': [
            { value: 'OBJECTID', label: 'المعرّف' },
            { value: 'Name', label: 'اسم دائرة الخدمات' },
            { value: 'Name_En', label: 'الاسم بالإنجليزية' },
            { value: 'Pop', label: 'عدد السكان' },
            { value: 'Shape_Area', label: 'المساحة' },
            { value: 'Shape_Leng', label: 'المحيط' },
            { value: 'waterSupplyHours', label: 'ساعات التغذية المائية' },
            { value: 'waterPressure', label: 'ضغط المياه' },
            { value: 'pumpStations', label: 'عدد محطات الضخ' },
            { value: 'totalSubscribers', label: 'عدد المشتركين' },
            { value: 'collectionRate', label: 'معدل التحصيل' }
        ]
    };
    const fields = layerFields[layer];
    if (fields) {
        const found = fields.find(f => f.value === field);
        if (found) fieldLabel = found.label;
    }

    // Create new dialog
    const dialog = document.createElement('div');
    dialog.className = 'value-selector-dialog';
    dialog.innerHTML = `
        <div class="value-selector-content">
            <div class="value-selector-header">
                <h3>اختر قيمة للحقل: ${fieldLabel}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="value-selector-search">
                <input type="text" class="search-input" placeholder="ابحث عن قيمة...">
            </div>
            <div class="value-selector-container"></div>
            <div class="value-selector-footer">
                <button class="cancel-btn">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    // Get data based on layer
    const data = layer === 'neighborhoods' ? neighborhoodsData : serviceSectorsData;
    console.log('Data for value list:', data);

    if (!data || !data.features) {
        console.error('No data found for layer:', layer);
        return;
    }

    // Get unique values for the selected field
    const values = [...new Set(data.features.map(feature => feature.properties[field]))];
    console.log('Unique values found:', values);

    // Populate values
    const container = dialog.querySelector('.value-selector-container');
    container.innerHTML = '';
    
    values.forEach(value => {
        if (value !== undefined && value !== null) {
            const item = document.createElement('div');
            item.className = 'value-item';
            item.innerHTML = `
                <span class="value-text">${value}</span>
                <i class="fas fa-check"></i>
            `;
            // Add click event to select value and close dialog
            item.addEventListener('click', function() {
                const valueInput = document.getElementById('queryValueInput');
                if (valueInput) valueInput.value = value;
                dialog.remove();
            });
            container.appendChild(item);
        }
    });

    // Add search functionality
    const searchInput = dialog.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const items = container.querySelectorAll('.value-item');
        
        items.forEach(item => {
            const text = item.querySelector('.value-text').textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Show dialog
    dialog.style.display = 'flex';

    // Close dialog when clicking outside, on close button, or cancel button
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog || e.target.classList.contains('close-btn') || e.target.classList.contains('cancel-btn')) {
            dialog.remove();
        }
    });
}

// Initialize all features when document is loaded
function initializeAllFeatures() {
    console.log('Initializing all features...');
    try {
        initializeFilter();
        initializeImportExport();
        initializeAnalysis();
        initializeQueryBuilder();
        console.log('All features initialized successfully');
    } catch (error) {
        console.error('Error initializing features:', error);
    }
}

// Wait for both DOM and all resources to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFeatures);
} else {
    initializeAllFeatures();
} 