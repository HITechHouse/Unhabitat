// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Function to handle zoom level changes
  function handleZoom() {
    const sidenav = document.getElementById("sidenav-main");
    const windowWidth = window.innerWidth;
    const zoomLevel = window.devicePixelRatio;

    if (zoomLevel > 1.51 || windowWidth < 1200) {
      sidenav.style.display = "none";
    } else {
      sidenav.style.display = "block";
    }
  }

  // Initial check
  handleZoom();

  // Listen for zoom changes
  window.addEventListener("resize", handleZoom);
});

const translations = {
  ar: {
    dir: "rtl",
    dashboard: "لوحة التحكم",
    configTables: "جداول الإعدادات",
    maps: "الخرائط",
    manageUsers: "إدارة المستخدمين ",
    profile: "الملف الشخصي",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    families: "عدد الأسر",
    validBuildings: "منشآت صالحة",
    residentialBuildings: "منشآت سكنية",
    threatened: "مهددة بالإزالة",
    constructionStatus: "الوضع الإنشائي",
    educationStatus: "الوضع التعليمي",
    healthStatus: "الوضع الصحي",
    footerText: "© 2025، جميع الحقوق محفوظة،",
    companyName: "دار التقنية الحديثة",
    settingsText: "الإعدادات",
    logoutText: "تسجيل الخروج",
    standards: "المعايير",
    neighborhoodCommittees: "إدارة لجان الأحياء",
    developmentCommittees: "إدارة لجان التنمية",
    projectsOverview: "نظرة عامة على المشاريع",
    moreIn2024: "زيادة بنسبة 4% في 2024",
    projectCompletion: "معدل إكمال المشاريع في حلب",
    foodProjects: "مشاريع الغذاء",
    healthProjects: "مشاريع الصحة",
    clothingProjects: "مشاريع الملابس والمساعدات السكنية",
    viewAllProjects: "عرض جميع المشاريع",
    projects: "المشاريع",
    projectName: "اسم المشروع",
    type: "النوع",
    budget: "الميزانية",
    status: "الحالة",
    projectOrders: "طلبات المشاريع",
    thisMonth: "هذا الشهر",
    operationalStatuses: "الحالة التشغيلية",
    interventionPriorities: "أولوية التدخل",
    infrastructureStatuses: "حالة البنية التحتية",
    staffStatuses: "حالات الموظفين",
    consumablesStatuses: "حالات المستهلكات",
    damageLevels: "مستوى الضرر",
    networkStatuses: "حالة الشبكة",
    supplyOperationLevel: "مستويات تشغيل خطوط الإمداد",
    ownershipDocumentationTypes: "نوع التوثيق والحماية",
    damageDescriptions: "أوصاف الضرر",
    ownershipTypes: "نوع الملكية السائد",
    urbanConditions: "الحالة العمرانية",
    dominantLandUses: "الوظيفة العمرانية السائدة",
    humanNeedsTypes: "أنواع الاحتياجات البشرية",
    neighborhoods: "ادارة وتعريف الاحياء",
    humanitarianInterventionsTypes: "أنواع التدخلات الإنسانية",
    urbanClassifications: "التصنيف الإداري",
    administrativeClassifications: "الصفة الإدارية",
    conditions: "الحالات العامة",
    infrastructureConditions: "شروط البنية التحتية",
    workersConditions: "شروط العاملين",
    consumablesConditions: "شروط المستهلكات",
    transportationMobilityTypes: "أسماء النقل والتنقل",
    mobilityCentersTypes: "مرافق النقل",
    suppliesNames: "أسماء المؤون والبضائع",
    operationStatuses: "الحالة التشغيلية",
    healthServiceFacilities: "مرافق الخدمة الصحية",
    infrastructureStatusesArchitectural: "حالات البنية التحتية المعمارية",
    availabilityStatuses: "واقع الكادر أو العاملون والمستهلكات",
    infrastructureFacilities: "مرافق البنية التحتية",
    administrativeServicesNames: "أسماء الخدمات الإدارية",
    otherServicesNames: "أسماء الخدمات الأخرى",
    facilityTypes: "أنواع المنشآت",
    participationTypes: "أنواع المشاركة",
    potentialPartners: "أسماء الشركاء المحتملين للوحدات الإدارية",
    marketTypes: "أنواع الأسواق",
    randomLocations: "المواقع العشوائية",
    streetCleanlinessLevels: "مستويات نظافة الشوارع",
    insectControls: "مكافحة الحشرات",
    rubbleRemovals: "إزالة الأنقاض",
    committeeRoles: "أدوار اللجنة",
    coordinationType: "أنواع التنسيق",
    needItems: "عناصر الاحتياج",
    addNew: "إضافة جديد",
    actions: "إجراءات",
  },
  en: {
    standards: "Standards",
    neighborhoodCommittees: "Neighborhood Comm",
    developmentCommittees: "Development Comm",
    dir: "ltr",
    dashboard: "Dashboard",
    configTables: "Configuration Tables",
    maps: "Maps",
    manageUsers: "Manage Users",
    profile: "Profile",
    signIn: "Sign In",
    signUp: "Sign Up",
    families: "Families",
    validBuildings: "Valid Buildings",
    residentialBuildings: "Residential Buildings",
    threatened: "Threatened with Removal",
    constructionStatus: "Construction Status",
    educationStatus: "Education Status",
    healthStatus: "Health Status",
    footerText: "© 2025, All rights reserved,",
    companyName: "Hi-Tech House",
    settingsText: "Settings",
    logoutText: "Logout",
    projectsOverview: "Projects Foods And Health overview",
    moreIn2024: "4% more in 2024",
    projectCompletion: "Project completion rate in Aleppo",
    foodProjects: "Food Projects",
    healthProjects: "Health Projects",
    clothingProjects: "Clothing and housing benefits Projects",
    viewAllProjects: "View all Projects",
    projects: "Projects",
    projectName: "NAME OF PROJECT",
    type: "TYPE",
    budget: "BUDGET",
    status: "STATUS",
    projectOrders: "Projects Orders overview",
    thisMonth: "this month",
    operationalStatuses: "Operation Statuses",
    interventionPriorities: "Intervention Priorities",
    infrastructureStatuses: "Infrastructure Statuses",
    staffStatuses: "Staff Statuses",
    consumablesStatuses: "Consumables Statuses",
    damageLevels: "Damage Levels",
    networkStatuses: "Network Statuses",
    supplyOperationLevel: "Supply Operation Levels",
    ownershipDocumentationTypes: "Ownership Documentation Types",
    damageDescriptions: "Damage Descriptions",
    ownershipTypes: "Ownership Types",
    urbanConditions: "Urban Conditions",
    dominantLandUses: "Dominant Land Uses",
    humanNeedsTypes: "Human Needs Types",
    neighborhoods: "Neighborhoods",
    humanitarianInterventionsTypes: "Humanitarian Interventions Types",
    urbanClassifications: "Urban Classifications",
    administrativeClassifications: "Administrative Classifications",
    conditions: "General Conditions",
    infrastructureConditions: "Infrastructure Conditions",
    workersConditions: "Workers Conditions",
    consumablesConditions: "Consumables Conditions",
    transportationMobilityTypes: "Transportation Mobility Types",
    mobilityCentersTypes: "Mobility Centers Types",
    suppliesNames: "Supplies Names",
    operationStatuses: "Operation Statuses",
    healthServiceFacilities: "Health Service Facilities",
    infrastructureStatusesArchitectural:
      "Infrastructure Architectural Statuses",
    availabilityStatuses: "Availability Statuses",
    infrastructureFacilities: "Infrastructure Facilities",
    administrativeServicesNames: "Administrative Services Names",
    otherServicesNames: "Other Services Names",
    facilityTypes: "Facility Types",
    participationTypes: "Participation Types",
    potentialPartners: "Potential Partners",
    marketTypes: "Market Types",
    randomLocations: "Random Locations",
    streetCleanlinessLevels: "Street Cleanliness Levels",
    insectControls: "Insect Controls",
    rubbleRemovals: "Rubble Removals",
    committeeRoles: "Committee Roles",
    coordinationType: "Coordination Types",
    needItems: "Need Items",
    addNew: "Add New",
    actions: "Actions",
  },
};

let currentLang = "ar";

function switchLanguage(lang) {
  // Verify that the language is valid
  if (lang !== "ar" && lang !== "en") {
    console.error("Invalid language:", lang);
    lang = "ar"; // Use Arabic as the default value
  }

  // Update the global current language variable
  currentLang = lang;

  // Get the translations for the selected language
  const t = translations[lang];

  if (!t) {
    console.error("No translations found for the language:", lang);
    return;
  }

  // Save the language preference in localStorage
  try {
    localStorage.setItem("preferredLanguage", lang);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }

  // Set document direction based on language
  document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  // Update the position of the sidebar according to the language
  const aside = document.getElementById("sidenav-main");
  if (aside) {
    aside.classList.remove("fixed-end", "fixed-start");
    aside.classList.add(lang === "ar" ? "fixed-end" : "fixed-start");
  }

  // Apply direction to all modals
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  });

  // Apply text alignment to all form inputs
  document
    .querySelectorAll(".form-control, input, select, textarea")
    .forEach((input) => {
      input.style.textAlign = lang === "ar" ? "right" : "left";
      input.style.direction = lang === "ar" ? "rtl" : "ltr";
    });

  // Apply text alignment to all form labels
  document.querySelectorAll(".form-label, label").forEach((label) => {
    label.style.textAlign = lang === "ar" ? "right" : "left";
    if (lang === "ar") {
      label.style.float = "right";
    } else {
      label.style.float = "left";
    }
  });

  // Apply direction to all dropdown menus
  document
    .querySelectorAll(".dropdown-menu, .menu-dropdown-content")
    .forEach((menu) => {
      menu.style.textAlign = lang === "ar" ? "right" : "left";
      menu.style.direction = lang === "ar" ? "rtl" : "ltr";
    });

  // Update all modal titles and add buttons with translation attributes
  document
    .querySelectorAll(".modal-title[data-ar][data-en]")
    .forEach((title) => {
      title.textContent =
        lang === "ar"
          ? title.getAttribute("data-ar")
          : title.getAttribute("data-en");
    });

  // Update main section titles with translation attributes
  const projectTablesTitle = document.getElementById("projectTablesTitle");
  if (projectTablesTitle) {
    projectTablesTitle.textContent =
      lang === "ar"
        ? projectTablesTitle.getAttribute("data-ar")
        : projectTablesTitle.getAttribute("data-en");
  }
  const generalTablesTitle = document.getElementById("generalTablesTitle");
  if (generalTablesTitle) {
    generalTablesTitle.textContent =
      lang === "ar"
        ? generalTablesTitle.getAttribute("data-ar")
        : generalTablesTitle.getAttribute("data-en");
  }

  // Update all add buttons with translation attributes
  document
    .querySelectorAll(".add-button[data-ar][data-en]")
    .forEach((button) => {
      button.textContent =
        lang === "ar"
          ? button.getAttribute("data-ar")
          : button.getAttribute("data-en");
    });

  // Update the alignment of the dropdown button container according to the language
  const dropdownContainer = document.getElementById("dropdownButtonContainer");
  const projectsTitleContainer = document.getElementById(
    "projectsTitleContainer"
  );
  const helpButton = document.getElementById("helpButton");

  if (lang === "ar") {
    // For RTL (Arabic)
    if (dropdownContainer) {
      dropdownContainer.classList.remove("text-end");
      dropdownContainer.classList.add("text-start");
    }

    if (projectsTitleContainer) {
      projectsTitleContainer.classList.remove("text-start");
      projectsTitleContainer.classList.add("text-end");
    }

    // Position the help button on the left for Arabic
    if (helpButton) {
      helpButton.style.left = "20px";
      helpButton.style.right = "auto";
    }
  } else {
    // For LTR (English)
    if (dropdownContainer) {
      dropdownContainer.classList.remove("text-start");
      dropdownContainer.classList.add("text-end");
    }

    if (projectsTitleContainer) {
      projectsTitleContainer.classList.remove("text-end");
      projectsTitleContainer.classList.add("text-start");
    }

    // Position the help button on the right for English
    if (helpButton) {
      helpButton.style.right = "20px";
      helpButton.style.left = "auto";
    }
  }

  // Update document direction
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;

  // Update aside (sidebar) text
  const navTexts = document.querySelectorAll(".nav-link .nav-link-text");
  if (navTexts[0]) navTexts[0].textContent = t.dashboard;
  if (navTexts[1]) navTexts[1].textContent = t.configTables;
  if (navTexts[2]) navTexts[2].textContent = t.manageUsers;
  if (navTexts[3]) navTexts[3].textContent = t.profile;
  if (navTexts[4]) navTexts[4].textContent = t.standards;
  if (navTexts[5]) navTexts[5].textContent = t.neighborhoodCommittees;
  if (navTexts[6]) navTexts[6].textContent = t.developmentCommittees;

  // Update header menu items (settings/logout)
  const settingsText = document.getElementById("settingsText");
  if (settingsText) settingsText.textContent = t.settingsText;
  const logoutText = document.getElementById("logoutText");
  if (logoutText) logoutText.textContent = t.logoutText;

  // Update main cards
  const cardTitles = document.querySelectorAll(".card-title");
  if (cardTitles[0]) cardTitles[0].textContent = t.families;
  if (cardTitles[1]) cardTitles[1].textContent = t.validBuildings;
  if (cardTitles[2]) cardTitles[2].textContent = t.residentialBuildings;
  if (cardTitles[3]) cardTitles[3].textContent = t.threatened;

  // Update chart card titles
  const chartTitles = document.querySelectorAll("h5.card-title.text-center");
  if (chartTitles[0]) chartTitles[0].textContent = t.constructionStatus;
  if (chartTitles[1]) chartTitles[1].textContent = t.educationStatus;
  if (chartTitles[2]) chartTitles[2].textContent = t.healthStatus;

  // Update chart labels and datasets
  if (window.constructionChart) {
    constructionChart.data.labels = t.chartLabels.construction;
    constructionChart.data.datasets[0].label =
      lang === "ar" ? "عدد المنشآت" : "Number of Buildings";
    constructionChart.update();
  }
  if (window.healthChart) {
    healthChart.data.labels = t.chartLabels.health;
    healthChart.data.datasets[0].label =
      lang === "ar" ? "عدد المراكز الصحية" : "Number of Health Centers";
    healthChart.update();
  }
  if (window.educationChart) {
    educationChart.data.labels = t.chartLabels.education;
    educationChart.data.datasets[0].label =
      lang === "ar"
        ? "عدد المنشآت التعليمية"
        : "Number of Educational Facilities";
    educationChart.update();
  }
  if (window.serviceChart) {
    serviceChart.data.labels = t.chartLabels.service;
    serviceChart.update();
  }

  // Update projects section title
  const projectsTitle = document.getElementById("projectsTitle");
  if (projectsTitle) projectsTitle.textContent = t.projects;

  // Update Projects Orders overview section title
  const projectsOrdersTitle = document.getElementById("projectsOrdersTitle");
  if (projectsOrdersTitle) projectsOrdersTitle.textContent = t.projectOrders;

  // Update other elements as before...
  const moreIn2024 = document.querySelector(".text-sm .font-weight-bold");
  if (moreIn2024) moreIn2024.textContent = t.moreIn2024;

  const projectCompletion = document.querySelector(".card-header .mb-0");
  if (projectCompletion) projectCompletion.textContent = t.projectCompletion;

  // Update project list items
  const projectItems = document.querySelectorAll(
    ".list-group-item .text-sm.font-weight-bold.text-dark"
  );
  if (projectItems[0]) projectItems[0].textContent = t.foodProjects;
  if (projectItems[1]) projectItems[1].textContent = t.healthProjects;
  if (projectItems[2]) projectItems[2].textContent = t.clothingProjects;

  // Update view all projects button
  const viewAllBtn = document.querySelector(".btn-dark.mb-0");
  if (viewAllBtn) viewAllBtn.textContent = t.viewAllProjects;

  // Update projects table headers
  const tableHeaders = document.querySelectorAll("th.text-uppercase");
  if (tableHeaders[0]) tableHeaders[0].textContent = t.projectName;
  if (tableHeaders[1]) tableHeaders[1].textContent = t.type;
  if (tableHeaders[2]) tableHeaders[2].textContent = t.budget;
  if (tableHeaders[3]) tableHeaders[3].textContent = t.status;

  // Update project orders section
  const thisMonthText = document.querySelectorAll(
    ".text-sm .font-weight-bold"
  )[1];
  if (thisMonthText) thisMonthText.textContent = t.thisMonth;

  // Update projects overview and section titles
  const projectsOverviewTitle = document.getElementById(
    "projectsOverviewTitle"
  );
  if (projectsOverviewTitle)
    projectsOverviewTitle.textContent = t.projectsOverview;

  // Update specific modal titles from tables2.html
  const modalTitles = {
    operationalStatusesModalLabel: t.operationalStatuses,
    interventionPrioritiesModalLabel: t.interventionPriorities,
    infrastructureStatusesModalLabel: t.infrastructureStatuses,
    staffStatusesModalLabel: t.staffStatuses,
    consumablesStatusesModalLabel: t.consumablesStatuses,
    damageLevelsModalLabel: t.damageLevels,
    networkStatusesModalLabel: t.networkStatuses,
    supplyOperationLevelModalLabel: t.supplyOperationLevel,
    ownershipDocumentationTypesModalLabel: t.ownershipDocumentationTypes,
    ownershipTypesModalLabel: t.ownershipTypes,
    urbanConditionsModalLabel: t.urbanConditions,
    dominantLandUsesModalLabel: t.dominantLandUses,
    humanNeedsTypesModalLabel: t.humanNeedsTypes,
    urbanClassificationsModalLabel: t.urbanClassifications,
    administrativeClassificationsModalLabel: t.administrativeClassifications,
    conditionsModalLabel: t.conditions,
    infrastructureConditionsModalLabel: t.infrastructureConditions,
    workersConditionsModalLabel: t.workersConditions,
    consumablesConditionsModalLabel: t.consumablesConditions,
    transportationMobilityTypesModalLabel: t.transportationMobilityTypes,
    mobilityCentersTypesModalLabel: t.mobilityCentersTypes,
    suppliesNamesModalLabel: t.suppliesNames,
    operationStatusesModalLabel: t.operationStatuses,
    healthServiceFacilitiesModalLabel: t.healthServiceFacilities,
    infrastructureStatusesArchitecturalModalLabel:
      t.infrastructureStatusesArchitectural,
    availabilityStatusesModalLabel: t.availabilityStatuses,
    infrastructureFacilitiesModalLabel: t.infrastructureFacilities,
    administrativeServicesNamesModalLabel: t.administrativeServicesNames,
    otherServicesNamesModalLabel: t.otherServicesNames,
    facilityTypesModalLabel: t.facilityTypes,
    participationTypesModalLabel: t.participationTypes,
    potentialPartnersModalLabel: t.potentialPartners,
    marketTypesModalLabel: t.marketTypes,
    randomLocationsModalLabel: t.randomLocations,
    streetCleanlinessLevelsModalLabel: t.streetCleanlinessLevels,
    insectControlsModalLabel: t.insectControls,
    rubbleRemovalsModalLabel: t.rubbleRemovals,
  };

  // Update all modal titles
  Object.keys(modalTitles).forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = modalTitles[id];
    }
  });

  // Translate the "Add" buttons
  const addButtons = document.querySelectorAll(".btn-add");
  addButtons.forEach((button) => {
    if (button) {
      // Find the text inside the button and update it
      const buttonText = button.textContent.trim();
      if (buttonText.includes("إضافة") || buttonText.includes("Add")) {
        button.textContent = t.addNew;
      }
    }
  });

  // Translate the headers of the tables
  const actionHeaders = document.querySelectorAll("th");
  actionHeaders.forEach((header) => {
    if (
      header.textContent.includes("إجراءات") ||
      header.textContent.includes("Actions")
    ) {
      header.textContent = t.actions;
    }
  });

  // Translate the titles of grid items (grid-items)
  const gridItems = document.querySelectorAll(".grid-item h3");
  gridItems.forEach((item) => {
    // First check if the item has data-ar and data-en attributes
    if (item.hasAttribute("data-ar") && item.hasAttribute("data-en")) {
      const langAttr = lang === "ar" ? "data-ar" : "data-en";
      const translation = item.getAttribute(langAttr);
      if (translation) {
        item.textContent = translation;
        return;
      }
    }
    
    // Find the corresponding translation key based on the text
    const modalId = item
      .closest(".grid-item")
      .getAttribute("data-bs-target")
      ?.replace("#", "")
      .replace("Modal", "");
    if (modalId) {
      // Try to find the translation in the translations object first
      if (translations[lang][modalId]) {
        item.textContent = translations[lang][modalId];
      }
      // If not found in translations, try to find it in the modal title
      else {
        const modal = document.getElementById(modalId + "Modal");
        if (modal) {
          const modalTitle = modal.querySelector(".modal-title");
          if (modalTitle) {
            const langAttr = lang === "ar" ? "data-ar" : "data-en";
            const translation = modalTitle.getAttribute(langAttr);
            if (translation) {
              item.textContent = translation;
            }
          }
        }
      }
    }
  });
}

function toggleLanguage() {
  const btn = document.getElementById("langToggleBtn");
  const newLang = currentLang === "ar" ? "en" : "ar";

  // Update the button text
  btn.textContent = currentLang === "ar" ? "EN" : "AR";

  // Update all tables and modals after language change
  setTimeout(() => {
    // Apply language change to any open modals
    document.querySelectorAll(".modal").forEach((modal) => {
      updateModalLanguage(modal);
    });

    // Update all table headers
    document.querySelectorAll("[data-table]").forEach((modalEl) => {
      const tableName = modalEl.getAttribute("data-table");
      if (tableName) {
        updateTableHeadersAndDir(tableName);
      }
    });
  }, 50);

  // Change the language
  switchLanguage(newLang);
}

// Add menu functionality
function toggleMenu() {
  const menu = document.getElementById("menuDropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Close menu when clicking outside
document.addEventListener("click", function (e) {
  const menu = document.getElementById("menuDropdown");
  const menuBtn = document.getElementById("menuToggleBtn");

  if (menu && menuBtn) {
    if (!menuBtn.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
    }
  }
});

// Initial language configuration
document.addEventListener("DOMContentLoaded", function () {
  // Add debug message to verify that the script is running

  // Try to retrieve the saved language preference
  let savedLanguage;
  try {
    savedLanguage = localStorage.getItem("preferredLanguage");
  } catch (error) {
    console.error("Error retrieving language preference:", error);
    savedLanguage = null;
  }

  // Set the initial language based on the saved preference or use Arabic as default
  const initialLang =
    savedLanguage === "ar" || savedLanguage === "en" ? savedLanguage : "ar";

  // Configure the language toggle button
  const langToggleBtn = document.getElementById("langToggleBtn");
  if (langToggleBtn) {
    // Set the button text based on the initial language
    langToggleBtn.textContent = initialLang === "ar" ? "AR" : "EN";

    // Ensure there is only one event handler to avoid duplicates
    langToggleBtn.onclick = function () {
      toggleLanguage();
    };
  } else {
    console.error("Language toggle button not found");
  }

  // Apply the initial language
  switchLanguage(initialLang);
});

// Function to show notifications
function showNotification(message, type = "info") {
  // Create the notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
  <div class="notification-content">
    <i class="fas ${
      type === "success"
        ? "fa-check-circle"
        : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle"
    }"></i>
    <span>${message}</span>
  </div>
  <button class="notification-close">&times;</button>
`;

  // Styles for the notification
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.zIndex = "9999";
  notification.style.backgroundColor =
    type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3";
  notification.style.color = "white";
  notification.style.padding = "15px";
  notification.style.borderRadius = "5px";
  notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  notification.style.minWidth = "300px";
  notification.style.display = "flex";
  notification.style.justifyContent = "space-between";
  notification.style.alignItems = "center";
  notification.style.animation = "fadeIn 0.3s ease-in-out";

  // Styles for the notification content
  const content = notification.querySelector(".notification-content");
  content.style.display = "flex";
  content.style.alignItems = "center";

  // Styles for the icon
  const icon = notification.querySelector("i");
  icon.style.marginRight = "10px";
  icon.style.fontSize = "1.5rem";

  // Styles for the close button
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.color = "white";
  closeBtn.style.fontSize = "1.5rem";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.marginLeft = "10px";

  // Add the notification to the document
  document.body.appendChild(notification);

  // Close the notification when clicking the close button
  closeBtn.addEventListener("click", () => {
    notification.style.animation = "fadeOut 0.3s ease-in-out";
    setTimeout(() => {
      if (notification && document.body.contains(notification)) {
        notification.remove();
      }
    }, 300);
  });

  // Close the notification automatically after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = "fadeOut 0.3s ease-in-out";
      setTimeout(() => {
        if (notification && document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Add animation styles
const styleElement = document.createElement("style");
styleElement.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}
`;
document.head.appendChild(styleElement);

// Default data for tables
const operationalStatusesData = [
  {
    id: 1,
    statusName: "Normal Operation",
    statusNameArabic: "يعمل بشكل اعتيادي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    statusName: "Acceptable Operation",
    statusNameArabic: "يعمل بشكل مقبول",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    statusName: "Intermittent Operation",
    statusNameArabic: "يعمل بشكل متقطع",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    statusName: "Non-Operational",
    statusNameArabic: "لا يعمل (معدوم)",
    urbanSectoralEffectiveness: 1,
  },
];

const interventionPrioritiesData = [
  {
    id: 1,
    priorityName: "1",
    priorityNameArabic: "1",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    priorityName: "2",
    priorityNameArabic: "2",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    priorityName: "3",
    priorityNameArabic: "3",
    urbanSectoralEffectiveness: 1,
  },
];

const infrastructureStatusesData = [
  {
    id: 1,
    statusName: "Good",
    statusNameArabic: "متضرر كلياً",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    statusName: "Moderate",
    statusNameArabic: "متضرر جزئياً",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    statusName: "Poor",
    statusNameArabic: "غير متضرر",
    urbanSectoralEffectiveness: 1,
  },
];

const staffStatusesData = [
  {
    id: 1,
    statusName: "Sufficient",
    statusNameArabic: "كافية",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    statusName: "Insufficient",
    statusNameArabic: "غير كافٍ",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    statusName: "Available",
    statusNameArabic: "متوفر",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    statusName: "Unavailable",
    statusNameArabic: "غير متوفر",
    urbanSectoralEffectiveness: 1,
  },
];

const consumablesStatusesData = [
  {
    id: 1,
    statusName: "Good",
    statusNameArabic: "جيدة",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    statusName: "Moderate",
    statusNameArabic: "متوسطة",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    statusName: "Poor",
    statusNameArabic: "ضعيفة",
    urbanSectoralEffectiveness: 1,
  },
];

const damageLevelsData = [
  {
    id: 1,
    levelName: "Minor",
    levelNameArabic: "شديد",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    levelName: "Moderate",
    levelNameArabic: "متوسط",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    levelName: "Major",
    levelNameArabic: "خفيف",
    urbanSectoralEffectiveness: 1,
  },
];

const networkStatusesData = [
  {
    id: 1,
    statusName: "Functional",
    statusNameArabic: "تعمل",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    statusName: "Damaged",
    statusNameArabic: "تعمل جزئياً",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    statusName: "Disabled",
    statusNameArabic: "لا تعمل",
    urbanSectoralEffectiveness: 1,
  },
];

const supplyOperationLevelData = [
  {
    id: 1,
    levelName: "Full",
    levelNameArabic: "كامل",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    levelName: "Partial",
    levelNameArabic: "جزئي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    levelName: "Disabled",
    levelNameArabic: "معطل",
    urbanSectoralEffectiveness: 1,
  },
];

const ownershipDocumentationTypesData = [
  {
    id: 1,
    typeName: "Fully Protected",
    typeNameArabic: "محمي كليًا",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    typeName: "Partially Protected",
    typeNameArabic: "محمي جزئيًا",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    typeName: "Unprotected",
    typeNameArabic: "غير محمي",
    urbanSectoralEffectiveness: 1,
  },
];

const damageDescriptionsData = [
  {
    id: 1,
    descriptionType: "Structural Damage",
    descriptionTypeArabic: "ضرر هيكلي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    descriptionType: "Electrical Damage",
    descriptionTypeArabic: "ضرر كهربائي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    descriptionType: "Plumbing Damage",
    descriptionTypeArabic: "ضرر في السباكة",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    descriptionType: "Roof Damage",
    descriptionTypeArabic: "ضرر في السقف",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 5,
    descriptionType: "Wall Damage",
    descriptionTypeArabic: "ضرر في الجدران",
    urbanSectoralEffectiveness: 1,
  },
];

const ownershipTypesData = [
  {
    id: 1,
    typeName: "Systematic Title",
    typeNameArabic: "طابو نظامي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    typeName: "Agricultural Title",
    typeNameArabic: "طابو زراعي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    typeName: "Notary Title",
    typeNameArabic: "كاتب بالعدل",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    typeName: "Other",
    typeNameArabic: "غير ذلك",
    urbanSectoralEffectiveness: 1,
  },
];

const urbanConditionsData = [
  {
    id: 1,
    conditionName: "Organized",
    conditionNameArabic: "منظم",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    conditionName: "Informal",
    conditionNameArabic: "عشوائي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    conditionName: "Old Town",
    conditionNameArabic: "بلدة قديمة",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    conditionName: "Mixed",
    conditionNameArabic: "مختلط",
    urbanSectoralEffectiveness: 1,
  },
];

const dominantLandUsesData = [
  {
    id: 1,
    landUseName: "Residential",
    landUseNameArabic: "سكني",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    landUseName: "Residential-Commercial",
    landUseNameArabic: "سكني تجاري",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    landUseName: "Commercial",
    landUseNameArabic: "تجاري",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    landUseName: "Service",
    landUseNameArabic: "خدمي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 5,
    landUseName: "Administrative",
    landUseNameArabic: "إداري",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 6,
    landUseName: "Touristic",
    landUseNameArabic: "سياحي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 7,
    landUseName: "Artisanal",
    landUseNameArabic: "حرفي",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 8,
    landUseName: "Mixed",
    landUseNameArabic: "مختلط",
    urbanSectoralEffectiveness: 1,
  },
];

const humanNeedsTypesData = [
  {
    id: 1,
    needType: "Shelter",
    needTypeArabic: "ملاجئ",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    needType: "Water",
    needTypeArabic: "مياه",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    needType: "Health",
    needTypeArabic: "صحة",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    needType: "Education",
    needTypeArabic: "تعليم",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 5,
    needType: "Food",
    needTypeArabic: "غذاء",
    urbanSectoralEffectiveness: 1,
  },
];

const neighborhoodsData = [
  {
    id: 1,
    name: "Al-Jamiliya",
    nameArabic: "الجميلية",
    code: "NE001",
    cityId: 1,
  },
  {
    id: 2,
    name: "Al-Shaar",
    nameArabic: "الشعار",
    code: "NE002",
    cityId: 1,
  },
  {
    id: 3,
    name: "Al-Aziziya",
    nameArabic: "العزيزية",
    code: "NE003",
    cityId: 1,
  },
  {
    id: 4,
    name: "Al-Salihin",
    nameArabic: "الصالحين",
    code: "NE004",
    cityId: 1,
  },
  {
    id: 5,
    name: "Al-Midan",
    nameArabic: "الميدان",
    code: "NE005",
    cityId: 1,
  },
];

const humanitarianInterventionsTypesData = [
  {
    id: 1,
    interveningParty: "UNHCR",
    distributionDate: "2024-01-15",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 2,
    interveningParty: "UNICEF",
    distributionDate: "2024-01-20",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 3,
    interveningParty: "WHO",
    distributionDate: "2024-01-25",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 4,
    interveningParty: "WFP",
    distributionDate: "2024-02-01",
    urbanSectoralEffectiveness: 1,
  },
  {
    id: 5,
    interveningParty: "Local NGOs",
    distributionDate: "2024-02-05",
    urbanSectoralEffectiveness: 1,
  },
];

// New data arrays for additional tables
const urbanClassificationsData = [
  {
    id: 1,
    nameEn: "City",
    nameAr: "مدينة",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Town",
    nameAr: "بلدة",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Municipality",
    nameAr: "بلدية",
    compositeUrbanValue: 1,
  },
];

const administrativeClassificationsData = [
  {
    id: 1,
    nameEn: "Governorate Center",
    nameAr: "مركز محافظة",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "District Center",
    nameAr: "مركز منطقة",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Subdistrict Center",
    nameAr: "مركز ناحية",
    compositeUrbanValue: 1,
  },
  {
    id: 4,
    nameEn: "Other",
    nameAr: "غير ذلك",
    compositeUrbanValue: 1,
  },
];

const conditionsData = [
  {
    id: 1,
    nameEn: "Operational",
    nameAr: "قيد التشغيل",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Non-Operational",
    nameAr: "غير قيد التشغيل",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Maintenance Required",
    nameAr: "مطلوب صيانة",
    compositeUrbanValue: 1,
  },
];

const infrastructureConditionsData = [
  {
    id: 1,
    nameEn: "Good",
    nameAr: "جيدة",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Moderate",
    nameAr: "متوسطة",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Poor",
    nameAr: "سيئة",
    compositeUrbanValue: 1,
  },
];

const workersConditionsData = [
  {
    id: 1,
    nameEn: "Qualified",
    nameAr: "مؤهلين",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Unqualified",
    nameAr: "غير مؤهلين",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Training Required",
    nameAr: "مطلوب تدريب",
    compositeUrbanValue: 1,
  },
];

const consumablesConditionsData = [
  {
    id: 1,
    nameEn: "Renewal Required",
    nameAr: "مطلوب تجديد",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Sufficient",
    nameAr: "كافية",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Insufficient",
    nameAr: "غير كافية",
    compositeUrbanValue: 1,
  },
];

const transportationMobilityTypesData = [
  {
    id: 1,
    nameEn: "Road Transport",
    nameAr: "النقل البري",
    description: "يشمل الطرق الإقليمية والمحلية",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Railway",
    nameAr: "سكة الحديد",
    description: "وسيلة نقل بالقطار",
    compositeUrbanValue: 1,
  },
];

const mobilityCentersTypesData = [
  {
    id: 1,
    nameEn: "Bus Terminal",
    nameAr: "محطة الحافلات",
    description: "مركز انطلاق الحافلات الإقليمية",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Airport",
    nameAr: "المطار",
    description: "مطار دولي أو محلي",
    compositeUrbanValue: 1,
  },
];

const suppliesNamesData = [
  {
    id: 1,
    nameEn: "Food Supplies",
    nameAr: "الـمـواد الـغـذائـيـة الأسـاسـيـة",
    description: "تشمل الأرز والسكر والزيت",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Medical Supplies",
    nameAr: "الـلـقـاحـات والأدويـة",
    description: "تشمل الأدوية والمستلزمات الصحية",
    compositeUrbanValue: 1,
  },
];

const operationStatusesData = [
  {
    id: 1,
    nameEn: "Normal Operation",
    nameAr: "يعمل بشكل اعتيادي",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Acceptable Operation",
    nameAr: "يعمل بشكل مقبول",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Intermittent Operation",
    nameAr: "يعمل بشكل متقطع",
    compositeUrbanValue: 1,
  },
  {
    id: 4,
    nameEn: "Non-Operational",
    nameAr: "لا يعمل (معدوم)",
    compositeUrbanValue: 1,
  },
];

const healthServiceFacilitiesData = [
  {
    id: 1,
    nameEn: "Hospital",
    nameAr: "مـــديـــريـــة الـــصـــحـــة",
    description: "منشأة صحية رئيسية",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Clinic",
    nameAr: "الـــصـــيدلـــيـــة الـــمـــركـــزيـــة",
    description: "منشأة صحية صغيرة",
    compositeUrbanValue: 1,
  },
];

const infrastructureStatusesArchitecturalData = [
  {
    id: 1,
    nameEn: "Severely Damaged",
    nameAr: "مضررة بشدة",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Partially Damaged",
    nameAr: "متضررة بشكل خفيف",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Not Damaged",
    nameAr: "غير متضررة",
    compositeUrbanValue: 1,
  },
];

const availabilityStatusesData = [
  {
    id: 1,
    nameEn: "Available",
    nameAr: "متاح",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Limited Availability",
    nameAr: "متاح بحدود",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Unavailable",
    nameAr: "غير متاح",
    compositeUrbanValue: 1,
  },
];

const infrastructureFacilitiesData = [
  {
    id: 1,
    nameEn: "Electricity Grid",
    nameAr: "مـــديـــريـــة الـــكـــهـــربـــاء",
    description: "شبكة توفير الكهرباء للمدينة",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Water Supply System",
    nameAr: "مـــديـــريـــة الـــمـــيـــاه",
    description: "نظام لتوزيع المياه",
    compositeUrbanValue: 1,
  },
];

const administrativeServicesNamesData = [
  {
    id: 1,
    nameEn: "Civil Registry",
    nameAr: "مـــديـــريـــة الـــســـجـــل الـــمـــدنـــي",
    description: "خدمة تسجيل السكان",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Tax Collection",
    nameAr: "مـــديـــريـــة الـــمـــصـــالـــح الـــعـــقـــاريـــة",
    description: "خدمة تحصيل الضرائب",
    compositeUrbanValue: 1,
  },
];

const otherServicesNamesData = [
  {
    id: 1,
    nameEn: "Public Transportation",
    nameAr: "سوق الهال المركزي",
    description: "خدمة النقل العام",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Waste Management",
    nameAr: "مكب النفايات",
    description: "خدمة إدارة النفايات",
    compositeUrbanValue: 1,
  },
];

const facilityTypesData = [
  {
    id: 1,
    nameEn: "Educational Facility",
    nameAr: "منشأة تعليمية",
    description: "مدرسة أو جامعة",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Health Facility",
    nameAr: "منشأة صحية",
    description: "مستشفى أو عيادة",
    compositeUrbanValue: 1,
  },
];

const participationTypesData = [
  {
    id: 1,
    nameEn: "Financial Support",
    nameAr: "شراكة",
    description: "دعم مالي للمشاريع",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Technical Support",
    nameAr: "تشاور",
    description: "دعم تقني للمشاريع",
    compositeUrbanValue: 1,
  },
];

const potentialPartnersData = [
  {
    id: 1,
    nameEn: "NGO A",
    nameAr: "منظمة غير حكومية أ",
    description: "شريك محتمل في التنمية",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Government Agency B",
    nameAr: "وكالة حكومية ب",
    description: "شريك حكومي",
    compositeUrbanValue: 1,
  },
];

const marketTypesData = [
  {
    id: 1,
    nameEn: "Vegetables",
    nameAr: "تجاري تقليدي",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Clothes",
    nameAr: "حرفي",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Food Products",
    nameAr: "غذائيات",
    compositeUrbanValue: 1,
  },
  {
    id: 4,
    nameEn: "Electronics",
    nameAr: "إلكترونيات",
    compositeUrbanValue: 1,
  },
];

const randomLocationsData = [
  { id: 1, nameEn: "Exists", nameAr: "يوجد", compositeUrbanValue: 1 },
  {
    id: 2,
    nameEn: "Does not exist",
    nameAr: "لا يوجد",
    compositeUrbanValue: 1,
  },
];

const streetCleanlinessLevelsData = [
  { id: 1, nameEn: "Good", nameAr: "جيد", compositeUrbanValue: 1 },
  { id: 2, nameEn: "Moderate", nameAr: "متوسط", compositeUrbanValue: 1 },
  { id: 3, nameEn: "Poor", nameAr: "ضعيف", compositeUrbanValue: 1 },
  { id: 4, nameEn: "None", nameAr: "معدوم", compositeUrbanValue: 1 },
];

const insectControlsData = [
  { id: 1, nameEn: "Permanent", nameAr: "دائمة", compositeUrbanValue: 1 },
  {
    id: 2,
    nameEn: "Sometimes",
    nameAr: "أحياناً",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Does not exist",
    nameAr: "لا يوجد",
    compositeUrbanValue: 1,
  },
];

const rubbleRemovalsData = [
  {
    id: 1,
    nameEn: "Permanent",
    nameAr: "بشكل دائم",
    compositeUrbanValue: 1,
  },
  {
    id: 2,
    nameEn: "Partial",
    nameAr: "بشكل جزئي",
    compositeUrbanValue: 1,
  },
  {
    id: 3,
    nameEn: "Does not exist",
    nameAr: "لا يوجد",
    compositeUrbanValue: 1,
  },
];

const committeeRolesData = [
  {
    id: 1,
    name: "مختار",
  },
  {
    id: 2,
    name: "عضو لجنة",
  },
];

const coordinationTypeData = [
  {
    id: 1,
    name: "مع المخاتير ولجان الأحياء",
  },
  {
    id: 2,
    name: "مع المحافظة",
  },
  {
    id: 3,
    name: "مع الوحدات الإدارية المجاورة",
  },
  {
    id: 4,
    name: "بين لجان الأحياء",
  },
];

const projectTypesData = [
  {
    id: 1,
    typeName: "Health",
    typeNameArabic: "الصحة",
  },
  {
    id: 2,
    typeName: "Food",
    typeNameArabic: "الغذاء",
  },
  {
    id: 3,
    typeName: "Clothing and Housing Aid",
    typeNameArabic: "اللباس والمعونات السكنية",
  },
  {
    id: 4,
    typeName: "Housing and Shelter",
    typeNameArabic: "السكن والإيواء",
  },
  {
    id: 5,
    typeName: "Education",
    typeNameArabic: "التعليم",
  },
  {
    id: 6,
    typeName: "Psychological and Family Support",
    typeNameArabic: "الدعم النفسي والأسري",
  },
  {
    id: 7,
    typeName: "Income Generation and Livelihood Improvement",
    typeNameArabic: "مشاريع توليد الدخل وتحسين سبل العيش",
  },
];

const projectStatusesData = [
  {
    id: 1,
    statusName: "Planning",
    statusNameArabic: "قيد التخطيط",
  },
  {
    id: 2,
    statusName: "In Progress",
    statusNameArabic: "قيد التنفيذ",
  },
  {
    id: 3,
    statusName: "Completed",
    statusNameArabic: "منجز",
  },
];

const projectNamesData = [
  {
    id: 1,
    name: "Emergency Health Support Project",
    nameArabic: "مشروع دعم صحي طارئ",
  },
  {
    id: 2,
    name: "Food Basket Distribution Project",
    nameArabic: "مشروع توزيع سلال غذائية",
  },
  {
    id: 3,
    name: "Shelter Rehabilitation Project",
    nameArabic: "مشروع إعادة تأهيل مراكز إيواء",
  },
];

const needItemsData = [
  {
    id: 1,
    itemName: "Laptop",
    itemNameArabic: "حاسب محمول",
  },
  {
    id: 2,
    itemName: "Multifunction Printer",
    itemNameArabic: "طابعة متعددة الوظائف",
  },
  {
    id: 3,
    itemName: "GIS Training Course",
    itemNameArabic: "دورة تدريبية GIS",
  },
  {
    id: 4,
    itemName: "GPS Device",
    itemNameArabic: "جهاز GPS",
  },
  {
    id: 5,
    itemName: "Portable Water Tank",
    itemNameArabic: "خزان مياه متنقل",
  },
  {
    id: 6,
    itemName: "Administrative Office",
    itemNameArabic: "مكتب إداري",
  },
  {
    id: 7,
    itemName: "Electrical Maintenance Workshop",
    itemNameArabic: "ورشة صيانة كهربائية",
  },
];

const functionalityLevelsData = [
  {
    id: 1,
    levelName: "Functional",
    levelNameArabic: "فعال",
  },
  {
    id: 2,
    levelName: "Partially Functional",
    levelNameArabic: "فعال جزئياً",
  },
  {
    id: 3,
    levelName: "Non-Functional",
    levelNameArabic: "غير فعال",
  },
];

// Function to display data in tables
function displayData(tableName) {
  const tableBodyId = `${tableName}TableBody`;
  const tableBody = document.getElementById(tableBodyId);
  if (!tableBody) {
    console.error(`Element with ID '${tableBodyId}' not found!`);
    return;
  }

  // ---------------------------------------------
  // Custom rendering for "needItems" table only
  // ---------------------------------------------
  if (tableName === "needItems") {
    tableBody.innerHTML = "";
    needItemsData.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-center">${index + 1}</td>
        <td class="text-center">${item.id}</td>
        <td class="text-center">${currentLang === "ar" ? item.itemNameArabic : item.itemName}</td>
        <td class="text-center">
          <button class="btn btn-link text-danger" onclick="deleteRow('needItems', ${index})" title="${currentLang === 'ar' ? 'حذف' : 'Delete'}">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-link text-primary" onclick="editRow('needItems', ${index})" title="${currentLang === 'ar' ? 'تعديل' : 'Edit'}">
            <i class="fas fa-edit"></i>
          </button>
        </td>`;
      tableBody.appendChild(row);
    });
    // Ensure headers direction and language are correct
    if (typeof updateTableHeadersAndDir === "function") {
      updateTableHeadersAndDir(tableName);
    }
    return; // Skip generic processing
  }

  let data = [];
  switch (tableName) {
    case "needItems":
      data = needItemsData;
      break;
    case "operationalStatuses":
      data = operationalStatusesData;
      break;
    case "interventionPriorities":
      data = interventionPrioritiesData;
      break;
    case "infrastructureStatuses":
      data = infrastructureStatusesData;
      break;
    case "staffStatuses":
      data = staffStatusesData;
      break;
    case "consumablesStatuses":
      data = consumablesStatusesData;
      break;
    case "damageLevels":
      data = damageLevelsData;
      break;
    case "networkStatuses":
      data = networkStatusesData;
      break;
    case "supplyOperationLevel":
      data = supplyOperationLevelData;
      break;
    case "ownershipDocumentationTypes":
      data = ownershipDocumentationTypesData;
      break;
    case "damageDescriptions":
      data = damageDescriptionsData;
      break;
    case "ownershipTypes":
      data = ownershipTypesData;
      break;
    case "urbanConditions":
      data = urbanConditionsData;
      break;
    case "dominantLandUses":
      data = dominantLandUsesData;
      break;
    case "humanNeedsTypes":
      data = humanNeedsTypesData;
      break;
    case "neighborhoods":
      data = neighborhoodsData;
      break;
    case "humanitarianInterventionsTypes":
      data = humanitarianInterventionsTypesData;
      break;
    case "urbanClassifications":
      data = urbanClassificationsData;
      break;
    case "administrativeClassifications":
      data = administrativeClassificationsData;
      break;
    case "conditions":
      data = conditionsData;
      break;
    case "infrastructureConditions":
      data = infrastructureConditionsData;
      break;
    case "workersConditions":
      data = workersConditionsData;
      break;
    case "consumablesConditions":
      data = consumablesConditionsData;
      break;
    case "transportationMobilityTypes":
      data = transportationMobilityTypesData;
      break;
    case "mobilityCentersTypes":
      data = mobilityCentersTypesData;
      break;
    case "suppliesNames":
      data = suppliesNamesData;
      break;
    case "operationStatuses":
      data = operationStatusesData;
      break;
    case "healthServiceFacilities":
      data = healthServiceFacilitiesData;
      break;
    case "infrastructureStatusesArchitectural":
      data = infrastructureStatusesArchitecturalData;
      break;
    case "availabilityStatuses":
      data = availabilityStatusesData;
      break;
    case "infrastructureFacilities":
      data = infrastructureFacilitiesData;
      break;
    case "administrativeServicesNames":
      data = administrativeServicesNamesData;
      break;
    case "otherServicesNames":
      data = otherServicesNamesData;
      break;
    case "facilityTypes":
      data = facilityTypesData;
      break;
    case "participationTypes":
      data = participationTypesData;
      break;
    case "potentialPartners":
      data = potentialPartnersData;
      break;
    case "marketTypes":
      data = marketTypesData;
      break;
    case "randomLocations":
      data = randomLocationsData;
      break;
    case "streetCleanlinessLevels":
      data = streetCleanlinessLevelsData;
      break;
    case "insectControls":
      data = insectControlsData;
      break;
    case "rubbleRemovals":
      data = rubbleRemovalsData;
      break;
    case "committeeRoles":
      data = committeeRolesData;
      break;
    case "coordinationType":
      data = coordinationTypeData;
      break;
    case "projectTypes":
      data = projectTypesData;
      break;
    case "projectStatuses":
      data = projectStatusesData;
      break;
    case "projectNames":
      data = projectNamesData;
      break;
    case "facilityTypes":
      data = facilityTypesData;
      break;
    case "participationTypes":
      data = participationTypesData;
      break;
    case "potentialPartners":
      data = potentialPartnersData;
      break;
    case "marketTypes":
      data = marketTypesData;
      break;
    case "randomLocations":
      data = randomLocationsData;
      break;
    case "streetCleanlinessLevels":
      data = streetCleanlinessLevelsData;
      break;
    case "insectControls":
      data = insectControlsData;
      break;
    case "rubbleRemovals":
      data = rubbleRemovalsData;
      break;
    case "committeeRoles":
      data = committeeRolesData;
      break;
    case "coordinationType":
      data = coordinationTypeData;
      break;
    default:
      console.error(`Unknown table name: ${tableName}`);
      return;
  }

  if (data.length === 0) {
    console.error(`No data available for table: ${tableName}`);
    return;
  }

  // Clear existing table content
  tableBody.innerHTML = "";

  // Add rows for each data item
  data.forEach((item, index) => {
    const row = document.createElement("tr");
    
    // Add cells
    row.innerHTML = `
      <td class="text-center">${index + 1}</td>
      <td class="text-center">${item.id}</td>
      <td class="text-center">${currentLang === "ar" ? item.itemNameArabic : item.itemName}</td>
      <td class="text-center">
        <button class="btn btn-link text-danger" onclick="deleteRow('${tableName}', ${index})">
          <i class="fas fa-trash"></i>
        </button>
        <button class="btn btn-link text-primary" onclick="editRow('${tableName}', ${index})">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Function to add a new row
function addRow(tableName) {
  let newItem = {};
  switch (tableName) {
    case "needItems":
      newItem = {
        id: needItemsData.length + 1,
        itemName: "New Item",
        itemNameArabic: "عنصر جديد",
      };
      needItemsData.push(newItem);
      break;
    case "operationalStatuses":
      newItem = {
        id: operationalStatusesData.length + 1,
        statusName: "New Status",
        statusNameArabic: "حالة جديدة",
      };
      operationalStatusesData.push(newItem);
      break;
    case "interventionPriorities":
      newItem = {
        id: interventionPrioritiesData.length + 1,
        priorityName: "New Priority",
        priorityNameArabic: "أولوية جديدة",
      };
      interventionPrioritiesData.push(newItem);
      break;
    case "infrastructureStatuses":
      newItem = {
        id: infrastructureStatusesData.length + 1,
        statusName: "New Status",
        statusNameArabic: "حالة جديدة",
      };
      infrastructureStatusesData.push(newItem);
      break;
    case "staffStatuses":
      newItem = {
        id: staffStatusesData.length + 1,
        statusName: "New Status",
        statusNameArabic: "حالة جديدة",
      };
      staffStatusesData.push(newItem);
      break;
    case "consumablesStatuses":
      newItem = {
        id: consumablesStatusesData.length + 1,
        statusName: "New Status",
        statusNameArabic: "حالة جديدة",
      };
      consumablesStatusesData.push(newItem);
      break;
    case "damageLevels":
      newItem = {
        id: damageLevelsData.length + 1,
        levelName: "New Level",
        levelNameArabic: "مستوى جديد",
      };
      damageLevelsData.push(newItem);
      break;
    case "networkStatuses":
      newItem = {
        id: networkStatusesData.length + 1,
        statusName: "New Status",
        statusNameArabic: "حالة جديدة",
      };
      networkStatusesData.push(newItem);
      break;
    case "supplyOperationLevel":
      newItem = {
        id: supplyOperationLevelData.length + 1,
        levelName: "New Level",
        levelNameArabic: "مستوى جديد",
      };
      supplyOperationLevelData.push(newItem);
      break;
    case "ownershipDocumentationTypes":
      newItem = {
        id: ownershipDocumentationTypesData.length + 1,
        typeName: "New Type",
        typeNameArabic: "نوع جديد",
      };
      ownershipDocumentationTypesData.push(newItem);
      break;
    case "damageDescriptions":
      newItem = {
        id: damageDescriptionsData.length + 1,
        descriptionType: "New Description",
        descriptionTypeArabic: "وصف جديد",
      };
      damageDescriptionsData.push(newItem);
      break;
    case "ownershipTypes":
      newItem = {
        id: ownershipTypesData.length + 1,
        typeName: "New Type",
        typeNameArabic: "نوع جديد",
      };
      ownershipTypesData.push(newItem);
      break;
    case "urbanConditions":
      newItem = {
        id: urbanConditionsData.length + 1,
        conditionName: "New Condition",
        conditionNameArabic: "حالة جديدة",
      };
      urbanConditionsData.push(newItem);
      break;
    case "dominantLandUses":
      newItem = {
        id: dominantLandUsesData.length + 1,
        landUseName: "New Use",
        landUseNameArabic: "استخدام جديد",
      };
      dominantLandUsesData.push(newItem);
      break;
    case "humanNeedsTypes":
      newItem = {
        id: humanNeedsTypesData.length + 1,
        needType: "New Need",
        needTypeArabic: "احتياج جديد",
      };
      humanNeedsTypesData.push(newItem);
      break;
    case "neighborhoods":
      newItem = {
        id: neighborhoodsData.length + 1,
        name: "New Neighborhood",
        nameArabic: "حي جديد",
        code: "NEW001",
        cityId: 1,
      };
      neighborhoodsData.push(newItem);
      break;
    case "humanitarianInterventionsTypes":
      newItem = {
        id: humanitarianInterventionsTypesData.length + 1,
        interveningParty: "New Organization",
        distributionDate: new Date().toISOString().split("T")[0],
      };
      humanitarianInterventionsTypesData.push(newItem);
      break;
    case "urbanClassifications":
      newItem = {
        id: urbanClassificationsData.length + 1,
        name: "New Classification",
        nameArabic: "تصنيف جديد",
        compositeUrbanValue: 1,
        urbanSectoralEffectiveness: 1,
      };
      urbanClassificationsData.push(newItem);
      break;
    case "administrativeClassifications":
      newItem = {
        id: administrativeClassificationsData.length + 1,
        name: "New Classification",
        nameArabic: "تصنيف جديد",
        compositeUrbanValue: 1,
      };
      administrativeClassificationsData.push(newItem);
      break;
    case "conditions":
      newItem = {
        id: conditionsData.length + 1,
        name: "New Condition",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      conditionsData.push(newItem);
      break;
    case "infrastructureConditions":
      newItem = {
        id: infrastructureConditionsData.length + 1,
        name: "New Condition",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      infrastructureConditionsData.push(newItem);
      break;
    case "workersConditions":
      newItem = {
        id: workersConditionsData.length + 1,
        name: "New Condition",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      workersConditionsData.push(newItem);
      break;
    case "consumablesConditions":
      newItem = {
        id: consumablesConditionsData.length + 1,
        name: "New Condition",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      consumablesConditionsData.push(newItem);
      break;
    case "transportationMobilityTypes":
      newItem = {
        id: transportationMobilityTypesData.length + 1,
        name: "New Type",
        nameArabic: "نوع جديد",
        description: "New description",
        compositeUrbanValue: 1,
      };
      transportationMobilityTypesData.push(newItem);
      break;
    case "mobilityCentersTypes":
      newItem = {
        id: mobilityCentersTypesData.length + 1,
        name: "New Type",
        nameArabic: "نوع جديد",
        description: "New description",
        compositeUrbanValue: 1,
      };
      mobilityCentersTypesData.push(newItem);
      break;
    case "suppliesNames":
      newItem = {
        id: suppliesNamesData.length + 1,
        name: "New Supply",
        nameArabic: "مؤن جديدة",
        compositeUrbanValue: 1,
      };
      suppliesNamesData.push(newItem);
      break;
    case "operationStatuses":
      newItem = {
        id: operationStatusesData.length + 1,
        name: "New Status",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      operationStatusesData.push(newItem);
      break;
    case "healthServiceFacilities":
      newItem = {
        id: healthServiceFacilitiesData.length + 1,
        name: "New Facility",
        nameArabic: "مرفق جديد",
        compositeUrbanValue: 1,
      };
      healthServiceFacilitiesData.push(newItem);
      break;
    case "infrastructureStatusesArchitectural":
      newItem = {
        id: infrastructureStatusesArchitecturalData.length + 1,
        name: "New Status",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      infrastructureStatusesArchitecturalData.push(newItem);
      break;
    case "availabilityStatuses":
      newItem = {
        id: availabilityStatusesData.length + 1,
        name: "New Status",
        nameArabic: "حالة جديدة",
        compositeUrbanValue: 1,
      };
      availabilityStatusesData.push(newItem);
      break;
    case "infrastructureFacilities":
      newItem = {
        id: infrastructureFacilitiesData.length + 1,
        name: "New Facility",
        nameArabic: "مرفق جديد",
        compositeUrbanValue: 1,
      };
      infrastructureFacilitiesData.push(newItem);
      break;
    case "administrativeServicesNames":
      newItem = {
        id: administrativeServicesNamesData.length + 1,
        name: "New Service",
        nameArabic: "خدمة جديدة",
        compositeUrbanValue: 1,
      };
      administrativeServicesNamesData.push(newItem);
      break;
    case "otherServicesNames":
      newItem = {
        id: otherServicesNamesData.length + 1,
        name: "New Service",
        nameArabic: "خدمة جديدة",
        compositeUrbanValue: 1,
      };
      otherServicesNamesData.push(newItem);
      break;
    case "facilityTypes":
      newItem = {
        id: facilityTypesData.length + 1,
        name: "New Type",
        nameArabic: "نوع جديد",
        compositeUrbanValue: 1,
      };
      facilityTypesData.push(newItem);
      break;
    case "participationTypes":
      newItem = {
        id: participationTypesData.length + 1,
        name: "New Type",
        nameArabic: "نوع جديد",
        compositeUrbanValue: 1,
      };
      participationTypesData.push(newItem);
      break;
    case "potentialPartners":
      newItem = {
        id: potentialPartnersData.length + 1,
        name: "New Partner",
        nameArabic: "شريك جديد",
        compositeUrbanValue: 1,
      };
      potentialPartnersData.push(newItem);
      break;
    case "marketTypes":
      newItem = {
        id: marketTypesData.length + 1,
        name: "New Type",
        nameArabic: "نوع جديد",
        compositeUrbanValue: 1,
      };
      marketTypesData.push(newItem);
      break;
    case "randomLocations":
      newItem = {
        id: randomLocationsData.length + 1,
        name: "New Location",
        nameArabic: "موقع جديد",
        compositeUrbanValue: 1,
      };
      randomLocationsData.push(newItem);
      break;
    case "streetCleanlinessLevels":
      newItem = {
        id: streetCleanlinessLevelsData.length + 1,
        name: "New Level",
        nameArabic: "مستوى جديد",
        compositeUrbanValue: 1,
      };
      streetCleanlinessLevelsData.push(newItem);
      break;
    case "insectControls":
      newItem = {
        id: insectControlsData.length + 1,
        name: "New Control",
        nameArabic: "مكافحة جديدة",
        compositeUrbanValue: 1,
      };
      insectControlsData.push(newItem);
      break;
    case "rubbleRemovals":
      newItem = {
        id: rubbleRemovalsData.length + 1,
        name: "New Removal",
        nameArabic: "إزالة جديدة",
        compositeUrbanValue: 1,
      };
      rubbleRemovalsData.push(newItem);
      break;
    case "committeeRoles":
      newItem = {
        id: committeeRolesData.length + 1,
        name: "دور جديد",
      };
      committeeRolesData.push(newItem);
      break;
    case "coordinationType":
      newItem = {
        id: coordinationTypeData.length + 1,
        name: "نوع تنسيق جديد",
      };
      coordinationTypeData.push(newItem);
      break;
    case "projectTypes":
      newItem = {
        id: projectTypesData.length + 1,
        typeName: "New Project Type",
        typeNameArabic: "نوع مشروع جديد",
      };
      projectTypesData.push(newItem);
      break;
    case "projectStatuses":
      newItem = {
        id: projectStatusesData.length + 1,
        statusName: "New Status",
        statusNameArabic: "حالة جديدة",
      };
      projectStatusesData.push(newItem);
      break;
    case "projectNames":
      newItem = {
        id: projectNamesData.length + 1,
        name: "New Project Name",
        nameArabic: "اسم مشروع جديد",
      };
      projectNamesData.push(newItem);
      break;
    case "functionalityLevels":
      newItem = {
        id: functionalityLevelsData.length + 1,
        levelName: "New Functionality Level",
        levelNameArabic: "مستوى فاعلية جديد",
      };
      functionalityLevelsData.push(newItem);
      break;
    default:
      console.error(`Unknown table name: ${tableName}`);
      return;
  }
  displayData(tableName);

  // Show success message
  showNotification("تمت إضافة عنصر جديد بنجاح", "success");
}

// أضف هذا الكائن أعلى كود الجافاسكريبت
const editModalTranslations = {
  ar: {
    title: "تعديل البيانات",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    id: "معرف:",
    nameEn: "الاسم بالإنجليزية:",
    nameAr: "الاسم بالعربية:",
    code: "الرمز:",
    cityId: "معرف المدينة:",
    distributionDate: "تاريخ التوزيع:",
    interveningParty: "الجهة المتدخلة:",
  },
  en: {
    title: "Edit Data",
    cancel: "Cancel",
    save: "Save Changes",
    id: "ID:",
    nameEn: "Name in English:",
    nameAr: "Name in Arabic:",
    code: "Code:",
    cityId: "City ID:",
    distributionDate: "Distribution Date:",
    interveningParty: "Intervening Party:",
  },
};

// استبدل دالة editRow بالكامل بهذا الكود:
function editRow(tableName, index) {
  let data = [];
  let item = {};
  switch (tableName) {
    case "needItems":
      data = needItemsData;
      break;
    case "operationalStatuses":
      data = operationalStatusesData;
      break;
    case "interventionPriorities":
      data = interventionPrioritiesData;
      break;
    case "infrastructureStatuses":
      data = infrastructureStatusesData;
      break;
    case "staffStatuses":
      data = staffStatusesData;
      break;
    case "consumablesStatuses":
      data = consumablesStatusesData;
      break;
    case "damageLevels":
      data = damageLevelsData;
      break;
    case "networkStatuses":
      data = networkStatusesData;
      break;
    case "supplyOperationLevel":
      data = supplyOperationLevelData;
      break;
    case "ownershipDocumentationTypes":
      data = ownershipDocumentationTypesData;
      break;
    case "damageDescriptions":
      data = damageDescriptionsData;
      break;
    case "ownershipTypes":
      data = ownershipTypesData;
      break;
    case "urbanConditions":
      data = urbanConditionsData;
      break;
    case "dominantLandUses":
      data = dominantLandUsesData;
      break;
    case "humanNeedsTypes":
      data = humanNeedsTypesData;
      break;
    case "neighborhoods":
      data = neighborhoodsData;
      break;
    case "urbanClassifications":
      data = urbanClassificationsData;
      break;
    case "administrativeClassifications":
      data = administrativeClassificationsData;
      break;
    case "conditions":
      data = conditionsData;
      break;
    case "infrastructureConditions":
      data = infrastructureConditionsData;
      break;
    case "workersConditions":
      data = workersConditionsData;
      break;
    case "consumablesConditions":
      data = consumablesConditionsData;
      break;
    case "transportationMobilityTypes":
      data = transportationMobilityTypesData;
      break;
    case "mobilityCentersTypes":
      data = mobilityCentersTypesData;
      break;
    case "suppliesNames":
      data = suppliesNamesData;
      break;
    case "operationStatuses":
      data = operationStatusesData;
      break;
    case "healthServiceFacilities":
      data = healthServiceFacilitiesData;
      break;
    case "infrastructureStatusesArchitectural":
      data = infrastructureStatusesArchitecturalData;
      break;
    case "availabilityStatuses":
      data = availabilityStatusesData;
      break;
    case "infrastructureFacilities":
      data = infrastructureFacilitiesData;
      break;
    case "administrativeServicesNames":
      data = administrativeServicesNamesData;
      break;
    case "otherServicesNames":
      data = otherServicesNamesData;
      break;
    case "facilityTypes":
      data = facilityTypesData;
      break;
    case "participationTypes":
      data = participationTypesData;
      break;
    case "potentialPartners":
      data = potentialPartnersData;
      break;
    case "marketTypes":
      data = marketTypesData;
      break;
    case "randomLocations":
      data = randomLocationsData;
      break;
    case "streetCleanlinessLevels":
      data = streetCleanlinessLevelsData;
      break;
    case "insectControls":
      data = insectControlsData;
      break;
    case "rubbleRemovals":
      data = rubbleRemovalsData;
      break;
    case "committeeRoles":
      data = committeeRolesData;
      break;
    case "coordinationType":
      data = coordinationTypeData;
      break;
    case "projectTypes":
      data = projectTypesData;
      break;
    case "projectStatuses":
      data = projectStatusesData;
      break;
    case "projectNames":
      data = projectNamesData;
      break;
    case "functionalityLevels":
      data = functionalityLevelsData;
      break;
    default:
      console.error(`Unknown table name: ${tableName}`);
      return;
  }
  if (index >= 0 && index < data.length) {
    item = data[index];
  } else {
    console.error(`Invalid index: ${index} for table: ${tableName}`);
    return;
  }

  // Special handling for simple tables (committeeRoles, coordinationType)
  let formHTML;
  if (tableName === "committeeRoles" || tableName === "coordinationType") {
    formHTML = `
    <div class="edit-form">
      <div class="mb-3">
        <label for="editId" class="form-label">معرف / ID:</label>
        <input type="number" class="form-control" id="editId" value="${item.id}" readonly>
      </div>
      <div class="mb-3">
        <label for="editName" class="form-label">الاسم / Name:</label>
        <input type="text" class="form-control" id="editName" value="${item.name || ""}">
      </div>
    </div>
    `;
  } else if (tableName === "projectTypes" || tableName === "projectStatuses" || tableName === "projectNames" || tableName === "functionalityLevels" || tableName === "needItems") {
    // جداول المشاريع ومستويات الفاعلية وعناصر الاحتياج (بدون عمود القيمة العمرانية المركبة)
    formHTML = `
    <div class="edit-form">
      <div class="mb-3">
        <label for="editId" class="form-label">معرف / ID:</label>
        <input type="number" class="form-control" id="editId" value="${
          item.id
        }" readonly>
      </div>
      <div class="mb-3">
        <label for="editNameEn" class="form-label">الاسم بالإنجليزية / Name in English:</label>
        <input type="text" class="form-control" id="editNameEn" value="${
          item.typeName ||
          item.statusName ||
          item.name ||
          item.levelName ||
          item.itemName ||
          ""
        }">
      </div>
      <div class="mb-3">
        <label for="editNameAr" class="form-label">الاسم بالعربية / Name in Arabic:</label>
        <input type="text" class="form-control" id="editNameAr" value="${
          item.typeNameArabic ||
          item.statusNameArabic ||
          item.nameArabic ||
          item.levelNameArabic ||
          item.itemNameArabic ||
          ""
        }">
      </div>
    </div>
    `;
  } else {
    // Create a modal form to edit the data (فقط الحقول الأربعة المطلوبة)
    formHTML = `
    <div class="edit-form">
      <div class="mb-3">
        <label for="editId" class="form-label">معرف / ID:</label>
        <input type="number" class="form-control" id="editId" value="${
          item.id
        }" readonly>
      </div>
      <div class="mb-3">
        <label for="editNameEn" class="form-label">الاسم بالإنجليزية / Name in English:</label>
        <input type="text" class="form-control" id="editNameEn" value="${
          item.nameEn ||
          item.statusName ||
          item.name ||
          item.typeName ||
          item.levelName ||
          item.priorityName ||
          item.needType ||
          item.descriptionType ||
          item.interveningParty ||
          ""
        }">
      </div>
      <div class="mb-3">
        <label for="editNameAr" class="form-label">الاسم بالعربية / Name in Arabic:</label>
        <input type="text" class="form-control" id="editNameAr" value="${
          item.nameAr ||
          item.statusNameArabic ||
          item.nameArabic ||
          item.typeNameArabic ||
          item.levelNameArabic ||
          item.priorityNameArabic ||
          item.needTypeArabic ||
          item.descriptionTypeArabic ||
          ""
        }">
      </div>
      <div class="mb-3">
        <label for="editUrbanSectoralEffectiveness" class="form-label">الفعالية العمرانية القطاعية / Urban Sectoral Effectiveness:</label>
        <input type="number" class="form-control" id="editUrbanSectoralEffectiveness" value="${
          item.compositeUrbanValue || item.urbanSectoralEffectiveness || 0
        }">
      </div>
    </div>
    `;
  }

  // Create a modal to display the form
  const editModal = document.createElement("div");
  editModal.className = "modal fade";
  editModal.id = "editItemModal";
  editModal.setAttribute("tabindex", "-1");
  editModal.setAttribute("aria-labelledby", "editItemModalLabel");
  editModal.setAttribute("aria-hidden", "true");

  // Apply more compact styles to the form
  const compactFormHTML = formHTML
    .replace(/mb-3/g, "mb-2")
    .replace(/form-control/g, "form-control form-control-sm");

  editModal.innerHTML = `
  <div class="modal-dialog edit-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="editItemModalLabel">تعديل البيانات / Edit Data</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        ${compactFormHTML}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء / Cancel</button>
        <button type="button" class="btn btn-primary" id="saveEditBtn">حفظ التغييرات / Save Changes</button>
      </div>
    </div>
  </div>
`;

  // Add the modal to the document
  document.body.appendChild(editModal);

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("editItemModal"));
  modal.show();

  // Handle the save changes event
  document.getElementById("saveEditBtn").addEventListener("click", function () {
    // Get the form values
    const editedItem = { ...item }; // Clone the original object

    // Special handling for simple tables
    if (tableName === "committeeRoles" || tableName === "coordinationType") {
      editedItem.id = parseInt(document.getElementById("editId").value) || editedItem.id;
      editedItem.name = document.getElementById("editName").value;
    } else if (tableName === "projectTypes" || tableName === "projectStatuses" || tableName === "projectNames" || tableName === "functionalityLevels" || tableName === "needItems") {
      // جداول المشاريع ومستويات الفاعلية وعناصر الاحتياج (بدون عمود القيمة العمرانية المركبة)
      editedItem.id = parseInt(document.getElementById("editId").value) || editedItem.id;
      const nameEnValue = document.getElementById("editNameEn").value;
      const nameArValue = document.getElementById("editNameAr").value;

      // تحديث الحقول حسب نوع الجدول
      if (editedItem.typeName !== undefined) {
        editedItem.typeName = nameEnValue;
        editedItem.typeNameArabic = nameArValue;
      }
      if (editedItem.statusName !== undefined) {
        editedItem.statusName = nameEnValue;
        editedItem.statusNameArabic = nameArValue;
      }
      if (editedItem.name !== undefined) {
        editedItem.name = nameEnValue;
        editedItem.nameArabic = nameArValue;
      }
      if (editedItem.levelName !== undefined) {
        editedItem.levelName = nameEnValue;
        editedItem.levelNameArabic = nameArValue;
      }
      if (editedItem.itemName !== undefined) {
        editedItem.itemName = nameEnValue;
        editedItem.itemNameArabic = nameArValue;
      }
    } else {
      // Update the values for the four fields only
      editedItem.id =
        parseInt(document.getElementById("editId").value) || editedItem.id;
      // تحديث الحقول حسب نوع الجدول
      const nameEnValue = document.getElementById("editNameEn").value;
      const nameArValue = document.getElementById("editNameAr").value;
      
      // تحديث القيمة العمرانية فقط للجداول التي تحتاجها
      if (tableName !== "projectTypes" && 
          tableName !== "projectStatuses" && 
          tableName !== "projectNames" && 
          tableName !== "functionalityLevels") {
        const urbanValue =
          parseFloat(
            document.getElementById("editUrbanSectoralEffectiveness").value
          ) || 0;
        editedItem.compositeUrbanValue = urbanValue;
        editedItem.urbanSectoralEffectiveness = urbanValue;
      }

      // تحديث الحقول حسب نوع الجدول
      if (editedItem.statusName !== undefined) {
        editedItem.statusName = nameEnValue;
        editedItem.statusNameArabic = nameArValue;
      }
      if (editedItem.name !== undefined) {
        editedItem.name = nameEnValue;
        editedItem.nameArabic = nameArValue;
      }
      if (editedItem.typeName !== undefined) {
        editedItem.typeName = nameEnValue;
        editedItem.typeNameArabic = nameArValue;
      }
      if (editedItem.levelName !== undefined) {
        editedItem.levelName = nameEnValue;
        editedItem.levelNameArabic = nameArValue;
      }
      if (editedItem.priorityName !== undefined) {
        editedItem.priorityName = nameEnValue;
        editedItem.priorityNameArabic = nameArValue;
      }
      if (editedItem.needType !== undefined) {
        editedItem.needType = nameEnValue;
        editedItem.needTypeArabic = nameArValue;
      }
      if (editedItem.descriptionType !== undefined) {
        editedItem.descriptionType = nameEnValue;
        editedItem.descriptionTypeArabic = nameArValue;
      }
      // لم يعد هناك حاجة لهذا السطر:
      // if (editedItem.urbanSectoralEffectiveness !== undefined) editedItem.urbanSectoralEffectiveness = editedItem.compositeUrbanValue;
    }

    // Update the element in the array
    data[index] = editedItem;

    // Update the table
    displayData(tableName);

    // Close the modal
    modal.hide();

    // Display success message
    showNotification("تم تحديث البيانات بنجاح", "success");

    // Remove the modal from the DOM after closing it
    document
      .getElementById("editItemModal")
      .addEventListener("hidden.bs.modal", function () {
        const modal = document.getElementById("editItemModal");
        if (modal) {
          modal.remove();
        }
      });
  });

  // Remove the modal from the DOM when it closes
  document
    .getElementById("editItemModal")
    .addEventListener("hidden.bs.modal", function () {
      const modal = document.getElementById("editItemModal");
      if (modal) {
        modal.remove();
      }
    });
}

// Function to delete a row
function deleteRow(tableName, index) {
  // if (confirm(`هل أنت متأكد من حذف الصف ${index + 1} من الجدول ${tableName}؟\nAre you sure you want to delete row ${index + 1} from table ${tableName}?`)) {
  if (
    confirm(`هل أنت متأكد من حذف الصف ${index + 1} من الجدول ${tableName}؟`)
  ) {
    let data = [];
    switch (tableName) {
      case "needItems":
        data = needItemsData;
        break;
      case "operationalStatuses":
        data = operationalStatusesData;
        break;
      case "interventionPriorities":
        data = interventionPrioritiesData;
        break;
      case "infrastructureStatuses":
        data = infrastructureStatusesData;
        break;
      case "staffStatuses":
        data = staffStatusesData;
        break;
      case "consumablesStatuses":
        data = consumablesStatusesData;
        break;
      case "damageLevels":
        data = damageLevelsData;
        break;
      case "networkStatuses":
        data = networkStatusesData;
        break;
      case "supplyOperationLevel":
        data = supplyOperationLevelData;
        break;
      case "ownershipDocumentationTypes":
        data = ownershipDocumentationTypesData;
        break;
      case "damageDescriptions":
        data = damageDescriptionsData;
        break;
      case "ownershipTypes":
        data = ownershipTypesData;
        break;
      case "urbanConditions":
        data = urbanConditionsData;
        break;
      case "dominantLandUses":
        data = dominantLandUsesData;
        break;
      case "humanNeedsTypes":
        data = humanNeedsTypesData;
        break;
      case "neighborhoods":
        data = neighborhoodsData;
        break;
      case "humanitarianInterventionsTypes":
        data = humanitarianInterventionsTypesData;
        break;
      case "urbanClassifications":
        data = urbanClassificationsData;
        break;
      case "administrativeClassifications":
        data = administrativeClassificationsData;
        break;
      case "conditions":
        data = conditionsData;
        break;
      case "infrastructureConditions":
        data = infrastructureConditionsData;
        break;
      case "workersConditions":
        data = workersConditionsData;
        break;
      case "consumablesConditions":
        data = consumablesConditionsData;
        break;
      case "transportationMobilityTypes":
        data = transportationMobilityTypesData;
        break;
      case "mobilityCentersTypes":
        data = mobilityCentersTypesData;
        break;
      case "suppliesNames":
        data = suppliesNamesData;
        break;
      case "operationStatuses":
        data = operationStatusesData;
        break;
      case "healthServiceFacilities":
        data = healthServiceFacilitiesData;
        break;
      case "infrastructureStatusesArchitectural":
        data = infrastructureStatusesArchitecturalData;
        break;
      case "availabilityStatuses":
        data = availabilityStatusesData;
        break;
      case "infrastructureFacilities":
        data = infrastructureFacilitiesData;
        break;
      case "administrativeServicesNames":
        data = administrativeServicesNamesData;
        break;
      case "otherServicesNames":
        data = otherServicesNamesData;
        break;
      case "facilityTypes":
        data = facilityTypesData;
        break;
      case "participationTypes":
        data = participationTypesData;
        break;
      case "potentialPartners":
        data = potentialPartnersData;
        break;
      case "marketTypes":
        data = marketTypesData;
        break;
      case "randomLocations":
        data = randomLocationsData;
        break;
      case "streetCleanlinessLevels":
        data = streetCleanlinessLevelsData;
        break;
      case "insectControls":
        data = insectControlsData;
        break;
      case "rubbleRemovals":
        data = rubbleRemovalsData;
        break;
      case "committeeRoles":
        data = committeeRolesData;
        break;
      case "coordinationType":
        data = coordinationTypeData;
        break;
      case "projectTypes":
        data = projectTypesData;
        break;
      case "projectStatuses":
        data = projectStatusesData;
        break;
      case "projectNames":
        data = projectNamesData;
        break;
      case "functionalityLevels":
        data = functionalityLevelsData;
        break;
    default:
      console.error(`Unknown table name: ${tableName}`);
      return;
    }
    data.splice(index, 1);
    displayData(tableName);

    // Show success message
    showNotification("تم حذف العنصر بنجاح", "success");
  }
}

// Initialize modals and tables
document.addEventListener("DOMContentLoaded", () => {
  // Initialize modals when they open
  document.querySelectorAll(".modal").forEach((modal) => {
    // Load data immediately for all modals
    const tableName = modal.getAttribute("data-table");
    if (tableName) {
      displayData(tableName);
    }

    // Configure event for when the modal opens
    modal.addEventListener("show.bs.modal", function (event) {
      const modalTableName = this.getAttribute("data-table");
      if (modalTableName) {
        displayData(modalTableName);
      }
    });
  });
});

const tableHeadersTranslations = {
  needItems: [
    { ar: "#", en: "#" },
    { ar: "معرف عنصر الاحتياج", en: "Need Item ID" },
    { ar: "اسم عنصر الاحتياج", en: "Need Item Name" },
    { ar: "إجراءات", en: "Actions" },
  ],
  operationalStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف الحالة التشغيلية", en: "Operation Status ID" },
    { ar: "اسم الحالة التشغيلية", en: "Operation Status Name" },
    {
      ar: "اسم الحالة التشغيلية بالعربية",
      en: "Operation Status Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  interventionPriorities: [
    { ar: "#", en: "#" },
    { ar: "معرف أولوية التدخل", en: "Intervention Priority ID" },
    { ar: "اسم أولوية التدخل", en: "Intervention Priority Name" },
    {
      ar: "اسم أولوية التدخل باللغة العربية",
      en: "Intervention Priority Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  infrastructureStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف حالة البنية التحتية", en: "Infrastructure Status ID" },
    { ar: "اسم حالة البنية التحتية", en: "Infrastructure Status Name" },
    {
      ar: "اسم حالة البنية التحتية باللغة العربية",
      en: "Infrastructure Status Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  staffStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف حالة الموظفين", en: "Staff Status ID" },
    { ar: "اسم حالة الموظفين", en: "Staff Status Name" },
    {
      ar: "اسم حالة الموظفين باللغة العربية",
      en: "Staff Status Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  consumablesStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف حالة المستهلكات", en: "Consumable Status ID" },
    { ar: "اسم حالة المستهلكات", en: "Consumable Status Name" },
    {
      ar: "اسم حالة المستهلكات باللغة العربية",
      en: "Consumable Status Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  damageLevels: [
    { ar: "#", en: "#" },
    { ar: "معرف مستوى الضرر", en: "Damage Level ID" },
    { ar: "اسم مستوى الضرر", en: "Damage Level Name" },
    {
      ar: "اسم مستوى الضرر باللغة العربية",
      en: "Damage Level Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  networkStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف حالة الشبكة", en: "Network Status ID" },
    { ar: "اسم حالة الشبكة", en: "Network Status Name" },
    {
      ar: "اسم حالة الشبكة باللغة العربية",
      en: "Network Status Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  supplyOperationLevel: [
    { ar: "#", en: "#" },
    {
      ar: "معرف مستوى تشغيل خطوط الإمداد",
      en: "Supply Operation Level ID",
    },
    {
      ar: "اسم مستوى تشغيل خطوط الإمداد",
      en: "Supply Operation Level Name",
    },
    {
      ar: "اسم مستوى تشغيل خطوط الإمداد باللغة العربية",
      en: "Supply Operation Level Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  ownershipDocumentationTypes: [
    { ar: "#", en: "#" },
    {
      ar: "معرف نوع التوثيق والحماية",
      en: "Ownership Documentation Type ID",
    },
    {
      ar: "اسم نوع التوثيق والحماية",
      en: "Ownership Documentation Type Name",
    },
    {
      ar: "اسم نوع التوثيق والحماية باللغة العربية",
      en: "Ownership Documentation Type Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  damageDescriptions: [
    { ar: "#", en: "#" },
    { ar: "معرف وصف الضرر", en: "Damage Description ID" },
    { ar: "اسم وصف الضرر", en: "Damage Description Name" },
    {
      ar: "اسم وصف الضرر باللغة العربية",
      en: "Damage Description Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  ownershipTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف نوع الملكية السائد", en: "Ownership Type ID" },
    { ar: "اسم نوع الملكية السائد", en: "Ownership Type Name" },
    {
      ar: "اسم نوع الملكية السائد باللغة العربية",
      en: "Ownership Type Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  urbanConditions: [
    { ar: "#", en: "#" },
    { ar: "معرف الحالة العمرانية", en: "Urban Condition ID" },
    { ar: "اسم الحالة العمرانية", en: "Urban Condition Name" },
    {
      ar: "اسم الحالة العمرانية باللغة العربية",
      en: "Urban Condition Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  dominantLandUses: [
    { ar: "#", en: "#" },
    { ar: "معرف الوظيفة العمرانية السائدة", en: "Dominant Land Use ID" },
    { ar: "الوظيفة العمرانية السائدة", en: "Dominant Land Use" },
    {
      ar: "الوظيفة العمرانية السائدة باللغة العربية",
      en: "Dominant Land Use (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  humanNeedsTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف نوع الاحتياجات البشرية", en: "Human Need Type ID" },
    { ar: "اسم نوع الاحتياجات البشرية", en: "Human Need Type Name" },
    {
      ar: "اسم نوع الاحتياجات البشرية باللغة العربية",
      en: "Human Need Type Name (Arabic)",
    },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  neighborhoods: [
    { ar: "#", en: "#" },
    { ar: "معرف الحي", en: "Neighborhood ID" },
    { ar: "اسم الحي", en: "Neighborhood Name" },
    { ar: "اسم الحي باللغة العربية", en: "Neighborhood Name (Arabic)" },
    { ar: "رمز الحي", en: "Neighborhood Code" },
    { ar: "معرف المدينة", en: "City ID" },
    { ar: "إجراءات", en: "Actions" },
  ],
  humanitarianInterventionsTypes: [
    { ar: "#", en: "#" },
    {
      ar: "معرف نوع التدخل الإنساني",
      en: "Humanitarian Intervention Type ID",
    },
    {
      ar: "اسم نوع التدخل الإنساني",
      en: "Humanitarian Intervention Type Name",
    },
    { ar: "تاريخ التوزيع", en: "Distribution Date" },
    {
      ar: "الفعالية العمرانية القطاعية",
      en: "Urban Sectoral Effectiveness",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  committeeRoles: [
    { ar: "#", en: "#" },
    { ar: "اسم الدور", en: "Role Name" },
    { ar: "إجراءات", en: "Actions" },
  ],
  coordinationType: [
    { ar: "#", en: "#" },
    { ar: "اسم نوع التنسيق", en: "Coordination Type Name" },
    { ar: "إجراءات", en: "Actions" },
  ],
  projectTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف نوع المشروع", en: "Project Type ID" },
    { ar: "الاسم بالإنجليزية", en: "Name in English" },
    { ar: "الاسم بالعربية", en: "Name in Arabic" },
    { ar: "إجراءات", en: "Actions" },
  ],
  projectStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف حالة المشروع", en: "Project Status ID" },
    { ar: "الاسم بالإنجليزية", en: "Name in English" },
    { ar: "الاسم بالعربية", en: "Name in Arabic" },
    { ar: "إجراءات", en: "Actions" },
  ],
  projectNames: [
    { ar: "#", en: "#" },
    { ar: "معرف اسم المشروع", en: "Project Name ID" },
    { ar: "الاسم بالإنجليزية", en: "Name in English" },
    { ar: "الاسم بالعربية", en: "Name in Arabic" },
    { ar: "إجراءات", en: "Actions" },
  ],
  functionalityLevels: [
    { ar: "#", en: "#" },
    { ar: "معرف مستوى الفاعلية", en: "Functionality Level ID" },
    { ar: "اسم مستوى الفاعلية", en: "Functionality Level Name" },
    { ar: "اسم مستوى الفاعلية باللغة العربية", en: "Functionality Level Name (Arabic)" },
    { ar: "إجراءات", en: "Actions" },
  ],
  urbanClassifications: [
    { ar: "#", en: "#" },
    { ar: "معرف التصنيف الإداري", en: "Urban Classification ID" },
    { ar: "اسم التصنيف الإداري", en: "Urban Classification Name" },
    {
      ar: "اسم التصنيف الإداري باللغة العربية",
      en: "Urban Classification Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  administrativeClassifications: [
    { ar: "#", en: "#" },
    { ar: "معرف الصفة الإدارية", en: "Administrative Classification ID" },
    { ar: "اسم الصفة الإدارية", en: "Administrative Classification Name" },
    {
      ar: "اسم الصفة الإدارية باللغة العربية",
      en: "Administrative Classification Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  transportationMobilityTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف أسماء النقل والتنقل", en: "Transportation Mobility Type ID" },
    { ar: "اسم أسماء النقل والتنقل", en: "Transportation Mobility Type Name" },
    {
      ar: "اسم أسماء النقل والتنقل باللغة العربية",
      en: "Transportation Mobility Type Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  mobilityCentersTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف مرافق النقل", en: "Mobility Center Type ID" },
    { ar: "اسم مرافق النقل", en: "Mobility Center Type Name" },
    {
      ar: "اسم مرافق النقل باللغة العربية",
      en: "Mobility Center Type Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  suppliesNames: [
    { ar: "#", en: "#" },
    { ar: "معرف أسماء المؤون والبضائع", en: "Supply Name ID" },
    { ar: "اسم أسماء المؤون والبضائع", en: "Supply Name" },
    {
      ar: "اسم أسماء المؤون والبضائع باللغة العربية",
      en: "Supply Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  operationStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف الحالة التشغيلية", en: "Operation Status ID" },
    { ar: "اسم الحالة التشغيلية", en: "Operation Status Name" },
    {
      ar: "اسم الحالة التشغيلية باللغة العربية",
      en: "Operation Status Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  healthServiceFacilities: [
    { ar: "#", en: "#" },
    { ar: "معرف مرافق الخدمة الصحية", en: "Health Service Facility ID" },
    { ar: "اسم مرافق الخدمة الصحية", en: "Health Service Facility Name" },
    {
      ar: "اسم مرافق الخدمة الصحية باللغة العربية",
      en: "Health Service Facility Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  availabilityStatuses: [
    { ar: "#", en: "#" },
    { ar: "معرف واقع الكادر أو العاملون والمستهلكات", en: "Availability Status ID" },
    { ar: "اسم واقع الكادر أو العاملون والمستهلكات", en: "Availability Status Name" },
    {
      ar: "اسم واقع الكادر أو العاملون والمستهلكات باللغة العربية",
      en: "Availability Status Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  infrastructureFacilities: [
    { ar: "#", en: "#" },
    { ar: "معرف مرافق البنية التحتية", en: "Infrastructure Facility ID" },
    { ar: "اسم مرافق البنية التحتية", en: "Infrastructure Facility Name" },
    {
      ar: "اسم مرافق البنية التحتية باللغة العربية",
      en: "Infrastructure Facility Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  administrativeServicesNames: [
    { ar: "#", en: "#" },
    { ar: "معرف أسماء الخدمات الإدارية", en: "Administrative Service Name ID" },
    { ar: "اسم أسماء الخدمات الإدارية", en: "Administrative Service Name" },
    {
      ar: "اسم أسماء الخدمات الإدارية باللغة العربية",
      en: "Administrative Service Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  otherServicesNames: [
    { ar: "#", en: "#" },
    { ar: "معرف أسماء الخدمات الأخرى", en: "Other Service Name ID" },
    { ar: "اسم أسماء الخدمات الأخرى", en: "Other Service Name" },
    {
      ar: "اسم أسماء الخدمات الأخرى باللغة العربية",
      en: "Other Service Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  facilityTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف أنواع المنشآت", en: "Facility Type ID" },
    { ar: "اسم أنواع المنشآت", en: "Facility Type Name" },
    {
      ar: "اسم أنواع المنشآت باللغة العربية",
      en: "Facility Type Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  participationTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف أنواع المشاركة", en: "Participation Type ID" },
    { ar: "اسم أنواع المشاركة", en: "Participation Type Name" },
    {
      ar: "اسم أنواع المشاركة باللغة العربية",
      en: "Participation Type Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  potentialPartners: [
    { ar: "#", en: "#" },
    { ar: "معرف أسماء الشركاء المحتملين للوحدات الإدارية", en: "Potential Partner ID" },
    { ar: "اسم أسماء الشركاء المحتملين للوحدات الإدارية", en: "Potential Partner Name" },
    {
      ar: "اسم أسماء الشركاء المحتملين للوحدات الإدارية باللغة العربية",
      en: "Potential Partner Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  marketTypes: [
    { ar: "#", en: "#" },
    { ar: "معرف أنواع الأسواق", en: "Market Type ID" },
    { ar: "اسم أنواع الأسواق", en: "Market Type Name" },
    {
      ar: "اسم أنواع الأسواق باللغة العربية",
      en: "Market Type Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  randomLocations: [
    { ar: "#", en: "#" },
    { ar: "معرف المواقع العشوائية", en: "Random Location ID" },
    { ar: "اسم المواقع العشوائية", en: "Random Location Name" },
    {
      ar: "اسم المواقع العشوائية باللغة العربية",
      en: "Random Location Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  streetCleanlinessLevels: [
    { ar: "#", en: "#" },
    { ar: "معرف مستويات نظافة الشوارع", en: "Street Cleanliness Level ID" },
    { ar: "اسم مستويات نظافة الشوارع", en: "Street Cleanliness Level Name" },
    {
      ar: "اسم مستويات نظافة الشوارع باللغة العربية",
      en: "Street Cleanliness Level Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  insectControls: [
    { ar: "#", en: "#" },
    { ar: "معرف مكافحة الحشرات", en: "Insect Control ID" },
    { ar: "اسم مكافحة الحشرات", en: "Insect Control Name" },
    {
      ar: "اسم مكافحة الحشرات باللغة العربية",
      en: "Insect Control Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
  rubbleRemovals: [
    { ar: "#", en: "#" },
    { ar: "معرف إزالة الأنقاض", en: "Rubble Removal ID" },
    { ar: "اسم إزالة الأنقاض", en: "Rubble Removal Name" },
    {
      ar: "اسم إزالة الأنقاض باللغة العربية",
      en: "Rubble Removal Name (Arabic)",
    },
    {
      ar: "القيمة العمرانية المركبة",
      en: "Composite Urban Value",
    },
    { ar: "إجراءات", en: "Actions" },
  ],
};

// Helper: get current direction
function getCurrentDir() {
  return currentLang === "ar" ? "rtl" : "ltr";
}

// Update table headers and direction
function updateTableHeadersAndDir(tableName) {
  const headers = tableHeadersTranslations[tableName];
  if (!headers) return;
  const modal = document.querySelector(`[data-table="${tableName}"]`);
  if (!modal) return;
  const table = modal.querySelector(".table");
  if (!table) return;
  // Set direction
  table.setAttribute("dir", getCurrentDir());
  // Update headers
  const ths = table.querySelectorAll("thead th");
  headers.forEach((header, idx) => {
    if (ths[idx]) ths[idx].textContent = header[currentLang] || header["ar"];
  });
}

document.updateTableHeaders = updateTableHeadersAndDir;

// Function to update any modal's language and direction
function updateModalLanguage(modal) {
  if (!modal) return;

  // Set the direction attribute
  modal.setAttribute("dir", getCurrentDir());

  // Set text alignment for modal content
  const modalContent = modal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.style.textAlign = currentLang === "ar" ? "right" : "left";
  }

  // Update modal footer button order
  const modalFooter = modal.querySelector(".modal-footer");
  if (modalFooter) {
    modalFooter.style.flexDirection =
      currentLang === "ar" ? "row-reverse" : "row";
  }

  // Update form controls within the modal
  modal
    .querySelectorAll(".form-control, input, select, textarea")
    .forEach((input) => {
      input.style.textAlign = currentLang === "ar" ? "right" : "left";
      input.style.direction = currentLang === "ar" ? "rtl" : "ltr";
    });

  // Update labels within the modal
  modal.querySelectorAll(".form-label, label").forEach((label) => {
    label.style.textAlign = currentLang === "ar" ? "right" : "left";
    label.style.float = currentLang === "ar" ? "right" : "left";
    label.style.width = "100%";
  });
}

// Update edit modal direction and labels
function updateEditModalLang() {
  // Update all modals, not just editItemModal
  document.querySelectorAll(".modal").forEach((modal) => {
    updateModalLanguage(modal);
  });

  // Handle the edit modal specifically
  const editModal = document.getElementById("editItemModal");
  if (editModal) {
    // Update modal title and buttons
    const title = editModal.querySelector(".modal-title");
    if (title)
      title.textContent = currentLang === "ar" ? "تعديل البيانات" : "Edit Data";

    const cancelBtn = editModal.querySelector(".btn-secondary");
    if (cancelBtn)
      cancelBtn.textContent = currentLang === "ar" ? "إلغاء" : "Cancel";

    const saveBtn = editModal.querySelector("#saveEditBtn");
    if (saveBtn)
      saveBtn.textContent =
        currentLang === "ar" ? "حفظ التغييرات" : "Save Changes";

    // Update all form controls to match language direction
    editModal.querySelectorAll(".form-control").forEach((input) => {
      input.style.textAlign = currentLang === "ar" ? "right" : "left";
      input.style.direction = currentLang === "ar" ? "rtl" : "ltr";
    });

    // Update labels with proper language
    editModal.querySelectorAll("label[for]").forEach((label) => {
      if (label.htmlFor === "editId")
        label.textContent = currentLang === "ar" ? "معرف:" : "ID:";
      if (label.htmlFor === "editName" && !label.textContent.includes("الجهة"))
        label.textContent =
          currentLang === "ar" ? "الاسم بالإنجليزية:" : "Name in English:";
      if (label.htmlFor === "editNameEn")
        label.textContent =
          currentLang === "ar" ? "الاسم بالإنجليزية:" : "Name in English:";
      if (label.htmlFor === "editNameAr")
        label.textContent =
          currentLang === "ar" ? "الاسم بالعربية:" : "Name in Arabic:";
      if (label.htmlFor === "editNameArabic")
        label.textContent =
          currentLang === "ar" ? "الاسم بالعربية:" : "Name in Arabic:";
      if (label.htmlFor === "editCode")
        label.textContent = currentLang === "ar" ? "الرمز:" : "Code:";
      if (label.htmlFor === "editCityId")
        label.textContent = currentLang === "ar" ? "معرف المدينة:" : "City ID:";
      if (label.htmlFor === "editDistributionDate")
        label.textContent =
          currentLang === "ar" ? "تاريخ التوزيع:" : "Distribution Date:";
      if (label.htmlFor === "editName" && label.textContent.includes("الجهة"))
        label.textContent =
          currentLang === "ar" ? "الجهة المتدخلة:" : "Intervening Party:";

      // Set the label text alignment and direction
      label.style.textAlign = currentLang === "ar" ? "right" : "left";
      label.style.float = currentLang === "ar" ? "right" : "left";
      label.style.width = "100%";
    });
  }
}

// Patch editRow to set modal direction and labels
const originalEditRow = editRow;
editRow = function (tableName, index) {
  originalEditRow(tableName, index);
  setTimeout(updateEditModalLang, 10);
};

// Display data in the selected language and set direction
const originalDisplayData = displayData;
displayData = function (tableName) {
  // Use the correct language for cell values
  const dataMap = {
    operationalStatuses: operationalStatusesData,
    interventionPriorities: interventionPrioritiesData,
    infrastructureStatuses: infrastructureStatusesData,
    staffStatuses: staffStatusesData,
    consumablesStatuses: consumablesStatusesData,
    damageLevels: damageLevelsData,
    networkStatuses: networkStatusesData,
    supplyOperationLevel: supplyOperationLevelData,
    ownershipDocumentationTypes: ownershipDocumentationTypesData,
    damageDescriptions: damageDescriptionsData,
    ownershipTypes: ownershipTypesData,
    urbanConditions: urbanConditionsData,
    dominantLandUses: dominantLandUsesData,
    humanNeedsTypes: humanNeedsTypesData,
    neighborhoods: neighborhoodsData,
    humanitarianInterventionsTypes: humanitarianInterventionsTypesData,
    // إضافة الجداول الجديدة
    urbanClassifications: urbanClassificationsData,
    administrativeClassifications: administrativeClassificationsData,
    conditions: conditionsData,
    infrastructureConditions: infrastructureConditionsData,
    workersConditions: workersConditionsData,
    consumablesConditions: consumablesConditionsData,
    transportationMobilityTypes: transportationMobilityTypesData,
    mobilityCentersTypes: mobilityCentersTypesData,
    suppliesNames: suppliesNamesData,
    operationStatuses: operationStatusesData,
    healthServiceFacilities: healthServiceFacilitiesData,
    infrastructureStatusesArchitectural:
      infrastructureStatusesArchitecturalData,
    availabilityStatuses: availabilityStatusesData,
    infrastructureFacilities: infrastructureFacilitiesData,
    administrativeServicesNames: administrativeServicesNamesData,
    otherServicesNames: otherServicesNamesData,
    facilityTypes: facilityTypesData,
    participationTypes: participationTypesData,
    potentialPartners: potentialPartnersData,
    marketTypes: marketTypesData,
    randomLocations: randomLocationsData,
    streetCleanlinessLevels: streetCleanlinessLevelsData,
    insectControls: insectControlsData,
    rubbleRemovals: rubbleRemovalsData,
    committeeRoles: committeeRolesData,
    coordinationType: coordinationTypeData,
    projectTypes: projectTypesData,
    projectStatuses: projectStatusesData,
    projectNames: projectNamesData,
    functionalityLevels: functionalityLevelsData,
    needItems: needItemsData,
  };
  const data = dataMap[tableName] || [];
  const tableBodyId = `${tableName}TableBody`;
  const tableBody = document.getElementById(tableBodyId);
  if (!tableBody) return;
  tableBody.innerHTML = "";
  data.forEach((item, index) => {
    let nameField = "";
    let nameArabicField = "";
    let codeField = "";
    let cityIdField = "";
    let distributionDateField = "";
    let descriptionField = "";
    let compositeUrbanValueField = "";

    // Determine which fields to use - Column 3 always shows English, Column 4 always shows Arabic
    if (item.statusName !== undefined) {
      nameField = item.statusName; // Always English
      nameArabicField = item.statusNameArabic; // Always Arabic
    } else if (item.priorityName !== undefined) {
      nameField = item.priorityName; // Always English
      nameArabicField = item.priorityNameArabic; // Always Arabic
    } else if (item.levelName !== undefined) {
      nameField = item.levelName; // Always English
      nameArabicField = item.levelNameArabic; // Always Arabic
    } else if (item.typeName !== undefined) {
      nameField = item.typeName; // Always English
      nameArabicField = item.typeNameArabic; // Always Arabic
    } else if (item.conditionName !== undefined) {
      nameField = item.conditionName; // Always English
      nameArabicField = item.conditionNameArabic; // Always Arabic
    } else if (item.landUseName !== undefined) {
      nameField = item.landUseName; // Always English
      nameArabicField = item.landUseNameArabic; // Always Arabic
    } else if (item.needType !== undefined) {
      nameField = item.needType; // Always English
      nameArabicField = item.needTypeArabic; // Always Arabic
    } else if (item.name !== undefined) {
      nameField = item.name; // Always English
      nameArabicField = item.nameArabic; // Always Arabic
      codeField = item.code || "";
      cityIdField = item.cityId || "";
    } else if (item.nameEn !== undefined) {
      nameField = item.nameEn; // Always English
      nameArabicField = item.nameAr; // Always Arabic
      descriptionField = item.description || "";
      compositeUrbanValueField = item.compositeUrbanValue || 0;
    } else if (item.levelName !== undefined) {
      nameField = item.levelName; // Always English
      nameArabicField = item.levelNameArabic; // Always Arabic
    } else if (item.interveningParty !== undefined) {
      nameField = item.interveningParty;
      distributionDateField = item.distributionDate || "";
    } else if (item.descriptionType !== undefined) {
      nameField = item.descriptionType; // Always English
      nameArabicField = item.descriptionTypeArabic; // Always Arabic
    }

    // Handle Need Items table (single name column)
    if (tableName === "needItems") {
      const displayName = currentLang === "ar" ? item.itemNameArabic : item.itemName;
      let row = `<tr>
        <td>${index + 1}</td>
        <td>${item.id}</td>
        <td>${displayName}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-edit square-action-btn" onclick="editRow('${tableName}', ${index})" title="${currentLang === 'ar' ? 'تعديل' : 'Edit'}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger square-action-btn" style="max-width: 50px;" onclick="deleteRow('${tableName}', ${index})" title="${currentLang === 'ar' ? 'حذف' : 'Delete'}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>`;
      tableBody.innerHTML += row;
      return; // Skip to next item
    }
    // Special handling for simple tables (committeeRoles, coordinationType)
    if (tableName === "committeeRoles" || tableName === "coordinationType") {
      let row = `<tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-edit square-action-btn" onclick="editRow('${tableName}', ${index})" title="${
        currentLang === "ar" ? "تعديل" : "Edit"
      }">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger square-action-btn" style="max-width: 50px;" onclick="deleteRow('${tableName}', ${index})" title="${
        currentLang === "ar" ? "حذف" : "Delete"
      }">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>`;
      tableBody.innerHTML += row;
      return;
    }

    // Build row
    let row = `<tr><td>${index + 1}</td><td>${item.id}</td>`;
    // جداول المشاريع ومستويات الفاعلية (بدون عمود القيمة العمرانية المركبة)
    if (
      tableName === "projectTypes" ||
      tableName === "projectStatuses" ||
      tableName === "projectNames" ||
      tableName === "functionalityLevels"
    ) {
      row += `<td>${nameField}</td><td>${nameArabicField}</td>`;
    } else if (tableName === "neighborhoods") {
      row += `<td>${nameField}</td><td>${nameArabicField}</td><td>${codeField}</td><td>${cityIdField}</td>`;
    } else if (tableName === "humanitarianInterventionsTypes") {
      row += `<td>${nameField}</td><td>${distributionDateField}</td><td>${
        item.urbanSectoralEffectiveness || 0
      }</td>`;
    } else if (
      tableName === "urbanClassifications" ||
      tableName === "administrativeClassifications" ||
      tableName === "conditions" ||
      tableName === "infrastructureConditions" ||
      tableName === "workersConditions" ||
      tableName === "consumablesConditions" ||
      tableName === "transportationMobilityTypes" ||
      tableName === "mobilityCentersTypes" ||
      tableName === "suppliesNames" ||
      tableName === "operationStatuses" ||
      tableName === "healthServiceFacilities" ||
      tableName === "infrastructureStatusesArchitectural" ||
      tableName === "availabilityStatuses" ||
      tableName === "infrastructureFacilities" ||
      tableName === "administrativeServicesNames" ||
      tableName === "otherServicesNames" ||
      tableName === "facilityTypes" ||
      tableName === "participationTypes" ||
      tableName === "potentialPartners" ||
      tableName === "marketTypes" ||
      tableName === "randomLocations" ||
      tableName === "streetCleanlinessLevels" ||
      tableName === "insectControls" ||
      tableName === "rubbleRemovals"
    ) {
      row += `<td>${nameField}</td><td>${nameArabicField}</td><td>${compositeUrbanValueField}</td>`;
    } else {
      row += `<td>${nameField}</td><td>${nameArabicField}</td><td>${
        item.urbanSectoralEffectiveness || 0
      }</td>`;
    }
    row += `<td>
    <div class="btn-group">
      <button class="btn btn-edit square-action-btn" onclick="editRow('${tableName}', ${index})" title="${
      currentLang === "ar" ? "تعديل" : "Edit"
    }">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-danger square-action-btn" style="max-width: 50px;" onclick="deleteRow('${tableName}', ${index})" title="${
      currentLang === "ar" ? "حذف" : "Delete"
    }">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </td></tr>`;
    tableBody.innerHTML += row;
  });
  updateTableHeadersAndDir(tableName);
};

// Patch switchLanguage to update all tables and modals
const originalSwitchLanguage = switchLanguage;
switchLanguage = function (lang) {
  originalSwitchLanguage(lang);
  Object.keys(tableHeadersTranslations).forEach((tableName) => {
    updateTableHeadersAndDir(tableName);
    displayData(tableName);
  });
  updateEditModalLang();
};
