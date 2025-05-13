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

// بيانات نموذجية للجداول
const tablesData = {
  التدخلات_الإنسانية: {
    fields: [
      { name: "معرف التدخل", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "نوع التدخل", key: "type", editable: true, type: "select", options: ["مساعدات غذائية", "مساعدات طبية", "مساعدات سكنية", "مساعدات تعليمية"] },
      { name: "تاريخ البدء", key: "start_date", editable: true, type: "date" },
      { name: "المنظمة المسؤولة", key: "org", editable: true, type: "text" },
      { name: "الحالة", key: "status", editable: true, type: "select", options: ["نشط", "معلق", "مكتمل", "ملغى"] },
    ],
    sampleData: {
      id: "INT-001",
      sector_id: "",
      type: "مساعدات غذائية",
      start_date: "2024-06-01",
      org: "الهلال الأحمر",
      status: "نشط",
    },
  },
  الأسواق_الأساسية: {
    fields: [
      { name: "معرف السوق", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "اسم السوق", key: "name", editable: true, type: "text" },
      { name: "عدد المحلات", key: "shops", editable: true, type: "number", min: 0 },
      { name: "ساعات العمل", key: "hours", editable: true, type: "text" },
    ],
    sampleData: {
      id: "MKT-001",
      sector_id: "",
      name: "سوق باب الحديد",
      shops: "62",
      hours: "8 صباحًا - 6 مساءً",
    },
  },
  إدارة_النفايات_الصلبة: {
    fields: [
      { name: "معرف إدارة النفايات", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "مواقع التفريغ العشوائي", key: "dumping_sites", editable: true, type: "select", options: ["منخفضة", "متوسطة", "مرتفعة", "عالية جداً"] },
      { name: "مستوى نظافة الشوارع", key: "cleanliness", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "سيئة"] },
      { name: "مكافحة القوارض", key: "pest_control", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "غير كافية"] },
      { name: "إزالة الأنقاض", key: "rubble_removal", editable: true, type: "select", options: ["مكتملة", "جارية", "متوقفة", "غير مطلوبة"] },
      { name: "حالة التشغيل", key: "status", editable: true, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف", "غير متوفر"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "WSM-001",
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "منطقة الخدمة", key: "coverage", editable: true, type: "text" },
      { name: "توفر المياه", key: "water", editable: true, type: "select", options: ["متوفرة", "محدودة", "غير متوفرة"] },
      { name: "الإضاءة", key: "lighting", editable: true, type: "select", options: ["جيدة", "محدودة", "غير متوفرة"] },
      { name: "أثاث الحدائق", key: "furniture", editable: true, type: "select", options: ["جيدة", "متوسطة", "مهترئة", "غير متوفرة"] },
      { name: "حالة التشغيل", key: "status", editable: true, type: "select", options: ["صالح للاستخدام", "غير صالح للاستخدام", "قيد الصيانة"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "PK-001",
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
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
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
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
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "ضرر المحول", key: "transformer_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر الخط", key: "line_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "حالة الشبكة", key: "status", editable: true, type: "select", options: ["مستقرة", "غير مستقرة", "متوقفة"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "ELE-001",
      sector_id: "",
      transformer_damage: "60%",
      line_damage: "30%",
      status: "غير مستقر",
      needs: "استبدال محول وصيانة الخطوط",
    },
  },
  شبكة_الاتصالات: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "ضرر الخط الأرضي", key: "landline_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر البرج", key: "tower_damage", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "حالة الشبكة", key: "status", editable: true, type: "select", options: ["مستقرة", "ضعيفة", "متوقفة"] },
      { name: "وصف الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "TEL-001",
      sector_id: "",
      landline_damage: "50%",
      tower_damage: "20%",
      status: "ضعيف",
      needs: "إصلاح الشبكة الأرضية",
    },
  },
  إمدادات_المياه: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
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
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
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
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
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
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "المنطقة الحضرية", key: "urban_area", editable: true, type: "text" },
      { name: "حالة النسيج", key: "texture_status", editable: true, type: "select", options: ["جيدة", "متوسطة", "ضعيفة", "سيئة"] },
      { name: "نسبة غير الرسمي", key: "informal_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة عالي الارتفاع", key: "highrise_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة تقليدي", key: "traditional_percent", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ملاحظات", key: "notes", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "URB-001",
      sector_id: "",
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
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "عدد السكان", key: "population", editable: true, type: "number", min: 0 },
      { name: "نسبة المهاجرين", key: "migrants", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة العائدين", key: "returnees", editable: true, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "POP-001",
      sector_id: "",
      population: "23000",
      migrants: "15%",
      returnees: "25%",
      needs: "دعم الإسكان والخدمات العامة",
    },
  },
  "أعضاء لجنة الحي": {
    fields: [
      { name: "معرف مميز", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "اسم المختار", key: "population", editable: true, type: "text" },
      { name: "عدد الأعضاء", key: "migrants", editable: true, type: "number", min: 0, max: 100 },
      { name: "اسم أمين السر", key: "returnees", editable: true, type: "text" },
      { name: "نسبة الذكور من الأعضاء", key: "needs", editable: true, type: "select", options: ["30%", "40%", "50%", "60%", "70%", "80%", "90%"] },
    ],
    sampleData: {
      id: "POP-001",
      sector_id: "",
      population: "عمر بو فاعور",
      migrants: "8",
      returnees: "يسار",
      needs: "60%",
    },
  },
  "معلومات التواصل مع لجنة الحي": {
    fields: [
      { name: "معرف مميز", key: "id", editable: false },
      { name: "معرف القطاع", key: "sector_id", editable: false },
      { name: "وسيلة التنسيق والتواصل", key: "population", editable: true, type: "select", options: ["عن طريق المختار", "عن طريق أمين السر", "عن طريق الاجتماعات", "عن طريق الهاتف", "عن طريق البريد الإلكتروني"] },
      { name: "رقم الهاتف", key: "migrants", editable: true, type: "tel", pattern: "[0-9]{10}" },
      { name: "تواجد المقر", key: "returnees", editable: true, type: "select", options: ["نعم", "لا"] },
      { name: "الاحتياجات", key: "needs", editable: true, type: "textarea" },
    ],
    sampleData: {
      id: "POP-001",
      sector_id: "",
      population: "عن طريق المختار",
      migrants: "0999222333",
      returnees: "نعم",
      needs: "دعم الإسكان والخدمات العامة",
    },
  },
  'التزود الأساسي': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'نوع التزود', key: 'supply_type', editable: true, type: 'select', options: ['مياه', 'كهرباء', 'وقود', 'غاز'] },
      { name: 'حالة التشغيل', key: 'operation_status', editable: true, type: 'select', options: ['يعمل', 'متوقف', 'يعمل جزئياً'] },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' },
      { name: 'أولوية التدخل', key: 'priority', editable: true, type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      supply_type: 'مياه',
      operation_status: 'يعمل جزئياً',
      need_description: 'توفير مضخات إضافية',
      priority: 'عالية'
    }
  },
  'الخدمة الصحية المركزية': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم المنشأة', key: 'facility', editable: true, type: 'text' },
      { name: 'حالة البناء', key: 'construction_status', editable: true, type: 'select', options: ['جيد', 'متوسط', 'سيء'] },
      { name: 'حالة الكادر', key: 'workers_status', editable: true, type: 'select', options: ['مكتمل', 'نقص متوسط', 'نقص شديد'] },
      { name: 'حالة المستهلكات', key: 'consumables_status', editable: true, type: 'select', options: ['كاملة', 'متوسطة', 'قليلة', 'غير متوفرة'] },
      { name: 'حالة التشغيل', key: 'operation_status', editable: true, type: 'select', options: ['يعمل', 'متوقف', 'يعمل جزئياً'] },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' },
      { name: 'أولوية التدخل', key: 'priority', editable: true, type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      facility: 'مشفى حلب المركزي',
      construction_status: 'متوسط',
      workers_status: 'نقص متوسط',
      consumables_status: 'قليلة',
      operation_status: 'يعمل',
      need_description: 'توفير أدوية ومستهلكات طبية',
      priority: 'عالية'
    }
  },
  'البنية التحتية': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم المنشأة', key: 'facility', editable: true, type: 'text' },
      { name: 'حالة البنية التحتية', key: 'infrastructure_status', editable: true, type: 'select', options: ['جيدة', 'متوسطة', 'ضعيفة'] },
      { name: 'حالة الكادر', key: 'workers_status', editable: true, type: 'select', options: ['مكتمل', 'نقص متوسط', 'نقص شديد'] },
      { name: 'حالة المستهلكات', key: 'consumables_status', editable: true, type: 'select', options: ['كاملة', 'متوسطة', 'قليلة', 'غير متوفرة'] },
      { name: 'حالة التشغيل', key: 'operation_status', editable: true, type: 'select', options: ['يعمل', 'متوقف', 'يعمل جزئياً'] },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' },
      { name: 'أولوية التدخل', key: 'priority', editable: true, type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      facility: 'محطة ضخ المياه',
      infrastructure_status: 'ضعيفة',
      workers_status: 'نقص شديد',
      consumables_status: 'غير متوفرة',
      operation_status: 'متوقف',
      need_description: 'إعادة تأهيل المحطة',
      priority: 'عالية'
    }
  },
  'الخدمات الإدارية': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم الخدمة', key: 'service', editable: true, type: 'text' },
      { name: 'حالة البنية التحتية', key: 'infrastructure_status', editable: true, type: 'select', options: ['جيدة', 'متوسطة', 'ضعيفة'] },
      { name: 'حالة الكادر', key: 'workers_status', editable: true, type: 'select', options: ['مكتمل', 'نقص متوسط', 'نقص شديد'] },
      { name: 'حالة المستهلكات', key: 'consumables_status', editable: true, type: 'select', options: ['كاملة', 'متوسطة', 'قليلة', 'غير متوفرة'] },
      { name: 'حالة التشغيل', key: 'operation_status', editable: true, type: 'select', options: ['يعمل', 'متوقف', 'يعمل جزئياً'] },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' },
      { name: 'أولوية التدخل', key: 'priority', editable: true, type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      service: 'خدمة السجل المدني',
      infrastructure_status: 'متوسطة',
      workers_status: 'نقص متوسط',
      consumables_status: 'متوسطة',
      operation_status: 'يعمل جزئياً',
      need_description: 'توفير أوراق رسمية',
      priority: 'متوسطة'
    }
  },
  'الخدمات الأخرى': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم الخدمة', key: 'service', editable: true, type: 'text' },
      { name: 'حالة البنية التحتية', key: 'infrastructure_status', editable: true, type: 'select', options: ['جيدة', 'متوسطة', 'ضعيفة'] },
      { name: 'حالة الكادر', key: 'workers_status', editable: true, type: 'select', options: ['مكتمل', 'نقص متوسط', 'نقص شديد'] },
      { name: 'حالة المستهلكات', key: 'consumables_status', editable: true, type: 'select', options: ['كاملة', 'متوسطة', 'قليلة', 'غير متوفرة'] },
      { name: 'حالة التشغيل', key: 'operation_status', editable: true, type: 'select', options: ['يعمل', 'متوقف', 'يعمل جزئياً'] },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' },
      { name: 'أولوية التدخل', key: 'priority', editable: true, type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      service: 'خدمة بريدية',
      infrastructure_status: 'جيدة',
      workers_status: 'مكتمل',
      consumables_status: 'كاملة',
      operation_status: 'يعمل',
      need_description: 'توسعة مركز الخدمة',
      priority: 'منخفضة'
    }
  },
  'قسم النظافة': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم القسم', key: 'department_name', editable: true, type: 'text' },
      { name: 'حالة الآليات', key: 'machinery_status', editable: true, type: 'text' },
      { name: 'حالة الأنقاض', key: 'rubble_status', editable: true, type: 'text' },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      department_name: 'قسم النظافة الرئيسي',
      machinery_status: 'تحتاج لصيانة',
      rubble_status: 'متراكمة',
      need_description: 'إزالة الأنقاض وصيانة الآليات'
    }
  },
  'المنشآت والفعاليات الاقتصادية الأساسية': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم المنشأة', key: 'facility_name', editable: true, type: 'text' },
      { name: 'نوع المنشأة', key: 'facility_type', editable: true, type: 'text' },
      { name: 'حالة البنية التحتية', key: 'infrastructure_status', editable: true, type: 'select', options: ['جيدة', 'متوسطة', 'ضعيفة'] },
      { name: 'حالة الكادر', key: 'workers_status', editable: true, type: 'select', options: ['مكتمل', 'نقص متوسط', 'نقص شديد'] },
      { name: 'حالة المستهلكات', key: 'consumables_status', editable: true, type: 'select', options: ['كاملة', 'متوسطة', 'قليلة', 'غير متوفرة'] },
      { name: 'حالة التشغيل', key: 'operation_status', editable: true, type: 'select', options: ['يعمل', 'متوقف', 'يعمل جزئياً'] },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' },
      { name: 'أولوية التدخل', key: 'priority', editable: true, type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      facility_name: 'معمل غزل النسيج',
      facility_type: 'صناعي',
      infrastructure_status: 'متوسطة',
      workers_status: 'نقص متوسط',
      consumables_status: 'متوسطة',
      operation_status: 'يعمل جزئياً',
      need_description: 'توفير مواد خام',
      priority: 'متوسطة'
    }
  },
  'الاقتصاد الزراعي': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'المساحة المزروعة', key: 'planted_area', editable: true, type: 'number' },
      { name: 'عدد الأسر العاملة', key: 'working_families', editable: true, type: 'number' },
      { name: 'نوع الزراعة الرئيسية', key: 'main_agriculture_type', editable: true, type: 'text' },
      { name: 'طرق الري', key: 'irrigation_methods', editable: true, type: 'text' },
      { name: 'الإنتاج الحيواني', key: 'animal_production', editable: true, type: 'text' },
      { name: 'تصريف المنتجات', key: 'product_disposal', editable: true, type: 'text' },
      { name: 'وصف الاحتياج', key: 'need_description', editable: true, type: 'textarea' }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      planted_area: 1200,
      working_families: 80,
      main_agriculture_type: 'قمح',
      irrigation_methods: 'ري سطحي',
      animal_production: 'أبقار وأغنام',
      product_disposal: 'بيع محلي',
      need_description: 'توفير بذار وأسمدة'
    }
  },
  'تحليل علاقة الشركاء الفاعلين': {
    fields: [
      { name: 'معرف السجل', key: 'id', editable: false },
      { name: 'اسم المدينة', key: 'city', editable: false },
      { name: 'اسم الشريك', key: 'partner_name', editable: true, type: 'text' },
      { name: 'نوع المشاركة', key: 'participation_type', editable: true, type: 'select', options: ['تمويل', 'تنفيذ', 'دعم لوجستي', 'تدريب'] },
      { name: 'ملاحظات', key: 'notes', editable: true, type: 'textarea' }
    ],
    sampleData: {
      id: '1',
      city: 'حلب',
      partner_name: 'الهلال الأحمر',
      participation_type: 'تمويل',
      notes: 'شريك رئيسي في مشاريع المياه'
    }
  }
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
  'التزود الأساسي',
  'الخدمة الصحية المركزية',
  'البنية التحتية',
  'الخدمات الإدارية',
  'الخدمات الأخرى',
  'قسم النظافة',
  'المنشآت والفعاليات الاقتصادية الأساسية',
  'الاقتصاد الزراعي',
  'تحليل علاقة الشركاء الفاعلين'
];

// تعريف أسماء التابات الجديدة حسب الجداول المطلوبة مع الأيقونات
const tabIcons = [
  'fa-tint', // التزود الأساسي
  'fa-hospital', // الخدمة الصحية المركزية
  'fa-industry', // البنية التحتية
  'fa-briefcase', // الخدمات الإدارية
  'fa-cogs', // الخدمات الأخرى
  'fa-broom', // قسم النظافة
  'fa-store', // المنشآت والفعاليات الاقتصادية الأساسية
  'fa-tractor', // الاقتصاد الزراعي
  'fa-users' // تحليل علاقة الشركاء الفاعلين
];

// دالة إنشاء التابات في الواجهة
function renderTabs() {
  const tabsContainer = document.querySelector('.tabs-container');
  if (!tabsContainer) return;

  // أنشئ عنصر tabs-header إذا لم يكن موجوداً
  let tabsHeader = tabsContainer.querySelector('.tabs-header');
  if (!tabsHeader) {
    tabsHeader = document.createElement('div');
    tabsHeader.className = 'tabs-header';
    tabsContainer.appendChild(tabsHeader);
  }
  tabsHeader.innerHTML = '';

  tabNames.forEach((name, idx) => {
    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab-button' + (idx === 0 ? ' active' : '');
    // أضف الأيقونة
    const icon = document.createElement('i');
    icon.className = `fas ${tabIcons[idx]} tab-icon`;
    tabBtn.appendChild(icon);
    // أضف النص
    const span = document.createElement('span');
    span.textContent = name;
    tabBtn.appendChild(span);
    tabBtn.setAttribute('data-tab', name);
    tabBtn.onclick = function() {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      // هنا يمكنك استدعاء دالة تحميل بيانات التاب حسب الاسم
      // loadTabData(name);
    };
    tabsHeader.appendChild(tabBtn);
  });
}

// استدعاء الدالة عند تحميل الصفحة أو عند الحاجة
renderTabs();

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
  warningDiv.textContent = 'يرجى اختيار قطاع من الخريطة أولاً';
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
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  document.body.appendChild(backdrop);

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
      if (selectedSectorId) {
        renderInfoPanel(tabId, selectedSectorId);
      } else {
        // If no sector is selected, show empty state or default content
        const infoPanel = document.getElementById('info-panel');
        const tabContent = infoPanel.querySelector('.tab-content');
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
  if (window.translations && window.translations[currentLang] && window.translations[currentLang].tabs && window.translations[currentLang].tabs[tabId]) {
    tabName = window.translations[currentLang].tabs[tabId];
  }

  // Set the title and clear content
  infoTitle.innerHTML = `
    <span>${tabName} - ${selectedSectorName}</span>
    <button class="close-button" onclick="hideInfoPanel()">&times;</button>
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
    if (window.fieldTranslations && window.fieldTranslations[currentLang] && window.fieldTranslations[currentLang][field.key]) {
      fieldName = window.fieldTranslations[currentLang][field.key];
    }

    // Create label cell (right)
    const labelCell = document.createElement("td");
    labelCell.textContent = fieldName;
    labelCell.style.fontWeight = "600";
    labelCell.style.padding = "12px 15px";
    labelCell.style.borderRight = "1px solid #ddd";
    labelCell.style.textAlign = "right";

    // Create value cell (left)
    const valueCell = document.createElement("td");
    valueCell.style.padding = "12px 15px";

    // Create input element
    let inputElement;
    if (field.type === "select") {
      inputElement = document.createElement("select");
      inputElement.className = "editable-field";
      field.options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        inputElement.appendChild(optionElement);
      });
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
    inputElement.value = table.sampleData[field.key] || "";
    inputElement.dataset.field = field.key;
    inputElement.dataset.table = tabId;
    inputElement.style.width = "100%";
    inputElement.style.padding = "8px";
    inputElement.style.border = "1px solid #ddd";
    inputElement.style.borderRadius = "4px";
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
  buttonGroup.style.display = "flex";
  buttonGroup.style.justifyContent = "space-between";
  buttonGroup.style.gap = "10px";
  buttonGroup.style.marginTop = "1rem";

  const cancelButton = document.createElement("button");
  cancelButton.id = "cancel-changes";
  cancelButton.textContent = "إلغاء التعديلات";
  cancelButton.style.flex = "1";
  cancelButton.style.padding = "0.6rem 1rem";
  cancelButton.style.border = "none";
  cancelButton.style.borderRadius = "6px";
  cancelButton.style.backgroundColor = "#f3f4f6";
  cancelButton.style.color = "#4b5563";
  cancelButton.style.cursor = "pointer";

  const saveButton = document.createElement("button");
  saveButton.id = "save-changes";
  saveButton.textContent = "حفظ التغييرات";
  saveButton.style.flex = "1";
  saveButton.style.padding = "0.6rem 1rem";
  saveButton.style.border = "none";
  saveButton.style.borderRadius = "6px";
  saveButton.style.backgroundColor = "#1e40af";
  saveButton.style.color = "white";
  saveButton.style.cursor = "pointer";

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(saveButton);

  // Add button group to info content
  infoContent.appendChild(buttonGroup);

  // Show the panel
  infoPanel.classList.add("show");
  if (backdrop) backdrop.classList.add("show");
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
window.selectedSectorId = selectedSectorId;
window.selectedSectorName = selectedSectorName;
window.renderInfoPanel = renderInfoPanel;
window.setSelectedSector = setSelectedSector;
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
  if (!selectedSectorId) {
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
  const style = document.createElement('style');
  style.innerHTML = `
    .tabs-container {
      position: fixed !important;
      left: 0;
      right: 0;
      bottom: 50px !important; /* المسافة من أسفل الصفحة */
      z-index: 1200;
      /* يمكنك إضافة أو تعديل بقية التنسيقات هنا */
    }
  `;
  document.head.appendChild(style);
})();