/**
 * Buffer Analysis Module
 * Buffer Analysis
 * 
 * Provides functions to create a circular buffer area and analyze its intersection with neighborhoods
 */

(function () {
    'use strict';

    // variables to save the analysis state
    let analysisCenter = null;
    let analysisRadius = 1;
    let bufferCircle = null;
    let isSelectingCenter = false;

    /**
     * initialize the buffer analysis functions
     */
    function initBufferAnalysis() {
        // check if the map is available
        if (!window.map) {
            console.error('الخريطة غير متوفرة');
            return;
        }

        // check if Turf.js is available
        if (typeof turf === 'undefined') {
            console.error('مكتبة Turf.js غير متوفرة');
            return;
        }

        // bind the events
        bindEvents();

        // update the text according to the current language
        updateLanguage();
    }

    /**
     * update the text according to the current language
     */
    function updateLanguage() {
        const currentLang = document.documentElement.lang || 'ar';
        const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;

        if (!t) return;

        // update the titles
        const spatialAnalysisTitle = document.getElementById('spatial-analysis-title');
        if (spatialAnalysisTitle) spatialAnalysisTitle.textContent = t.sectionTitle;

        const bufferAnalysisTitle = document.getElementById('buffer-analysis-title');
        if (bufferAnalysisTitle) bufferAnalysisTitle.textContent = t.title;

        // update the labels
        const radiusLabel = document.getElementById('buffer-radius-label');
        if (radiusLabel) radiusLabel.textContent = t.radiusLabel;

        const selectCenterBtnText = document.getElementById('select-center-btn-text');
        if (selectCenterBtnText) selectCenterBtnText.textContent = t.selectCenterBtn;

        const runAnalysisBtnText = document.getElementById('run-analysis-btn-text');
        if (runAnalysisBtnText) runAnalysisBtnText.textContent = t.runAnalysisBtn;

        const reportModalTitle = document.getElementById('report-modal-title');
        if (reportModalTitle) reportModalTitle.textContent = t.reportTitle;
    }

    /**
     * bind the events to the elements
     */
    function bindEvents() {
        const selectCenterBtn = document.getElementById('select-center-btn');
        const runAnalysisBtn = document.getElementById('run-analysis-btn');
        const closeButton = document.querySelector('.close-button');

        if (selectCenterBtn) {
            selectCenterBtn.addEventListener('click', startCenterSelection);
        }

        if (runAnalysisBtn) {
            runAnalysisBtn.addEventListener('click', runBufferAnalysis);
        }

        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }

        // close the modal when clicking outside it
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
    }

    /**
     * start the center selection process
     */
    function startCenterSelection() {
        if (!window.map) return;

        isSelectingCenter = true;

        // change the cursor shape
        document.getElementById('map').style.cursor = 'crosshair';

        // update the button text
        const selectBtn = document.getElementById('select-center-btn');
        const currentLang = document.documentElement.lang || 'ar';
        const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;

        if (selectBtn && t) {
            selectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>' + t.selectingCenterBtn + '</span>';
            selectBtn.style.background = '#ffc107';
            selectBtn.disabled = true;
        }

        // add a one-time click listener to the map
        window.map.once('click', onMapClick);
    }

    /**
     * handle the map click
     */
    function onMapClick(e) {
        if (!isSelectingCenter) return;

        // save the center location
        analysisCenter = e.latlng;

        // get the radius
        const radiusInput = document.getElementById('buffer-radius-km');
        analysisRadius = parseFloat(radiusInput.value) || 1;

        // remove the old circle if it exists
        if (bufferCircle) {
            window.map.removeLayer(bufferCircle);
        }

        // draw the new circle
        bufferCircle = L.circle(analysisCenter, {
            radius: analysisRadius * 1000, // convert from kilometers to meters
            color: '#dc3545',
            fillColor: '#dc3545',
            fillOpacity: 0.2,
            weight: 3
        }).addTo(window.map);

        // reset the selection state
        isSelectingCenter = false;
        document.getElementById('map').style.cursor = '';

        // update the buttons
        updateButtons(true);

        // zoom the map to show the circle
        window.map.fitBounds(bufferCircle.getBounds(), { padding: [20, 20] });
    }

    /**
     * update the buttons state
     */
    function updateButtons(centerSelected) {
        const selectBtn = document.getElementById('select-center-btn');
        const runBtn = document.getElementById('run-analysis-btn');
        const currentLang = document.documentElement.lang || 'ar';
        const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;

        if (!t) return;

        if (selectBtn) {
            if (centerSelected) {
                selectBtn.innerHTML = '<i class="fas fa-check"></i> <span>' + t.centerSelectedBtn + '</span>';
                selectBtn.style.background = '#28a745';
                selectBtn.disabled = false;
            } else {
                selectBtn.innerHTML = '<i class="fas fa-crosshairs"></i> <span>' + t.selectCenterBtn + '</span>';
                selectBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                selectBtn.disabled = false;
            }
        }

        if (runBtn) {
            const runBtnText = runBtn.querySelector('span') || runBtn;
            if (centerSelected) {
                runBtn.disabled = false;
                runBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                runBtn.style.cursor = 'pointer';
                runBtn.style.opacity = '1';
                runBtnText.textContent = t.runAnalysisBtn;
            } else {
                runBtn.disabled = true;
                runBtn.style.background = '#6c757d';
                runBtn.style.cursor = 'not-allowed';
                runBtn.style.opacity = '0.6';
                runBtnText.textContent = t.runAnalysisBtn;
            }
        }
    }

    /**
     * run the buffer analysis
     */
    function runBufferAnalysis() {
        if (!analysisCenter || !window.map) {
            const currentLang = document.documentElement.lang || 'ar';
            const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;
            showError(t ? t.selectCenterFirst : 'يرجى تحديد المركز أولاً');
            return;
        }

        // check if the neighborhoods layer is available
        if (!window.neighborhoodsLayer) {
            const currentLang = document.documentElement.lang || 'ar';
            const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;
            showError(t ? t.layerNotAvailable : 'طبقة الأحياء غير متوفرة');
            return;
        }

        // reset the neighborhoods styles
        resetNeighborhoodStyles();

        // create the circle using Turf.js
        const center = turf.point([analysisCenter.lng, analysisCenter.lat]);
        const bufferPolygon = turf.buffer(center, analysisRadius, { units: 'kilometers' });

        // list of intersecting neighborhoods
        const intersectingNeighborhoods = [];

        console.log('بدء تحليل النطاق:', {
            center: [analysisCenter.lng, analysisCenter.lat],
            radius: analysisRadius,
            layerExists: !!window.neighborhoodsLayer
        });

        // check each neighborhood
        window.neighborhoodsLayer.eachLayer(function (layer) {
            if (layer.feature && layer.feature.geometry) {
                try {
                    // convert the layer to GeoJSON
                    const neighborhoodGeoJSON = layer.feature;

                    // check the intersection
                    let intersection = null;

                    try {
                        intersection = turf.intersect(bufferPolygon, neighborhoodGeoJSON);
                    } catch (intersectError) {
                        // if turf.intersect fails, try an alternative method
                        console.warn('turf.intersect failed, trying an alternative method');
                        try {
                            // check if the centroid of the polygon is inside the circle
                            const centroid = turf.centroid(neighborhoodGeoJSON);
                            const distance = turf.distance(center, centroid, { units: 'kilometers' });
                            if (distance <= analysisRadius) {
                                intersection = centroid; // any value other than null
                            }
                        } catch (centroidError) {
                            console.error('alternative check also failed:', centroidError);
                        }
                    }

                    if (intersection) {
                        // change the color of the intersecting neighborhood
                        layer.setStyle({
                            fillColor: '#dc3545',
                            fillOpacity: 0.6,
                            color: '#dc3545',
                            weight: 3
                        });

                        // add the neighborhood name to the list
                        const neighborhoodName = layer.feature.properties.Names ||
                            layer.feature.properties.Name_En ||
                            layer.feature.properties.name ||
                            layer.feature.properties.Name ||
                            layer.feature.properties.NAME ||
                            'حي غير محدد';

                        // print diagnostic information
                        console.log('intersecting neighborhood found:', {
                            name: neighborhoodName,
                            properties: layer.feature.properties
                        });

                        intersectingNeighborhoods.push(neighborhoodName);
                    }
                } catch (error) {
                    console.error('خطأ في فحص التقاطع:', error);
                    console.error('خصائص الحي:', layer.feature.properties);
                }
            }
        });

        console.log('انتهاء التحليل:', {
            foundNeighborhoods: intersectingNeighborhoods.length,
            neighborhoods: intersectingNeighborhoods
        });

        // remove the circle from the map after the analysis
        if (bufferCircle) {
            window.map.removeLayer(bufferCircle);
            bufferCircle = null;
        }

        // reset the center state to allow new analysis
        analysisCenter = null;

        // update the buttons for new state
        updateButtons(false);

        // show the report
        showReport(intersectingNeighborhoods);
    }

    /**
     * reset the neighborhoods styles to the default state
     */
    function resetNeighborhoodStyles() {
        if (!window.neighborhoodsLayer) return;

        window.neighborhoodsLayer.eachLayer(function (layer) {
            if (layer.setStyle) {
                layer.setStyle({
                    fillColor: '#3388ff',
                    fillOpacity: 0.2,
                    color: '#3388ff',
                    weight: 2
                });
            }
        });
    }

    /**
     * show the report
     */
    function showReport(neighborhoods) {
        const modal = document.getElementById('report-modal');
        const resultsDiv = document.getElementById('report-results');

        if (!modal || !resultsDiv) return;

        const currentLang = document.documentElement.lang || 'ar';
        const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;

        if (!t) return;

        let content = '';

        if (neighborhoods.length === 0) {
            content = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-info-circle" style="font-size: 48px; color: #17a2b8; margin-bottom: 15px;"></i>
                    <h5 style="color: #495057; margin-bottom: 10px;">${t.noNeighborhoodsFound}</h5>
                    <p style="color: #6c757d; font-size: 14px;">
                        ${t.radiusInfo}: <strong>${analysisRadius} ${t.kilometer}</strong><br>
                        ${t.tryDifferent}
                    </p>
                </div>
            `;
        } else {
            content = `
                <div style="margin-bottom: 20px;">
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h5 style="color: #155724; margin-bottom: 8px;">
                            <i class="fas fa-check-circle" style="margin-left: 5px;"></i>
                            ${t.analysisSummary}
                        </h5>
                        <div style="display: flex; justify-content: space-between; font-size: 14px;">
                            <span><strong>${t.radius}:</strong> ${analysisRadius} ${t.kilometer}</span>
                            <span><strong>${t.neighborhoodsCount}:</strong> ${neighborhoods.length}</span>
                        </div>
                    </div>
                    
                    <h5 style="color: #495057; margin-bottom: 15px;">
                        <i class="fas fa-list" style="margin-left: 5px;"></i>
                        ${t.intersectingNeighborhoods}
                    </h5>
                    <ul style="list-style: none; padding: 0; margin: 0;">
            `;

            neighborhoods.forEach((neighborhood, index) => {
                content += `
                    <li style="
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        transition: background-color 0.3s ease;
                    " onmouseover="this.style.backgroundColor='#e9ecef';" onmouseout="this.style.backgroundColor='#f8f9fa';">
                        <span style="
                            background: #dc3545;
                            color: white;
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            font-weight: bold;
                            margin-left: 10px;
                        ">${index + 1}</span>
                        <span style="font-weight: 500;">${neighborhood}</span>
                    </li>
                `;
            });

            content += `
                    </ul>
                    
                    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                        <button onclick="BufferAnalysis.startNewAnalysis()" style="
                            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            padding: 10px 20px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 2px 4px rgba(23, 162, 184, 0.3);
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(23,162,184,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(23,162,184,0.3)';">
                            <i class="fas fa-plus"></i> ${t.newAnalysisBtn}
                        </button>
                    </div>
                </div>
            `;
        }

        resultsDiv.innerHTML = content;

        // show the modal
        modal.style.display = 'block';
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
    }

    /**
     * close the modal
     */
    function closeModal() {
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('modal-visible');
            modal.classList.add('modal-hidden');
        }

        // reset the neighborhoods styles when the modal is closed
        resetNeighborhoodStyles();
    }

    /**
     * show an error message
     */
    function showError(message) {
        alert(message || 'حدث خطأ في التحليل');
    }

    // initialize the module when the page is loaded
    document.addEventListener('DOMContentLoaded', function () {
        // wait for the map to be ready
        const checkMapReady = setInterval(function () {
            if (window.map && typeof window.map.on === 'function') {
                clearInterval(checkMapReady);
                initBufferAnalysis();
            }
        }, 100);
    });

    /**
     * start a new analysis
     */
    function startNewAnalysis() {
        // close the modal
        closeModal();

        // reset all variables
        analysisCenter = null;
        analysisRadius = 1;

        // reset the radius value in the field
        const radiusInput = document.getElementById('buffer-radius-km');
        if (radiusInput) {
            radiusInput.value = 1;
        }

        // update the buttons
        updateButtons(false);

        // remove any existing circles
        if (bufferCircle) {
            window.map.removeLayer(bufferCircle);
            bufferCircle = null;
        }

        // reset the neighborhoods styles
        resetNeighborhoodStyles();
    }

    // listen for language changes
    document.addEventListener('languageChanged', function (e) {
        updateLanguage();
    });

    // export the functions for global use
    window.BufferAnalysis = {
        init: initBufferAnalysis,
        startCenterSelection: startCenterSelection,
        runAnalysis: runBufferAnalysis,
        closeModal: closeModal,
        startNewAnalysis: startNewAnalysis,
        updateLanguage: updateLanguage
    };

})(); 