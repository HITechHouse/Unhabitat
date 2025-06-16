/**
 * Export Report PDF Module
 * Responsible for generating PDF reports for selected neighborhoods
 * Author: Extracted from maps/js/map.js
 */

/**
 * Show export options menu for neighborhood
 * @param {string} neighborhoodId - ID of the neighborhood
 * @param {string} neighborhoodName - Name of the neighborhood
 * @param {HTMLElement} triggerElement - Element that triggered the menu
 */
function showExportOptionsMenu(neighborhoodId, neighborhoodName, triggerElement) {
  // Remove any existing export menu
  const existingMenu = document.getElementById('export-options-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // Create export options menu
  const menu = document.createElement('div');
  menu.id = 'export-options-menu';
  menu.className = 'export-options-menu';
  menu.innerHTML = `
    <div class="export-menu-header">
      <h4> تصدير التقرير</h4>
      <span class="neighborhood-name">${neighborhoodName}</span>
    </div>
    <div class="export-menu-actions">
      <button id="cancel-export" class="btn-cancel">إلغاء</button>
      <button id="confirm-export" class="btn-confirm">تصدير PDF</button>
    </div>
  `;

  // Add CSS styles for the menu
  const style = document.createElement('style');
  style.textContent = `
    .export-options-menu {
      position: fixed;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 300px;
      font-family: 'Cairo', sans-serif;
      direction: rtl;
    }
    
    .export-menu-header {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 15px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    
    .export-menu-header h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .neighborhood-name {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .export-menu-content {
      padding: 20px;
    }
    
    .export-option {
      margin-bottom: 15px;
    }
    
    .export-option label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #333;
    }
    
    .export-option input[type="checkbox"] {
      margin-left: 10px;
      transform: scale(1.2);
    }
    
    .export-menu-actions {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    
    .btn-cancel, .btn-confirm {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    
    .btn-cancel {
      background: #6c757d;
      color: white;
    }
    
    .btn-cancel:hover {
      background: #5a6268;
    }
    
    .btn-confirm {
      background: #007bff;
      color: white;
    }
    
    .btn-confirm:hover {
      background: #0056b3;
    }
  `;
  
  if (!document.querySelector('style[data-export-menu]')) {
    style.setAttribute('data-export-menu', 'true');
    document.head.appendChild(style);
  }

  // Position menu near the trigger element
  document.body.appendChild(menu);

  // Get trigger element position
  const rect = triggerElement.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  // Position menu to the right of trigger element, or left if not enough space
  let left = rect.right + 10;
  if (left + menuRect.width > window.innerWidth) {
    left = rect.left - menuRect.width - 10;
  }

  let top = rect.top;
  if (top + menuRect.height > window.innerHeight) {
    top = window.innerHeight - menuRect.height - 10;
  }

  menu.style.left = left + 'px';
  menu.style.top = top + 'px';

  // Add event listeners
  document.getElementById('cancel-export').addEventListener('click', function() {
    menu.remove();
  });

  document.getElementById('confirm-export').addEventListener('click', function() {
    generateNeighborhoodReport(neighborhoodId, neighborhoodName);
    menu.remove();
  });

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !triggerElement.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

/**
 * Generate neighborhood report with selected options
 * @param {string} neighborhoodId - ID of the neighborhood
 * @param {string} neighborhoodName - Name of the neighborhood
 */
async function generateNeighborhoodReport(neighborhoodId, neighborhoodName) {
  try {
    // Show loading notification
    if (typeof showNotification === 'function') {
      showNotification('جاري إنشاء التقرير الشامل...', 'info');
    }

    // Find neighborhood data
    const neighborhoodFeature = neighborhoodsData.features.find(
      feature => feature.properties.ID.toString() === neighborhoodId.toString()
    );

    if (!neighborhoodFeature) {
      if (typeof showNotification === 'function') {
        showNotification('لم يتم العثور على بيانات الحي المحدد', 'error');
      }
      return;
    }

    // Get real data from the interface
    console.log('جاري جمع البيانات الفعلية للحي:', neighborhoodName);
    
    // 1. Get real neighborhood information
    const neighborhoodInfo = getNeighborhoodDetailedInfo(neighborhoodFeature);
    console.log('معلومات الحي:', neighborhoodInfo);
    
    // 2. Get real sectoral functions data from calculator
    const sectoralFunctionsData = getSectoralFunctionsData(neighborhoodName);
    console.log('بيانات الوظائف القطاعية:', sectoralFunctionsData);
    
    // 3. Get real damage ratios data
    const damageRatiosData = getRealDamageRatiosData(neighborhoodId);
    console.log('بيانات نسب الأضرار:', damageRatiosData);
    
    // 4. Capture current map view for the neighborhood
    const mapImageData = await captureNeighborhoodMap(neighborhoodFeature);
    console.log('صورة الخريطة:', mapImageData ? 'تم التقاطها بنجاح' : 'فشل في التقاط الصورة');

    // Create temporary container for PDF generation
    const reportContainer = document.createElement('div');
    reportContainer.id = 'pdf-report-container-' + Date.now();
    document.body.appendChild(reportContainer);

    // Generate comprehensive report HTML content with real data
    const reportHtml = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: "Cairo", sans-serif; 
          direction: rtl; 
          background: white;
          color: #333;
          line-height: 1.6;
        }
        
        .report-page { 
          width: 100%; 
          max-width: 800px;
          min-height: 1000px; 
          padding: 30px; 
          margin: 0 auto; 
          background: white;
          color: #333;
          font-family: "Cairo", sans-serif;
          direction: rtl;
        }
        
        h1, h2, h3 {
          color: #2196F3;
          margin: 15px 0 10px 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 12pt;
        }
        
        table td, table th {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: right;
          vertical-align: top;
        }
        
        table th {
          background: #f0f8ff;
          font-weight: bold;
          color: #1565c0;
        }
        
        table tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .section {
          margin: 25px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fafafa;
        }
        
        .map-container {
          width: 100%;
          height: 300px;
          border: 2px solid #2196F3;
          border-radius: 8px;
          overflow: hidden;
          margin: 15px 0;
          background: #f0f8ff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .map-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .damage-indicator {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          display: inline-block;
        }
        
        .damage-high { background: #F44336; }
        .damage-medium { background: #FF9800; }
        .damage-low { background: #4CAF50; }
        .damage-unknown { background: #6c757d; }
        
        .coordinates-box {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.9);
          padding: 8px;
          border-radius: 4px;
          font-size: 10pt;
          border: 1px solid #ddd;
        }
        
        .status-excellent { color: #4CAF50; font-weight: bold; }
        .status-good { color: #2196F3; font-weight: bold; }
        .status-acceptable { color: #FF9800; font-weight: bold; }
        .status-poor { color: #F44336; font-weight: bold; }
      </style>

      <div class="report-page">
        <div class="report-header" style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2196F3; padding-bottom: 20px;">
          <div class="report-title" style="color: #2196F3; font-size: 24pt; font-weight: bold; margin-bottom: 10px;">تقرير شامل للحي</div>
          <div class="report-subtitle" style="color: #666; font-size: 18pt; margin-bottom: 10px;">${convertToEnglishNumbers(neighborhoodName)}</div>
          <div class="report-date" style="color: #888; font-size: 11pt;">تاريخ الإنشاء: ${convertToEnglishNumbers(new Date().toLocaleDateString('en-US'))}</div>
          <div class="report-date" style="color: #888; font-size: 11pt;">رقم التقرير: ${convertToEnglishNumbers(neighborhoodId)}-${convertToEnglishNumbers(Date.now().toString().slice(-6))}</div>
        </div>

        <!-- Map Section -->
        <div class="section">
          <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px;">🗺️ خريطة الحي</h2>
          <div class="map-container">
            ${mapImageData ? `
              <img src="${mapImageData}" class="map-image" alt="خريطة ${neighborhoodName}">
              <div class="coordinates-box">
                <strong>الإحداثيات:</strong><br>
                خط الطول: ${convertToEnglishNumbers(neighborhoodFeature.geometry.coordinates[0][0][0].toFixed(6))}<br>
                خط العرض: ${convertToEnglishNumbers(neighborhoodFeature.geometry.coordinates[0][0][1].toFixed(6))}
              </div>
            ` : `
              <div style="text-align: center; color: #666;">
                <div style="font-size: 48px; margin-bottom: 10px;">📍</div>
                <div style="font-size: 16pt; font-weight: bold;">خريطة ${neighborhoodName}</div>
                <div style="font-size: 12pt; margin-top: 10px; color: #F44336;">لم يتم التمكن من تحميل صورة الخريطة</div>
                <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; font-size: 10pt; border: 1px solid #ddd;">
                  <strong>الإحداثيات:</strong><br>
                  خط الطول: ${convertToEnglishNumbers(neighborhoodFeature.geometry.coordinates[0][0][0].toFixed(6))}<br>
                  خط العرض: ${convertToEnglishNumbers(neighborhoodFeature.geometry.coordinates[0][0][1].toFixed(6))}
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Neighborhood Info Section -->
        <div class="section" style="margin-bottom: 200px;">
          <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px;">🏘️ معلومات الحي التفصيلية</h2>
          ${neighborhoodInfo.length > 0 ? `
            <table>
              <tr>
                <th style="width: 30%;">البيان</th>
                <th style="width: 70%;">القيمة</th>
              </tr>
              ${neighborhoodInfo.map(info => `
                <tr>
                  <td style="font-weight: bold;">${info.label}</td>
                  <td>${info.value}</td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; color: #856404;">
              <strong>لا توجد معلومات تفصيلية متاحة لهذا الحي</strong><br>
              <small>البيانات الأساسية: معرف الحي ${convertToEnglishNumbers(neighborhoodId)}</small>
            </div>
          `}
        </div>


        <!-- Sectoral Functions Section -->
        <div class="section" style="margin-bottom: 300px;">
          <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px;">🏢 الوظائف القطاعية الحضرية</h2>
          ${sectoralFunctionsData.length > 0 ? `
            <table>
              <tr>
                <th style="width: 40%;">نوع الوظيفة القطاعية</th>
                <th style="width: 20%;">النسبة المئوية</th>
                <th style="width: 20%;">الحالة</th>
                <th style="width: 20%;">التقييم</th>
              </tr>
              ${sectoralFunctionsData.map(sector => `
                <tr>
                  <td style="font-weight: bold;">${convertToEnglishNumbers(sector.name)}</td>
                  <td style="text-align: center; font-weight: bold; color: ${getSectorColor(sector.percentage)};">${convertToEnglishNumbers(sector.percentage.toFixed(1))}%</td>
                  <td style="text-align: center;" class="${getStatusClass(sector.status)}">${convertToEnglishNumbers(sector.status)}</td>
                  <td style="text-align: center;">${convertToEnglishNumbers(sector.assessment)}</td>
                </tr>
              `).join('')}
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border: 1px solid #4CAF50; border-radius: 5px;">
              <strong style="color: #2e7d32;">ملخص الوظائف القطاعية:</strong><br>
              <div style="margin-top: 10px;">
                <div>• عدد الوظائف المقيمة: <strong>${convertToEnglishNumbers(sectoralFunctionsData.length)}</strong></div>
                <div>• متوسط الأداء العام: <strong style="color: ${getSectorColor(sectoralFunctionsData.reduce((sum, s) => sum + s.percentage, 0) / sectoralFunctionsData.length)};">${convertToEnglishNumbers((sectoralFunctionsData.reduce((sum, s) => sum + s.percentage, 0) / sectoralFunctionsData.length).toFixed(1))}%</strong></div>
              </div>
            </div>
          ` : `
            <div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; color: #856404;">
              <strong>لا توجد بيانات للوظائف القطاعية متاحة لهذا الحي</strong><br>
              <small>يُرجى استخدام حاسبة الوظائف القطاعية لإدخال البيانات أولاً</small>
            </div>
          `}
        </div>

        <!-- Damage Ratios Section -->
        <div class="section">
          <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px;">💥 نسب الأضرار</h2>
          <table>
            <tr>
              <th style="width: 40%;">نوع الضرر</th>
              <th style="width: 20%;">النسبة المئوية</th>
              <th style="width: 20%;">مستوى الضرر</th>
              <th style="width: 20%;">أولوية التدخل</th>
            </tr>
            ${damageRatiosData.map(damage => `
              <tr>
                <td style="font-weight: bold;">${convertToEnglishNumbers(damage.type)}</td>
                <td style="text-align: center; font-weight: bold;">${convertToEnglishNumbers(damage.percentage)}${typeof damage.percentage === 'number' ? '%' : ''}</td>
                <td style="text-align: center;">
                  <span class="damage-indicator damage-${damage.level.toLowerCase()}">${convertToEnglishNumbers(damage.levelText)}</span>
                </td>
                <td style="text-align: center; color: ${damage.priorityColor}; font-weight: bold;">${convertToEnglishNumbers(damage.priority)}</td>
              </tr>
            `).join('')}
          </table>
          
          ${damageRatiosData.some(d => typeof d.percentage === 'number') ? `
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border: 1px solid #2196F3; border-radius: 5px;">
              <strong style="color: #1565c0;">ملخص الأضرار:</strong><br>
              <div style="margin-top: 10px;">
                <div>• إجمالي نسبة الأضرار الشديدة: <strong style="color: #F44336;">${convertToEnglishNumbers(damageRatiosData.filter(d => d.level === 'HIGH' && typeof d.percentage === 'number').reduce((sum, d) => sum + d.percentage, 0).toFixed(1))}%</strong></div>
                <div>• إجمالي نسبة الأضرار المتوسطة: <strong style="color: #FF9800;">${convertToEnglishNumbers(damageRatiosData.filter(d => d.level === 'MEDIUM' && typeof d.percentage === 'number').reduce((sum, d) => sum + d.percentage, 0).toFixed(1))}%</strong></div>
                <div>• إجمالي نسبة الأضرار القليلة: <strong style="color: #4CAF50;">${convertToEnglishNumbers(damageRatiosData.filter(d => d.level === 'LOW' && typeof d.percentage === 'number').reduce((sum, d) => sum + d.percentage, 0).toFixed(1))}%</strong></div>
              </div>
            </div>
          ` : `
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
              <strong>ملاحظة:</strong> لا توجد بيانات أضرار رقمية متاحة لهذا الحي. يُرجى إدخال البيانات في النظام.
            </div>
          `}
        </div>

        <div class="report-footer" style="margin-top: 40px; text-align: center; color: #666; font-size: 10pt; border-top: 2px solid #e0e0e0; padding-top: 20px;">
          <p><strong>تم إنشاء هذا التقرير بواسطة نظام إدارة المعلومات الجغرافية للأحياء</strong></p>
          <p>مدينة حلب - مديرية التخطيط العمراني والإسكان</p>
          <p>© ${convertToEnglishNumbers(new Date().getFullYear())} - جميع الحقوق محفوظة | تقرير رقم: ${convertToEnglishNumbers(neighborhoodId)}-${convertToEnglishNumbers(Date.now().toString().slice(-6))}</p>
        </div>
      </div>
    `;

    reportContainer.innerHTML = reportHtml;

    // Make container visible for proper rendering
    reportContainer.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 800px !important;
      background: white !important;
      font-family: "Cairo", sans-serif !important;
      direction: rtl !important;
      font-size: 12pt !important;
      line-height: 1.6 !important;
      z-index: 9999 !important;
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
      padding: 20px !important;
      box-sizing: border-box !important;
    `;

    // Add temporary styles to ensure visibility
    const tempStyle = document.createElement('style');
    tempStyle.id = 'temp-pdf-styles';
    tempStyle.textContent = `
      #${reportContainer.id} * {
        visibility: visible !important;
        opacity: 1 !important;
      }
      #${reportContainer.id} table {
        display: table !important;
      }
      #${reportContainer.id} tr {
        display: table-row !important;
      }
      #${reportContainer.id} td, #${reportContainer.id} th {
        display: table-cell !important;
      }
    `;
    document.head.appendChild(tempStyle);

    // Wait for rendering and content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate PDF with better options
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Generate canvas with optimized settings
    let canvas;
    
    try {
      console.log('بدء إنشاء صورة التقرير...');
      
      canvas = await html2canvas(reportContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        foreignObjectRendering: false,
        removeContainer: false,
        letterRendering: true,
        imageTimeout: 15000,
        onclone: function(clonedDoc) {
          const clonedContainer = clonedDoc.getElementById(reportContainer.id);
          if (clonedContainer) {
            clonedContainer.style.display = 'block';
            clonedContainer.style.visibility = 'visible';
            clonedContainer.style.opacity = '1';
          }
        }
      });
      
      console.log('تم إنشاء صورة التقرير بنجاح:', canvas.width, 'x', canvas.height);
      
    } catch (error) {
      console.error('فشل في إنشاء صورة التقرير:', error);
      throw error;
    }

    if (canvas) {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `تقرير_شامل_${neighborhoodName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      pdf.save(filename);
    } else {
      throw new Error('فشل في إنشاء صورة التقرير');
    }

    // Clean up
    document.body.removeChild(reportContainer);
    
    // Remove temporary styles
    const tempStyleElement = document.getElementById('temp-pdf-styles');
    if (tempStyleElement) {
      document.head.removeChild(tempStyleElement);
    }

    // Show success notification
    if (typeof showNotification === 'function') {
      showNotification('تم تصدير التقرير الشامل بنجاح! تحقق من مجلد التنزيلات', 'success');
    }

  } catch (error) {
    console.error('خطأ في إنشاء التقرير:', error);
    
    // Clean up container if it exists
    const containers = document.querySelectorAll('[id^="pdf-report-container-"]');
    containers.forEach(container => {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    });
    
    // Remove temporary styles
    const tempStyleCleanup = document.getElementById('temp-pdf-styles');
    if (tempStyleCleanup) {
      document.head.removeChild(tempStyleCleanup);
    }
    
    // Show error message
    let errorMessage = 'حدث خطأ أثناء إنشاء التقرير: ';
    
    if (error.message && error.message.includes('صورة')) {
      errorMessage += 'مشكلة في إنشاء صورة التقرير. تحقق من إعدادات المتصفح.';
    } else if (error.message && error.message.includes('canvas')) {
      errorMessage += 'مشكلة في تحويل المحتوى. حاول تحديث الصفحة.';
    } else {
      errorMessage += error.message || 'خطأ غير محدد. يرجى المحاولة مرة أخرى.';
    }
    
    if (typeof showNotification === 'function') {
      showNotification(errorMessage, 'error');
    }
  }
}

/**
 * Get detailed neighborhood information from the popup data
 * @param {Object} neighborhoodFeature - Neighborhood feature from GeoJSON
 * @returns {Array} Array of info objects with label and value
 */
function getNeighborhoodDetailedInfo(neighborhoodFeature) {
  const properties = neighborhoodFeature.properties;
  const area = calculateArea(neighborhoodFeature.geometry);
  const areaInHectares = (area / 10000).toFixed(2);
  
  const info = [
    { label: 'اسم الحي', value: convertToEnglishNumbers(properties.Names || properties.Name || properties.name || 'غير محدد') },
    { label: 'معرف الحي', value: convertToEnglishNumbers(properties.ID || 'غير محدد') },
    { label: 'القطاع الإداري', value: convertToEnglishNumbers(properties.Sector || properties.SECTOR || 'غير محدد') },
    { label: 'المساحة التقديرية', value: `${convertToEnglishNumbers(areaInHectares)} هكتار` },
    { label: 'عدد السكان المقدر', value: convertToEnglishNumbers(properties.Population || properties.POPULATION || 'غير محدد') },
    { label: 'الكثافة السكانية', value: convertToEnglishNumbers(properties.Density || properties.DENSITY || 'غير محدد') },
    { label: 'نوع المنطقة', value: convertToEnglishNumbers(properties.Type || properties.ZONE_TYPE || properties.Zone || 'غير محدد') },
    { label: 'حالة التطوير', value: convertToEnglishNumbers(properties.Development || properties.STATUS || 'غير محدد') },
    { label: 'الرمز البريدي', value: convertToEnglishNumbers(properties.PostalCode || properties.POSTAL_CODE || 'غير محدد') },
    { label: 'آخر تحديث', value: convertToEnglishNumbers(new Date().toLocaleDateString('en-US')) }
  ];
  
  // Filter out undefined values and return only available data
  return info.filter(item => item.value && item.value !== 'غير محدد' && item.value !== 'undefined');
}

/**
 * Get sectoral functions data from the calculator
 * @param {string} neighborhoodName - Name of the neighborhood
 * @returns {Array} Array of sectoral function data
 */
function getSectoralFunctionsData(neighborhoodName) {
  const sectoralData = [];
  
  console.log('البحث عن بيانات الوظائف القطاعية للحي:', neighborhoodName);
  console.log('البيانات المتاحة:', window.sectoralFunctionalityData);
  
  // Check if global sectoral functionality data exists
  if (window.sectoralFunctionalityData && window.sectoralFunctionalityData[neighborhoodName]) {
    const neighborhoodData = window.sectoralFunctionalityData[neighborhoodName];
    console.log('تم العثور على بيانات للحي:', neighborhoodData);
    
    Object.keys(neighborhoodData).forEach(sectorName => {
      const sector = neighborhoodData[sectorName];
      if (sector && sector.percentage !== undefined) {
        sectoralData.push({
          name: sectorName,
          percentage: sector.percentage,
          status: sector.status || getStatusFromPercentage(sector.percentage),
          assessment: getAssessmentFromPercentage(sector.percentage)
        });
      }
    });
  } else {
    console.log('لم يتم العثور على بيانات الوظائف القطاعية للحي');
  }
  
  return sectoralData;
}

/**
 * Get real damage ratios data
 * @param {string} neighborhoodId - ID of the neighborhood
 * @returns {Array} Array of damage data
 */
function getRealDamageRatiosData(neighborhoodId) {
  let damageData = [];
  
  console.log('البحث عن بيانات الأضرار للحي:', neighborhoodId);
  
  // Try to get damage data from the global function
  if (typeof getDamageRatiosForNeighborhood === 'function') {
    const damageInfo = getDamageRatiosForNeighborhood(neighborhoodId);
    console.log('بيانات الأضرار المستخرجة:', damageInfo);
    
    if (damageInfo) {
      damageData = [
        {
          type: 'أضرار المباني السكنية',
          percentage: damageInfo.severeDamagePercentage || 0,
          level: getDamageLevel(damageInfo.severeDamagePercentage || 0),
          levelText: getDamageLevelText(damageInfo.severeDamagePercentage || 0),
          priority: 'عالية',
          priorityColor: '#F44336'
        },
        {
          type: 'أضرار المباني التجارية',
          percentage: damageInfo.mediumDamagePercentage || 0,
          level: getDamageLevel(damageInfo.mediumDamagePercentage || 0),
          levelText: getDamageLevelText(damageInfo.mediumDamagePercentage || 0),
          priority: 'متوسطة',
          priorityColor: '#FF9800'
        },
        {
          type: 'أضرار البنية التحتية',
          percentage: damageInfo.lightDamagePercentage || 0,
          level: getDamageLevel(damageInfo.lightDamagePercentage || 0),
          levelText: getDamageLevelText(damageInfo.lightDamagePercentage || 0),
          priority: 'متوسطة',
          priorityColor: '#FF9800'
        },
        {
          type: 'المباني السليمة',
          percentage: damageInfo.noDamagePercentage || 0,
          level: 'LOW',
          levelText: '🟢 سليمة',
          priority: 'منخفضة',
          priorityColor: '#4CAF50'
        }
      ];
      
      // Add additional info if available
      if (damageInfo.totalUnits) {
        damageData.push({
          type: 'إجمالي الوحدات السكنية',
          percentage: damageInfo.totalUnits,
          level: 'INFO',
          levelText: '📊 معلومات',
          priority: 'إحصائية',
          priorityColor: '#2196F3'
        });
      }
      
      if (damageInfo.vacantPercentage) {
        damageData.push({
          type: 'الوحدات الشاغرة',
          percentage: damageInfo.vacantPercentage,
          level: getDamageLevel(damageInfo.vacantPercentage),
          levelText: getDamageLevelText(damageInfo.vacantPercentage),
          priority: 'متوسطة',
          priorityColor: '#FF9800'
        });
      }
    }
  }
  
  // If no real data, provide default structure
  if (damageData.length === 0) {
    console.log('لم يتم العثور على بيانات أضرار، استخدام البيانات الافتراضية');
    damageData = [
      {
        type: 'أضرار المباني السكنية',
        percentage: 'غير متوفر',
        level: 'UNKNOWN',
        levelText: '❓ غير محدد',
        priority: 'غير محدد',
        priorityColor: '#6c757d'
      },
      {
        type: 'أضرار المباني التجارية',
        percentage: 'غير متوفر',
        level: 'UNKNOWN',
        levelText: '❓ غير محدد',
        priority: 'غير محدد',
        priorityColor: '#6c757d'
      },
      {
        type: 'أضرار البنية التحتية',
        percentage: 'غير متوفر',
        level: 'UNKNOWN',
        levelText: '❓ غير محدد',
        priority: 'غير محدد',
        priorityColor: '#6c757d'
      }
    ];
  }
  
  return damageData;
}

/**
 * Capture neighborhood map view
 * @param {Object} neighborhoodFeature - Neighborhood feature
 * @returns {Promise<string>} Base64 image data or null
 */
async function captureNeighborhoodMap(neighborhoodFeature) {
  try {
    console.log('محاولة التقاط صورة الخريطة...');
    
    // Check if map exists
    if (!window.map) {
      console.warn('الخريطة غير متاحة لالتقاط الصورة');
      return null;
    }
    
    // Get map container
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('حاوي الخريطة غير موجود');
      return null;
    }
    
    // Focus on neighborhood bounds
    const bounds = L.geoJSON(neighborhoodFeature).getBounds();
    window.map.fitBounds(bounds, { padding: [20, 20] });
    
    console.log('تم تركيز الخريطة على الحي، انتظار التحميل...');
    
    // Wait for map to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Capture map image
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 600,
      height: 400,
      scale: 1,
      logging: false
    });
    
    console.log('تم التقاط صورة الخريطة بنجاح');
    return canvas.toDataURL('image/png');
    
  } catch (error) {
    console.error('خطأ في التقاط صورة الخريطة:', error);
    return null;
  }
}

/**
 * Helper functions for damage assessment
 */
function getDamageLevel(percentage) {
  if (typeof percentage !== 'number') return 'UNKNOWN';
  if (percentage >= 60) return 'HIGH';
  if (percentage >= 30) return 'MEDIUM';
  return 'LOW';
}

function getDamageLevelText(percentage) {
  if (typeof percentage !== 'number') return '❓ غير محدد';
  if (percentage >= 60) return '🔴 عالية';
  if (percentage >= 30) return '🟠 متوسطة';
  return '🟢 قليلة';
}

function getStatusFromPercentage(percentage) {
  if (percentage >= 80) return 'ممتازة';
  if (percentage >= 60) return 'جيدة';
  if (percentage >= 40) return 'مقبولة';
  return 'ضعيفة';
}

function getAssessmentFromPercentage(percentage) {
  if (percentage >= 80) return 'يلبي المعايير';
  if (percentage >= 60) return 'يحتاج تحسين';
  if (percentage >= 40) return 'يحتاج تطوير';
  return 'يحتاج تدخل عاجل';
}

function getSectorColor(percentage) {
  if (percentage >= 80) return '#4CAF50';
  if (percentage >= 60) return '#2196F3';
  if (percentage >= 40) return '#FF9800';
  return '#F44336';
}

function getStatusClass(status) {
  switch(status) {
    case 'ممتازة': return 'status-excellent';
    case 'جيدة': return 'status-good';
    case 'مقبولة': return 'status-acceptable';
    default: return 'status-poor';
  }
}

/**
 * Convert Arabic numerals to English numerals
 * @param {string|number} text - Text containing Arabic numerals
 * @returns {string} Text with English numerals
 */
function convertToEnglishNumbers(text) {
  if (typeof text === 'number') {
    text = text.toString();
  }
  if (typeof text !== 'string') {
    return text;
  }
  
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  for (let i = 0; i < arabicNumbers.length; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }
  
  return result;
}

/**
 * Calculate area of a geometry (polygon)
 * @param {Object} geometry - GeoJSON geometry object
 * @returns {number} Area in square meters
 */
function calculateArea(geometry) {
  if (!geometry || geometry.type !== 'Polygon') {
    return 0;
  }
  
  // Simple area calculation for polygon
  // This is a simplified version - for accurate area calculation, 
  // you might want to use a proper GIS library like Turf.js
  const coordinates = geometry.coordinates[0];
  let area = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  return Math.abs(area / 2) * 111000 * 111000; // Rough conversion to square meters
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showExportOptionsMenu,
    generateNeighborhoodReport,
    calculateArea
  };
} 