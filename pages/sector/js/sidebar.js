// global variables
let leftSidebarActive = false;
let rightSidebarActive = false;
let leftSidebarTimer = null;

// initialize the sidebars when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  initSidebars();
});

/**
 * initialize the sidebars and the buttons related to them
 */
function initSidebars() {
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");
  const mainContent = document.querySelector(".main-content");

  // toggle buttons in the left and right sidebars
  const toggleLeftSidebar = document.getElementById("toggleLeftSidebar");
  const toggleRightSidebar = document.getElementById("toggleRightSidebar");

  // toggle buttons in the header
  const toggleLeftSidebarBtn = document.getElementById("toggleLeftSidebarBtn");
  const toggleRightSidebarBtn = document.getElementById(
    "toggleRightSidebarBtn"
  );

  // initialize sidebars as collapsed by default
  leftSidebar.classList.add("collapsed");
  rightSidebar.classList.add("collapsed");

  // enable the sidebars in the wide mode only
  handleResponsiveSidebars();

  // set the click events for the toggle buttons
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

  // recalculate the sidebar positions when the window is resized
  window.addEventListener("resize", function () {
    handleResponsiveSidebars();
    // Hide overlay if window is resized to desktop
    const overlay = document.getElementById("sidebarOverlay");
    if (window.innerWidth >= 992 && overlay) {
      overlay.classList.remove("show");
    }
  });

  // Add click event listener to overlay to close sidebars
  const overlay = document.getElementById("sidebarOverlay");
  if (overlay) {
    overlay.addEventListener("click", function () {
      if (leftSidebarActive) {
        toggleSidebar("left");
      }
      if (rightSidebarActive) {
        toggleSidebar("right");
      }
    });
  }

  // initialize the keyboard shortcuts for the sidebars
  initKeyboardShortcuts();

  // initialize other functions related to the sidebars
  initLayerControls();
  initStyleControls();
  initImportControls();
}

/**
 * toggle the sidebar state (open/closed)
 * @param {string} side - the side of the sidebar ('left' or 'right')
 */
function toggleSidebar(side) {
  // clear any automatic close timers when manually toggling
  clearAutoCloseTimers();

  const sidebar =
    side === "left"
      ? document.getElementById("leftSidebar")
      : document.getElementById("rightSidebar");

  const overlay = document.getElementById("sidebarOverlay");
  const leftToggleBtn = document.getElementById("toggleLeftSidebar");
  const rightToggleBtn = document.getElementById("toggleRightSidebar");

  if (side === "left") {
    leftSidebarActive = !leftSidebarActive;

    if (leftSidebarActive) {
      sidebar.classList.add("open");
      sidebar.classList.remove("collapsed");
      // Move toggle button
      if (leftToggleBtn) {
        leftToggleBtn.classList.add("sidebar-moved");
        leftToggleBtn.querySelector("i").className = "fas fa-chevron-left";
      }
      // Show overlay on mobile
      if (window.innerWidth < 992 && overlay) {
        overlay.classList.add("show");
      }
    } else {
      sidebar.classList.add("collapsed");
      sidebar.classList.remove("open");
      // Move toggle button back
      if (leftToggleBtn) {
        leftToggleBtn.classList.remove("sidebar-moved");
        leftToggleBtn.querySelector("i").className = "fas fa-chevron-right";
      }
      // Hide overlay
      if (overlay) {
        overlay.classList.remove("show");
      }
    }

    // update button visibility in header
    const headerBtn = document.getElementById("toggleLeftSidebarBtn");
    if (headerBtn) {
      headerBtn.classList.toggle("active", leftSidebarActive);
    }

    // if the sidebar is closed, clear the timer
    if (!leftSidebarActive) {
      clearTimeout(leftSidebarTimer);
      leftSidebarTimer = null;
    }
  } else {
    rightSidebarActive = !rightSidebarActive;

    if (rightSidebarActive) {
      sidebar.classList.add("open");
      sidebar.classList.remove("collapsed");
      // Move toggle button
      if (rightToggleBtn) {
        rightToggleBtn.classList.add("sidebar-moved");
        rightToggleBtn.querySelector("i").className = "fas fa-chevron-right";
      }
      // Show overlay on mobile
      if (window.innerWidth < 992 && overlay) {
        overlay.classList.add("show");
      }
    } else {
      sidebar.classList.add("collapsed");
      sidebar.classList.remove("open");
      // Move toggle button back
      if (rightToggleBtn) {
        rightToggleBtn.classList.remove("sidebar-moved");
        rightToggleBtn.querySelector("i").className = "fas fa-chevron-left";
      }
      // Hide overlay
      if (overlay) {
        overlay.classList.remove("show");
      }
    }

    // update button visibility in header
    const headerBtn = document.getElementById("toggleRightSidebarBtn");
    if (headerBtn) {
      headerBtn.classList.toggle("active", rightSidebarActive);
    }
  }
}

/**
 * initialize the keyboard shortcuts for the sidebars
 * Ctrl + L: toggle the left sidebar
 * Ctrl + R: toggle the right sidebar
 */
function initKeyboardShortcuts() {
  // add a keyboard event listener to the document
  document.addEventListener("keydown", function (event) {
    // check if the Ctrl key is pressed
    if (event.ctrlKey) {
      // check the pressed key
      switch (event.key.toLowerCase()) {
        case "l":
          // Ctrl + L: toggle the left sidebar
          event.preventDefault(); // prevent the default browser behavior
          toggleSidebar("left");
          break;

        case "r":
          // Ctrl + R: toggle the right sidebar
          event.preventDefault(); // prevent the default browser behavior
          toggleSidebar("right");
          break;
      }
    }
  });
}

/**
 * handle the responsive sidebars
 */
function handleResponsiveSidebars() {
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");

  // apply the state classes based on active state
  if (leftSidebarActive) {
    leftSidebar.classList.add("open");
    leftSidebar.classList.remove("collapsed");
  } else {
    leftSidebar.classList.add("collapsed");
    leftSidebar.classList.remove("open");
  }

  if (rightSidebarActive) {
    rightSidebar.classList.add("open");
    rightSidebar.classList.remove("collapsed");
  } else {
    rightSidebar.classList.add("collapsed");
    rightSidebar.classList.remove("open");
  }

  // update the toggle buttons in the header
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
 * initialize the layer controls
 */
function initLayerControls() {
  // the controls for the layers
  const neighborhoodsLayerCheckbox = document.getElementById(
    "layer-neighborhoods"
  );
  const sectorsLayerCheckbox = document.getElementById("layer-sectors");

  // add event listeners to handle layer state changes
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

  // layer action buttons
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
 * toggle the visibility of a layer on the map
 * @param {string} layerName - the name of the layer
 * @param {boolean} visible - the visibility state
 */
function toggleMapLayer(layerName, visible) {
  // this function will be handled completely in the map.js file
  // it's just a temporary place to call the map functions
  if (window.mapLayerToggle) {
    window.mapLayerToggle(layerName, visible);
  } else {
    console.log(
      `تبديل رؤية الطبقة: ${layerName} إلى ${visible ? "مرئية" : "مخفية"}`
    );
  }
}

/**
 * zoom to a specific layer
 * @param {string} layerName - the name of the layer
 */
function zoomToLayer(layerName) {
  // this function will be handled completely in the map.js file
  // it's just a temporary place to call the map functions
  if (window.zoomToMapLayer) {
    window.zoomToMapLayer(layerName);
  } else {
    console.log(`التكبير على الطبقة: ${layerName}`);
  }
}

/**
 * show the information of a layer
 * @param {string} layerName - the name of the layer
 */
function showLayerInfo(layerName) {
  // this function will be handled completely in the map.js file
  // it's just a temporary place to call the map functions
  if (window.showMapLayerInfo) {
    window.showMapLayerInfo(layerName);
  } else {
    console.log(`عرض معلومات الطبقة: ${layerName}`);
  }
}

/**
 * initialize the style controls
 */
function initStyleControls() {
  const layerStyleSelect = document.getElementById("layerStyleSelect");
  const layerColor = document.getElementById("layerColor");
  const layerOpacity = document.getElementById("layerOpacity");
  const lineWeight = document.getElementById("lineWeight");
  const opacityValue = document.getElementById("opacityValue");
  const applyStyleBtn = document.getElementById("applyStyleBtn");

  // show the opacity value
  if (layerOpacity && opacityValue) {
    layerOpacity.addEventListener("input", function () {
      opacityValue.textContent = this.value;
    });
  }

  // apply the style to the specified layer
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
 * apply a style to a layer
 * @param {string} layerName - the name of the layer
 * @param {Object} style - the style specification
 */
function applyLayerStyle(layerName, style) {
  // this function will be handled completely in the map.js file
  // it's just a temporary place to call the map functions
  if (window.applyMapLayerStyle) {
    window.applyMapLayerStyle(layerName, style);
  } else {
    console.log(`تطبيق النمط على الطبقة: ${layerName}`, style);
  }
}

/**
 * initialize the import controls
 * note: all event listeners for import have been moved to features.js to avoid conflicts
 */
function initImportControls() {
  // prevent the repeated initialization
  if (window.sidebarImportInitialized) {
    return;
  }
  window.sidebarImportInitialized = true;

  console.log("initialized the import controls from sidebar.js");

  // all event listeners for import have been moved to features.js to avoid conflicts
  // we don't need to add any event listeners here
}

/**
 * import a layer from a file
 * @param {File} file - the file to import
 */
function importLayer(file) {
  console.log(`استيراد طبقة من الملف: ${file.name}`);
  alert(`سيتم استيراد الملف: ${file.name} (هذه نسخة تجريبية)`);
}


/**
 * hide the auto-close indicator
 * @param {string} sidebarId - the id of the sidebar
 * @param {boolean} closeSidebar - whether to close the sidebar
 */
function hideAutoCloseIndicator(sidebarId, closeSidebar = false) {
  const indicator = document.getElementById(`${sidebarId}AutoCloseIndicator`);

  if (indicator) {
    indicator.classList.remove("show");
  }


  if (closeSidebar) {
    const sidebar = document.getElementById(sidebarId);
    if (sidebar.getAttribute("data-pinned") !== "true") {
      if (sidebarId === "leftSidebar") {
        leftSidebarActive = false;
        sidebar.classList.add("collapsed");
      } else {
        rightSidebarActive = false;
        sidebar.classList.add("collapsed");
      }
    }
  }
}

/**
 * clear all auto-close timers
 */
function clearAutoCloseTimers() {
  hideAutoCloseIndicator("leftSidebar");
  hideAutoCloseIndicator("rightSidebar");
}

// expose the functions for external use
window.toggleSidebar = toggleSidebar;
window.clearAutoCloseTimers = clearAutoCloseTimers;
