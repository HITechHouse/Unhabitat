/**
 * import and export functions - updated version
 * supports exporting all layers with all required formats
 * 
 * required libraries (must be added in HTML):
 * 
 * <!-- for exporting to Excel -->
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
 * 
 * <!-- for exporting to PDF -->
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 * 
 * <!-- for exporting to Shapefile -->
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
 * <script src="https://unpkg.com/shp-write@0.3.2/shp-write.js"></script>
 * 
 * usage:
 * 1. make sure the neighborhoods data (neighborhoodsData) and service sectors data (serviceSectorsData) are loaded
 * 2. make sure the HTML elements exist: exportLayerSelect, exportFormat, exportLayerBtn
 * 3. the file will be automatically initialized when the page loads
 */

document.addEventListener("DOMContentLoaded", function () {
  // prevent duplicate initialization
  if (window.importExportInitialized) {
    return;
  }
  window.importExportInitialized = true;

  console.log("تهيئة نظام الاستيراد والتصدير...");

  // initialize the import/export interface
  initImportExport();
});

/**
 * initialize the import/export interface
 */
function initImportExport() {
  // make sure the data is available as global variables
  if (typeof neighborhoodsData !== 'undefined' && !window.neighborhoodsData) {
    window.neighborhoodsData = neighborhoodsData;
    console.log("Set window.neighborhoodsData from global scope");
  }

  if (typeof serviceSectorsData !== 'undefined' && !window.serviceSectorsData) {
    window.serviceSectorsData = serviceSectorsData;
    console.log("Set window.serviceSectorsData from global scope");
  }

  // Log data availability for debugging
  console.log("Data availability check:");
  console.log("- window.neighborhoodsData:", window.neighborhoodsData ? "Available" : "Not available");
  console.log("- global neighborhoodsData:", typeof neighborhoodsData !== 'undefined' ? "Available" : "Not available");
  console.log("- window.serviceSectorsData:", window.serviceSectorsData ? "Available" : "Not available");
  console.log("- global serviceSectorsData:", typeof serviceSectorsData !== 'undefined' ? "Available" : "Not available");

  // listen for the service sectors loaded event
  document.addEventListener('serviceSectorsLoaded', function () {
    console.log("تم استلام إشعار تحميل بيانات دوائر الخدمات");
    // update the data reference in the global window object if not available
    if (!window.serviceSectorsData && typeof serviceSectorsData !== 'undefined') {
      window.serviceSectorsData = serviceSectorsData;
    }
  });

  // user interface elements
  const exportLayerSelect = document.getElementById("exportLayerSelect");
  const exportFormatSelect = document.getElementById("exportFormat");
  const exportButton = document.getElementById("exportLayerBtn");

  // initialize the export button
  if (exportButton) {
    // remove any previous event listeners
    const oldExportHandler = exportButton._exportHandler;
    if (oldExportHandler) {
      exportButton.removeEventListener("click", oldExportHandler);
    }

    // create a new event listener
    const newExportHandler = function () {
      const layerName = exportLayerSelect ? exportLayerSelect.value : null;
      const format = exportFormatSelect ? exportFormatSelect.value : null;

      if (!layerName || layerName.trim() === "" || layerName === "-- اختر طبقة --") {
        showAlert("الرجاء اختيار طبقة للتصدير", "warning");
        return;
      }

      if (!format || format.trim() === "" || format === "اختر صيغة التصدير") {
        showAlert("الرجاء اختيار صيغة التصدير", "warning");
        return;
      }

      exportLayer(layerName, format);
    };

    // save a reference to the new event listener
    exportButton._exportHandler = newExportHandler;
    exportButton.addEventListener("click", newExportHandler);
  }

  console.log("تم تهيئة نظام الاستيراد والتصدير بنجاح");

  // Test library availability after initialization
  setTimeout(() => {
    console.log("Testing library availability:");
    console.log("- shpwrite:", typeof shpwrite !== 'undefined' ? "Available" : "Not available");
    console.log("- JSZip:", typeof JSZip !== 'undefined' ? "Available" : "Not available");
    console.log("- jsPDF:", typeof jsPDF !== 'undefined' ? "Available" : "Not available");
    console.log("- XLSX:", typeof XLSX !== 'undefined' ? "Available" : "Not available");
  }, 2000);

  // add a listener for automatic retry on data load
  setupAutoRetryOnDataLoad();

  // initialize the import function
  initializeImport();
}

/**
 * setup automatic retry on data load
 */
function setupAutoRetryOnDataLoad() {
  let pendingExport = null;

  // listen for the service sectors loaded event
  document.addEventListener('serviceSectorsLoaded', function (event) {
    console.log("تم تحميل بيانات دوائر الخدمات، فحص الطلبات المعلقة...");

    if (pendingExport) {
      console.log(`إعادة محاولة تصدير ${pendingExport.layer} بصيغة ${pendingExport.format}`);

      setTimeout(() => {
        try {
          exportLayer(pendingExport.layer, pendingExport.format);
          showAlert("تم إعادة محاولة التصدير تلقائياً بعد تحميل البيانات", "success");
        } catch (error) {
          console.error("فشلت إعادة المحاولة:", error);
          showAlert("فشلت إعادة المحاولة: " + error.message, "error");
        } finally {
          pendingExport = null;
        }
      }, 500); // wait for a short time to ensure the data is stable
    }
  });

  // improve error handling in the export
  const originalExportLayer = window.exportLayer || exportLayer;

  // make sure exportLayer is available in the global scope
  window.exportLayer = function (layerName, format) {
    try {
      return originalExportLayer(layerName, format);
    } catch (error) {
      // if the error is related to the service sectors data not being loaded
      if (error.message.includes("لم يتم تحميلها بعد") &&
        (layerName === "service-sectors" || layerName === "service-sector-labels")) {

        console.log("حفظ طلب التصدير للمحاولة لاحقاً...");
        pendingExport = { layer: layerName, format: format };

        showAlert("جاري تحميل البيانات، سيتم التصدير تلقائياً عند الانتهاء...", "info");
        return;
      }

      // rethrow the error for other errors
      throw error;
    }
  };
}

/**
 * initialize the import function
 */
function initializeImport() {
  // prevent duplicate initialization to avoid multiple event listeners
  if (window.featuresImportInitialized) {
    return;
  }
  window.featuresImportInitialized = true;

  const importLayerBtn = document.getElementById("importLayerBtn");
  const layerFileInput = document.getElementById("layerFileInput");

  // File import
  if (importLayerBtn && layerFileInput) {
    // remove any previous event listeners to avoid conflicts
    const newImportBtn = importLayerBtn.cloneNode(true);
    importLayerBtn.parentNode.replaceChild(newImportBtn, importLayerBtn);

    const newFileInput = layerFileInput.cloneNode(true);
    layerFileInput.parentNode.replaceChild(newFileInput, layerFileInput);

    // get the new references
    const cleanImportBtn = document.getElementById("importLayerBtn");
    const cleanFileInput = document.getElementById("layerFileInput");

    if (cleanImportBtn && cleanFileInput) {
      cleanImportBtn.addEventListener("click", function () {
        cleanFileInput.click();
      });

      cleanFileInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async function (e) {
            try {
              // validate file extension
              const fileExtension = file.name.split(".").pop().toLowerCase();
              console.log(
                "Attempting to import file with extension:",
                fileExtension
              );

              // more flexible extension checking
              const supportedExtensions = {
                geojson: "GeoJSON",
                json: "JSON",
                kml: "KML",
                kmz: "KML (Zipped)",
                csv: "CSV",
                shp: "Shapefile",
                zip: "Zipped Shapefile",
              };

              if (!supportedExtensions[fileExtension]) {
                throw new Error(
                  `صيغة الملف غير مدعومة.\n` +
                  `الملف: ${file.name}\n` +
                  `الصيغة المدخلة: ${fileExtension}\n\n` +
                  `الصيغ المدعومة:\n` +
                  Object.entries(supportedExtensions)
                    .map(([ext, desc]) => `- ${ext} (${desc})`)
                    .join("\n")
                );
              }

              // log the first few characters of the file for debugging
              let fileContent = e.target.result;
              console.log(
                "File content preview:",
                fileContent.substring(0, 100)
              );

              // check for BOM (Byte Order Mark)
              if (fileContent.charCodeAt(0) === 0xfeff) {
                console.warn("File contains BOM, removing it...");
                fileContent = fileContent.slice(1);
              }

              let data;

              // Handle different file types
              if (fileExtension === "kml" || fileExtension === "kmz") {
                console.log("Processing KML file...");
                try {
                  data = processKMLFile(fileContent, file.name);
                } catch (kmlError) {
                  throw new Error(
                    `خطأ في معالجة ملف KML:\n${kmlError.message}`
                  );
                }
              } else if (fileExtension === "csv") {
                console.log("Processing CSV file...");
                try {
                  data = processCSVFile(fileContent, file.name);
                  console.log("CSV processing result:", data);

                  // Check if this is tabular data that was already handled
                  if (data && data.type === "TabularData") {
                    console.log("CSV processed as tabular data - already handled, exiting");
                    showAlert("تم استيراد البيانات الجدولية بنجاح", "success");
                    return; // Exit early since tabular data was already processed
                  }

                  console.log("CSV contains spatial data, continuing to add to map...");
                } catch (csvError) {
                  console.error("CSV processing error:", csvError);
                  throw new Error(
                    `خطأ في معالجة ملف CSV:\n${csvError.message}`
                  );
                }
              } else if (fileExtension === "shp" || fileExtension === "zip") {
                console.log("Processing Shapefile...");
                try {
                  data = await processShapefileFile(file);
                } catch (shpError) {
                  throw new Error(
                    `خطأ في معالجة ملف Shapefile:\n${shpError.message}`
                  );
                }
              } else {
                // Handle JSON/GeoJSON files
                console.log("Processing JSON/GeoJSON file...");

                // check for common JSON formatting issues
                if (fileContent.trim().startsWith("[")) {
                  throw new Error(
                    "الملف يبدأ بقوس مربع [. يجب أن يبدأ بقوس معقوف {"
                  );
                }

                // Check if file looks like XML but has wrong extension
                if (fileContent.trim().startsWith("<?xml") || fileContent.trim().startsWith("<kml")) {
                  throw new Error(
                    "يبدو أن هذا ملف XML/KML. يرجى التأكد من امتداد الملف (.kml)"
                  );
                }

                try {
                  data = JSON.parse(fileContent);
                } catch (parseError) {
                  // get the position of the error
                  const errorPosition = parseInt(
                    parseError.message.match(/position (\d+)/)?.[1] || "0"
                  );
                  const errorLine = fileContent
                    .substring(0, errorPosition)
                    .split("\n").length;
                  const errorColumn =
                    errorPosition -
                    fileContent.substring(0, errorPosition).lastIndexOf("\n");

                  // Get the problematic line
                  const lines = fileContent.split("\n");
                  const problematicLine = lines[errorLine - 1];

                  throw new Error(
                    `خطأ في تنسيق JSON:\n` +
                    `- السطر: ${errorLine}\n` +
                    `- العمود: ${errorColumn}\n` +
                    `- النص: ${problematicLine}\n` +
                    `- التفاصيل: ${parseError.message}`
                  );
                }
              }

              // Handle different data types - spatial data continues below

              // Validate GeoJSON structure for spatial data
              if (
                data.type !== "FeatureCollection" ||
                !Array.isArray(data.features)
              ) {
                throw new Error(
                  "تنسيق GeoJSON غير صالح. يجب أن يحتوي الملف على FeatureCollection مع مصفوفة features"
                );
              }

              // Validate features
              if (data.features.length === 0) {
                throw new Error("الملف لا يحتوي على أي عناصر جغرافية");
              }

              // Validate each feature
              data.features.forEach((feature, index) => {
                if (
                  !feature.type ||
                  !feature.geometry ||
                  !feature.geometry.type ||
                  !feature.geometry.coordinates
                ) {
                  throw new Error(
                    `العنصر رقم ${index + 1} غير صالح في GeoJSON`
                  );
                }
              });

              // If all validations pass, add to map
              console.log("Imported GeoJSON:", data);
              console.log("Checking map availability:", {
                leafletAvailable: typeof L !== "undefined",
                mapAvailable: typeof map !== "undefined",
                windowMapAvailable: typeof window.map !== "undefined"
              });

              // Add to map or process as needed
              const mapInstance = map || window.map;
              if (typeof L !== "undefined" && mapInstance) {
                const importedLayer = L.geoJSON(data, {
                  style: function (feature) {
                    return {
                      fillColor: "#00ffff",
                      color: "#ffffff",
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.5,
                    };
                  },
                  onEachFeature: function (feature, layer) {
                    if (feature.properties) {
                      const popupContent = `
                                            <div class="popup-header futuristic">
                                                <h3 class="popup-title">${feature.properties.Name ||
                        feature.properties.name ||
                        "عنصر مستورد"
                        }</h3>
                                            </div>
                                            <div class="popup-body">
                                                ${Object.entries(
                          feature.properties
                        )
                          .map(
                            ([key, value]) => `
                                                    <div class="popup-stat">
                                                        <span>${key}:</span>
                                                        <strong>${value}</strong>
                                                    </div>
                                                `
                          )
                          .join("")}
                                            </div>
                                        `;
                      layer.bindPopup(popupContent);
                    }
                  },
                }).addTo(mapInstance);

                // Zoom to the imported layer
                mapInstance.fitBounds(importedLayer.getBounds());

                // Add to layers list
                console.log("Adding layer to list:", file.name);
                addImportedLayerToList(file.name, importedLayer);
                console.log("Layer added to map and list successfully");

                // Show success message with details
                const featureCount = data.features.length;
                const geometryTypes = [...new Set(data.features.map(f => f.geometry.type))];

                console.log("Import successful! Layer details:", {
                  fileName: file.name,
                  featureCount: featureCount,
                  geometryTypes: geometryTypes,
                  layerBounds: importedLayer.getBounds()
                });

                showAlert(
                  `تم استيراد الطبقة بنجاح!\n\n` +
                  `اسم الملف: ${file.name}\n` +
                  `عدد العناصر: ${featureCount}\n` +
                  `أنواع الهندسة: ${geometryTypes.join(', ')}\n\n` +
                  `تم إضافة الطبقة إلى الخريطة وقائمة الطبقات.`,
                  "success"
                );
              } else {
                console.error("Cannot add layer to map:", {
                  leafletAvailable: typeof L !== "undefined",
                  mapAvailable: typeof map !== "undefined",
                  windowMapAvailable: typeof window.map !== "undefined",
                  mapInstance: mapInstance
                });
                throw new Error("مكتبة Leaflet غير محملة أو الخريطة غير متاحة");
              }
            } catch (error) {
              console.error("Error importing file:", error);
              showAlert("خطأ في استيراد الملف: " + error.message, "error");
            }
          };
          reader.onerror = function () {
            console.error("Error reading file");
            showAlert("حدث خطأ أثناء قراءة الملف", "error");
          };
          // Use appropriate reader method based on file type
          const fileExtension = file.name.split(".").pop().toLowerCase();
          if (fileExtension === "shp" || fileExtension === "zip") {
            // Shapefiles are handled separately in processShapefileFile
            // This reader is only for text-based files
            reader.readAsText(file);
          } else {
            reader.readAsText(file);
          }
        }
      });
    }
  }
}

/**
 * Process KML file and convert to GeoJSON
 * @param {string} kmlContent - the KML file content
 * @param {string} fileName - the file name
 * @returns {Object} GeoJSON object
 */
function processKMLFile(kmlContent, fileName) {
  console.log("Converting KML to GeoJSON...");

  // Basic validation
  if (!kmlContent || typeof kmlContent !== 'string') {
    throw new Error("محتوى ملف KML فارغ أو غير صالح");
  }

  if (!kmlContent.includes('<kml') && !kmlContent.includes('<?xml')) {
    throw new Error("ملف KML غير صالح - لا يحتوي على علامات XML المطلوبة");
  }

  try {
    // Simple KML to GeoJSON conversion
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlContent, "text/xml");

    // Check for parser errors
    const parseErrors = kmlDoc.getElementsByTagName("parsererror");
    if (parseErrors.length > 0) {
      throw new Error("خطأ في تحليل XML: " + parseErrors[0].textContent);
    }

    // Extract features from KML
    const features = [];

    // Get all Placemark elements
    const placemarks = kmlDoc.getElementsByTagName("Placemark");
    console.log(`Found ${placemarks.length} placemarks in KML`);

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const feature = convertPlacemarkToFeature(placemark, i);
      if (feature) {
        features.push(feature);
      }
    }

    if (features.length === 0) {
      throw new Error("لم يتم العثور على أي عناصر جغرافية صالحة في ملف KML");
    }

    console.log(`Successfully converted ${features.length} features from KML`);

    return {
      type: "FeatureCollection",
      features: features
    };

  } catch (error) {
    console.error("Error processing KML:", error);
    throw new Error(`فشل في معالجة ملف KML: ${error.message}`);
  }
}

/**
 * Convert a KML Placemark to GeoJSON Feature
 * @param {Element} placemark - the placemark element
 * @param {number} index - the index for naming
 * @returns {Object} GeoJSON Feature
 */
function convertPlacemarkToFeature(placemark, index) {
  try {
    const feature = {
      type: "Feature",
      properties: {},
      geometry: null
    };

    // Extract name
    const nameElement = placemark.getElementsByTagName("name")[0];
    if (nameElement) {
      feature.properties.name = nameElement.textContent.trim();
    } else {
      feature.properties.name = `Placemark ${index + 1}`;
    }

    // Extract description
    const descElement = placemark.getElementsByTagName("description")[0];
    if (descElement) {
      feature.properties.description = descElement.textContent.trim();
    }

    // Extract geometry
    const point = placemark.getElementsByTagName("Point")[0];
    const lineString = placemark.getElementsByTagName("LineString")[0];
    const polygon = placemark.getElementsByTagName("Polygon")[0];

    if (point) {
      feature.geometry = convertKMLPoint(point);
    } else if (lineString) {
      feature.geometry = convertKMLLineString(lineString);
    } else if (polygon) {
      feature.geometry = convertKMLPolygon(polygon);
    } else {
      console.warn(`No supported geometry found in placemark ${index + 1}`);
      return null;
    }

    return feature;

  } catch (error) {
    console.error(`Error converting placemark ${index + 1}:`, error);
    return null;
  }
}

/**
 * Convert KML Point to GeoJSON geometry
 */
function convertKMLPoint(pointElement) {
  const coordsElement = pointElement.getElementsByTagName("coordinates")[0];
  if (!coordsElement) {
    throw new Error("Point missing coordinates");
  }

  const coords = coordsElement.textContent.trim().split(',');
  const lng = parseFloat(coords[0]);
  const lat = parseFloat(coords[1]);

  if (isNaN(lng) || isNaN(lat)) {
    throw new Error("Invalid coordinates in Point");
  }

  return {
    type: "Point",
    coordinates: [lng, lat]
  };
}

/**
 * Convert KML LineString to GeoJSON geometry
 */
function convertKMLLineString(lineElement) {
  const coordsElement = lineElement.getElementsByTagName("coordinates")[0];
  if (!coordsElement) {
    throw new Error("LineString missing coordinates");
  }

  const coordsText = coordsElement.textContent.trim();
  const coordinates = parseKMLCoordinates(coordsText);

  return {
    type: "LineString",
    coordinates: coordinates
  };
}

/**
 * Convert KML Polygon to GeoJSON geometry
 */
function convertKMLPolygon(polygonElement) {
  const outerBoundary = polygonElement.getElementsByTagName("outerBoundaryIs")[0];
  if (!outerBoundary) {
    throw new Error("Polygon missing outer boundary");
  }

  const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
  if (!linearRing) {
    throw new Error("Polygon missing LinearRing");
  }

  const coordsElement = linearRing.getElementsByTagName("coordinates")[0];
  if (!coordsElement) {
    throw new Error("Polygon missing coordinates");
  }

  const coordsText = coordsElement.textContent.trim();
  const coordinates = parseKMLCoordinates(coordsText);

  return {
    type: "Polygon",
    coordinates: [coordinates]
  };
}

/**
 * Parse KML coordinates string
 */
function parseKMLCoordinates(coordsText) {
  const coordinates = [];
  const coordPairs = coordsText.trim().split(/\s+/);

  for (const pair of coordPairs) {
    if (pair.trim()) {
      const coords = pair.split(',');
      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);

      if (!isNaN(lng) && !isNaN(lat)) {
        coordinates.push([lng, lat]);
      }
    }
  }

  return coordinates;
}

/**
 * Process Shapefile and convert to GeoJSON
 * @param {File} file - the shapefile file
 * @returns {Promise<Object>} GeoJSON object
 */
async function processShapefileFile(file) {
  console.log("Converting Shapefile to GeoJSON...");

  // Check if shp library is available
  if (typeof shp === 'undefined') {
    throw new Error("مكتبة shpjs غير محملة. يرجى إعادة تحميل الصفحة.");
  }

  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await fileToArrayBuffer(file);

    console.log("Shapefile loaded, size:", arrayBuffer.byteLength);

    // Basic file validation with detailed logging
    console.log(`File size: ${arrayBuffer.byteLength} bytes`);

    if (arrayBuffer.byteLength === 0) {
      throw new Error("الملف فارغ");
    }

    // Check if this is likely an exported file that's too small
    if (arrayBuffer.byteLength < 100) {
      console.warn(`Very small file detected: ${arrayBuffer.byteLength} bytes`);

      // Try to read as text to see what's in the file
      try {
        const textContent = new TextDecoder().decode(arrayBuffer);
        console.log("Small file content:", textContent.substring(0, 200));

        // Check if it contains error messages or is just too small
        if (textContent.includes('error') || textContent.includes('Error') ||
          textContent.includes('خطأ') || textContent.length < 10) {
          throw new Error(`الملف يحتوي على رسالة خطأ أو بيانات غير كافية:\n${textContent.substring(0, 100)}`);
        }

        // If it's a very small ZIP or binary file, show more info
        if (arrayBuffer.byteLength < 50) {
          throw new Error(
            `الملف صغير جداً (${arrayBuffer.byteLength} بايت) - قد يكون تالفاً.\n\n` +
            `الأسباب المحتملة:\n` +
            `1. مشكلة في عملية التصدير الأصلية\n` +
            `2. الملف تم قطعه أثناء التحميل\n` +
            `3. مشكلة في مكتبة التصدير\n\n` +
            `الحلول المقترحة:\n` +
            `1. جرب تصدير الطبقة مرة أخرى\n` +
            `2. جرب تصدير بصيغة GeoJSON أولاً\n` +
            `3. تأكد من وجود بيانات في الطبقة المختارة`
          );
        }
      } catch (decodeError) {
        console.log("Could not decode small file as text:", decodeError.message);
      }

      // For files between 50-100 bytes, give a warning but try to continue
      console.warn("File is very small but attempting to process anyway...");
    }

    // Additional check for small files that might still be valid
    if (arrayBuffer.byteLength < 200) {
      console.warn("File is small, checking if it's a valid archive...");

      // Check for ZIP file signature
      const uint8Array = new Uint8Array(arrayBuffer);
      const isZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B;

      if (!isZip && file.name.toLowerCase().endsWith('.zip')) {
        throw new Error(
          `الملف لا يبدو كأرشيف ZIP صالح.\n` +
          `حجم الملف: ${arrayBuffer.byteLength} بايت\n` +
          `يرجى التأكد من أن الملف لم يتلف أثناء التحميل.`
        );
      }
    }

    // Check file extension to determine processing method
    const fileExtension = file.name.split(".").pop().toLowerCase();
    let geoJSON;

    if (fileExtension === "zip") {
      console.log("Processing ZIP file containing Shapefile...");

      // Check if JSZip is available for better ZIP handling
      if (typeof JSZip !== 'undefined') {
        try {
          geoJSON = await processShapefileZipWithJSZip(arrayBuffer, file.name);
        } catch (jszipError) {
          console.warn("JSZip processing failed, trying alternatives:", jszipError.message);

          // Check if this might be a conversion package with GeoJSON
          try {
            geoJSON = await tryExtractGeoJSONFromZip(arrayBuffer, file.name);
            if (geoJSON) {
              console.log("Successfully extracted GeoJSON from conversion package");
              // Continue with normal processing
            } else {
              throw new Error("No GeoJSON found in conversion package");
            }
          } catch (geoJsonError) {
            console.log("Not a conversion package, trying shpjs fallback...");
            // Fallback to shpjs direct processing
            try {
              geoJSON = await shp(arrayBuffer);
            } catch (shpjsError) {
              console.error("All processing methods failed:", {
                jszip: jszipError.message,
                geojson: geoJsonError.message,
                shpjs: shpjsError.message
              });
              const diagnostics = await diagnoseShapefileError(arrayBuffer, file.name);
              throw new Error(`فشل في معالجة ملف ZIP بجميع الطرق المتاحة:\n\n${diagnostics}`);
            }
          }
        }
      } else {
        // Fallback to shpjs direct processing
        console.log("JSZip not available, using shpjs directly...");
        try {
          geoJSON = await shp(arrayBuffer);
        } catch (shpjsError) {
          console.error("shpjs direct processing failed:", shpjsError.message);
          const diagnostics = await diagnoseShapefileError(arrayBuffer, file.name);
          throw new Error(`فشل في معالجة ملف ZIP (JSZip غير متاح):\n\n${diagnostics}`);
        }
      }
    } else {
      // Direct .shp file
      console.log("Processing direct .shp file...");
      try {
        geoJSON = await shp(arrayBuffer);
      } catch (shpjsError) {
        console.error("Direct .shp processing failed:", shpjsError.message);
        const diagnostics = await diagnoseShapefileError(arrayBuffer, file.name);
        throw new Error(`فشل في معالجة ملف .shp مباشرة:\n\n${diagnostics}`);
      }
    }

    console.log("Shapefile parsed successfully:", geoJSON);

    // Validate the result
    if (!geoJSON) {
      throw new Error("فشل في تحليل ملف Shapefile");
    }

    // Handle different return formats from shpjs
    let features = [];

    if (Array.isArray(geoJSON)) {
      // Multiple layers - combine them
      geoJSON.forEach(layer => {
        if (layer && layer.features) {
          features = features.concat(layer.features);
        }
      });
    } else if (geoJSON.type === "FeatureCollection" && geoJSON.features) {
      // Single FeatureCollection
      features = geoJSON.features;
    } else if (geoJSON.type === "Feature") {
      // Single Feature
      features = [geoJSON];
    } else {
      throw new Error("تنسيق Shapefile غير مدعوم");
    }

    if (features.length === 0) {
      throw new Error("ملف Shapefile لا يحتوي على أي عناصر جغرافية");
    }

    console.log(`Successfully converted ${features.length} features from Shapefile`);

    return {
      type: "FeatureCollection",
      features: features
    };

  } catch (error) {
    console.error("Error processing Shapefile:", error);

    // Provide more specific error messages based on error content
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes("but-unzip") || errorMsg.includes("unzip")) {
      // Special handling for the specific "but-unzip~2" error
      let detailedMessage = "مشكلة في فك ضغط ملف ZIP.\n\n";

      if (errorMsg.includes("but-unzip~2")) {
        detailedMessage += "هذا خطأ معروف في مكتبة فك الضغط.\n\n";
      }

      detailedMessage +=
        "الحلول المقترحة:\n" +
        "1. جرب استخراج ملفات ZIP يدوياً ورفع ملف .shp مباشرة\n" +
        "2. تأكد من أن ZIP يحتوي على الملفات المطلوبة:\n" +
        "   - ملف .shp (الأشكال الهندسية)\n" +
        "   - ملف .shx (الفهرس)\n" +
        "   - ملف .dbf (البيانات الوصفية)\n" +
        "3. تأكد من أن الملف ليس محمياً بكلمة مرور\n" +
        "4. جرب إعادة ضغط الملفات في أرشيف جديد\n" +
        "5. تأكد من أن الملف ليس تالفاً\n\n" +
        "إذا استمرت المشكلة، جرب تحويل Shapefile إلى GeoJSON باستخدام برنامج GIS آخر.\n\n" +
        "تفاصيل الخطأ: " + error.message;

      throw new Error(detailedMessage);
    } else if (errorMsg.includes("no layers found") || errorMsg.includes("no layers founds")) {
      // Handle the specific "no layers found" error
      throw new Error(
        "❌ لم يتم العثور على طبقات صالحة في ملف Shapefile\n\n" +
        "هذا يعني أن الملف:\n" +
        "• لا يحتوي على بيانات جغرافية صالحة\n" +
        "• قد يكون تالفاً أو غير مكتمل\n" +
        "• قد يفتقر لملفات Shapefile المطلوبة (.shp, .shx, .dbf)\n\n" +
        "الحلول المقترحة:\n" +
        "1. تأكد من أن ZIP يحتوي على جميع ملفات Shapefile\n" +
        "2. جرب فك الضغط يدوياً والتحقق من الملفات\n" +
        "3. استخدم QGIS للتحقق من صحة Shapefile\n" +
        "4. جرب تحويل البيانات إلى GeoJSON أولاً\n\n" +
        `تفاصيل الخطأ: ${error.message}`
      );
    } else if (errorMsg.includes("invalid file") || errorMsg.includes("corrupt")) {
      throw new Error("ملف Shapefile تالف أو غير صالح");
    } else if (errorMsg.includes("unsupported")) {
      throw new Error("نوع Shapefile غير مدعوم");
    } else if (errorMsg.includes("cannot read") || errorMsg.includes("read error")) {
      throw new Error(
        "لا يمكن قراءة ملف Shapefile.\n" +
        "يرجى التأكد من أن الملف:\n" +
        "- ليس محمياً بكلمة مرور\n" +
        "- يحتوي على ملفات Shapefile صالحة\n" +
        "- ليس تالفاً"
      );
    } else {
      throw new Error(`فشل في معالجة ملف Shapefile: ${error.message}`);
    }
  }
}

/**
 * Process Shapefile ZIP using JSZip for better handling
 * @param {ArrayBuffer} arrayBuffer - the ZIP file buffer
 * @param {string} fileName - the file name
 * @returns {Promise<Object>} GeoJSON object
 */
async function processShapefileZipWithJSZip(arrayBuffer, fileName) {
  console.log("Processing Shapefile ZIP with JSZip...");

  try {
    // Load ZIP file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);

    console.log("ZIP file loaded, contents:", Object.keys(zipContent.files));

    // Find shapefile components
    const shpFile = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.shp'));
    const shxFile = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.shx'));
    const dbfFile = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.dbf'));
    const prjFile = Object.keys(zipContent.files).find(name => name.toLowerCase().endsWith('.prj'));

    if (!shpFile) {
      throw new Error("لم يتم العثور على ملف .shp في الأرشيف المضغوط");
    }

    console.log("Found shapefile components:", { shpFile, shxFile, dbfFile, prjFile });

    // Extract files as ArrayBuffers
    const shpBuffer = await zipContent.files[shpFile].async("arraybuffer");
    const shxBuffer = shxFile ? await zipContent.files[shxFile].async("arraybuffer") : null;
    const dbfBuffer = dbfFile ? await zipContent.files[dbfFile].async("arraybuffer") : null;
    const prjBuffer = prjFile ? await zipContent.files[prjFile].async("string") : null;

    // Create combined buffer object for shpjs
    const shapefileData = {
      shp: shpBuffer,
      shx: shxBuffer,
      dbf: dbfBuffer,
      prj: prjBuffer
    };

    console.log("Shapefile components extracted, parsing with shpjs...");

    // Use shpjs to parse the extracted files
    const geoJSON = await shp(shapefileData);

    return geoJSON;

  } catch (error) {
    console.error("Error processing ZIP with JSZip:", error);

    // If JSZip fails, try direct shpjs processing as fallback
    console.log("JSZip processing failed, trying direct shpjs...");
    try {
      return await shp(arrayBuffer);
    } catch (shpjsError) {
      console.error("Both JSZip and direct shpjs failed:", shpjsError.message);
      // Re-throw the original JSZip error with additional context
      throw new Error(`فشل في معالجة ZIP بطريقتين:\n1. JSZip: ${error.message}\n2. shpjs: ${shpjsError.message}`);
    }
  }
}

/**
 * Convert File to ArrayBuffer
 * @param {File} file - the file to convert
 * @returns {Promise<ArrayBuffer>} ArrayBuffer
 */
function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function () {
      reject(new Error("فشل في قراءة الملف"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Try to extract GeoJSON from a conversion package ZIP
 * @param {ArrayBuffer} arrayBuffer - the ZIP file buffer
 * @param {string} fileName - the file name
 * @returns {Promise<Object|null>} GeoJSON object or null
 */
async function tryExtractGeoJSONFromZip(arrayBuffer, fileName) {
  console.log("Checking if ZIP contains GeoJSON conversion package...");

  if (typeof JSZip === 'undefined') {
    console.log("JSZip not available for GeoJSON extraction");
    return null;
  }

  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    const files = Object.keys(zipContent.files);

    console.log("ZIP contents:", files);

    // Check if this looks like a conversion package
    const hasGeoJSON = files.some(f => f.toLowerCase().endsWith('.geojson'));
    const hasReadme = files.some(f => f.toLowerCase().includes('readme'));
    const hasConversionGuide = files.some(f => f.toLowerCase().includes('conversion'));
    const hasShapefile = files.some(f => f.toLowerCase().endsWith('.shp'));

    if (hasGeoJSON && hasReadme && !hasShapefile) {
      console.log("Detected conversion package, extracting GeoJSON...");

      // Find the GeoJSON file
      const geoJsonFile = files.find(f => f.toLowerCase().endsWith('.geojson'));
      if (geoJsonFile) {
        const geoJsonContent = await zipContent.files[geoJsonFile].async("string");
        const geoJSON = JSON.parse(geoJsonContent);

        console.log("Successfully extracted GeoJSON from conversion package:", {
          features: geoJSON.features?.length || 0,
          type: geoJSON.type
        });

        // Show a helpful message to the user
        showAlert(
          `تم استخراج البيانات من حزمة التحويل بنجاح!\n\n` +
          `الملف "${geoJsonFile}" يحتوي على ${geoJSON.features?.length || 0} عنصر جغرافي.\n` +
          `هذا ملف تم تصديره مسبقاً من النظام كبديل عن Shapefile.`,
          "success"
        );

        return geoJSON;
      }
    }

    return null;

  } catch (error) {
    console.error("Error extracting GeoJSON from ZIP:", error.message);
    return null;
  }
}

/**
 * Diagnose Shapefile errors and provide helpful feedback
 * @param {ArrayBuffer} arrayBuffer - the file buffer
 * @param {string} fileName - the file name
 * @returns {Promise<string>} diagnostic message
 */
async function diagnoseShapefileError(arrayBuffer, fileName) {
  console.log("Diagnosing Shapefile error...");

  let diagnostics = `📋 تشخيص ملف Shapefile: ${fileName}\n\n`;

  try {
    // Check file size
    const fileSize = arrayBuffer.byteLength;
    diagnostics += `📏 حجم الملف: ${(fileSize / 1024).toFixed(2)} KB\n`;

    if (fileSize < 100) {
      diagnostics += `⚠️ الملف صغير جداً (أقل من 100 بايت) - قد يكون تالفاً\n\n`;
      return diagnostics + getShapefileHelpText();
    }

    // Check if it's a ZIP file
    const isZip = fileName.toLowerCase().endsWith('.zip');
    diagnostics += `📦 نوع الملف: ${isZip ? 'ZIP مضغوط' : 'ملف .shp مباشر'}\n`;

    if (isZip) {
      // Try to analyze ZIP contents
      try {
        if (typeof JSZip !== 'undefined') {
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(arrayBuffer);
          const files = Object.keys(zipContent.files);

          diagnostics += `📁 ملفات ZIP الموجودة (${files.length}):\n`;
          files.forEach(file => {
            diagnostics += `   • ${file}\n`;
          });

          // Check for required Shapefile components
          const hasShp = files.some(f => f.toLowerCase().endsWith('.shp'));
          const hasShx = files.some(f => f.toLowerCase().endsWith('.shx'));
          const hasDbf = files.some(f => f.toLowerCase().endsWith('.dbf'));

          // Check if this is a conversion package (contains GeoJSON instead of Shapefile)
          const hasGeoJSON = files.some(f => f.toLowerCase().endsWith('.geojson'));
          const hasReadme = files.some(f => f.toLowerCase().includes('readme'));
          const hasConversionGuide = files.some(f => f.toLowerCase().includes('conversion'));

          if (hasGeoJSON && hasReadme && hasConversionGuide && !hasShp) {
            diagnostics += `\n🔍 نوع الملف المكتشف: حزمة تحويل (ليس Shapefile)\n`;
            diagnostics += `   ✅ ملف .geojson موجود\n`;
            diagnostics += `   ✅ ملف README موجود\n`;
            diagnostics += `   ✅ دليل التحويل موجود\n`;
            diagnostics += `\n💡 هذا ملف تم تصديره من النظام نفسه كبديل عن Shapefile\n`;
            diagnostics += `يمكنك استخراج ملف .geojson من الأرشيف واستيراده مباشرة\n`;
          } else {
            diagnostics += `\n🔍 ملفات Shapefile المطلوبة:\n`;
            diagnostics += `   ${hasShp ? '✅' : '❌'} ملف .shp (الأشكال الهندسية)\n`;
            diagnostics += `   ${hasShx ? '✅' : '❌'} ملف .shx (الفهرس)\n`;
            diagnostics += `   ${hasDbf ? '✅' : '❌'} ملف .dbf (البيانات الوصفية)\n`;

            if (!hasShp) {
              diagnostics += `\n❌ السبب الرئيسي: لا يوجد ملف .shp في الأرشيف\n`;
            } else if (!hasShx || !hasDbf) {
              diagnostics += `\n⚠️ ملفات مهمة مفقودة - قد يسبب مشاكل في القراءة\n`;
            }
          }
        } else {
          diagnostics += `⚠️ لا يمكن تحليل محتويات ZIP (JSZip غير متاح)\n`;
        }
      } catch (zipError) {
        diagnostics += `❌ فشل في تحليل ملف ZIP: ${zipError.message}\n`;
      }
    } else {
      // Check .shp file header
      try {
        const header = new DataView(arrayBuffer, 0, Math.min(100, arrayBuffer.byteLength));
        const fileCode = header.getInt32(0, false); // Big endian

        diagnostics += `🔢 رمز الملف: ${fileCode.toString(16)}\n`;

        if (fileCode !== 0x0000270a) {
          diagnostics += `❌ رمز ملف .shp غير صحيح (متوقع: 0x270a، موجود: 0x${fileCode.toString(16)})\n`;
        } else {
          diagnostics += `✅ رمز ملف .shp صحيح\n`;
        }
      } catch (headerError) {
        diagnostics += `❌ فشل في قراءة رأس الملف: ${headerError.message}\n`;
      }
    }

  } catch (error) {
    diagnostics += `❌ خطأ في التشخيص: ${error.message}\n`;
  }

  diagnostics += `\n${getShapefileHelpText()}`;
  return diagnostics;
}

/**
 * Get helpful text for Shapefile issues
 * @returns {string} help text
 */
function getShapefileHelpText() {
  return `💡 الحلول المقترحة:

1. 📁 تأكد من ملفات Shapefile:
   • يجب أن يحتوي ZIP على ملفات: .shp, .shx, .dbf
   • الملف .shp يحتوي على الأشكال الهندسية
   • الملف .shx يحتوي على الفهرس
   • الملف .dbf يحتوي على البيانات الوصفية

2. 🔧 جرب هذه الحلول:
   • فك ضغط ZIP يدوياً وتأكد من وجود الملفات المطلوبة
   • أعد إنشاء ZIP مع جميع ملفات Shapefile
   • تأكد من عدم وجود مجلدات فرعية في ZIP
   • جرب رفع ملف .shp مباشرة (بدون ضغط)

3. 🛠️ أدوات بديلة:
   • استخدم QGIS لتحويل Shapefile إلى GeoJSON
   • استخدم موقع mapshaper.org للتحويل
   • تأكد من أن Shapefile ليس تالفاً

 4. 📋 إذا كان هذا ملف تحويل من النظام:
    • فك ضغط ZIP واستخرج ملف .geojson
    • استورد ملف .geojson مباشرة
    • أو استخدم ملف .csv إذا كان متاحاً

 5. 📋 تنسيقات أخرى مدعومة:
    • GeoJSON (.geojson)
    • KML (.kml)
    • CSV مع إحداثيات (.csv)

 إذا استمرت المشكلة، جرب تحويل البيانات إلى GeoJSON أولاً.`;
}

/**
 * Process CSV file and convert to GeoJSON
 * @param {string} csvContent - the CSV file content
 * @param {string} fileName - the file name
 * @returns {Object} GeoJSON object
 */
function processCSVFile(csvContent, fileName) {
  console.log("Converting CSV to GeoJSON...");

  // Basic validation
  if (!csvContent || typeof csvContent !== 'string') {
    throw new Error("محتوى ملف CSV فارغ أو غير صالح");
  }

  try {
    // Parse CSV content
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      throw new Error("ملف CSV فارغ");
    }

    if (rows.length < 2) {
      throw new Error("ملف CSV يجب أن يحتوي على سطر للعناوين وسطر واحد على الأقل من البيانات");
    }

    // Get headers and data
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log("CSV headers:", headers);
    console.log(`Found ${dataRows.length} data rows`);

    // Find coordinate columns
    const coordColumns = findCoordinateColumns(headers);

    // Check if this is a tabular data file without coordinates
    if (!coordColumns.longitude || !coordColumns.latitude) {
      console.log("No coordinate columns found. Checking if this is tabular data...");

      // Check if this looks like neighborhood data
      const hasNeighborhoodData = headers.some(header =>
        header.toLowerCase().includes('name') ||
        header.toLowerCase().includes('area') ||
        header.toLowerCase().includes('sector') ||
        header.toLowerCase().includes('objectid')
      );

      if (hasNeighborhoodData) {
        console.log("Detected tabular neighborhood data. Processing as attribute table...");
        return processTabularCSV(csvContent, fileName, headers, dataRows);
      }

      throw new Error(
        `لم يتم العثور على أعمدة الإحداثيات.\n` +
        `الأعمدة المتوفرة: ${headers.join(', ')}\n` +
        `يجب أن يحتوي الملف على أعمدة للطول والعرض بأسماء مثل:\n` +
        `longitude, latitude, lng, lat, x, y, lon, Longitude, Latitude\n\n` +
        `أو يمكن استيراد الملف كجدول بيانات وربطه بطبقة موجودة.`
      );
    }

    console.log("Found coordinate columns:", coordColumns);
    console.log("Longitude column index:", coordColumns.longitude);
    console.log("Latitude column index:", coordColumns.latitude);

    // Convert rows to GeoJSON features
    const features = [];
    console.log("Starting conversion of", dataRows.length, "rows to GeoJSON features...");

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      try {
        const feature = convertCSVRowToFeature(row, headers, coordColumns, i);
        if (feature) {
          features.push(feature);
        }
      } catch (error) {
        console.warn(`Error processing row ${i + 2}: ${error.message}`);
        // Continue with other rows
      }
    }

    if (features.length === 0) {
      throw new Error("لم يتم تحويل أي صفوف صالحة من ملف CSV");
    }

    console.log(`Successfully converted ${features.length} rows from CSV`);

    const geoJSON = {
      type: "FeatureCollection",
      features: features
    };

    console.log("Returning GeoJSON from processCSVFile:", geoJSON);
    return geoJSON;

  } catch (error) {
    console.error("Error processing CSV:", error);
    throw new Error(`فشل في معالجة ملف CSV: ${error.message}`);
  }
}

/**
 * Parse CSV content into rows
 * @param {string} csvContent - the CSV content
 * @returns {Array} Array of arrays representing rows
 */
function parseCSV(csvContent) {
  const rows = [];
  const lines = csvContent.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (line) {
      // Simple CSV parsing (handles basic quoted values)
      const row = parseCSVLine(line);
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line
 * @param {string} line - the CSV line
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Find coordinate columns in headers
 * @param {Array} headers - array of header names
 * @returns {Object} object with longitude and latitude column indices
 */
function findCoordinateColumns(headers) {
  console.log("Finding coordinate columns in headers:", headers);

  const coordColumns = {
    longitude: null,
    latitude: null
  };

  // Common longitude column names
  const longitudeNames = [
    'longitude', 'lng', 'lon', 'x', 'long', 'Longitude', 'LNG', 'LON', 'X', 'LONG'
  ];

  // Common latitude column names  
  const latitudeNames = [
    'latitude', 'lat', 'y', 'Latitude', 'LAT', 'Y'
  ];

  console.log("Looking for longitude columns:", longitudeNames);
  console.log("Looking for latitude columns:", latitudeNames);

  // Find longitude column
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    console.log(`Checking header ${i}: "${header}"`);

    if (longitudeNames.includes(header)) {
      console.log(`Found longitude column: "${header}" at index ${i}`);
      coordColumns.longitude = i;
      break;
    }
  }

  // Find latitude column
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();

    if (latitudeNames.includes(header)) {
      console.log(`Found latitude column: "${header}" at index ${i}`);
      coordColumns.latitude = i;
      break;
    }
  }

  console.log("Final coordinate columns result:", coordColumns);
  return coordColumns;
}

/**
 * Convert CSV row to GeoJSON feature
 * @param {Array} row - the data row
 * @param {Array} headers - the headers
 * @param {Object} coordColumns - coordinate column indices
 * @param {number} index - row index for naming
 * @returns {Object} GeoJSON Feature
 */
function convertCSVRowToFeature(row, headers, coordColumns, index) {
  console.log(`Converting row ${index + 1}:`, row);
  console.log("Using coordinate columns:", coordColumns);

  // Extract coordinates
  const lngStr = row[coordColumns.longitude];
  const latStr = row[coordColumns.latitude];

  console.log(`Row ${index + 1} coordinates: lng="${lngStr}", lat="${latStr}"`);

  if (!lngStr || !latStr) {
    throw new Error(`Missing coordinates in row ${index + 2}`);
  }

  const lng = parseFloat(lngStr);
  const lat = parseFloat(latStr);

  if (isNaN(lng) || isNaN(lat)) {
    throw new Error(`Invalid coordinates in row ${index + 2}: lng=${lngStr}, lat=${latStr}`);
  }

  // Validate coordinate ranges
  if (lng < -180 || lng > 180) {
    throw new Error(`Longitude out of range (-180 to 180): ${lng}`);
  }

  if (lat < -90 || lat > 90) {
    throw new Error(`Latitude out of range (-90 to 90): ${lat}`);
  }

  // Build properties object
  const properties = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    const value = row[i] ? row[i].trim() : '';

    // Skip coordinate columns from properties
    if (i !== coordColumns.longitude && i !== coordColumns.latitude) {
      // Try to convert numbers
      const numValue = parseFloat(value);
      properties[header] = isNaN(numValue) ? value : numValue;
    }
  }

  // Add default name if not present
  if (!properties.name && !properties.Name && !properties.NAME) {
    properties.name = `Feature ${index + 1}`;
  }

  const feature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lng, lat]
    },
    properties: properties
  };

  console.log(`Created feature ${index + 1}:`, feature);
  return feature;
}

/**
 * Process tabular CSV data (without coordinates) and try to join with existing layers
 * @param {string} csvContent - the CSV content
 * @param {string} fileName - the file name
 * @param {Array} headers - the headers array
 * @param {Array} dataRows - the data rows array
 * @returns {Object} result object with join information
 */
function processTabularCSV(csvContent, fileName, headers, dataRows) {
  console.log("Processing tabular CSV data...");

  try {
    // Convert rows to objects
    const records = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const record = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].trim();
        const value = row[j] ? row[j].trim() : '';

        // Try to convert numbers
        const numValue = parseFloat(value);
        record[header] = isNaN(numValue) ? value : numValue;
      }

      records.push(record);
    }

    console.log(`Processed ${records.length} records from CSV`);

    // Try to join with existing neighborhoods layer
    const joinResult = attemptJoinWithNeighborhoods(records, headers);

    if (joinResult.success) {
      console.log("Successfully joined with neighborhoods layer");

      // Refresh the neighborhoods layer on the map
      refreshNeighborhoodsLayer();

      // Update column dropdown for styling
      updateColumnDropdown();

      // Show success message to user
      alert(`تم استيراد البيانات الجدولية بنجاح!\n` +
        `عدد السجلات: ${records.length}\n` +
        `تم ربط ${joinResult.matchedCount} سجل مع طبقة الأحياء\n` +
        `المفتاح المستخدم: ${joinResult.csvField} -> ${joinResult.geoField}\n\n` +
        `يمكنك الآن استخدام الأعمدة الجديدة في التلوين والتحليل.`);

      return {
        type: "TabularData",
        records: records,
        headers: headers,
        joinResult: joinResult,
        fileName: fileName
      };
    } else {
      // Show data preview and join options
      showTabularDataPreview(records, headers, fileName);

      return {
        type: "TabularData",
        records: records,
        headers: headers,
        fileName: fileName
      };
    }

  } catch (error) {
    console.error("Error processing tabular CSV:", error);
    throw new Error(`فشل في معالجة البيانات الجدولية: ${error.message}`);
  }
}

/**
 * Attempt to join tabular data with neighborhoods layer
 * @param {Array} records - the CSV records
 * @param {Array} headers - the CSV headers
 * @returns {Object} join result
 */
function attemptJoinWithNeighborhoods(records, headers) {
  console.log("Attempting to join with neighborhoods layer...");

  try {
    // Get neighborhoods data
    const neighborhoodsData = getNeighborhoodsData();
    if (!neighborhoodsData || !neighborhoodsData.features) {
      console.log("No neighborhoods data available for join");
      return { success: false, reason: "No neighborhoods layer found" };
    }

    // Find potential join keys
    const joinKeys = findPotentialJoinKeys(headers, neighborhoodsData.features);

    if (joinKeys.length === 0) {
      console.log("No potential join keys found");
      return { success: false, reason: "No matching fields found" };
    }

    // Try each join key
    for (const joinKey of joinKeys) {
      const joinResult = performJoin(records, neighborhoodsData.features, joinKey);

      if (joinResult.matchedCount > 0) {
        console.log(`Join successful with key: ${joinKey.csvField} -> ${joinKey.geoField}`);
        return {
          success: true,
          joinKey: joinKey,
          matchedCount: joinResult.matchedCount,
          totalRecords: records.length
        };
      }
    }

    return { success: false, reason: "No successful joins found" };

  } catch (error) {
    console.error("Error in join attempt:", error);
    return { success: false, reason: error.message };
  }
}

/**
 * Find potential join keys between CSV and GeoJSON
 * @param {Array} csvHeaders - CSV headers
 * @param {Array} geoFeatures - GeoJSON features
 * @returns {Array} array of potential join keys
 */
function findPotentialJoinKeys(csvHeaders, geoFeatures) {
  const joinKeys = [];

  if (geoFeatures.length === 0) return joinKeys;

  const geoProperties = Object.keys(geoFeatures[0].properties || {});

  // Common field name mappings
  const fieldMappings = [
    { csv: ['Names', 'Name', 'NAME', 'name'], geo: ['Names', 'Name', 'NAME', 'name'] },
    { csv: ['Name_En', 'Name_English', 'english_name'], geo: ['Name_En', 'Name_English', 'english_name'] },
    { csv: ['ID', 'id', 'Id'], geo: ['ID', 'id', 'Id'] },
    { csv: ['OBJECTID_1', 'OBJECTID', 'ObjectID'], geo: ['OBJECTID_1', 'OBJECTID', 'ObjectID'] }
  ];

  // Check each mapping
  for (const mapping of fieldMappings) {
    const csvField = csvHeaders.find(h => mapping.csv.includes(h));
    const geoField = geoProperties.find(p => mapping.geo.includes(p));

    if (csvField && geoField) {
      joinKeys.push({
        csvField: csvField,
        geoField: geoField,
        priority: mapping.csv.indexOf(csvField)
      });
    }
  }

  // Sort by priority
  joinKeys.sort((a, b) => a.priority - b.priority);

  return joinKeys;
}

/**
 * Perform the actual join operation
 * @param {Array} csvRecords - CSV records
 * @param {Array} geoFeatures - GeoJSON features
 * @param {Object} joinKey - join key information
 * @returns {Object} join result
 */
function performJoin(csvRecords, geoFeatures, joinKey) {
  let matchedCount = 0;

  try {
    // Create lookup map from GeoJSON
    const geoLookup = new Map();

    geoFeatures.forEach((feature, index) => {
      const keyValue = feature.properties[joinKey.geoField];
      if (keyValue !== undefined && keyValue !== null) {
        geoLookup.set(String(keyValue).trim(), { feature, index });
      }
    });

    // Join CSV data to GeoJSON
    csvRecords.forEach(record => {
      const csvKeyValue = record[joinKey.csvField];
      if (csvKeyValue !== undefined && csvKeyValue !== null) {
        const lookupKey = String(csvKeyValue).trim();
        const geoMatch = geoLookup.get(lookupKey);

        if (geoMatch) {
          // Add CSV data to GeoJSON properties
          Object.keys(record).forEach(key => {
            if (key !== joinKey.csvField) { // Don't duplicate the join key
              geoMatch.feature.properties[key] = record[key];
            }
          });
          matchedCount++;
        }
      }
    });

    console.log(`Join completed: ${matchedCount} matches out of ${csvRecords.length} records`);

    return { matchedCount };

  } catch (error) {
    console.error("Error performing join:", error);
    throw error;
  }
}

/**
 * Show tabular data preview dialog
 * @param {Array} records - the records
 * @param {Array} headers - the headers
 * @param {string} fileName - the file name
 */
function showTabularDataPreview(records, headers, fileName) {
  const previewCount = Math.min(5, records.length);

  let message = `تم استيراد البيانات الجدولية:\n\n`;
  message += `اسم الملف: ${fileName}\n`;
  message += `عدد السجلات: ${records.length}\n`;
  message += `عدد الأعمدة: ${headers.length}\n\n`;
  message += `الأعمدة المتوفرة:\n${headers.join(', ')}\n\n`;
  message += `عينة من البيانات (أول ${previewCount} سجلات):\n`;

  for (let i = 0; i < previewCount; i++) {
    const record = records[i];
    message += `\nسجل ${i + 1}:\n`;
    headers.forEach(header => {
      message += `  ${header}: ${record[header]}\n`;
    });
  }

  message += `\nملاحظة: لم يتم العثور على أعمدة إحداثيات في هذا الملف.\n`;
  message += `يمكن استخدام هذه البيانات لتحديث خصائص الطبقات الموجودة.`;

  alert(message);
}

/**
 * Refresh neighborhoods layer on the map
 */
function refreshNeighborhoodsLayer() {
  try {
    console.log("Refreshing neighborhoods layer...");

    // Check if neighborhoods layer exists
    if (typeof window !== 'undefined' && window.neighborhoodsLayer && window.map) {
      // Remove existing layer
      if (window.map.hasLayer(window.neighborhoodsLayer)) {
        window.map.removeLayer(window.neighborhoodsLayer);
        console.log("Removed existing neighborhoods layer");
      }

      // Get updated neighborhoods data
      const neighborhoodsData = getNeighborhoodsData();
      if (neighborhoodsData && neighborhoodsData.features) {
        // Re-create the layer with updated data
        window.neighborhoodsLayer = L.geoJSON(neighborhoodsData, {
          style: window.getNeighborhoodStyle || function (feature) {
            return {
              color: '#1e40af',
              weight: 2,
              fillOpacity: 0.3,
              fillColor: '#3b82f6'
            };
          },
          onEachFeature: window.onEachNeighborhood || function (feature, layer) {
            if (feature.properties && feature.properties.Names) {
              let popupContent = `<strong>${feature.properties.Names}</strong><br>`;

              // Add other properties
              Object.keys(feature.properties).forEach(key => {
                if (key !== 'Names' && feature.properties[key] !== null && feature.properties[key] !== undefined) {
                  popupContent += `${key}: ${feature.properties[key]}<br>`;
                }
              });

              layer.bindPopup(popupContent);
            }
          }
        }).addTo(window.map);

        console.log("Neighborhoods layer refreshed successfully");
      }
    }
  } catch (error) {
    console.error("Error refreshing neighborhoods layer:", error);
  }
}

/**
 * Update column dropdown for styling
 */
function updateColumnDropdown() {
  try {
    console.log("Updating column dropdown...");

    // Check if the populateColumnDropdown function exists
    if (typeof populateColumnDropdown === 'function') {
      populateColumnDropdown();
      console.log("Column dropdown updated");
    } else if (typeof window !== 'undefined' && typeof window.populateColumnDropdown === 'function') {
      window.populateColumnDropdown();
      console.log("Column dropdown updated via window");
    } else {
      console.log("populateColumnDropdown function not found");
    }
  } catch (error) {
    console.error("Error updating column dropdown:", error);
  }
}

/**
 * export a specific layer in the specified format
 * @param {string} layerName - the layer name
 * @param {string} format - the export format
 */
async function exportLayer(layerName, format) {
  // prevent multiple exports
  if (window.exportInProgress) {
    showAlert("جاري تصدير طبقة أخرى، يرجى الانتظار", "info");
    return;
  }

  window.exportInProgress = true;
  showAlert("جاري تصدير الطبقة...", "info");

  try {
    let data = null;
    let fileName = "";

    // Get data for the selected layer
    switch (layerName) {
      case "neighborhoods":
        data = getNeighborhoodsData();
        fileName = `neighborhoods_${formatDate()}`;
        break;

      case "neighborhood-labels":
        data = getNeighborhoodLabelsData();
        fileName = `neighborhood_labels_${formatDate()}`;
        break;

      case "service-sectors":
        // check if the service sectors data is loaded
        if (window.serviceSectorsDataLoaded === false) {
          throw new Error("بيانات دوائر الخدمات لم يتم تحميلها بعد، يرجى المحاولة لاحقاً");
        }
        data = getServiceSectorsData();
        fileName = `service_sectors_${formatDate()}`;
        break;

      case "service-sector-labels":
        // check if the service sectors data is loaded
        if (window.serviceSectorsDataLoaded === false) {
          throw new Error("بيانات دوائر الخدمات لم يتم تحميلها بعد، يرجى المحاولة لاحقاً");
        }
        data = getServiceSectorLabelsData();
        fileName = `service_sector_labels_${formatDate()}`;
        break;

      default:
        throw new Error(`الطبقة "${layerName}" غير مدعومة`);
    }

    if (!data) {
      throw new Error("لا توجد بيانات للطبقة المحددة");
    }

    // export the data in the specified format
    await exportDataInFormat(data, fileName, format);

    showAlert("تم تصدير الطبقة بنجاح", "success");

  } catch (error) {
    console.error("خطأ في تصدير الطبقة:", error);
    showAlert("حدث خطأ أثناء تصدير الطبقة: " + error.message, "error");
  } finally {
    window.exportInProgress = false;
  }
}

/**
 * get the neighborhoods data
 */
function getNeighborhoodsData() {
  console.log("Attempting to get neighborhoods data...");

  let neighborhoodsSource = window.neighborhoodsData || null;

  // Check if window.neighborhoodsData is not available
  if (!neighborhoodsSource && typeof neighborhoodsData !== 'undefined') {
    neighborhoodsSource = neighborhoodsData;
    console.log("Found neighborhoodsData in global scope");
  }

  console.log("Neighborhoods source:", neighborhoodsSource ? "Available" : "Not available");

  if (!neighborhoodsSource) {
    console.error("No neighborhoods data source found");
    throw new Error("بيانات الأحياء غير متوفرة - لم يتم العثور على مصدر البيانات");
  }

  if (!neighborhoodsSource.features) {
    console.error("Neighborhoods data has no features property");
    console.log("Available properties:", Object.keys(neighborhoodsSource));
    throw new Error("بيانات الأحياء غير صالحة - لا تحتوي على خاصية features");
  }

  if (!Array.isArray(neighborhoodsSource.features)) {
    console.error("Features is not an array:", typeof neighborhoodsSource.features);
    throw new Error("بيانات الأحياء غير صالحة - features ليست مصفوفة");
  }

  if (neighborhoodsSource.features.length === 0) {
    console.warn("Neighborhoods data has no features");
    throw new Error("بيانات الأحياء فارغة - لا توجد عناصر للتصدير");
  }

  console.log(`Found ${neighborhoodsSource.features.length} neighborhood features`);
  return neighborhoodsSource;
}

/**
 * get the neighborhoods labels data
 */
function getNeighborhoodLabelsData() {
  const neighborhoodsSource = window.neighborhoodsData ||
    (typeof neighborhoodsData !== 'undefined' ? neighborhoodsData : null);

  if (!neighborhoodsSource || !neighborhoodsSource.features) {
    throw new Error("بيانات الأحياء غير متوفرة لإنشاء المسميات");
  }

  // convert the neighborhoods polygons to points for the labels
  const features = neighborhoodsSource.features.map((feature) => {
    if (!feature.geometry || !feature.geometry.coordinates || !feature.geometry.coordinates[0]) {
      return null;
    }

    const center = calculatePolygonCenter(feature.geometry.coordinates[0]);
    const name = feature.properties.Names ||
      feature.properties.Name_En ||
      feature.properties.name ||
      feature.properties.NAME ||
      "غير معروف";

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [center.lng, center.lat]
      },
      properties: {
        name: name,
        original_id: feature.properties.OBJECTID || feature.properties.id,
        ...feature.properties
      }
    };
  }).filter(f => f !== null);

  return { type: "FeatureCollection", features };
}

/**
 * get the service sectors data
 */
function getServiceSectorsData() {
  // try to get the data from different sources
  let serviceSectorsSource = window.serviceSectorsData ||
    (typeof serviceSectorsData !== 'undefined' ? serviceSectorsData : null);

  // if the data is not available, check if the data is loaded later
  if (!serviceSectorsSource || !serviceSectorsSource.features) {
    console.log("بيانات دوائر الخدمات غير متوفرة، محاولة إعادة التحقق...");

    // check if the service sectors data is loaded
    if (window.serviceSectorsDataLoaded === false) {
      throw new Error("بيانات دوائر الخدمات لم يتم تحميلها بعد، يرجى المحاولة لاحقاً");
    }

    // check if the service sectors data is available in the global scope
    if (typeof serviceSectorsData !== 'undefined') {
      serviceSectorsSource = serviceSectorsData;
      if (serviceSectorsSource && serviceSectorsSource.features) {
        window.serviceSectorsData = serviceSectorsData;
      }
    }
  }

  if (!serviceSectorsSource || !serviceSectorsSource.features) {
    console.error("فشل في العثور على بيانات دوائر الخدمات");
    throw new Error("بيانات دوائر الخدمات غير متوفرة");
  }

  console.log("تم العثور على بيانات دوائر الخدمات:", serviceSectorsSource.features.length, "عنصر");
  return serviceSectorsSource;
}

/**
 * get the service sectors labels data
 */
function getServiceSectorLabelsData() {
  // try to get the data from different sources
  let serviceSectorsSource = window.serviceSectorsData ||
    (typeof serviceSectorsData !== 'undefined' ? serviceSectorsData : null);

  // if the data is not available, check if the data is loaded later
  if (!serviceSectorsSource) {
    console.log("بيانات دوائر الخدمات غير متوفرة لإنشاء المسميات، محاولة إعادة التحقق...");

    // check if the service sectors data is available in the global scope
    if (typeof serviceSectorsData !== 'undefined') {
      serviceSectorsSource = serviceSectorsData;
      window.serviceSectorsData = serviceSectorsData;
    }
  }

  if (!serviceSectorsSource || !serviceSectorsSource.features) {
    console.error("فشل في العثور على بيانات دوائر الخدمات لإنشاء المسميات");
    throw new Error("بيانات دوائر الخدمات غير متوفرة لإنشاء المسميات");
  }

  // convert the service sectors polygons to points for the labels
  const features = serviceSectorsSource.features.map((feature) => {
    if (!feature.geometry || !feature.geometry.coordinates || !feature.geometry.coordinates[0]) {
      return null;
    }

    const center = calculatePolygonCenter(feature.geometry.coordinates[0]);
    const name = feature.properties.Name ||
      feature.properties.Name_En ||
      feature.properties.name ||
      feature.properties.NAME ||
      "غير معروف";

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [center.lng, center.lat]
      },
      properties: {
        name: name,
        name_en: feature.properties.Name_En,
        original_id: feature.properties.OBJECTID || feature.properties.id,
        population: feature.properties.Pop,
        ...feature.properties
      }
    };
  }).filter(f => f !== null);

  return { type: "FeatureCollection", features };
}

/**
 * calculate the center of a polygon
 */
function calculatePolygonCenter(coordinates) {
  let totalLat = 0;
  let totalLng = 0;
  let pointCount = 0;

  coordinates.forEach((coord) => {
    totalLng += coord[0];
    totalLat += coord[1];
    pointCount++;
  });

  return {
    lat: totalLat / pointCount,
    lng: totalLng / pointCount
  };
}

/**
 * export the data in the specified format
 */
async function exportDataInFormat(data, fileName, format) {
  console.log(`Exporting data in format: ${format}`);
  console.log("Data to export:", data);

  let content = "";
  let contentType = "";
  let fileExtension = "";

  try {
    switch (format) {
      case "geojson":
        content = JSON.stringify(data, null, 2);
        contentType = "application/json";
        fileExtension = ".geojson";
        break;

      case "kml":
        content = convertToKML(data);
        contentType = "application/vnd.google-earth.kml+xml";
        fileExtension = ".kml";
        break;

      case "shp":
        await exportAsShapefile(data, fileName);
        return; // the function handles the export itself

      case "csv":
        content = convertToCSV(data);
        contentType = "text/csv";
        fileExtension = ".csv";
        break;

      case "excel":
        exportAsExcel(data, fileName);
        return; // the function handles the export itself

      case "pdf":
        exportAsPDF(data, fileName);
        return; // the function handles the export itself

      default:
        throw new Error(`صيغة التصدير "${format}" غير مدعومة`);
    }

    // تنزيل الملف
    console.log(`Downloading file: ${fileName + fileExtension}`);
    downloadFile(content, fileName + fileExtension, contentType);

  } catch (error) {
    console.error("Error in exportDataInFormat:", error);
    throw error; // Re-throw the error for upper-level handling
  }
}

/**
 * convert GeoJSON to KML
 */
function convertToKML(geoJSON) {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>البيانات المصدرة</name>
    <description>تم التصدير من نظام الأحياء</description>
`;

  geoJSON.features.forEach((feature, index) => {
    const properties = feature.properties;
    const geometry = feature.geometry;

    kml += `    <Placemark>
      <name>${escapeXML(properties.name || properties.Names || properties.Name || `عنصر ${index + 1}`)}</name>
      <description><![CDATA[`;

    // add the element properties
    Object.keys(properties).forEach(key => {
      if (properties[key] !== null && properties[key] !== undefined) {
        kml += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
      }
    });

    kml += `]]></description>`;

    // add the geometry
    if (geometry.type === "Point") {
      kml += `      <Point>
        <coordinates>${geometry.coordinates[0]},${geometry.coordinates[1]},0</coordinates>
      </Point>`;
    } else if (geometry.type === "Polygon") {
      kml += `      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>`;
      geometry.coordinates[0].forEach(coord => {
        kml += `${coord[0]},${coord[1]},0 `;
      });
      kml += `</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>`;
    }

    kml += `    </Placemark>
`;
  });

  kml += `  </Document>
</kml>`;

  return kml;
}

/**
 * convert GeoJSON to CSV
 */
function convertToCSV(geoJSON) {
  console.log("Converting to CSV, input data:", geoJSON);

  if (!geoJSON) {
    console.error("GeoJSON data is null or undefined");
    throw new Error("البيانات المدخلة فارغة");
  }

  if (!geoJSON.features) {
    console.error("GeoJSON has no features property");
    console.log("Available properties:", Object.keys(geoJSON));
    throw new Error("البيانات لا تحتوي على خاصية features");
  }

  if (!Array.isArray(geoJSON.features)) {
    console.error("Features is not an array:", typeof geoJSON.features);
    throw new Error("خاصية features ليست مصفوفة");
  }

  if (!geoJSON.features.length) {
    console.warn("No features to export");
    return "اسم_الحقل\nلا توجد بيانات للتصدير";
  }

  // collect all element properties to create the headers
  const allHeaders = new Set();
  geoJSON.features.forEach(feature => {
    Object.keys(feature.properties).forEach(key => {
      allHeaders.add(key);
    });
  });

  // add the coordinates columns
  const headers = Array.from(allHeaders);
  if (geoJSON.features.some(f => f.geometry && f.geometry.type === "Point")) {
    headers.push("longitude", "latitude");
  }

  // create the header row
  let csv = headers.map(h => `"${h}"`).join(",") + "\n";

  geoJSON.features.forEach(feature => {
    const row = [];

    headers.forEach(header => {
      if (header === "longitude") {
        if (feature.geometry && feature.geometry.type === "Point") {
          row.push(feature.geometry.coordinates[0]);
        } else {
          row.push("");
        }
      } else if (header === "latitude") {
        if (feature.geometry && feature.geometry.type === "Point") {
          row.push(feature.geometry.coordinates[1]);
        } else {
          row.push("");
        }
      } else {
        const value = feature.properties[header] || "";
        row.push(typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value);
      }
    });

    csv += row.join(",") + "\n";
  });

  return csv;
}

/**
 * export as Shapefile
 */
async function exportAsShapefile(geoJSON, fileName) {
  console.log("Attempting to export as Shapefile...");
  console.log("shpwrite library available:", typeof shpwrite !== 'undefined');
  console.log("JSZip library available:", typeof JSZip !== 'undefined');

  // Diagnose library availability
  if (typeof shpwrite === 'undefined') {
    console.error("shpwrite library is not loaded. Check if the script tag is correct:");
    console.error("Expected: https://unpkg.com/@mapbox/shp-write@latest/shpwrite.js");
  } else {
    console.log("shpwrite library details:", {
      hasZipFunction: typeof shpwrite.zip === 'function',
      hasWriteFunction: typeof shpwrite.write === 'function',
      availableMethods: Object.keys(shpwrite),
      version: shpwrite.version || 'unknown'
    });

    // Test shpwrite with a simple feature
    try {
      const testFeature = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [0, 0]
          },
          properties: {
            name: "test"
          }
        }]
      };
      const testResult = shpwrite.zip(testFeature);
      const testSize = testResult ? (testResult.byteLength || testResult.length || 0) : 0;
      console.log("shpwrite test result size:", testSize);

      if (testSize === 0) {
        console.warn("⚠️ shpwrite library test returned 0 bytes - library may be broken");
        console.log("Will attempt manual shapefile creation if main export fails");
      } else {
        console.log("✅ shpwrite library test passed");
      }
    } catch (testError) {
      console.error("❌ shpwrite test failed:", testError.message);
      console.log("Will use fallback methods for shapefile export");
    }
  }

  if (typeof JSZip === 'undefined') {
    console.error("JSZip library is not loaded. Check if the script tag is correct:");
    console.error("Expected: https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
  }

  try {
    // check if the shp-write library is available
    if (typeof shpwrite === 'undefined') {
      console.warn("shp-write library not available, falling back to GeoJSON in ZIP");

      // use a fallback method - convert to compressed GeoJSON
      const content = JSON.stringify(geoJSON, null, 2);

      // Check if JSZip is available
      if (typeof JSZip === 'undefined') {
        console.error("JSZip library not available either, exporting as plain GeoJSON");
        downloadFile(content, fileName + ".geojson", "application/json");
        showAlert("تم التصدير كـ GeoJSON (مكتبة Shapefile غير متوفرة)", "warning");
        return;
      }

      const zip = new JSZip();
      zip.file(fileName + ".geojson", content);
      zip.file("README.txt",
        "هذا ملف GeoJSON بدلاً من Shapefile لأن مكتبة shp-write غير متوفرة.\n" +
        "يمكنك تحويل ملف GeoJSON إلى Shapefile باستخدام برامج GIS مثل QGIS أو ArcGIS.\n" +
        "Date: " + new Date().toLocaleString('ar-SY')
      );

      zip.generateAsync({ type: "blob" }).then(function (content) {
        downloadFile(content, fileName + "_geojson.zip", "application/zip");
        showAlert("تم التصدير كـ GeoJSON مضغوط (مكتبة Shapefile غير متوفرة)", "warning");
      }).catch(function (error) {
        console.error("Error creating ZIP file:", error);
        downloadFile(JSON.stringify(geoJSON, null, 2), fileName + ".geojson", "application/json");
        showAlert("تم التصدير كـ GeoJSON عادي", "warning");
      });
      return;
    }

    console.log("Using shp-write library to create Shapefile...");
    console.log("Input GeoJSON:", geoJSON);

    // Validate input data
    if (!geoJSON || !geoJSON.features || geoJSON.features.length === 0) {
      throw new Error("لا توجد بيانات للتصدير");
    }

    // Clean and validate the data for shp-write
    console.log("Original data validation:");
    console.log("- Feature count:", geoJSON.features.length);
    console.log("- Geometry types:", [...new Set(geoJSON.features.map(f => f.geometry?.type))]);
    console.log("- Sample properties:", Object.keys(geoJSON.features[0]?.properties || {}));

    const cleanedGeoJSON = {
      type: "FeatureCollection",
      features: geoJSON.features.map((feature, index) => {
        // Validate geometry
        if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
          console.warn(`Feature ${index} has invalid geometry:`, feature.geometry);
          return null;
        }

        // Clean properties for shapefile compatibility
        const properties = {};
        if (feature.properties) {
          Object.keys(feature.properties).forEach(key => {
            const value = feature.properties[key];
            // Shapefile field name restrictions
            let cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 10);
            if (!cleanKey || cleanKey[0].match(/[0-9]/)) {
              cleanKey = 'F_' + cleanKey.substring(0, 8);
            }

            // Convert to valid types for shapefile
            if (value !== null && value !== undefined) {
              if (typeof value === 'boolean') {
                properties[cleanKey] = value ? 'true' : 'false';
              } else if (typeof value === 'number') {
                properties[cleanKey] = isNaN(value) ? '0' : value;
              } else if (typeof value === 'object') {
                properties[cleanKey] = JSON.stringify(value).substring(0, 254);
              } else {
                properties[cleanKey] = String(value).substring(0, 254);
              }
            } else {
              properties[cleanKey] = '';
            }
          });
        }

        // Ensure at least one property exists
        if (Object.keys(properties).length === 0) {
          properties.ID = index + 1;
        }

        return {
          type: "Feature",
          geometry: feature.geometry,
          properties: properties
        };
      }).filter(f => f !== null)
    };

    console.log("Cleaned data validation:");
    console.log("- Valid features:", cleanedGeoJSON.features.length);
    console.log("- Sample cleaned properties:", Object.keys(cleanedGeoJSON.features[0]?.properties || {}));

    console.log("Cleaned GeoJSON for shapefile:", cleanedGeoJSON);

    // Use shp-write with better options
    const options = {
      folder: fileName,
      types: {
        point: 'points',
        polygon: 'polygons',
        polyline: 'lines'
      }
    };

    console.log("Calling shpwrite.zip with options:", options);

    // Try different approaches for creating shapefile
    let zipBuffer;

    try {
      // Method 1: Standard zip function
      zipBuffer = shpwrite.zip(cleanedGeoJSON, options);
    } catch (zipError) {
      console.warn("Standard zip method failed, trying alternative:", zipError.message);

      try {
        // Method 2: Try without options
        zipBuffer = shpwrite.zip(cleanedGeoJSON);
      } catch (simpleZipError) {
        console.warn("Simple zip method failed, trying write method:", simpleZipError.message);

        try {
          // Method 3: Try write method if available
          if (typeof shpwrite.write === 'function') {
            const shapefiles = shpwrite.write(cleanedGeoJSON);
            console.log("Write method produced:", Object.keys(shapefiles));

            // Create ZIP manually using JSZip
            if (typeof JSZip !== 'undefined') {
              const zip = new JSZip();
              Object.keys(shapefiles).forEach(fileName => {
                zip.file(fileName, shapefiles[fileName]);
              });
              zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
            } else {
              throw new Error("JSZip not available for manual ZIP creation");
            }
          } else {
            throw new Error("No alternative write method available");
          }
        } catch (writeError) {
          console.error("All shapefile creation methods failed:", writeError.message);
          throw new Error("فشل في إنشاء Shapefile بجميع الطرق المتاحة");
        }
      }
    }

    console.log("Shapefile created, buffer type:", typeof zipBuffer);
    console.log("Buffer size:", zipBuffer.byteLength || zipBuffer.length || 'unknown');

    // Check the produced file size and content
    if (!zipBuffer) {
      throw new Error("فشل في إنتاج ملف Shapefile - المخرج فارغ");
    }

    const bufferSize = zipBuffer.byteLength || zipBuffer.length || 0;
    console.log(`Produced shapefile size: ${bufferSize} bytes`);

    if (bufferSize < 100) {
      console.error("Shapefile output is too small:", bufferSize, "bytes");
      console.error("Input data summary:", {
        featureCount: cleanedGeoJSON.features.length,
        firstFeature: cleanedGeoJSON.features[0],
        geometryTypes: [...new Set(cleanedGeoJSON.features.map(f => f.geometry?.type))]
      });

      // Try to create a better shapefile manually
      console.log("Attempting manual shapefile creation...");
      try {
        const manualShapefile = await createManualShapefile(cleanedGeoJSON, fileName);
        if (manualShapefile && manualShapefile.byteLength > 100) {
          console.log("Manual shapefile creation successful:", manualShapefile.byteLength, "bytes");
          downloadFile(manualShapefile, fileName + ".zip", "application/zip");
          showAlert("تم تصدير الملف كـ Shapefile (طريقة بديلة)", "success");
          return;
        }
      } catch (manualError) {
        console.error("Manual shapefile creation failed:", manualError.message);
      }

      throw new Error(
        `⚠️ مكتبة shp-write تُنتج ملفات فارغة (${bufferSize} بايت)\n\n` +
        `📊 تفاصيل البيانات:\n` +
        `• عدد العناصر: ${cleanedGeoJSON.features.length}\n` +
        `• أنواع الهندسة: ${[...new Set(cleanedGeoJSON.features.map(f => f.geometry?.type))].join(', ')}\n` +
        `• خصائص متاحة: ${Object.keys(cleanedGeoJSON.features[0]?.properties || {}).length}\n\n` +
        `🔍 الأسباب المحتملة:\n` +
        `1. مكتبة @mapbox/shp-write معطلة أو قديمة\n` +
        `2. تضارب مع مكتبات أخرى (JSZip, etc.)\n` +
        `3. مشكلة في تنظيف البيانات للـ Shapefile\n` +
        `4. قيود المتصفح على إنشاء ملفات ZIP\n\n` +
        `💡 الحل: سيتم إنشاء حزمة تحويل شاملة بدلاً من ذلك`
      );
    }

    if (bufferSize < 500) {
      console.warn("Shapefile output is suspiciously small, but proceeding...");
    }

    downloadFile(zipBuffer, fileName + ".zip", "application/zip");

    console.log("Shapefile export completed successfully");
    showAlert("تم تصدير الملف كـ Shapefile بنجاح", "success");

  } catch (error) {
    console.error("خطأ في تصدير Shapefile:", error.message);

    // Create a comprehensive fallback package
    try {
      const zip = new JSZip();

      // Add GeoJSON file
      zip.file(`${fileName}.geojson`, JSON.stringify(geoJSON, null, 2));

      // Add CSV file if possible
      try {
        const csvContent = convertToCSV(geoJSON);
        zip.file(`${fileName}.csv`, csvContent);
      } catch (csvError) {
        console.warn("Could not create CSV in fallback:", csvError.message);
      }

      // Add detailed instructions
      const instructionsArabic = `⚠️ هذا ليس ملف Shapefile - حزمة تحويل بديلة ⚠️
================================================================

سبب إنشاء هذه الحزمة:
فشل في تصدير Shapefile مباشرة: ${error.message}

🚨 تنبيه مهم: هذا الأرشيف لا يحتوي على ملفات Shapefile حقيقية!

الملفات المضمنة في هذا الأرشيف:
- ${fileName}.geojson: البيانات الأصلية بصيغة GeoJSON
- ${fileName}.csv: البيانات في جدول (إن أمكن)
- instructions.txt: دليل التحويل باللغة الإنجليزية

طرق تحويل GeoJSON إلى Shapefile:

الطريقة الأولى - QGIS (الأفضل والمجاني):
1. حمل برنامج QGIS من qgis.org
2. افتح البرنامج
3. اسحب ملف ${fileName}.geojson إلى نافذة الخريطة
4. انقر بالزر الأيمن على اسم الطبقة في قائمة الطبقات
5. اختر "Export" ثم "Save Features As"
6. اختر "ESRI Shapefile" كصيغة الحفظ
7. حدد مكان الحفظ واضغط "OK"

الطريقة الثانية - أدوات أونلاين:
1. mapshaper.org (الأفضل)
   - اذهب إلى الموقع
   - اسحب ملف .geojson إلى الصفحة
   - اضغط "Export" واختر "Shapefile"

2. mygeodata.cloud
3. convertio.co

الطريقة الثالثة - سطر الأوامر (للمطورين):
ogr2ogr -f "ESRI Shapefile" output.shp ${fileName}.geojson

تاريخ المحاولة: ${new Date().toLocaleString('ar-SY')}
عدد العناصر: ${geoJSON.features.length}
أنواع الهندسة: ${[...new Set(geoJSON.features.map(f => f.geometry?.type))].join(', ')}
`;

      const instructionsEnglish = `Shapefile Export Failed - Alternative Solutions Guide
==================================================

Error Details:
${error.message}

Files included in this archive:
- ${fileName}.geojson: Original data in GeoJSON format
- ${fileName}.csv: Tabular data (if available)

How to convert GeoJSON to Shapefile:

Method 1 - QGIS (Recommended, Free):
1. Download QGIS from qgis.org
2. Open QGIS
3. Drag ${fileName}.geojson into the map window
4. Right-click the layer name in the Layers panel
5. Choose "Export" > "Save Features As"
6. Select "ESRI Shapefile" as format
7. Choose output location and click "OK"

Method 2 - Online Tools:
1. mapshaper.org (Best option)
   - Go to the website
   - Drag the .geojson file onto the page
   - Click "Export" and choose "Shapefile"

2. mygeodata.cloud
3. convertio.co

Method 3 - Command Line (Advanced):
ogr2ogr -f "ESRI Shapefile" output.shp ${fileName}.geojson

Export attempt: ${new Date().toLocaleString()}
Feature count: ${geoJSON.features.length}
Geometry types: ${[...new Set(geoJSON.features.map(f => f.geometry?.type))].join(', ')}
Properties: ${Object.keys(geoJSON.features[0]?.properties || {}).slice(0, 5).join(', ')}${Object.keys(geoJSON.features[0]?.properties || {}).length > 5 ? '...' : ''}
`;

      zip.file("تعليمات_التحويل.txt", instructionsArabic);
      zip.file("instructions.txt", instructionsEnglish);

      // Generate and download the ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadFile(zipBlob, fileName + "_conversion_package.zip", "application/zip");

      // Ask user what they prefer
      const userChoice = confirm(
        `فشل تصدير Shapefile مباشرة.\n\n` +
        `الخيارات المتاحة:\n` +
        `• اضغط "موافق" لتحميل GeoJSON فقط (أسرع)\n` +
        `• اضغط "إلغاء" لتحميل حزمة تحويل كاملة مع التعليمات\n\n` +
        `ملاحظة: يمكنك تحويل GeoJSON إلى Shapefile باستخدام QGIS أو mapshaper.org`
      );

      if (userChoice) {
        // User wants GeoJSON only
        const geoJSONString = JSON.stringify(geoJSON, null, 2);
        const geoJSONBlob = new Blob([geoJSONString], { type: 'application/json' });
        downloadFile(geoJSONBlob, fileName + ".geojson", "application/json");

        showAlert(
          `تم تصدير البيانات كـ GeoJSON\n\n` +
          `لتحويلها إلى Shapefile:\n` +
          `• استخدم QGIS (مجاني): qgis.org\n` +
          `• أو موقع mapshaper.org\n` +
          `• أو أدوات التحويل الأونلاين الأخرى`,
          "info"
        );
      } else {
        // User wants full conversion package
        downloadFile(zipBlob, fileName + "_NOT_SHAPEFILE_conversion_package.zip", "application/zip");

        showAlert(
          `تم إنشاء حزمة تحويل شاملة\n\n` +
          `تحتوي على:\n` +
          `• ملف GeoJSON للبيانات\n` +
          `• ملف CSV للجدول\n` +
          `• تعليمات مفصلة للتحويل\n\n` +
          `استخدم برنامج QGIS (مجاني) أو موقع mapshaper.org لتحويل البيانات إلى Shapefile`,
          "warning"
        );
      }

    } catch (fallbackError) {
      console.error("Failed to create fallback package:", fallbackError.message);

      // Last resort: just export GeoJSON
      const geoJSONString = JSON.stringify(geoJSON, null, 2);
      const geoJSONBlob = new Blob([geoJSONString], { type: 'application/json' });
      downloadFile(geoJSONBlob, fileName + ".geojson", "application/json");

      showAlert(
        `فشل تصدير Shapefile: ${error.message}\n\n` +
        `تم تصدير البيانات كـ GeoJSON.\n` +
        `للتحويل إلى Shapefile استخدم QGIS أو mapshaper.org`,
        "error"
      );
    }
  }
}

/**
 * Create shapefile manually using JSZip when shp-write fails
 * @param {Object} geoJSON - the GeoJSON data
 * @param {string} fileName - the file name
 * @returns {Promise<ArrayBuffer>} ZIP file buffer
 */
async function createManualShapefile(geoJSON, fileName) {
  console.log("Creating manual shapefile...");

  if (typeof JSZip === 'undefined') {
    throw new Error("JSZip library not available for manual creation");
  }

  try {
    const zip = new JSZip();

    // Create a comprehensive README with conversion instructions
    const readmeContent = `تم إنشاء هذا الأرشيف بدلاً من Shapefile بسبب مشكلة في مكتبة التصدير.

الملفات المضمنة:
- ${fileName}.geojson: البيانات بصيغة GeoJSON
- ${fileName}.csv: البيانات بصيغة جدول
- conversion_guide.txt: دليل التحويل لـ Shapefile

تاريخ الإنشاء: ${new Date().toLocaleString('ar-SY')}
عدد العناصر: ${geoJSON.features.length}
أنواع الهندسة: ${[...new Set(geoJSON.features.map(f => f.geometry?.type))].join(', ')}

لتحويل هذه البيانات إلى Shapefile:
1. استخدم برنامج QGIS (مجاني):
   - افتح QGIS
   - اسحب ملف .geojson إلى الخريطة
   - انقر بالزر الأيمن على الطبقة > Export > Save Features As
   - اختر "ESRI Shapefile" كصيغة التصدير

2. استخدم أدوات أونلاين:
   - mapshaper.org
   - mygeodata.cloud
   - convertio.co

3. استخدم أدوات سطر الأوامر:
   - ogr2ogr (من GDAL)
   - الأمر: ogr2ogr -f "ESRI Shapefile" output.shp input.geojson
`;

    // Add the main files
    zip.file("README.txt", readmeContent);
    zip.file(`${fileName}.geojson`, JSON.stringify(geoJSON, null, 2));

    // Create CSV version
    try {
      const csvContent = convertToCSV(geoJSON);
      zip.file(`${fileName}.csv`, csvContent);
    } catch (csvError) {
      console.warn("Could not create CSV version:", csvError.message);
    }

    // Create conversion guide
    const conversionGuide = `Shapefile Conversion Guide
========================

This archive contains geographic data that should be converted to Shapefile format.

Files included:
- ${fileName}.geojson (Main data file)
- ${fileName}.csv (Tabular data)

Recommended conversion methods:

1. QGIS (Free, recommended):
   - Download from qgis.org
   - Open QGIS
   - Drag the .geojson file into the map
   - Right-click the layer > Export > Save Features As
   - Choose "ESRI Shapefile" as format
   - Set output location and click OK

2. Online converters:
   - mapshaper.org (drag and drop, then export)
   - mygeodata.cloud
   - convertio.co

3. Command line (GDAL):
   ogr2ogr -f "ESRI Shapefile" output.shp ${fileName}.geojson

Data summary:
- Features: ${geoJSON.features.length}
- Geometry types: ${[...new Set(geoJSON.features.map(f => f.geometry?.type))].join(', ')}
- Properties: ${Object.keys(geoJSON.features[0]?.properties || {}).join(', ')}

For technical support, please refer to the original data source.
`;

    zip.file("conversion_guide.txt", conversionGuide);

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    console.log("Manual shapefile package created:", zipBuffer.byteLength, "bytes");
    return zipBuffer;

  } catch (error) {
    console.error("Error creating manual shapefile:", error);
    throw new Error(`فشل في إنشاء حزمة بديلة: ${error.message}`);
  }
}

/**
 * export as Excel
 */
function exportAsExcel(geoJSON, fileName) {
  try {
    // check if the XLSX library is available
    if (typeof XLSX === 'undefined') {
      // export as CSV instead
      const csvContent = convertToCSV(geoJSON);
      downloadFile(csvContent, fileName + ".csv", "text/csv");
      showAlert("تم التصدير كـ CSV بدلاً من Excel", "warning");
      return;
    }

    // convert GeoJSON to Excel format
    const worksheet_data = [];

    // add the headers
    if (geoJSON.features.length > 0) {
      const headers = Object.keys(geoJSON.features[0].properties);
      if (geoJSON.features[0].geometry && geoJSON.features[0].geometry.type === "Point") {
        headers.push("longitude", "latitude");
      }
      worksheet_data.push(headers);

      // add the data
      geoJSON.features.forEach(feature => {
        const row = [];
        Object.keys(feature.properties).forEach(key => {
          row.push(feature.properties[key]);
        });

        if (feature.geometry && feature.geometry.type === "Point") {
          row.push(feature.geometry.coordinates[0]);
          row.push(feature.geometry.coordinates[1]);
        }

        worksheet_data.push(row);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(worksheet_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");

    XLSX.writeFile(wb, fileName + ".xlsx");

  } catch (error) {
    console.error("خطأ في تصدير Excel:", error);
    // export as CSV instead
    const csvContent = convertToCSV(geoJSON);
    downloadFile(csvContent, fileName + ".csv", "text/csv");
    showAlert("تم التصدير كـ CSV بدلاً من Excel", "warning");
  }
}

/**
 * export as PDF (map)
 */
function exportAsPDF(geoJSON, fileName) {
  try {
    // check if the jsPDF library is available
    if (typeof jsPDF === 'undefined') {
      showAlert("مكتبة PDF غير متوفرة، سيتم تصدير كـ GeoJSON", "warning");
      const content = JSON.stringify(geoJSON, null, 2);
      downloadFile(content, fileName + ".geojson", "application/json");
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');

    // set the Arabic font if available
    doc.setFont('Arial', 'normal');

    // map title
    doc.setFontSize(16);
    doc.text('خريطة البيانات المصدرة', 15, 20);

    // basic information
    doc.setFontSize(12);
    doc.text(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-SY')}`, 15, 30);
    doc.text(`عدد العناصر: ${geoJSON.features.length}`, 15, 40);

    // draw a simple map if the data contains coordinates
    if (geoJSON.features.length > 0 && geoJSON.features[0].geometry) {
      drawSimpleMap(doc, geoJSON, 15, 50, 260, 150);
    }

    // data table
    let yPosition = 210;
    doc.setFontSize(10);

    geoJSON.features.slice(0, 10).forEach((feature, index) => {
      if (yPosition > 280) return; // avoid exceeding the page boundaries

      const name = feature.properties.name ||
        feature.properties.Names ||
        feature.properties.Name ||
        `عنصر ${index + 1}`;

      doc.text(`${index + 1}. ${name}`, 15, yPosition);
      yPosition += 5;
    });

    if (geoJSON.features.length > 10) {
      doc.text(`... و ${geoJSON.features.length - 10} عنصر آخر`, 15, yPosition);
    }

    doc.save(fileName + '.pdf');

  } catch (error) {
    console.error("خطأ في تصدير PDF:", error);
    showAlert("حدث خطأ في تصدير PDF، سيتم تصدير كـ GeoJSON", "warning");
    const content = JSON.stringify(geoJSON, null, 2);
    downloadFile(content, fileName + ".geojson", "application/json");
  }
}

/**
 * draw a simple map in PDF
 */
function drawSimpleMap(doc, geoJSON, x, y, width, height) {
  try {
    // calculate the data boundaries
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    geoJSON.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        } else if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach(coord => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          });
        }
      }
    });

    // draw the map frame
    doc.rect(x, y, width, height);

    // draw the elements
    geoJSON.features.forEach(feature => {
      if (feature.geometry) {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          const screenX = x + ((lng - minLng) / (maxLng - minLng)) * width;
          const screenY = y + height - ((lat - minLat) / (maxLat - minLat)) * height;
          doc.circle(screenX, screenY, 1, 'F');
        }
      }
    });

  } catch (error) {
    console.error("خطأ في رسم الخريطة:", error);
  }
}

/**
 * download a file
 */
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * format the date
 */
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * escape special characters in XML
 */
function escapeXML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * show an alert to the user
 */
function showAlert(message, type = "info") {
  // use the existing notification system or a regular alert
  if (typeof showNotification === 'function') {
    showNotification(message, type);
  } else {
    alert(message);
  }
  console.log(`${type.toUpperCase()}: ${message}`);
}

/**
 * add an imported layer to the layers list
 * @param {string} layerName - the layer name
 * @param {Object} layer - the layer object
 */
function addImportedLayerToList(layerName, layer) {
  console.log("addImportedLayerToList called with:", layerName);

  // get the layers list from the sidebar
  const layersList = document.getElementById("layersList");
  if (!layersList) {
    console.warn("لم يتم العثور على قائمة الطبقات - Element 'layersList' not found");
    // Try alternative locations
    const leftSidebar = document.getElementById("leftSidebar");
    if (leftSidebar) {
      console.log("Found leftSidebar, but no layersList inside");
    }
    return;
  }

  console.log("Found layersList element, proceeding with layer addition");

  // create a unique identifier for the layer
  const layerId = "imported-layer-" + Date.now();

  // save the layer in a global variable for later access
  window.importedLayers = window.importedLayers || {};
  window.importedLayers[layerId] = layer;

  // create an HTML element for the imported layer
  const layerItem = document.createElement("div");
  layerItem.className = "layer-item imported-layer";
  layerItem.innerHTML = `
    <div class="layer-toggle">
      <input type="checkbox" id="${layerId}" checked>
      <label for="${layerId}">${layerName} (مستورد)</label>
    </div>
    <div class="layer-actions">
      <button class="layer-action-btn" data-action="zoom" data-layer="${layerId}">
        <i class="fas fa-search-plus"></i>
      </button>
      <button class="layer-action-btn" data-action="remove" data-layer="${layerId}">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `;

  // add the element to the list
  layersList.appendChild(layerItem);
  console.log("Layer item added to DOM, layersList children count:", layersList.children.length);

  // add event listeners for the layer
  const checkbox = layerItem.querySelector(`#${layerId}`);
  if (checkbox) {
    checkbox.addEventListener("change", function () {
      toggleImportedLayer(layerId, this.checked);
    });
  }

  // zoom button
  const zoomBtn = layerItem.querySelector('[data-action="zoom"]');
  if (zoomBtn) {
    zoomBtn.addEventListener("click", function () {
      zoomToImportedLayer(layerId);
    });
  }

  // delete button
  const removeBtn = layerItem.querySelector('[data-action="remove"]');
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      removeImportedLayer(layerId, layerItem);
      // remove the layer from the export list
      const exportLayerSelect = document.getElementById("exportLayerSelect");
      if (exportLayerSelect) {
        const opt = exportLayerSelect.querySelector(
          `option[value="${layerId}"]`
        );
        if (opt) exportLayerSelect.removeChild(opt);
      }
    });
  }

  // add the layer to the export list
  const exportLayerSelect = document.getElementById("exportLayerSelect");
  if (exportLayerSelect) {
    // check if the option already exists
    if (!exportLayerSelect.querySelector(`option[value="${layerId}"]`)) {
      const opt = document.createElement("option");
      opt.value = layerId;
      opt.textContent = `${layerName} (مستورد)`;
      exportLayerSelect.appendChild(opt);
    }
  }

  console.log("addImportedLayerToList completed successfully for:", layerName);
}

/**
 * toggle the visibility of the imported layer
 * @param {string} layerId - the layer id
 * @param {boolean} visible - the visibility state
 */
function toggleImportedLayer(layerId, visible) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer || !window.map) return;

  if (visible) {
    if (!window.map.hasLayer(layer)) {
      window.map.addLayer(layer);
    }
  } else {
    if (window.map.hasLayer(layer)) {
      window.map.removeLayer(layer);
    }
  }
}

/**
 * zoom to the imported layer
 * @param {string} layerId - the layer id
 */
function zoomToImportedLayer(layerId) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer || !window.map) return;

  if (layer.getBounds) {
    window.map.fitBounds(layer.getBounds());
  }
}

/**
 * delete the imported layer
 * @param {string} layerId - the layer id
 * @param {HTMLElement} layerItem - the layer element
 */
function removeImportedLayer(layerId, layerItem) {
  const layer = window.importedLayers && window.importedLayers[layerId];
  if (!layer) return;

  // remove the layer from the map
  if (window.map && window.map.hasLayer && window.map.hasLayer(layer)) {
    window.map.removeLayer(layer);
  }

  // delete the layer from the object
  delete window.importedLayers[layerId];

  // remove the element from the list
  if (layerItem && layerItem.parentNode) {
    layerItem.parentNode.removeChild(layerItem);
  }
}

/**
 * Create a test CSV file for debugging
 */
function createTestCSV() {
  const csvContent = `name,longitude,latitude,description
Point 1,37.1343,36.2021,Test point in Aleppo
Point 2,37.1400,36.2100,Another test point
Point 3,37.1200,36.1950,Third test point`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'test_points.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log("Test CSV file created and downloaded");
}

// export the functions for global use
window.exportLayer = exportLayer;
window.initImportExport = initImportExport;
window.addImportedLayerToList = addImportedLayerToList;
window.toggleImportedLayer = toggleImportedLayer;
window.zoomToImportedLayer = zoomToImportedLayer;
window.removeImportedLayer = removeImportedLayer;
window.initializeImport = initializeImport;
window.createTestCSV = createTestCSV;

console.log("تم تحميل وحدة الاستيراد والتصدير بنجاح");
