// Add needed modifications to existing sidebar auto-close functionality
if (typeof window.initSidebarAutoClose !== "function") {
    // Define a function to initialize sidebar auto-close if it doesn't exist yet
    window.initSidebarAutoClose = function () {
        // Auto-close functionality for sidebars
        window.showAutoCloseIndicator = function (sidebarId) {
            const sidebar = document.getElementById(sidebarId);
            const indicatorId = sidebarId + "AutoCloseIndicator";
            const indicator = document.getElementById(indicatorId);

            if (indicator) {
                indicator.classList.add("show");

                // Store the timer reference
                const timerProp =
                    sidebarId === "leftSidebar"
                        ? "leftSidebarAutoCloseTimer"
                        : "rightSidebarAutoCloseTimer";

                // Clear existing timer if any
                if (window[timerProp]) {
                    clearTimeout(window[timerProp]);
                }

                // Set new timer
                window[timerProp] = setTimeout(function () {
                    indicator.classList.remove("show");
                    sidebar.classList.add("collapsed");
                }, 5000); // 5 second auto-close delay
            }
        };
    };

    // Initialize
    window.initSidebarAutoClose();
}

// Map Information Bar Update Functions
function updateMapInfoBar() {
    if (!window.map || typeof window.map.getCenter !== "function") return;

    // Get current map state
    const center = window.map.getCenter();
    const zoom = window.map.getZoom();

    // Calculate approximate scale based on zoom level
    // Formula: scale = 591657527.591555 / (2^zoom)
    const scale = Math.round(591657527.591555 / Math.pow(2, zoom));

    // Format coordinates (limit to 6 decimal places)
    const lat = center.lat.toFixed(6);
    const lng = center.lng.toFixed(6);

    // Get current language
    const currentLang = document.documentElement.lang || "ar";
    const t = window.translations[currentLang];

    // Update DOM elements with localized text - always use English numbers
    const scaleElement = document.getElementById("map-scale");
    const centerElement = document.getElementById("map-center");

    if (scaleElement && t && t.mapInfo) {
        // Always use English numbers format
        scaleElement.textContent = `${t.mapInfo.scale
            }: 1:${scale.toLocaleString("en-US")}`;
    }

    if (centerElement && t && t.mapInfo) {
        // Coordinates are already in English numbers format
        centerElement.textContent = `${t.mapInfo.center}: ${lat}, ${lng}`;
    }
}

// Initialize map info bar when map is ready
document.addEventListener("DOMContentLoaded", function () {
    // Wait for map to be initialized
    const checkMapReady = setInterval(function () {
        if (
            window.map &&
            typeof window.map.on === "function" &&
            typeof window.map.getCenter === "function"
        ) {
            clearInterval(checkMapReady);

            // Initial update
            updateMapInfoBar();

            // Listen for map events
            window.map.on("moveend", updateMapInfoBar);
            window.map.on("zoomend", updateMapInfoBar);
            window.map.on("resize", updateMapInfoBar);
        }
    }, 100);
});

// Fix for white space issue when clicking on the map
document.addEventListener("click", function (e) {
    if (e.target && (e.target.id === "map" || e.target.closest("#map"))) {
        setTimeout(function () {
            if (window.map && typeof window.map.invalidateSize === "function") {
                window.map.invalidateSize(true);
            }
        }, 100);
    }
});

// Note: Translations and language switching functions have been moved to field-translations.js

function toggleMenu() {
    const menu = document.getElementById("menuDropdown");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function (event) {
    const dropdown = document.querySelector(".menu-dropdown");
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById("menuDropdown").style.display = "none";
    }
});

function logout() {
    // redirect user to the home page
    window.location.href = "../index.html";
}

// Note: Language initialization has been moved to field-translations.js

document.addEventListener("DOMContentLoaded", function () {
    // Service Sectors Layer Checkbox
    const serviceSectorsCheckbox = document.getElementById(
        "layer-service-sectors"
    );
    if (serviceSectorsCheckbox) {
        serviceSectorsCheckbox.addEventListener("change", function () {
            if (window.mapLayerToggle) {
                window.mapLayerToggle("service-sectors", this.checked);
            }
        });
    }

    // Neighborhoods Layer Checkbox (optional, for consistency)
    const neighborhoodsCheckbox = document.getElementById(
        "layer-neighborhoods"
    );
    if (neighborhoodsCheckbox) {
        neighborhoodsCheckbox.addEventListener("change", function () {
            if (window.mapLayerToggle) {
                window.mapLayerToggle("neighborhoods", this.checked);
            }
        });
    }
});

function toggleLayersPanel() {
    var modal = document.getElementById("customLayersModal");
    if (modal.classList.contains("open")) {
        modal.classList.remove("open");
    } else {
        modal.classList.add("open");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Service Sectors Layer Checkbox
    const serviceSectorsCheckbox = document.getElementById(
        "layer-service-sectors"
    );
    if (serviceSectorsCheckbox) {
        serviceSectorsCheckbox.addEventListener("change", function () {
            if (window.mapLayerToggle) {
                window.mapLayerToggle("service-sectors", this.checked);
            }
        });
    }

    // Neighborhoods Layer Checkbox (optional, for consistency)
    const neighborhoodsCheckbox = document.getElementById(
        "layer-neighborhoods"
    );
    if (neighborhoodsCheckbox) {
        neighborhoodsCheckbox.addEventListener("change", function () {
            if (window.mapLayerToggle) {
                window.mapLayerToggle("neighborhoods", this.checked);
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    var tabs = document.querySelector(".tabs-container");
    if (tabs) {
        tabs.classList.remove("collapsed");
        // initial hidden state with motion effects
        tabs.classList.add("hidden");
        tabs.style.display = "none";
        tabs.style.zIndex = "3000";
    }

    // The tabs toggle button is now handled in tabs.js to avoid conflicts
    // Remove any duplicated event listeners here

    // Make sure map compass and basemap gallery are visible
    const mapCompass = document.querySelector(".map-compass");
    if (mapCompass) {
        mapCompass.style.display = "flex";
        mapCompass.style.visibility = "visible";
    }

    // Ensure basemap gallery works with layers button
    const layersBtn = document.getElementById("layers-btn");
    const basemapGallery = document.getElementById("basemap-gallery");

    if (layersBtn && basemapGallery) {
        layersBtn.addEventListener("click", function () {
            basemapGallery.classList.toggle("open");
        });

        // Close gallery when clicking outside
        document.addEventListener("click", function (e) {
            if (!basemapGallery.contains(e.target) && e.target !== layersBtn) {
                basemapGallery.classList.remove("open");
            }
        });
    }
});



document.addEventListener("DOMContentLoaded", function () {
    // Clear any existing event listeners by cloning and replacing the button
    const layersBtn = document.getElementById("layers-btn");
    const basemapGallery = document.getElementById("basemap-gallery");

    if (layersBtn && basemapGallery) {
        const newLayersBtn = layersBtn.cloneNode(true);
        layersBtn.parentNode.replaceChild(newLayersBtn, layersBtn);

        // Add event listener to the new button
        newLayersBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("Layers button clicked");
            basemapGallery.classList.toggle("open");
        });

        // Close when clicking outside
        document.addEventListener("click", function (e) {
            if (
                !basemapGallery.contains(e.target) &&
                e.target !== newLayersBtn
            ) {
                basemapGallery.classList.remove("open");
            }
        });

        // Handle basemap selection
        const basemapThumbs = document.querySelectorAll(".basemap-thumb");
        basemapThumbs.forEach((thumb) => {
            thumb.addEventListener("click", function () {
                const basemapType = this.getAttribute("data-basemap");

                // Remove selected class from all thumbnails
                basemapThumbs.forEach((t) => t.classList.remove("selected"));

                // Add selected class to clicked thumbnail
                this.classList.add("selected");

                // Change basemap layer (this would connect to your map.js implementation)
                if (window.changeBasemap) {
                    window.changeBasemap(basemapType);
                } else {
                    console.log("Changing basemap to:", basemapType);
                }

                // Close the gallery
                basemapGallery.classList.remove("open");
            });
        });
    }

    // Create placeholder images if they don't exist
    if (
        document.querySelectorAll(
            '.basemap-thumb img[src="assets/img/basemap-osm.jpg"]'
        ).length > 0
    ) {
        // Create a function to generate base64 placeholder images
        function createPlaceholderImage(color) {
            const canvas = document.createElement("canvas");
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 80, 80);
            return canvas.toDataURL();
        }

        // Replace missing images with placeholders
        document.querySelectorAll(".basemap-thumb img").forEach((img) => {
            img.onerror = function () {
                let color = "#e3e3e3";
                if (img.alt === "Satellite") color = "#2d2d2d";
                if (img.alt === "Terrain") color = "#c5e8c5";
                if (img.alt === "Dark") color = "#121212";

                this.src = createPlaceholderImage(color);
            };
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    // Handle new basemap button
    const basemapButton = document.getElementById("basemap-button");
    const basemapGallery = document.getElementById("basemap-gallery");

    if (basemapButton && basemapGallery) {
        basemapButton.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("Basemap button clicked");
            basemapGallery.classList.toggle("open");
        });
    }

    // Clear any existing event listeners by cloning and replacing the button
    const layersBtn = document.getElementById("layers-btn");

    if (layersBtn && basemapGallery) {
        const newLayersBtn = layersBtn.cloneNode(true);
        layersBtn.parentNode.replaceChild(newLayersBtn, layersBtn);

        // Add event listener to the new button
        newLayersBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("Layers button clicked");
            basemapGallery.classList.toggle("open");
        });

        // Close when clicking outside
        document.addEventListener("click", function (e) {
            if (
                !basemapGallery.contains(e.target) &&
                e.target !== newLayersBtn &&
                e.target !== basemapButton
            ) {
                basemapGallery.classList.remove("open");
            }
        });

        // Handle basemap selection
        const basemapThumbs = document.querySelectorAll(".basemap-thumb");
        basemapThumbs.forEach((thumb) => {
            thumb.addEventListener("click", function () {
                const basemapType = this.getAttribute("data-basemap");

                // Remove selected class from all thumbnails
                basemapThumbs.forEach((t) => t.classList.remove("selected"));

                // Add selected class to clicked thumbnail
                this.classList.add("selected");

                // Change basemap layer (this would connect to your map.js implementation)
                if (window.changeBasemap) {
                    window.changeBasemap(basemapType);
                } else {
                    console.log("Changing basemap to:", basemapType);

                    // Basic implementation if window.changeBasemap doesn't exist
                    if (window.map) {
                        // Remove any existing tile layers
                        window.map.eachLayer(function (layer) {
                            if (layer._url && layer._url.includes("tile")) {
                                window.map.removeLayer(layer);
                            }
                        });

                        // Add the selected basemap
                        if (basemapType === "osm") {
                            L.tileLayer(
                                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                {
                                    maxZoom: 19,
                                }
                            ).addTo(window.map);
                        } else if (basemapType === "satellite") {
                            L.tileLayer(
                                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                                {
                                    maxZoom: 19,
                                }
                            ).addTo(window.map);
                        } else if (basemapType === "terrain") {
                            L.tileLayer(
                                "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                                {
                                    maxZoom: 17,
                                    attribution:
                                        '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
                                }
                            ).addTo(window.map);
                        } else if (basemapType === "dark") {
                            L.tileLayer(
                                "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png",
                                {
                                    maxZoom: 19,
                                }
                            ).addTo(window.map);
                        }
                    }
                }

                // Close the gallery
                basemapGallery.classList.remove("open");
            });
        });
    }

    // Create placeholder images if they don't exist
    document.querySelectorAll(".basemap-thumb img").forEach((img) => {
        img.onerror = function () {
            let color = "#e3e3e3";
            if (img.alt === "Satellite") color = "#2d2d2d";
            if (img.alt === "Terrain") color = "#c5e8c5";
            if (img.alt === "Dark") color = "#121212";

            // Create a canvas element
            const canvas = document.createElement("canvas");
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext("2d");

            // Fill with background color
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 80, 80);

            // Add label text
            ctx.fillStyle = color === "#121212" ? "#ffffff" : "#333333";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(img.alt, 40, 40);

            // Replace the image source with the canvas data URL
            this.src = canvas.toDataURL();
        };
    });

    // Ensure the basemap button is visible
    if (basemapButton) {
        basemapButton.style.display = "flex";
    }
});




// Simple direct JavaScript to handle basemap gallery
document.addEventListener("DOMContentLoaded", function () {
    var simpleButton = document.getElementById("simple-basemap-button");
    var simpleGallery = document.getElementById("simple-basemap-gallery");
    var isGalleryOpen = false;

    // Button click to toggle gallery
    if (simpleButton && simpleGallery) {
        simpleButton.onclick = function (e) {
            e.stopPropagation();
            if (isGalleryOpen) {
                simpleGallery.style.display = "none";
                isGalleryOpen = false;
            } else {
                simpleGallery.style.display = "block";
                isGalleryOpen = true;
            }
        };

        // Close gallery when clicking outside
        document.addEventListener("click", function (event) {
            if (
                isGalleryOpen &&
                event.target !== simpleButton &&
                !simpleGallery.contains(event.target)
            ) {
                simpleGallery.style.display = "none";
                isGalleryOpen = false;
            }
        });

        // Handle basemap selection
        var options = document.querySelectorAll(".simple-basemap-option");
        options.forEach(function (option) {
            option.onclick = function () {
                // Reset all borders
                options.forEach(function (opt) {
                    opt.style.border = "3px solid #ddd";
                });

                // Highlight selected
                this.style.border = "3px solid #2196F3";

                // Get basemap type
                var type = this.getAttribute("data-type");
                console.log("Selected basemap: " + type);

                // Change the basemap
                if (window.map) {
                    // Remove any existing tile layers
                    window.map.eachLayer(function (layer) {
                        if (layer._url && layer._url.includes("tile")) {
                            window.map.removeLayer(layer);
                        }
                    });

                    // Add the selected basemap
                    if (type === "osm") {
                        L.tileLayer(
                            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            {
                                maxZoom: 19,
                            }
                        ).addTo(window.map);
                    } else if (type === "satellite") {
                        L.tileLayer(
                            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                            {
                                maxZoom: 19,
                            }
                        ).addTo(window.map);
                    } else if (type === "terrain") {
                        L.tileLayer(
                            "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                            {
                                maxZoom: 17,
                                attribution:
                                    '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
                            }
                        ).addTo(window.map);
                    } else if (type === "dark") {
                        L.tileLayer(
                            "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png",
                            {
                                maxZoom: 19,
                            }
                        ).addTo(window.map);
                    }
                }

                // Close the gallery
                setTimeout(function () {
                    simpleGallery.style.display = "none";
                    isGalleryOpen = false;
                }, 300);
            };
        });
    }
});



// This script runs before other scripts to patch the addEventListener method
document.addEventListener("DOMContentLoaded", function () {
    // Create a safety wrapper for addEventListener
    const originalAddEventListener = Element.prototype.addEventListener;

    // Override with a version that checks for null
    Element.prototype.addEventListener = function () {
        if (this) {
            return originalAddEventListener.apply(this, arguments);
        }
    };

    // Create any elements that might be expected by map.js but don't exist
    if (!document.getElementById("layer-neighborhoods")) {
        const dummyElement = document.createElement("input");
        dummyElement.type = "checkbox";
        dummyElement.id = "layer-neighborhoods";
        dummyElement.style.display = "none";
        dummyElement.checked = true;
        document.body.appendChild(dummyElement);
    }

    if (!document.getElementById("layer-service-sectors")) {
        const dummyElement = document.createElement("input");
        dummyElement.type = "checkbox";
        dummyElement.id = "layer-service-sectors";
        dummyElement.style.display = "none";
        dummyElement.checked = true;
        document.body.appendChild(dummyElement);
    }
});


// عند إظهار info-panel، أظهر tabs تلقائياً
(function () {
    var tryPatch = function () {
        if (
            window.renderInfoPanel &&
            !window.renderInfoPanel._tabsAutoShowPatched
        ) {
            var origRenderInfoPanel = window.renderInfoPanel;
            window.renderInfoPanel = function (tabId, neighborhoodId) {
                // أظهر التبويبات إذا كانت مخفية
                var tabs = document.querySelector(".tabs-container");
                if (
                    tabs &&
                    (tabs.classList.contains("hidden") ||
                        tabs.style.display === "none")
                ) {
                    tabs.style.display = "flex";
                    setTimeout(function () {
                        tabs.classList.remove("hidden");
                        tabs.classList.add("visible");
                    }, 10);
                }
                // نفذ الدالة الأصلية
                return origRenderInfoPanel.apply(this, arguments);
            };
            window.renderInfoPanel._tabsAutoShowPatched = true;
        }
    };
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(tryPatch, 0);
    } else {
        document.addEventListener("DOMContentLoaded", tryPatch);
    }
})();


function getDamageRatiosForNeighborhood(neighborhoodId) {
    console.log(
        "Getting damage ratios for neighborhood ID:",
        neighborhoodId
    );

    // Try to get damage data from housingData in aleppo-data.js
    if (typeof housingData !== "undefined") {
        const damageInfo = housingData.find(
            (h) => h.neighborhoodId == neighborhoodId
        );
        if (damageInfo) {
            console.log("Found damage data in housingData:", damageInfo);
            return {
                severeDamagePercentage: damageInfo.severeDamagePercentage,
                mediumDamagePercentage: damageInfo.mediumDamagePercentage,
                lightDamagePercentage: damageInfo.lightDamagePercentage,
                noDamagePercentage: damageInfo.noDamagePercentage,
                totalUnits: damageInfo.totalUnits,
                vacantPercentage: damageInfo.vacantPercentage,
                ownershipType: damageInfo.ownershipType,
                interventionPriority: damageInfo.interventionPriority,
            };
        }
    }

    // Try to get damage data from neighborhood properties
    let neighborhoodFeature = null;
    if (
        typeof neighborhoodsData !== "undefined" &&
        neighborhoodsData.features
    ) {
        neighborhoodFeature = neighborhoodsData.features.find(
            (f) => f.properties.ID == neighborhoodId
        );
    } else if (typeof aleppoNeighborhoods !== "undefined") {
        neighborhoodFeature = aleppoNeighborhoods.find(
            (n) => n.id == neighborhoodId
        );
    }

    if (neighborhoodFeature && neighborhoodFeature.properties) {
        const props = neighborhoodFeature.properties;
        // Check if damage data exists in neighborhood properties
        if (props.severeDamagePercentage || props.damage_level) {
            return {
                severeDamagePercentage:
                    props.severeDamagePercentage ||
                    (props.damage_level > 75 ? 80 : 0),
                mediumDamagePercentage:
                    props.mediumDamagePercentage ||
                    (props.damage_level > 50 ? 60 : 0),
                lightDamagePercentage:
                    props.lightDamagePercentage ||
                    (props.damage_level > 25 ? 40 : 0),
                noDamagePercentage:
                    props.noDamagePercentage || 100 - (props.damage_level || 0),
            };
        }
    }

    // Generate sample damage data based on neighborhood ID for demonstration
    console.log(
        "No damage data found, generating sample data for neighborhood:",
        neighborhoodId
    );
    const seed = parseInt(neighborhoodId) || 1;
    const severe = Math.max(0, Math.min(50, (seed * 7) % 51));
    const medium = Math.max(0, Math.min(40, (seed * 11) % 41));
    const light = Math.max(0, Math.min(30, (seed * 13) % 31));
    const noDamage = Math.max(0, 100 - severe - medium - light);

    return {
        severeDamagePercentage: severe,
        mediumDamagePercentage: medium,
        lightDamagePercentage: light,
        noDamagePercentage: noDamage,
        note: "بيانات تقديرية للعرض",
    };
}

function showSuccessNotification(message) {
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
    notification.style.padding = "15px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "10000";
    notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.transition = "opacity 0.5s";
        notification.style.opacity = "0";
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
}

// Helper function to generate sample sectoral data
function generateSampleSectoralData(neighborhoodId) {
    const sectoralFunctions = [
        "التدخلات الإنسانية",
        "الأسواق الأساسية",
        "إدارة النفايات الصلبة",
        "شبكة الكهرباء",
        "شبكة الاتصالات",
        "إمدادات المياه",
        "شبكة الصرف الصحي",
        "أضرار الإسكان",
        "النسيج الحضري",
        "التغيرات السكانية",
    ];

    const sampleData = {};

    // Generate realistic sample data based on neighborhood ID
    const seed = parseInt(neighborhoodId) || 1;
    for (let i = 0; i < sectoralFunctions.length; i++) {
        // Generate values between 20-95% with some variation based on seed and index
        const baseValue = 40 + ((seed * 7 + i * 13) % 50);
        const variation = ((seed + i) % 20) - 10; // ±10% variation
        const finalValue = Math.max(20, Math.min(95, baseValue + variation));
        sampleData[sectoralFunctions[i]] = finalValue;
    }

    return sampleData;
}

// default colors for the layers
const defaultStyles = {
    neighborhoods: {
        color: "#1e40af",
        fillColor: "#3b82f6",
        fillOpacity: 0.6,
        opacity: 0.8,
        weight: 2,
    },
    serviceSectors: {
        color: "#dc2626",
        fillColor: "#ef4444",
        fillOpacity: 0.5,
        opacity: 0.7,
        weight: 2,
    },
    aleppoCity: {
        color: "#ff7800",
        fillColor: "#ff7800",
        fillOpacity: 0.2,
        opacity: 1,
        weight: 3,
    },
};

// reset all layers to the default styles
function resetAllLayersToDefault() {
    try {
        console.log("إعادة ضبط جميع الطبقات إلى الأنماط الافتراضية...");

        // reset the neighborhoods layer
        resetLayerToDefault("neighborhoods");

        // reset the service sectors layer
        resetLayerToDefault("serviceSectors");

        // reset the Aleppo city layer
        resetLayerToDefault("aleppoCity");

        console.log("تم إعادة ضبط جميع الطبقات بنجاح");
    } catch (error) {
        console.error("خطأ في إعادة ضبط الطبقات:", error);
    }
}

// reset a single layer to the default style
function resetLayerToDefault(layerType) {
    try {
        let layersReset = 0;
        const defaultStyle = defaultStyles[layerType];

        if (!defaultStyle) {
            console.warn(`لا توجد أنماط افتراضية للطبقة: ${layerType}`);
            return;
        }

        // البحث في جميع طبقات الخريطة
        if (window.map && window.map.eachLayer) {
            window.map.eachLayer(function (layer) {
                let shouldReset = false;

                // check if this is the layer we want to reset
                if (
                    layerType === "neighborhoods" &&
                    layer.feature &&
                    layer.feature.properties &&
                    (layer.feature.properties.NAME ||
                        layer.feature.properties.name ||
                        layer.feature.properties.Name ||
                        layer.feature.properties.ID)
                ) {
                    shouldReset = true;
                } else if (
                    layerType === "serviceSectors" &&
                    layer.feature &&
                    layer.feature.properties &&
                    (layer.feature.properties.Name ||
                        layer.feature.properties.OBJECTID)
                ) {
                    shouldReset = true;
                } else if (
                    layerType === "aleppoCity" &&
                    layer.feature &&
                    layer.feature.properties &&
                    (layer.feature.properties.OBJECTID === 1 ||
                        layer.feature.properties.Shape_Area > 300000000)
                ) {
                    shouldReset = true;
                }

                if (shouldReset) {
                    layer.setStyle(defaultStyle);
                    layersReset++;
                }
            });
        }

        // try to reset through global variables
        let possibleVariables = [];
        if (layerType === "neighborhoods") {
            possibleVariables = [
                "neighborhoodsLayer",
                "neighborhoods",
                "neighborhoodsData",
                "window.neighborhoodsLayer",
            ];
        } else if (layerType === "serviceSectors") {
            possibleVariables = [
                "serviceSectorsLayer",
                "serviceSectors",
                "serviceSectorsData",
                "window.serviceSectorsLayer",
            ];
        } else if (layerType === "aleppoCity") {
            possibleVariables = [
                "aleppoCityLayer",
                "aleppoCity",
                "window.aleppoCityLayer",
            ];
        }

        possibleVariables.forEach((varName) => {
            try {
                let layer = eval(varName);
                if (layer && typeof layer.setStyle === "function") {
                    layer.setStyle(defaultStyle);
                    layersReset++;
                } else if (
                    layer &&
                    layer.eachLayer &&
                    typeof layer.eachLayer === "function"
                ) {
                    layer.eachLayer(function (subLayer) {
                        if (subLayer.setStyle) {
                            subLayer.setStyle(defaultStyle);
                            layersReset++;
                        }
                    });
                }
            } catch (e) {
                // variable not found, ignore
            }
        });

        console.log(`تم إعادة ضبط ${layersReset} طبقة من نوع ${layerType}`);
    } catch (error) {
        console.error(`خطأ في إعادة ضبط طبقة ${layerType}:`, error);
    }
}

// add a function to apply the styles to the layers
document.addEventListener("DOMContentLoaded", function () {
    const applyStyleBtn = document.getElementById("applyStyleBtn");
    const resetStyleBtn = document.getElementById("resetStyleBtn");

    if (applyStyleBtn) {
        applyStyleBtn.addEventListener("click", function () {
            const layerSelect = document.getElementById("layerStyleSelect");
            const colorInput = document.getElementById("layerColor");
            const opacityInput = document.getElementById("layerOpacity");
            const lineWeightInput = document.getElementById("layerLineWeight");

            if (!layerSelect.value) {
                alert("يرجى اختيار طبقة أولاً");
                return;
            }

            const selectedLayer = layerSelect.value;
            const selectedColor = colorInput.value;
            const selectedOpacity = parseFloat(opacityInput.value);
            const selectedLineWeight = parseInt(lineWeightInput.value);

            console.log("تطبيق الأنماط:", {
                layer: selectedLayer,
                color: selectedColor,
                opacity: selectedOpacity,
                lineWeight: selectedLineWeight,
            });

            // apply the styles based on the selected layer type
            if (selectedLayer === "neighborhoods") {
                applyStyleToNeighborhoods(
                    selectedColor,
                    selectedOpacity,
                    selectedLineWeight
                );
            } else if (selectedLayer === "service-sectors") {
                applyStyleToServiceSectors(
                    selectedColor,
                    selectedOpacity,
                    selectedLineWeight
                );
            } else if (selectedLayer === "aleppo-city") {
                applyStyleToAleppoCity(
                    selectedColor,
                    selectedOpacity,
                    selectedLineWeight
                );
            }

            // show success notification
            showSuccessNotification("تم تطبيق الأنماط بنجاح!");
        });
    }

    if (resetStyleBtn) {
        resetStyleBtn.addEventListener("click", function () {
            // confirm with the user before resetting
            if (
                confirm(
                    "هل أنت متأكد من إعادة ضبط جميع الأنماط إلى الإعدادات الافتراضية؟"
                )
            ) {
                resetAllLayersToDefault();

                // reset the field values to the default values
                document.getElementById("layerColor").value = "#1e40af";
                document.getElementById("layerOpacity").value = "0.8";
                document.getElementById("opacityValue").textContent = "0.8";
                document.getElementById("layerLineWeight").value = "2";
                document.getElementById("lineWeightValue").textContent = "2";
                document.getElementById("layerStyleSelect").value = "";

                // show success notification
                showSuccessNotification("تم إعادة ضبط جميع الأنماط بنجاح!");
            }
        });
    }

    // update the opacity value when the input changes
    const opacityInput = document.getElementById("layerOpacity");
    const opacityValue = document.getElementById("opacityValue");

    if (opacityInput && opacityValue) {
        opacityInput.addEventListener("input", function () {
            opacityValue.textContent = this.value;
        });
    }

    // update the line weight value when the input changes
    const lineWeightInput = document.getElementById("layerLineWeight");
    const lineWeightValue = document.getElementById("lineWeightValue");

    if (lineWeightInput && lineWeightValue) {
        lineWeightInput.addEventListener("input", function () {
            lineWeightValue.textContent = this.value;
        });
    }
});

// apply the styles to the neighborhoods layer
function applyStyleToNeighborhoods(color, opacity, lineWeight) {
    try {
        let layersStyled = 0;
        const styleObject = {
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            opacity: opacity > 0.5 ? 0.8 : opacity + 0.3,
            weight: lineWeight || 2,
        };

        // search for the neighborhoods layer in the map
        if (window.map && window.map.eachLayer) {
            window.map.eachLayer(function (layer) {
                // check if this is the neighborhoods layer based on different properties
                if (
                    layer.feature &&
                    layer.feature.properties &&
                    (layer.feature.properties.NAME ||
                        layer.feature.properties.name ||
                        layer.feature.properties.Name ||
                        layer.feature.properties.ID)
                ) {
                    // apply the new styles
                    layer.setStyle(styleObject);
                    layersStyled++;
                }
            });
        }

        // try to access the layers through possible global variables
        const possibleVariables = [
            "neighborhoodsLayer",
            "neighborhoods",
            "neighborhoodsData",
            "window.neighborhoodsLayer",
        ];

        possibleVariables.forEach((varName) => {
            try {
                let layer = eval(varName);
                if (layer && typeof layer.setStyle === "function") {
                    layer.setStyle(styleObject);
                    layersStyled++;
                } else if (
                    layer &&
                    layer.eachLayer &&
                    typeof layer.eachLayer === "function"
                ) {
                    layer.eachLayer(function (subLayer) {
                        if (subLayer.setStyle) {
                            subLayer.setStyle(styleObject);
                            layersStyled++;
                        }
                    });
                }
            } catch (e) {
                // variable not found, ignore
            }
        });

        console.log(`تم تطبيق الأنماط على ${layersStyled} طبقة من الأحياء`);

        if (layersStyled === 0) {
            console.warn(
                "لم يتم العثور على أي طبقة من الأحياء لتطبيق الأنماط عليها"
            );
        }
    } catch (error) {
        console.error("خطأ في تطبيق الأنماط على الأحياء:", error);
    }
}

// apply the styles to the service sectors layer
function applyStyleToServiceSectors(color, opacity, lineWeight) {
    try {
        let layersStyled = 0;
        const styleObject = {
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            opacity: opacity > 0.5 ? 0.8 : opacity + 0.3,
            weight: lineWeight || 2,
        };

        // search for the service sectors layer in the map
        if (window.map && window.map.eachLayer) {
            window.map.eachLayer(function (layer) {
                // check if this is the service sectors layer based on different properties
                if (
                    layer.feature &&
                    layer.feature.properties &&
                    (layer.feature.properties.Name ||
                        layer.feature.properties.OBJECTID)
                ) {
                    // apply the new styles
                    layer.setStyle(styleObject);
                    layersStyled++;
                }
            });
        }

        // try to access the layers through possible global variables
        const possibleVariables = [
            "serviceSectorsLayer",
            "serviceSectors",
            "serviceSectorsData",
            "window.serviceSectorsLayer",
        ];

        possibleVariables.forEach((varName) => {
            try {
                let layer = eval(varName);
                if (layer && typeof layer.setStyle === "function") {
                    layer.setStyle(styleObject);
                    layersStyled++;
                } else if (
                    layer &&
                    layer.eachLayer &&
                    typeof layer.eachLayer === "function"
                ) {
                    layer.eachLayer(function (subLayer) {
                        if (subLayer.setStyle) {
                            subLayer.setStyle(styleObject);
                            layersStyled++;
                        }
                    });
                }
            } catch (e) {
                // variable not found, ignore
            }
        });

        // search for the service sectors layers through DOM selectors
        const checkboxes = document.querySelectorAll(
            '[data-layer*="service-sectors"]'
        );
        if (checkboxes.length > 0) {
            console.log(
                "تم العثور على عناصر دوائر الخدمات في DOM:",
                checkboxes.length
            );
        }

        console.log(
            `تم تطبيق الأنماط على ${layersStyled} طبقة من دوائر الخدمات`
        );

        if (layersStyled === 0) {
            console.warn(
                "لم يتم العثور على أي طبقة من دوائر الخدمات لتطبيق الأنماط عليها"
            );
        }
    } catch (error) {
        console.error("خطأ في تطبيق الأنماط على دوائر الخدمات:", error);
    }
}

// apply the styles to the Aleppo city layer
function applyStyleToAleppoCity(color, opacity, lineWeight) {
    try {
        let layersStyled = 0;
        const styleObject = {
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            opacity: opacity > 0.5 ? 0.8 : opacity + 0.3,
            weight: lineWeight || 2,
        };

        // search for the Aleppo city layer in the map
        if (window.map && window.map.eachLayer) {
            window.map.eachLayer(function (layer) {
                // check if this is the Aleppo city layer based on different properties
                if (
                    layer.feature &&
                    layer.feature.properties &&
                    (layer.feature.properties.OBJECTID === 1 || // Aleppo city has OBJECTID = 1
                     layer.feature.properties.Shape_Area > 300000000) // Large area indicates city boundary
                ) {
                    // apply the new styles
                    layer.setStyle(styleObject);
                    layersStyled++;
                }
            });
        }

        // try to access the layers through possible global variables
        const possibleVariables = [
            "aleppoCityLayer",
            "aleppoCity",
            "window.aleppoCityLayer",
        ];

        possibleVariables.forEach((varName) => {
            try {
                let layer = eval(varName);
                if (layer && typeof layer.setStyle === "function") {
                    layer.setStyle(styleObject);
                    layersStyled++;
                } else if (
                    layer &&
                    layer.eachLayer &&
                    typeof layer.eachLayer === "function"
                ) {
                    layer.eachLayer(function (subLayer) {
                        if (subLayer.setStyle) {
                            subLayer.setStyle(styleObject);
                            layersStyled++;
                        }
                    });
                }
            } catch (e) {
                // variable not found, ignore
            }
        });

        console.log(`تم تطبيق الأنماط على ${layersStyled} طبقة من مدينة حلب`);

        if (layersStyled === 0) {
            console.warn(
                "لم يتم العثور على أي طبقة من مدينة حلب لتطبيق الأنماط عليها"
            );
        }
    } catch (error) {
        console.error("خطأ في تطبيق الأنماط على مدينة حلب:", error);
    }
}

// Main function to apply styles to any layer
window.applyMapLayerStyle = function(layerName, style) {
    console.log(`تطبيق الأنماط على طبقة: ${layerName}`, style);
    
    const color = style.color || "#1e40af";
    const opacity = style.opacity || 0.8;
    const weight = style.weight || 2;
    
    try {
        switch(layerName) {
            case "aleppo-city":
                applyStyleToAleppoCity(color, opacity, weight);
                showSuccessNotification("تم تطبيق الأنماط على طبقة مدينة حلب بنجاح!");
                break;
                
            case "neighborhoods":
                applyStyleToNeighborhoods(color, opacity, weight);
                showSuccessNotification("تم تطبيق الأنماط على طبقة الأحياء بنجاح!");
                break;
                
            case "service-sectors":
                applyStyleToServiceSectors(color, opacity, weight);
                showSuccessNotification("تم تطبيق الأنماط على طبقة دوائر الخدمات بنجاح!");
                break;
                
            default:
                console.warn(`طبقة غير معروفة: ${layerName}`);
                showErrorNotification(`طبقة غير معروفة: ${layerName}`);
                break;
        }
    } catch (error) {
        console.error(`خطأ في تطبيق الأنماط على طبقة ${layerName}:`, error);
        showErrorNotification(`خطأ في تطبيق الأنماط: ${error.message}`);
    }
};

// Helper function to show error notifications
function showErrorNotification(message) {
    // Create error notification similar to success notification
    const notification = document.createElement('div');
    notification.className = 'notification error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Tajawal', sans-serif;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="margin-left: 8px;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

