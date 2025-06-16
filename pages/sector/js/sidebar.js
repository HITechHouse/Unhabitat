/**
 * sidebar.js
 * يدير وظائف الشريط الجانبي للتطبيق
 */

// متغيرات عامة
let leftSidebarActive = false;
let rightSidebarActive = false;
let leftSidebarTimer = null;
let rightSidebarTimer = null;
const AUTO_CLOSE_DELAY = 2000; // 2 seconds

// تهيئة الأشرطة الجانبية عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  // تعيين حالة التثبيت الافتراضية
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");

  if (leftSidebar) {
    leftSidebar.setAttribute("data-pinned", "false");
  }

  if (rightSidebar) {
    rightSidebar.setAttribute("data-pinned", "false");
  }

  initSidebars();
});

/**
 * تهيئة الأشرطة الجانبية والأزرار المرتبطة بها
 */
function initSidebars() {
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");
  const mainContent = document.querySelector(".main-content");

  // أزرار التبديل في الشريطين الجانبيين
  const toggleLeftSidebar = document.getElementById("toggleLeftSidebar");
  const toggleRightSidebar = document.getElementById("toggleRightSidebar");

  // أزرار التثبيت في الشريطين الجانبيين
  const pinLeftSidebar = document.getElementById("pinLeftSidebar");
  const pinRightSidebar = document.getElementById("pinRightSidebar");

  // أزرار التبديل في الهيدر
  const toggleLeftSidebarBtn = document.getElementById("toggleLeftSidebarBtn");
  const toggleRightSidebarBtn = document.getElementById(
    "toggleRightSidebarBtn"
  );

  // إضافة الطبقة الحيوية للأشرطة الجانبية لتمكين الانتقالات
  leftSidebar.classList.add("sidebar-animate");
  rightSidebar.classList.add("sidebar-animate");

  // تفعيل الشريطين الجانبيين في الوضع العريض فقط
  handleResponsiveSidebars();

  // تعيين أحداث النقر لأزرار التبديل
  if (toggleLeftSidebar) {
    toggleLeftSidebar.addEventListener("click", function () {
      toggleSidebar("left");
    });
  }

  if (toggleRightSidebar) {
    toggleRightSidebar.addEventListener("click", function () {
      toggleSidebar("right");
    });
  }

  if (toggleLeftSidebarBtn) {
    toggleLeftSidebarBtn.addEventListener("click", function () {
      toggleSidebar("left");
      this.classList.toggle("active");
    });
  }

  if (toggleRightSidebarBtn) {
    toggleRightSidebarBtn.addEventListener("click", function () {
      toggleSidebar("right");
      this.classList.toggle("active");
    });
  }

  // إعادة حساب وضع الأشرطة الجانبية عند تغيير حجم النافذة
  window.addEventListener("resize", function () {
    handleResponsiveSidebars();
  });

  // إضافة مستمعي أحداث الماوس للإغلاق التلقائي
  setupAutoCloseSidebars(leftSidebar, rightSidebar);

  // تهيئة اختصارات لوحة المفاتيح للأشرطة الجانبية
  initKeyboardShortcuts();

  // تهيئة وظائف أخرى مرتبطة بالأشرطة الجانبية
  initLayerControls();
  initStyleControls();
  initImportControls();
}

/**
 * تبديل حالة الشريط الجانبي (مفتوح/مغلق)
 * @param {string} side - جانب الشريط ('left' أو 'right')
 */
function toggleSidebar(side) {
  // إلغاء أي مؤقتات إغلاق تلقائي عند التبديل اليدوي
  clearAutoCloseTimers();

  const sidebar =
    side === "left"
      ? document.getElementById("leftSidebar")
      : document.getElementById("rightSidebar");

  const mainContent = document.querySelector(".main-content");

  if (side === "left") {
    leftSidebarActive = !leftSidebarActive;
    sidebar.classList.toggle("collapsed", !leftSidebarActive);

    if (window.innerWidth >= 992) {
      // No margins needed anymore with absolute positioning
    } else {
      sidebar.classList.toggle("active", leftSidebarActive);
    }

    // Update button visibility in header
    const headerBtn = document.getElementById("toggleLeftSidebarBtn");
    if (headerBtn) {
      headerBtn.classList.toggle("active", leftSidebarActive);
    }

    // إذا تم إغلاق الشريط الجانبي، إلغاء المؤقت
    if (!leftSidebarActive && leftSidebarTimer) {
      clearTimeout(leftSidebarTimer);
      leftSidebarTimer = null;
    }
  } else {
    rightSidebarActive = !rightSidebarActive;
    sidebar.classList.toggle("collapsed", !rightSidebarActive);

    if (window.innerWidth >= 992) {
      // No margins needed anymore with absolute positioning
    } else {
      sidebar.classList.toggle("active", rightSidebarActive);
    }

    // Update button visibility in header
    const headerBtn = document.getElementById("toggleRightSidebarBtn");
    if (headerBtn) {
      headerBtn.classList.toggle("active", rightSidebarActive);
    }

    // إذا تم إغلاق الشريط الجانبي، إلغاء المؤقت
    if (!rightSidebarActive && rightSidebarTimer) {
      clearTimeout(rightSidebarTimer);
      rightSidebarTimer = null;
    }
  }
}

/**
 * تهيئة اختصارات لوحة المفاتيح للأشرطة الجانبية
 * Ctrl + L: تبديل الشريط الجانبي الأيسر
 * Ctrl + R: تبديل الشريط الجانبي الأيمن
 */
function initKeyboardShortcuts() {
  // إضافة مستمع أحداث لوحة المفاتيح على مستوى المستند
  document.addEventListener("keydown", function (event) {
    // التحقق من أن مفتاح Ctrl مضغوط
    if (event.ctrlKey) {
      // التحقق من المفتاح المضغوط
      switch (event.key.toLowerCase()) {
        case "l":
          // Ctrl + L: تبديل الشريط الجانبي الأيسر
          event.preventDefault(); // منع السلوك الافتراضي للمتصفح
          toggleSidebar("left");
          break;

        case "r":
          // Ctrl + R: تبديل الشريط الجانبي الأيمن
          event.preventDefault(); // منع السلوك الافتراضي للمتصفح
          toggleSidebar("right");
          break;
      }
    }
  });
}

/**
 * معالجة الأشرطة الجانبية بشكل مستجيب لحجم الشاشة
 */
function handleResponsiveSidebars() {
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");

  if (window.innerWidth >= 992) {
    // وضع النافذة الكبيرة
    leftSidebar.classList.remove("active");
    rightSidebar.classList.remove("active");

    // تطبيق حالة الانهيار
    leftSidebar.classList.toggle("collapsed", !leftSidebarActive);
    rightSidebar.classList.toggle("collapsed", !rightSidebarActive);
  } else {
    // وضع النافذة الصغيرة - استخدام transform للشريط الجانبي
    leftSidebar.classList.toggle("active", leftSidebarActive);
    rightSidebar.classList.toggle("active", rightSidebarActive);
  }

  // تحديث أزرار التبديل في الهيدر
  const leftHeaderBtn = document.getElementById("toggleLeftSidebarBtn");
  const rightHeaderBtn = document.getElementById("toggleRightSidebarBtn");

  if (leftHeaderBtn) {
    leftHeaderBtn.classList.toggle("active", leftSidebarActive);
  }

  if (rightHeaderBtn) {
    rightHeaderBtn.classList.toggle("active", rightSidebarActive);
  }
}

/**
 * تهيئة عناصر التحكم في الطبقات
 */
function initLayerControls() {
  // التحكم في عناصر الاختيار للطبقات
  const neighborhoodsLayerCheckbox = document.getElementById(
    "layer-neighborhoods"
  );
  const sectorsLayerCheckbox = document.getElementById("layer-sectors");

  // إضافة أحداث لمعالجة تغييرات حالة الطبقات
  if (neighborhoodsLayerCheckbox) {
    neighborhoodsLayerCheckbox.addEventListener("change", function () {
      toggleMapLayer("neighborhoods", this.checked);
    });
  }

  if (sectorsLayerCheckbox) {
    sectorsLayerCheckbox.addEventListener("change", function () {
      toggleMapLayer("sectors", this.checked);
    });
  }

  // أزرار إجراءات الطبقة
  const layerActionButtons = document.querySelectorAll(".layer-action-btn");
  layerActionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.getAttribute("data-action");
      const layer = this.getAttribute("data-layer");

      if (action === "zoom") {
        zoomToLayer(layer);
      } else if (action === "info") {
        showLayerInfo(layer);
      }
    });
  });
}

/**
 * تبديل رؤية طبقة على الخريطة
 * @param {string} layerName - اسم الطبقة
 * @param {boolean} visible - حالة الرؤية
 */
function toggleMapLayer(layerName, visible) {
  // هذه الوظيفة ستتم معالجتها بشكل كامل في ملف map.js
  // مجرد مكان مؤقت هنا للاتصال بوظائف الخريطة
  if (window.mapLayerToggle) {
    window.mapLayerToggle(layerName, visible);
  } else {
    console.log(
      `تبديل رؤية الطبقة: ${layerName} إلى ${visible ? "مرئية" : "مخفية"}`
    );
  }
}

/**
 * التكبير على طبقة محددة
 * @param {string} layerName - اسم الطبقة
 */
function zoomToLayer(layerName) {
  // هذه الوظيفة ستتم معالجتها بشكل كامل في ملف map.js
  if (window.zoomToMapLayer) {
    window.zoomToMapLayer(layerName);
  } else {
    console.log(`التكبير على الطبقة: ${layerName}`);
  }
}

/**
 * عرض معلومات الطبقة
 * @param {string} layerName - اسم الطبقة
 */
function showLayerInfo(layerName) {
  // هذه الوظيفة ستتم معالجتها بشكل كامل في ملف map.js
  if (window.showMapLayerInfo) {
    window.showMapLayerInfo(layerName);
  } else {
    console.log(`عرض معلومات الطبقة: ${layerName}`);
  }
}

/**
 * تهيئة عناصر التحكم في النمط
 */
function initStyleControls() {
  const layerStyleSelect = document.getElementById("layerStyleSelect");
  const layerColor = document.getElementById("layerColor");
  const layerOpacity = document.getElementById("layerOpacity");
  const lineWeight = document.getElementById("lineWeight");
  const opacityValue = document.getElementById("opacityValue");
  const applyStyleBtn = document.getElementById("applyStyleBtn");

  // عرض قيمة الشفافية
  if (layerOpacity && opacityValue) {
    layerOpacity.addEventListener("input", function () {
      opacityValue.textContent = this.value;
    });
  }

  // تطبيق النمط على الطبقة المحددة
  if (applyStyleBtn) {
    applyStyleBtn.addEventListener("click", function () {
      if (!layerStyleSelect || !layerColor || !layerOpacity || !lineWeight)
        return;

      const layer = layerStyleSelect.value;
      const color = layerColor.value;
      const opacity = parseFloat(layerOpacity.value);
      const weight = parseInt(lineWeight.value);

      if (!layer) {
        alert("الرجاء اختيار طبقة لتطبيق النمط عليها");
        return;
      }

      applyLayerStyle(layer, { color, opacity, weight });
    });
  }
}

/**
 * تطبيق نمط على طبقة
 * @param {string} layerName - اسم الطبقة
 * @param {Object} style - مواصفات النمط
 */
function applyLayerStyle(layerName, style) {
  // هذه الوظيفة ستتم معالجتها بشكل كامل في ملف map.js
  if (window.applyMapLayerStyle) {
    window.applyMapLayerStyle(layerName, style);
  } else {
    console.log(`تطبيق النمط على الطبقة: ${layerName}`, style);
  }
}

/**
 * تهيئة عناصر التحكم في استيراد الطبقات
 * ملاحظة: تم نقل جميع event listeners للاستيراد إلى features.js لتجنب التضارب
 */
function initImportControls() {
  // منع التهيئة المتكررة  
  if (window.sidebarImportInitialized) {
    return;
  }
  window.sidebarImportInitialized = true;
  
  console.log("تم تهيئة عناصر التحكم في الاستيراد من sidebar.js");
  
  // تم نقل جميع event listeners إلى features.js لتجنب التضارب
  // لا نحتاج إضافة أي event listeners هنا
}

/**
 * استيراد طبقة من ملف
 * @param {File} file - الملف المراد استيراده
 */
function importLayer(file) {
  console.log(`استيراد طبقة من الملف: ${file.name}`);
  alert(`سيتم استيراد الملف: ${file.name} (هذه نسخة تجريبية)`);
}



/**
 * إعداد الإغلاق التلقائي للأشرطة الجانبية بعد إبعاد مؤشر الماوس
 * @param {HTMLElement} leftSidebar - عنصر الشريط الجانبي الأيسر
 * @param {HTMLElement} rightSidebar - عنصر الشريط الجانبي الأيمن
 */
function setupAutoCloseSidebars(leftSidebar, rightSidebar) {
  // الحصول على عناصر مؤشرات الإغلاق التلقائي
  const leftIndicator = document.getElementById(
    "leftSidebarAutoCloseIndicator"
  );
  const rightIndicator = document.getElementById(
    "rightSidebarAutoCloseIndicator"
  );

  // إضافة مستمعي أحداث للشريط الجانبي الأيسر
  if (leftSidebar) {
    leftSidebar.addEventListener("mouseenter", function () {
      // إلغاء المؤقت عند دخول المؤشر للشريط الجانبي
      if (leftSidebarTimer) {
        clearTimeout(leftSidebarTimer);
        leftSidebarTimer = null;

        // إخفاء المؤشر
        if (leftIndicator) {
          leftIndicator.classList.remove("show");
        }
      }
    });

    leftSidebar.addEventListener("mouseleave", function () {
      // تحقق مما إذا كان الشريط مثبتًا
      if (leftSidebar.getAttribute("data-pinned") === "true") {
        return; // تجاهل الإغلاق التلقائي إذا كان مثبتًا
      }

      // بدء المؤقت عند خروج المؤشر من الشريط الجانبي
      if (leftSidebarActive && !leftSidebar.classList.contains("collapsed")) {
        // إظهار المؤشر
        if (leftIndicator) {
          leftIndicator.classList.add("show");
        }

        leftSidebarTimer = setTimeout(function () {
          // تحقق مرة أخرى في حالة تغيير حالة التثبيت أثناء المهلة
          if (leftSidebar.getAttribute("data-pinned") !== "true") {
            toggleSidebar("left");

            // إخفاء المؤشر بعد الإغلاق
            if (leftIndicator) {
              leftIndicator.classList.remove("show");
            }
          }
        }, AUTO_CLOSE_DELAY);
      }
    });
  }

  // إضافة مستمعي أحداث للشريط الجانبي الأيمن
  if (rightSidebar) {
    rightSidebar.addEventListener("mouseenter", function () {
      // إلغاء المؤقت عند دخول المؤشر للشريط الجانبي
      if (rightSidebarTimer) {
        clearTimeout(rightSidebarTimer);
        rightSidebarTimer = null;

        // إخفاء المؤشر
        if (rightIndicator) {
          rightIndicator.classList.remove("show");
        }
      }
    });

    rightSidebar.addEventListener("mouseleave", function () {
      // تحقق مما إذا كان الشريط مثبتًا
      if (rightSidebar.getAttribute("data-pinned") === "true") {
        return; // تجاهل الإغلاق التلقائي إذا كان مثبتًا
      }

      // بدء المؤقت عند خروج المؤشر من الشريط الجانبي
      if (rightSidebarActive && !rightSidebar.classList.contains("collapsed")) {
        // إظهار المؤشر
        if (rightIndicator) {
          rightIndicator.classList.add("show");
        }

        rightSidebarTimer = setTimeout(function () {
          // تحقق مرة أخرى في حالة تغيير حالة التثبيت أثناء المهلة
          if (rightSidebar.getAttribute("data-pinned") !== "true") {
            toggleSidebar("right");

            // إخفاء المؤشر بعد الإغلاق
            if (rightIndicator) {
              rightIndicator.classList.remove("show");
            }
          }
        }, AUTO_CLOSE_DELAY);
      }
    });
  }
}

/**
 * إلغاء مؤقتات الإغلاق التلقائي
 */
function clearAutoCloseTimers() {
  // الحصول على عناصر مؤشرات الإغلاق التلقائي
  const leftIndicator = document.getElementById(
    "leftSidebarAutoCloseIndicator"
  );
  const rightIndicator = document.getElementById(
    "rightSidebarAutoCloseIndicator"
  );

  if (leftSidebarTimer) {
    clearTimeout(leftSidebarTimer);
    leftSidebarTimer = null;

    // إخفاء المؤشر
    if (leftIndicator) {
      leftIndicator.classList.remove("show");
    }
  }

  if (rightSidebarTimer) {
    clearTimeout(rightSidebarTimer);
    rightSidebarTimer = null;

    // إخفاء المؤشر
    if (rightIndicator) {
      rightIndicator.classList.remove("show");
    }
  }
}

// كشف عن الوظائف للاستخدام الخارجي
window.toggleSidebar = toggleSidebar;
window.clearAutoCloseTimers = clearAutoCloseTimers;
