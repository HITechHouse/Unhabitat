/**
 * Buffer Analysis Module
 * تحليل النطاق - Buffer Analysis
 * 
 * يوفر وظائف لإنشاء منطقة نطاق دائرية وتحليل تقاطعها مع الأحياء
 */

(function() {
    'use strict';

    // متغيرات لحفظ حالة التحليل
    let analysisCenter = null;
    let analysisRadius = 1;
    let bufferCircle = null;
    let isSelectingCenter = false;

    /**
     * تهيئة وظائف تحليل النطاق
     */
    function initBufferAnalysis() {
        // التأكد من وجود الخريطة
        if (!window.map) {
            console.error('الخريطة غير متوفرة');
            return;
        }

        // التأكد من وجود Turf.js
        if (typeof turf === 'undefined') {
            console.error('مكتبة Turf.js غير متوفرة');
            return;
        }

        // ربط الأحداث
        bindEvents();
        
        // تحديث النصوص حسب اللغة الحالية
        updateLanguage();
    }

    /**
     * تحديث النصوص حسب اللغة الحالية
     */
    function updateLanguage() {
        const currentLang = document.documentElement.lang || 'ar';
        const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;
        
        if (!t) return;

        // تحديث العناوين
        const spatialAnalysisTitle = document.getElementById('spatial-analysis-title');
        if (spatialAnalysisTitle) spatialAnalysisTitle.textContent = t.sectionTitle;

        const bufferAnalysisTitle = document.getElementById('buffer-analysis-title');
        if (bufferAnalysisTitle) bufferAnalysisTitle.textContent = t.title;

        // تحديث التسميات
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
     * ربط الأحداث بالعناصر
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

        // إغلاق النافذة المنبثقة عند النقر خارجها
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
    }

    /**
     * بدء عملية تحديد المركز
     */
    function startCenterSelection() {
        if (!window.map) return;

        isSelectingCenter = true;
        
        // تغيير شكل المؤشر
        document.getElementById('map').style.cursor = 'crosshair';
        
        // تحديث نص الزر
        const selectBtn = document.getElementById('select-center-btn');
        const currentLang = document.documentElement.lang || 'ar';
        const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;
        
        if (selectBtn && t) {
            selectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>' + t.selectingCenterBtn + '</span>';
            selectBtn.style.background = '#ffc107';
            selectBtn.disabled = true;
        }

        // إضافة مستمع النقر على الخريطة لمرة واحدة
        window.map.once('click', onMapClick);
    }

    /**
     * معالج النقر على الخريطة
     */
    function onMapClick(e) {
        if (!isSelectingCenter) return;

        // حفظ موقع المركز
        analysisCenter = e.latlng;
        
        // الحصول على نصف القطر
        const radiusInput = document.getElementById('buffer-radius-km');
        analysisRadius = parseFloat(radiusInput.value) || 1;

        // إزالة الدائرة القديمة إن وجدت
        if (bufferCircle) {
            window.map.removeLayer(bufferCircle);
        }

        // رسم الدائرة الجديدة
        bufferCircle = L.circle(analysisCenter, {
            radius: analysisRadius * 1000, // تحويل من كيلومتر إلى متر
            color: '#dc3545',
            fillColor: '#dc3545',
            fillOpacity: 0.2,
            weight: 3
        }).addTo(window.map);

        // إعادة تعيين حالة التحديد
        isSelectingCenter = false;
        document.getElementById('map').style.cursor = '';

        // تحديث الأزرار
        updateButtons(true);

        // تكبير الخريطة لتظهر الدائرة
        window.map.fitBounds(bufferCircle.getBounds(), { padding: [20, 20] });
    }

    /**
     * تحديث حالة الأزرار
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
     * تشغيل تحليل النطاق
     */
    function runBufferAnalysis() {
        if (!analysisCenter || !window.map) {
            const currentLang = document.documentElement.lang || 'ar';
            const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;
            showError(t ? t.selectCenterFirst : 'يرجى تحديد المركز أولاً');
            return;
        }

        // التأكد من وجود طبقة الأحياء
        if (!window.neighborhoodsLayer) {
            const currentLang = document.documentElement.lang || 'ar';
            const t = window.translations && window.translations[currentLang] && window.translations[currentLang].bufferAnalysis;
            showError(t ? t.layerNotAvailable : 'طبقة الأحياء غير متوفرة');
            return;
        }

        // إعادة تعيين أنماط الأحياء
        resetNeighborhoodStyles();

        // إنشاء الدائرة باستخدام Turf.js
        const center = turf.point([analysisCenter.lng, analysisCenter.lat]);
        const bufferPolygon = turf.buffer(center, analysisRadius, { units: 'kilometers' });

        // قائمة الأحياء المتقاطعة
        const intersectingNeighborhoods = [];

        console.log('بدء تحليل النطاق:', {
            center: [analysisCenter.lng, analysisCenter.lat],
            radius: analysisRadius,
            layerExists: !!window.neighborhoodsLayer
        });

        // فحص كل حي
        window.neighborhoodsLayer.eachLayer(function(layer) {
            if (layer.feature && layer.feature.geometry) {
                try {
                    // تحويل طبقة الحي إلى GeoJSON
                    const neighborhoodGeoJSON = layer.feature;
                    
                    // فحص التقاطع
                    let intersection = null;
                    
                    try {
                        intersection = turf.intersect(bufferPolygon, neighborhoodGeoJSON);
                    } catch (intersectError) {
                        // في حالة فشل turf.intersect، نجرب طريقة بديلة
                        console.warn('فشل في turf.intersect، جاري المحاولة بطريقة بديلة');
                        try {
                            // نفحص إذا كان مركز المضلع داخل الدائرة
                            const centroid = turf.centroid(neighborhoodGeoJSON);
                            const distance = turf.distance(center, centroid, { units: 'kilometers' });
                            if (distance <= analysisRadius) {
                                intersection = centroid; // أي قيمة غير null
                            }
                        } catch (centroidError) {
                            console.error('فشل في التحقق البديل أيضاً:', centroidError);
                        }
                    }
                    
                    if (intersection) {
                        // تغيير لون الحي المتقاطع
                        layer.setStyle({
                            fillColor: '#dc3545',
                            fillOpacity: 0.6,
                            color: '#dc3545',
                            weight: 3
                        });

                        // إضافة اسم الحي إلى القائمة
                        const neighborhoodName = layer.feature.properties.Names || 
                                               layer.feature.properties.Name_En || 
                                               layer.feature.properties.name || 
                                               layer.feature.properties.Name || 
                                               layer.feature.properties.NAME || 
                                               'حي غير محدد';
                        
                        // طباعة معلومات التشخيص
                        console.log('تم العثور على حي متقاطع:', {
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

        // إزالة الدائرة من الخريطة بعد التحليل
        if (bufferCircle) {
            window.map.removeLayer(bufferCircle);
            bufferCircle = null;
        }

        // إعادة تعيين حالة المركز للسماح بتحليل جديد
        analysisCenter = null;
        
        // تحديث الأزرار لحالة جديدة
        updateButtons(false);

        // عرض التقرير
        showReport(intersectingNeighborhoods);
    }

    /**
     * إعادة تعيين أنماط الأحياء إلى الحالة الافتراضية
     */
    function resetNeighborhoodStyles() {
        if (!window.neighborhoodsLayer) return;

        window.neighborhoodsLayer.eachLayer(function(layer) {
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
     * عرض تقرير النتائج
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
        
        // إظهار النافذة المنبثقة
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal-visible');
    }

    /**
     * إغلاق النافذة المنبثقة
     */
    function closeModal() {
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.classList.remove('modal-visible');
            modal.classList.add('modal-hidden');
        }

        // إعادة تعيين ألوان الأحياء إلى الحالة الافتراضية عند إغلاق النافذة
        resetNeighborhoodStyles();
    }

    /**
     * عرض رسالة خطأ
     */
    function showError(message) {
        alert(message);
    }

    // تهيئة الوحدة عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        // انتظار تحميل الخريطة
        const checkMapReady = setInterval(function() {
            if (window.map && typeof window.map.on === 'function') {
                clearInterval(checkMapReady);
                initBufferAnalysis();
            }
        }, 100);
    });

    /**
     * بدء تحليل جديد
     */
    function startNewAnalysis() {
        // إغلاق النافذة المنبثقة
        closeModal();
        
        // إعادة تعيين جميع المتغيرات
        analysisCenter = null;
        analysisRadius = 1;
        
        // إعادة تعيين قيمة نصف القطر في الحقل
        const radiusInput = document.getElementById('buffer-radius-km');
        if (radiusInput) {
            radiusInput.value = 1;
        }
        
        // تحديث الأزرار
        updateButtons(false);
        
        // إزالة أي دوائر موجودة
        if (bufferCircle) {
            window.map.removeLayer(bufferCircle);
            bufferCircle = null;
        }
        
        // إعادة تعيين ألوان الأحياء
        resetNeighborhoodStyles();
    }

    // الاستماع لتغيير اللغة
    document.addEventListener('languageChanged', function(e) {
        updateLanguage();
    });

    // تصدير الوظائف للاستخدام العام
    window.BufferAnalysis = {
        init: initBufferAnalysis,
        startCenterSelection: startCenterSelection,
        runAnalysis: runBufferAnalysis,
        closeModal: closeModal,
        startNewAnalysis: startNewAnalysis,
        updateLanguage: updateLanguage
    };

})(); 