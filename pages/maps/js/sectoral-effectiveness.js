
// Function to show the Urban Sectoral Functionality calculation interface
function showSectoralFunctionalityCalculation() {
    const fullscreenPopup = document.getElementById("fullscreen-popup");
    const popupContentContainer = document.getElementById(
        "popup-content-container"
    );
    const sectoralFunctionalityContainer = document.getElementById(
        "sectoral-functionality-container"
    );
    const popupLoading = document.getElementById("popup-loading");

    if (fullscreenPopup && sectoralFunctionalityContainer) {
        // Hide loading indicator
        if (popupLoading) popupLoading.style.display = "none";

        // Hide all other containers
        if (popupContentContainer) popupContentContainer.style.display = "none";
        const sectoralMappingContainer = document.getElementById(
            "sectoral-mapping-container"
        );
        if (sectoralMappingContainer)
            sectoralMappingContainer.style.display = "none";

        // Show sectoral functionality container
        sectoralFunctionalityContainer.style.display = "flex";

        // Show the main fullscreen popup if it's hidden
        if (!fullscreenPopup.classList.contains("show")) {
            fullscreenPopup.style.display = "flex";
            // Force a reflow
            fullscreenPopup.offsetHeight;
            // Add the show class to trigger animations
            fullscreenPopup.classList.add("show");
            // Prevent body scrolling
            document.body.style.overflow = "hidden";
        }

        // Populate the table with real data
        populateSectoralFunctionalityTable();
    }
}

// Function to hide the Urban Sectoral Functionality calculation interface
function hideSectoralFunctionalityCalculation() {
    const sectoralFunctionalityContainer = document.getElementById(
        "sectoral-functionality-container"
    );
    const modalBackdrop = document.getElementById("modal-backdrop");

    if (sectoralFunctionalityContainer) {
        sectoralFunctionalityContainer.style.display = "none";
        // Reset styles applied to make it a modal
        sectoralFunctionalityContainer.style.position = "";
        sectoralFunctionalityContainer.style.top = "";
        sectoralFunctionalityContainer.style.left = "";
        sectoralFunctionalityContainer.style.width = "";
        sectoralFunctionalityContainer.style.height = "";
        sectoralFunctionalityContainer.style.zIndex = "";
        sectoralFunctionalityContainer.style.backgroundColor = "";
        sectoralFunctionalityContainer.style.overflowY = "";

        const contentDiv = sectoralFunctionalityContainer.querySelector(
            'div[style*="overflow-y: auto"]'
        );
        if (contentDiv) {
            contentDiv.style.maxWidth = "";
            contentDiv.style.margin = "";
            contentDiv.style.backgroundColor = "";
            contentDiv.style.padding = "";
            contentDiv.style.borderRadius = "";
            contentDiv.style.boxShadow = "";
        }

        // Remove the click outside listener to prevent memory leaks
        const closeSectoralView = arguments.callee.caller; // This is not reliable, better to use a named function or clean reference
        // A more robust way to remove the listener would involve storing the function reference when adding it.
    }

    if (modalBackdrop) {
        modalBackdrop.classList.remove("show");
        modalBackdrop.style.zIndex = "";
    }
}

// Find the close button within the sectoral functionality container and add an event listener
document.addEventListener("DOMContentLoaded", function () {
    const sectoralFunctionalityContainer = document.getElementById(
        "sectoral-functionality-container"
    );
    if (sectoralFunctionalityContainer) {
        // Assuming there is a close button with class 'close-btn' or similar within the header
        const closeButton =
            sectoralFunctionalityContainer.querySelector(".close-btn"); // Adjust selector as needed
        if (closeButton) {
            closeButton.addEventListener(
                "click",
                hideSectoralFunctionalityCalculation
            );
        }
        // Also add click outside listener here, so we can easily remove it in hide function
        sectoralFunctionalityContainer.addEventListener("click", function (event) {
            // Check if the click was directly on the container background
            if (event.target === sectoralFunctionalityContainer) {
                hideSectoralFunctionalityCalculation();
            }
        });
    }

    // Add event listener for the reset neighborhoods button
    const resetNeighborhoodsBtn = document.getElementById(
        "reset-neighborhoods-btn"
    );
    if (resetNeighborhoodsBtn) {
        resetNeighborhoodsBtn.addEventListener("click", function () {
            // Show confirmation dialog
            if (
                confirm(
                    "هل أنت متأكد من إعادة ضبط طبقة الأحياء للحالة الافتراضية؟\nسيؤدي هذا إلى إزالة جميع التحليلات والتلوين المطبق على الطبقة."
                )
            ) {
                resetNeighborhoodsToDefault();
            }
        });
    }
});

// Function to populate the Urban Sectoral Functionality table
function populateSectoralFunctionalityTable() {
    const tableBody = document.querySelector(
        "#sectoral-functionality-table tbody"
    );

    if (!tableBody) {
        console.error("Sectoral functionality table body not found");
        return;
    }

    // Clear existing rows
    tableBody.innerHTML = "";

    // Check if tablesData is available
    if (typeof window.tablesData === "undefined") {
        console.warn("tablesData not available, loading tabs.js...");
        // Try to load tabs.js if not already loaded
        const script = document.createElement("script");
        script.src = "js/tabs.js";
        script.onload = () => {
            console.log("tabs.js loaded, retrying table population...");
            setTimeout(() => populateSectoralFunctionalityTable(), 100);
        };
        document.head.appendChild(script);
        return;
    }

    // Get current date in Gregorian format
    const currentDate = new Date().toLocaleDateString("en-US");

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
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

    // Initialize global sectoral functionality data storage
    if (!window.sectoralFunctionalityData) {
        window.sectoralFunctionalityData = {};
    }

    // Get neighborhoods data
    if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
        neighborhoodsData.features.forEach((feature, index) => {
            const properties = feature.properties;
            const neighborhoodName =
                properties.Names ||
                properties.Name_En ||
                properties.Name ||
                `الحي ${index + 1}`;

            const tr = document.createElement("tr");

            // Initialize neighborhood data in global storage
            if (!window.sectoralFunctionalityData[neighborhoodName]) {
                window.sectoralFunctionalityData[neighborhoodName] = {};
            }

            // Create row HTML
            let rowHTML = `
        <td style="font-weight: bold; background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6;">${neighborhoodName}</td>
        <td style="text-align: center; color: #6c757d; padding: 8px; border: 1px solid #dee2e6;">${currentDate}</td>
      `;

            // Calculate sectoral functionality for each column
            sectoralColumns.forEach((columnName) => {
                let functionality;

                // Check if we already have data for this neighborhood and sector
                if (
                    window.sectoralFunctionalityData[neighborhoodName] &&
                    window.sectoralFunctionalityData[neighborhoodName][columnName]
                ) {
                    functionality =
                        window.sectoralFunctionalityData[neighborhoodName][columnName];
                } else {
                    // Generate new data if not exists
                    functionality = generateRandomSectoralFunctionality(columnName);

                    // Store the data in global storage for mapping use
                    if (!window.sectoralFunctionalityData[neighborhoodName]) {
                        window.sectoralFunctionalityData[neighborhoodName] = {};
                    }
                    window.sectoralFunctionalityData[neighborhoodName][columnName] =
                        functionality;
                }

                const functionalityClass = getFunctionalityClass(functionality.status);
                const functionalityColor = getFunctionalityColor(
                    functionality.percentage
                );

                rowHTML += `
          <td style="text-align: center; padding: 6px; border: 1px solid #dee2e6;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="
                background: ${functionalityColor};
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                min-width: 35px;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              ">${functionality.percentage}%</span>
              <span style="font-size: 9px; color: #6c757d; font-weight: 500;">${functionality.status}</span>
            </div>
          </td>
        `;
            });

            tr.innerHTML = rowHTML;
            tr.style.transition = "background-color 0.2s ease";
            tableBody.appendChild(tr);
        });

        console.log(
            `Populated sectoral functionality table with ${neighborhoodsData.features.length} neighborhoods`
        );
    } else {
        // Create sample data if no neighborhoods data available
        const sampleNeighborhoods = [
            "الخالدية",
            "صلاح الدين",
            "الميدان",
            "العزيزية",
            "الشعار",
            "باب النيرب",
            "المحافظة",
            "الجميلية",
            "السبيل",
            "الكلاسة",
        ];

        sampleNeighborhoods.forEach((neighborhoodName) => {
            const tr = document.createElement("tr");

            // Initialize neighborhood data in global storage
            if (!window.sectoralFunctionalityData[neighborhoodName]) {
                window.sectoralFunctionalityData[neighborhoodName] = {};
            }

            let rowHTML = `
        <td style="font-weight: bold; background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6;">${neighborhoodName}</td>
        <td style="text-align: center; color: #6c757d; padding: 8px; border: 1px solid #dee2e6;">${currentDate}</td>
      `;

            sectoralColumns.forEach((columnName) => {
                let functionality;

                // Check if we already have data for this neighborhood and sector
                if (
                    window.sectoralFunctionalityData[neighborhoodName] &&
                    window.sectoralFunctionalityData[neighborhoodName][columnName]
                ) {
                    functionality =
                        window.sectoralFunctionalityData[neighborhoodName][columnName];
                } else {
                    // Generate new data if not exists
                    functionality = generateRandomSectoralFunctionality(columnName);

                    // Store the data in global storage for mapping use
                    if (!window.sectoralFunctionalityData[neighborhoodName]) {
                        window.sectoralFunctionalityData[neighborhoodName] = {};
                    }
                    window.sectoralFunctionalityData[neighborhoodName][columnName] =
                        functionality;
                }

                const functionalityColor = getFunctionalityColor(
                    functionality.percentage
                );

                rowHTML += `
          <td style="text-align: center; padding: 6px; border: 1px solid #dee2e6;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="
                background: ${functionalityColor};
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                min-width: 35px;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              ">${functionality.percentage}%</span>
              <span style="font-size: 9px; color: #6c757d; font-weight: 500;">${functionality.status}</span>
            </div>
          </td>
        `;
            });

            tr.innerHTML = rowHTML;
            tr.style.transition = "background-color 0.2s ease";
            tableBody.appendChild(tr);
        });

        console.log("Populated sectoral functionality table with sample data");
    }
}

// Function to calculate sectoral functionality based on tablesData
function calculateSectoralFunctionality(properties, sectorName) {
    try {
        // Get tablesData from window object
        const tablesData = window.tablesData;
        if (!tablesData) {
            console.warn("tablesData not available for sector:", sectorName);
            return {
                percentage: Math.floor(Math.random() * 100),
                status: "غير متاح",
            };
        }

        let percentage = 0;
        let status = "ضعيف";

        // Map sector names to tablesData keys
        const sectorMapping = {
            "التدخلات الإنسانية": "التدخلات_الإنسانية",
            "الأسواق الأساسية": "الأسواق_الأساسية",
            "إدارة النفايات الصلبة": "إدارة_النفايات_الصلبة",
            "شبكة الكهرباء": "شبكة_الكهرباء",
            "شبكة الاتصالات": "شبكة_الاتصالات",
            "إمدادات المياه": "إمدادات_المياه",
            "شبكة الصرف الصحي": "شبكة_الصرف_الصحي",
            "أضرار الإسكان": "أضرار_الإسكان",
            "النسيج الحضري": "النسيج_الحضري",
            "التغيرات السكانية": "التغيرات_السكانية",
        };

        const tableKey = sectorMapping[sectorName];
        if (!tableKey || !tablesData[tableKey]) {
            return {
                percentage: Math.floor(Math.random() * 100),
                status: "غير محدد",
            };
        }

        const sampleData = tablesData[tableKey].sampleData;

        // Calculate functionality based on sector type and sample data
        switch (sectorName) {
            case "التدخلات الإنسانية":
                // Calculate based on humanitarian intervention quality
                const interventionScores = {
                    جيد: 100,
                    مقبول: 70,
                    ضعيف: 30,
                };
                const healthScore = interventionScores[sampleData.health] || 0;
                const foodScore = interventionScores[sampleData.food] || 0;
                const clothesScore = interventionScores[sampleData.clothes] || 0;
                const housingScore = interventionScores[sampleData.housing] || 0;
                const eduScore = interventionScores[sampleData.edu] || 0;
                const learningScore = interventionScores[sampleData.learning] || 0;
                const incomeScore = interventionScores[sampleData.incom_improve] || 0;

                percentage = Math.round(
                    (healthScore +
                        foodScore +
                        clothesScore +
                        housingScore +
                        eduScore +
                        learningScore +
                        incomeScore) /
                    7
                );
                break;

            case "الأسواق الأساسية":
                // Calculate based on market operational status and shop count
                const marketStatusScores = {
                    "يعمل بشكل اعتيادي": 100,
                    "يعمل بشكل مقبول": 75,
                    "يعمل بشكل متقطع": 40,
                    "لا يعمل (معدوم)": 0,
                };
                const statusScore = marketStatusScores[sampleData.status] || 0;
                const shopsCount = parseInt(sampleData.shops) || 0;
                const shopsScore = Math.min(100, (shopsCount / 100) * 100); // Normalize to 100 shops = 100%

                percentage = Math.round(statusScore * 0.7 + shopsScore * 0.3);
                break;

            case "إدارة النفايات الصلبة":
                // Calculate based on waste management indicators
                const cleanlinessScores = {
                    جيدة: 100,
                    مقبول: 70,
                    ضعيف: 40,
                    معدوم: 0,
                };
                const pestControlScores = {
                    دائما: 100,
                    احيانا: 60,
                    "لا يوجد": 0,
                };
                const rubbleRemovalScores = {
                    "بشكل دائم": 100,
                    "بشكل جزئي": 60,
                    "لا يوجد ترحيل": 0,
                };
                const dumpingSitesScore =
                    sampleData.dumping_sites === "لا يوجد" ? 100 : 0;

                const cleanScore = cleanlinessScores[sampleData.cleanliness] || 0;
                const pestScore = pestControlScores[sampleData.pest_control] || 0;
                const rubbleScore = rubbleRemovalScores[sampleData.rubble_removal] || 0;

                percentage = Math.round(
                    dumpingSitesScore * 0.3 +
                    cleanScore * 0.3 +
                    pestScore * 0.2 +
                    rubbleScore * 0.2
                );
                break;

            case "شبكة الكهرباء":
                // Calculate based on electrical network damage and status
                const damageScores2 = {
                    معدوم: 100,
                    خفيف: 80,
                    متوسط: 50,
                    شديد: 20,
                };
                const networkStatusScores = {
                    تعمل: 100,
                    "تعمل جزئيا": 60,
                    "لا تعمل": 0,
                };

                const transformerScore =
                    damageScores2[sampleData.transformer_damage] || 0;
                const lineScore = damageScores2[sampleData.line_damage] || 0;
                const networkStatus = networkStatusScores[sampleData.status] || 0;

                percentage = Math.round(
                    transformerScore * 0.4 + lineScore * 0.3 + networkStatus * 0.3
                );
                break;

            case "شبكة الاتصالات":
                // Same calculation as electrical network
                const teleDamageScores = {
                    معدوم: 100,
                    خفيف: 80,
                    متوسط: 50,
                    شديد: 20,
                };
                const teleNetworkStatusScores = {
                    تعمل: 100,
                    "تعمل جزئيا": 60,
                    "لا تعمل": 0,
                };

                const teleTransformerScore =
                    teleDamageScores[sampleData.transformer_damage] || 0;
                const teleLineScore = teleDamageScores[sampleData.line_damage] || 0;
                const teleNetworkStatus =
                    teleNetworkStatusScores[sampleData.status] || 0;

                percentage = Math.round(
                    teleTransformerScore * 0.4 +
                    teleLineScore * 0.3 +
                    teleNetworkStatus * 0.3
                );
                break;

            case "إمدادات المياه":
                // Calculate based on water supply status and damage
                const connectionScore = sampleData.connected === "نعم" ? 100 : 0;
                const waterDamageScores = {
                    منخفض: 100,
                    متوسط: 70,
                    مرتفع: 40,
                    "عالٍ جداً": 10,
                };
                const waterStatusScores = {
                    "يعمل كاملاً": 100,
                    "يعمل جزئياً": 60,
                    متوقف: 0,
                };

                const waterDamageScore = waterDamageScores[sampleData.main_damage] || 0;
                const waterStatus = waterStatusScores[sampleData.main_status] || 0;
                const operationRatio =
                    parseInt(sampleData.secondary_status?.replace("%", "")) || 0;

                percentage = Math.round(
                    connectionScore * 0.2 +
                    waterDamageScore * 0.3 +
                    waterStatus * 0.3 +
                    operationRatio * 0.2
                );
                break;

            case "شبكة الصرف الصحي":
                // Same calculation as water supply
                const sewerConnectionScore = sampleData.connected === "نعم" ? 100 : 0;
                const sewerDamageScores = {
                    منخفض: 100,
                    متوسط: 70,
                    مرتفع: 40,
                    "عالٍ جداً": 10,
                };
                const sewerStatusScores = {
                    "يعمل كاملاً": 100,
                    "يعمل جزئياً": 60,
                    متوقف: 0,
                };

                const sewerDamageScore = sewerDamageScores[sampleData.main_damage] || 0;
                const sewerStatus = sewerStatusScores[sampleData.main_status] || 0;
                const sewerOperationRatio =
                    parseInt(sampleData.secondary_status?.replace("%", "")) || 0;

                percentage = Math.round(
                    sewerConnectionScore * 0.2 +
                    sewerDamageScore * 0.3 +
                    sewerStatus * 0.3 +
                    sewerOperationRatio * 0.2
                );
                break;

            case "أضرار الإسكان":
                // Calculate based on housing damage (inverse - less damage = higher functionality)
                const severeDamage =
                    parseInt(sampleData.severe_damage?.replace("%", "")) || 0;
                const mediumDamage =
                    parseInt(sampleData.medium_damage?.replace("%", "")) || 0;
                const lightDamage =
                    parseInt(sampleData.light_damage?.replace("%", "")) || 0;
                const undamagedUnits =
                    parseInt(sampleData.undamaged_units?.replace("%", "")) || 0;

                // Higher undamaged percentage = higher functionality
                // Lower damage percentages = higher functionality
                percentage = Math.round(
                    undamagedUnits +
                    (100 - severeDamage - mediumDamage - lightDamage) * 0.3
                );
                percentage = Math.min(100, Math.max(0, percentage));
                break;

            case "النسيج الحضري":
                // Calculate based on urban fabric quality
                const urbanStatusScores = {
                    منظم: 100,
                    مختلط: 70,
                    "بلدة قديمة": 60,
                    عشوائي: 30,
                };
                const urbanScore = urbanStatusScores[sampleData.urbn_status] || 0;
                const informalPercent =
                    parseInt(sampleData.informal_percent?.replace("%", "")) || 0;
                const traditionalPercent =
                    parseInt(sampleData.traditional_percent?.replace("%", "")) || 0;

                // Lower informal housing = higher functionality
                // Higher traditional housing = moderate functionality
                percentage = Math.round(
                    urbanScore * 0.5 +
                    (100 - informalPercent) * 0.3 +
                    traditionalPercent * 0.2
                );
                break;

            case "التغيرات السكانية":
                // Calculate based on population stability
                const population = parseInt(sampleData.population) || 0;
                const migrantsPercent =
                    parseInt(sampleData.migrants?.replace("%", "")) || 0;
                const returneesPercent =
                    parseInt(sampleData.returnees?.replace("%", "")) || 0;

                // Higher returnees = positive, lower migrants = more stable
                const stabilityScore = Math.max(
                    0,
                    100 - migrantsPercent + returneesPercent * 0.5
                );
                const populationScore = Math.min(100, (population / 50000) * 100); // Normalize to 50k population

                percentage = Math.round(stabilityScore * 0.7 + populationScore * 0.3);
                break;

            default:
                percentage = Math.floor(Math.random() * 100);
        }

        // Ensure percentage is within bounds
        percentage = Math.min(100, Math.max(0, percentage));

        // Determine status based on percentage
        if (percentage >= 80) {
            status = "ممتاز";
        } else if (percentage >= 65) {
            status = "جيد";
        } else if (percentage >= 50) {
            status = "متوسط";
        } else if (percentage >= 30) {
            status = "ضعيف";
        } else {
            status = "سيء";
        }

        return {
            percentage: percentage,
            status: status,
        };
    } catch (error) {
        console.error(
            "Error calculating sectoral functionality for",
            sectorName,
            ":",
            error
        );
        return {
            percentage: Math.floor(Math.random() * 100),
            status: "خطأ في الحساب",
        };
    }
}

// Helper function to get color based on functionality percentage
function getFunctionalityColor(percentage) {
    if (percentage >= 80) {
        return "#28a745"; // Green - Excellent
    } else if (percentage >= 65) {
        return "#20c997"; // Teal - Good
    } else if (percentage >= 50) {
        return "#ffc107"; // Yellow - Average
    } else if (percentage >= 30) {
        return "#fd7e14"; // Orange - Poor
    } else {
        return "#dc3545"; // Red - Bad
    }
}

// Helper function to get CSS class for functionality status
function getFunctionalityClass(functionality) {
    switch (functionality) {
        case "ممتاز":
            return "excellent";
        case "جيد":
            return "good";
        case "متوسط":
            return "average";
        case "ضعيف":
            return "poor";
        case "سيء":
            return "bad";
        default:
            return "average";
    }
}

// Function to randomize sectoral functionality data
function randomizeSectoralFunctionality() {
    console.log("Randomizing sectoral functionality data...");

    // Check if tablesData is available
    if (typeof window.tablesData === "undefined") {
        console.warn("tablesData not available for randomization");
        return;
    }

    // Create randomized data for each neighborhood
    const tableBody = document.querySelector(
        "#sectoral-functionality-table tbody"
    );
    if (!tableBody) {
        console.error("Table body not found");
        return;
    }

    // Clear existing rows
    tableBody.innerHTML = "";

    // Get current date in Gregorian format
    const currentDate = new Date().toLocaleDateString("en-US");

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
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

    // Get neighborhoods data or use sample data
    let neighborhoods = [];
    if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
        neighborhoods = neighborhoodsData.features
            .map((feature, index) => {
                const properties = feature.properties;
                return (
                    properties.Names ||
                    properties.Name_En ||
                    properties.name ||
                    properties.NAME ||
                    `الحي ${index + 1}`
                );
            })
            .filter((name) => name); // Remove any null/undefined names
        console.log("Using neighborhoods from GeoJSON data:", neighborhoods);
    } else {
        neighborhoods = [
            "الخالدية",
            "صلاح الدين",
            "الميدان",
            "العزيزية",
            "الشعار",
            "باب النيرب",
            "المحافظة",
            "الجميلية",
            "السبيل",
            "الكلاسة",
        ];
        console.log("Using fallback neighborhood names:", neighborhoods);
    }

    // Initialize global sectoral functionality data storage
    if (!window.sectoralFunctionalityData) {
        window.sectoralFunctionalityData = {};
    }

    // Generate randomized data for each neighborhood
    neighborhoods.forEach((neighborhoodName) => {
        const tr = document.createElement("tr");

        let rowHTML = `
      <td style="font-weight: bold; background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6;">${neighborhoodName}</td>
      <td style="text-align: center; color: #6c757d; padding: 8px; border: 1px solid #dee2e6;">${currentDate}</td>
    `;

        // Initialize neighborhood data in global storage
        if (!window.sectoralFunctionalityData[neighborhoodName]) {
            window.sectoralFunctionalityData[neighborhoodName] = {};
        }

        // Generate random functionality for each sector for this specific neighborhood
        sectoralColumns.forEach((columnName) => {
            const functionality = generateRandomSectoralFunctionality(columnName);
            const functionalityColor = getFunctionalityColor(
                functionality.percentage
            );

            // Store the data in global storage for mapping use
            window.sectoralFunctionalityData[neighborhoodName][columnName] = {
                percentage: functionality.percentage,
                status: functionality.status,
            };

            rowHTML += `
        <td style="text-align: center; padding: 6px; border: 1px solid #dee2e6;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="
              background: ${functionalityColor};
              color: white;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              min-width: 35px;
              display: inline-block;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            ">${functionality.percentage}%</span>
            <span style="font-size: 9px; color: #6c757d; font-weight: 500;">${functionality.status}</span>
          </div>
        </td>
      `;
        });

        tr.innerHTML = rowHTML;
        tr.style.transition = "background-color 0.2s ease";
        tableBody.appendChild(tr);
    });

    console.log(
        "Sectoral functionality data randomized successfully for",
        neighborhoods.length,
        "neighborhoods"
    );
}

// Debug function to check sectoral data
function debugSectoralData() {
    console.log("=== SECTORAL DATA DEBUG ===");
    console.log(
        "neighborhoodsData available:",
        typeof neighborhoodsData !== "undefined"
    );
    console.log(
        "sectoralFunctionalityData available:",
        !!window.sectoralFunctionalityData
    );

    if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
        console.log(
            "Number of neighborhoods in GeoJSON:",
            neighborhoodsData.features.length
        );
        console.log(
            "Sample neighborhood properties:",
            neighborhoodsData.features[0].properties
        );

        const sampleNames = neighborhoodsData.features
            .slice(0, 5)
            .map((feature) => {
                return {
                    Names: feature.properties.Names,
                    Name_En: feature.properties.Name_En,
                    name: feature.properties.name,
                    NAME: feature.properties.NAME,
                };
            });
        console.log("Sample neighborhood names:", sampleNames);
    }

    if (window.sectoralFunctionalityData) {
        console.log(
            "Number of neighborhoods in sectoral data:",
            Object.keys(window.sectoralFunctionalityData).length
        );
        console.log(
            "Sample neighborhood names in data:",
            Object.keys(window.sectoralFunctionalityData).slice(0, 5)
        );

        const firstNeighborhood = Object.keys(window.sectoralFunctionalityData)[0];
        if (firstNeighborhood) {
            console.log(
                "Sample data for",
                firstNeighborhood,
                ":",
                window.sectoralFunctionalityData[firstNeighborhood]
            );
        }
    }

    console.log("=== END DEBUG ===");
}

// Test function to force regenerate data and apply composite coloring
function testCompositeColoring() {
    console.log("Testing composite coloring...");

    // Force regenerate sectoral data
    populateSectoralFunctionalityTable();

    // Wait a bit then try composite coloring
    setTimeout(() => {
        applyCompositeColoring();
    }, 1000);
}

// Test function to apply sectoral coloring directly
function testSectoralColoring() {
    console.log("Testing sectoral coloring...");

    // Check if data exists
    if (
        !window.sectoralFunctionalityData ||
        Object.keys(window.sectoralFunctionalityData).length === 0
    ) {
        alert("يرجى حساب الفعالية القطاعية أولاً من خلال الجدول");
        return;
    }

    // Apply coloring for the first sector as a test
    const firstSector = "التدخلات الإنسانية";
    applySectoralColoring(firstSector);

    showNotification(`تم تطبيق تلوين ${firstSector} كاختبار`, "success");
}

// Function to create simple sectoral interface
function createSimpleSectoralInterface() {
    console.log("Creating simple sectoral interface...");

    const grid = document.getElementById("sectoralMappingGrid");
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = "";

    // Set grid style for better layout
    grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  `;

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
        {
            name: "التدخلات الإنسانية",
            icon: "fas fa-hands-helping",
            color: "#e74c3c",
        },
        { name: "الأسواق الأساسية", icon: "fas fa-store", color: "#3498db" },
        { name: "إدارة النفايات الصلبة", icon: "fas fa-trash", color: "#2ecc71" },
        { name: "شبكة الكهرباء", icon: "fas fa-bolt", color: "#f1c40f" },
        { name: "شبكة الاتصالات", icon: "fas fa-wifi", color: "#9b59b6" },
        { name: "إمدادات المياه", icon: "fas fa-tint", color: "#3498db" },
        { name: "شبكة الصرف الصحي", icon: "fas fa-water", color: "#34495e" },
        { name: "أضرار الإسكان", icon: "fas fa-home", color: "#e74c3c" },
        { name: "النسيج الحضري", icon: "fas fa-city", color: "#95a5a6" },
        { name: "التغيرات السكانية", icon: "fas fa-users", color: "#16a085" },
    ];

    // Show the blue gradient legend
    const legend = document.getElementById("blueGradientLegend");
    if (legend) {
        legend.style.display = "block";
    }

    // Create simple cards for each sector
    sectoralColumns.forEach((sector, index) => {
        const card = document.createElement("div");
        card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      cursor: pointer;
      text-align: center;
    `;

        // Calculate statistics for this sector
        const stats = calculateSectorStatistics(sector.name);

        card.innerHTML = `
      <div style="margin-bottom: 15px;">
        <div style="
          width: 50px;
          height: 50px;
          background: ${sector.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          margin: 0 auto 10px auto;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">${sector.name}</h4>
      </div>

      <button onclick="applySectoralColoring('${sector.name}')" style="
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        font-weight: bold;
        margin-bottom: 15px;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-paint-brush"></i> تطبيق التلوين الأزرق
      </button>

      <div style="padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 12px;">
        <div style="margin-bottom: 5px; color: #495057; font-weight: bold;">
          إجمالي الأحياء: ${stats.total}
        </div>
        <div style="display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="flex: ${stats.excellent}; background: #0d47a1;" title="ممتاز: ${stats.excellent}"></div>
          <div style="flex: ${stats.good}; background: #1976d2;" title="جيد: ${stats.good}"></div>
          <div style="flex: ${stats.average}; background: #42a5f5;" title="متوسط: ${stats.average}"></div>
          <div style="flex: ${stats.poor}; background: #90caf9;" title="ضعيف: ${stats.poor}"></div>
          <div style="flex: ${stats.bad}; background: #e3f2fd;" title="سيء: ${stats.bad}"></div>
        </div>
      </div>
    `;

        // Add hover effects
        card.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-5px)";
            this.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
        });

        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        });

        grid.appendChild(card);
    });

    console.log(
        "Simple sectoral interface created with",
        sectoralColumns.length,
        "sectors"
    );
}

// Function to refresh sectoral data
function refreshSectoralData() {
    console.log("Refreshing sectoral data...");

    // Generate random data for all neighborhoods and sectors
    generateRandomSectoralFunctionalityForAll();

    // Show success message
    showNotification("تم تحديث البيانات بنجاح", "success");

    // Update status message
    const statusMessage = document.getElementById("statusMessage");
    if (statusMessage) {
        statusMessage.innerHTML = `
      <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 20px; color: #28a745;"></i><br>
      تم تحديث البيانات بنجاح! اضغط على "إظهار القطاعات" لعرض الخرائط الملونة
    `;
    }
}

// Function to show sectoral maps
function showSectoralMaps() {
    console.log("Showing sectoral maps...");

    // Check if data exists
    if (
        !window.sectoralFunctionalityData ||
        Object.keys(window.sectoralFunctionalityData).length === 0
    ) {
        alert("يرجى تحديث البيانات أولاً");
        return;
    }

    // Hide status message and show maps container
    const statusMessage = document.getElementById("statusMessage");
    const mapsContainer = document.getElementById("sectoralMapsContainer");

    if (statusMessage) statusMessage.style.display = "none";
    if (mapsContainer) {
        mapsContainer.style.display = "block";
        createSectoralMapsGrid();
    }
}

// Function to create sectoral maps grid
function createSectoralMapsGrid() {
    const container = document.getElementById("sectoralMapsContainer");
    if (!container) return;

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
        {
            name: "التدخلات الإنسانية",
            icon: "fas fa-hands-helping",
            color: "#e74c3c",
        },
        { name: "الأسواق الأساسية", icon: "fas fa-store", color: "#3498db" },
        { name: "إدارة النفايات الصلبة", icon: "fas fa-trash", color: "#2ecc71" },
        { name: "شبكة الكهرباء", icon: "fas fa-bolt", color: "#f1c40f" },
        { name: "شبكة الاتصالات", icon: "fas fa-wifi", color: "#9b59b6" },
        { name: "إمدادات المياه", icon: "fas fa-tint", color: "#3498db" },
        { name: "شبكة الصرف الصحي", icon: "fas fa-water", color: "#34495e" },
        { name: "أضرار الإسكان", icon: "fas fa-home", color: "#e74c3c" },
        { name: "النسيج الحضري", icon: "fas fa-city", color: "#95a5a6" },
        { name: "التغيرات السكانية", icon: "fas fa-users", color: "#16a085" },
    ];

    container.innerHTML = `
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
    ">
      ${sectoralColumns
            .map(
                (sector) => `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="
              width: 40px;
              height: 40px;
              background: ${sector.color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
            ">
              <i class="${sector.icon}"></i>
            </div>
            <h4 style="margin: 0; color: #333; font-size: 14px; font-weight: bold;">${sector.name
                    }</h4>
          </div>

          <div id="miniMap-${sector.name.replace(/\s+/g, "-")}" style="
            height: 200px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            margin-bottom: 10px;
          "></div>

          <button onclick="applySectoralColoring('${sector.name}')" style="
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
            font-weight: bold;
          ">
            <i class="fas fa-paint-brush"></i> تطبيق على الخريطة الرئيسية
          </button>
        </div>
      `
            )
            .join("")}
    </div>
  `;

    // Create mini maps for each sector
    setTimeout(() => {
        sectoralColumns.forEach((sector) => {
            createMiniMapForSector(
                sector.name,
                `miniMap-${sector.name.replace(/\s+/g, "-")}`
            );
        });
    }, 100);
}

// Function to generate random sectoral functionality for all neighborhoods and sectors
function generateRandomSectoralFunctionalityForAll() {
    console.log("Generating random sectoral functionality for all...");

    // Initialize the global data object
    window.sectoralFunctionalityData = {};

    // Get neighborhood names
    if (typeof neighborhoodsData === "undefined" || !neighborhoodsData.features) {
        console.error("Neighborhoods data not available");
        return;
    }

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
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

    // Generate data for each neighborhood
    neighborhoodsData.features.forEach((feature) => {
        const properties = feature.properties;
        const neighborhoodName =
            properties.Names ||
            properties.Name_En ||
            properties.name ||
            properties.NAME;

        if (neighborhoodName) {
            window.sectoralFunctionalityData[neighborhoodName] = {};

            // Generate data for each sector
            sectoralColumns.forEach((sectorName) => {
                const sectorData = generateRandomSectoralFunctionality(sectorName);
                window.sectoralFunctionalityData[neighborhoodName][sectorName] =
                    sectorData;
            });
        }
    });

    console.log(
        "Generated sectoral functionality data for neighborhoods:",
        Object.keys(window.sectoralFunctionalityData)
    );

    console.log(
        "Generated sectoral functionality data for",
        Object.keys(window.sectoralFunctionalityData).length,
        "neighborhoods"
    );
}

// Function to initialize weights interface
function initializeWeightsInterface() {
    console.log("Initializing weights interface...");

    const weightsGrid = document.getElementById("weightsGrid");
    if (!weightsGrid) return;

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
        {
            name: "التدخلات الإنسانية",
            icon: "fas fa-hands-helping",
            color: "#e74c3c",
        },
        { name: "الأسواق الأساسية", icon: "fas fa-store", color: "#3498db" },
        { name: "إدارة النفايات الصلبة", icon: "fas fa-trash", color: "#2ecc71" },
        { name: "شبكة الكهرباء", icon: "fas fa-bolt", color: "#f1c40f" },
        { name: "شبكة الاتصالات", icon: "fas fa-wifi", color: "#9b59b6" },
        { name: "إمدادات المياه", icon: "fas fa-tint", color: "#3498db" },
        { name: "شبكة الصرف الصحي", icon: "fas fa-water", color: "#34495e" },
        { name: "أضرار الإسكان", icon: "fas fa-home", color: "#e74c3c" },
        { name: "النسيج الحضري", icon: "fas fa-city", color: "#95a5a6" },
        { name: "التغيرات السكانية", icon: "fas fa-users", color: "#16a085" },
    ];

    // Initialize weights storage
    if (!window.sectorWeights) {
        window.sectorWeights = {};
        // Set default equal weights
        const defaultWeight = Math.floor(100 / sectoralColumns.length);
        const remainder = 100 - defaultWeight * sectoralColumns.length;

        sectoralColumns.forEach((sector, index) => {
            window.sectorWeights[sector.name] =
                index === 0 ? defaultWeight + remainder : defaultWeight;
        });
    }

    // Create weight input cards
    weightsGrid.innerHTML = sectoralColumns
        .map(
            (sector) => `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 15px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${sector.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <span style="font-size: 13px; font-weight: bold; color: #333; flex: 1;">${sector.name
                }</span>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <input
          type="number"
          id="weight-${sector.name.replace(/\s+/g, "-")}"
          min="0"
          max="100"
          value="${window.sectorWeights[sector.name] || 0}"
          style="
            flex: 1;
            padding: 8px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 14px;
            text-align: center;
          "
          onchange="updateWeight('${sector.name}', this.value)"
        />
        <span style="font-size: 12px; color: #6c757d;">%</span>
      </div>
    </div>
  `
        )
        .join("");

    // Update total weight display
    updateTotalWeight();

    // Add event listener for calculate button
    const calculateBtn = document.getElementById("calculateCompositeBtn");
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculateCompositeEfficiency);
    }

    // Add event listener for apply coloring button
    const applyColoringBtn = document.getElementById("applyCompositeColoringBtn");
    if (applyColoringBtn) {
        applyColoringBtn.addEventListener("click", function () {
            console.log("=== APPLY COMPOSITE COLORING BUTTON CLICKED ===");

            // First, show the sectoral mapping container
            const sectoralMappingContainer = document.getElementById(
                "sectoral-mapping-container"
            );
            if (sectoralMappingContainer) {
                console.log("Showing sectoral mapping container...");
                sectoralMappingContainer.style.display = "flex";

                // Hide other containers
                const containers = [
                    "popup-content-container",
                    "sectoral-functionality-container",
                    "composite-functionality-container",
                ];
                containers.forEach((containerId) => {
                    const container = document.getElementById(containerId);
                    if (container) {
                        container.style.display = "none";
                    }
                });

                // Now call the function to create the interface
                showCompositeColoringWithSectoralGrid();
            } else {
                console.error("Sectoral mapping container not found!");
            }
        });
    }
}

// Function to initialize final weights interface
function initializeFinalWeightsInterface() {
    console.log("Initializing final weights interface...");

    const weightsGrid = document.getElementById("finalWeightsGrid");
    if (!weightsGrid) return;

    // Final urban effectiveness components (only 2 components)
    const finalComponents = [
        {
            name: "التغيرات السكانية",
            icon: "fas fa-users",
            color: "#16a085",
            description: "التغيرات الديموغرافية والسكانية",
        },
        {
            name: "الفعالية العمرانية المجردة",
            icon: "fas fa-sliders",
            color: "#3498db",
            description: "الفعالية المحسوبة من القطاعات",
        },
    ];

    // Initialize final weights storage
    if (!window.finalWeights) {
        window.finalWeights = {};
        // Set default equal weights (50% each)
        finalComponents.forEach((component) => {
            window.finalWeights[component.name] = 50;
        });
    }

    // Create weight input cards
    weightsGrid.innerHTML = finalComponents
        .map(
            (component) => `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="
          width: 40px;
          height: 40px;
          background: ${component.color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        ">
          <i class="${component.icon}"></i>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px;">${component.name
                }</div>
          <div style="font-size: 12px; color: #6c757d;">${component.description
                }</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <input
          type="number"
          id="final-weight-${component.name.replace(/\s+/g, "-")}"
          min="0"
          max="100"
          value="${window.finalWeights[component.name] || 0}"
          style="
            flex: 1;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 16px;
            text-align: center;
            font-weight: bold;
          "
          onchange="updateFinalWeight('${component.name}', this.value)"
        />
        <span style="font-size: 14px; color: #6c757d; font-weight: bold;">%</span>
      </div>
    </div>
  `
        )
        .join("");

    // Update total weight display
    updateFinalTotalWeight();

    // Add event listener for calculate button
    const calculateBtn = document.getElementById("calculateFinalBtn");
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculateFinalUrbanEffectiveness);
    }

    // Add event listener for apply coloring button
    const applyColoringBtn = document.getElementById("applyFinalColoringBtn");
    if (applyColoringBtn) {
        applyColoringBtn.addEventListener("click", function () {
            applyFinalColoring();
        });
    }
}

// Function to update final weight value
function updateFinalWeight(componentName, value) {
    const numValue = parseInt(value) || 0;
    window.finalWeights[componentName] = Math.max(0, Math.min(100, numValue));
    updateFinalTotalWeight();
}

// Function to update final total weight display
function updateFinalTotalWeight() {
    const totalWeightElement = document.getElementById("finalTotalWeight");
    if (!totalWeightElement || !window.finalWeights) return;

    const total = Object.values(window.finalWeights).reduce(
        (sum, weight) => sum + weight,
        0
    );
    totalWeightElement.textContent = total;

    // Change color based on total
    if (total === 100) {
        totalWeightElement.style.color = "#28a745"; // Green
    } else if (total > 100) {
        totalWeightElement.style.color = "#dc3545"; // Red
    } else {
        totalWeightElement.style.color = "#ffc107"; // Yellow
    }
}

// Function to update weight value
function updateWeight(sectorName, value) {
    const numValue = parseInt(value) || 0;
    window.sectorWeights[sectorName] = Math.max(0, Math.min(100, numValue));
    updateTotalWeight();
}

// Function to update total weight display
function updateTotalWeight() {
    const totalWeightElement = document.getElementById("totalWeight");
    if (!totalWeightElement || !window.sectorWeights) return;

    const total = Object.values(window.sectorWeights).reduce(
        (sum, weight) => sum + weight,
        0
    );
    totalWeightElement.textContent = total;

    // Change color based on total
    if (total === 100) {
        totalWeightElement.style.color = "#28a745"; // Green
    } else if (total > 100) {
        totalWeightElement.style.color = "#dc3545"; // Red
    } else {
        totalWeightElement.style.color = "#ffc107"; // Yellow
    }
}

// Function to calculate final urban effectiveness
function calculateFinalUrbanEffectiveness() {
    console.log("Calculating final urban effectiveness...");

    // Check if weights sum to 100
    const totalWeight = Object.values(window.finalWeights).reduce(
        (sum, weight) => sum + weight,
        0
    );
    if (totalWeight !== 100) {
        alert(`مجموع الأوزان يجب أن يساوي 100. المجموع الحالي: ${totalWeight}`);
        return;
    }

    // Ensure we have both required data sources
    let populationChangesData = {};
    let abstractUrbanEffectivenessData = {};

    // Get population changes data from sectoral functionality data
    if (window.sectoralFunctionalityData) {
        Object.keys(window.sectoralFunctionalityData).forEach(
            (neighborhoodName) => {
                const sectorData =
                    window.sectoralFunctionalityData[neighborhoodName][
                    "التغيرات السكانية"
                    ];
                if (sectorData) {
                    populationChangesData[neighborhoodName] = sectorData.percentage;
                }
            }
        );
    }

    // Get abstract urban effectiveness data from composite efficiency data
    if (window.compositeEfficiencyData) {
        Object.keys(window.compositeEfficiencyData).forEach((neighborhoodName) => {
            abstractUrbanEffectivenessData[neighborhoodName] =
                window.compositeEfficiencyData[neighborhoodName].value;
        });
    }

    // Check if we have data for both components
    if (Object.keys(populationChangesData).length === 0) {
        alert(
            "لا توجد بيانات للتغيرات السكانية. يرجى تحديث البيانات القطاعية أولاً."
        );
        return;
    }

    if (Object.keys(abstractUrbanEffectivenessData).length === 0) {
        alert(
            "لا توجد بيانات للفعالية العمرانية المجردة. يرجى حساب الفعالية المركبة أولاً."
        );
        return;
    }

    // Calculate final urban effectiveness for each neighborhood
    window.finalUrbanEffectivenessData = {};

    // Get all neighborhoods that have both data types
    const allNeighborhoods = new Set([
        ...Object.keys(populationChangesData),
        ...Object.keys(abstractUrbanEffectivenessData),
    ]);

    allNeighborhoods.forEach((neighborhoodName) => {
        const populationValue = populationChangesData[neighborhoodName] || 0;
        const abstractValue = abstractUrbanEffectivenessData[neighborhoodName] || 0;

        // Calculate weighted final effectiveness
        const populationWeight = window.finalWeights["التغيرات السكانية"] || 0;
        const abstractWeight =
            window.finalWeights["الفعالية العمرانية المجردة"] || 0;

        const finalValue =
            (populationValue * populationWeight) / 100 +
            (abstractValue * abstractWeight) / 100;

        // Determine status based on final value
        let status = "";
        if (finalValue >= 80) {
            status = "ممتاز";
        } else if (finalValue >= 65) {
            status = "جيد";
        } else if (finalValue >= 50) {
            status = "متوسط";
        } else if (finalValue >= 30) {
            status = "ضعيف";
        } else {
            status = "سيء";
        }

        window.finalUrbanEffectivenessData[neighborhoodName] = {
            value: Math.round(finalValue * 100) / 100, // Round to 2 decimal places
            status: status,
            color: getFinalColor(finalValue),
            populationComponent: populationValue,
            abstractComponent: abstractValue,
        };
    });

    // Populate results table
    populateFinalResultsTable();

    // Show results section
    const resultsSection = document.getElementById("finalResultsSection");
    if (resultsSection) {
        resultsSection.style.display = "block";
    }

    showNotification("تم حساب الفعالية العمرانية النهائية بنجاح", "success");
}

// Function to get color for final urban effectiveness value
function getFinalColor(value) {
    if (value >= 80) {
        return "#0d47a1"; // Dark blue - Excellent
    } else if (value >= 65) {
        return "#1976d2"; // Medium dark blue - Good
    } else if (value >= 50) {
        return "#42a5f5"; // Medium blue - Average
    } else if (value >= 30) {
        return "#90caf9"; // Light blue - Poor
    } else {
        return "#e3f2fd"; // Very light blue - Bad
    }
}

// Function to populate final results table
function populateFinalResultsTable() {
    const tableBody = document.querySelector("#final-results-table tbody");
    if (!tableBody || !window.finalUrbanEffectivenessData) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    // Sort neighborhoods by final value (descending)
    const sortedNeighborhoods = Object.keys(
        window.finalUrbanEffectivenessData
    ).sort((a, b) => {
        return (
            window.finalUrbanEffectivenessData[b].value -
            window.finalUrbanEffectivenessData[a].value
        );
    });

    // Create table rows
    sortedNeighborhoods.forEach((neighborhoodName) => {
        const data = window.finalUrbanEffectivenessData[neighborhoodName];

        const row = document.createElement("tr");
        row.innerHTML = `
      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">${neighborhoodName}</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center; font-weight: bold; color: ${data.color
            };">${data.value.toFixed(1)}%</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <span style="
          background: ${data.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        ">${data.status}</span>
      </td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <div style="
          width: 30px;
          height: 20px;
          background: ${data.color};
          border-radius: 4px;
          margin: 0 auto;
          border: 1px solid #ddd;
        "></div>
      </td>
    `;

        tableBody.appendChild(row);
    });

    console.log(
        "Populated final results table with",
        sortedNeighborhoods.length,
        "neighborhoods"
    );
}

// Function to apply final coloring to the map
function applyFinalColoring() {
    console.log("Applying final urban effectiveness coloring...");

    // Check if we have final data
    if (
        !window.finalUrbanEffectivenessData ||
        Object.keys(window.finalUrbanEffectivenessData).length === 0
    ) {
        alert(
            "لا توجد بيانات للفعالية النهائية. يرجى حساب الفعالية النهائية أولاً."
        );
        return;
    }

    // Check if neighborhoods layer exists
    if (!window.neighborhoodsLayer) {
        alert("طبقة الأحياء غير متوفرة");
        return;
    }

    // Apply coloring to neighborhoods layer
    window.neighborhoodsLayer.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            const neighborhoodName =
                props.Names || props.Name_En || props.name || props.NAME;

            if (
                neighborhoodName &&
                window.finalUrbanEffectivenessData[neighborhoodName]
            ) {
                const finalData = window.finalUrbanEffectivenessData[neighborhoodName];

                // Apply the color
                layer.setStyle({
                    fillColor: finalData.color,
                    weight: 1,
                    opacity: 1,
                    color: "#ffffff",
                    fillOpacity: 0.8,
                });

                // Update popup with final effectiveness information
                const popupContent = `
          <div style="text-align: center; padding: 15px; min-width: 250px; font-family: 'Cairo', sans-serif;">
            <h5 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">
              ${neighborhoodName}
            </h5>
            <div style="margin: 15px 0;">
              <div style="font-size: 28px; font-weight: bold; margin: 15px 0; color: ${finalData.color
                    };">
                ${finalData.value.toFixed(1)}%
              </div>
              <div style="
                padding: 8px 15px;
                background: ${finalData.color};
                border-radius: 20px;
                color: white;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 15px;
              ">
                ${finalData.status}
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">تفاصيل المكونات:</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6c757d;">التغيرات السكانية:</span>
                <span style="font-weight: bold; color: #16a085;">${finalData.populationComponent.toFixed(
                        1
                    )}%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6c757d;">الفعالية المجردة:</span>
                <span style="font-weight: bold; color: #3498db;">${finalData.abstractComponent.toFixed(
                        1
                    )}%</span>
              </div>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: #6c757d;">
              الفعالية العمرانية النهائية
            </div>
          </div>
        `;

                layer.bindPopup(popupContent, {
                    maxWidth: 300,
                    className: "final-effectiveness-popup",
                });
            } else {
                // Reset to default style if no data
                layer.setStyle({
                    fillColor: "#e9ecef",
                    weight: 1,
                    opacity: 1,
                    color: "#ffffff",
                    fillOpacity: 0.5,
                });
            }
        }
    });

    // Show success notification
    showNotification(
        "تم تطبيق تلوين الفعالية العمرانية النهائية على الخريطة",
        "success"
    );

    // Hide the popup after applying coloring
    setTimeout(() => {
        hideFullscreenPopup();
    }, 1500);
}

// Function to calculate composite efficiency
function calculateCompositeEfficiency() {
    console.log("Calculating composite efficiency...");

    // Check if weights sum to 100
    const totalWeight = Object.values(window.sectorWeights).reduce(
        (sum, weight) => sum + weight,
        0
    );
    if (totalWeight !== 100) {
        alert(`مجموع الأوزان يجب أن يساوي 100. المجموع الحالي: ${totalWeight}`);
        return;
    }

    // Check if sectoral data exists
    if (
        !window.sectoralFunctionalityData ||
        Object.keys(window.sectoralFunctionalityData).length === 0
    ) {
        alert("يرجى تحديث الفعالية القطاعية أولاً من الواجهة الأخرى");
        return;
    }

    // Calculate composite efficiency for each neighborhood
    window.compositeEfficiencyData = {};

    Object.keys(window.sectoralFunctionalityData).forEach((neighborhoodName) => {
        let compositeValue = 0;

        // Calculate weighted sum: ∑(sector functionality × weight)
        Object.keys(window.sectorWeights).forEach((sectorName) => {
            const sectorData =
                window.sectoralFunctionalityData[neighborhoodName][sectorName];
            const weight = window.sectorWeights[sectorName];

            if (sectorData && typeof sectorData.percentage !== "undefined") {
                compositeValue += (sectorData.percentage * weight) / 100;
            }
        });

        // Determine status based on composite value
        let status = "";
        if (compositeValue >= 80) {
            status = "ممتاز";
        } else if (compositeValue >= 65) {
            status = "جيد";
        } else if (compositeValue >= 50) {
            status = "متوسط";
        } else if (compositeValue >= 30) {
            status = "ضعيف";
        } else {
            status = "سيء";
        }

        window.compositeEfficiencyData[neighborhoodName] = {
            value: Math.round(compositeValue * 100) / 100, // Round to 2 decimal places
            status: status,
            color: getCompositeColor(compositeValue),
        };
    });

    // Populate results table
    populateCompositeResultsTable();

    // Show results section
    const resultsSection = document.getElementById("compositeResultsSection");
    if (resultsSection) {
        resultsSection.style.display = "block";
    }

    showNotification("تم حساب الفعالية المركبة بنجاح", "success");
}

// Function to get color for composite efficiency value
function getCompositeColor(value) {
    if (value >= 80) {
        return "#0d47a1"; // Dark blue - Excellent
    } else if (value >= 65) {
        return "#1976d2"; // Medium dark blue - Good
    } else if (value >= 50) {
        return "#42a5f5"; // Medium blue - Average
    } else if (value >= 30) {
        return "#90caf9"; // Light blue - Poor
    } else {
        return "#e3f2fd"; // Very light blue - Bad
    }
}

// Function to populate composite results table
function populateCompositeResultsTable() {
    const tableBody = document.querySelector("#composite-results-table tbody");
    if (!tableBody || !window.compositeEfficiencyData) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    // Sort neighborhoods by composite value (descending)
    const sortedNeighborhoods = Object.keys(window.compositeEfficiencyData).sort(
        (a, b) => {
            return (
                window.compositeEfficiencyData[b].value -
                window.compositeEfficiencyData[a].value
            );
        }
    );

    // Create table rows
    sortedNeighborhoods.forEach((neighborhoodName) => {
        const data = window.compositeEfficiencyData[neighborhoodName];

        const row = document.createElement("tr");
        row.innerHTML = `
      <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">${neighborhoodName}</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center; font-weight: bold; color: ${data.color
            };">${data.value.toFixed(1)}%</td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <span style="
          background: ${data.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        ">${data.status}</span>
      </td>
      <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">
        <div style="
          width: 30px;
          height: 20px;
          background: ${data.color};
          border-radius: 4px;
          margin: 0 auto;
          border: 1px solid #ddd;
        "></div>
      </td>
    `;

        tableBody.appendChild(row);
    });

    console.log(
        "Populated composite results table with",
        sortedNeighborhoods.length,
        "neighborhoods"
    );
}

// Function to debug neighborhood data matching
function debugNeighborhoodDataMatching() {
    console.log("=== NEIGHBORHOOD DATA MATCHING DEBUG ===");

    // Check map data
    let mapNeighborhoods = [];
    if (typeof neighborhoodsData !== "undefined" && neighborhoodsData.features) {
        mapNeighborhoods = neighborhoodsData.features
            .map((feature) => {
                const props = feature.properties;
                return props.Names || props.Name_En || props.name || props.NAME;
            })
            .filter((name) => name);
        console.log("Map neighborhoods:", mapNeighborhoods);
    } else {
        console.log("No neighborhoodsData available");
    }

    // Check sectoral data
    if (window.sectoralFunctionalityData) {
        const dataNeighborhoods = Object.keys(window.sectoralFunctionalityData);
        console.log("Sectoral data neighborhoods:", dataNeighborhoods);

        // Check for matches
        const matches = [];
        const mismatches = [];

        mapNeighborhoods.forEach((mapName) => {
            const normalizedMapName = normalizeNeighborhoodName(mapName);
            let found = false;

            for (const dataName of dataNeighborhoods) {
                if (normalizeNeighborhoodName(dataName) === normalizedMapName) {
                    matches.push({ map: mapName, data: dataName });
                    found = true;
                    break;
                }
            }

            if (!found) {
                mismatches.push(mapName);
            }
        });

        console.log("Matches found:", matches);
        console.log("Mismatches:", mismatches);
    } else {
        console.log("No sectoralFunctionalityData available");
    }

    console.log("=== END DEBUG ===");
}
