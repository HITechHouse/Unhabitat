/**
 * tabs.js
 * يدير وظائف التبويب وعرض البيانات
 */

// متغيرات عامة
let selectedSectorId = null;
let selectedSectorName = null;
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
};

// تحديث أسماء الجداول بالعربي
const tableNames = {
  التدخلات_الإنسانية: [
    "معرف التدخل الانساني",
    "معرف القطاع",
    "انواع التدخل الانساني",
    "ملاحظات",
  ],
  الأسواق_الأساسية: [
    "معرف السوق الاساسي",
    "معرف القطاع",
    "نوع السوق",
    "منطقة الخدمة",
    "عدد المحلات",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  إدارة_النفايات_الصلبة: [
    "معرف إدارة النفايات الصلبة",
    "معرف القطاع",
    "مواقع التفريغ العشوائي",
    "مستوى نظافة الشوارع",
    "مكافحة القوارض",
    "ازالة الانقاض",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  الحدائق_والمساحات_المعيشية: [
    "معرف الحدائق والمساحات المعيشية",
    "معرف القطاع",
    "منطقة الخدمة",
    "توفر المياه",
    "الاضاءة",
    "أثاث الحدائق",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  المرافق_التعليمية: [
    "معرف المرافق التعليمية",
    "معرف القطاع",
    "اسم المرفق",
    "منطقة الخدمة",
    "حالة البنية التحتية",
    "حالة الموظفين",
    "حالة المستهلكات",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  المراكز_الصحية: [
    "معرف المراكز الصحية",
    "معرف القطاع",
    "اسم المركز",
    "منطقة الخدمة",
    "حالة البنية التحتية",
    "حالة الموظفين",
    "حالة المستهلكات",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  شبكة_الكهرباء: [
    "معرف شبكة الكهرباء",
    "معرف القطاع",
    "مستوى ضرر المحول",
    "مستوى ضرر الخط",
    "حالة الشبكة",
    "وصف الاحتياجات",
  ],
  شبكة_الاتصالات: [
    "معرف شبكة الاتصالات",
    "معرف القطاع",
    "مستوى ضرر الخط الارضي",
    "مستوى ضرر البرج",
    "حالة الشبكة",
    "وصف الاحتياجات",
  ],
  إمدادات_المياه: [
    "معرف إمدادات المياه",
    "معرف القطاع",
    "متصل بالشبكة",
    "مستوى ضرر الامداد الرئيسي",
    "مستوى ضرر الامداد الفرعي",
    "مستوى تشغيل الامداد الرئيسي",
    "مستوى تشغيل الامداد الفرعي",
    "نسبة الضرر",
    "نسبة التشغيل",
    "وصف الاحتياجات",
  ],
  شبكة_الصرف_الصحي: [
    "معرف شبكة الصرف الصحي",
    "معرف القطاع",
    "متصل بالشبكة",
    "مستوى ضرر التجميع الرئيسي",
    "مستوى ضرر التجميع الفرعي",
    "مستوى تشغيل التجميع الرئيسي",
    "مستوى تشغيل التجميع الفرعي",
    "نسبة الضرر",
    "نسبة التشغيل",
    "وصف الاحتياجات",
  ],
  أضرار_الإسكان: [
    "معرف أضرار الاسكان",
    "معرف القطاع",
    "إجمالي الوحدات",
    "نسبة الوحدات الشاغرة",
    "نسبة الضرر الشديد",
    "نسبة الضرر المتوسط",
    "نسبة الضرر الخفيف",
    "نسبة الوحدات بدون ضرر",
    "وصف الاحتياجات",
  ],
  النسيج_الحضري: [
    "معرف النسيج الحضري",
    "معرف القطاع",
    "المنطقة الحضرية",
    "حالة النسيج الحضري",
    "نسبة الاسكان غير الرسمي",
    "نسبة الاسكان العالي الارتفاع",
    "نسبة الاسكان التقليدي",
    "ملاحظات",
  ],
  التغيرات_السكانية: [
    "معرف التغيرات السكانية",
    "معرف القطاع",
    "عدد السكان",
    "نسبة المهاجرين",
    "نسبة العائدين",
    "وصف الاحتياجات",
  ],
  "أعضاء لجنة الحي": [
    "معرف مميز",
    "معرف القطاع",
    "اسم المختار",
    "عدد الأعضاء",
    "اسم أمين السر",
    "نسبة الذكور من الأعضاء",
  ],
};

// تعريف أسماء التابات الجديدة حسب الجداول المطلوبة
const tabNames = [
  "التزود الأساسي",
  "الخدمة الصحية المركزية",
  "البنية التحتية",
  "الخدمات الإدارية",
  "الخدمات الأخرى",
  "قسم النظافة",
  "المنشآت والفعاليات الاقتصادية الأساسية",
  "الاقتصاد الزراعي",
  "تحليل علاقة الشركاء الفاعلين",
];

// تعريف أسماء التابات الجديدة حسب الجداول المطلوبة مع الأيقونات
const tabIcons = [
  "fa-tint", // التزود الأساسي
  "fa-hospital", // الخدمة الصحية المركزية
  "fa-industry", // البنية التحتية
  "fa-briefcase", // الخدمات الإدارية
  "fa-cogs", // الخدمات الأخرى
  "fa-broom", // قسم النظافة
  "fa-store", // المنشآت والفعاليات الاقتصادية الأساسية
  "fa-tractor", // الاقتصاد الزراعي
  "fa-users", // تحليل علاقة الشركاء الفاعلين
];

// دالة إنشاء التابات في الواجهة
function renderTabs() {
  const tabsContainer = document.querySelector(".tabs-container");
  if (!tabsContainer) return;

  // أنشئ عنصر tabs-header إذا لم يكن موجوداً
  let tabsHeader = tabsContainer.querySelector(".tabs-header");
  if (!tabsHeader) {
    tabsHeader = document.createElement("div");
    tabsHeader.className = "tabs-header";
    tabsContainer.appendChild(tabsHeader);
  }
  tabsHeader.innerHTML = "";

  tabNames.forEach((name, idx) => {
    const tabBtn = document.createElement("button");
    tabBtn.className = "tab-button" + (idx === 0 ? " active" : "");
    // أضف الأيقونة
    const icon = document.createElement("i");
    icon.className = `fas ${tabIcons[idx]} tab-icon`;
    tabBtn.appendChild(icon);
    // أضف النص
    const span = document.createElement("span");
    span.textContent = name;
    tabBtn.appendChild(span);
    tabBtn.setAttribute("data-tab", name);
    tabBtn.onclick = function () {
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      // هنا يمكنك استدعاء دالة تحميل بيانات التاب حسب الاسم
      // loadTabData(name);
    };
    tabsHeader.appendChild(tabBtn);
  });
}

// استدعاء الدالة عند تحميل الصفحة أو عند الحاجة
renderTabs();

// تهيئة التبويبات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  initializeTabs();
  setupEventListeners();
  setupDraggablePanel();
  createModalBackdrop();
  createWarningMessage();
  createTabsToggleButton();
});

function createWarningMessage() {
  const warningDiv = document.createElement("div");
  warningDiv.className = "warning-message";
  warningDiv.id = "warningMessage";
  warningDiv.textContent = "يرجى اختيار قطاع من الخريطة أولاً";
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
  backdrop.className = "modal-backdrop";
  document.body.appendChild(backdrop);

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
      if (selectedSectorId) {
        renderInfoPanel(tabId, selectedSectorId);
      } else {
        // If no sector is selected, show empty state or default content
        const infoPanel = document.getElementById("info-panel");
        const tabContent = infoPanel.querySelector(".tab-content");
        if (tabContent) {
          tabContent.innerHTML = `
            <div class="empty-state">
              <p>يرجى تحديد قطاع لعرض البيانات</p>
            </div>
          `;
        }
      }
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

function renderInfoPanel(tabId, sectorId) {
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoContent = document.getElementById("info-content");
  const backdrop = document.querySelector(".modal-backdrop");

  if (!infoPanel || !infoTitle || !infoContent) return;

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
    <span>${tabName} - ${selectedSectorName}</span>
  `;
  infoContent.innerHTML = "";

  // Create form container
  const formContainer = document.createElement("form");
  formContainer.className = "info-form";

  // Create table with border
  const tableElement = document.createElement("table");
  tableElement.className = "info-table";
  tableElement.style.width = "100%";
  tableElement.style.borderCollapse = "collapse";
  tableElement.style.marginBottom = "1rem";

  // Create table header
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Create header cells
  const identifierHeader = document.createElement("th");
  identifierHeader.textContent = "المعرف";
  identifierHeader.style.width = "40%";
  identifierHeader.style.textAlign = "right";
  identifierHeader.style.padding = "12px 15px";
  identifierHeader.style.backgroundColor = "#1e40af";
  identifierHeader.style.color = "white";

  const valueHeader = document.createElement("th");
  valueHeader.textContent = "القيمة";
  valueHeader.style.width = "60%";
  valueHeader.style.textAlign = "right";
  valueHeader.style.padding = "12px 15px";
  valueHeader.style.backgroundColor = "#1e40af";
  valueHeader.style.color = "white";

  // Add header cells to header row
  headerRow.appendChild(identifierHeader);
  headerRow.appendChild(valueHeader);

  // Add header row to table head
  tableHead.appendChild(headerRow);

  // Add table head to table
  tableElement.appendChild(tableHead);

  // Create table body
  const tableBody = document.createElement("tbody");

  // Get sector-specific data
  const sectorData = getSectorData(sectorId, tabId);

  // Create fields as table rows
  table.fields.forEach((field, index) => {
    // Create table row
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #ddd";
    if (index % 2 === 0) {
      row.style.backgroundColor = "#f8fafc";
    }

    // Get field name based on current language
    let fieldName = field.name;
    if (
      window.fieldTranslations &&
      window.fieldTranslations[currentLang] &&
      window.fieldTranslations[currentLang][field.key]
    ) {
      fieldName = window.fieldTranslations[currentLang][field.key];
    }

    // Create label cell (right)
    const labelCell = document.createElement("td");
    labelCell.textContent = fieldName;
    labelCell.style.fontWeight = "600";
    labelCell.style.padding = "2px 10px";
    labelCell.style.borderRight = "1px solid #ddd";
    labelCell.style.textAlign = "right";

    // Create value cell (left)
    const valueCell = document.createElement("td");
    valueCell.style.padding = "2px 10px";

    // Create input element
    let inputElement;
    if (field.type === "select") {
      inputElement = document.createElement("select");
      inputElement.className = "editable-field";
      field.options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        inputElement.appendChild(optionElement);
      });
    } else if (field.type === "multiselect") {
      // Create multiselect container
      inputElement = document.createElement("div");
      inputElement.className = "multiselect-container editable-field";
      inputElement.style.border = "1px solid #e2e8f0";
      inputElement.style.borderRadius = "4px";
      inputElement.style.padding = "6px 8px";
      inputElement.style.minHeight = "40px";
      inputElement.style.backgroundColor = "#fff";
      inputElement.style.cursor = "pointer";
      inputElement.style.position = "relative";
      inputElement.style.fontSize = "0.9rem";
      inputElement.style.transition = "all 0.2s ease";
      inputElement.style.fontFamily = '"Noto Naskh Arabic", sans-serif';

      // Add dropdown arrow like select elements
      inputElement.style.backgroundImage =
        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23555" d="M2 4l4 4 4-4z"/></svg>\')';
      inputElement.style.backgroundRepeat = "no-repeat";
      inputElement.style.backgroundPosition = "right 8px center";
      inputElement.style.paddingRight = "24px";

      // Create selected items display
      const selectedDisplay = document.createElement("div");
      selectedDisplay.className = "selected-items";
      selectedDisplay.style.display = "flex";
      selectedDisplay.style.flexWrap = "wrap";
      selectedDisplay.style.gap = "4px";
      selectedDisplay.style.minHeight = "24px";
      selectedDisplay.style.marginRight = "20px"; // Space for arrow

      // Add placeholder
      const placeholder = document.createElement("span");
      placeholder.className = "multiselect-placeholder";
      placeholder.textContent = "اختر من القائمة...";
      placeholder.style.color = "#9ca3af";
      placeholder.style.fontSize = "0.9rem";
      placeholder.style.fontFamily = '"Noto Naskh Arabic", sans-serif';
      placeholder.style.lineHeight = "24px";
      selectedDisplay.appendChild(placeholder);

      // Create dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "multiselect-dropdown";
      dropdown.style.position = "absolute";
      dropdown.style.bottom = "100%";
      dropdown.style.left = "0";
      dropdown.style.right = "0";
      dropdown.style.backgroundColor = "#fff";
      dropdown.style.border = "1px solid #e2e8f0";
      dropdown.style.borderBottom = "none";
      dropdown.style.borderRadius = "4px 4px 0 0";
      dropdown.style.maxHeight = "200px";
      dropdown.style.overflowY = "auto";
      dropdown.style.display = "none";
      dropdown.style.zIndex = "1000";
      dropdown.style.boxShadow = "0 -2px 8px rgba(0, 0, 0, 0.1)";

      // Add options to dropdown
      field.options.forEach((option) => {
        const optionElement = document.createElement("div");
        optionElement.className = "multiselect-option";
        optionElement.textContent = option;
        optionElement.style.padding = "8px 12px";
        optionElement.style.cursor = "pointer";
        optionElement.style.borderBottom = "1px solid #f0f0f0";
        optionElement.style.fontSize = "0.9rem";
        optionElement.style.fontFamily = '"Noto Naskh Arabic", sans-serif';
        optionElement.style.textAlign = "right";
        optionElement.style.direction = "rtl";
        optionElement.style.backgroundColor = "#fff";
        optionElement.style.transition = "background-color 0.2s ease";

        optionElement.addEventListener("mouseenter", function () {
          if (!this.classList.contains("selected")) {
            this.style.backgroundColor = "#f3f4f6";
          }
        });

        optionElement.addEventListener("mouseleave", function () {
          if (!this.classList.contains("selected")) {
            this.style.backgroundColor = "#fff";
          }
        });

        optionElement.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleOption(option, inputElement, field);
        });

        dropdown.appendChild(optionElement);
      });

      // Toggle dropdown on click
      inputElement.addEventListener("click", function (e) {
        e.stopPropagation();
        const isVisible = dropdown.style.display === "block";

        if (!isVisible) {
          // Calculate available space above and below
          const rect = inputElement.getBoundingClientRect();
          const spaceAbove = rect.top;
          const spaceBelow = window.innerHeight - rect.bottom;
          const dropdownHeight = 200; // max height

          // Decide whether to show above or below
          // Default: show above unless there's not enough space
          if (spaceAbove > 100) {
            // Show above (preferred)
            dropdown.style.bottom = "100%";
            dropdown.style.top = "auto";
            dropdown.style.borderBottom = "none";
            dropdown.style.borderTop = "1px solid #e2e8f0";
            dropdown.style.borderRadius = "4px 4px 0 0";
            dropdown.style.boxShadow = "0 -2px 8px rgba(0, 0, 0, 0.1)";
          } else {
            // Show below (fallback)
            dropdown.style.top = "100%";
            dropdown.style.bottom = "auto";
            dropdown.style.borderTop = "none";
            dropdown.style.borderBottom = "1px solid #e2e8f0";
            dropdown.style.borderRadius = "0 0 4px 4px";
            dropdown.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
          }

          dropdown.style.display = "block";

          // Add focus effect
          this.style.borderColor = "#3b82f6";
          this.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.3)";
        } else {
          dropdown.style.display = "none";
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", function () {
        dropdown.style.display = "none";
        // Remove focus effect
        inputElement.style.borderColor = "#e2e8f0";
        inputElement.style.boxShadow = "none";
      });

      inputElement.appendChild(selectedDisplay);
      inputElement.appendChild(dropdown);

      // Initialize with sector data or sample data
      const fieldValues =
        (sectorData && sectorData[field.key]) ||
        table.sampleData[field.key] ||
        [];
      if (Array.isArray(fieldValues)) {
        fieldValues.forEach((value) => {
          addSelectedItem(value, inputElement, field);
        });
      }
    } else if (field.type === "textarea") {
      inputElement = document.createElement("textarea");
      inputElement.className = "editable-field";
      inputElement.rows = 3;
    } else {
      inputElement = document.createElement("input");
      inputElement.type = field.type || "text";
      inputElement.className = "editable-field";
    }

    // Set input properties
    if (field.type !== "multiselect") {
      // Use sector-specific data if available, otherwise use sample data
      const fieldValue =
        (sectorData && sectorData[field.key]) ||
        table.sampleData[field.key] ||
        "";
      inputElement.value = fieldValue;
      inputElement.style.width = "100%";
      inputElement.style.padding = "8px";
      inputElement.style.border = "1px solid #ddd";
      inputElement.style.borderRadius = "4px";

      // Add placeholder if specified and value is empty
      if (field.placeholder && (!fieldValue || fieldValue === "")) {
        inputElement.placeholder = field.placeholder;
      }
    } else {
      inputElement.style.width = "100%";
    }

    inputElement.dataset.field = field.key;
    inputElement.dataset.table = tabId;

    if (field.editable === false) {
      inputElement.setAttribute("readonly", true);
    }

    // Add input to value cell
    valueCell.appendChild(inputElement);

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

  // تطبيق تنسيق موحد لحاوية الأزرار
  buttonGroup.style.display = "flex";
  buttonGroup.style.justifyContent = "center";
  buttonGroup.style.alignItems = "center";
  buttonGroup.style.gap = "10px";
  buttonGroup.style.padding = "15px 0";
  buttonGroup.style.borderTop = "1px solid #e0e0e0";
  buttonGroup.style.marginTop = "15px";
  buttonGroup.style.direction = "ltr"; // لضمان ترتيب الأزرار من اليسار لليمين

  // Dynamic label based on language
  const lang = document.documentElement.lang || "ar";

  // دالة لتطبيق التنسيق الموحد على الأزرار
  function applyUniformButtonStyling(button) {
    button.style.width = "50px";
    button.style.height = "50px";
    button.style.padding = "0";
    button.style.margin = "0 2px";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.fontSize = "18px";
    button.style.fontWeight = "bold";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.transition = "all 0.3s ease";
    button.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
    button.style.position = "relative";
    button.style.overflow = "hidden";

    // إضافة تأثيرات hover
    button.addEventListener("mouseenter", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
      }
    });

    button.addEventListener("mouseleave", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
      }
    });

    // تطبيق تنسيق الأزرار المعطلة
    const originalDisabled =
      Object.getOwnPropertyDescriptor(button, "disabled") ||
      Object.getOwnPropertyDescriptor(HTMLButtonElement.prototype, "disabled");

    Object.defineProperty(button, "disabled", {
      get: function () {
        return originalDisabled.get
          ? originalDisabled.get.call(this)
          : this._disabled;
      },
      set: function (value) {
        if (originalDisabled.set) {
          originalDisabled.set.call(this, value);
        } else {
          this._disabled = value;
        }

        if (value) {
          this.style.opacity = "0.5";
          this.style.cursor = "not-allowed";
          this.style.transform = "translateY(0)";
          this.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
        } else {
          this.style.opacity = "1";
          this.style.cursor = "pointer";
          this.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
        }
      },
      configurable: true,
    });
  }

  // Add Previous button (left-aligned, icon only, square design)
  const previousButton = document.createElement("button");
  previousButton.id = "previous-tab";
  previousButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
  previousButton.title = lang === "ar" ? "التبويب السابق" : "Previous Tab";
  previousButton.setAttribute("aria-label", previousButton.title);

  // تطبيق التنسيق الموحد
  applyUniformButtonStyling(previousButton);
  previousButton.style.backgroundColor = "#6c757d";
  previousButton.style.color = "white";

  // إضافة tooltip محسن
  previousButton.style.position = "relative";
  const prevTooltip = document.createElement("div");
  prevTooltip.textContent = previousButton.title;
  prevTooltip.style.cssText = `
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 1000;
  `;
  previousButton.appendChild(prevTooltip);

  previousButton.addEventListener("mouseenter", function () {
    prevTooltip.style.opacity = "1";
  });

  previousButton.addEventListener("mouseleave", function () {
    prevTooltip.style.opacity = "0";
  });
  previousButton.addEventListener("click", function () {
    // Find the previous tab
    const activeTab = document.querySelector(".tab-button.active");
    if (activeTab) {
      let prevTab = activeTab.previousElementSibling;
      // Skip non-tab-button siblings
      while (prevTab && !prevTab.classList.contains("tab-button")) {
        prevTab = prevTab.previousElementSibling;
      }
      if (prevTab && prevTab.classList.contains("tab-button")) {
        prevTab.click();
        // Update button states after tab change
        setTimeout(updateButtonStates, 100);
      }
    }
  });

  // Add save button (center-aligned, icon only, square design)
  const saveButton = document.createElement("button");
  saveButton.id = "save-changes";
  saveButton.innerHTML = '<i class="fas fa-save"></i>';
  saveButton.title = lang === "ar" ? "حفظ التغييرات" : "Save Changes";
  saveButton.setAttribute("aria-label", saveButton.title);

  // تطبيق التنسيق الموحد
  applyUniformButtonStyling(saveButton);
  saveButton.style.backgroundColor = "#28a745";
  saveButton.style.color = "white";

  // إضافة tooltip محسن
  const saveTooltip = document.createElement("div");
  saveTooltip.textContent = saveButton.title;
  saveTooltip.style.cssText = `
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 1000;
  `;
  saveButton.appendChild(saveTooltip);

  saveButton.addEventListener("mouseenter", function () {
    saveTooltip.style.opacity = "1";
  });

  saveButton.addEventListener("mouseleave", function () {
    saveTooltip.style.opacity = "0";
  });
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

      // Show success notification
      showSuccessNotification(
        lang === "ar" ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully"
      );

      // Reset the changed flag
      inputs.forEach((input) => (input.dataset.changed = "false"));
    } else {
      showSuccessNotification(
        lang === "ar" ? "لم يتم إجراء أي تغييرات" : "No changes to save"
      );
    }
  });

  // Add Next button (right-aligned, icon only, square design)
  const nextButton = document.createElement("button");
  nextButton.id = "next-tab";
  nextButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
  nextButton.title = lang === "ar" ? "التبويب التالي" : "Next Tab";
  nextButton.setAttribute("aria-label", nextButton.title);

  // تطبيق التنسيق الموحد
  applyUniformButtonStyling(nextButton);
  nextButton.style.backgroundColor = "#007bff";
  nextButton.style.color = "white";

  // إضافة tooltip محسن
  const nextTooltip = document.createElement("div");
  nextTooltip.textContent = nextButton.title;
  nextTooltip.style.cssText = `
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 1000;
  `;
  nextButton.appendChild(nextTooltip);

  nextButton.addEventListener("mouseenter", function () {
    nextTooltip.style.opacity = "1";
  });

  nextButton.addEventListener("mouseleave", function () {
    nextTooltip.style.opacity = "0";
  });
  nextButton.addEventListener("click", function () {
    // Find the next tab
    const activeTab = document.querySelector(".tab-button.active");
    if (activeTab) {
      let nextTab = activeTab.nextElementSibling;
      // Skip non-tab-button siblings
      while (nextTab && !nextTab.classList.contains("tab-button")) {
        nextTab = nextTab.nextElementSibling;
      }
      if (nextTab && nextTab.classList.contains("tab-button")) {
        nextTab.click();
        // Update button states after tab change
        setTimeout(updateButtonStates, 100);
      }
      // Remove the else block that was showing Update All button
    }
  });

  // Check if this is the last tab to show Update All button
  const activeTab = document.querySelector(".tab-button.active");
  const isFirstTab = activeTab && !activeTab.previousElementSibling;
  const isLastTab = activeTab && !activeTab.nextElementSibling;

  // Disable/enable buttons based on position
  if (isFirstTab) {
    previousButton.disabled = true;
  }

  if (isLastTab) {
    nextButton.disabled = true;

    // Add Update All button (special red button for last tab)
    const updateAllButton = document.createElement("button");
    updateAllButton.id = "update-all-btn";
    updateAllButton.innerHTML = '<i class="fas fa-database"></i>';
    updateAllButton.title = lang === "ar" ? "تحديث الجميع" : "Update All";
    updateAllButton.setAttribute("aria-label", updateAllButton.title);

    // تطبيق التنسيق الموحد
    applyUniformButtonStyling(updateAllButton);
    updateAllButton.style.backgroundColor = "#dc3545";
    updateAllButton.style.color = "white";

    // إضافة tooltip محسن
    const updateTooltip = document.createElement("div");
    updateTooltip.textContent = updateAllButton.title;
    updateTooltip.style.cssText = `
      position: absolute;
      bottom: 120%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 1000;
    `;
    updateAllButton.appendChild(updateTooltip);

    updateAllButton.addEventListener("mouseenter", function () {
      updateTooltip.style.opacity = "1";
    });

    updateAllButton.addEventListener("mouseleave", function () {
      updateTooltip.style.opacity = "0";
    });
    updateAllButton.addEventListener("click", function (ev) {
      ev.preventDefault();
      showUpdateAllModal(lang);
    });

    // Add buttons to button group in order: Previous, Save, Update All, Next
    buttonGroup.appendChild(nextButton);
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(updateAllButton);
    buttonGroup.appendChild(previousButton);
  } else {
    // Add buttons to button group in order: Previous, Save, Next (default layout)
    buttonGroup.appendChild(nextButton);
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(previousButton);
  }
  infoContent.appendChild(buttonGroup);

  // Show the panel
  infoPanel.classList.add("show");
  if (backdrop) backdrop.classList.add("show");

  // Update button states when tabs change
  updateButtonStates();
}

// Function to update button states based on current tab position
function updateButtonStates() {
  const activeTab = document.querySelector(".tab-button.active");
  const previousBtn = document.getElementById("previous-tab");
  const nextBtn = document.getElementById("next-tab");

  if (!activeTab || !previousBtn || !nextBtn) return;

  // Check if this is the first tab
  let prevTab = activeTab.previousElementSibling;
  while (prevTab && !prevTab.classList.contains("tab-button")) {
    prevTab = prevTab.previousElementSibling;
  }
  const isFirstTab = !prevTab;

  // Check if this is the last tab
  let nextTab = activeTab.nextElementSibling;
  while (nextTab && !nextTab.classList.contains("tab-button")) {
    nextTab = nextTab.nextElementSibling;
  }
  const isLastTab = !nextTab;

  // Update button states
  previousBtn.disabled = isFirstTab;
  nextBtn.disabled = isLastTab;
}

function hideInfoPanel() {
  const infoPanel = document.getElementById("info-panel");
  const backdrop = document.querySelector(".modal-backdrop");

  if (infoPanel) {
    infoPanel.classList.remove("show");
  }

  if (backdrop) {
    backdrop.classList.remove("show");
  }
}

// Function to be called when a sector is selected
function setSelectedSector(id, name) {
  selectedSectorId = id;
  selectedSectorName = name;
  isFirstSelection = false;

  // If there's an active tab, update its content
  const activeTab = document.querySelector(".tab-button.active");
  if (activeTab) {
    const tabId = activeTab.getAttribute("data-tab");
    renderInfoPanel(tabId, id);
  }
}

// دالة للحصول على بيانات حسب نوع القطاع
function getSectorData(sectorId, tabId) {
  // إذا كان القطاع هو مدينة حلب، استخدم بيانات خاصة
  if (sectorId === "aleppo-city") {
    return getAleppoCityData(tabId);
  }

  // إذا كان قطاع عادي، استخدم البيانات النموذجية
  const table = tablesData[tabId];
  if (table && table.sampleData) {
    return { ...table.sampleData, city: selectedSectorName };
  }

  return null;
}

// دالة للحصول على بيانات مدينة حلب
function getAleppoCityData(tabId) {
  const aleppoCityData = {
    "التزود الأساسي": {
      id: "aleppo-001",
      city: "مدينة حلب",
      supply_type: "المواد الغذائية الأساسية",
      operation_status: "متوفر بشكل اعتيادي",
      priority: "1",
      need_description: "الوضع العام للتزود الأساسي في مدينة حلب مستقر نسبياً",
    },
    "الخدمة الصحية المركزية": {
      id: "aleppo-002",
      city: "مدينة حلب",
      health_facility: "المشفى المركزي (الوطني)",
      construction_status: "متضرر جزئيا",
      building_status: "متضرر بشكل خفيف",
      workers_status: "متاح",
      consumables_status: "متاح بحدود",
      operation_status: "يعمل بشكل مقبول",
      priority: "1",
      need_description:
        "تحتاج المشافي المركزية في حلب إلى تطوير وتحديث المعدات الطبية",
    },
    "البنية التحتية": {
      id: "aleppo-003",
      city: "مدينة حلب",
      infrastructure_facility: "مديرية الكهرباء",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح بحدود",
      consumables_status: "متاح بحدود",
      operation_status: "يعمل بشكل متقطع",
      priority: "1",
      need_description: "شبكة الكهرباء في حلب تحتاج إلى إعادة تأهيل شاملة",
    },
    "الخدمات الإدارية": {
      id: "aleppo-004",
      city: "مدينة حلب",
      administrative_service: "مديرية السجل المدني",
      construction_status: "غير متضرر",
      workers_status: "متاح",
      consumables_status: "متاح",
      operation_status: "يعمل بشكل اعتيادي",
      priority: "2",
      need_description: "الخدمات الإدارية تعمل بكفاءة جيدة",
    },
    "الخدمات الأخرى": {
      id: "aleppo-005",
      city: "مدينة حلب",
      other_service: "سوق الهال المركزي",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح",
      consumables_status: "متاح",
      operation_status: "يعمل بشكل اعتيادي",
      priority: "2",
      need_description: "الأسواق المركزية تحتاج إلى تطوير وتحديث",
    },
    "قسم النظافة": {
      id: "aleppo-006",
      city: "مدينة حلب",
      technical_staff_status: "كادر فني متاح بحدود",
      machinery_status: "آليات متوفرة جزئياً",
      rubble_status: "إزالة الأنقاض مستمرة",
      need_description: "تحتاج حلب إلى تعزيز قسم النظافة بآليات ومعدات حديثة",
    },
    "المنشآت والفعاليات الاقتصادية الأساسية": {
      id: "aleppo-007",
      city: "مدينة حلب",
      facility_name: "المنطقة الصناعية الشيخ نجار",
      facility_type: "منطقة صناعية",
      construction_status: "متضرر جزئيا",
      workers_status: "متاح بحدود",
      consumables_status: "متاح بحدود",
      operation_status: "يعمل بشكل متقطع",
      priority: "1",
      need_description: "المناطق الصناعية في حلب تحتاج إلى إعادة إعمار وتطوير",
    },
    "الاقتصاد الزراعي": {
      id: "aleppo-008",
      city: "مدينة حلب",
      planted_area: "15000",
      working_families: "2500",
      main_agriculture_type: "الزراعة المختلطة والبساتين",
      irrigation_methods: "الري بالرش والتنقيط",
      animal_production: "الأغنام والماعز",
      product_disposal: "الأسواق المحلية والتصدير",
      need_description:
        "القطاع الزراعي في حلب يحتاج إلى دعم التسويق وتطوير طرق الري",
    },
    "تحليل علاقة الشركاء الفاعلين": {
      id: "aleppo-009",
      city: "مدينة حلب",
      potential_partner: "منظمات دولية",
      share_type: ["شراكة", "تشاور", "مراقبة"],
    },
  };

  return aleppoCityData[tabId] || null;
}

/**
 * إنشاء زر التبديل للتبويبات
 * يضيف زر دائري في أعلى حاوية التبويبات للطي والتوسيع
 */
function createTabsToggleButton() {
  // Find the footer
  const footer = document.getElementById("mainFooter");
  // إنشاء زر التبديل
  const toggleButton = document.createElement("div");
  toggleButton.className = "tabs-toggle-btn collapsed"; // إضافة فئة collapsed بشكل افتراضي
  toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>'; // سهم لأعلى للإشارة إلى إمكانية التوسيع
  toggleButton.title = "طي/توسيع التبويبات";

  // إضافة مستمع حدث النقر
  toggleButton.addEventListener("click", function () {
    toggleTabsContainer();
  });

  // إنشاء حاوية للزر إذا لم تكن موجودة
  let toggleBtnContainer = document.querySelector(".tabs-toggle-btn-container");
  if (!toggleBtnContainer) {
    toggleBtnContainer = document.createElement("div");
    toggleBtnContainer.className = "tabs-toggle-btn-container";
    // ضع الحاوية قبل الفوتر مباشرة
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(toggleBtnContainer, footer);
    } else {
      document.body.appendChild(toggleBtnContainer);
    }
  }
  // أضف الزر إلى الحاوية
  toggleBtnContainer.appendChild(toggleButton);

  // جعل tabs-container مطوياً بشكل افتراضي
  const tabsContainer = document.querySelector(".tabs-container");
  if (tabsContainer) {
    tabsContainer.classList.add("collapsed");
  }
}

/**
 * تبديل حالة حاوية التبويبات (مطوية/موسعة)
 */
function toggleTabsContainer() {
  const tabsContainer = document.querySelector(".tabs-container");
  const toggleButton = document.querySelector(".tabs-toggle-btn");

  if (!tabsContainer || !toggleButton) return;

  // تبديل الفئة المطوية
  const isCollapsing = !tabsContainer.classList.contains("collapsed");
  tabsContainer.classList.toggle("collapsed");
  toggleButton.classList.toggle("collapsed");

  // تغيير أيقونة الزر بناءً على الحالة
  const icon = toggleButton.querySelector("i");
  if (icon) {
    if (isCollapsing) {
      // عند الطي، تغيير الأيقونة إلى سهم لأعلى
      icon.className = "fas fa-chevron-up";
    } else {
      // عند التوسيع، تغيير الأيقونة إلى سهم لأسفل
      icon.className = "fas fa-chevron-down";
    }
  }

  // تحديث الخريطة لتجنب مشاكل العرض
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

// Export functions for use in other files
window.selectedSectorId = selectedSectorId;
window.selectedSectorName = selectedSectorName;
window.renderInfoPanel = renderInfoPanel;
window.setSelectedSector = setSelectedSector;
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
  if (!selectedSectorId) {
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
            <h3>معلومات القطاع</h3>
            <div class="info-field">
                <label>الاسم:</label>
                <span class="editable" data-field="name">${selectedSectorName}</span>
            </div>
            <div class="info-field">
                <label>المعرف:</label>
                <span>${selectedSectorId}</span>
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

// إضافة CSS ديناميكي لموضع التابات فوق الفوتر
(function addTabsContainerCSS() {
  const style = document.createElement("style");
  style.innerHTML = `
    .tabs-container {
      position: fixed !important;
      bottom: 50px !important; /* المسافة من أسفل الصفحة */
      z-index: 1200;
      /* يمكنك إضافة أو تعديل بقية التنسيقات هنا */
    }
  `;
  document.head.appendChild(style);
})();

// Add showSaveAllModal and showSuccessNotification functions at the end of the file

function showSaveAllModal(lang) {
  let oldModal = document.getElementById("save-all-modal");
  if (oldModal) oldModal.remove();
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
  const content = document.createElement("div");
  content.style.background = "#fff";
  content.style.borderRadius = "12px";
  content.style.padding = "2.5rem 2.5rem 2rem 2.5rem";
  content.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
  content.style.textAlign = "center";
  content.style.maxWidth = "90vw";
  content.style.minWidth = "260px";
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
    document.getElementById("info-panel").classList.remove("show");
    document.querySelector(".modal-backdrop").classList.remove("show");
    const tabs = document.querySelector(".tabs-container");
    if (tabs) {
      tabs.classList.remove("visible");
      tabs.classList.add("hidden");
      setTimeout(function () {
        tabs.style.display = "none";
      }, 400);
    }
    modal.remove();
    showSuccessNotification(
      lang === "ar"
        ? "تم حفظ جميع البيانات بنجاح!"
        : "All data saved successfully!"
    );
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

function showUpdateAllModal(lang) {
  let oldModal = document.getElementById("update-all-modal");
  if (oldModal) oldModal.remove();
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
  const content = document.createElement("div");
  content.style.background = "#fff";
  content.style.borderRadius = "12px";
  content.style.padding = "2.5rem 2.5rem 2rem 2.5rem";
  content.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
  content.style.textAlign = "center";
  content.style.maxWidth = "90vw";
  content.style.minWidth = "260px";
  const msg = document.createElement("div");
  msg.style.fontSize = "1.15rem";
  msg.style.marginBottom = "1.5rem";
  msg.style.color = "#dc2626";
  msg.style.fontWeight = "bold";
  msg.textContent =
    window.translations &&
    window.translations[lang] &&
    window.translations[lang].updateAllWarning
      ? window.translations[lang].updateAllWarning
      : lang === "ar"
      ? "سيتم تحديث جميع البيانات بشكل دائم. هل أنت متأكد من المتابعة؟"
      : "All data will be updated permanently. Are you sure you want to continue?";
  content.appendChild(msg);
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
  continueBtn.style.background = "#dc2626";
  continueBtn.style.color = "white";
  continueBtn.style.border = "none";
  continueBtn.style.borderRadius = "6px";
  continueBtn.style.padding = "0.7rem 2.2rem";
  continueBtn.style.fontSize = "1.1rem";
  continueBtn.style.fontWeight = "bold";
  continueBtn.style.cursor = "pointer";
  continueBtn.addEventListener("click", function () {
    document.getElementById("info-panel").classList.remove("show");
    document.querySelector(".modal-backdrop").classList.remove("show");
    const tabs = document.querySelector(".tabs-container");
    if (tabs) {
      tabs.classList.remove("visible");
      tabs.classList.add("hidden");
      setTimeout(function () {
        tabs.style.display = "none";
      }, 400);
    }
    modal.remove();
    showSuccessNotification(
      lang === "ar"
        ? "تم تحديث جميع البيانات بنجاح!"
        : "All data updated successfully!"
    );
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

function showSuccessNotification(message) {
  let oldNotif = document.getElementById("success-notification");
  if (oldNotif) oldNotif.remove();
  const notif = document.createElement("div");
  notif.id = "success-notification";
  notif.style.position = "fixed";
  notif.style.top = "40px";
  notif.style.right = "40px";
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
  notif.innerHTML = `<span style="font-size:1.6rem;display:flex;align-items:center;">✅</span>`;
  const msg = document.createElement("span");
  msg.textContent = message;
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

// Helper functions for multiselect
function toggleOption(option, container, field) {
  const selectedDisplay = container.querySelector(".selected-items");
  const existingItem = Array.from(selectedDisplay.children).find(
    (item) => item.textContent.replace("×", "").trim() === option
  );

  if (existingItem) {
    // Remove if already selected
    existingItem.remove();
  } else {
    // Add if not selected
    addSelectedItem(option, container, field);
  }

  // Update the dropdown option appearance
  updateDropdownOptions(container, field);
}

function addSelectedItem(value, container, field) {
  const selectedDisplay = container.querySelector(".selected-items");
  const placeholder = selectedDisplay.querySelector(".multiselect-placeholder");

  // Check if item already exists
  const existingItem = Array.from(selectedDisplay.children).find(
    (item) =>
      item.classList.contains("selected-item") &&
      item.textContent.replace("×", "").trim() === value
  );

  if (existingItem) return; // Don't add duplicates

  // Hide placeholder when adding first item
  if (placeholder) {
    placeholder.style.display = "none";
  }

  const item = document.createElement("span");
  item.className = "selected-item";
  item.style.backgroundColor = "#e3f2fd";
  item.style.color = "#1976d2";
  item.style.padding = "4px 8px";
  item.style.borderRadius = "12px";
  item.style.fontSize = "12px";
  item.style.display = "inline-flex";
  item.style.alignItems = "center";
  item.style.gap = "4px";
  item.style.border = "1px solid #bbdefb";

  const text = document.createElement("span");
  text.textContent = value;

  const removeBtn = document.createElement("span");
  removeBtn.textContent = "×";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.fontWeight = "bold";
  removeBtn.style.marginLeft = "4px";
  removeBtn.style.color = "#d32f2f";

  removeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    item.remove();

    // Show placeholder if no items left
    const remainingItems = selectedDisplay.querySelectorAll(".selected-item");
    if (remainingItems.length === 0 && placeholder) {
      placeholder.style.display = "block";
    }

    updateDropdownOptions(container, field);
  });

  item.appendChild(text);
  item.appendChild(removeBtn);
  selectedDisplay.appendChild(item);
}

function updateDropdownOptions(container, field) {
  const selectedDisplay = container.querySelector(".selected-items");
  const dropdown = container.querySelector(".multiselect-dropdown");
  const selectedItems = selectedDisplay.querySelectorAll(".selected-item");
  const selectedValues = Array.from(selectedItems).map((item) =>
    item.textContent.replace("×", "").trim()
  );

  // Update option styles based on selection
  const options = dropdown.querySelectorAll(".multiselect-option");
  options.forEach((option) => {
    const isSelected = selectedValues.includes(option.textContent);
    if (isSelected) {
      option.classList.add("selected");
      option.style.backgroundColor = "#e3f2fd";
      option.style.color = "#1976d2";
      option.style.fontWeight = "bold";
      // Add checkmark for selected items
      if (!option.querySelector(".checkmark")) {
        const checkmark = document.createElement("span");
        checkmark.className = "checkmark";
        checkmark.textContent = "✓";
        checkmark.style.float = "left";
        checkmark.style.color = "#1976d2";
        checkmark.style.fontWeight = "bold";
        option.appendChild(checkmark);
      }
    } else {
      option.classList.remove("selected");
      option.style.backgroundColor = "#fff";
      option.style.color = "#333";
      option.style.fontWeight = "normal";
      // Remove checkmark
      const checkmark = option.querySelector(".checkmark");
      if (checkmark) {
        checkmark.remove();
      }
    }
  });
}
