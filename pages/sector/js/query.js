/**
 * query.js
 * manages the query and analysis functions for the application
 */

// global variables for the queries
let queryConditions = [];
let queryResults = [];
let highlightedFeatures = [];
let tableFields = {};

// initialize the query builder when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  initQueryBuilder();
});

/**
 * initialize the query builder
 */
function initQueryBuilder() {
  const queryTableSelect = document.getElementById("queryTableSelect");
  const queryFieldSelect = document.getElementById("queryFieldSelect");
  const queryOperatorSelect = document.getElementById("queryOperatorSelect");
  const queryValueInput = document.getElementById("queryValueInput");
  const valueListBtn = document.getElementById("valueListBtn");
  const addConditionBtn = document.getElementById("addConditionBtn");
  const runQueryBtn = document.getElementById("runQueryBtn");

  // define the fields for each table
  defineTableFields();

  // set the change and click events
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
 * define the fields for each table
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
 * load the fields for the specified table
 * @param {string} tableName - the name of the table
 */
function loadFieldsForTable(tableName) {
  const queryFieldSelect = document.getElementById("queryFieldSelect");

  if (queryFieldSelect) {
    // clear the list
    queryFieldSelect.innerHTML = '<option value="">اختر حقل...</option>';

    // add the fields for the specified table
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
 * show a list of possible values for the specified field with a better interface
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

  // get the unique values for the field
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
    // sort the values for the better display
    values.sort();

    // create the better content for the dialog
    let valueListHTML = "";

    // create the search field for the values
    const searchInputHtml = `
      <div class="value-selector-search">
        <input type="text" id="valueSearchInput" class="search-input" placeholder="ابحث عن قيمة...">
      </div>
    `;

    // organize the values in an array of buttons with a better design
    valueListHTML += `
      <div class="value-selector-container">
        ${values
        .map(
          (v) =>
            `<div class="value-item value-option" data-value="${v}">
              <span class="value-text">${v}</span>
              <i class="fas fa-check"></i>
            </div>`
        )
        .join("")}
      </div>
    `;

    const dialogContent = `
      <div class="value-selector-content">
        <div class="value-selector-header">
          <h3>اختر قيمة للحقل: ${fieldLabel}</h3>
          <button class="close-btn close-dialog-btn">&times;</button>
        </div>
        ${searchInputHtml}
        ${valueListHTML}
        <div class="value-selector-footer">
          <button class="cancel-btn">إلغاء</button>
        </div>
      </div>
    `;

    // create the better dialog element
    const dialog = document.createElement("div");
    dialog.className = "value-selector-dialog";
    dialog.innerHTML = dialogContent;

    document.body.appendChild(dialog);

    // function to filter the values based on the entered text
    const filterValues = (searchText) => {
      const valueItems = dialog.querySelectorAll(".value-option");
      searchText = searchText.toLowerCase();

      valueItems.forEach((item) => {
        const value = item.dataset.value.toLowerCase();
        if (value.includes(searchText)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    };

    // add the events after creating the elements
    const searchInput = dialog.querySelector("#valueSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        filterValues(this.value);
      });
      // focus the search field when the dialog is opened
      setTimeout(() => searchInput.focus(), 100);
    }

    // add the click events for the options
    const valueOptions = dialog.querySelectorAll(".value-option");
    valueOptions.forEach((option) => {
      option.addEventListener("click", function () {
        valueInput.value = this.dataset.value;
        dialog.remove();
      });
    });

    // add the close button event
    const closeBtn = dialog.querySelector(".close-dialog-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dialog.remove();
      });
    }

    // add the cancel button event
    const cancelBtn = dialog.querySelector(".cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        dialog.remove();
      });
    }

    // close the dialog when clicking outside the content
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
  } else {
    alert("لا توجد قيم متاحة لهذا الحقل");
  }
}

/**
 * get the unique values for the specified field from an array
 * @param {Array} data - the data array
 * @param {string} field - the field name
 * @return {Array} - the unique values
 */
function getUniqueValues(data, field) {
  const values = data
    .map((item) => item[field])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .filter((value, index, self) => self.indexOf(value) === index);

  return values;
}

/**
 * add a new query condition
 * @param {string} table - the name of the table
 * @param {string} field - the field name
 * @param {string} operator - the operator
 * @param {string} value - the value
 */
function addQueryCondition(table, field, operator, value) {
  // create a unique id for the condition
  const id = Date.now();

  // add the condition to the array
  queryConditions.push({
    id,
    table,
    field,
    operator,
    value,
  });

  // display the condition in the user interface
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

    // add the remove condition event
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
 * remove a query condition
 * @param {number} id - the id of the condition
 */
function removeQueryCondition(id) {
  // remove the condition from the array
  queryConditions = queryConditions.filter((condition) => condition.id !== id);

  // remove the condition from the user interface
  const conditionElement = document.getElementById(`condition-${id}`);
  if (conditionElement) {
    conditionElement.remove();
  }
}

/**
 * get the label of the specified field
 * @param {string} table - the name of the table
 * @param {string} field - the field name
 * @return {string} - the label of the field
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
 * translate the operator to a text
 * @param {string} operator - the operator
 * @return {string} - the translated operator
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
 * execute the query based on the specified conditions
 */
function executeQuery() {
  // clear the highlighted features from the map
  clearHighlightedFeatures();

  // check if there are any conditions
  if (queryConditions.length === 0) {
    alert("الرجاء إضافة شرط واحد على الأقل قبل تنفيذ الاستعلام");
    return;
  }

  // execute the query based on the type of layer
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
    // these queries are related to the neighborhoods, so we need to convert them to neighborhood queries
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

  // display the results
  displayQueryResults();

  // zoom to the results
  zoomToQueryResults();
}

/**
 * execute the query on the neighborhoods data
 * @return {Array} - the query results
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
 * execute the query on the sectors data
 * @return {Array} - the query results
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
 * execute the query on the infrastructure and services data
 * @return {Array} - the query results
 */
function executeInfrastructureQuery() {
  const infraConditions = queryConditions.filter(
    (c) => c.table === "infrastructure" || c.table === "services"
  );

  if (infraConditions.length === 0) {
    return [];
  }

  let results = [];

  // execute the infrastructure queries
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

  // execute the services queries
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
 * get the neighborhoods related to the infrastructure and services data
 * @param {Array} results - the query results
 * @return {Array} - the related neighborhoods
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
 * highlight the neighborhoods in the query results
 * @param {Array} neighborhoods - the neighborhoods to highlight
 */
function highlightNeighborhoods(neighborhoods) {
  if (!map) return;

  neighborhoods.forEach((neighborhood) => {
    // create a copy of the borders to highlight
    const highlightedFeature = L.geoJSON(neighborhood, {
      style: {
        color: "#ff6b6b",
        weight: 4,
        fillColor: "#ff6b6b",
        fillOpacity: 0.4,
        opacity: 1,
      },
    });

    // add the label to the highlighted feature
    const name =
      neighborhood.properties.Names ||
      neighborhood.properties.Name_En ||
      "حي رقم " + neighborhood.properties.ID;

    // add the click event to display the information
    highlightedFeature.on("click", function () {
      showNeighborhoodInfo(neighborhood.properties);
    });

    // add to the map
    highlightedFeature.addTo(map);

    // store the highlighted feature
    highlightedFeatures.push({
      layer: highlightedFeature,
      type: "neighborhood",
      name: name,
      data: neighborhood,
    });
  });
}

/**
 * highlight the sectors in the query results
 * @param {Array} sectors - the sectors to highlight
 */
function highlightSectors(sectors) {
  if (!map) return;

  // use the elements in the sectors layer
  if (sectorsLayer) {
    const sectorIds = sectors.map((s) => s.id);

    sectorsLayer.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        // check if the polygon represents a sector from the results
        const sectorId = layer.options.className?.split("-")[1];

        if (sectorId && sectorIds.includes(parseInt(sectorId))) {
          // create a copy of the polygon and change the style
          const highlightedFeature = L.polygon(layer.getLatLngs(), {
            color: "#ff6b6b",
            weight: 4,
            fillColor: "#ff6b6b",
            fillOpacity: 0.4,
            opacity: 1,
          });

          // add to the map
          highlightedFeature.addTo(map);

          // store the highlighted feature
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
 * remove the highlighted features
 */
function clearHighlightedFeatures() {
  if (!map) return;

  highlightedFeatures.forEach((item) => {
    map.removeLayer(item.layer);
  });

  highlightedFeatures = [];
}

/**
 * display the query results in the results panel
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

  // store the different types of results
  const neighborhoods = highlightedFeatures.filter(
    (f) => f.type === "neighborhood"
  );
  const sectors = highlightedFeatures.filter((f) => f.type === "sector");

  // add the results section for the neighborhoods
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

  // add the results section for the sectors
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

  // add the results section for the service sectors
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

  // add the buttons for exporting and printing the results
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

  // add the click events for the result items
  const resultItems = queryResultsElement.querySelectorAll(".result-item");
  resultItems.forEach((item) => {
    item.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      const id = this.getAttribute("data-id");

      zoomToResultItem(type, id);
    });
  });

  // add the click event for the export results button
  const exportResultsBtn = document.getElementById("exportResultsBtn");
  if (exportResultsBtn) {
    exportResultsBtn.addEventListener("click", function () {
      exportQueryResults();
    });
  }

  // add the click event for the print results button
  const printResultsBtn = document.getElementById("printResultsBtn");
  if (printResultsBtn) {
    printResultsBtn.addEventListener("click", function () {
      printQueryResults();
    });
  }
}

/**
 * zoom to the query results
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
 * zoom to the specified result item
 * @param {string} type - the type of the result item
 * @param {string} id - the id of the result item
 */
function zoomToResultItem(type, id) {
  if (!map) return;

  if (type === "neighborhood") {
    const feature = highlightedFeatures.find(
      (f) => f.type === "neighborhood" && f.data.properties.ID === parseInt(id)
    );

    if (feature) {
      // zoom to the neighborhood
      map.fitBounds(feature.layer.getBounds(), { padding: [50, 50] });

      // display the neighborhood information
      showNeighborhoodInfo(feature.data.properties);
    }
  } else if (type === "sector") {
    const feature = highlightedFeatures.find(
      (f) => f.type === "sector" && f.data.id === parseInt(id)
    );

    if (feature) {
      // zoom to the sector
      map.fitBounds(feature.layer.getBounds(), { padding: [50, 50] });

      // display the sector information
      showSectorInfo(feature.data);
    }
  }
}

/**
  * export the query results
 */
function exportQueryResults() {
  if (queryResults.length === 0) {
    alert("لا توجد نتائج للتصدير");
    return;
  }

  // create the export data
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

  // convert the data to JSON
  const jsonData = JSON.stringify(exportData, null, 2);

  // create a file for the download
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
 * print the query results
 */
function printQueryResults() {
  if (queryResults.length === 0) {
    alert("لا توجد نتائج للطباعة");
    return;
  }

  // extract the information of the results
  const neighborhoods = highlightedFeatures.filter(
    (f) => f.type === "neighborhood"
  );
  const sectors = highlightedFeatures.filter((f) => f.type === "sector");

  // create the print window
  const printWindow = window.open("", "_blank");

  // prepare the HTML for the print
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

  // add the results of the neighborhoods if they exist
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

  // add the results of the sectors if they exist
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

  // add the footer of the page
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

  // write the content to the print window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
}

/**
 * execute the query on the service sectors data
 * @return {Array} - the query results
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
 * highlight the service sectors in the query results
 * @param {Array} serviceSectors - the service sectors to highlight
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

    // add to the map
    highlightedFeature.addTo(map);

    // store in highlightedFeatures for zooming and results
    highlightedFeatures.push({
      layer: highlightedFeature,
      type: "service-sector",
      name: feature.properties.Name,
      data: feature,
    });
  });
}
