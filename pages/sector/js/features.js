/**
 * features.js
 * advanced map functions: query builder, print map
 * (export and import functions are in import-export.js)
 */

// Query Builder functionality
// This function is now handled by query.js - removed to avoid conflicts
function initializeQueryBuilder() {
  console.log("Query builder initialization is handled by query.js");
  // No longer needed here - query.js handles all query builder functionality
}

// showValueList function is now handled by query.js - removed to avoid conflicts

// Print Map functionality
function initializePrintMap() {
  const printBtn = document.getElementById("printMapBtn");
  if (!printBtn) return;

  printBtn.addEventListener("click", function () {
    // create a print dialog
    const printDialog = document.createElement("div");
    printDialog.className = "print-dialog";
    printDialog.innerHTML = `
            <div class="print-dialog-content">
                <h3>خيارات الطباعة والتصدير</h3>
                <div class="print-options">
                    <div class="print-option">
                        <label>حجم الورق (للطباعة PDF):</label>
                        <select id="paperSize">
                            <option value="a4">A4</option>
                            <option value="a3">A3</option>
                            <option value="a2">A2</option>
                        </select>
                    </div>
                    <div class="print-option">
                        <label>الاتجاه:</label>
                        <select id="orientation">
                            <option value="portrait">عمودي</option>
                            <option value="landscape">أفقي</option>
                        </select>
                    </div>
                </div>
                <div class="print-actions">
                    <button id="printCancelBtn" class="print-cancel-btn">إلغاء</button>
                    <button id="exportImageBtn" class="print-confirm-btn">تصدير كصورة</button>
                    <button id="exportPdfBtn" class="print-confirm-btn">تصدير كـ PDF</button>
                </div>
            </div>
        `;

    // add the dialog to the page
    document.body.appendChild(printDialog);

    // add the styles
    const style = document.createElement("style");
    style.textContent = `
            .print-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .print-dialog-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                min-width: 300px;
            }
            .print-options {
                margin: 15px 0;
            }
            .print-option {
                margin: 10px 0;
            }
            .print-option label {
                display: block;
                margin-bottom: 5px;
            }
            .print-option select {
                width: 100%;
                padding: 5px;
            }
            .print-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            .print-cancel-btn, .print-confirm-btn {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .print-cancel-btn {
                background: #e0e0e0;
            }
            .print-confirm-btn {
                background: #2196f3;
                color: white;
            }
            @media print {
                .print-dialog {
                    display: none;
                }
            }
        `;
    document.head.appendChild(style);

    // close the dialog
    document.getElementById("printCancelBtn").addEventListener("click", () => {
      document.body.removeChild(printDialog);
      document.head.removeChild(style);
    });

    // export as image
    document
      .getElementById("exportImageBtn")
      .addEventListener("click", async () => {
        const mapElement = document.getElementById("map");
        if (!mapElement) return;
        printDialog.querySelector(".print-actions").style.pointerEvents =
          "none";
        printDialog.querySelector(".print-actions").style.opacity = "0.6";
        try {
          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            backgroundColor: null,
          });
          const imgData = canvas.toDataURL("image/png");
          // create a download link
          const a = document.createElement("a");
          a.href = imgData;
          a.download = "map-export.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (err) {
          alert("حدث خطأ أثناء تصدير الصورة: " + err.message);
        }
        printDialog.querySelector(".print-actions").style.pointerEvents = "";
        printDialog.querySelector(".print-actions").style.opacity = "";
      });

    // export as PDF
    document
      .getElementById("exportPdfBtn")
      .addEventListener("click", async () => {
        const mapElement = document.getElementById("map");
        if (!mapElement) return;
        const paperSize = document.getElementById("paperSize").value;
        const orientation = document.getElementById("orientation").value;
        printDialog.querySelector(".print-actions").style.pointerEvents =
          "none";
        printDialog.querySelector(".print-actions").style.opacity = "0.6";
        try {
          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            backgroundColor: null,
          });
          const imgData = canvas.toDataURL("image/png");
          // setup PDF
          const { jsPDF } = window.jspdf;
          let pdf;
          let widthMM, heightMM;
          switch (paperSize) {
            case "a3":
              widthMM = 297;
              heightMM = 420;
              break;
            case "a2":
              widthMM = 420;
              heightMM = 594;
              break;
            default:
              widthMM = 210;
              heightMM = 297; // A4
          }
          if (orientation === "landscape") {
            [widthMM, heightMM] = [heightMM, widthMM];
          }
          pdf = new jsPDF({
            orientation,
            unit: "mm",
            format: [widthMM, heightMM],
          });
          // calculate the image dimensions inside the PDF
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          // make the image cover the entire page
          pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
          pdf.save("map-export.pdf");
        } catch (err) {
          alert("حدث خطأ أثناء تصدير PDF: " + err.message);
        }
        printDialog.querySelector(".print-actions").style.pointerEvents = "";
        printDialog.querySelector(".print-actions").style.opacity = "";
      });
  });
}

// Initialize all features when document is loaded
function initializeAllFeatures() {
  console.log("Initializing all features...");
  try {
    initializeQueryBuilder();
    initializePrintMap();
    console.log("All features initialized successfully");
  } catch (error) {
    console.error("Error initializing features:", error);
  }
}

// Wait for both DOM and all resources to be loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAllFeatures);
} else {
  initializeAllFeatures();
}


