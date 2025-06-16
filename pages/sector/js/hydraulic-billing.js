/**
 * hydraulic-billing.js
 * يدير وظائف الهيدروليك (المياه) والفواتير
 */

// متغيرات عامة لتخزين المعلومات الحالية
let currentHydraulicSector = null;
let currentBillingSector = null;
let hydraulicChart = null;
let billingChart = null;

// تهيئة وظائف الهيدروليك والفواتير عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  initHydraulicAndBillingUI();
  setupEventListeners();
});

/**
 * تهيئة واجهة المستخدم للهيدروليك والفواتير
 */
function initHydraulicAndBillingUI() {
  // ملء قوائم دوائر الخدمات
  populateServiceSectorDropdowns();

  // تهيئة الرسوم البيانية
  initBillingChart();
}

/**
 * ملء قوائم دوائر الخدمات
 */
function populateServiceSectorDropdowns() {
  const hydraulicSectorSelect = document.getElementById(
    "hydraulicSectorSelect"
  );
  const billingSectorSelect = document.getElementById("billingSectorSelect");

  if (
    hydraulicSectorSelect &&
    billingSectorSelect &&
    typeof serviceSectors !== "undefined"
  ) {
    // إنشاء قائمة بدوائر الخدمات
    const options = serviceSectors
      .map((sector) => `<option value="${sector.id}">${sector.name}</option>`)
      .join("");

    // إضافة الخيارات لقوائم الاختيار
    hydraulicSectorSelect.innerHTML += options;
    billingSectorSelect.innerHTML += options;
  }
}

/**
 * إعداد أحداث العناصر
 */
function setupEventListeners() {
  // حدث تغيير دائرة خدمات الهيدروليك
  const hydraulicSectorSelect = document.getElementById(
    "hydraulicSectorSelect"
  );
  if (hydraulicSectorSelect) {
    hydraulicSectorSelect.addEventListener("change", function () {
      const sectorId = parseInt(this.value);
      if (sectorId) {
        showHydraulicDetails(sectorId);
      } else {
        clearHydraulicDetails();
      }
    });
  }

  // حدث تغيير دائرة خدمات الفواتير
  const billingSectorSelect = document.getElementById("billingSectorSelect");
  if (billingSectorSelect) {
    billingSectorSelect.addEventListener("change", function () {
      const sectorId = parseInt(this.value);
      if (sectorId) {
        showBillingDetails(sectorId);
        updateBillingChart(sectorId);
      } else {
        clearBillingDetails();
      }
    });
  }

  // زر عرض خريطة تغطية المياه
  const showHydraulicMapBtn = document.getElementById("showHydraulicMapBtn");
  if (showHydraulicMapBtn) {
    showHydraulicMapBtn.addEventListener("click", function () {
      if (currentHydraulicSector) {
        showWaterCoverageMap(currentHydraulicSector);
      } else {
        alert("الرجاء اختيار دائرة خدمات أولاً");
      }
    });
  }

  // زر تصدير تقرير الفواتير
  const exportBillingBtn = document.getElementById("exportBillingBtn");
  if (exportBillingBtn) {
    exportBillingBtn.addEventListener("click", function () {
      if (currentBillingSector) {
        exportBillingReport(currentBillingSector);
      } else {
        alert("الرجاء اختيار دائرة خدمات أولاً");
      }
    });
  }
}

/**
 * عرض تفاصيل خدمات المياه لدائرة خدمات معينة
 * @param {number} sectorId - معرف دائرة الخدمات
 */
function showHydraulicDetails(sectorId) {
  const hydraulicData = hydraulicServiceData.find(
    (data) => data.sectorId === sectorId
  );
  const sector = serviceSectors.find((s) => s.id === sectorId);

  if (hydraulicData && sector) {
    currentHydraulicSector = sectorId;

    const hydraulicDetails = document.getElementById("hydraulicDetails");
    if (hydraulicDetails) {
      // حساب نسبة ساعات التغذية من 24 ساعة
      const supplyRatio = (hydraulicData.waterSupplyHours / 24) * 100;
      const markerPosition = `${supplyRatio}%`;

      // تحديد مستوى الضغط بالألوان
      let pressureClass = "medium";
      if (hydraulicData.waterPressure === "جيد") {
        pressureClass = "low";
      } else if (
        hydraulicData.waterPressure === "منخفض" ||
        hydraulicData.waterPressure === "منخفض جداً"
      ) {
        pressureClass = "high";
      }

      hydraulicDetails.innerHTML = `
        <h4 style="margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
          ${sector.name}
        </h4>
        
        <div class="stat-row">
          <span class="stat-label">ساعات التغذية اليومية:</span>
          <span class="stat-value">${hydraulicData.waterSupplyHours} ساعة</span>
        </div>
        
        <div style="margin: 10px 0;">
          <div class="water-supply-indicator">
            <div class="water-supply-marker" style="left: ${markerPosition};"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
            <span>0 ساعة</span>
            <span>12 ساعة</span>
            <span>24 ساعة</span>
          </div>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">ضغط المياه:</span>
          <span class="stat-value ${pressureClass}">${hydraulicData.waterPressure}</span>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">عدد محطات الضخ:</span>
          <span class="stat-value">${hydraulicData.pumpStations}</span>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">ملاحظات الصيانة:</span>
          <span class="stat-value">${hydraulicData.maintenanceNotes}</span>
        </div>
      `;
    }
  }
}

/**
 * مسح تفاصيل خدمات المياه
 */
function clearHydraulicDetails() {
  const hydraulicDetails = document.getElementById("hydraulicDetails");
  if (hydraulicDetails) {
    hydraulicDetails.innerHTML = `
      <div class="empty-state">اختر دائرة خدمات لعرض معلومات المياه</div>
    `;
  }
  currentHydraulicSector = null;
}

/**
 * عرض خريطة تغطية المياه
 * @param {number} sectorId - معرف دائرة الخدمات
 */
function showWaterCoverageMap(sectorId) {
  // هنا يمكن إضافة رمز لإظهار طبقة تغطية المياه على الخريطة

  // للتوضيح، سنقوم بتسليط الضوء على دائرة الخدمات في الخريطة
  const sector = serviceSectors.find((s) => s.id === sectorId);

  if (sector) {
    alert(`سيتم عرض خريطة تغطية المياه لدائرة خدمات ${sector.name}`);

    // يمكن هنا استدعاء وظيفة في ملف الخريطة لإظهار طبقة التغطية
    if (typeof highlightServiceSector === "function") {
      highlightServiceSector(sectorId);
    }
  }
}

/**
 * تهيئة الرسم البياني للفواتير
 */
function initBillingChart() {
  const ctx = document.getElementById("billingChart");

  if (ctx) {
    billingChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["محصل", "غير محصل"],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ["#10b981", "#ef4444"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                family: "Cairo",
              },
            },
          },
        },
      },
    });
  }
}

/**
 * عرض تفاصيل الفواتير لدائرة خدمات معينة
 * @param {number} sectorId - معرف دائرة الخدمات
 */
function showBillingDetails(sectorId) {
  const billingData = billingServiceData.find(
    (data) => data.sectorId === sectorId
  );
  const sector = serviceSectors.find((s) => s.id === sectorId);

  if (billingData && sector) {
    currentBillingSector = sectorId;

    const billingDetails = document.getElementById("billingDetails");
    if (billingDetails) {
      // تنسيق المبلغ المستحق
      const formattedAmount = new Intl.NumberFormat("ar-SY", {
        style: "currency",
        currency: "SYP",
        maximumFractionDigits: 0,
      }).format(billingData.outstandingAmount);

      billingDetails.innerHTML = `
        <h4 style="margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">
          ${sector.name}
        </h4>
        
        <div class="stat-row">
          <span class="stat-label">عدد المشتركين:</span>
          <span class="stat-value">${billingData.totalSubscribers.toLocaleString(
            "ar-SY"
          )}</span>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">معدل التحصيل:</span>
          <span class="stat-value">${billingData.collectionRate}%</span>
        </div>
        
        <div style="margin: 10px 0;">
          <div class="collection-rate-container">
            <div class="collection-rate-fill" style="width: ${
              billingData.collectionRate
            }%;"></div>
          </div>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">المبلغ المستحق:</span>
          <span class="stat-value">${formattedAmount}</span>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">آخر دورة فواتير:</span>
          <span class="stat-value">${billingData.lastBillingCycle}</span>
        </div>
      `;
    }
  }
}

/**
 * مسح تفاصيل الفواتير
 */
function clearBillingDetails() {
  const billingDetails = document.getElementById("billingDetails");
  if (billingDetails) {
    billingDetails.innerHTML = `
      <div class="empty-state">اختر دائرة خدمات لعرض معلومات الفواتير</div>
    `;
  }
  currentBillingSector = null;

  // إعادة تعيين الرسم البياني
  if (billingChart) {
    billingChart.data.datasets[0].data = [0, 0];
    billingChart.update();
  }
}

/**
 * تحديث الرسم البياني للفواتير
 * @param {number} sectorId - معرف دائرة الخدمات
 */
function updateBillingChart(sectorId) {
  const billingData = billingServiceData.find(
    (data) => data.sectorId === sectorId
  );

  if (billingData && billingChart) {
    const collectedPercentage = billingData.collectionRate;
    const uncollectedPercentage = 100 - collectedPercentage;

    billingChart.data.datasets[0].data = [
      collectedPercentage,
      uncollectedPercentage,
    ];
    billingChart.update();
  }
}

/**
 * تصدير تقرير الفواتير
 * @param {number} sectorId - معرف دائرة الخدمات
 */
function exportBillingReport(sectorId) {
  const billingData = billingServiceData.find(
    (data) => data.sectorId === sectorId
  );
  const sector = serviceSectors.find((s) => s.id === sectorId);

  if (billingData && sector) {
    // إنشاء نص التقرير
    const formattedAmount = new Intl.NumberFormat("ar-SY", {
      style: "currency",
      currency: "SYP",
      maximumFractionDigits: 0,
    }).format(billingData.outstandingAmount);

    const reportText = `تقرير فواتير دائرة خدمات ${sector.name}
تاريخ التقرير: ${new Date().toLocaleDateString("ar-SY")}
عدد المشتركين: ${billingData.totalSubscribers.toLocaleString("ar-SY")}
معدل التحصيل: ${billingData.collectionRate}%
المبلغ المستحق: ${formattedAmount}
آخر دورة فواتير: ${billingData.lastBillingCycle}`;

    // إنشاء ملف للتنزيل
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // إنشاء رابط للتنزيل
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير_فواتير_${sector.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();

    // تنظيف
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
