/**
 * ملف لتنسيق لوحة المعلومات (info-panel)
 * يقوم بتحويل الأسطر إلى جدول بعمودين
 */

// تنفيذ الكود عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  // تعديل طريقة عرض محتوى info-panel
  setupInfoPanelFormatter();

  // تنسيق أزرار لوحة المعلومات
  formatInfoPanelButtons();

  // إضافة مراقب للتغييرات في لوحة المعلومات لتنسيق الأزرار عند فتحها
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
 * إعداد منسق لوحة المعلومات
 */
function setupInfoPanelFormatter() {
  // مراقبة التغييرات في info-panel
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "childList" &&
        mutation.target.id === "info-content"
      ) {
        // تحويل الأسطر إلى جدول
        convertParagraphsToTable(mutation.target);
      }
    });
  });

  // بدء المراقبة على عنصر info-content
  const infoContent = document.getElementById("info-content");
  if (infoContent) {
    observer.observe(infoContent, { childList: true, subtree: true });
  }
}

/**
 * تحويل الفقرات إلى جدول
 * @param {HTMLElement} contentElement - عنصر المحتوى
 */
function convertParagraphsToTable(contentElement) {
  // تجنب التحويل المتكرر للمحتوى نفسه
  if (contentElement.hasAttribute('data-formatted') || 
      contentElement.querySelector('.info-table')) {
    return;
  }

  // البحث عن جميع الفقرات في المحتوى
  const paragraphs = contentElement.querySelectorAll("p");

  // تجاهل التحويل إذا لم تكن هناك فقرات
  if (paragraphs.length === 0) return;

  // إنشاء جدول جديد
  const table = document.createElement("table");
  table.className = "info-table";

  // تتبع الفقرات التي تم تحويلها
  const processedParagraphs = [];

  // إضافة صفوف للجدول من الفقرات
  paragraphs.forEach(function (paragraph) {
    // تجاهل الفقرات التي تحتوي على عناصر أخرى مثل ul, div, table
    if (paragraph.querySelector("ul, div, table")) {
      return;
    }

    // استخراج المعرف والقيمة من الفقرة
    const strong = paragraph.querySelector("strong");
    if (!strong) return;

    // إنشاء صف جديد
    const row = document.createElement("tr");

    // إنشاء خلية للمعرف
    const labelCell = document.createElement("td");
    labelCell.textContent = strong.textContent.replace(":", "");

    // إنشاء خلية للقيمة
    const valueCell = document.createElement("td");

    // نسخ محتوى الفقرة بعد العنصر strong
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

    // تنظيف النص من الفراغات الزائدة
    valueContent = valueContent.trim();

    // إضافة المحتوى إلى خلية القيمة
    valueCell.innerHTML = valueContent;

    // إضافة الخلايا إلى الصف
    row.appendChild(labelCell);
    row.appendChild(valueCell);

    // إضافة الصف إلى الجدول
    table.appendChild(row);

    // إضافة الفقرة إلى قائمة المعالجة
    processedParagraphs.push(paragraph);
  });

  // إضافة الجدول إلى المحتوى قبل أول فقرة إذا كان هناك صفوف
  if (table.rows.length > 0) {
    try {
      // التحقق من أن الفقرة الأولى لا تزال موجودة في العنصر الأب
      const firstParagraph = paragraphs[0];
      if (firstParagraph && firstParagraph.parentNode === contentElement) {
        contentElement.insertBefore(table, firstParagraph);
      } else {
        // إذا لم تعد الفقرة الأولى موجودة، أضف الجدول في بداية المحتوى
        contentElement.insertAdjacentElement('afterbegin', table);
      }

      // إخفاء الفقرات الأصلية التي تم تحويلها
      processedParagraphs.forEach((paragraph) => {
        if (paragraph && paragraph.parentNode) {
          paragraph.style.display = "none";
        }
      });
    } catch (error) {
      console.warn('Error inserting table:', error);
      // في حالة حدوث خطأ، أضف الجدول في بداية المحتوى
      try {
        contentElement.insertAdjacentElement('afterbegin', table);
      } catch (fallbackError) {
        console.error('Failed to insert table even with fallback:', fallbackError);
      }
    }
  }

  // معالجة العناصر الأخرى في المحتوى
  processOtherElements(contentElement);

  // وسم المحتوى كمُنسَق لتجنب التنسيق المتكرر
  contentElement.setAttribute('data-formatted', 'true');
}

/**
 * معالجة العناصر الأخرى في المحتوى
 * @param {HTMLElement} contentElement - عنصر المحتوى
 */
function processOtherElements(contentElement) {
  // معالجة العناصر div التي تحتوي على معلومات
  const divs = contentElement.querySelectorAll("div.futuristic-panel");

  divs.forEach((div) => {
    // البحث عن الفقرات داخل div
    const divParagraphs = div.querySelectorAll("p");
    if (divParagraphs.length === 0) return;

    // إنشاء جدول جديد
    const table = document.createElement("table");
    table.className = "info-table";

    // تحويل الفقرات إلى صفوف في الجدول
    divParagraphs.forEach((paragraph) => {
      // تجاهل الفقرات التي تحتوي على عناصر أخرى
      if (paragraph.querySelector("ul, div, table")) {
        return;
      }

      // استخراج المعرف والقيمة
      const strong = paragraph.querySelector("strong");
      if (!strong) return;

      // إنشاء صف جديد
      const row = document.createElement("tr");

      // إنشاء خلية للمعرف
      const labelCell = document.createElement("td");
      labelCell.textContent = strong.textContent.replace(":", "");

      // إنشاء خلية للقيمة
      const valueCell = document.createElement("td");

      // نسخ محتوى الفقرة بعد العنصر strong
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

      // تنظيف النص من الفراغات الزائدة
      valueContent = valueContent.trim();

      // إضافة المحتوى إلى خلية القيمة
      valueCell.innerHTML = valueContent;

      // إضافة الخلايا إلى الصف
      row.appendChild(labelCell);
      row.appendChild(valueCell);

      // إضافة الصف إلى الجدول
      table.appendChild(row);

      // إخفاء الفقرة الأصلية
      paragraph.style.display = "none";
    });

    // إضافة الجدول إلى div إذا كان هناك صفوف
    if (table.rows.length > 0) {
      try {
        // التحقق من أن الفقرة الأولى لا تزال موجودة في العنصر الأب
        const firstDivParagraph = divParagraphs[0];
        if (firstDivParagraph && firstDivParagraph.parentNode === div) {
          div.insertBefore(table, firstDivParagraph);
        } else {
          // إذا لم تعد الفقرة الأولى موجودة، أضف الجدول في بداية div
          div.insertAdjacentElement('afterbegin', table);
        }
      } catch (error) {
        console.warn('Error inserting table in div:', error);
        // في حالة حدوث خطأ، أضف الجدول في بداية div
        try {
          div.insertAdjacentElement('afterbegin', table);
        } catch (fallbackError) {
          console.error('Failed to insert table in div even with fallback:', fallbackError);
        }
      }
    }
  });

  // معالجة القوائم (ul) لتحويلها إلى جدول إذا كانت تحتوي على عناصر li مع نص بسيط
  const lists = contentElement.querySelectorAll("ul");
  lists.forEach((list) => {
    const items = list.querySelectorAll("li");
    if (items.length === 0) return;

    // التحقق مما إذا كانت القائمة مناسبة للتحويل
    let canConvert = true;
    items.forEach((item) => {
      // إذا كان العنصر يحتوي على عناصر معقدة، لا نقوم بالتحويل
      if (item.querySelector("div, ul, ol, table")) {
        canConvert = false;
      }
    });

    if (!canConvert) return;

    // إنشاء جدول جديد
    const table = document.createElement("table");
    table.className = "info-table";

    // تحويل عناصر القائمة إلى صفوف في الجدول
    items.forEach((item, index) => {
      const row = document.createElement("tr");

      // إنشاء خلية للمعرف (رقم العنصر)
      const labelCell = document.createElement("td");
      labelCell.textContent = `العنصر ${index + 1}`;

      // إنشاء خلية للقيمة
      const valueCell = document.createElement("td");
      valueCell.innerHTML = item.innerHTML;

      // إضافة الخلايا إلى الصف
      row.appendChild(labelCell);
      row.appendChild(valueCell);

      // إضافة الصف إلى الجدول
      table.appendChild(row);
    });

    // استبدال القائمة بالجدول
    list.parentNode.replaceChild(table, list);
  });
}

/**
 * تنسيق أزرار لوحة المعلومات
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

// تصدير الدوال للاستخدام العام
window.convertParagraphsToTable = convertParagraphsToTable;
window.processOtherElements = processOtherElements;
window.formatInfoPanelButtons = formatInfoPanelButtons;
