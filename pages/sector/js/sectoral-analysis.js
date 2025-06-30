// Global variables for neighborhood coloring functionality
let currentColoredColumn = null;
let originalNeighborhoodStyle = null;

// Function to show composite coloring using sectoral grid interface
function showCompositeColoringWithSectoralGrid() {
    console.log("Showing composite coloring with sectoral grid interface...");

    // First, try to populate sectoral functionality data
    populateSectoralFunctionalityTable();

    // Wait a bit for data to be populated
    setTimeout(() => {
        if (
            window.sectoralFunctionalityData &&
            Object.keys(window.sectoralFunctionalityData).length > 0
        ) {
            // Calculate composite efficiency
            calculateCompositeEfficiencyFromSectoralData();

            // Show the sectoral mapping grid with composite coloring option
            const grid = document.getElementById("sectoralMappingGrid");
            if (grid) {
                // Clear existing content
                grid.innerHTML = "";

                // Create a simple composite interface directly
                createSimpleCompositeInterface(grid);

                // Show notification about the interface
                showNotification(
                    "تم إنشاء واجهة التلوين المركب. يمكنك الآن تطبيق التلوين على الخريطة.",
                    "info"
                );
            }
        } else {
            // Show the regular sectoral mapping grid as fallback
            populateSectoralMappingGrid();
            showNotification(
                "يرجى استخدام الأزرار أدناه لتطبيق التلوين القطاعي أولاً",
                "info"
            );
        }
    }, 1000);
}

// Function to create simple composite interface
function createSimpleCompositeInterface(grid) {
    console.log("Creating simple composite interface...");

    // Set grid style
    grid.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  `;

    // Create main composite card with mini map
    const compositeCard = document.createElement("div");
    compositeCard.style.cssText = `
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(220,53,69,0.3);
    text-align: center;
  `;

    compositeCard.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; font-size: 24px;">الفعالية العمرانية المركبة</h3>
      <p style="margin: 0; opacity: 0.9;">تلوين شامل بتدريجات اللون الأحمر</p>
    </div>

    <div id="simpleMiniMapContainer" style="
      background: white;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 20px;
      color: #333;
    ">
      <h4 style="margin: 0 0 10px 0;">معاينة الخريطة</h4>
      <div id="simpleMiniMap" style="
        height: 300px;
        background: #f8f9fa;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        position: relative;
      ">
        <div>
          <i class="fas fa-map-marked-alt" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
          <div>جاري تحميل الخريطة المصغرة...</div>
          <button onclick="loadSimpleMiniMap()" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            margin-top: 10px;
            cursor: pointer;
          ">
            تحميل الخريطة
          </button>
        </div>
      </div>
    </div>

    <button onclick="tryApplyCompositeColoring()" style="
      background: white;
      color: #dc3545;
      border: none;
      padding: 15px 40px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    ">
      <i class="fas fa-paint-brush"></i> تطبيق التلوين على الخريطة الرئيسية
    </button>
  `;

    grid.appendChild(compositeCard);

    // Try to load the mini map automatically
    setTimeout(() => {
        loadSimpleMiniMap();
    }, 1000);
}

// Function to load simple mini map
function loadSimpleMiniMap() {
    console.log("Loading simple mini map...");

    const miniMapContainer = document.getElementById("simpleMiniMap");
    if (!miniMapContainer) {
        console.error("Simple mini map container not found");
        return;
    }

    // Clear the container
    miniMapContainer.innerHTML = "";

    // Check if we have neighborhoods data
    if (typeof neighborhoodsData === "undefined" || !neighborhoodsData.features) {
        miniMapContainer.innerHTML = `
      <div style="color: #dc3545;">
        <i class="fas fa-exclamation-triangle"></i><br>
        بيانات الأحياء غير متوفرة
      </div>
    `;
        return;
    }

    // Ensure we have composite data
    if (
        !window.compositeEfficiencyData ||
        Object.keys(window.compositeEfficiencyData).length === 0
    ) {
        console.log("Calculating composite data...");
        if (
            window.sectoralFunctionalityData &&
            Object.keys(window.sectoralFunctionalityData).length > 0
        ) {
            calculateCompositeEfficiencyFromSectoralData();
        }
    }

    try {
        // Create mini map
        const miniMap = L.map(miniMapContainer, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
        });

        // Add base layer
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
            {
                attribution: "",
                subdomains: "abcd",
                maxZoom: 19,
            }
        ).addTo(miniMap);

        // Function to get red gradient color
        function getRedColor(value) {
            if (value >= 80) return "#8B0000";
            else if (value >= 65) return "#DC143C";
            else if (value >= 50) return "#FF6347";
            else if (value >= 30) return "#FFA07A";
            else return "#FFE4E1";
        }

        // Create neighborhoods layer
        const miniNeighborhoodsLayer = L.geoJSON(neighborhoodsData, {
            style: function (feature) {
                const props = feature.properties;
                const neighborhoodName =
                    props.Names || props.Name_En || props.name || props.NAME;

                let fillColor = "#e9ecef";

                if (window.compositeEfficiencyData && neighborhoodName) {
                    const dataNames = Object.keys(window.compositeEfficiencyData);
                    const matchingDataName = findMatchingNeighborhoodName(
                        neighborhoodName,
                        dataNames
                    );

                    if (
                        matchingDataName &&
                        window.compositeEfficiencyData[matchingDataName]
                    ) {
                        const compositeValue =
                            window.compositeEfficiencyData[matchingDataName].value;
                        fillColor = getRedColor(compositeValue);
                    }
                }

                return {
                    fillColor: fillColor,
                    weight: 1,
                    opacity: 1,
                    color: "#ffffff",
                    fillOpacity: 0.8,
                };
            },
            onEachFeature: function (feature, layer) {
                const props = feature.properties;
                const neighborhoodName =
                    props.Names || props.Name_En || props.name || props.NAME;

                if (neighborhoodName && window.compositeEfficiencyData) {
                    const dataNames = Object.keys(window.compositeEfficiencyData);
                    const matchingDataName = findMatchingNeighborhoodName(
                        neighborhoodName,
                        dataNames
                    );

                    if (
                        matchingDataName &&
                        window.compositeEfficiencyData[matchingDataName]
                    ) {
                        const compositeData =
                            window.compositeEfficiencyData[matchingDataName];

                        // Function to get status text based on value
                        function getStatusText(value) {
                            if (value >= 80) return "ممتاز";
                            else if (value >= 65) return "جيد";
                            else if (value >= 50) return "متوسط";
                            else if (value >= 30) return "ضعيف";
                            else return "سيء";
                        }

                        const popupContent = `
              <div style="text-align: center; padding: 10px; min-width: 200px;">
                <h5 style="margin: 0 0 10px 0; color: #333; font-size: 16px; border-bottom: 2px solid #dee2e6; padding-bottom: 8px;">
                  ${neighborhoodName}
                </h5>
                <div style="margin: 10px 0;">
                  <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: ${getRedColor(
                            compositeData.value
                        )};">
                    ${compositeData.value.toFixed(1)}%
                  </div>
                  <div style="
                    padding: 6px 12px;
                    background: ${getRedColor(compositeData.value)};
                    border-radius: 15px;
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                    display: inline-block;
                  ">
                    ${getStatusText(compositeData.value)}
                  </div>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #6c757d;">
                  الفعالية العمرانية المجردة                </div>
              </div>
            `;

                        layer.bindPopup(popupContent, {
                            maxWidth: 250,
                            className: "mini-map-popup",
                        });

                        // Add hover effects
                        layer.on("mouseover", function (e) {
                            this.setStyle({
                                weight: 3,
                                color: "#333",
                                fillOpacity: 0.9,
                            });
                        });

                        layer.on("mouseout", function (e) {
                            this.setStyle({
                                weight: 1,
                                color: "#ffffff",
                                fillOpacity: 0.8,
                            });
                        });
                    }
                }
            },
        });

        miniNeighborhoodsLayer.addTo(miniMap);

        // Fit bounds
        if (miniNeighborhoodsLayer.getBounds().isValid()) {
            miniMap.fitBounds(miniNeighborhoodsLayer.getBounds(), {
                padding: [10, 10],
            });
        }

        // Add legend for red gradient colors
        const legendContainer = document.createElement("div");
        legendContainer.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(255,255,255,0.95);
      padding: 12px;
      border-radius: 8px;
      font-size: 11px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      border: 1px solid #dee2e6;
      z-index: 1000;
      min-width: 140px;
    `;

        legendContainer.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #333; text-align: center; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">
        مفتاح الألوان
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #8B0000; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">ممتاز (80%+)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #DC143C; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">جيد (65-79%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #FF6347; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">متوسط (50-64%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #FFA07A; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">ضعيف (30-49%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 16px; height: 12px; background: #FFE4E1; border-radius: 2px; border: 1px solid #ccc;"></div>
          <span style="font-size: 10px;">سيء (أقل من 30%)</span>
        </div>
      </div>
      <div style="margin-top: 6px; text-align: center; font-size: 9px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 4px;">
        اضغط على الأحياء للتفاصيل
      </div>
    `;

        miniMapContainer.appendChild(legendContainer);

        console.log("Simple mini map loaded successfully");
        showNotification("تم تحميل الخريطة المصغرة بنجاح!", "success");
    } catch (error) {
        console.error("Error creating mini map:", error);
        miniMapContainer.innerHTML = `
      <div style="color: #dc3545;">
        <i class="fas fa-exclamation-triangle"></i><br>
        خطأ في تحميل الخريطة<br>
        <button onclick="loadSimpleMiniMap()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          margin-top: 5px;
          cursor: pointer;
        ">
          إعادة المحاولة
        </button>
      </div>
    `;
    }
}

// Function to create composite coloring interface
function createCompositeColoringInterface(grid) {
    console.log("Creating composite coloring interface...");

    // Set grid style
    grid.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  `;

    // Create main composite coloring card
    const compositeCard = document.createElement("div");
    compositeCard.style.cssText = `
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(0,123,255,0.3);
    text-align: center;
    position: relative;
    overflow: hidden;
  `;

    compositeCard.innerHTML = `
    <div style="position: relative; z-index: 2;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
        <div style="
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">
          <i class="fas fa-layer-group"></i>
        </div>
        <div>
          <h3 style="margin: 0; font-size: 24px; font-weight: bold;">الفعالية العمرانية المركبة</h3>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">تلوين شامل يجمع جميع القطاعات</p>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">
          يتم حساب الفعالية المركبة من خلال دمج جميع القطاعات الـ13 بأوزان متساوية لإعطاء تقييم شامل لكل حي
        </p>
      </div>

      <!-- Mini Map Container -->
      <div id="compositeMiniMapContainer" style="
        background: white;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      ">
        <div style="text-align: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #333; font-size: 16px;">معاينة التلوين المركب</h4>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">خريطة مصغرة بتدريجات اللون الأحمر</p>
          <button onclick="createCompositeMiniMap()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            cursor: pointer;
            margin-top: 5px;
          ">
            <i class="fas fa-redo"></i> إعادة تحميل الخريطة
          </button>
        </div>
        <div id="compositeMiniMap" style="
          height: 200px;
          border-radius: 8px;
          border: 2px solid #dee2e6;
          position: relative;
          overflow: hidden;
        "></div>
      </div>

      <button onclick="tryApplyCompositeColoring()" style="
        background: white;
        color: #007bff;
        border: none;
        padding: 15px 40px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-paint-brush"></i> تطبيق التلوين على الخريطة الرئيسية
      </button>
    </div>

    <div style="
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    "></div>
  `;

    grid.appendChild(compositeCard);

    // Create the mini map after adding the card to DOM
    setTimeout(() => {
        createCompositeMiniMap();
    }, 500);

    // Create sectoral options grid
    const sectoralGrid = document.createElement("div");
    sectoralGrid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  `;

    // Add a separator
    const separator = document.createElement("div");
    separator.style.cssText = `
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #dee2e6 50%, transparent 100%);
    margin: 20px 0;
  `;
    grid.appendChild(separator);

    // Add title for sectoral options
    const sectoralTitle = document.createElement("div");
    sectoralTitle.style.cssText = `
    text-align: center;
    margin-bottom: 20px;
  `;
    sectoralTitle.innerHTML = `
    <h4 style="margin: 0; color: #495057; font-size: 18px;">
      <i class="fas fa-th-large"></i> أو اختر تلوين قطاعي محدد
    </h4>
    <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
      يمكنك تطبيق التلوين لقطاع واحد فقط
    </p>
  `;
    grid.appendChild(sectoralTitle);

    // Add sectoral options (create them manually instead of using populateSectoralMappingGrid)
    createSectoralOptionsForComposite(grid);
}

// Function to create sectoral options for composite interface
function createSectoralOptionsForComposite(parentGrid) {
    console.log("Creating sectoral options for composite interface...");

    // Create a container for sectoral options
    const sectoralContainer = document.createElement("div");
    sectoralContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  `;

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
        {
            name: "التدخلات الإنسانية",
            icon: "fas fa-hands-helping",
            description: "تقييم التدخلات الإنسانية والمساعدات",
        },
        {
            name: "الأسواق الأساسية",
            icon: "fas fa-store",
            description: "حالة الأسواق والمحلات التجارية",
        },
        {
            name: "إدارة النفايات الصلبة",
            icon: "fas fa-trash",
            description: "نظافة الحي وإدارة النفايات",
        },
        {
            name: "شبكة الكهرباء",
            icon: "fas fa-bolt",
            description: "شبكة الكهرباء والتغذية",
        },
        {
            name: "شبكة الاتصالات",
            icon: "fas fa-wifi",
            description: "شبكات الاتصالات والإنترنت",
        },
        {
            name: "إمدادات المياه",
            icon: "fas fa-tint",
            description: "شبكة المياه والتوزيع",
        },
        {
            name: "شبكة الصرف الصحي",
            icon: "fas fa-water",
            description: "شبكة الصرف الصحي",
        },
        {
            name: "أضرار الإسكان",
            icon: "fas fa-home",
            description: "حالة المباني والإسكان",
        },
        {
            name: "النسيج الحضري",
            icon: "fas fa-city",
            description: "التخطيط العمراني والنسيج",
        },
        {
            name: "التغيرات السكانية",
            icon: "fas fa-users",
            description: "التغيرات في عدد السكان",
        },
    ];

    // Create cards for each sector
    sectoralColumns.forEach((sector) => {
        const card = document.createElement("div");
        card.className = "sectoral-mapping-card";
        card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;

        card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${sector.name}</h4>
          <p style="margin: 0; color: #6c757d; font-size: 12px;">${sector.description}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: center;">
        <button onclick="applySectoralColoring('${sector.name}')" style="
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        ">
          <i class="fas fa-paint-brush"></i> تطبيق التلوين
        </button>
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

        sectoralContainer.appendChild(card);
    });

    parentGrid.appendChild(sectoralContainer);
    console.log("Sectoral options created for composite interface");
}

// Function to create composite mini map with red gradient
function createCompositeMiniMap() {
    console.log("Creating composite mini map...");

    const miniMapContainer = document.getElementById("compositeMiniMap");
    if (!miniMapContainer) {
        console.warn("Mini map container not found, retrying...");
        // Try again after a longer delay
        setTimeout(() => {
            const retryContainer = document.getElementById("compositeMiniMap");
            if (retryContainer) {
                console.log("Found mini map container on retry");
                createCompositeMiniMapInternal(retryContainer);
            } else {
                console.error("Mini map container still not found after retry");
            }
        }, 1000);
        return;
    }

    createCompositeMiniMapInternal(miniMapContainer);
}

// Internal function to create the mini map
function createCompositeMiniMapInternal(miniMapContainer) {
    console.log("Creating composite mini map internal...");

    // Clear any existing content
    miniMapContainer.innerHTML = "";

    // Check if we have neighborhoods data
    if (typeof neighborhoodsData === "undefined" || !neighborhoodsData.features) {
        miniMapContainer.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #6c757d;
        font-size: 14px;
      ">
        <i class="fas fa-map-marked-alt" style="margin-right: 8px;"></i>
        جاري تحميل بيانات الخريطة...
      </div>
    `;
        return;
    }

    // Ensure we have composite data
    if (
        !window.compositeEfficiencyData ||
        Object.keys(window.compositeEfficiencyData).length === 0
    ) {
        console.log("No composite data available, calculating...");
        if (
            window.sectoralFunctionalityData &&
            Object.keys(window.sectoralFunctionalityData).length > 0
        ) {
            calculateCompositeEfficiencyFromSectoralData();
        }
    }

    // Create mini map
    const miniMap = L.map(miniMapContainer, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
    });

    // Add base layer (simple gray background)
    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        {
            attribution: "",
            subdomains: "abcd",
            maxZoom: 19,
        }
    ).addTo(miniMap);

    // Function to get red gradient color based on composite value
    function getRedGradientColor(value) {
        if (value >= 80) {
            return "#8B0000"; // Dark red - excellent
        } else if (value >= 65) {
            return "#DC143C"; // Crimson - good
        } else if (value >= 50) {
            return "#FF6347"; // Tomato - average
        } else if (value >= 30) {
            return "#FFA07A"; // Light salmon - poor
        } else {
            return "#FFE4E1"; // Misty rose - very poor
        }
    }

    // Create neighborhoods layer with composite coloring
    const miniNeighborhoodsLayer = L.geoJSON(neighborhoodsData, {
        style: function (feature) {
            const props = feature.properties;
            const neighborhoodName =
                props.Names || props.Name_En || props.name || props.NAME;

            let fillColor = "#e9ecef"; // Default gray
            let fillOpacity = 0.7;

            // Try to find composite data for this neighborhood
            if (window.compositeEfficiencyData && neighborhoodName) {
                const dataNames = Object.keys(window.compositeEfficiencyData);
                const matchingDataName = findMatchingNeighborhoodName(
                    neighborhoodName,
                    dataNames
                );

                if (
                    matchingDataName &&
                    window.compositeEfficiencyData[matchingDataName]
                ) {
                    const compositeValue =
                        window.compositeEfficiencyData[matchingDataName].value;
                    fillColor = getRedGradientColor(compositeValue);
                    fillOpacity = 0.8;
                }
            }

            return {
                fillColor: fillColor,
                weight: 1,
                opacity: 1,
                color: "#ffffff",
                fillOpacity: fillOpacity,
            };
        },
        onEachFeature: function (feature, layer) {
            const props = feature.properties;
            const neighborhoodName =
                props.Names || props.Name_En || props.name || props.NAME;

            if (neighborhoodName && window.compositeEfficiencyData) {
                const dataNames = Object.keys(window.compositeEfficiencyData);
                const matchingDataName = findMatchingNeighborhoodName(
                    neighborhoodName,
                    dataNames
                );

                if (
                    matchingDataName &&
                    window.compositeEfficiencyData[matchingDataName]
                ) {
                    const compositeData =
                        window.compositeEfficiencyData[matchingDataName];

                    const popupContent = `
            <div style="text-align: center; padding: 8px;">
              <h5 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${neighborhoodName}</h5>
              <div style="font-size: 16px; font-weight: bold; margin: 8px 0; color: #333;">
                ${compositeData.value.toFixed(1)}%
              </div>
              <div style="padding: 4px 8px; background: ${getRedGradientColor(
                        compositeData.value
                    )}; border-radius: 10px; color: white; font-size: 11px;">
                ${compositeData.status}
              </div>
            </div>
          `;

                    layer.bindPopup(popupContent);
                }
            }
        },
    });

    miniNeighborhoodsLayer.addTo(miniMap);

    // Fit bounds to show all neighborhoods
    if (miniNeighborhoodsLayer.getBounds().isValid()) {
        miniMap.fitBounds(miniNeighborhoodsLayer.getBounds(), {
            padding: [5, 5],
        });
    }

    // Add red gradient legend
    const legendContainer = document.createElement("div");
    legendContainer.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(255,255,255,0.9);
    padding: 8px;
    border-radius: 6px;
    font-size: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
  `;

    legendContainer.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px; color: #333;">الفعالية المركبة</div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #8B0000; border-radius: 2px;"></div>
      <span>ممتاز (80%+)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #DC143C; border-radius: 2px;"></div>
      <span>جيد (65-79%)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #FF6347; border-radius: 2px;"></div>
      <span>متوسط (50-64%)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
      <div style="width: 12px; height: 12px; background: #FFA07A; border-radius: 2px;"></div>
      <span>ضعيف (30-49%)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 4px;">
      <div style="width: 12px; height: 12px; background: #FFE4E1; border-radius: 2px;"></div>
      <span>سيء (أقل من 30%)</span>
    </div>
  `;

    miniMapContainer.appendChild(legendContainer);

    console.log("Composite mini map created successfully");
}

// Test function to create mini map
function testCreateMiniMap() {
    console.log("Test: Creating mini map...");

    // First, let's create a simple div to test
    const testContainer = document.createElement("div");
    testContainer.id = "testMiniMap";
    testContainer.style.cssText = `
    height: 200px;
    background: #f8f9fa;
    border: 2px solid #007bff;
    border-radius: 8px;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #007bff;
    font-weight: bold;
  `;
    testContainer.innerHTML = "خريطة مصغرة اختبارية - تم الإنشاء بنجاح!";

    // Find the grid and add the test container
    const grid = document.getElementById("sectoralMappingGrid");
    if (grid) {
        grid.appendChild(testContainer);
        showNotification("تم إنشاء خريطة اختبارية بنجاح!", "success");
    } else {
        console.error("Grid not found");
        showNotification("لم يتم العثور على الشبكة", "error");
    }
}

// Function to try applying composite coloring with better error handling
function tryApplyCompositeColoring() {
    console.log("Trying to apply composite coloring...");

    // Check if we have the necessary data
    if (
        !window.compositeEfficiencyData ||
        Object.keys(window.compositeEfficiencyData).length === 0
    ) {
        showNotification("جاري حساب البيانات المركبة...", "info");

        // Try to calculate composite data
        if (
            window.sectoralFunctionalityData &&
            Object.keys(window.sectoralFunctionalityData).length > 0
        ) {
            calculateCompositeEfficiencyFromSectoralData();
        }

        // Wait and try again
        setTimeout(() => {
            if (
                window.compositeEfficiencyData &&
                Object.keys(window.compositeEfficiencyData).length > 0
            ) {
                applyCompositeColoringFromData();
            } else {
                showNotification(
                    "لم يتم العثور على بيانات كافية. يرجى المحاولة مرة أخرى.",
                    "warning"
                );
            }
        }, 500);
    } else {
        // We have composite data, try to apply it
        applyCompositeColoringFromData();
    }
}

// Function to apply composite coloring to neighborhoods
function applyCompositeColoring() {
    console.log("Applying composite coloring to neighborhoods...");

    // Debug current data state
    debugNeighborhoodDataMatching();

    // Check if composite data exists, if not try to calculate it from sectoral data
    if (
        !window.compositeEfficiencyData ||
        Object.keys(window.compositeEfficiencyData).length === 0
    ) {
        console.log(
            "No composite data found, trying to calculate from sectoral data..."
        );

        // Try to calculate composite efficiency from sectoral data
        if (
            window.sectoralFunctionalityData &&
            Object.keys(window.sectoralFunctionalityData).length > 0
        ) {
            console.log("Calculating composite efficiency from sectoral data...");
            calculateCompositeEfficiencyFromSectoralData();

            // Check again if we now have composite data
            if (
                !window.compositeEfficiencyData ||
                Object.keys(window.compositeEfficiencyData).length === 0
            ) {
                showNotification(
                    "فشل في حساب الفعالية المركبة من البيانات القطاعية",
                    "error"
                );
                return;
            }
        } else {
            // Instead of showing error, use the sectoral mapping grid interface
            console.log(
                "No sectoral data found, showing sectoral mapping interface..."
            );
            showCompositeColoringWithSectoralGrid();
            return;
        }
    }

    // Show the blue gradient legend
    const legend = document.getElementById("blueGradientLegend");
    if (legend) {
        legend.style.display = "block";
    }

    // Try to find neighborhoods layer
    let neighborhoodsLayer = findNeighborhoodsLayer();

    // If layer not found, try alternative approach using sectoral data
    if (!neighborhoodsLayer) {
        console.log(
            "Neighborhoods layer not found, trying alternative approach..."
        );

        // Check if we have sectoral functionality data with neighborhood names
        if (
            window.sectoralFunctionalityData &&
            Object.keys(window.sectoralFunctionalityData).length > 0
        ) {
            console.log(
                "Using sectoral functionality data to apply composite coloring..."
            );
            applyCompositeColoringFromData();
            return;
        }

        // Last resort: wait and try again
        setTimeout(() => {
            neighborhoodsLayer = findNeighborhoodsLayer();
            if (neighborhoodsLayer) {
                applyCompositeColoringToLayer(neighborhoodsLayer);
            } else {
                console.warn("Neighborhoods layer still not found after retry");
                showNotification(
                    "لم يتم العثور على طبقة الأحياء. تأكد من تحميل الخريطة بالكامل.",
                    "warning"
                );
            }
        }, 1000);
        return;
    }

    applyCompositeColoringToLayer(neighborhoodsLayer);
}

// Function to calculate composite efficiency from sectoral data
function calculateCompositeEfficiencyFromSectoralData() {
    console.log("Calculating composite efficiency from sectoral data...");

    if (!window.sectoralFunctionalityData) {
        console.warn("No sectoral functionality data available");
        return;
    }

    // Initialize composite efficiency data
    window.compositeEfficiencyData = {};

    // Default weights (equal weights for all sectors - 10 columns)
    const defaultWeights = {
        "التدخلات الإنسانية": 10,
        "الأسواق الأساسية": 10,
        "إدارة النفايات الصلبة": 10,
        "شبكة الكهرباء": 10,
        "شبكة الاتصالات": 10,
        "إمدادات المياه": 10,
        "شبكة الصرف الصحي": 10,
        "أضرار الإسكان": 10,
        "النسيج الحضري": 10,
        "التغيرات السكانية": 10,
    };

    // Calculate composite efficiency for each neighborhood
    Object.keys(window.sectoralFunctionalityData).forEach((neighborhoodName) => {
        const neighborhoodData = window.sectoralFunctionalityData[neighborhoodName];
        let totalWeightedValue = 0;
        let totalWeight = 0;

        // Calculate weighted average
        Object.keys(defaultWeights).forEach((sectorName) => {
            if (neighborhoodData[sectorName]) {
                const sectorValue = neighborhoodData[sectorName].percentage || 0;
                const weight = defaultWeights[sectorName];
                totalWeightedValue += sectorValue * weight;
                totalWeight += weight;
            }
        });

        // Calculate final composite value
        const compositeValue =
            totalWeight > 0 ? totalWeightedValue / totalWeight : 0;

        // Determine status and color based on composite value (using red gradient)
        let status, color;
        if (compositeValue >= 80) {
            status = "ممتاز";
            color = "#8B0000"; // Dark red
        } else if (compositeValue >= 65) {
            status = "جيد";
            color = "#DC143C"; // Crimson
        } else if (compositeValue >= 50) {
            status = "متوسط";
            color = "#FF6347"; // Tomato
        } else if (compositeValue >= 30) {
            status = "ضعيف";
            color = "#FFA07A"; // Light salmon
        } else {
            status = "سيء";
            color = "#FFE4E1"; // Misty rose
        }

        window.compositeEfficiencyData[neighborhoodName] = {
            value: compositeValue,
            status: status,
            color: color,
        };
    });

    console.log(
        "Composite efficiency calculated for",
        Object.keys(window.compositeEfficiencyData).length,
        "neighborhoods"
    );
}

// Function to normalize neighborhood names for better matching
function normalizeNeighborhoodName(name) {
    if (!name) return "";
    return name
        .toString()
        .trim()
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/[أإآ]/g, "ا") // Normalize Arabic alif
        .replace(/[ىي]/g, "ي") // Normalize Arabic yaa
        .replace(/ة/g, "ه") // Normalize Arabic taa marbouta
        .replace(/[()]/g, "") // Remove parentheses
        .replace(/\d+/g, "") // Remove numbers
        .replace(/وتوابعها?/g, "") // Remove "وتوابعها" or "وتوابعه"
        .replace(/حي\s*/g, "") // Remove "حي" prefix
        .replace(/\s+/g, " ") // Clean up spaces again
        .trim()
        .toLowerCase();
}

// Function to find matching neighborhood name
function findMatchingNeighborhoodName(mapName, dataNames) {
    const normalizedMapName = normalizeNeighborhoodName(mapName);

    // Try exact match first
    for (const dataName of dataNames) {
        if (normalizeNeighborhoodName(dataName) === normalizedMapName) {
            return dataName;
        }
    }

    // Try partial match (both directions)
    for (const dataName of dataNames) {
        const normalizedDataName = normalizeNeighborhoodName(dataName);
        if (
            normalizedMapName.includes(normalizedDataName) ||
            normalizedDataName.includes(normalizedMapName)
        ) {
            return dataName;
        }
    }

    // Try word-based matching (split by spaces and check if any words match)
    const mapWords = normalizedMapName
        .split(" ")
        .filter((word) => word.length > 2);
    for (const dataName of dataNames) {
        const normalizedDataName = normalizeNeighborhoodName(dataName);
        const dataWords = normalizedDataName
            .split(" ")
            .filter((word) => word.length > 2);

        // Check if any significant words match
        for (const mapWord of mapWords) {
            for (const dataWord of dataWords) {
                if (
                    mapWord === dataWord ||
                    mapWord.includes(dataWord) ||
                    dataWord.includes(mapWord)
                ) {
                    return dataName;
                }
            }
        }
    }

    return null;
}

// Function to apply composite coloring using alternative data approach
function applyCompositeColoringFromData() {
    console.log("Applying composite coloring from sectoral data...");

    let processedCount = 0;
    const neighborhoodNames = Object.keys(window.sectoralFunctionalityData);
    console.log("Available neighborhood names in data:", neighborhoodNames);

    // Create a visual representation using the existing table or create markers
    if (neighborhoodNames.length > 0) {
        // Try to find any GeoJSON features that match our neighborhood names
        let foundAnyLayer = false;
        let mapNeighborhoods = [];

        if (window.map) {
            window.map.eachLayer(function (layer) {
                if (
                    layer instanceof L.GeoJSON &&
                    typeof layer.eachLayer === "function"
                ) {
                    layer.eachLayer(function (subLayer) {
                        if (subLayer.feature && subLayer.feature.properties) {
                            const props = subLayer.feature.properties;
                            const mapNeighborhoodName =
                                props.Names || props.Name_En || props.name || props.NAME;

                            if (mapNeighborhoodName) {
                                mapNeighborhoods.push(mapNeighborhoodName);

                                // Try to find a matching neighborhood in our data
                                const matchingDataName = findMatchingNeighborhoodName(
                                    mapNeighborhoodName,
                                    neighborhoodNames
                                );

                                if (
                                    matchingDataName &&
                                    window.compositeEfficiencyData[matchingDataName]
                                ) {
                                    const compositeData =
                                        window.compositeEfficiencyData[matchingDataName];
                                    console.log(
                                        `Matched: "${mapNeighborhoodName}" -> "${matchingDataName}"`
                                    );

                                    if (typeof subLayer.setStyle === "function") {
                                        subLayer.setStyle({
                                            fillColor: compositeData.color,
                                            fillOpacity: 0.8,
                                            color: "#ffffff",
                                            weight: 2,
                                            opacity: 1,
                                        });

                                        // Add popup with composite efficiency information
                                        const popupContent = `
                      <div style="text-align: center; padding: 10px;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">${mapNeighborhoodName}</h4>
                        <div style="margin-bottom: 10px;">
                          <strong style="color: #007bff;">الفعالية العمرانية المركبة</strong>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                          <div style="width: 20px; height: 20px; background: ${compositeData.color
                                            }; border-radius: 4px; border: 1px solid #ddd;"></div>
                          <span style="font-size: 18px; font-weight: bold; color: ${compositeData.color
                                            };">${compositeData.value.toFixed(1)}%</span>
                        </div>
                        <div style="padding: 5px 10px; background: ${compositeData.color
                                            }; border-radius: 15px; color: white; font-size: 12px;">
                          ${compositeData.status}
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; color: #6c757d;">
                          محسوبة من البيانات القطاعية (${matchingDataName})
                        </div>
                      </div>
                    `;

                                        if (typeof subLayer.bindPopup === "function") {
                                            subLayer.bindPopup(popupContent);
                                        }

                                        foundAnyLayer = true;
                                        processedCount++;
                                    }
                                } else {
                                    console.log(`No match found for: "${mapNeighborhoodName}"`);
                                }
                            }
                        }
                    });
                }
            });

            console.log("Available neighborhood names in map:", mapNeighborhoods);
        }

        if (foundAnyLayer && processedCount > 0) {
            currentColoredColumn = "الفعالية العمرانية المركبة";
            showNotification(
                `تم تطبيق تلوين الفعالية المركبة على ${processedCount} حي`,
                "success"
            );
        } else {
            console.log("No matches found. Data names:", neighborhoodNames);
            console.log("Map names:", mapNeighborhoods);

            // Instead of showing error, show the sectoral grid interface
            showCompositeColoringWithSectoralGrid();
            showNotification(
                "تم إنشاء واجهة التلوين البديلة. يمكنك استخدام الأزرار أدناه لتطبيق التلوين.",
                "info"
            );
        }
    } else {
        showNotification("لا توجد بيانات أحياء متاحة", "warning");
    }
}

function applyCompositeColoringToLayer(neighborhoodsLayer) {
    console.log("applyCompositeColoringToLayer called with:", neighborhoodsLayer);

    if (!neighborhoodsLayer) {
        console.warn("Neighborhoods layer is null or undefined");
        showNotification("لم يتم العثور على طبقة الأحياء", "warning");
        return;
    }

    // Check if it's a valid layer with eachLayer method
    if (typeof neighborhoodsLayer.eachLayer !== "function") {
        console.warn(
            "Invalid neighborhoods layer - no eachLayer method:",
            neighborhoodsLayer
        );
        showNotification("طبقة الأحياء غير صالحة", "warning");
        return;
    }

    let processedCount = 0;

    try {
        neighborhoodsLayer.eachLayer(function (layer) {
            if (!layer.feature || !layer.feature.properties) {
                return; // Skip layers without feature properties
            }

            const neighborhoodName =
                layer.feature.properties.Names ||
                layer.feature.properties.Name_En ||
                layer.feature.properties.name ||
                layer.feature.properties.NAME;

            if (neighborhoodName) {
                // Try to find a matching neighborhood in composite data
                const dataNames = Object.keys(window.compositeEfficiencyData);
                const matchingDataName = findMatchingNeighborhoodName(
                    neighborhoodName,
                    dataNames
                );

                if (
                    matchingDataName &&
                    window.compositeEfficiencyData[matchingDataName]
                ) {
                    const compositeData =
                        window.compositeEfficiencyData[matchingDataName];
                    console.log(
                        `Matched: "${neighborhoodName}" -> "${matchingDataName}"`
                    );

                    // Check if layer has setStyle method
                    if (typeof layer.setStyle === "function") {
                        layer.setStyle({
                            fillColor: compositeData.color,
                            fillOpacity: 0.8,
                            color: "#ffffff",
                            weight: 2,
                            opacity: 1,
                        });

                        // Update popup content to show composite efficiency information
                        const popupContent = `
            <div style="text-align: center; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">${neighborhoodName}</h4>
              <div style="margin-bottom: 10px;">
                <strong style="color: #007bff;">الفعالية العمرانية المركبة</strong>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: 20px; height: 20px; background: ${compositeData.color
                            }; border-radius: 4px; border: 1px solid #ddd;"></div>
                <span style="font-size: 18px; font-weight: bold; color: ${compositeData.color
                            };">${compositeData.value.toFixed(1)}%</span>
              </div>
              <div style="padding: 5px 10px; background: ${compositeData.color
                            }; border-radius: 15px; color: white; font-size: 12px;">
                ${compositeData.status}
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: #6c757d;">
                محسوبة وفق الأوزان المحددة للقطاعات الـ13
              </div>
            </div>
          `;

                        // Check if layer has bindPopup method
                        if (typeof layer.bindPopup === "function") {
                            layer.bindPopup(popupContent);
                        }

                        processedCount++;
                    }
                } else {
                    console.log(`No match found for: "${neighborhoodName}"`);
                }
            }
        });

        if (processedCount > 0) {
            // Update current colored column
            currentColoredColumn = "الفعالية العمرانية المركبة";

            // Show success message
            showNotification(
                `تم تطبيق تلوين الفعالية المركبة على ${processedCount} حي`,
                "success"
            );
        } else {
            // Instead of showing error, show the sectoral grid interface
            showCompositeColoringWithSectoralGrid();
            showNotification(
                "تم إنشاء واجهة التلوين البديلة. يمكنك استخدام الأزرار أدناه لتطبيق التلوين.",
                "info"
            );
        }
    } catch (error) {
        console.error("Error in applyCompositeColoring:", error);
        showNotification("حدث خطأ أثناء تطبيق التلوين", "error");
    }
}

// Function to generate random sectoral functionality for a specific sector
function generateRandomSectoralFunctionality(sectorName) {
    let percentage = 0;
    let status = "ضعيف";

    // Generate different random ranges for different sectors to make it more realistic
    switch (sectorName) {
        case "التدخلات الإنسانية":
            // Humanitarian interventions tend to be moderate to good
            percentage = Math.floor(Math.random() * 60) + 40; // 40-100%
            break;

        case "الأسواق الأساسية":
            // Markets can vary widely
            percentage = Math.floor(Math.random() * 80) + 20; // 20-100%
            break;

        case "إدارة النفايات الصلبة":
            // Waste management often has issues
            percentage = Math.floor(Math.random() * 70) + 10; // 10-80%
            break;

        case "شبكة الكهرباء":
            // Electricity can be problematic
            percentage = Math.floor(Math.random() * 80) + 15; // 15-95%
            break;

        case "شبكة الاتصالات":
            // Communications generally better
            percentage = Math.floor(Math.random() * 40) + 60; // 60-100%
            break;

        case "إمدادات المياه":
            // Water supply varies significantly
            percentage = Math.floor(Math.random() * 70) + 25; // 25-95%
            break;

        case "شبكة الصرف الصحي":
            // Sewage often problematic
            percentage = Math.floor(Math.random() * 65) + 15; // 15-80%
            break;

        case "أضرار الإسكان":
            // Housing damage varies (higher percentage = less damage = better)
            percentage = Math.floor(Math.random() * 80) + 20; // 20-100%
            break;

        case "النسيج الحضري":
            // Urban fabric varies
            percentage = Math.floor(Math.random() * 70) + 30; // 30-100%
            break;

        case "التغيرات السكانية":
            // Population changes vary
            percentage = Math.floor(Math.random() * 60) + 35; // 35-95%
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
}

// Function to show sectoral mapping interface
function showSectoralMappingInterface() {
    const fullscreenPopup = document.getElementById("fullscreen-popup");
    const popupContentContainer = document.getElementById(
        "popup-content-container"
    );
    const sectoralFunctionalityContainer = document.getElementById(
        "sectoral-functionality-container"
    );
    const sectoralMappingContainer = document.getElementById(
        "sectoral-mapping-container"
    );
    const popupLoading = document.getElementById("popup-loading");

    if (fullscreenPopup && sectoralMappingContainer) {
        // Hide loading indicator
        if (popupLoading) popupLoading.style.display = "none";

        // Hide other containers and show sectoral mapping container
        if (popupContentContainer) popupContentContainer.style.display = "none";
        if (sectoralFunctionalityContainer)
            sectoralFunctionalityContainer.style.display = "none";
        sectoralMappingContainer.style.display = "flex";

        // Show the main fullscreen popup if it's hidden
        if (!fullscreenPopup.classList.contains("show")) {
            fullscreenPopup.style.display = "flex";
            fullscreenPopup.offsetHeight;
            fullscreenPopup.classList.add("show");
            document.body.style.overflow = "hidden";
        }

        // Check if sectoral functionality data exists
        if (
            !window.sectoralFunctionalityData ||
            Object.keys(window.sectoralFunctionalityData).length === 0
        ) {
            alert("يرجى تحديث الفعالية القطاعية أولاً من خلال الزر الأخضر");
            return;
        }

        // Show the blue gradient legend
        const legend = document.getElementById("blueGradientLegend");
        if (legend) {
            legend.style.display = "block";
        }

        // Show sectoral maps directly
        const grid = document.getElementById("sectoralMappingGrid");
        if (grid) {
            grid.innerHTML =
                '<div id="sectoralMapsContainer" style="width: 100%;"></div>';
            createSectoralMapsGrid();
        }
    }
}

// Function to populate sectoral mapping grid
function populateSectoralMappingGrid() {
    const grid = document.getElementById("sectoralMappingGrid");
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = "";

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
        {
            name: "التدخلات الإنسانية",
            icon: "fas fa-hands-helping",
            description: "تقييم التدخلات الإنسانية والمساعدات",
        },
        {
            name: "الأسواق الأساسية",
            icon: "fas fa-store",
            description: "حالة الأسواق والمحلات التجارية",
        },
        {
            name: "إدارة النفايات الصلبة",
            icon: "fas fa-trash",
            description: "نظافة الحي وإدارة النفايات",
        },
        {
            name: "شبكة الكهرباء",
            icon: "fas fa-bolt",
            description: "شبكة الكهرباء والتغذية",
        },
        {
            name: "شبكة الاتصالات",
            icon: "fas fa-wifi",
            description: "شبكات الاتصالات والإنترنت",
        },
        {
            name: "إمدادات المياه",
            icon: "fas fa-tint",
            description: "شبكة المياه والتوزيع",
        },
        {
            name: "شبكة الصرف الصحي",
            icon: "fas fa-water",
            description: "شبكة الصرف الصحي",
        },
        {
            name: "أضرار الإسكان",
            icon: "fas fa-home",
            description: "حالة المباني والإسكان",
        },
        {
            name: "النسيج الحضري",
            icon: "fas fa-city",
            description: "التخطيط العمراني والنسيج",
        },
        {
            name: "التغيرات السكانية",
            icon: "fas fa-users",
            description: "التغيرات في عدد السكان",
        },
    ];

    // Create cards for each sector
    sectoralColumns.forEach((sector) => {
        const card = document.createElement("div");
        card.className = "sectoral-mapping-card";
        card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;

        card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${sector.name
            }</h4>
          <p style="margin: 0; color: #6c757d; font-size: 12px;">${sector.description
            }</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <button onclick="applySectoralColoring('${sector.name}')" style="
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          margin-right: 10px;
        ">
          <i class="fas fa-paint-brush"></i> تطبيق التلوين
        </button>

        <button onclick="showSectorPreview('${sector.name}')" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          <i class="fas fa-eye"></i> معاينة
        </button>
      </div>

      <div class="sector-preview" style="
        margin-top: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        display: none;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #495057;">معاينة التوزيع:</span>
          <span id="preview-${sector.name.replace(
                /\s+/g,
                "-"
            )}" style="font-size: 12px; color: #007bff;"></span>
        </div>
        <div style="display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="flex: 1; background: #0d47a1;" title="ممتاز"></div>
          <div style="flex: 1; background: #1976d2;" title="جيد"></div>
          <div style="flex: 1; background: #42a5f5;" title="متوسط"></div>
          <div style="flex: 1; background: #90caf9;" title="ضعيف"></div>
          <div style="flex: 1; background: #e3f2fd;" title="سيء"></div>
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
        "Sectoral mapping grid populated with",
        sectoralColumns.length,
        "sectors"
    );
}

// Function to populate sectoral mapping grid with mini maps
function populateSectoralMappingGridWithMaps() {
    const grid = document.getElementById("sectoralMappingGrid");
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = "";

    // Sectoral functionality column names (10 columns after removing 3 deleted columns)
    const sectoralColumns = [
        {
            name: "التدخلات الإنسانية",
            icon: "fas fa-hands-helping",
            description: "تقييم التدخلات الإنسانية والمساعدات",
        },
        {
            name: "الأسواق الأساسية",
            icon: "fas fa-store",
            description: "حالة الأسواق والمحلات التجارية",
        },
        {
            name: "إدارة النفايات الصلبة",
            icon: "fas fa-trash",
            description: "نظافة الحي وإدارة النفايات",
        },
        {
            name: "شبكة الكهرباء",
            icon: "fas fa-bolt",
            description: "شبكة الكهرباء والتغذية",
        },
        {
            name: "شبكة الاتصالات",
            icon: "fas fa-wifi",
            description: "شبكات الاتصالات والإنترنت",
        },
        {
            name: "إمدادات المياه",
            icon: "fas fa-tint",
            description: "شبكة المياه والتوزيع",
        },
        {
            name: "شبكة الصرف الصحي",
            icon: "fas fa-water",
            description: "شبكة الصرف الصحي",
        },
        {
            name: "أضرار الإسكان",
            icon: "fas fa-home",
            description: "حالة المباني والإسكان",
        },
        {
            name: "النسيج الحضري",
            icon: "fas fa-city",
            description: "التخطيط العمراني والنسيج",
        },
        {
            name: "التغيرات السكانية",
            icon: "fas fa-users",
            description: "التغيرات في عدد السكان",
        },
    ];

    // Show the blue gradient legend
    const legend = document.getElementById("blueGradientLegend");
    if (legend) {
        legend.style.display = "block";
    }

    // Create cards for each sector with mini maps
    sectoralColumns.forEach((sector, index) => {
        const card = document.createElement("div");
        card.className = "sectoral-mapping-card-with-map";
        card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 300px;
    `;

        // Calculate statistics for this sector
        const stats = calculateSectorStatistics(sector.name);

        card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-shrink: 0;">
        <div style="
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          <i class="${sector.icon}"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
          <h5 style="margin: 0 0 3px 0; color: #333; font-size: 13px; font-weight: bold;">${sector.name}</h5>
          <p style="margin: 0; color: #6c757d; font-size: 10px; line-height: 1.2;">${sector.description}</p>
        </div>
      </div>

      <div style="
        flex: 1;
        border-radius: 8px;
        border: 1px solid #dee2e6;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <button onclick="applySectoralColoring('${sector.name}')" style="
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,123,255,0.3);
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fas fa-paint-brush"></i><br>
          تطبيق التلوين
        </button>
      </div>

      <div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-size: 11px; color: #495057; font-weight: bold;">إحصائيات التوزيع:</span>
          <span style="font-size: 11px; color: #007bff;">${stats.total} حي</span>
        </div>
        <div style="display: flex; gap: 1px; height: 6px; border-radius: 3px; overflow: hidden;">
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
            this.style.transform = "translateY(-3px)";
            this.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
        });

        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
            this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        });

        grid.appendChild(card);
    });

    console.log(
        "Sectoral mapping grid with mini maps populated with",
        sectoralColumns.length,
        "sectors"
    );
}

// Function to create mini map for a specific sector
function createMiniMapForSector(sectorName, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.log("Container not found:", containerId);
        return;
    }

    try {
        // Clear container first
        container.innerHTML = "";

        // Create mini map
        const miniMap = L.map(containerId, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false,
        });

        // Add base layer (simple OSM)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "",
            opacity: 0.3,
        }).addTo(miniMap);

        // Create neighborhoods layer for mini map
        if (
            typeof neighborhoodsData !== "undefined" &&
            window.sectoralFunctionalityData
        ) {
            const miniNeighborhoodsLayer = L.geoJSON(neighborhoodsData, {
                style: function (feature) {
                    const neighborhoodName =
                        feature.properties.Names ||
                        feature.properties.Name_En ||
                        feature.properties.name ||
                        feature.properties.NAME;

                    if (
                        neighborhoodName &&
                        window.sectoralFunctionalityData &&
                        window.sectoralFunctionalityData[neighborhoodName]
                    ) {
                        const sectorData =
                            window.sectoralFunctionalityData[neighborhoodName][sectorName];

                        if (sectorData && typeof sectorData.percentage !== "undefined") {
                            const color = getBlueGradientColor(sectorData.percentage);
                            return {
                                fillColor: color,
                                fillOpacity: 0.8,
                                color: "#ffffff",
                                weight: 1,
                                opacity: 1,
                            };
                        }
                    }

                    // Default style for neighborhoods without data
                    return {
                        fillColor: "#e9ecef",
                        fillOpacity: 0.5,
                        color: "#ffffff",
                        weight: 1,
                        opacity: 1,
                    };
                },
                onEachFeature: function (feature, layer) {
                    const neighborhoodName =
                        feature.properties.Names ||
                        feature.properties.Name_En ||
                        feature.properties.name ||
                        feature.properties.NAME;

                    if (
                        neighborhoodName &&
                        window.sectoralFunctionalityData[neighborhoodName]
                    ) {
                        const sectorData =
                            window.sectoralFunctionalityData[neighborhoodName][sectorName];

                        if (sectorData && typeof sectorData.percentage !== "undefined") {
                            const color = getBlueGradientColor(sectorData.percentage);

                            // Simple tooltip on hover
                            layer.bindTooltip(
                                `
                <div style="text-align: center; font-size: 11px;">
                  <strong>${neighborhoodName}</strong><br>
                  <span style="color: ${color};">${sectorData.percentage.toFixed(
                                    1
                                )}%</span><br>
                  <small>${sectorData.status}</small>
                </div>
              `,
                                {
                                    permanent: false,
                                    direction: "top",
                                    className: "mini-map-tooltip",
                                }
                            );
                        }
                    }
                },
            });

            miniNeighborhoodsLayer.addTo(miniMap);

            // Fit bounds to show all neighborhoods
            miniMap.fitBounds(miniNeighborhoodsLayer.getBounds(), {
                padding: [5, 5],
            });
        }

        // Add click handler to apply this sector's coloring to main map
        container.addEventListener("click", function () {
            applySectoralColoring(sectorName);
            showNotification(
                `تم تطبيق تلوين ${sectorName} على الخريطة الرئيسية`,
                "success"
            );
        });

        // Add cursor pointer to indicate clickability
        container.style.cursor = "pointer";

        // Add title attribute for accessibility
        container.title = `انقر لتطبيق تلوين ${sectorName} على الخريطة الرئيسية`;
    } catch (error) {
        console.error("Error creating mini map for sector:", sectorName, error);
        // Show error message in container
        container.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #6c757d;
        font-size: 12px;
        text-align: center;
      ">
        <div>
          <i class="fas fa-exclamation-triangle" style="font-size: 20px; margin-bottom: 5px;"></i><br>
          خطأ في تحميل الخريطة
        </div>
      </div>
    `;
    }
}

// Function to apply sectoral coloring to neighborhoods
function applySectoralColoring(sectorName) {
    console.log("Applying sectoral coloring for:", sectorName);

    // Check if sectoral functionality data exists
    if (
        !window.sectoralFunctionalityData ||
        Object.keys(window.sectoralFunctionalityData).length === 0
    ) {
        alert("يرجى حساب الفعالية القطاعية أولاً من خلال الجدول");
        return;
    }

    // Get the blue gradient legend
    const legend = document.getElementById("blueGradientLegend");
    if (legend) {
        legend.style.display = "block";
    }

    // Apply coloring to neighborhoods based on the selected sector
    if (window.neighborhoodsLayer) {
        window.neighborhoodsLayer.eachLayer(function (layer) {
            const neighborhoodName =
                layer.feature.properties.Names ||
                layer.feature.properties.Name_En ||
                layer.feature.properties.name ||
                layer.feature.properties.NAME;

            if (
                neighborhoodName &&
                window.sectoralFunctionalityData[neighborhoodName]
            ) {
                const sectorData =
                    window.sectoralFunctionalityData[neighborhoodName][sectorName];

                if (sectorData && typeof sectorData.percentage !== "undefined") {
                    const color = getBlueGradientColor(sectorData.percentage);

                    layer.setStyle({
                        fillColor: color,
                        fillOpacity: 0.8,
                        color: "#ffffff",
                        weight: 2,
                        opacity: 1,
                    });

                    // Update popup content to show sector-specific information
                    const popupContent = `
            <div style="text-align: center; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">${neighborhoodName}</h4>
              <div style="margin-bottom: 10px;">
                <strong style="color: #007bff;">${sectorName}</strong>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: 20px; height: 20px; background: ${color}; border-radius: 4px; border: 1px solid #ddd;"></div>
                <span style="font-size: 16px; font-weight: bold;">${sectorData.percentage.toFixed(
                        1
                    )}%</span>
              </div>
              <div style="padding: 5px 10px; background: ${getStatusBackgroundColor(
                        sectorData.status
                    )}; border-radius: 15px; color: white; font-size: 12px;">
                ${sectorData.status}
              </div>
            </div>
          `;

                    layer.bindPopup(popupContent);
                }
            }
        });
    }

    // Update current colored column
    currentColoredColumn = sectorName;

    // Show success message
    showNotification(`تم تطبيق تلوين ${sectorName} على الأحياء`, "success");
}

// Function to get blue gradient color based on percentage
function getBlueGradientColor(percentage) {
    if (percentage >= 80) {
        return "#0d47a1"; // Dark blue - Excellent
    } else if (percentage >= 65) {
        return "#1976d2"; // Medium dark blue - Good
    } else if (percentage >= 50) {
        return "#42a5f5"; // Medium blue - Average
    } else if (percentage >= 30) {
        return "#90caf9"; // Light blue - Poor
    } else {
        return "#e3f2fd"; // Very light blue - Bad
    }
}

// Function to get status background color
function getStatusBackgroundColor(status) {
    switch (status) {
        case "ممتاز":
            return "#0d47a1";
        case "جيد":
            return "#1976d2";
        case "متوسط":
            return "#42a5f5";
        case "ضعيف":
            return "#90caf9";
        case "سيء":
            return "#e3f2fd";
        default:
            return "#6c757d";
    }
}

// Function to show sector preview
function showSectorPreview(sectorName) {
    console.log("Showing preview for:", sectorName);

    // Find the preview element
    const previewId = `preview-${sectorName.replace(/\s+/g, "-")}`;
    const previewElement = document.getElementById(previewId);
    const previewContainer = previewElement?.closest(".sector-preview");

    if (previewContainer) {
        const isVisible = previewContainer.style.display !== "none";

        if (isVisible) {
            // Hide preview
            previewContainer.style.display = "none";
        } else {
            // Show preview and calculate statistics
            previewContainer.style.display = "block";

            if (
                window.sectoralFunctionalityData &&
                Object.keys(window.sectoralFunctionalityData).length > 0
            ) {
                const stats = calculateSectorStatistics(sectorName);
                if (previewElement) {
                    previewElement.textContent = `${stats.total} حي`;
                }
            } else {
                if (previewElement) {
                    previewElement.textContent = "لا توجد بيانات";
                }
            }
        }
    }
}

// Function to calculate sector statistics
function calculateSectorStatistics(sectorName) {
    let total = 0;
    let excellent = 0,
        good = 0,
        average = 0,
        poor = 0,
        bad = 0;

    if (window.sectoralFunctionalityData) {
        Object.keys(window.sectoralFunctionalityData).forEach(
            (neighborhoodName) => {
                const sectorData =
                    window.sectoralFunctionalityData[neighborhoodName][sectorName];
                if (sectorData && typeof sectorData.percentage !== "undefined") {
                    total++;
                    const percentage = sectorData.percentage;

                    if (percentage >= 80) excellent++;
                    else if (percentage >= 65) good++;
                    else if (percentage >= 50) average++;
                    else if (percentage >= 30) poor++;
                    else bad++;
                }
            }
        );
    }

    return { total, excellent, good, average, poor, bad };
}

// Function to find neighborhoods layer
function findNeighborhoodsLayer() {
    if (!window.map) {
        console.warn("Map not available");
        return null;
    }

    let foundLayer = null;

    // First try to find in global variables
    if (
        window.neighborhoodsLayer &&
        typeof window.neighborhoodsLayer.eachLayer === "function"
    ) {
        console.log("Found cached neighborhoods layer");
        return window.neighborhoodsLayer;
    }

    console.log("Searching for neighborhoods layer...");

    // Search through all map layers
    window.map.eachLayer(function (layer) {
        if (foundLayer) return; // Stop if already found

        // Check if it's a GeoJSON layer with neighborhood properties
        if (layer instanceof L.GeoJSON && typeof layer.eachLayer === "function") {
            let hasNeighborhoods = false;
            let neighborhoodCount = 0;

            try {
                layer.eachLayer(function (subLayer) {
                    if (subLayer.feature && subLayer.feature.properties) {
                        const props = subLayer.feature.properties;
                        if (props.Names || props.Name_En || props.name || props.NAME) {
                            hasNeighborhoods = true;
                            neighborhoodCount++;
                        }
                    }
                });

                if (hasNeighborhoods && neighborhoodCount > 0) {
                    console.log(
                        `Found neighborhoods layer with ${neighborhoodCount} neighborhoods`
                    );
                    foundLayer = layer;
                    window.neighborhoodsLayer = layer; // Cache for future use
                    return;
                }
            } catch (e) {
                console.warn("Error checking GeoJSON layer:", e);
            }
        }

        // Check if it's a layer group containing neighborhoods
        if (
            layer.eachLayer &&
            typeof layer.eachLayer === "function" &&
            !(layer instanceof L.GeoJSON)
        ) {
            try {
                layer.eachLayer(function (subLayer) {
                    if (foundLayer) return; // Stop if already found

                    if (
                        subLayer instanceof L.GeoJSON &&
                        typeof subLayer.eachLayer === "function"
                    ) {
                        let hasNeighborhoods = false;
                        let neighborhoodCount = 0;

                        try {
                            subLayer.eachLayer(function (geoLayer) {
                                if (geoLayer.feature && geoLayer.feature.properties) {
                                    const props = geoLayer.feature.properties;
                                    if (
                                        props.Names ||
                                        props.Name_En ||
                                        props.name ||
                                        props.NAME
                                    ) {
                                        hasNeighborhoods = true;
                                        neighborhoodCount++;
                                    }
                                }
                            });

                            if (hasNeighborhoods && neighborhoodCount > 0) {
                                console.log(
                                    `Found neighborhoods layer in group with ${neighborhoodCount} neighborhoods`
                                );
                                foundLayer = subLayer;
                                window.neighborhoodsLayer = subLayer; // Cache for future use
                                return;
                            }
                        } catch (e) {
                            console.warn("Error checking nested GeoJSON layer:", e);
                        }
                    }
                });
            } catch (e) {
                console.warn("Error checking layer group:", e);
            }
        }
    });

    if (!foundLayer) {
        console.warn("No neighborhoods layer found");
    }

    return foundLayer;
}

// Function to diagnose map layers (for debugging)
function diagnoseMapLayers() {
    if (!window.map) {
        console.log("Map not available");
        return;
    }

    console.log("=== MAP LAYERS DIAGNOSIS ===");
    let layerCount = 0;

    window.map.eachLayer(function (layer) {
        layerCount++;
        console.log(`Layer ${layerCount}:`, layer);
        console.log("  - Type:", layer.constructor.name);
        console.log("  - Has eachLayer:", typeof layer.eachLayer === "function");

        if (layer instanceof L.GeoJSON && typeof layer.eachLayer === "function") {
            let featureCount = 0;
            let sampleFeature = null;

            layer.eachLayer(function (subLayer) {
                featureCount++;
                if (!sampleFeature && subLayer.feature) {
                    sampleFeature = subLayer.feature;
                }
            });

            console.log(`  - GeoJSON with ${featureCount} features`);
            if (sampleFeature) {
                console.log(
                    "  - Sample feature properties:",
                    Object.keys(sampleFeature.properties || {})
                );
            }
        }

        if (
            layer.eachLayer &&
            typeof layer.eachLayer === "function" &&
            !(layer instanceof L.GeoJSON)
        ) {
            let subLayerCount = 0;
            layer.eachLayer(function (subLayer) {
                subLayerCount++;
                if (subLayer instanceof L.GeoJSON) {
                    console.log(`  - Contains GeoJSON sublayer ${subLayerCount}`);
                }
            });
            console.log(`  - Layer group with ${subLayerCount} sublayers`);
        }
    });

    console.log(`Total layers: ${layerCount}`);
    console.log("=== END DIAGNOSIS ===");
}

// Make functions available globally
window.diagnoseMapLayers = diagnoseMapLayers;
window.applyCompositeColoring = applyCompositeColoring;
window.calculateCompositeEfficiencyFromSectoralData =
    calculateCompositeEfficiencyFromSectoralData;

// Function to show notifications
function showNotification(message, type = "info") {
    // Create notification element if it doesn't exist
    let notification = document.getElementById("notification");
    if (!notification) {
        notification = document.createElement("div");
        notification.id = "notification";
        notification.style.cssText = `
      position: fixed;
      top: 15%;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
        document.body.appendChild(notification);
    }

    // Set background color based on type
    const colors = {
        success: "#28a745",
        error: "#dc3545",
        warning: "#ffc107",
        info: "#007bff",
    };

    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;

    // Show notification
    notification.style.transform = "translateX(0)";

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = "translateX(100%)";
    }, 3000);
}

// Neighborhood coloring functionality (moved to top of file to avoid redeclaration)
// These variables are declared at the global scope of this module

// Function to populate column dropdown for neighborhood coloring
function populateColumnDropdown() {
    const select = document.getElementById("colorByColumnSelect");
    if (!select) {
        console.error("colorByColumnSelect element not found");
        return;
    }

    // Clear existing options except the first one
    select.innerHTML = '<option value="">اختر عمود...</option>';

    // Get available columns from neighborhood data
    if (
        typeof neighborhoodsData !== "undefined" &&
        neighborhoodsData.features &&
        neighborhoodsData.features.length > 0
    ) {
        const sampleFeature = neighborhoodsData.features[0];
        const properties = sampleFeature.properties;

        console.log("Available properties:", Object.keys(properties));

        // Define field translations for better Arabic labels
        const fieldTranslations = {
            "OBJECTID_1": "معرف الكائن",
            "Names": "اسم الحي (عربي)",
            "Name_En": "اسم الحي (إنجليزي)",
            "Name_En_2": "اسم الحي (إنجليزي 2)",
            "Area_Ha": "المساحة (هكتار)",
            "ID": "المعرف",
            "Shape_Leng": "طول الحدود",
            "Sector_01": "القطاع الأول",
            "Sector_02": "القطاع الثاني",
            "Shape_Le_1": "طول الحدود 1",
            "Shape_Area": "المساحة"
        };

        // Get all available properties and add them as options
        Object.keys(properties).forEach((key) => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = fieldTranslations[key] || key;
            select.appendChild(option);
        });

        console.log(`Added ${Object.keys(properties).length} columns to dropdown`);
    } else {
        console.error("Neighborhoods data not available");

        // Fallback: Add some basic options even if data is not loaded
        const fallbackOptions = [
            { key: "ID", label: "المعرف" },
            { key: "Names", label: "اسم الحي" },
            { key: "Sector_01", label: "القطاع الأول" },
            { key: "Area_Ha", label: "المساحة" }
        ];

        fallbackOptions.forEach((col) => {
            const option = document.createElement("option");
            option.value = col.key;
            option.textContent = col.label;
            select.appendChild(option);
        });
    }
}

// Function to get color based on value and color scheme
function getColorForValue(value, min, max, colorScheme) {
    if (value === null || value === undefined || value === "") {
        return "#cccccc"; // Gray for null/empty values
    }

    // Normalize value to 0-1 range
    const normalized = (value - min) / (max - min);

    // Four gradient colors as requested
    const colors = [
        "#d73027", // Red (high values)
        "#fc8d59", // Orange
        "#fee08b", // Yellow
        "#91cf60", // Green (low values)
    ];

    // Determine which color segment the value falls into
    const segmentSize = 1 / (colors.length - 1);
    const segmentIndex = Math.floor(normalized / segmentSize);
    const segmentProgress = (normalized % segmentSize) / segmentSize;

    if (segmentIndex >= colors.length - 1) {
        return colors[colors.length - 1];
    }

    // Interpolate between two colors
    const color1 = hexToRgb(colors[segmentIndex]);
    const color2 = hexToRgb(colors[segmentIndex + 1]);

    const r = Math.round(color1.r + (color2.r - color1.r) * segmentProgress);
    const g = Math.round(color1.g + (color2.g - color1.g) * segmentProgress);
    const b = Math.round(color1.b + (color2.b - color1.b) * segmentProgress);

    return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

// Function to apply column-based coloring to neighborhoods
function applyColumnColoring(columnName) {
    if (!neighborhoodsLayer || !columnName) {
        console.error("Neighborhoods layer or column name not available");
        return;
    }

    // Store original style if not already stored
    if (!originalNeighborhoodStyle) {
        originalNeighborhoodStyle = {
            color: "#1e40af",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6,
        };
    }

    // Get all values for the selected column
    const values = [];
    const categoricalValues = new Set();
    let isNumerical = true;

    neighborhoodsLayer.eachLayer((layer) => {
        const value = layer.feature.properties[columnName];
        if (value !== null && value !== undefined && value !== "") {
            values.push(value);
            categoricalValues.add(value);

            // Check if value is numerical
            if (isNaN(parseFloat(value))) {
                isNumerical = false;
            }
        }
    });

    if (values.length === 0) {
        console.error("No valid values found for column:", columnName);
        return;
    }

    let colorMapping = {};
    let legendItems = [];

    if (isNumerical) {
        // Numerical coloring with gradient
        const numValues = values.map((v) => parseFloat(v));
        const min = Math.min(...numValues);
        const max = Math.max(...numValues);

        // Create legend for numerical values
        const colors = ["#91cf60", "#fee08b", "#fc8d59", "#d73027"];
        const ranges = [
            {
                min: min,
                max: min + (max - min) * 0.25,
                color: colors[0],
                label: `${min.toFixed(1)} - ${(min + (max - min) * 0.25).toFixed(1)}`,
            },
            {
                min: min + (max - min) * 0.25,
                max: min + (max - min) * 0.5,
                color: colors[1],
                label: `${(min + (max - min) * 0.25).toFixed(1)} - ${(
                    min +
                    (max - min) * 0.5
                ).toFixed(1)}`,
            },
            {
                min: min + (max - min) * 0.5,
                max: min + (max - min) * 0.75,
                color: colors[2],
                label: `${(min + (max - min) * 0.5).toFixed(1)} - ${(
                    min +
                    (max - min) * 0.75
                ).toFixed(1)}`,
            },
            {
                min: min + (max - min) * 0.75,
                max: max,
                color: colors[3],
                label: `${(min + (max - min) * 0.75).toFixed(1)} - ${max.toFixed(1)}`,
            },
        ];

        legendItems = ranges;

        // Apply coloring to each layer
        neighborhoodsLayer.eachLayer((layer) => {
            const value = parseFloat(layer.feature.properties[columnName]);
            const color = isNaN(value)
                ? "#cccccc"
                : getColorForValue(value, min, max);

            layer.setStyle({
                fillColor: color,
                color: "#333333",
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.7,
            });
        });
    } else {
        // Categorical coloring
        const uniqueValues = Array.from(categoricalValues);
        const colors = [
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#ff7f00",
            "#ffff33",
            "#a65628",
            "#f781bf",
        ];

        uniqueValues.forEach((value, index) => {
            const color = colors[index % colors.length];
            colorMapping[value] = color;
            legendItems.push({ label: value, color: color });
        });

        // Apply coloring to each layer
        neighborhoodsLayer.eachLayer((layer) => {
            const value = layer.feature.properties[columnName];
            const color = colorMapping[value] || "#cccccc";

            layer.setStyle({
                fillColor: color,
                color: "#333333",
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.7,
            });
        });
    }

    // Update legend
    updateColorLegend(legendItems, isNumerical);

    // Store current colored column
    currentColoredColumn = columnName;
}

// Enhanced function to update color legend with animations
function updateColorLegend(legendItems, isNumerical) {
    const legendContainer = document.getElementById("colorLegend");
    const legendItemsContainer = document.getElementById("legendItems");

    if (!legendContainer || !legendItemsContainer) return;

    // Hide legend first if it's visible
    if (legendContainer.style.display === "block") {
        legendContainer.style.opacity = "0";
        legendContainer.style.transform = "translateY(-10px)";

        setTimeout(() => {
            updateLegendContent();
        }, 300);
    } else {
        updateLegendContent();
    }

    function updateLegendContent() {
        // Clear existing legend items
        legendItemsContainer.innerHTML = "";

        // Add new legend items with staggered animation
        legendItems.forEach((item, index) => {
            const legendItem = document.createElement("div");
            legendItem.className = "legend-item";
            legendItem.style.opacity = "0";
            legendItem.style.transform = "translateX(-20px)";

            const colorBox = document.createElement("div");
            colorBox.className = "legend-color";
            colorBox.style.backgroundColor = item.color;

            const label = document.createElement("span");
            label.className = "legend-label";
            label.textContent = item.label;

            if (isNumerical && item.min !== undefined) {
                const range = document.createElement("span");
                range.className = "legend-range";
                range.textContent = item.label;
                legendItem.appendChild(range);
            } else {
                legendItem.appendChild(label);
            }

            legendItem.appendChild(colorBox);
            legendItemsContainer.appendChild(legendItem);

            // Animate item appearance with stagger
            setTimeout(() => {
                legendItem.style.transition = "all 0.4s ease";
                legendItem.style.opacity = "1";
                legendItem.style.transform = "translateX(0)";
            }, index * 100 + 100);
        });

        // Show legend container
        legendContainer.style.display = "block";
        setTimeout(() => {
            legendContainer.style.transition = "all 0.4s ease";
            legendContainer.style.opacity = "1";
            legendContainer.style.transform = "translateY(0)";
        }, 50);
    }
}

// Function to reset neighborhood coloring
function resetNeighborhoodColoring() {
    if (!neighborhoodsLayer || !originalNeighborhoodStyle) return;

    neighborhoodsLayer.eachLayer((layer) => {
        layer.setStyle(originalNeighborhoodStyle);
    });

    // Hide legend
    const legendContainer = document.getElementById("colorLegend");
    if (legendContainer) {
        legendContainer.style.display = "none";
    }

    currentColoredColumn = null;
}

// Function to completely reset neighborhoods layer to default state
function resetNeighborhoodsToDefault() {
    try {
        console.log("إعادة ضبط طبقة الأحياء للحالة الافتراضية...");

        // Reset neighborhood coloring first
        resetNeighborhoodColoring();

        // Reset to default style using the function from map2.js
        if (typeof resetLayerToDefault === "function") {
            resetLayerToDefault("neighborhoods");
        }

        // Clear any sectoral functionality data
        if (window.sectoralFunctionalityData) {
            window.sectoralFunctionalityData = null;
        }

        // Clear any composite coloring data
        if (window.compositeResultsData) {
            window.compositeResultsData = null;
        }

        // Hide any color legends
        const colorLegend = document.getElementById("colorLegend");
        if (colorLegend) {
            colorLegend.style.display = "none";
        }

        const blueGradientLegend = document.getElementById("blueGradientLegend");
        if (blueGradientLegend) {
            blueGradientLegend.style.display = "none";
        }

        // Reset any popup content modifications
        if (window.originalNeighborhoodPopupFunction) {
            window.createNeighborhoodPopup = window.originalNeighborhoodPopupFunction;
        }

        // Reload neighborhoods layer to restore default functionality
        if (
            typeof loadNeighborhoodsLayer === "function" &&
            typeof neighborhoodsData !== "undefined"
        ) {
            loadNeighborhoodsLayer();
        }

        console.log("تم إعادة ضبط طبقة الأحياء بنجاح");

        // Show success notification
        if (typeof showSuccessNotification === "function") {
            showSuccessNotification(
                "تم إعادة ضبط طبقة الأحياء للحالة الافتراضية بنجاح!"
            );
        } else {
            alert("تم إعادة ضبط طبقة الأحياء للحالة الافتراضية بنجاح!");
        }
    } catch (error) {
        console.error("خطأ في إعادة ضبط طبقة الأحياء:", error);
        alert("حدث خطأ أثناء إعادة ضبط طبقة الأحياء");
    }
}

// Function to load composite analysis content
function loadCompositeAnalysis() {
    const popupContentContainer = document.getElementById(
        "popup-content-container"
    );

    if (popupContentContainer) {
        popupContentContainer.innerHTML = `
      <div style="padding: 20px; font-family: 'Cairo', sans-serif; height: 100%; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 15px;">
          <h2 style="color: #333; margin: 0;">تحليل الكفاءة الحضرية المركبة</h2>
          <button onclick="showFullscreenPopup()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">
            <i class="fas fa-arrow-left"></i> العودة
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef;">
              <h4 style="color: #495057; margin-bottom: 15px;">
                <i class="fas fa-map-marked-alt" style="color: #007bff;"></i> اختيار المنطقة
              </h4>
              <select id="analysisAreaSelect" style="width: 100%; padding: 10px; border: 1px solid #ced4da; border-radius: 6px; font-family: 'Cairo', sans-serif;">
                <option value="">اختر منطقة للتحليل...</option>
                <option value="all">جميع الأحياء</option>
                <option value="sector">حسب القطاع</option>
                <option value="custom">منطقة مخصصة</option>
              </select>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef;">
              <h4 style="color: #495057; margin-bottom: 15px;">
                <i class="fas fa-sliders-h" style="color: #28a745;"></i> معايير التحليل
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> البنية التحتية
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> الخدمات العامة
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> الكثافة السكانية
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" checked> جودة البيئة
                </label>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <button onclick="runCompositeAnalysis()" style="
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s ease;
              box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              <i class="fas fa-play"></i> تشغيل التحليل
            </button>
          </div>

          <div id="analysisResults" style="
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 20px;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
          ">
            <div style="text-align: center;">
              <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
              <p>اختر المعايير واضغط "تشغيل التحليل" لعرض النتائج</p>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}

// Function to run composite analysis
function runCompositeAnalysis() {
    const resultsContainer = document.getElementById("analysisResults");

    if (resultsContainer) {
        // Show loading state
        resultsContainer.innerHTML = `
      <div style="text-align: center;">
        <div style="
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        "></div>
        <p>جاري تشغيل التحليل...</p>
      </div>
    `;

        // Simulate analysis process
        setTimeout(() => {
            resultsContainer.innerHTML = `
        <div style="height: 100%; overflow-y: auto;">
          <h4 style="color: #333; margin-bottom: 20px; text-align: center;">
            <i class="fas fa-chart-line"></i> نتائج تحليل الكفاءة الحضرية المركبة
          </h4>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">85%</div>
              <div style="font-size: 12px; opacity: 0.9;">الكفاءة الإجمالية</div>
            </div>
            <div style="background: linear-gradient(135deg, #28a745, #1e7e34); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">92%</div>
              <div style="font-size: 12px; opacity: 0.9;">البنية التحتية</div>
            </div>
            <div style="background: linear-gradient(135deg, #ffc107, #e0a800); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">78%</div>
              <div style="font-size: 12px; opacity: 0.9;">الخدمات العامة</div>
            </div>
            <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">71%</div>
              <div style="font-size: 12px; opacity: 0.9;">جودة البيئة</div>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h5 style="color: #495057; margin-bottom: 10px;">أفضل الأحياء أداءً:</h5>
            <ol style="margin: 0; padding-right: 20px;">
              <li>الشيخ مقصود - 94%</li>
              <li>حلب الجديدة الشمالي - 91%</li>
              <li>السليمانية - 88%</li>
              <li>الحيدرية - 85%</li>
            </ol>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h5 style="color: #856404; margin-bottom: 10px;">توصيات التحسين:</h5>
            <ul style="margin: 0; padding-right: 20px; color: #856404;">
              <li>تحسين شبكة النقل العام في المناطق الجنوبية</li>
              <li>زيادة المساحات الخضراء في الأحياء الكثيفة</li>
              <li>تطوير الخدمات الصحية في الأحياء النائية</li>
            </ul>
          </div>
        </div>
      `;
        }, 2000);
    }
}

// Export all functions to window object for global access
window.showCompositeColoringWithSectoralGrid = showCompositeColoringWithSectoralGrid;
window.createSimpleCompositeInterface = createSimpleCompositeInterface;
window.loadSimpleMiniMap = loadSimpleMiniMap;
window.tryApplyCompositeColoring = tryApplyCompositeColoring;
window.applyCompositeColoring = applyCompositeColoring;
window.calculateCompositeEfficiencyFromSectoralData = calculateCompositeEfficiencyFromSectoralData;
window.normalizeNeighborhoodName = normalizeNeighborhoodName;
window.findMatchingNeighborhoodName = findMatchingNeighborhoodName;
window.applyCompositeColoringFromData = applyCompositeColoringFromData;
window.applyCompositeColoringToLayer = applyCompositeColoringToLayer;
window.generateRandomSectoralFunctionality = generateRandomSectoralFunctionality;
window.showSectoralMappingInterface = showSectoralMappingInterface;
window.populateSectoralMappingGrid = populateSectoralMappingGrid;
window.populateSectoralMappingGridWithMaps = populateSectoralMappingGridWithMaps;
window.createMiniMapForSector = createMiniMapForSector;
window.applySectoralColoring = applySectoralColoring;
window.getBlueGradientColor = getBlueGradientColor;
window.getStatusBackgroundColor = getStatusBackgroundColor;
window.showSectorPreview = showSectorPreview;
window.calculateSectorStatistics = calculateSectorStatistics;
window.findNeighborhoodsLayer = findNeighborhoodsLayer;
window.diagnoseMapLayers = diagnoseMapLayers;
window.showNotification = showNotification;
window.populateColumnDropdown = populateColumnDropdown;
window.getColorForValue = getColorForValue;
window.hexToRgb = hexToRgb;
window.applyColumnColoring = applyColumnColoring;
window.updateColorLegend = updateColorLegend;
window.resetNeighborhoodColoring = resetNeighborhoodColoring;
window.resetNeighborhoodsToDefault = resetNeighborhoodsToDefault;
window.loadCompositeAnalysis = loadCompositeAnalysis;
window.runCompositeAnalysis = runCompositeAnalysis;

console.log("تم تحميل ملف sectoral-analysis.js بنجاح وتصدير جميع الوظائف");

// Auto-populate column dropdown when document is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, attempting to populate column dropdown");
    // Wait a bit for all data to load
    setTimeout(() => {
        if (window.populateColumnDropdown) {
            console.log("Calling populateColumnDropdown");
            window.populateColumnDropdown();
        } else {
            console.error("populateColumnDropdown function not available");
        }
    }, 1000);
});

// Also try to populate when the map is ready
if (typeof window.addEventListener === 'function') {
    window.addEventListener('load', function () {
        console.log("Window loaded, attempting to populate column dropdown");
        setTimeout(() => {
            if (window.populateColumnDropdown) {
                window.populateColumnDropdown();
            }
        }, 2000);
    });
}
