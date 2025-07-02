/**
 * file for formatting the info-panel
 * it converts the lines to a table with two columns
 */

// execute the code when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  // modify the way the info-panel content is displayed
  setupInfoPanelFormatter();

  // format the info-panel buttons
  formatInfoPanelButtons();

  // add a watcher for changes in the info-panel to format the buttons when it is opened
  const infoPanel = document.getElementById("info-panel");
  if (infoPanel) {
    const observer = new MutationObserver(function (mutations) {
      formatInfoPanelButtons();
    });

    observer.observe(infoPanel, {
      attributes: true,
      attributeFilter: ["class", "style"],
      childList: false,
    });
  }
});

/**
 * setup the info-panel formatter
 */
function setupInfoPanelFormatter() {
  // watch for changes in the info-panel
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "childList" &&
        mutation.target.id === "info-content"
      ) {
        // convert the lines to a table
        convertParagraphsToTable(mutation.target);
      }
    });
  });

  // start watching the info-content element
  const infoContent = document.getElementById("info-content");
  if (infoContent) {
    observer.observe(infoContent, { childList: true, subtree: true });
  }
}

/**
 * convert the paragraphs to a table
 * @param {HTMLElement} contentElement - the content element
 */
function convertParagraphsToTable(contentElement) {
  // find all the paragraphs in the content
  const paragraphs = contentElement.querySelectorAll("p");

  // ignore the conversion if there are no paragraphs
  if (paragraphs.length === 0) return;

  // create a new table
  const table = document.createElement("table");
  table.className = "info-table";

  // track the paragraphs that have been converted
  const processedParagraphs = [];

  // add rows to the table from the paragraphs
  paragraphs.forEach(function (paragraph) {
    // ignore the paragraphs that contain other elements like ul, div, table
    if (paragraph.querySelector("ul, div, table")) {
      return;
    }

    // extract the identifier and value from the paragraph
    const strong = paragraph.querySelector("strong");
    if (!strong) return;

    // create a new row
    const row = document.createElement("tr");

    // create a cell for the identifier
    const labelCell = document.createElement("td");
    labelCell.textContent = strong.textContent.replace(":", "");

    // create a cell for the value
    const valueCell = document.createElement("td");

    // copy the content of the paragraph after the strong element
    let valueContent = "";
    let currentNode = strong.nextSibling;

    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        valueContent += currentNode.textContent;
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        valueContent += currentNode.outerHTML;
      }
      currentNode = currentNode.nextSibling;
    }

    // clean the text from extra spaces
    valueContent = valueContent.trim();

    // add the content to the value cell
    valueCell.innerHTML = valueContent;

    // add the cells to the row
    row.appendChild(labelCell);
    row.appendChild(valueCell);

    // add the row to the table
    table.appendChild(row);

    // add the paragraph to the processed paragraphs list
    processedParagraphs.push(paragraph);
  });

  // add the table to the content before the first paragraph if there are rows
  if (table.rows.length > 0) {
    contentElement.insertBefore(table, paragraphs[0]);

    // hide the original paragraphs that have been converted
    processedParagraphs.forEach((paragraph) => {
      paragraph.style.display = "none";
    });
  }

  // process the other elements in the content
  processOtherElements(contentElement);
}

/**
 * process the other elements in the content
 * @param {HTMLElement} contentElement - the content element
 */
function processOtherElements(contentElement) {
  // process the div elements that contain information
  const divs = contentElement.querySelectorAll("div.futuristic-panel");

  divs.forEach((div) => {
    // find the paragraphs inside the div
    const divParagraphs = div.querySelectorAll("p");
    if (divParagraphs.length === 0) return;

    // create a new table
    const table = document.createElement("table");
    table.className = "info-table";

    // convert the paragraphs to rows in the table
    divParagraphs.forEach((paragraph) => {
      // ignore the paragraphs that contain other elements
      if (paragraph.querySelector("ul, div, table")) {
        return;
      }

      // extract the identifier and value
      const strong = paragraph.querySelector("strong");
      if (!strong) return;

      // create a new row
      const row = document.createElement("tr");

      // create a cell for the identifier
      const labelCell = document.createElement("td");
      labelCell.textContent = strong.textContent.replace(":", "");

      // create a cell for the value
      const valueCell = document.createElement("td");

      // copy the content of the paragraph after the strong element
      let valueContent = "";
      let currentNode = strong.nextSibling;

      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          valueContent += currentNode.textContent;
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
          valueContent += currentNode.outerHTML;
        }
        currentNode = currentNode.nextSibling;
      }

      // clean the text from extra spaces
      valueContent = valueContent.trim();

      // add the content to the value cell
      valueCell.innerHTML = valueContent;

      // add the cells to the row
      row.appendChild(labelCell);
      row.appendChild(valueCell);

      // add the row to the table
      table.appendChild(row);

      // hide the original paragraph
      paragraph.style.display = "none";
    });

    // add the table to the div if there are rows
    if (table.rows.length > 0) {
      div.insertBefore(table, divParagraphs[0]);
    }
  });

  // process the lists (ul) to convert them to a table if they contain simple text elements
  const lists = contentElement.querySelectorAll("ul");
  lists.forEach((list) => {
    const items = list.querySelectorAll("li");
    if (items.length === 0) return;

    // check if the list is suitable for conversion
    let canConvert = true;
    items.forEach((item) => {
      // if the element contains complex elements, we don't convert it
      if (item.querySelector("div, ul, ol, table")) {
        canConvert = false;
      }
    });

    if (!canConvert) return;

    // create a new table
    const table = document.createElement("table");
    table.className = "info-table";

    // convert the list items to rows in the table
    items.forEach((item, index) => {
      const row = document.createElement("tr");

      // create a cell for the identifier (the item number)
      const labelCell = document.createElement("td");
      labelCell.textContent = `العنصر ${index + 1}`;

      // create a cell for the value
      const valueCell = document.createElement("td");
      valueCell.innerHTML = item.innerHTML;

      // add the cells to the row
      row.appendChild(labelCell);
      row.appendChild(valueCell);

      // add the row to the table
      table.appendChild(row);
    });

    // replace the list with the table
    list.parentNode.replaceChild(table, list);
  });
}

/**
 * format the info-panel buttons
 */
function formatInfoPanelButtons() {
  const buttonGroup = document.querySelector(".info-panel .button-group");
  if (buttonGroup) {
    const buttons = buttonGroup.querySelectorAll("button");
    buttons.forEach((button) => {
      button.style.flex = "1";
      button.style.padding = "0.6rem 1rem";
      button.style.fontSize = "0.95rem";
    });
  }
}

// export the functions for global use
window.convertParagraphsToTable = convertParagraphsToTable;
window.processOtherElements = processOtherElements;
window.formatInfoPanelButtons = formatInfoPanelButtons;
