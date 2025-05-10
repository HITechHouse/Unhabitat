/**
 * tabs.js
 * يدير وظائف التبويب وعرض البيانات
 */

// متغيرات عامة
let selectedNeighborhoodId = null;
let selectedNeighborhoodName = null;
let isFirstSelection = true;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// بيانات نموذجية للجداول
const tablesData = {
  التدخلات_الإنسانية: {
    fields: [
      { name: "معرف التدخل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "نوع التدخل", key: "type", editable: true, type: "select", options: ["مساعدات غذائية", "مساعدات طبية", "مساعدات سكنية", "مساعدات تعليمية"] },
      { name: "تاريخ البدء", key: "start_date", editable: true, type: "date" },
      { name: "المنظمة المسؤولة", key: "org", editable: true, type: "text" },
      { name: "الحالة", key: "status", editable: true, type: "select", options: ["نشط", "معلق", "مكتمل", "ملغى"] },
    ],
    sampleData: {
      id: "INT-001",
      neighborhood_id: "",
      type: "مساعدات غذائية",
      start_date: "2024-06-01",
      org: "الهلال الأحمر",
      status: "نشط",
    },
  },
  الأسواق_الأساسية: {
    fields: [
      { name: "معرف السوق", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم السوق", key: "name", editable: true, type: "text" },
      { name: "عدد المحلات", key: "shops", editable: true, type: "number", min: 0 },
      { name: "ساعات العمل", key: "hours", editable: true, type: "text" },
    ],
    sampleData: {
      id: "MKT-001",
      neighborhood_id: "",
      name: "سوق باب الحديد",
      shops: "62",
      hours: "8 صباحًا - 6 مساءً",
    },
  },
  إدارة_النفايات_الصلبة: {
    fields: [
      { name: "معرف إدارة النفايات", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "مواقع التفريغ العشوائي", key: "dumping_sites", editable: true, type: "select", options: ["منخفضة", "متوسطة", "مرتفعة", "عالية جداً"] },
      { name: "مستوى نظافة الشوارع", key: "cleanliness", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "سيئة"] },
      { name: "مكافحة القوارض", key: "pest_control", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "غير كافية"] },
      { name: "إزالة الأنقاض", key: "rubble_removal", editable: true, type: "select", options: ["مكتملة", "جارية", "متوقفة", "غير مطلوبة"] },
      { name: "حالة التشغيل", key: "status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف", "غير متوفر"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "WSM-001",
      neighborhood_id: "",
      dumping_sites: "مرتفعة",
      cleanliness: "ضعيفة",
      pest_control: "غير كافية",
      rubble_removal: "جارية",
      status: "يعمل جزئيًا",
      needs: "زيادة عدد الحاويات والنقل المنتظم",
    },
  },
  الحدائق_والمساحات_المعيشية: {
    fields: [
      { name: "معرف الحديقة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "منطقة الخدمة", key: "coverage", editable: true, type: "text" },
      { name: "توفر المياه", key: "water", editable: true, type: "select", options: ["متوفرة", "محدودة", "غير متوفرة"] },
      { name: "الإضاءة", key: "lighting", editable: true, type: "select", options: ["جيدة", "محدودة", "غير متوفرة"] },
      { name: "أثاث الحدائق", key: "furniture", editable: true, type: "select", options: ["جيدة", "متوسطة", "مهترئة", "غير متوفرة"] },
      { name: "حالة التشغيل", key: "status", editable: true, type: "select", options: ["صالح للاستخدام", "غير صالح للاستخدام", "قيد الصيانة"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "PK-001",
      neighborhood_id: "",
      coverage: "حي الجميلية",
      water: "غير متوفرة",
      lighting: "محدودة",
      furniture: "مهترئة",
      status: "غير صالح للاستخدام",
      needs: "إعادة تأهيل شاملة",
    },
  },
  المرافق_التعليمية: {
    fields: [
      { name: "معرف المرفق", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم المرفق", key: "name", editable: true, type: "text" },
      { name: "منطقة الخدمة", key: "coverage", editable: true, type: "text" },
      { name: "حالة البنية التحتية", key: "infrastructure", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "سيئة"] },
      { name: "حالة الموظفين", key: "staff", editable: true, type: "select", options: ["كاملة", "نقص متوسط", "نقص شديد"] },
      { name: "حالة المستهلكات", key: "supplies", editable: true, type: "select", options: ["كاملة", "متوسطة", "قليلة", "غير متوفرة"] },
      { name: "حالة التشغيل", key: "status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف", "غير متوفر"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "EDU-001",
      neighborhood_id: "",
      name: "مدرسة حلب الأولى",
      coverage: "حي الأعظمية",
      infrastructure: "جيدة",
      staff: "نقص متوسط",
      supplies: "قليلة",
      status: "يعمل جزئيًا",
      needs: "ترميم الصفوف وتزويد بالكتب",
    },
  },
  المراكز_الصحية: {
    fields: [
      { name: "معرف المركز", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم المركز", key: "name", editable: true, type: "text" },
      { name: "منطقة الخدمة", key: "coverage", editable: true, type: "text" },
      { name: "حالة البنية التحتية", key: "infrastructure", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "سيئة"] },
      { name: "حالة الموظفين", key: "staff", editable: true, type: "select", options: ["كاملة", "نقص متوسط", "نقص شديد"] },
      { name: "حالة المستهلكات", key: "supplies", editable: true, type: "select", options: ["كاملة", "متوسطة", "قليلة", "غير متوفرة"] },
      { name: "حالة التشغيل", key: "status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف", "غير متوفر"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "HC-001",
      neighborhood_id: "",
      name: "مركز صلاح الدين",
      coverage: "صلاح الدين وما حوله",
      infrastructure: "متوسطة",
      staff: "مقبولة",
      supplies: "نقص شديد",
      status: "يعمل جزئيًا",
      needs: "معدات طبية ومولد كهربائي",
    },
  },
  شبكة_الكهرباء: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "ضرر المحول", key: "transformer_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر الخط", key: "line_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "حالة الشبكة", key: "status", editable: true, type: "select", options: ["مستقرة", "غير مستقرة", "متوقفة"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "ELE-001",
      neighborhood_id: "",
      transformer_damage: "60%",
      line_damage: "30%",
      status: "غير مستقر",
      needs: "استبدال محول وصيانة الخطوط",
    },
  },
  شبكة_الاتصالات: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "ضرر الخط الأرضي", key: "landline_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر البرج", key: "tower_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "حالة الشبكة", key: "status", editable: true, type: "select", options: ["مستقرة", "ضعيفة", "متوقفة"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "TEL-001",
      neighborhood_id: "",
      landline_damage: "50%",
      tower_damage: "20%",
      status: "ضعيف",
      needs: "إصلاح الشبكة الأرضية",
    },
  },
  إمدادات_المياه: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "متصل بالشبكة", key: "connected", editable: true, type: "select", options: ["نعم", "لا"] },
      { name: "ضرر رئيسي", key: "main_damage", editable: true, type: "select", options: ["منخفض", "متوسط", "مرتفع", "عالٍ جداً"] },
      { name: "ضرر فرعي", key: "secondary_damage", editable: true, type: "select", options: ["منخفض", "متوسط", "مرتفع", "عالٍ جداً"] },
      { name: "تشغيل رئيسي", key: "main_status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف"] },
      { name: "تشغيل فرعي", key: "secondary_status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف"] },
      { name: "نسبة الضرر", key: "damage_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة التشغيل", key: "operation_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "WTR-001",
      neighborhood_id: "",
      connected: "نعم",
      main_damage: "مرتفعة",
      secondary_damage: "متوسطة",
      main_status: "يعمل جزئيًا",
      secondary_status: "ضعيف",
      damage_percent: "55%",
      operation_percent: "40%",
      needs: "إعادة تأهيل الأنابيب",
    },
  },
  شبكة_الصرف_الصحي: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "متصل بالشبكة", key: "connected", editable: true, type: "select", options: ["نعم", "لا"] },
      { name: "ضرر رئيسي", key: "main_damage", editable: true, type: "select", options: ["منخفض", "متوسط", "مرتفع", "عالٍ جداً"] },
      { name: "ضرر فرعي", key: "secondary_damage", editable: true, type: "select", options: ["منخفض", "متوسط", "مرتفع", "عالٍ جداً"] },
      { name: "تشغيل رئيسي", key: "main_status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف"] },
      { name: "تشغيل فرعي", key: "secondary_status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف"] },
      { name: "نسبة الضرر", key: "damage_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة التشغيل", key: "operation_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "SAN-001",
      neighborhood_id: "",
      connected: "نعم",
      main_damage: "60%",
      secondary_damage: "40%",
      main_status: "ضعيف",
      secondary_status: "متوسط",
      damage_percent: "50%",
      operation_percent: "45%",
      needs: "صيانة المجمعات الرئيسية",
    },
  },
  أضرار_الإسكان: {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "إجمالي الوحدات", key: "units_total", editable: true, type: "number", min: 0 },
      { name: "الوحدات الشاغرة", key: "vacant_units", editable: true, type: "number", min: 0 },
      { name: "ضرر شديد", key: "severe_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر متوسط", key: "medium_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر خفيف", key: "light_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "وحدات سليمة", key: "undamaged_units", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "HSD-001",
      neighborhood_id: "",
      units_total: "400",
      vacant_units: "100",
      severe_damage: "40%",
      medium_damage: "30%",
      light_damage: "20%",
      undamaged_units: "10%",
      needs: "إعادة إعمار شاملة",
    },
  },
  النسيج_الحضري: {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "المنطقة الحضرية", key: "urban_area", editable: true, type: "text" },
      { name: "حالة النسيج", key: "texture_status", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "سيئة"] },
      { name: "نسبة غير الرسمي", key: "informal_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة عالي الارتفاع", key: "highrise_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة تقليدي", key: "traditional_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ملاحظات", key: "notes", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "URB-001",
      neighborhood_id: "",
      urban_area: "الميدان",
      texture_status: "مختلط",
      informal_percent: "30%",
      highrise_percent: "20%",
      traditional_percent: "50%",
      notes: "مناطق تقليدية مهددة بالزوال",
    },
  },
  التغيرات_السكانية: {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "عدد السكان", key: "population", editable: true, type: "number", min: 0 },
      { name: "نسبة المهاجرين", key: "migrants", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة العائدين", key: "returnees", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "POP-001",
      neighborhood_id: "",
      population: "23000",
      migrants: "15%",
      returnees: "25%",
      needs: "دعم الإسكان والخدمات العامة",
    },
  },
  "أعضاء لجنة الحي": {
    fields: [
      { name: "معرف مميز", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم المختار", key: "population", editable: true, type: "text" },
      { name: "عدد الأعضاء", key: "migrants", editable: true, type: "number", min: 0, max: 100 },
      { name: "اسم أمين السر", key: "returnees", editable: true, type: "text" },
      { name: "نسبة الذكور من الأعضاء", key: "needs", editable: true, type: "select", options: ["30%", "40%", "50%", "60%", "70%", "80%", "90%"] },
    ],
    sampleData: {
      id: "POP-001",
      neighborhood_id: "",
      population: "عمر بو فاعور",
      migrants: "8",
      returnees: "يسار",
      needs: "60%",
    },
  },
  "معلومات التواصل مع لجنة الحي": {
    fields: [
      { name: "معرف مميز", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "وسيلة التنسيق والتواصل", key: "population", editable: true, type: "select", options: ["عن طريق المختار", "عن طريق أمين السر", "عن طريق الاجتماعات", "عن طريق الهاتف", "عن طريق البريد الإلكتروني"] },
      { name: "رقم الهاتف", key: "migrants", editable: true, type: "tel", pattern: "[0-9]{10}" },
      { name: "تواجد المقر", key: "returnees", editable: true, type: "select", options: ["نعم", "لا"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "POP-001",
      neighborhood_id: "",
      population: "عن طريق المختار",
      migrants: "0999222333",
      returnees: "نعم",
      needs: "دعم الإسكان والخدمات العامة",
    },
  },
};

window.tablesData = tablesData;

// تحديث أسماء الجداول بالعربي
const tableNames = {
  التدخلات_الإنسانية: [
    "معرف التدخل الانساني",
    "معرف الحي",
    "انواع التدخل الانساني",
    "ملاحظات",
  ],
  الأسواق_الأساسية: [
    "معرف السوق الاساسي",
    "معرف الحي",
    "نوع السوق",
    "منطقة الخدمة",
    "عدد المحلات",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  إدارة_النفايات_الصلبة: [
    "معرف إدارة النفايات الصلبة",
    "معرف الحي",
    "مواقع التفريغ العشوائي",
    "مستوى نظافة الشوارع",
    "مكافحة القوارض",
    "ازالة الانقاض",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  الحدائق_والمساحات_المعيشية: [
    "معرف الحدائق والمساحات المعيشية",
    "معرف الحي",
    "منطقة الخدمة",
    "توفر المياه",
    "الاضاءة",
    "أثاث الحدائق",
    "حالة التشغيل",
    "وصف الاحتياجات",
  ],
  المرافق_التعليمية: [
    "معرف المرافق التعليمية",
    "معرف الحي",
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
    "معرف الحي",
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
    "معرف الحي",
    "مستوى ضرر المحول",
    "مستوى ضرر الخط",
    "حالة الشبكة",
    "وصف الاحتياجات",
  ],
  شبكة_الاتصالات: [
    "معرف شبكة الاتصالات",
    "معرف الحي",
    "مستوى ضرر الخط الارضي",
    "مستوى ضرر البرج",
    "حالة الشبكة",
    "وصف الاحتياجات",
  ],
  إمدادات_المياه: [
    "معرف إمدادات المياه",
    "معرف الحي",
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
    "معرف الحي",
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
    "معرف الحي",
    "إجمالي الوحدات السكنية",
    "نسبة الوحدات الشاغرة",
    "نسبة الضرر الشديد",
    "نسبة الضرر المتوسط",
    "نسبة الضرر الخفيف",
    "نسبة الوحدات بدون ضرر",
    "وصف الاحتياجات",
  ],
  النسيج_الحضري: [
    "معرف النسيج الحضري",
    "معرف الحي",
    "المنطقة الحضرية",
    "حالة النسيج الحضري",
    "نسبة الاسكان غير الرسمي",
    "نسبة الاسكان العالي الارتفاع",
    "نسبة الاسكان التقليدي",
    "ملاحظات",
  ],
  التغيرات_السكانية: [
    "معرف التغيرات السكانية",
    "معرف الحي",
    "عدد السكان",
    "نسبة المهاجرين",
    "نسبة العائدين",
    "وصف الاحتياجات",
  ],
  "أعضاء لجنة الحي": [
    "معرف مميز",
    "معرف الحي",
    "اسم المختار",
    "عدد الأعضاء",
    "اسم أمين السر",
    "نسبة الذكور من الأعضاء",
  ],
};

// تهيئة التبويبات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
  initializeTabs();
  setupEventListeners();
  setupDraggablePanel();
  createModalBackdrop();
  createWarningMessage();
  createTabsToggleButton();
});

function createWarningMessage() {
  const warningDiv = document.createElement('div');
  warningDiv.className = 'warning-message';
  warningDiv.id = 'warningMessage';
  warningDiv.textContent = 'يرجى اختيار حي من الخريطة أولاً';
  document.body.appendChild(warningDiv);
}

function showWarning() {
  const warningMessage = document.getElementById('warningMessage');
  warningMessage.classList.add('show');

  // Hide the message after animation
  setTimeout(() => {
    warningMessage.classList.remove('show');
  }, 2000);
}

function setupDraggablePanel() {
  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');

  if (!infoPanel || !infoTitle) return;

  infoTitle.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);

  // Touch events with non-passive option
  infoTitle.addEventListener('touchstart', startDragging, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', stopDragging, { passive: false });
}

function startDragging(e) {
  isDragging = true;
  const infoPanel = document.getElementById('info-panel');

  // Get current panel position
  const rect = infoPanel.getBoundingClientRect();

  // Calculate offset
  if (e.type === 'mousedown') {
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
  } else if (e.type === 'touchstart') {
    e.preventDefault(); // Prevent default touch behavior
    dragOffset.x = e.touches[0].clientX - rect.left;
    dragOffset.y = e.touches[0].clientY - rect.top;
  }

  infoPanel.classList.add('dragging');
}

function drag(e) {
  if (!isDragging) return;

  e.preventDefault(); // Prevent default scrolling behavior
  const infoPanel = document.getElementById('info-panel');

  // Get cursor position
  const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
  const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

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
  const infoPanel = document.getElementById('info-panel');
  if (infoPanel) {
    infoPanel.classList.remove('dragging');
  }
}

function createModalBackdrop() {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop fade";
  document.body.appendChild(backdrop);
  // إخفاء الـ backdrop تلقائيًا عند فتح info-panel
  backdrop.style.display = "none";
  // backdrop.classList.add("show");

  backdrop.addEventListener('click', function () {
    hideInfoPanel();
  });
}

function initializeTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Activate current button and deactivate others
      document.querySelectorAll(".tab-button").forEach((btn) =>
        btn.classList.remove("active")
      );
      this.classList.add("active");

      // Render the info panel with the selected tab's data
      if (selectedNeighborhoodId) {
        renderInfoPanel(tabId, selectedNeighborhoodId);
      } else {
        // If no neighborhood is selected, show empty state or default content
        const infoPanel = document.getElementById('info-panel');
        const tabContent = infoPanel.querySelector('.tab-content');
        if (tabContent) {
          tabContent.innerHTML = `
            <div class="empty-state">
              <p>يرجى تحديد حي لعرض البيانات</p>
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
        if (input.dataset.changed === 'true') {
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
        inputs.forEach(input => input.dataset.changed = 'false');
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

function renderInfoPanel(tabId, neighborhoodId) {
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
  if (window.translations && window.translations[currentLang] && window.translations[currentLang].tabs && window.translations[currentLang].tabs[tabId]) {
    tabName = window.translations[currentLang].tabs[tabId];
  }

  // Set the title and clear content
  infoTitle.innerHTML = `
    <span>${tabName} - ${selectedNeighborhoodName}</span>
    <button class="close-button" onclick="hideInfoPanel()">&times;</button>
  `;
  infoContent.innerHTML = "";

  // Create form container
  const formContainer = document.createElement("form");
  formContainer.className = "info-form";

  // Create table with border
  const tableElement = document.createElement("table");
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
  identifierHeader.style.backgroundColor = "#1e40af";
  identifierHeader.style.color = "white";
  identifierHeader.style.textAlign = "center";

  const valueHeader = document.createElement("th");
  valueHeader.textContent = "القيمة";
  valueHeader.style.fontSize = "1.1rem";
  valueHeader.style.fontWeight = "bold";
  valueHeader.style.padding = "12px 15px";
  valueHeader.style.backgroundColor = "#1e40af";
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
    if (window.fieldTranslations && window.fieldTranslations[currentLang] && window.fieldTranslations[currentLang][field.key]) {
      fieldName = window.fieldTranslations[currentLang][field.key];
    }

    // Create label cell
    const labelCell = document.createElement("td");
    labelCell.textContent = fieldName;
    labelCell.style.fontWeight = "600";
    labelCell.style.padding = "12px 15px";
    labelCell.style.borderRight = "1px solid #ddd";

    // Create value cell
    const valueCell = document.createElement("td");
    valueCell.style.padding = "12px 15px";

    // Create input element
    let inputElement;
    const currentValue = table.sampleData[field.key] || '';

    if (field.editable) {
      if (field.type === 'select' && Array.isArray(field.options)) {
        inputElement = document.createElement("select");
        inputElement.className = "editable-field";

        // Add an empty option first
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "-- اختر --";
        inputElement.appendChild(emptyOption);

        // Add all other options
        field.options.forEach(option => {
          const optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.textContent = option;
          if (option === currentValue) {
            optionElement.selected = true;
          }
          inputElement.appendChild(optionElement);
        });
      } else if (field.type === 'textarea') {
        inputElement = document.createElement("textarea");
        inputElement.className = "editable-field";
        inputElement.value = currentValue;
      } else {
        inputElement = document.createElement("input");
        inputElement.className = "editable-field";

        switch (field.type) {
          case 'number':
            inputElement.type = "number";
            if (field.min !== undefined) inputElement.min = field.min;
            if (field.max !== undefined) inputElement.max = field.max;
            break;
          case 'date':
            inputElement.type = "date";
            break;
          case 'tel':
            inputElement.type = "tel";
            if (field.pattern) inputElement.pattern = field.pattern;
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
    inputElement.dataset.changed = 'false';

    if (field.key === "neighborhood_id") {
      inputElement.value = neighborhoodId;
      inputElement.readOnly = true;
      inputElement.style.backgroundColor = "#f0f0f0";
      inputElement.style.cursor = "not-allowed";
    }

    // Add change event listener for editable fields
    if (field.editable) {
      inputElement.addEventListener('change', function () {
        this.dataset.changed = 'true';
      });
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
  buttonGroup.style.marginTop = "20px";
  buttonGroup.style.padding = "15px";
  buttonGroup.style.backgroundColor = "#f8fafc";
  buttonGroup.style.borderTop = "1px solid #ddd";
  buttonGroup.style.borderRadius = "0 0 8px 8px";
  buttonGroup.style.display = "flex";
  buttonGroup.style.justifyContent = "space-between";
  buttonGroup.style.gap = "15px";

  // Add cancel button
  const cancelButton = document.createElement("button");
  cancelButton.id = "cancel-changes";
  cancelButton.textContent = "إلغاء التعديلات";
  cancelButton.style.flex = "1";
  cancelButton.style.padding = "12px 15px";
  cancelButton.style.fontSize = "1rem";
  cancelButton.style.fontWeight = "600";
  cancelButton.style.backgroundColor = "#f1f5f9";
  cancelButton.style.color = "#4b5563";
  cancelButton.style.border = "1px solid #ddd";
  cancelButton.style.borderRadius = "6px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.transition = "all 0.2s ease";
  cancelButton.addEventListener("click", hideInfoPanel);

  // Add save button
  const saveButton = document.createElement("button");
  saveButton.id = "save-changes";
  saveButton.textContent = "حفظ التغييرات";
  saveButton.style.flex = "1";
  saveButton.style.padding = "12px 15px";
  saveButton.style.fontSize = "1rem";
  saveButton.style.fontWeight = "600";
  saveButton.style.backgroundColor = "#1e40af";
  saveButton.style.color = "white";
  saveButton.style.border = "none";
  saveButton.style.borderRadius = "6px";
  saveButton.style.cursor = "pointer";
  saveButton.style.transition = "all 0.2s ease";
  saveButton.addEventListener("click", function () {
    const inputs = document.querySelectorAll(".editable-field");
    const changes = [];

    inputs.forEach((input) => {
      if (input.dataset.changed === 'true') {
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
      inputs.forEach(input => input.dataset.changed = 'false');
    } else {
      alert("لم يتم إجراء أي تغييرات");
    }
  });

  // Add buttons to button group
  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(saveButton);

  // Add button group to info content
  infoContent.appendChild(buttonGroup);

  // Show the modal and backdrop with a slight delay to ensure smooth animation
  requestAnimationFrame(() => {
    backdrop.classList.add("show");
    infoPanel.classList.add("show");
  });
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

// Function to be called when a neighborhood is selected
function setSelectedNeighborhood(id, name) {
  selectedNeighborhoodId = id;
  selectedNeighborhoodName = name;
  isFirstSelection = false;

  // If there's an active tab, update its content
  const activeTab = document.querySelector(".tab-button.active");
  if (activeTab) {
    const tabId = activeTab.getAttribute("data-tab");
    renderInfoPanel(tabId, id);
  }
}

/**
 * إنشاء زر التبديل للتبويبات
 * يضيف زر دائري في أعلى حاوية التبويبات للطي والتوسيع
 */
function createTabsToggleButton() {
  // Find the footer
  const footer = document.getElementById('mainFooter');
  // إنشاء زر التبديل
  const toggleButton = document.createElement('div');
  toggleButton.className = 'tabs-toggle-btn collapsed'; // إضافة فئة collapsed بشكل افتراضي
  toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>'; // سهم لأعلى للإشارة إلى إمكانية التوسيع
  toggleButton.title = 'طي/توسيع التبويبات';

  // إضافة مستمع حدث النقر
  toggleButton.addEventListener('click', function() {
    toggleTabsContainer();
  });

  // إنشاء حاوية للزر إذا لم تكن موجودة
  let toggleBtnContainer = document.querySelector('.tabs-toggle-btn-container');
  if (!toggleBtnContainer) {
    toggleBtnContainer = document.createElement('div');
    toggleBtnContainer.className = 'tabs-toggle-btn-container';
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
  const tabsContainer = document.querySelector('.tabs-container');
  if (tabsContainer) {
    tabsContainer.classList.add('collapsed');
  }
}

/**
 * تبديل حالة حاوية التبويبات (مطوية/موسعة)
 */
function toggleTabsContainer() {
  const tabsContainer = document.querySelector('.tabs-container');
  const toggleButton = document.querySelector('.tabs-toggle-btn');

  if (!tabsContainer || !toggleButton) return;

  // تبديل الفئة المطوية
  const isCollapsing = !tabsContainer.classList.contains('collapsed');
  tabsContainer.classList.toggle('collapsed');
  toggleButton.classList.toggle('collapsed');

  // تغيير أيقونة الزر بناءً على الحالة
  const icon = toggleButton.querySelector('i');
  if (icon) {
    if (isCollapsing) {
      // عند الطي، تغيير الأيقونة إلى سهم لأعلى
      icon.className = 'fas fa-chevron-up';
    } else {
      // عند التوسيع، تغيير الأيقونة إلى سهم لأسفل
      icon.className = 'fas fa-chevron-down';
    }
  }

  // تحديث الخريطة لتجنب مشاكل العرض
  try {
    if (window.map && typeof window.map.invalidateSize === 'function') {
      setTimeout(function() {
        window.map.invalidateSize();
      }, 300);
    }
  } catch (e) {
    console.log('Error updating map size:', e);
  }
}

// Export functions for use in other files
window.selectedNeighborhoodId = selectedNeighborhoodId;
window.selectedNeighborhoodName = selectedNeighborhoodName;
window.renderInfoPanel = renderInfoPanel;
window.setSelectedNeighborhood = setSelectedNeighborhood;
window.toggleTabsContainer = toggleTabsContainer;

function closeInfoPanel() {
  const infoPanel = document.getElementById('info-panel');
  const backdrop = document.getElementById('modal-backdrop');

  // Add the hide class to trigger the animation
  infoPanel.classList.remove('show');
  backdrop.style.display = 'none';

  // Reset any active tabs
  const activeTabs = document.querySelectorAll('.tab-button.active');
  activeTabs.forEach(tab => tab.classList.remove('active'));

  // Clear the content
  const tabContent = document.querySelector('.tab-content');
  if (tabContent) {
    tabContent.innerHTML = '';
  }
}

function updateTabContent(tabId) {
  if (!selectedNeighborhoodId) {
    showWarning();
    return;
  }

  const tabContent = document.querySelector('.tab-content');
  if (!tabContent) return;

  // Show loading state
  tabContent.innerHTML = '<div class="loading">جاري التحميل...</div>';

  // Simulate loading data (replace with actual data fetching)
  setTimeout(() => {
    let content = '';
    switch (tabId) {
      case 'info':
        content = generateInfoTabContent();
        break;
      case 'statistics':
        content = generateStatisticsTabContent();
        break;
      case 'services':
        content = generateServicesTabContent();
        break;
      default:
        content = '<p>المحتوى غير متوفر</p>';
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