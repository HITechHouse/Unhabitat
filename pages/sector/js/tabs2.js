// Removed neighborhood-related variables
let selectedCityId = null; // إضافة متغير للمدينة
let selectedCityName = null; // إضافة متغير لاسم المدينة
let isFirstSelection = true;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };


// بيانات نموذجية للجداول - تشمل بيانات مدينة حلب
const tablesData = {
  "التزود الأساسي": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "المؤن والبضائع",
        key: "supply_type",
        editable: false,
        type: "select",
        options: [
          "المواد الغذائية الأساسية",
          "اللقاحات والأدوية",
          "حوامل الطاقة",
          "مواد البناء",
        ],
      },
      {
        name: "الحالة",
        key: "operation_status",
        editable: false,
        type: "select",
        options: [
          "متوفر بشكل اعتيادي",
          "متوفر بشكل مقبول",
          "متوفر بشكل متقطع",
          "غير متوفر (معدوم)",
        ],
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
      {
        name: "أولوية التدخل",
        key: "priority",
        editable: false,
        type: "select",
        options: ["1", "2", "3"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      supply_type: "المواد الغذائية الأساسية",
      operation_status: "غير متوفر (معدوم)",
      priority: "1",
    },
  },
  "الخدمة الصحية المركزية": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "مرافق الخدمة الصحية",
        key: "health_facility",
        editable: false,
        type: "select",
        options: [
          "مديرية الصحة",
          "المشفى المركزي (الوطني)",
          "الصيدلية المركزية",
          "بنك الدم",
        ],
      },
      {
        name: "البنية التحتية الإنشائية",
        key: "construction_status",
        editable: false,
        type: "select",
        options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"],
      },
      {
        name: "البنية التحتية المعمارية",
        key: "building_status",
        editable: false,
        type: "select",
        options: ["متضرر بشدة", "متضرر بشكل خفيف", "غير متضرر"],
      },
      {
        name: "حالة الكادر",
        key: "workers_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة المستهلكات",
        key: "consumables_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة التشغيل",
        key: "operation_status",
        editable: false,
        type: "select",
        options: [
          "يعمل بشكل اعتيادي",
          "يعمل بشكل مقبول",
          "يعمل بشكل متقطع",
          "لا يعمل (معدوم)",
        ],
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
      {
        name: "أولوية التدخل",
        key: "priority",
        editable: false,
        type: "select",
        options: ["1", "2", "3"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      health_facility: "الصيدلية المركزية",
      construction_status: "متضرر جزئيا",
      building_status: "متضرر بشدة",
      workers_status: "متاح",
      consumables_status: "متاح بحدود",
      operation_status: "يعمل بشكل مقبول",
      priority: "2",
      need_description: "",
    },
  },
  "البنية التحتية": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "مرافق البنية التحتية",
        key: "infrastructure_facility",
        editable: false,
        type: "select",
        options: [
          "مديرية المياه",
          "محطة تحلية مياه الشرب",
          "محطة معالجة مياه الصرف",
          "مديرية الكهرباء",
          "محطة التحويل الأساسية",
          "محطة التوليد الأساسية",
          "وحدة الاتصالات الأرضية",
        ],
      },
      {
        name: "البنية التحتية",
        key: "construction_status",
        editable: false,
        type: "select",
        options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"],
      },
      {
        name: "حالة الكادر",
        key: "workers_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة المستهلكات",
        key: "consumables_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة التشغيل",
        key: "operation_status",
        editable: false,
        type: "select",
        options: [
          "يعمل بشكل اعتيادي",
          "يعمل بشكل مقبول",
          "يعمل بشكل متقطع",
          "لا يعمل (معدوم)",
        ],
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
      {
        name: "أولوية التدخل",
        key: "priority",
        editable: false,
        type: "select",
        options: ["1", "2", "3"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      infrastructure_facility: "محطة معالجة مياه الصرف",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح بحدود",
      consumables_status: "متاح",
      operation_status: "يعمل بشكل مقبول",
      priority: "2",
      need_description: "",
    },
  },
  "الخدمات الإدارية": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "الخدمات الإدارية",
        key: "administrative_service",
        editable: false,
        type: "select",
        options: [
          "القضاء والمحاكم",
          "قسم الشرطة",
          "مديرية السجل المدني",
          "مديرية السجل العقاري (المؤقت)",
          "مديرية السجل العقاري (الدائم)",
          "مديرية المصالح العقارية",
          "المديرية المالية",
          "مديرية الزراعة",
          "الوحدة الإرشادية",
          "مركز الدفاع المدني (الإطفاء)",
        ],
      },
      {
        name: "البنية التحتية",
        key: "construction_status",
        editable: false,
        type: "select",
        options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"],
      },
      {
        name: "حالة الكادر",
        key: "workers_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة المستهلكات",
        key: "consumables_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة التشغيل",
        key: "operation_status",
        editable: false,
        type: "select",
        options: [
          "يعمل بشكل اعتيادي",
          "يعمل بشكل مقبول",
          "يعمل بشكل متقطع",
          "لا يعمل (معدوم)",
        ],
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
      {
        name: "أولوية التدخل",
        key: "priority",
        editable: false,
        type: "select",
        options: ["1", "2", "3"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      administrative_service: "القضاء والمحاكم",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح",
      consumables_status: "متاح",
      operation_status: "يعمل بشكل اعتيادي",
      priority: "2",
      need_description: "",
    },
  },
  "الخدمات الأخرى": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "الخدمات الأخرى",
        key: "other_service",
        editable: false,
        type: "select",
        options: [
          "سوق الهال المركزي",
          "المخابز الآلية والإحتياطية",
          "المدينة / المنطقة الصناعية والحرفية",
          "المركز الثقافي",
          "الحديقة المركزية في التجمع",
          "الآبدة الأثرية",
          "مكب النفايات الصلبة",
          "مكب الأنقاض المعتمد",
        ],
      },
      {
        name: "البنية التحتية",
        key: "construction_status",
        editable: false,
        type: "select",
        options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"],
      },
      {
        name: "حالة الكادر",
        key: "workers_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة المستهلكات",
        key: "consumables_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة التشغيل",
        key: "operation_status",
        editable: false,
        type: "select",
        options: [
          "يعمل بشكل اعتيادي",
          "يعمل بشكل مقبول",
          "يعمل بشكل متقطع",
          "لا يعمل (معدوم)",
        ],
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
      {
        name: "أولوية التدخل",
        key: "priority",
        editable: false,
        type: "select",
        options: ["1", "2", "3"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      other_service: "الآبدة الأثرية",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح بحدود",
      consumables_status: "غير متاح",
      operation_status: "يعمل بشكل اعتيادي",
      priority: "2",
      need_description: "",
    },
  },
  "قسم النظافة": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "واقع الكادر الفني والتشغيلي",
        key: "technical_staff_status",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "حالة الآليات",
        key: "machinery_status",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "الأنقاض",
        key: "rubble_status",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      technical_staff_status: "",
      machinery_status: "",
      rubble_status: "",
      need_description: "",
    },
  },
  "المنشآت والفعاليات الاقتصادية الأساسية": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "اسم المنشأة",
        key: "facility_name",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "نوع المنشأة",
        key: "facility_type",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "البنية التحتية",
        key: "construction_status",
        editable: false,
        type: "select",
        options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"],
      },
      {
        name: "حالة الكادر",
        key: "workers_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة المستهلكات",
        key: "consumables_status",
        editable: false,
        type: "select",
        options: ["متاح", "متاح بحدود", "غير متاح"],
      },
      {
        name: "حالة التشغيل",
        key: "operation_status",
        editable: false,
        type: "select",
        options: [
          "يعمل بشكل اعتيادي",
          "يعمل بشكل مقبول",
          "يعمل بشكل متقطع",
          "لا يعمل (معدوم)",
        ],
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
      {
        name: "أولوية التدخل",
        key: "priority",
        editable: false,
        type: "select",
        options: ["1", "2", "3"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      facility_name: "",
      facility_type: "",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح بحدود",
      consumables_status: "غير متاح",
      operation_status: "يعمل بشكل اعتيادي",
      priority: "2",
      need_description: "",
    },
  },
  "الاقتصاد الزراعي": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "المساحة المزروعة",
        key: "planted_area",
        editable: false,
        type: "number",
        placeholder: "ادخل قيمة",
      },
      {
        name: "عدد الأسر العاملة",
        key: "working_families",
        editable: false,
        type: "number",
        placeholder: "ادخل قيمة",
      },
      {
        name: "نوع الزراعة الرئيسية",
        key: "main_agriculture_type",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "طرق الري",
        key: "irrigation_methods",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "الإنتاج الحيواني",
        key: "animal_production",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "تصريف المنتجات",
        key: "product_disposal",
        editable: false,
        type: "text",
        placeholder: "ادخل قيمة",
      },
      {
        name: "وصف الاحتياج",
        key: "need_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل قيمة",
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      planted_area: "",
      working_families: "",
      main_agriculture_type: "",
      irrigation_methods: "",
      animal_production: "",
      product_disposal: "",
      need_description: "",
    },
  },
  "تحليل علاقة الشركاء الفاعلين": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "الشريك المحتمل للوحدة الإدارية",
        key: "potential_partner",
        editable: false,
        type: "select",
        options: [
          "نقابة المهندسين (العمال)",
          "غرفة السياحة",
          "غرفة التجارة",
          "غرفة الصناعة",
          "الشركات والمؤسسات العامة",
          "شركات القطاع الخاص",
          "الجمعيات السكنية التعاونية",
          "جمعيات أو منظمات غير حكومية",
          "منظمات دولية",
        ],
      },
      {
        name: "نوع المشاركة",
        key: "share_type",
        editable: false,
        type: "multiselect",
        options: ["شراكة", "تشاور", "إعلام", "مراقبة", "لا يوجد"],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      potential_partner: "منظمات دولية",
      share_type: ["التنمية الاقتصادية", "الخدمات الصحية"],
    },
  },
  "التدخلات_الإنسانية": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "نوع التدخل",
        key: "intervention_type",
        editable: false,
        type: "select",
        options: [
          "مساعدات غذائية",
          "مساعدات طبية",
          "مساعدات سكنية",
          "مساعدات تعليمية",
          "مساعدات اقتصادية",
        ],
      },
      {
        name: "حالة التدخل",
        key: "intervention_status",
        editable: false,
        type: "select",
        options: [
          "مكتمل",
          "قيد التنفيذ",
          "مخطط",
          "معلق",
        ],
      },
      {
        name: "وصف التدخل",
        key: "intervention_description",
        editable: false,
        type: "textarea",
        placeholder: "ادخل وصف التدخل",
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      intervention_type: "مساعدات غذائية",
      intervention_status: "قيد التنفيذ",
      intervention_description: "",
    },
  },
  "أعضاء لجنة الحي": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "عدد الأعضاء",
        key: "members_count",
        editable: false,
        type: "number",
        placeholder: "ادخل عدد الأعضاء",
        clickable: true,
      },
      {
        name: "رئيس اللجنة",
        key: "committee_head",
        editable: false,
        type: "text",
        placeholder: "ادخل اسم رئيس اللجنة",
      },
      {
        name: "رقم هاتف الرئيس",
        key: "head_phone",
        editable: false,
        type: "tel",
        placeholder: "ادخل رقم الهاتف",
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      members_count: "5",
      committee_head: "",
      head_phone: "",
    },
    membersData: [
      { name: "أحمد محمد", phone: "+963-123-456-789", location: "الحي القديم" },
      { name: "فاطمة علي", phone: "+963-987-654-321", location: "الحي الجديد" },
      { name: "محمد حسن", phone: "+963-555-123-456", location: "الحي الشرقي" },
      { name: "عائشة أحمد", phone: "+963-777-888-999", location: "الحي الغربي" },
      { name: "علي محمود", phone: "+963-111-222-333", location: "الحي الشمالي" },
    ],
  },
  "معلومات التواصل مع لجنة الحي": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "عنوان المكتب",
        key: "office_address",
        editable: false,
        type: "text",
        placeholder: "ادخل عنوان المكتب",
      },
      {
        name: "رقم الهاتف الرئيسي",
        key: "main_phone",
        editable: false,
        type: "tel",
        placeholder: "ادخل رقم الهاتف الرئيسي",
      },
      {
        name: "البريد الإلكتروني",
        key: "email",
        editable: false,
        type: "email",
        placeholder: "ادخل البريد الإلكتروني",
      },
      {
        name: "ساعات العمل",
        key: "working_hours",
        editable: false,
        type: "text",
        placeholder: "ادخل ساعات العمل",
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      office_address: "",
      main_phone: "",
      email: "",
      working_hours: "",
    },
  },
  "لجان_التنمية": {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "اسم المدينة", key: "city", editable: false },
      {
        name: "اسم لجنة التنمية",
        key: "development_committee_name",
        editable: false,
        type: "text",
        placeholder: "ادخل اسم لجنة التنمية",
      },
      {
        name: "نوع اللجنة",
        key: "committee_type",
        editable: false,
        type: "select",
        options: [
          "لجنة تنمية اقتصادية",
          "لجنة تنمية اجتماعية",
          "لجنة تنمية بيئية",
          "لجنة تنمية تعليمية",
          "لجنة تنمية صحية",
        ],
      },
      {
        name: "عدد الأعضاء",
        key: "members_count",
        editable: false,
        type: "number",
        placeholder: "ادخل عدد الأعضاء",
      },
      {
        name: "حالة اللجنة",
        key: "committee_status",
        editable: false,
        type: "select",
        options: [
          "نشطة",
          "معلقة",
          "منحلة",
          "قيد التأسيس",
        ],
      },
    ],
    sampleData: {
      id: "1",
      city: "حلب",
      development_committee_name: "",
      committee_type: "لجنة تنمية اقتصادية",
      members_count: "",
      committee_status: "نشطة",
    },
  },
};

window.tablesData = tablesData;

// تهيئة التبويبات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  initializeTabs();
  setupEventListeners();
  setupDraggablePanel();
  createModalBackdrop();
  createWarningMessage();
});

function createWarningMessage() {
  const warningDiv = document.createElement("div");
  warningDiv.className = "warning-message";
  warningDiv.id = "warningMessage";
  warningDiv.textContent = "يرجى اختيار حي من الخريطة أولاً";
  document.body.appendChild(warningDiv);
}

function showWarning() {
  const warningMessage = document.getElementById("warningMessage");
  warningMessage.classList.add("show");

  // Hide the message after animation
  setTimeout(() => {
    warningMessage.classList.remove("show");
  }, 2000);
}

function setupDraggablePanel() {
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");

  if (!infoPanel || !infoTitle) return;

  infoTitle.addEventListener("mousedown", startDragging);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDragging);

  // Touch events with non-passive option
  infoTitle.addEventListener("touchstart", startDragging, { passive: false });
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("touchend", stopDragging, { passive: false });
}

function startDragging(e) {
  isDragging = true;
  const infoPanel = document.getElementById("info-panel");

  // Get current panel position
  const rect = infoPanel.getBoundingClientRect();

  // Calculate offset
  if (e.type === "mousedown") {
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
  } else if (e.type === "touchstart") {
    e.preventDefault(); // Prevent default touch behavior
    dragOffset.x = e.touches[0].clientX - rect.left;
    dragOffset.y = e.touches[0].clientY - rect.top;
  }

  infoPanel.classList.add("dragging");
}

function drag(e) {
  if (!isDragging) return;

  e.preventDefault(); // Prevent default scrolling behavior
  const infoPanel = document.getElementById("info-panel");

  // Get cursor position
  const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
  const clientY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;

  // Calculate new position
  let newX = clientX - dragOffset.x;
  let newY = clientY - dragOffset.y;

  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Get panel dimensions
  const rect = infoPanel.getBoundingClientRect();

  // Constrain to window bounds
  newX = Math.max(0, Math.min(newX, windowWidth - rect.width));
  newY = Math.max(0, Math.min(newY, windowHeight - rect.height));

  // Apply new position
  infoPanel.style.right = `${windowWidth - newX - rect.width}px`;
  infoPanel.style.top = `${newY}px`;
}

function stopDragging() {
  isDragging = false;
  const infoPanel = document.getElementById("info-panel");
  if (infoPanel) {
    infoPanel.classList.remove("dragging");
  }
}

function createModalBackdrop() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop fade";
  document.body.appendChild(backdrop);
  // إخفاء الـ backdrop تلقائيًا عند فتح info-panel
  backdrop.style.display = "none";
  // backdrop.classList.add("show");

  backdrop.addEventListener("click", function () {
    hideInfoPanel();
  });
}

function initializeTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Activate current button and deactivate others
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Render the info panel with the selected tab's data
      if (selectedCityId) {
        renderInfoPanelForCity(tabId, selectedCityId);
      } else {
        // If no city is selected, show empty state
        const infoPanel = document.getElementById("info-panel");
        const tabContent = infoPanel.querySelector(".tab-content");
        if (tabContent) {
          tabContent.innerHTML = `
            <div class="empty-state">
              <p>يرجى تحديد مدينة لعرض البيانات</p>
            </div>
          `;
        }
      }

      // Update navigation button states after tab change
      setTimeout(() => {
        if (window.updateNavigationButtons) {
          window.updateNavigationButtons();
        }
      }, 100);
    });
  });
}

function setupEventListeners() {
  // Save changes button
  const saveButton = document.getElementById("save-changes");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      const inputs = document.querySelectorAll(".editable-field");
      const changes = [];

      inputs.forEach((input) => {
        if (input.dataset.changed === "true") {
          changes.push({
            table: input.dataset.table,
            field: input.dataset.field,
            value: input.value,
          });
        }
      });

      if (changes.length > 0) {
        console.log("التغييرات المحفوظة:", changes);
        alert("تم حفظ التغييرات بنجاح");

        // Reset the changed flag
        inputs.forEach((input) => (input.dataset.changed = "false"));
      } else {
        alert("لم يتم إجراء أي تغييرات");
      }
    });
  }

  // Close info panel button
  const closeButton = document.getElementById("close-info-panel");
  if (closeButton) {
    closeButton.addEventListener("click", hideInfoPanel);
  }
}

// Removed renderInfoPanel function for neighborhoods

function hideInfoPanel() {
  const infoPanel = document.getElementById("info-panel");
  const backdrop = document.getElementById("modal-backdrop");

  if (infoPanel) {
    infoPanel.classList.remove("show");
  }

  if (backdrop) {
    backdrop.classList.remove("show");
  }
}

// Removed neighborhood selection function

// Function to be called when Aleppo city is selected
function setSelectedCity(id, name) {
  selectedCityId = id;
  selectedCityName = name;
  isFirstSelection = false;

  // If there's an active tab, update its content for city
  const activeTab = document.querySelector(".tab-button.active");
  if (activeTab) {
    const tabId = activeTab.getAttribute("data-tab");
    renderInfoPanelForCity(tabId, id);
  } else {
    // If no active tab, show the first tab
    const firstTab = document.querySelector(".tab-button");
    if (firstTab) {
      firstTab.click();
    }
  }
}

// Function to render info panel for city (similar to neighborhood)
function renderInfoPanelForCity(tabId, cityId) {
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoContent = document.getElementById("info-content");
  const backdrop = document.getElementById("modal-backdrop");

  if (!infoPanel || !infoTitle || !infoContent) return;

  // Show the backdrop and panel
  if (backdrop) backdrop.classList.add("show");
  infoPanel.classList.add("show");

  const table = tablesData[tabId];
  if (!table) return;

  // Get current language
  const currentLang = document.documentElement.lang || "ar";

  // Get tab name based on current language
  let tabName = tabId.replace(/_/g, " ");
  if (
    window.translations &&
    window.translations[currentLang] &&
    window.translations[currentLang].tabs &&
    window.translations[currentLang].tabs[tabId]
  ) {
    tabName = window.translations[currentLang].tabs[tabId];
  }

  // Set the title and clear content
  infoTitle.innerHTML = `
    <span>${tabName} - ${selectedCityName}</span>
  `;
  infoContent.innerHTML = "";

  // Create form container
  const formContainer = document.createElement("form");
  formContainer.className = "info-form";

  // Create table with border
  const tableElement = document.createElement("table");
  tableElement.className = "info-table";
  tableElement.style.border = "2px solid #ddd";
  tableElement.style.borderRadius = "8px";
  tableElement.style.overflow = "hidden";
  tableElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

  // Create table header
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Create header cells
  const identifierHeader = document.createElement("th");
  identifierHeader.textContent = "المعرف";
  identifierHeader.style.fontSize = "1.1rem";
  identifierHeader.style.fontWeight = "bold";
  identifierHeader.style.padding = "12px 15px";
  identifierHeader.style.backgroundColor = "#ff7800"; // Orange color for city
  identifierHeader.style.color = "white";
  identifierHeader.style.textAlign = "center";

  const valueHeader = document.createElement("th");
  valueHeader.textContent = "القيمة";
  valueHeader.style.fontSize = "1.1rem";
  valueHeader.style.fontWeight = "bold";
  valueHeader.style.padding = "12px 15px";
  valueHeader.style.backgroundColor = "#ff7800"; // Orange color for city
  valueHeader.style.color = "white";
  valueHeader.style.textAlign = "center";

  // Add header cells to header row
  headerRow.appendChild(identifierHeader);
  headerRow.appendChild(valueHeader);

  // Add header row to table head
  tableHead.appendChild(headerRow);

  // Add table head to table
  tableElement.appendChild(tableHead);

  // Create table body
  const tableBody = document.createElement("tbody");

  // Create fields as table rows
  table.fields.forEach((field, index) => {
    // Create table row
    const row = document.createElement("tr");

    // Add zebra striping for better readability
    if (index % 2 === 0) {
      row.style.backgroundColor = "#f8fafc";
    }

    // Get current language
    const currentLang = document.documentElement.lang || "ar";

    // Get field name based on current language
    let fieldName = field.name;
    if (
      window.fieldTranslations &&
      window.fieldTranslations[currentLang] &&
      window.fieldTranslations[currentLang][field.key]
    ) {
      fieldName = window.fieldTranslations[currentLang][field.key];
    }

    // Create label cell
    const labelCell = document.createElement("td");
    labelCell.textContent = fieldName;

    // Create value cell
    const valueCell = document.createElement("td");

    // Create input element
    let inputElement;
    const currentValue = table.sampleData[field.key] || "";

    if (field.editable) {
      if (field.type === "select" && Array.isArray(field.options)) {
        inputElement = document.createElement("select");
        inputElement.className = "editable-field";

        // Add an empty option first
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "-- اختر --";
        inputElement.appendChild(emptyOption);

        // Add all other options
        field.options.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.textContent = option;
          if (option === currentValue) {
            optionElement.selected = true;
          }
          inputElement.appendChild(optionElement);
        });
      } else if (field.type === "textarea") {
        inputElement = document.createElement("textarea");
        inputElement.className = "editable-field";
        inputElement.value = currentValue;
      } else {
        inputElement = document.createElement("input");
        inputElement.className = "editable-field";

        switch (field.type) {
          case "number":
            inputElement.type = "number";
            if (field.min !== undefined) inputElement.min = field.min;
            if (field.max !== undefined) inputElement.max = field.max;
            break;
          case "date":
            inputElement.type = "date";
            break;
          case "tel":
            inputElement.type = "tel";
            if (field.pattern) inputElement.pattern = field.pattern;
            break;
          case "email":
            inputElement.type = "email";
            break;
          case "time":
            inputElement.type = "time";
            break;
          default:
            inputElement.type = "text";
        }
        inputElement.value = currentValue;
      }
    } else {
      inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.className = "editable-field";
      inputElement.readOnly = true;
      inputElement.style.backgroundColor = "#f0f0f0";
      inputElement.style.cursor = "not-allowed";
      inputElement.value = currentValue;
    }

    inputElement.dataset.table = tabId;
    inputElement.dataset.field = field.key;
    inputElement.dataset.changed = "false";

    // Set city name for city field
    if (field.key === "city") {
      inputElement.value = selectedCityName || "حلب";
      inputElement.readOnly = true;
      inputElement.style.backgroundColor = "#f0f0f0";
      inputElement.style.cursor = "not-allowed";
    }

    // Set city ID for id field
    if (field.key === "id") {
      inputElement.value = cityId;
      inputElement.readOnly = true;
      inputElement.style.backgroundColor = "#f0f0f0";
      inputElement.style.cursor = "not-allowed";
    }

    // Add change event listener for editable fields
    if (field.editable) {
      inputElement.addEventListener("change", function () {
        this.dataset.changed = "true";

        // تحديث القيم في واجهة حساب المركبة إذا كانت مفتوحة
        updateCompositeFromInfoPanel(this);
      });

      // إضافة event listener للتحديث الفوري أثناء الكتابة (للحقول النصية والرقمية)
      if (field.type !== "select") {
        inputElement.addEventListener("input", function () {
          updateCompositeFromInfoPanel(this);
        });
      }
    }

    // إضافة وظيفة النقر لحقل "عدد الأعضاء" في تبويب "أعضاء لجنة الحي"
    if (
      field.clickable &&
      field.key === "members_count" &&
      tabId === "أعضاء لجنة الحي"
    ) {
      // إنشاء حاوية للحقل مع الأيقونة
      const clickableContainer = document.createElement("div");
      clickableContainer.style.position = "relative";
      clickableContainer.style.display = "inline-block";
      clickableContainer.style.width = "100%";
      clickableContainer.className = "clickable-field";

      // تغيير شكل الحقل ليبدو قابلاً للنقر
      inputElement.style.cursor = "pointer";
      inputElement.style.backgroundColor = "#e3f2fd";
      inputElement.style.border = "2px solid #2196f3";
      inputElement.style.borderRadius = "6px";
      inputElement.style.transition = "all 0.3s ease";
      inputElement.style.paddingRight = "35px";
      inputElement.style.fontWeight = "600";
      inputElement.style.color = "#1565c0";
      inputElement.title = "انقر لعرض تفاصيل الأعضاء";

      // إضافة تأثيرات hover
      inputElement.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "#bbdefb";
        this.style.transform = "scale(1.02)";
        this.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.4)";
        this.style.borderColor = "#1976d2";
      });

      inputElement.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "#e3f2fd";
        this.style.transform = "scale(1)";
        this.style.boxShadow = "0 2px 6px rgba(33, 150, 243, 0.2)";
        this.style.borderColor = "#2196f3";
      });

      // إضافة وظيفة النقر
      inputElement.addEventListener("click", function (e) {
        e.preventDefault();
        showMembersDetailsForCity(tabId, cityId);
      });

      // إضافة الحقل إلى الحاوية
      clickableContainer.appendChild(inputElement);

      // استبدال الحقل الأصلي بالحاوية الجديدة
      valueCell.innerHTML = "";
      valueCell.appendChild(clickableContainer);
    } else {
      // إضافة الحقل العادي
      valueCell.appendChild(inputElement);
    }

    // دالة مساعدة لتحديث واجهة حساب المركبة
    function updateCompositeFromInfoPanel(inputElement) {
      if (typeof window.updateCompositeValuesFromInfoPanel === "function") {
        // تحديث البيانات في tablesData
        const currentTabId = inputElement.dataset.table;
        const currentFieldKey = inputElement.dataset.field;
        if (
          window.tablesData &&
          window.tablesData[currentTabId] &&
          window.tablesData[currentTabId].sampleData
        ) {
          window.tablesData[currentTabId].sampleData[currentFieldKey] =
            inputElement.value;
        }

        // تحديث واجهة حساب المركبة
        window.updateCompositeValuesFromInfoPanel();
      }
    }

    // Add cells to row
    row.appendChild(labelCell);
    row.appendChild(valueCell);

    // Add row to table body
    tableBody.appendChild(row);
  });

  // Add table body to table
  tableElement.appendChild(tableBody);

  // Add table to form container
  formContainer.appendChild(tableElement);

  // Add form container to info content
  infoContent.appendChild(formContainer);

  // Add button group
  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";
  buttonGroup.style.marginTop = "20px";
  buttonGroup.style.padding = "15px";
  buttonGroup.style.backgroundColor = "#f8fafc";
  buttonGroup.style.borderTop = "1px solid #ddd";
  buttonGroup.style.borderRadius = "0 0 8px 8px";
  buttonGroup.style.display = "flex";
  buttonGroup.style.justifyContent = "center";
  buttonGroup.style.alignItems = "center";
  buttonGroup.style.gap = "12px";

  // Dynamic label based on language
  const lang = document.documentElement.lang || "ar";

  // Add Previous button
  const previousButton = document.createElement("button");
  previousButton.id = "previous-tab";
  previousButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
  previousButton.title = lang === "ar" ? "التبويب السابق" : "Previous Tab";
  previousButton.setAttribute("aria-label", previousButton.title);

  // Previous button functionality
  previousButton.addEventListener("click", function (e) {
    e.preventDefault();
    const activeTab = document.querySelector(".tab-button.active");
    if (activeTab) {
      let prevTab = activeTab.previousElementSibling;
      while (prevTab && !prevTab.classList.contains("tab-button")) {
        prevTab = prevTab.previousElementSibling;
      }
      if (prevTab && prevTab.classList.contains("tab-button")) {
        prevTab.click();
      }
    }
  });

  // Add Next button
  const nextButton = document.createElement("button");
  nextButton.id = "next-tab";
  nextButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
  nextButton.title = lang === "ar" ? "التبويب التالي" : "Next Tab";
  nextButton.setAttribute("aria-label", nextButton.title);

  // Next button functionality
  nextButton.addEventListener("click", function (e) {
    e.preventDefault();
    const activeTab = document.querySelector(".tab-button.active");
    if (activeTab) {
      let nextTab = activeTab.nextElementSibling;
      while (nextTab && !nextTab.classList.contains("tab-button")) {
        nextTab = nextTab.nextElementSibling;
      }
      if (nextTab && nextTab.classList.contains("tab-button")) {
        nextTab.click();
      }
    }
  });

  // Add save button
  const saveButton = document.createElement("button");
  saveButton.id = "save-changes";
  saveButton.innerHTML = '<i class="fas fa-save"></i>';
  saveButton.title = lang === "ar" ? "حفظ التغييرات" : "Save Changes";
  saveButton.setAttribute("aria-label", saveButton.title);
  saveButton.addEventListener("click", function () {
    const inputs = document.querySelectorAll(".editable-field");
    const changes = [];

    inputs.forEach((input) => {
      if (input.dataset.changed === "true") {
        changes.push({
          table: input.dataset.table,
          field: input.dataset.field,
          value: input.value,
        });
      }
    });

    if (changes.length > 0) {
      console.log("التغييرات المحفوظة:", changes);
      alert("تم حفظ التغييرات بنجاح");

      // Reset the changed flag
      inputs.forEach((input) => (input.dataset.changed = "false"));
    } else {
      alert("لم يتم إجراء أي تغييرات");
    }
  });

  // Function to update button states
  window.updateNavigationButtons = function () {
    const activeTab = document.querySelector(".tab-button.active");
    if (!activeTab) return;

    const allTabs = document.querySelectorAll(".tab-button");
    const currentIndex = Array.from(allTabs).indexOf(activeTab);
    const isLastTab = currentIndex === allTabs.length - 1;

    const prevBtn = document.getElementById("previous-tab");
    if (prevBtn) {
      if (currentIndex === 0) {
        prevBtn.style.opacity = "0.5";
        prevBtn.style.cursor = "not-allowed";
        prevBtn.disabled = true;
      } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.cursor = "pointer";
        prevBtn.disabled = false;
      }
    }

    const nextBtn = document.getElementById("next-tab");
    if (nextBtn) {
      if (isLastTab) {
        nextBtn.style.opacity = "0.5";
        nextBtn.style.cursor = "not-allowed";
        nextBtn.disabled = true;
      } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.cursor = "pointer";
        nextBtn.disabled = false;
      }
    }

    // Show/hide update all button based on whether this is the last tab
    const updateAllBtn = document.getElementById("update-all-btn");
    if (updateAllBtn) {
      updateAllBtn.style.display = isLastTab ? "flex" : "none";
    }
  };

  // Initial button state update
  setTimeout(() => {
    if (window.updateNavigationButtons) {
      window.updateNavigationButtons();
    }
  }, 100);

  // Check if this is the last tab
  const allTabs = document.querySelectorAll(".tab-button");
  const activeTab = document.querySelector(".tab-button.active");
  const currentIndex = Array.from(allTabs).indexOf(activeTab);
  const isLastTab = currentIndex === allTabs.length - 1;

  // Define the last 3 tabs
  const lastThreeTabs = [
    "أعضاء لجنة الحي",
    "معلومات التواصل مع لجنة الحي",
    "لجان_التنمية",
  ];

  // Check if this is the last tab to add the Update All button
  if (isLastTab) {
    const updateAllButton = document.createElement("button");
    updateAllButton.id = "update-all-btn";
    updateAllButton.innerHTML = lang === "ar" 
      ? '<i class="fas fa-sync-alt"></i> تحديث الكل'
      : '<i class="fas fa-sync-alt"></i> Update All';
    updateAllButton.title = lang === "ar" ? "تحديث الكل" : "Update All";
    updateAllButton.setAttribute("aria-label", updateAllButton.title);

    updateAllButton.style.flex = "1";
    updateAllButton.style.height = "44px";
    updateAllButton.style.border = "none";
    updateAllButton.style.borderRadius = "6px";
    updateAllButton.style.fontSize = "1rem";
    updateAllButton.style.fontWeight = "600";
    updateAllButton.style.cursor = "pointer";
    updateAllButton.style.transition = "all 0.2s ease";
    updateAllButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    updateAllButton.style.textAlign = "center";
    updateAllButton.style.backgroundColor = "#28a745";
    updateAllButton.style.color = "white";

    updateAllButton.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#218838";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
    });

    updateAllButton.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#28a745";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    });

    updateAllButton.addEventListener("click", function (e) {
      e.preventDefault();
      showCityUpdateAllConfirmation(lang);
    });

    // Add buttons to button group: Previous, Save, Update All, Next
    buttonGroup.appendChild(previousButton);
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(updateAllButton);
    buttonGroup.appendChild(nextButton);
  } else {
    // For all other tabs (not last tab), show normal navigation buttons
    buttonGroup.appendChild(previousButton);
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(nextButton);
  }

  if (lastThreeTabs.includes(tabId)) {
    const browseButton = document.createElement("button");
    browseButton.id = "browse-btn";
    browseButton.innerHTML = '<i class="fas fa-search"></i>';

    let browseText = "استعراض";
    if (
      window.translations &&
      window.translations[lang] &&
      window.translations[lang].browseBtn
    ) {
      browseText = window.translations[lang].browseBtn;
    } else if (lang === "en") {
      browseText = "Browse";
    }

    browseButton.title = browseText;
    browseButton.setAttribute("aria-label", browseText);

    browseButton.style.flex = "1";
    browseButton.style.height = "44px";
    browseButton.style.border = "none";
    browseButton.style.borderRadius = "6px";
    browseButton.style.fontSize = "1rem";
    browseButton.style.fontWeight = "600";
    browseButton.style.cursor = "pointer";
    browseButton.style.transition = "all 0.2s ease";
    browseButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    browseButton.style.textAlign = "center";
    browseButton.style.backgroundColor = "#17a2b8";
    browseButton.style.color = "white";

    browseButton.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#138496";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
    });

    browseButton.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#17a2b8";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    });

    browseButton.addEventListener("click", function (e) {
      e.preventDefault();
      if (tabId === "لجان_التنمية") {
        window.location.href = "../developmentCommitteesManagement.html";
      } else {
        window.location.href = "../neighborhoodCommitteesManagement.html";
      }
    });

    buttonGroup.appendChild(previousButton);
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(browseButton);
    buttonGroup.appendChild(nextButton);
  }

  // Add button group to info content
  infoContent.appendChild(buttonGroup);

  // Show the modal and backdrop
  requestAnimationFrame(() => {
    backdrop.classList.add("show");
    infoPanel.classList.add("show");
  });
}

// Function to show members details for city
function showMembersDetailsForCity(tabId, cityId) {
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoContent = document.getElementById("info-content");

  if (!infoPanel || !infoTitle || !infoContent) return;

  const table = tablesData[tabId];
  if (!table || !table.membersData) return;

  // update the title
  infoTitle.innerHTML = `
    <span>تفاصيل أعضاء لجنة المدينة - ${selectedCityName}</span>
  `;

  // clear the current content
  infoContent.innerHTML = "";

  // create an info message
  const infoMessage = document.createElement("div");
  infoMessage.style.backgroundColor = "#fff3cd";
  infoMessage.style.border = "1px solid #ff7800";
  infoMessage.style.borderRadius = "8px";
  infoMessage.style.padding = "15px";
  infoMessage.style.margin = "20px";
  infoMessage.style.textAlign = "center";
  infoMessage.style.color = "#856404";
  infoMessage.style.fontWeight = "600";
  infoMessage.innerHTML = `
    <i class="fas fa-info-circle" style="margin-left: 8px;"></i>
    قائمة بجميع أعضاء لجنة المدينة مع معلومات التواصل
    <br>
    <span style="font-size: 0.9rem; margin-top: 5px; display: inline-block;">
      <i class="fas fa-users" style="margin-left: 5px;"></i>
      إجمالي الأعضاء: ${table.membersData.length} اعضاء
    </span>
  `;

  // create a table container
  const tableContainer = document.createElement("div");
  tableContainer.className = "members-table-container";
  tableContainer.style.padding = "0 20px 20px 20px";

  // create the table
  const tableElement = document.createElement("table");
  tableElement.className = "info-table members-table";
  tableElement.style.border = "2px solid #ddd";
  tableElement.style.borderRadius = "8px";
  tableElement.style.overflow = "hidden";
  tableElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  tableElement.style.width = "100%";

  // create the table header
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["اسم العضو", "رقم الهاتف", "مكان التواجد"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.style.fontSize = "1.1rem";
    th.style.fontWeight = "bold";
    th.style.padding = "12px 15px";
    th.style.backgroundColor = "#ff7800"; // Orange for city
    th.style.color = "white";
    th.style.textAlign = "center";
    th.style.borderBottom = "2px solid #ddd";
    headerRow.appendChild(th);
  });

  tableHead.appendChild(headerRow);
  tableElement.appendChild(tableHead);

  // create the table body
  const tableBody = document.createElement("tbody");

  table.membersData.forEach((member, index) => {
    const row = document.createElement("tr");

    // add the zebra striping effect
    if (index % 2 === 0) {
      row.style.backgroundColor = "#f8fafc";
    }

    // add the hover effect
    row.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#fff3cd";
    });

    row.addEventListener("mouseleave", function () {
      this.style.backgroundColor = index % 2 === 0 ? "#f8fafc" : "white";
    });

    // create the data cells
    const nameCell = document.createElement("td");
    nameCell.textContent = member.name;
    nameCell.style.padding = "12px 15px";
    nameCell.style.borderBottom = "1px solid #e5e7eb";
    nameCell.style.fontWeight = "600";

    const phoneCell = document.createElement("td");
    phoneCell.style.padding = "12px 15px";
    phoneCell.style.borderBottom = "1px solid #e5e7eb";
    phoneCell.style.direction = "ltr";
    phoneCell.style.textAlign = "center";

    // create the phone link
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${member.phone}`;
    phoneLink.innerHTML = `<i class="fas fa-phone" style="margin-left: 5px; font-size: 0.9rem;"></i>${member.phone}`;
    phoneLink.style.color = "#ff7800";
    phoneLink.style.textDecoration = "none";
    phoneLink.style.fontWeight = "600";
    phoneLink.style.transition = "all 0.2s ease";
    phoneLink.style.display = "inline-flex";
    phoneLink.style.alignItems = "center";
    phoneLink.title = "انقر للاتصال";

    phoneLink.addEventListener("mouseenter", function () {
      this.style.color = "#e56b00";
      this.style.textDecoration = "underline";
    });

    phoneLink.addEventListener("mouseleave", function () {
      this.style.color = "#ff7800";
      this.style.textDecoration = "none";
    });

    phoneCell.appendChild(phoneLink);

    const locationCell = document.createElement("td");
    locationCell.textContent = member.location;
    locationCell.style.padding = "12px 15px";
    locationCell.style.borderBottom = "1px solid #e5e7eb";

    row.appendChild(nameCell);
    row.appendChild(phoneCell);
    row.appendChild(locationCell);

    tableBody.appendChild(row);
  });

  tableElement.appendChild(tableBody);
  tableContainer.appendChild(tableElement);

  // add the back button
  const backButtonContainer = document.createElement("div");
  backButtonContainer.style.marginTop = "20px";
  backButtonContainer.style.textAlign = "center";

  const backButton = document.createElement("button");
  backButton.innerHTML =
    '<i class="fas fa-arrow-right"></i> العودة إلى معلومات اللجنة';
  backButton.style.padding = "12px 24px";
  backButton.style.fontSize = "1rem";
  backButton.style.fontWeight = "600";
  backButton.style.backgroundColor = "#6b7280";
  backButton.style.color = "white";
  backButton.style.border = "none";
  backButton.style.borderRadius = "6px";
  backButton.style.cursor = "pointer";
  backButton.style.transition = "all 0.3s ease";

  // add the hover effects to the back button
  backButton.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#4b5563";
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.3)";
  });

  backButton.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#6b7280";
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "none";
  });

  // add the click event to the back button
  backButton.addEventListener("click", function () {
    renderInfoPanelForCity(tabId, cityId);
  });

  backButtonContainer.appendChild(backButton);

  // add the content to the info-content
  infoContent.appendChild(infoMessage);
  infoContent.appendChild(tableContainer);
  infoContent.appendChild(backButtonContainer);
}

/**
 * Show confirmation dialog for city update all
 */
function showCityUpdateAllConfirmation(lang) {
  // Create modal backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop-confirmation";
  backdrop.style.position = "fixed";
  backdrop.style.top = "0";
  backdrop.style.left = "0";
  backdrop.style.width = "100%";
  backdrop.style.height = "100%";
  backdrop.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  backdrop.style.zIndex = "10000";
  backdrop.style.display = "flex";
  backdrop.style.alignItems = "center";
  backdrop.style.justifyContent = "center";

  // Create confirmation modal
  const modal = document.createElement("div");
  modal.className = "confirmation-modal";
  modal.style.backgroundColor = "white";
  modal.style.borderRadius = "12px";
  modal.style.padding = "30px";
  modal.style.maxWidth = "450px";
  modal.style.width = "90%";
  modal.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
  modal.style.textAlign = "center";
  modal.style.direction = "rtl";
  modal.style.fontFamily = '"Cairo", sans-serif';

  // Create icon
  const icon = document.createElement("div");
  icon.innerHTML = '<i class="fas fa-sync-alt"></i>';
  icon.style.fontSize = "3rem";
  icon.style.color = "#28a745";
  icon.style.marginBottom = "20px";

  // Create title
  const title = document.createElement("h3");
  title.textContent = lang === "ar" ? "تحديث جميع البيانات" : "Update All Data";
  title.style.margin = "0 0 15px 0";
  title.style.color = "#2c3e50";
  title.style.fontSize = "1.5rem";
  title.style.fontWeight = "bold";

  // Create message
  const message = document.createElement("p");
  message.textContent = lang === "ar" 
    ? "هل أنت متأكد من أنك تريد تحديث جميع بيانات المدينة؟ سيتم حفظ جميع التغييرات المدخلة."
    : "Are you sure you want to update all city data? All entered changes will be saved.";
  message.style.margin = "0 0 25px 0";
  message.style.color = "#7f8c8d";
  message.style.fontSize = "1rem";
  message.style.lineHeight = "1.5";

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "15px";
  buttonContainer.style.justifyContent = "center";

  // Create confirm button
  const confirmButton = document.createElement("button");
  confirmButton.textContent = lang === "ar" ? "تأكيد التحديث" : "Confirm Update";
  confirmButton.style.padding = "12px 25px";
  confirmButton.style.backgroundColor = "#28a745";
  confirmButton.style.color = "white";
  confirmButton.style.border = "none";
  confirmButton.style.borderRadius = "6px";
  confirmButton.style.fontSize = "1rem";
  confirmButton.style.fontWeight = "600";
  confirmButton.style.cursor = "pointer";
  confirmButton.style.transition = "all 0.3s ease";

  confirmButton.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#218838";
    this.style.transform = "translateY(-2px)";
  });

  confirmButton.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#28a745";
    this.style.transform = "translateY(0)";
  });

  confirmButton.addEventListener("click", function () {
    // Remove the confirmation modal
    document.body.removeChild(backdrop);
    
    // Execute the update
    executeCityUpdateAll(lang);
  });

  // Create cancel button
  const cancelButton = document.createElement("button");
  cancelButton.textContent = lang === "ar" ? "إلغاء" : "Cancel";
  cancelButton.style.padding = "12px 25px";
  cancelButton.style.backgroundColor = "#6c757d";
  cancelButton.style.color = "white";
  cancelButton.style.border = "none";
  cancelButton.style.borderRadius = "6px";
  cancelButton.style.fontSize = "1rem";
  cancelButton.style.fontWeight = "600";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.transition = "all 0.3s ease";

  cancelButton.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#5a6268";
    this.style.transform = "translateY(-2px)";
  });

  cancelButton.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#6c757d";
    this.style.transform = "translateY(0)";
  });

  cancelButton.addEventListener("click", function () {
    document.body.removeChild(backdrop);
  });

  // Assemble modal
  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(cancelButton);

  modal.appendChild(icon);
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(buttonContainer);

  backdrop.appendChild(modal);

  // Add to document
  document.body.appendChild(backdrop);

  // Close on backdrop click
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) {
      document.body.removeChild(backdrop);
    }
  });
}

/**
 * Execute city update all and show success message
 */
function executeCityUpdateAll(lang) {
  // Close the info panel
  hideInfoPanel();

  // Show success notification
  showCityUpdateSuccessNotification(lang);
}

/**
 * Show success notification for city update
 */
function showCityUpdateSuccessNotification(lang) {
  // Create notification container
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#28a745";
  notification.style.color = "white";
  notification.style.padding = "20px 25px";
  notification.style.borderRadius = "10px";
  notification.style.boxShadow = "0 4px 15px rgba(40, 167, 69, 0.3)";
  notification.style.zIndex = "10001";
  notification.style.direction = "rtl";
  notification.style.fontFamily = '"Cairo", sans-serif';
  notification.style.maxWidth = "350px";
  notification.style.transform = "translateX(400px)";
  notification.style.transition = "transform 0.3s ease";

  // Create content
  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.alignItems = "center";
  content.style.gap = "12px";

  const icon = document.createElement("i");
  icon.className = "fas fa-check-circle";
  icon.style.fontSize = "1.5rem";

  const text = document.createElement("span");
  text.textContent = lang === "ar" 
    ? "تم تحديث جميع بيانات المدينة بنجاح!"
    : "All city data updated successfully!";
  text.style.fontSize = "1rem";
  text.style.fontWeight = "600";

  content.appendChild(icon);
  content.appendChild(text);
  notification.appendChild(content);

  // Add to document
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * toggle the tabs container (collapsed/expanded)
 */
function toggleTabsContainer() {
  const tabsContainer = document.querySelector(".tabs-container");
  const toggleButton = document.getElementById("tabsToggleBtn");

  if (!tabsContainer) return;

  // toggle the tabs display in a simple and effective way
  const isCurrentlyHidden = tabsContainer.style.display === "none" ||
    tabsContainer.classList.contains("hidden") ||
    tabsContainer.classList.contains("collapsed");

  if (isCurrentlyHidden) {
    // show the tabs
    tabsContainer.style.display = "flex";
    tabsContainer.classList.remove("hidden", "collapsed");
    tabsContainer.classList.add("visible");

    // change the button icon
    if (toggleButton) {
      const icon = toggleButton.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-table-columns";
      }
    }
  } else {
    // hide the tabs
    tabsContainer.style.display = "none";
    tabsContainer.classList.remove("visible");
    tabsContainer.classList.add("hidden", "collapsed");

    // change the button icon
    if (toggleButton) {
      const icon = toggleButton.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-eye-slash";
      }
    }
  }

  // update the map to avoid display issues
  try {
    if (window.map && typeof window.map.invalidateSize === "function") {
      setTimeout(function () {
        window.map.invalidateSize();
      }, 300);
    }
  } catch (e) {
    console.log("Error updating map size:", e);
  }
}

/**
 * display the members details in the info-panel
 */
function showMembersDetails(tabId, neighborhoodId) {
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoContent = document.getElementById("info-content");

  if (!infoPanel || !infoTitle || !infoContent) return;

  const table = tablesData[tabId];
  if (!table || !table.membersData) return;

  // update the title
  infoTitle.innerHTML = `
    <span>تفاصيل أعضاء لجنة الحي - ${selectedNeighborhoodName}</span>
  `;

  // clear the current content
  infoContent.innerHTML = "";

  // create an info message
  const infoMessage = document.createElement("div");
  infoMessage.style.backgroundColor = "#e3f2fd";
  infoMessage.style.border = "1px solid #2196f3";
  infoMessage.style.borderRadius = "8px";
  infoMessage.style.padding = "15px";
  infoMessage.style.margin = "20px";
  infoMessage.style.textAlign = "center";
  infoMessage.style.color = "#1565c0";
  infoMessage.style.fontWeight = "600";
  infoMessage.innerHTML = `
    <i class="fas fa-info-circle" style="margin-left: 8px;"></i>
    قائمة بجميع أعضاء لجنة الحي مع معلومات التواصل
    <br>
    <span style="font-size: 0.9rem; margin-top: 5px; display: inline-block;">
      <i class="fas fa-users" style="margin-left: 5px;"></i>
      إجمالي الأعضاء: ${table.membersData.length} اعضاء
    </span>
  `;

  // create a table container
  const tableContainer = document.createElement("div");
  tableContainer.className = "members-table-container";
  tableContainer.style.padding = "0 20px 20px 20px";

  // create the table
  const tableElement = document.createElement("table");
  tableElement.className = "info-table members-table";
  tableElement.style.border = "2px solid #ddd";
  tableElement.style.borderRadius = "8px";
  tableElement.style.overflow = "hidden";
  tableElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  tableElement.style.width = "100%";

  // create the table header
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["اسم العضو", "رقم الهاتف", "مكان التواجد"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.style.fontSize = "1.1rem";
    th.style.fontWeight = "bold";
    th.style.padding = "12px 15px";
    th.style.backgroundColor = "#1e40af";
    th.style.color = "white";
    th.style.textAlign = "center";
    th.style.borderBottom = "2px solid #ddd";
    headerRow.appendChild(th);
  });

  tableHead.appendChild(headerRow);
  tableElement.appendChild(tableHead);

  // create the table body
  const tableBody = document.createElement("tbody");

  table.membersData.forEach((member, index) => {
    const row = document.createElement("tr");

    // add the zebra striping effect
    if (index % 2 === 0) {
      row.style.backgroundColor = "#f8fafc";
    }

    // add the hover effect
    row.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#e3f2fd";
    });

    row.addEventListener("mouseleave", function () {
      this.style.backgroundColor = index % 2 === 0 ? "#f8fafc" : "white";
    });

    // create the data cells
    const nameCell = document.createElement("td");
    nameCell.textContent = member.name;
    nameCell.style.padding = "12px 15px";
    nameCell.style.borderBottom = "1px solid #e5e7eb";
    nameCell.style.fontWeight = "600";

    const phoneCell = document.createElement("td");
    phoneCell.style.padding = "12px 15px";
    phoneCell.style.borderBottom = "1px solid #e5e7eb";
    phoneCell.style.direction = "ltr";
    phoneCell.style.textAlign = "center";

    // create the phone link
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${member.phone}`;
    phoneLink.innerHTML = `<i class="fas fa-phone" style="margin-left: 5px; font-size: 0.9rem;"></i>${member.phone}`;
    phoneLink.style.color = "#2196f3";
    phoneLink.style.textDecoration = "none";
    phoneLink.style.fontWeight = "600";
    phoneLink.style.transition = "all 0.2s ease";
    phoneLink.style.display = "inline-flex";
    phoneLink.style.alignItems = "center";
    phoneLink.title = "انقر للاتصال";

    phoneLink.addEventListener("mouseenter", function () {
      this.style.color = "#1976d2";
      this.style.textDecoration = "underline";
    });

    phoneLink.addEventListener("mouseleave", function () {
      this.style.color = "#2196f3";
      this.style.textDecoration = "none";
    });

    phoneCell.appendChild(phoneLink);

    const locationCell = document.createElement("td");
    locationCell.textContent = member.location;
    locationCell.style.padding = "12px 15px";
    locationCell.style.borderBottom = "1px solid #e5e7eb";

    row.appendChild(nameCell);
    row.appendChild(phoneCell);
    row.appendChild(locationCell);

    tableBody.appendChild(row);
  });

  tableElement.appendChild(tableBody);
  tableContainer.appendChild(tableElement);

  // add the back button
  const backButtonContainer = document.createElement("div");
  backButtonContainer.style.marginTop = "20px";
  backButtonContainer.style.textAlign = "center";

  const backButton = document.createElement("button");
  backButton.innerHTML =
    '<i class="fas fa-arrow-right"></i> العودة إلى معلومات اللجنة';
  backButton.style.padding = "12px 24px";
  backButton.style.fontSize = "1rem";
  backButton.style.fontWeight = "600";
  backButton.style.backgroundColor = "#6b7280";
  backButton.style.color = "white";
  backButton.style.border = "none";
  backButton.style.borderRadius = "6px";
  backButton.style.cursor = "pointer";
  backButton.style.transition = "all 0.3s ease";

  // add the hover effects to the back button
  backButton.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#4b5563";
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.3)";
  });

  backButton.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#6b7280";
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "none";
  });

  // add the click event to the back button
  backButton.addEventListener("click", function () {
    renderInfoPanel(tabId, neighborhoodId);
  });

  backButtonContainer.appendChild(backButton);

  // add the content to the info-content
  infoContent.appendChild(infoMessage);
  infoContent.appendChild(tableContainer);
  infoContent.appendChild(backButtonContainer);
}

// export the functions for use in other files
window.selectedCityId = selectedCityId;
window.selectedCityName = selectedCityName;
window.setSelectedCity = setSelectedCity;
window.renderInfoPanelForCity = renderInfoPanelForCity;
window.showMembersDetailsForCity = showMembersDetailsForCity;
window.toggleTabsContainer = toggleTabsContainer;

function closeInfoPanel() {
  const infoPanel = document.getElementById("info-panel");
  const backdrop = document.getElementById("modal-backdrop");

  // Add the hide class to trigger the animation
  infoPanel.classList.remove("show");
  if (backdrop) backdrop.classList.remove("show");

  // Reset any active tabs
  const activeTabs = document.querySelectorAll(".tab-button.active");
  activeTabs.forEach((tab) => tab.classList.remove("active"));

  // Clear the content
  const tabContent = document.querySelector(".tab-content");
  if (tabContent) {
    tabContent.innerHTML = "";
  }
}

function updateTabContent(tabId) {
  if (!selectedNeighborhoodId) {
    showWarning();
    return;
  }

  const tabContent = document.querySelector(".tab-content");
  if (!tabContent) return;

  // Show loading state
  tabContent.innerHTML = '<div class="loading">جاري التحميل...</div>';

  // Simulate loading data (replace with actual data fetching)
  setTimeout(() => {
    let content = "";
    switch (tabId) {
      case "info":
        content = generateInfoTabContent();
        break;
      case "statistics":
        content = generateStatisticsTabContent();
        break;
      case "services":
        content = generateServicesTabContent();
        break;
      default:
        content = "<p>المحتوى غير متوفر</p>";
    }
    tabContent.innerHTML = content;

    // Setup editable fields after content is loaded
    setupEditableFields();
  }, 500);
}

function generateInfoTabContent() {
  return `
        <div class="info-section">
            <h3>معلومات الحي</h3>
            <div class="info-field">
                <label>الاسم:</label>
                <span class="editable" data-field="name">${selectedNeighborhoodName}</span>
            </div>
            <div class="info-field">
                <label>المعرف:</label>
                <span>${selectedNeighborhoodId}</span>
            </div>
            <!-- Add more fields as needed -->
        </div>
    `;
}

function generateStatisticsTabContent() {
  return `
        <div class="statistics-section">
            <h3>إحصائيات</h3>
            <div class="stat-item">
                <label>عدد السكان:</label>
                <span class="editable" data-field="population">0</span>
            </div>
            <div class="stat-item">
                <label>المساحة:</label>
                <span class="editable" data-field="area">0</span> كم²
            </div>
            <!-- Add more statistics as needed -->
        </div>
    `;
}

function generateServicesTabContent() {
  return `
        <div class="services-section">
            <h3>الخدمات</h3>
            <div class="service-item">
                <label>المدارس:</label>
                <span class="editable" data-field="schools">0</span>
            </div>
            <div class="service-item">
                <label>المستشفيات:</label>
                <span class="editable" data-field="hospitals">0</span>
            </div>
        </div>
    `;
}

function setupEditableFields() {
  // Implementation of setupEditableFields function
}

function showSaveAllModal(lang) {
  // Remove any existing modal
  let oldModal = document.getElementById("save-all-modal");
  if (oldModal) oldModal.remove();

  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "save-all-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.35)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "4000";

  // Modal content
  const content = document.createElement("div");
  content.style.background = "#fff";
  content.style.borderRadius = "12px";
  content.style.padding = "2.5rem 2.5rem 2rem 2.5rem";
  content.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
  content.style.textAlign = "center";
  content.style.maxWidth = "90vw";
  content.style.minWidth = "260px";

  // Modal text
  const msg = document.createElement("div");
  msg.style.fontSize = "1.15rem";
  msg.style.marginBottom = "1.5rem";
  msg.style.color = "#b91c1c";
  msg.style.fontWeight = "bold";
  msg.textContent =
    window.translations &&
      window.translations[lang] &&
      window.translations[lang].saveAllWarning
      ? window.translations[lang].saveAllWarning
      : lang === "ar"
        ? "سيتم حفظ جميع التغييرات بشكل دائم. هل أنت متأكد من المتابعة؟"
        : "All changes will be saved permanently. Are you sure you want to continue?";
  content.appendChild(msg);

  // Buttons
  const btns = document.createElement("div");
  btns.style.display = "flex";
  btns.style.justifyContent = "center";
  btns.style.gap = "20px";

  const continueBtn = document.createElement("button");
  continueBtn.textContent =
    window.translations &&
      window.translations[lang] &&
      window.translations[lang].continue
      ? window.translations[lang].continue
      : lang === "ar"
        ? "متابعة"
        : "Continue";
  continueBtn.style.background = "#1e40af";
  continueBtn.style.color = "white";
  continueBtn.style.border = "none";
  continueBtn.style.borderRadius = "6px";
  continueBtn.style.padding = "0.7rem 2.2rem";
  continueBtn.style.fontSize = "1.1rem";
  continueBtn.style.fontWeight = "bold";
  continueBtn.style.cursor = "pointer";
  continueBtn.addEventListener("click", function () {
    // Close info-panel and tabs
    document.getElementById("info-panel").classList.remove("show");
    document.getElementById("modal-backdrop").classList.remove("show");
    const tabs = document.querySelector(".tabs-container");
    if (tabs) {
      tabs.classList.remove("visible");
      tabs.classList.add("hidden");
      setTimeout(function () {
        tabs.style.display = "none";
      }, 400);
    }
    modal.remove();
    showSuccessNotification(lang);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent =
    window.translations &&
      window.translations[lang] &&
      window.translations[lang].cancel
      ? window.translations[lang].cancel
      : lang === "ar"
        ? "إلغاء"
        : "Cancel";
  cancelBtn.style.background = "#f3f4f6";
  cancelBtn.style.color = "#4b5563";
  cancelBtn.style.border = "1px solid #ddd";
  cancelBtn.style.borderRadius = "6px";
  cancelBtn.style.padding = "0.7rem 2.2rem";
  cancelBtn.style.fontSize = "1.1rem";
  cancelBtn.style.fontWeight = "bold";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.addEventListener("click", function () {
    modal.remove();
  });

  btns.appendChild(continueBtn);
  btns.appendChild(cancelBtn);
  content.appendChild(btns);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

// Show a beautiful notification at the top of the page
function showSuccessNotification(lang) {
  // Remove any existing notification
  let oldNotif = document.getElementById("success-notification");
  if (oldNotif) oldNotif.remove();

  const notif = document.createElement("div");
  notif.id = "success-notification";
  notif.style.position = "fixed";
  notif.style.top = "40px";
  notif.style.left = "50%";
  notif.style.transform = "translateX(-50%)";
  notif.style.background = "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)";
  notif.style.color = "white";
  notif.style.padding = "1.1rem 2.5rem";
  notif.style.borderRadius = "12px";
  notif.style.boxShadow = "0 4px 24px rgba(34,197,94,0.18)";
  notif.style.fontSize = "1.15rem";
  notif.style.fontWeight = "bold";
  notif.style.zIndex = "5000";
  notif.style.display = "flex";
  notif.style.alignItems = "center";
  notif.style.gap = "12px";
  notif.style.opacity = "0";
  notif.style.transition = "opacity 0.4s";

  // Success icon
  notif.innerHTML = `<span style="font-size:1.6rem;display:flex;align-items:center;">✅</span>`;
  const msg = document.createElement("span");
  msg.textContent =
    window.translations &&
      window.translations[lang] &&
      window.translations[lang].successMessage
      ? window.translations[lang].successMessage
      : lang === "ar"
        ? "تم تحديث جميع البيانات بنجاح!"
        : "All data saved successfully!";
  notif.appendChild(msg);

  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "1";
  }, 10);
  setTimeout(() => {
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 500);
  }, 3500);
}

/**
 * Show confirmation dialog for "Update All" functionality
 * @param {string} lang - Current language (ar/en)
 */
function showUpdateAllConfirmation(lang) {
  // Remove any existing modal
  let oldModal = document.getElementById("update-all-modal");
  if (oldModal) oldModal.remove();

  // Create modal overlay using the same pattern as showSaveAllModal
  const modal = document.createElement("div");
  modal.id = "update-all-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.35)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "4000";

  // Modal content
  const content = document.createElement("div");
  content.style.background = "#fff";
  content.style.borderRadius = "12px";
  content.style.padding = "2.5rem 2.5rem 2rem 2.5rem";
  content.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
  content.style.textAlign = "center";
  content.style.maxWidth = "90vw";
  content.style.minWidth = "260px";
  content.style.direction = lang === "ar" ? "rtl" : "ltr";

  // Modal header
  const header = document.createElement("div");
  header.style.marginBottom = "1.5rem";
  header.style.borderBottom = "1px solid #dee2e6";
  header.style.paddingBottom = "1rem";

  const title = document.createElement("h4");
  title.style.margin = "0";
  title.style.fontSize = "1.25rem";
  title.style.fontWeight = "bold";
  title.style.color = "#333";
  title.textContent = lang === "ar" ? "تأكيد التحديث" : "Confirm Update";
  header.appendChild(title);

  // Modal text
  const msg = document.createElement("div");
  msg.style.fontSize = "1.15rem";
  msg.style.marginBottom = "1.5rem";
  msg.style.color = "#dc3545";
  msg.style.fontWeight = "600";
  msg.style.lineHeight = "1.5";
  msg.textContent =
    lang === "ar"
      ? "هل أنت متأكد من تحديث جميع البيانات؟"
      : "Are you sure you want to update all data?";

  // Buttons container
  const btns = document.createElement("div");
  btns.style.display = "flex";
  btns.style.justifyContent = "center";
  btns.style.gap = "20px";

  // Yes button
  const yesBtn = document.createElement("button");
  yesBtn.textContent = lang === "ar" ? "نعم" : "Yes";
  yesBtn.style.background = "#28a745";
  yesBtn.style.color = "white";
  yesBtn.style.border = "none";
  yesBtn.style.borderRadius = "6px";
  yesBtn.style.padding = "0.7rem 2.2rem";
  yesBtn.style.fontSize = "1.1rem";
  yesBtn.style.fontWeight = "bold";
  yesBtn.style.cursor = "pointer";
  yesBtn.style.transition = "background-color 0.2s ease";

  yesBtn.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#218838";
  });

  yesBtn.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#28a745";
  });

  yesBtn.addEventListener("click", function () {
    modal.remove();
    executeUpdateAll(lang);
  });

  // Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = lang === "ar" ? "إلغاء" : "Cancel";
  cancelBtn.style.background = "#f3f4f6";
  cancelBtn.style.color = "#4b5563";
  cancelBtn.style.border = "1px solid #ddd";
  cancelBtn.style.borderRadius = "6px";
  cancelBtn.style.padding = "0.7rem 2.2rem";
  cancelBtn.style.fontSize = "1.1rem";
  cancelBtn.style.fontWeight = "bold";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.style.transition = "background-color 0.2s ease";

  cancelBtn.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#e5e7eb";
  });

  cancelBtn.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#f3f4f6";
  });

  cancelBtn.addEventListener("click", function () {
    modal.remove();
  });

  // Close modal when clicking backdrop
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Prevent modal from closing when clicking inside content
  content.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Assemble modal structure
  if (lang === "ar") {
    btns.appendChild(yesBtn);
    btns.appendChild(cancelBtn);
  } else {
    btns.appendChild(cancelBtn);
    btns.appendChild(yesBtn);
  }

  content.appendChild(header);
  content.appendChild(msg);
  content.appendChild(btns);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

/**
 * Execute the update all functionality
 * @param {string} lang - Current language (ar/en)
 */
function executeUpdateAll(lang) {
  // Close tabs container
  const tabsContainer = document.querySelector(".tabs-container");
  if (tabsContainer) {
    tabsContainer.style.display = "none";
  }

  // Close info panel
  hideInfoPanel();

  // Show success notification
  showSuccessNotification(lang);
}

/**
 * Show success notification in top-right corner
 * @param {string} lang - Current language (ar/en)
 */
function showSuccessNotification(lang) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.textContent =
    lang === "ar" ? "تم تحديث البيانات بنجاح" : "Data updated successfully";

  // Style the notification
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#28a745";
  notification.style.color = "white";
  notification.style.padding = "1rem 1.5rem";
  notification.style.borderRadius = "0.5rem";
  notification.style.fontSize = "1rem";
  notification.style.fontWeight = "500";
  notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  notification.style.zIndex = "10001";
  notification.style.transform = "translateX(100%)";
  notification.style.transition = "transform 0.3s ease-in-out";
  notification.style.direction = lang === "ar" ? "rtl" : "ltr";
  notification.style.textAlign = lang === "ar" ? "right" : "left";

  // Add icon
  const icon = document.createElement("i");
  icon.className = "fas fa-check-circle";
  icon.style.marginRight = lang === "ar" ? "0" : "0.5rem";
  icon.style.marginLeft = lang === "ar" ? "0.5rem" : "0";

  if (lang === "ar") {
    notification.appendChild(icon);
    notification.insertBefore(
      document.createTextNode(notification.textContent),
      icon
    );
    notification.removeChild(notification.lastChild);
  } else {
    notification.insertBefore(icon, notification.firstChild);
  }

  // Add to DOM
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Initialize tabs toggle button functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Add event listener for the tabsToggleBtn in the HTML
  const tabsToggleBtn = document.getElementById('tabsToggleBtn');
  if (tabsToggleBtn) {
    tabsToggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleTabsContainer();
    });

    // Ensure tabs are hidden by default
    const tabsContainer = document.querySelector(".tabs-container");
    if (tabsContainer) {
      tabsContainer.style.display = "none";
      tabsContainer.classList.remove("visible");
      tabsContainer.classList.add("hidden", "collapsed");

      // Set correct initial icon (eye-slash for hidden state)
      const icon = tabsToggleBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-eye-slash";
      }
    }
  }
});

// Make sure the toggleTabsContainer function is globally accessible
window.toggleTabsContainer = toggleTabsContainer;

// Add missing functions that are referenced in HTML
function showFullscreenPopup() {
  const popup = document.getElementById('fullscreen-popup');
  if (popup) {
    popup.style.display = 'block';
    popup.classList.add('show');
    
    // Show the composite functionality container by default
    const compositeContainer = document.getElementById('composite-functionality-container');
    const sectoralContainer = document.getElementById('sectoral-functionality-container');
    const sectoralMappingContainer = document.getElementById('sectoral-mapping-container');
    
    if (compositeContainer) compositeContainer.style.display = 'flex';
    if (sectoralContainer) sectoralContainer.style.display = 'none';
    if (sectoralMappingContainer) sectoralMappingContainer.style.display = 'none';
  }
}

function showFinalUrbanEffectivenessPopup() {
  // This function can be implemented later when needed
  console.log('showFinalUrbanEffectivenessPopup called');
  alert('هذه الميزة قيد التطوير');
}

// Export the new functions
window.showFullscreenPopup = showFullscreenPopup;
window.showFinalUrbanEffectivenessPopup = showFinalUrbanEffectivenessPopup;

/**
 * toggle the tabs container (collapsed/expanded)
 */
function toggleTabsContainer() {
  const tabsContainer = document.querySelector(".tabs-container");
  const toggleButton = document.getElementById("tabsToggleBtn");

  if (!tabsContainer) return;

  // toggle the tabs display in a simple and effective way
  const isCurrentlyHidden = tabsContainer.style.display === "none" ||
    tabsContainer.classList.contains("hidden") ||
    tabsContainer.classList.contains("collapsed");

  if (isCurrentlyHidden) {
    // show the tabs
    tabsContainer.style.display = "flex";
    tabsContainer.classList.remove("hidden", "collapsed");
    tabsContainer.classList.add("visible");

    // change the button icon
    if (toggleButton) {
      const icon = toggleButton.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-table-columns";
      }
    }
  } else {
    // hide the tabs
    tabsContainer.style.display = "none";
    tabsContainer.classList.remove("visible");
    tabsContainer.classList.add("hidden", "collapsed");

    // change the button icon
    if (toggleButton) {
      const icon = toggleButton.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-eye-slash";
      }
    }
  }

  // update the map to avoid display issues
  try {
    if (window.map && typeof window.map.invalidateSize === "function") {
      setTimeout(function () {
        window.map.invalidateSize();
      }, 300);
    }
  } catch (e) {
    console.log("Error updating map size:", e);
  }
}

/**
 * display the members details in the info-panel
 */
function showMembersDetails(tabId, neighborhoodId) {
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoContent = document.getElementById("info-content");

  if (!infoPanel || !infoTitle || !infoContent) return;

  const table = tablesData[tabId];
  if (!table || !table.membersData) return;

  // update the title
  infoTitle.innerHTML = `
    <span>تفاصيل أعضاء لجنة الحي - ${selectedNeighborhoodName}</span>
  `;

  // clear the current content
  infoContent.innerHTML = "";

  // create an info message
  const infoMessage = document.createElement("div");
  infoMessage.style.backgroundColor = "#e3f2fd";
  infoMessage.style.border = "1px solid #2196f3";
  infoMessage.style.borderRadius = "8px";
  infoMessage.style.padding = "15px";
  infoMessage.style.margin = "20px";
  infoMessage.style.textAlign = "center";
  infoMessage.style.color = "#1565c0";
  infoMessage.style.fontWeight = "600";
  infoMessage.innerHTML = `
    <i class="fas fa-info-circle" style="margin-left: 8px;"></i>
    قائمة بجميع أعضاء لجنة الحي مع معلومات التواصل
    <br>
    <span style="font-size: 0.9rem; margin-top: 5px; display: inline-block;">
      <i class="fas fa-users" style="margin-left: 5px;"></i>
      إجمالي الأعضاء: ${table.membersData.length} اعضاء
    </span>
  `;

  // create a table container
  const tableContainer = document.createElement("div");
  tableContainer.className = "members-table-container";
  tableContainer.style.padding = "0 20px 20px 20px";

  // create the table
  const tableElement = document.createElement("table");
  tableElement.className = "info-table members-table";
  tableElement.style.border = "2px solid #ddd";
  tableElement.style.borderRadius = "8px";
  tableElement.style.overflow = "hidden";
  tableElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  tableElement.style.width = "100%";

  // create the table header
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["اسم العضو", "رقم الهاتف", "مكان التواجد"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.style.fontSize = "1.1rem";
    th.style.fontWeight = "bold";
    th.style.padding = "12px 15px";
    th.style.backgroundColor = "#1e40af";
    th.style.color = "white";
    th.style.textAlign = "center";
    th.style.borderBottom = "2px solid #ddd";
    headerRow.appendChild(th);
  });

  tableHead.appendChild(headerRow);
  tableElement.appendChild(tableHead);

  // create the table body
  const tableBody = document.createElement("tbody");

  table.membersData.forEach((member, index) => {
    const row = document.createElement("tr");

    // add the zebra striping effect
    if (index % 2 === 0) {
      row.style.backgroundColor = "#f8fafc";
    }

    // add the hover effect
    row.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#e3f2fd";
    });

    row.addEventListener("mouseleave", function () {
      this.style.backgroundColor = index % 2 === 0 ? "#f8fafc" : "white";
    });

    // create the data cells
    const nameCell = document.createElement("td");
    nameCell.textContent = member.name;
    nameCell.style.padding = "12px 15px";
    nameCell.style.borderBottom = "1px solid #e5e7eb";
    nameCell.style.fontWeight = "600";

    const phoneCell = document.createElement("td");
    phoneCell.style.padding = "12px 15px";
    phoneCell.style.borderBottom = "1px solid #e5e7eb";
    phoneCell.style.direction = "ltr";
    phoneCell.style.textAlign = "center";

    // create the phone link
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${member.phone}`;
    phoneLink.innerHTML = `<i class="fas fa-phone" style="margin-left: 5px; font-size: 0.9rem;"></i>${member.phone}`;
    phoneLink.style.color = "#2196f3";
    phoneLink.style.textDecoration = "none";
    phoneLink.style.fontWeight = "600";
    phoneLink.style.transition = "all 0.2s ease";
    phoneLink.style.display = "inline-flex";
    phoneLink.style.alignItems = "center";
    phoneLink.title = "انقر للاتصال";

    phoneLink.addEventListener("mouseenter", function () {
      this.style.color = "#1976d2";
      this.style.textDecoration = "underline";
    });

    phoneLink.addEventListener("mouseleave", function () {
      this.style.color = "#2196f3";
      this.style.textDecoration = "none";
    });

    phoneCell.appendChild(phoneLink);

    const locationCell = document.createElement("td");
    locationCell.textContent = member.location;
    locationCell.style.padding = "12px 15px";
    locationCell.style.borderBottom = "1px solid #e5e7eb";

    row.appendChild(nameCell);
    row.appendChild(phoneCell);
    row.appendChild(locationCell);

    tableBody.appendChild(row);
  });

  tableElement.appendChild(tableBody);
  tableContainer.appendChild(tableElement);

  // add the back button
  const backButtonContainer = document.createElement("div");
  backButtonContainer.style.marginTop = "20px";
  backButtonContainer.style.textAlign = "center";

  const backButton = document.createElement("button");
  backButton.innerHTML =
    '<i class="fas fa-arrow-right"></i> العودة إلى معلومات اللجنة';
  backButton.style.padding = "12px 24px";
  backButton.style.fontSize = "1rem";
  backButton.style.fontWeight = "600";
  backButton.style.backgroundColor = "#6b7280";
  backButton.style.color = "white";
  backButton.style.border = "none";
  backButton.style.borderRadius = "6px";
  backButton.style.cursor = "pointer";
  backButton.style.transition = "all 0.3s ease";

  // add the hover effects to the back button
  backButton.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#4b5563";
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.3)";
  });

  backButton.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "#6b7280";
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "none";
  });

  // add the click event to the back button
  backButton.addEventListener("click", function () {
    renderInfoPanel(tabId, neighborhoodId);
  });

  backButtonContainer.appendChild(backButton);

  // add the content to the info-content
  infoContent.appendChild(infoMessage);
  infoContent.appendChild(tableContainer);
  infoContent.appendChild(backButtonContainer);
}
