/**
 * query.js
 * يدير وظائف الاستعلام والتحليل للتطبيق
 */

// متغيرات عامة للاستعلامات
let queryConditions = [];
let queryResults = [];
let highlightedFeatures = [];
let tableFields = {};

// تهيئة منشئ الاستعلامات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  initQueryBuilder();
});

/**
 * تهيئة منشئ الاستعلامات
 */
function initQueryBuilder() {
  const queryTableSelect = document.getElementById("queryTableSelect");
  const queryFieldSelect = document.getElementById("queryFieldSelect");
  const queryOperatorSelect = document.getElementById("queryOperatorSelect");
  const queryValueInput = document.getElementById("queryValueInput");
  const valueListBtn = document.getElementById("valueListBtn");
  const addConditionBtn = document.getElementById("addConditionBtn");
  const runQueryBtn = document.getElementById("runQueryBtn");

  // تحديد الحقول المتاحة للجداول
  defineTableFields();

  // تعيين أحداث التغيير والنقر
  if (queryTableSelect) {
    queryTableSelect.addEventListener("change", function () {
      loadFieldsForTable(this.value);
    });
  }

  if (valueListBtn) {
    valueListBtn.addEventListener("click", function () {
      showValueList();
    });
  }

  if (addConditionBtn) {
    addConditionBtn.addEventListener("click", function () {
      if (
        queryTableSelect.value &&
        queryFieldSelect.value &&
        queryOperatorSelect.value
      ) {
        addQueryCondition(
          queryTableSelect.value,
          queryFieldSelect.value,
          queryOperatorSelect.value,
          queryValueInput.value
        );
        queryValueInput.value = "";
      } else {
        alert("الرجاء تحديد الجدول والحقل والعملية قبل إضافة الشرط");
      }
    });
  }

  if (runQueryBtn) {
    runQueryBtn.addEventListener("click", function () {
      executeQuery();
    });
  }
}

/**
 * تعريف الحقول لكل جدول
 */
function defineTableFields() {
  tableFields = {
    neighborhoods: [
      { id: "ID", label: "المعرّف" },
      { id: "Names", label: "الاسم" },
      { id: "Name_En", label: "الاسم بالإنجليزية" },
      { id: "Sector_01", label: "القطاع" },
      { id: "Shape_Area", label: "المساحة" },
    ],
    sectors: [
      { id: "id", label: "المعرّف" },
      { id: "name", label: "الاسم" },
    ],
    infrastructure: [
      { id: "neighborhoodId", label: "معرّف الحي" },
      { id: "waterNetworkStatus", label: "شبكة المياه" },
      { id: "sewerageNetworkStatus", label: "شبكة الصرف الصحي" },
      { id: "electricityNetworkStatus", label: "شبكة الكهرباء" },
    ],
    services: [
      { id: "neighborhoodId", label: "معرّف الحي" },
      { id: "schoolsCount", label: "عدد المدارس" },
      { id: "hospitalsCount", label: "عدد المستشفيات" },
      { id: "parksCount", label: "عدد الحدائق" },
    ],
  };
}

/**
 * تحميل الحقول المتاحة للجدول المحدد
 * @param {string} tableName - اسم الجدول
 */
function loadFieldsForTable(tableName) {
  const queryFieldSelect = document.getElementById("queryFieldSelect");

  if (queryFieldSelect) {
    // إفراغ القائمة
    queryFieldSelect.innerHTML = '<option value="">اختر حقل...</option>';

    // إضافة الحقول المتاحة للجدول المحدد
    if (tableFields[tableName]) {
      tableFields[tableName].forEach((field) => {
        const option = document.createElement("option");
        option.value = field.id;
        option.textContent = field.label;
        queryFieldSelect.appendChild(option);
      });
    }
  }
}

/**
 * عرض قائمة بالقيم المحتملة للحقل المحدد مع واجهة محسنة
 */
function showValueList() {
  const tableSelect = document.getElementById("queryTableSelect");
  const fieldSelect = document.getElementById("queryFieldSelect");
  const valueInput = document.getElementById("queryValueInput");

  if (!tableSelect.value || !fieldSelect.value) {
    alert("الرجاء اختيار الجدول والحقل أولاً");
    return;
  }

  const table = tableSelect.value;
  const field = fieldSelect.value;
  const fieldLabel = getFieldLabel(table, field);

  // الحصول على القيم الفريدة للحقل
  let values = [];

  if (table === "neighborhoods" && typeof neighborhoodsData !== "undefined") {
    values = getUniqueValues(
      neighborhoodsData.features.map((f) => f.properties),
      field
    );
  } else if (table === "sectors" && typeof sectors !== "undefined") {
    values = getUniqueValues(sectors, field);
  } else if (
    table === "infrastructure" &&
    typeof infrastructureData !== "undefined"
  ) {
    values = getUniqueValues(infrastructureData, field);
  } else if (table === "services" && typeof servicesData !== "undefined") {
    values = getUniqueValues(servicesData, field);
  }

  if (values.length > 0) {
    // فرز القيم للعرض المنظم
    values.sort();

    // إنشاء محتوى محسن للحوار
    let valueListHTML = "";

    // إنشاء حقل بحث للقيم
    const searchInputHtml = `
      <div class="search-container" style="margin-bottom: 15px;">
        <input type="text" id="valueSearchInput" class="sidebar-input" placeholder="ابحث عن قيمة..." style="width: 100%;">
      </div>
    `;

    // تنظيم القيم في مصفوفة من الأزرار مع تصميم محسن
    valueListHTML += `
      <div class="value-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; max-height: 300px; overflow-y: auto; padding: 10px 5px;">
        ${values
          .map(
            (v) =>
              `<button class="value-option sidebar-button" style="margin: 0; padding: 8px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-value="${v}">${v}</button>`
          )
          .join("")}
      </div>
    `;

    const dialogContent = `
      <div class="value-selector-dialog" style="width: 90%; max-width: 600px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);">
        <div class="dialog-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
          <h3 style="margin: 0; color: var(--primary-color);">اختر قيمة للحقل: ${fieldLabel}</h3>
          <button class="close-dialog-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">&times;</button>
        </div>
        ${searchInputHtml}
        ${valueListHTML}
        <div class="dialog-footer" style="margin-top: 15px; display: flex; justify-content: flex-end; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          <button class="cancel-btn sidebar-button" style="margin: 0 5px;">إلغاء</button>
        </div>
      </div>
    `;

    // إنشاء عنصر الحوار المحسن
    const dialog = document.createElement("div");
    dialog.style.position = "fixed";
    dialog.style.top = "0";
    dialog.style.left = "0";
    dialog.style.width = "100%";
    dialog.style.height = "100%";
    dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    dialog.style.display = "flex";
    dialog.style.justifyContent = "center";
    dialog.style.alignItems = "center";
    dialog.style.zIndex = "2000";
    dialog.innerHTML = dialogContent;

    document.body.appendChild(dialog);

    // وظيفة تصفية القيم بناءً على النص المدخل
    const filterValues = (searchText) => {
      const valueButtons = dialog.querySelectorAll(".value-option");
      searchText = searchText.toLowerCase();

      valueButtons.forEach((btn) => {
        const value = btn.dataset.value.toLowerCase();
        if (value.includes(searchText)) {
          btn.style.display = "block";
        } else {
          btn.style.display = "none";
        }
      });
    };

    // إضافة الأحداث بعد إنشاء العناصر
    const searchInput = dialog.querySelector("#valueSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        filterValues(this.value);
      });
      // تركيز حقل البحث عند فتح الحوار
      setTimeout(() => searchInput.focus(), 100);
    }

    // إضافة أحداث النقر للخيارات
    const valueOptions = dialog.querySelectorAll(".value-option");
    valueOptions.forEach((option) => {
      option.addEventListener("click", function () {
        valueInput.value = this.dataset.value;
        document.body.removeChild(dialog);
      });
    });

    // إضافة حدث للزر إغلاق
    const closeBtn = dialog.querySelector(".close-dialog-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        document.body.removeChild(dialog);
      });
    }

    // إضافة حدث لزر الإلغاء
    const cancelBtn = dialog.querySelector(".cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        document.body.removeChild(dialog);
      });
    }

    // إغلاق الحوار عند النقر خارج المحتوى
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });
  } else {
    alert("لا توجد قيم متاحة لهذا الحقل");
  }
}

/**
 * الحصول على القيم الفريدة لحقل معين من مصفوفة
 * @param {Array} data - البيانات
 * @param {string} field - اسم الحقل
 * @return {Array} - القيم الفريدة
 */
function getUniqueValues(data, field) {
  const values = data
    .map((item) => item[field])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .filter((value, index, self) => self.indexOf(value) === index);

  return values;
}

/**
 * إضافة شرط استعلام جديد
 * @param {string} table - اسم الجدول
 * @param {string} field - اسم الحقل
 * @param {string} operator - العملية
 * @param {string} value - القيمة
 */
function addQueryCondition(table, field, operator, value) {
  // إنشاء معرّف فريد للشرط
  const id = Date.now();

  // إضافة الشرط إلى المصفوفة
  queryConditions.push({
    id,
    table,
    field,
    operator,
    value,
  });

  // عرض الشرط في واجهة المستخدم
  const queryConditionsElement = document.getElementById("queryConditions");

  if (queryConditionsElement) {
    const conditionElement = document.createElement("div");
    conditionElement.className = "query-condition";
    conditionElement.id = `condition-${id}`;

    conditionElement.innerHTML = `
      <div class="condition-text">
        <strong>${getFieldLabel(table, field)}</strong>
        ${getOperatorText(operator)}
        <span>${value || "فارغ"}</span>
      </div>
      <button class="condition-remove" data-id="${id}">
        <i class="fas fa-times"></i>
      </button>
    `;

    queryConditionsElement.appendChild(conditionElement);

    // إضافة حدث إزالة الشرط
    const removeButton = conditionElement.querySelector(".condition-remove");
    if (removeButton) {
      removeButton.addEventListener("click", function () {
        const conditionId = parseInt(this.getAttribute("data-id"));
        removeQueryCondition(conditionId);
      });
    }
  }
}

/**
 * إزالة شرط استعلام
 * @param {number} id - معرّف الشرط
 */
function removeQueryCondition(id) {
  // إزالة الشرط من المصفوفة
  queryConditions = queryConditions.filter((condition) => condition.id !== id);

  // إزالة الشرط من واجهة المستخدم
  const conditionElement = document.getElementById(`condition-${id}`);
  if (conditionElement) {
    conditionElement.remove();
  }
}

/**
 * الحصول على اسم الحقل المعروض
 * @param {string} table - اسم الجدول
 * @param {string} field - اسم الحقل
 * @return {string} - اسم الحقل المعروض
 */
function getFieldLabel(table, field) {
  if (tableFields[table]) {
    const fieldInfo = tableFields[table].find((f) => f.id === field);
    if (fieldInfo) {
      return fieldInfo.label;
    }
  }

  return field;
}

/**
 * ترجمة العملية إلى نص عربي
 * @param {string} operator - رمز العملية
 * @return {string} - النص العربي
 */
function getOperatorText(operator) {
  const translations = {
    "=": " يساوي ",
    "<>": " لا يساوي ",
    ">": " أكبر من ",
    "<": " أصغر من ",
    ">=": " أكبر من أو يساوي ",
    "<=": " أصغر من أو يساوي ",
    like: " يحتوي على ",
  };

  return translations[operator] || operator;
}

/**
 * تنفيذ الاستعلام بناءً على الشروط المحددة
 */
function executeQuery() {
  // تصفية النتائج السابقة من الخريطة
  clearHighlightedFeatures();

  // التحقق من وجود شروط
  if (queryConditions.length === 0) {
    alert("الرجاء إضافة شرط واحد على الأقل قبل تنفيذ الاستعلام");
    return;
  }

  // تنفيذ الاستعلام حسب نوع الطبقة
  const tables = [...new Set(queryConditions.map((c) => c.table))];

  queryResults = [];

  if (tables.includes("neighborhoods")) {
    const results = executeNeighborhoodQuery();
    queryResults = queryResults.concat(results);
    highlightNeighborhoods(results);
  }

  if (tables.includes("sectors")) {
    const results = executeSectorQuery();
    queryResults = queryResults.concat(results);
    highlightSectors(results);
  }

  if (tables.includes("infrastructure") || tables.includes("services")) {
    // هذه الاستعلامات ترتبط بالأحياء، لذا نحتاج إلى تحويلها إلى استعلامات أحياء
    const results = executeInfrastructureQuery();
    if (results.length > 0) {
      const relatedNeighborhoods = getRelatedNeighborhoods(results);
      queryResults = queryResults.concat(relatedNeighborhoods);
      highlightNeighborhoods(relatedNeighborhoods);
    }
  }

  if (tables.includes("service-sectors")) {
    const results = executeServiceSectorsQuery();
    queryResults = queryResults.concat(results);
    highlightServiceSectors(results);
  }

  // عرض النتائج
  displayQueryResults();

  // التكبير على النتائج
  zoomToQueryResults();
}

/**
 * تنفيذ الاستعلام على بيانات الأحياء
 * @return {Array} - نتائج الاستعلام
 */
function executeNeighborhoodQuery() {
  if (typeof neighborhoodsData === "undefined") {
    console.error("بيانات الأحياء غير متاحة");
    return [];
  }

  const neighborhoodConditions = queryConditions.filter(
    (c) => c.table === "neighborhoods"
  );

  if (neighborhoodConditions.length === 0) {
    return [];
  }

  return neighborhoodsData.features.filter((feature) => {
    return neighborhoodConditions.every((condition) => {
      const value = feature.properties[condition.field];
      const conditionValue = condition.value;

      switch (condition.operator) {
        case "=":
          return String(value) === String(conditionValue);
        case "<>":
          return String(value) !== String(conditionValue);
        case ">":
          return Number(value) > Number(conditionValue);
        case "<":
          return Number(value) < Number(conditionValue);
        case ">=":
          return Number(value) >= Number(conditionValue);
        case "<=":
          return Number(value) <= Number(conditionValue);
        case "like":
          return String(value).includes(conditionValue);
        default:
          return true;
      }
    });
  });
}

/**
 * تنفيذ الاستعلام على بيانات القطاعات
 * @return {Array} - نتائج الاستعلام
 */
function executeSectorQuery() {
  if (typeof sectors === "undefined") {
    console.error("بيانات القطاعات غير متاحة");
    return [];
  }

  const sectorConditions = queryConditions.filter((c) => c.table === "sectors");

  if (sectorConditions.length === 0) {
    return [];
  }

  return sectors.filter((sector) => {
    return sectorConditions.every((condition) => {
      const value = sector[condition.field];
      const conditionValue = condition.value;

      switch (condition.operator) {
        case "=":
          return String(value) === String(conditionValue);
        case "<>":
          return String(value) !== String(conditionValue);
        case ">":
          return Number(value) > Number(conditionValue);
        case "<":
          return Number(value) < Number(conditionValue);
        case ">=":
          return Number(value) >= Number(conditionValue);
        case "<=":
          return Number(value) <= Number(conditionValue);
        case "like":
          return String(value).includes(conditionValue);
        default:
          return true;
      }
    });
  });
}

/**
 * تنفيذ الاستعلام على بيانات البنية التحتية والخدمات
 * @return {Array} - نتائج الاستعلام
 */
function executeInfrastructureQuery() {
  const infraConditions = queryConditions.filter(
    (c) => c.table === "infrastructure" || c.table === "services"
  );

  if (infraConditions.length === 0) {
    return [];
  }

  let results = [];

  // تنفيذ استعلامات البنية التحتية
  if (
    typeof infrastructureData !== "undefined" &&
    infraConditions.some((c) => c.table === "infrastructure")
  ) {
    const infraResults = infrastructureData.filter((item) => {
      return infraConditions
        .filter((c) => c.table === "infrastructure")
        .every((condition) => {
          const value = item[condition.field];
          const conditionValue = condition.value;

          switch (condition.operator) {
            case "=":
              return String(value) === String(conditionValue);
            case "<>":
              return String(value) !== String(conditionValue);
            case "like":
              return String(value).includes(conditionValue);
            default:
              return true;
          }
        });
    });

    results = results.concat(infraResults);
  }

  // تنفيذ استعلامات الخدمات
  if (
    typeof servicesData !== "undefined" &&
    infraConditions.some((c) => c.table === "services")
  ) {
    const serviceResults = servicesData.filter((item) => {
      return infraConditions
        .filter((c) => c.table === "services")
        .every((condition) => {
          const value = item[condition.field];
          const conditionValue = condition.value;

          switch (condition.operator) {
            case "=":
              return String(value) === String(conditionValue);
            case "<>":
              return String(value) !== String(conditionValue);
            case ">":
              return Number(value) > Number(conditionValue);
            case "<":
              return Number(value) < Number(conditionValue);
            case ">=":
              return Number(value) >= Number(conditionValue);
            case "<=":
              return Number(value) <= Number(conditionValue);
            default:
              return true;
          }
        });
    });

    results = results.concat(serviceResults);
  }

  return results;
}

/**
 * الحصول على الأحياء المرتبطة ببيانات البنية التحتية/الخدمات
 * @param {Array} results - نتائج استعلام البنية التحتية/الخدمات
 * @return {Array} - الأحياء المرتبطة
 */
function getRelatedNeighborhoods(results) {
  if (typeof neighborhoodsData === "undefined") {
    console.error("بيانات الأحياء غير متاحة");
    return [];
  }

  const neighborhoodIds = [...new Set(results.map((r) => r.neighborhoodId))];

  return neighborhoodsData.features.filter((feature) =>
    neighborhoodIds.includes(feature.properties.ID)
  );
}

/**
 * تسليط الضوء على الأحياء في نتائج الاستعلام
 * @param {Array} neighborhoods - الأحياء المراد تسليط الضوء عليها
 */
function highlightNeighborhoods(neighborhoods) {
  if (!map) return;

  neighborhoods.forEach((neighborhood) => {
    // إنشاء نسخة من الحدود لتسليط الضوء عليها
    const highlightedFeature = L.geoJSON(neighborhood, {
      style: {
        color: "#ff6b6b",
        weight: 4,
        fillColor: "#ff6b6b",
        fillOpacity: 0.4,
        opacity: 1,
      },
    });

    // إضافة التسمية للمعلم المسلط عليه الضوء
    const name =
      neighborhood.properties.Names ||
      neighborhood.properties.Name_En ||
      "حي رقم " + neighborhood.properties.ID;

    // إضافة النقر لعرض المعلومات
    highlightedFeature.on("click", function () {
      showNeighborhoodInfo(neighborhood.properties);
    });

    // إضافة إلى الخريطة
    highlightedFeature.addTo(map);

    // تخزين المعلم المسلط عليه الضوء
    highlightedFeatures.push({
      layer: highlightedFeature,
      type: "neighborhood",
      name: name,
      data: neighborhood,
    });
  });
}

/**
 * تسليط الضوء على القطاعات في نتائج الاستعلام
 * @param {Array} sectors - القطاعات المراد تسليط الضوء عليها
 */
function highlightSectors(sectors) {
  if (!map) return;

  // استخدام العناصر الموجودة في طبقة القطاعات
  if (sectorsLayer) {
    const sectorIds = sectors.map((s) => s.id);

    sectorsLayer.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        // التحقق من أن المضلع يمثل قطاعًا من النتائج
        const sectorId = layer.options.className?.split("-")[1];

        if (sectorId && sectorIds.includes(parseInt(sectorId))) {
          // نسخ المضلع وتغيير نمطه
          const highlightedFeature = L.polygon(layer.getLatLngs(), {
            color: "#ff6b6b",
            weight: 4,
            fillColor: "#ff6b6b",
            fillOpacity: 0.4,
            opacity: 1,
          });

          // إضافة إلى الخريطة
          highlightedFeature.addTo(map);

          // تخزين المعلم المسلط عليه الضوء
          const sector = sectors.find((s) => s.id === parseInt(sectorId));
          highlightedFeatures.push({
            layer: highlightedFeature,
            type: "sector",
            name: sector.name,
            data: sector,
          });
        }
      }
    });
  }
}

/**
 * إزالة تسليط الضوء عن العناصر السابقة
 */
function clearHighlightedFeatures() {
  if (!map) return;

  highlightedFeatures.forEach((item) => {
    map.removeLayer(item.layer);
  });

  highlightedFeatures = [];
}

/**
 * عرض نتائج الاستعلام في لوحة النتائج
 */
function displayQueryResults() {
  const queryResultsElement = document.getElementById("queryResults");

  if (!queryResultsElement) return;

  if (queryResults.length === 0) {
    queryResultsElement.innerHTML =
      '<div class="empty-state">لم يتم العثور على نتائج مطابقة</div>';
    return;
  }

  let resultsHtml = "";

  // تخزين الأنواع المختلفة من النتائج
  const neighborhoods = highlightedFeatures.filter(
    (f) => f.type === "neighborhood"
  );
  const sectors = highlightedFeatures.filter((f) => f.type === "sector");

  // إضافة قسم النتائج للأحياء
  if (neighborhoods.length > 0) {
    resultsHtml += `
      <div class="result-section">
        <h4>الأحياء (${neighborhoods.length})</h4>
        <div class="result-list">
          ${neighborhoods
            .map(
              (n) => `
            <div class="result-item" data-type="${n.type}" data-id="${n.data.properties.ID}">
              <span>${n.name}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // إضافة قسم النتائج للقطاعات
  if (sectors.length > 0) {
    resultsHtml += `
      <div class="result-section">
        <h4>القطاعات (${sectors.length})</h4>
        <div class="result-list">
          ${sectors
            .map(
              (s) => `
            <div class="result-item" data-type="${s.type}" data-id="${s.data.id}">
              <span>${s.name}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // إضافة قسم النتائج لدوائر الخدمات
  const serviceSectors = highlightedFeatures.filter(
    (f) => f.type === "service-sector"
  );
  if (serviceSectors.length > 0) {
    resultsHtml += `
      <div class="result-section">
        <h4>دوائر الخدمات (${serviceSectors.length})</h4>
        <div class="result-list">
          ${serviceSectors
            .map(
              (s) => `
            <div class="result-item" data-type="${s.type}" data-id="${s.data.properties.OBJECTID}">
              <span>${s.name}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // إضافة أزرار لتصدير وطباعة النتائج
  resultsHtml += `
    <div style="margin-top: 15px; display: flex; gap: 10px;">
      <button id="exportResultsBtn" class="sidebar-button">
        <i class="fas fa-file-export"></i> تصدير النتائج
      </button>
      <button id="printResultsBtn" class="sidebar-button">
        <i class="fas fa-print"></i> طباعة النتائج
      </button>
    </div>
  `;

  queryResultsElement.innerHTML = resultsHtml;

  // إضافة أحداث النقر لعناصر النتائج
  const resultItems = queryResultsElement.querySelectorAll(".result-item");
  resultItems.forEach((item) => {
    item.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      const id = this.getAttribute("data-id");

      zoomToResultItem(type, id);
    });
  });

  // إضافة حدث لزر تصدير النتائج
  const exportResultsBtn = document.getElementById("exportResultsBtn");
  if (exportResultsBtn) {
    exportResultsBtn.addEventListener("click", function () {
      exportQueryResults();
    });
  }

  // إضافة حدث لزر طباعة النتائج
  const printResultsBtn = document.getElementById("printResultsBtn");
  if (printResultsBtn) {
    printResultsBtn.addEventListener("click", function () {
      printQueryResults();
    });
  }
}

/**
 * التكبير على نتائج الاستعلام
 */
function zoomToQueryResults() {
  if (!map || highlightedFeatures.length === 0) return;

  const validLayers = highlightedFeatures
    .map((f) => f.layer)
    .filter((layer) => layer);
  if (validLayers.length > 0) {
    const group = L.featureGroup(validLayers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
}

/**
 * التكبير على عنصر محدد من النتائج
 * @param {string} type - نوع العنصر
 * @param {string} id - معرّف العنصر
 */
function zoomToResultItem(type, id) {
  if (!map) return;

  if (type === "neighborhood") {
    const feature = highlightedFeatures.find(
      (f) => f.type === "neighborhood" && f.data.properties.ID === parseInt(id)
    );

    if (feature) {
      // التكبير على الحي
      map.fitBounds(feature.layer.getBounds(), { padding: [50, 50] });

      // عرض معلومات الحي
      showNeighborhoodInfo(feature.data.properties);
    }
  } else if (type === "sector") {
    const feature = highlightedFeatures.find(
      (f) => f.type === "sector" && f.data.id === parseInt(id)
    );

    if (feature) {
      // التكبير على القطاع
      map.fitBounds(feature.layer.getBounds(), { padding: [50, 50] });

      // عرض معلومات القطاع
      showSectorInfo(feature.data);
    }
  }
}

/**
 * تصدير نتائج الاستعلام
 */
function exportQueryResults() {
  if (queryResults.length === 0) {
    alert("لا توجد نتائج للتصدير");
    return;
  }

  // إنشاء بيانات التصدير
  const exportData = {
    query: {
      conditions: queryConditions.map((c) => ({
        table: c.table,
        field: getFieldLabel(c.table, c.field),
        operator: getOperatorText(c.operator),
        value: c.value,
      })),
    },
    results: {
      neighborhoods: highlightedFeatures
        .filter((f) => f.type === "neighborhood")
        .map((n) => ({
          id: n.data.properties.ID,
          name: n.name,
          sector: n.data.properties.Sector_01,
          area: (n.data.properties.Shape_Area / 1000000).toFixed(2) + " كم²",
        })),
      sectors: highlightedFeatures
        .filter((f) => f.type === "sector")
        .map((s) => ({
          id: s.data.id,
          name: s.name,
        })),
    },
    exportDate: new Date().toLocaleString("ar-SA"),
  };

  // تحويل البيانات إلى نص JSON
  const jsonData = JSON.stringify(exportData, null, 2);

  // إنشاء ملف للتحميل
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    "query_results_" + new Date().toISOString().split("T")[0] + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * طباعة نتائج الاستعلام
 */
function printQueryResults() {
  if (queryResults.length === 0) {
    alert("لا توجد نتائج للطباعة");
    return;
  }

  // استخراج معلومات النتائج
  const neighborhoods = highlightedFeatures.filter(
    (f) => f.type === "neighborhood"
  );
  const sectors = highlightedFeatures.filter((f) => f.type === "sector");

  // إنشاء صفحة الطباعة
  const printWindow = window.open("", "_blank");

  // تحضير HTML للطباعة
  let printContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>نتائج الاستعلام - طباعة</title>
      <style>
        body {
          font-family: 'Noto Naskh Arabic', sans-serif;
          padding: 20px;
          direction: rtl;
        }
        h1, h2, h3 {
          color: #1e40af;
        }
        .query-info {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .result-section {
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 10px;
          border: 1px solid #e5e7eb;
          text-align: right;
        }
        th {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body {
            font-size: 12pt;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button id="printBtn" style="padding: 8px 16px; background-color: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">
        طباعة التقرير
      </button>
      
      <h1>نتائج الاستعلام</h1>
      <div class="query-info">
        <h3>معايير الاستعلام:</h3>
        <ul>
          ${queryConditions
            .map(
              (c) => `
            <li>
              <strong>${getFieldLabel(c.table, c.field)}</strong>
              ${getOperatorText(c.operator)}
              ${c.value || "فارغ"}
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
  `;

  // إضافة نتائج الأحياء إذا كانت موجودة
  if (neighborhoods.length > 0) {
    printContent += `
      <div class="result-section">
        <h2>الأحياء (${neighborhoods.length})</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>القطاع</th>
              <th>المساحة</th>
            </tr>
          </thead>
          <tbody>
            ${neighborhoods
              .map(
                (n, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${n.name}</td>
                <td>${n.data.properties.Sector_01 || "غير محدد"}</td>
                <td>${(n.data.properties.Shape_Area / 1000000).toFixed(
                  2
                )} كم²</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // إضافة نتائج القطاعات إذا كانت موجودة
  if (sectors.length > 0) {
    printContent += `
      <div class="result-section">
        <h2>القطاعات (${sectors.length})</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>المعرف</th>
            </tr>
          </thead>
          <tbody>
            ${sectors
              .map(
                (s, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${s.name}</td>
                <td>${s.data.id}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // إضافة تذييل الصفحة
  printContent += `
      <div class="footer">
        <p>تم إنشاء هذا التقرير في: ${new Date().toLocaleString("ar-SA")}</p>
        <p>تطبيق تحليل أحياء حلب</p>
      </div>
      
      <script>
        document.getElementById('printBtn').addEventListener('click', function() {
          this.style.display = 'none';
          window.print();
          setTimeout(() => { this.style.display = 'block'; }, 1000);
        });
      </script>
    </body>
    </html>
  `;

  // كتابة المحتوى إلى نافذة الطباعة
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
}

/**
 * تنفيذ الاستعلام على بيانات دوائر الخدمات
 * @return {Array} - نتائج الاستعلام
 */
function executeServiceSectorsQuery() {
  if (
    typeof serviceSectorsData === "undefined" ||
    !serviceSectorsData.features
  ) {
    console.error("بيانات دوائر الخدمات غير متاحة");
    return [];
  }

  const conditions = queryConditions.filter(
    (c) => c.table === "service-sectors"
  );
  if (conditions.length === 0) return [];
  return serviceSectorsData.features.filter((feature) => {
    return conditions.every((condition) => {
      const value = feature.properties[condition.field];
      const conditionValue = condition.value;
      switch (condition.operator) {
        case "=":
          return String(value) === String(conditionValue);
        case "<>":
          return String(value) !== String(conditionValue);
        case ">":
          return Number(value) > Number(conditionValue);
        case "<":
          return Number(value) < Number(conditionValue);
        case ">=":
          return Number(value) >= Number(conditionValue);
        case "<=":
          return Number(value) <= Number(conditionValue);
        case "like":
          return String(value).includes(conditionValue);
        default:
          return true;
      }
    });
  });
  console.log("Querying service-sectors with conditions:", conditions);
  console.log(
    "First feature properties:",
    serviceSectorsData.features[0]?.properties
  );
}

/**
 * تسليط الضوء على دوائر الخدمات في نتائج الاستعلام
 * @param {Array} serviceSectors - دوائر الخدمات المراد تسليط الضوء عليها
 */
function highlightServiceSectors(serviceSectors) {
  if (!map) return;

  serviceSectors.forEach((feature) => {
    // Create a highlighted Leaflet layer for the service sector
    const highlightedFeature = L.geoJSON(feature, {
      style: {
        color: "#ff6b6b",
        weight: 4,
        fillColor: "#ff6b6b",
        fillOpacity: 0.4,
        opacity: 1,
      },
    });

    // Optional: Add a popup or click event to show info
    highlightedFeature.on("click", function () {
      if (typeof showServiceSectorInfo === "function") {
        showServiceSectorInfo(feature.properties);
      }
    });

    // Add to map
    highlightedFeature.addTo(map);

    // Store in highlightedFeatures for zooming and results
    highlightedFeatures.push({
      layer: highlightedFeature,
      type: "service-sector",
      name: feature.properties.Name,
      data: feature,
    });
  });
}
