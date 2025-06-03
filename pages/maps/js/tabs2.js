

let selectedNeighborhoodId = null;
let selectedNeighborhoodName = null;
let isFirstSelection = true;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const tablesData = {
  التدخلات_الإنسانية: {
    fields: [
      { name: "رمز الحي", key: "id", editable: false },
      { name: "اسم الحي", key: "name", editable: false},
      { name: "الصحة", key: "health", editable: false, type: "text"},
      { name: "الغذاء", key: "food", editable: false, type: "text" },
      { name: "اللباس والمعونات السكنية", key: "clothes", editable: false, type: "text" },
      { name: "الايواء والسكن", key: "housing", editable: false, type: "text" },
      { name: "التعليم", key: "edu", editable: false, type: "text" },
      { name: "الدعم النفسي والاسري", key: "learning", editable: false, type: "text" },
      { name: "مشاريع تحسين سبل العيش", key: "incom_improve", editable: false, type: "text" },
      { name: "ملاحظات", key: "needs", editable: false, type: "textarea" },

    ],
    sampleData: {
      id: "INT-001",
      name: "الخالدية",
      health:"جيد",
      food:"مقبول",
      clothes:"ضعيف",
      housing:"ضغيف",
      edu:"مقبول",
      learning:"مقبول",
      incom_improve:"ضعيف",
      needs:"التركيز على الدعم النفسي للأطفال"
    },
  },
  الأسواق_الأساسية: {
    fields: [
      { name: "رمز الحي", key: "id", editable: false },
      { name: "اسم الحي", key: "neighborhood_id", editable: false},
      { name: "نوع السوق", key: "type", editable: false, type: "select", options: ["تجاري تقليدي", "حرفي", "غذائيات"] },
      { name: "المنطقة الخدمية", key: "reigon", editable: false, type: "text" },
      { name: "حالة التشغيل", key: "status", editable: false, type: "select", options: ["يعمل بشكل اعتيادي", "يعمل بشكل مقبول", "يعمل بشكل متقطع", "لا يعمل (معدوم)"] },
      { name: "عدد المحلات", key: "shops", editable: false, type: "number", min: 0 },
      { name: "وصف الاحتياج", key: "descrip", editable: false, type: "text" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "MKT-001",
      neighborhood_id: "",
      type:"حرفي",
      reigon:"المنطقة الخدمية",
      status:"يعمل بشكل اعتيادي",
      shops: "62",
      descrip: "",
      priority: '1',
    },
  },
  إدارة_النفايات_الصلبة: {
    fields: [
      { name: "رمز الحي", key: "id", editable: false },
      { name: "اسم الحي", key: "neighborhood_id", editable: false},
      { name: "مكبات عشوائية", key: "dumping_sites", editable: false, type: "select", options: ["يوجد", "لا يوجد"] },
      { name: "مستوى نظافة الشوارع", key: "cleanliness", editable: false, type: "select", options: ["جيدة", "مقبول", "ضعيف", "معدوم"] },
      { name: "مكافحة القوارض", key: "pest_control", editable: false, type: "select", options: ["دائما", "احيانا", "لا يوجد"]},
      { name: "ترحيل الركام", key: "rubble_removal", editable: false, type: "select", options: ["بشكل دائم", "بشكل جزئي", "لا يوجد ترحيل"] },
      { name: "وصف الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "WSM-001",
      neighborhood_id: "",
      dumping_sites: "يوجد",
      cleanliness: "ضعيف",
      pest_control: "احيانا",
      rubble_removal: "بشكل جزئي",
      needs: "زيادة عدد الحاويات وتفريغها بانتظام ",
      priority: '1',
    },
  },
  الحدائق_والمساحات_المعيشية: {
    fields: [
      { name: "الرمز", key: "id", editable: false },
      { name: "الاسم", key: "name", editable: false },
      { name: "منطقة الخدمة", key: "coverage", editable: false, type: "text" },

      { name: "توفر المياه", key: "water", editable: false, type: "select", options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"] },
      { name: "الإضاءة", key: "lighting", editable: false, type: "select", options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"] },
      { name: "أثاث الحدائق", key: "furniture", editable: false, type: "select", options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"] },

      { name: "حالة التشغيل", key: "status", editable: false, type: "select", options: ["يعمل بشكل اعتيادي", "يعمل بشكل مقبول", "يعمل بشكل متقطع", "لا يعمل (معدوم)"] },
      { name: "وصف الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "PK-001",
      name: "الجميلية",
      coverage: "حي الجميلية",
      water: "متضرر كليا",
      lighting: "متضرر كليا",
      furniture: "متضرر جزئيا",
      status: "يعمل بشكل مقبول",
      needs: "إعادة تأهيل شاملة",
      priority: '1',
    },
  },
  المرافق_التعليمية: {
    fields: [
      { name: "معرف المركز", key: "id", editable: false },
      { name: "رمز المركز", key: "neighborhood_id", editable: false },
      { name: "اسم المركز", key: "name", editable: false, type: "text" },
      { name: "منطقة الخدمة", key: "coverage", editable: false, type: "text" },
      { name: "حالة البنية التحتية", key: "infrastructure", editable: false, type: "select", options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"] },
      { name: "حالة الموظفين", key: "staff", editable: false, type: "select", options: ["متاح", "متاح بحدود", "غير متاح"] },
      { name: "حالة المستهلكات", key: "supplies", editable: false, type: "select", options: ["متاح", "متاح بحدود", "غير متاح"] },
      { name: "حالة التشغيل", key: "status", editable: false, type: "select", options: ["يعمل بشكل اعتيادي", "يعمل بشكل مقبول", "يعمل بشكل متقطع", "لا يعمل (معدوم)"] },
      { name: "وصف الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "HC-001",
      neighborhood_id: "",
      name: "مركز قلعة حلب ",
      coverage: "قلعة حلب وما حوله",
      infrastructure: "غير متضرر",
      staff: "متاح بحدود",
      supplies: "غير متاح",
      status: "يعمل بشكل اعتيادي",
      needs: "ترميم الصفوف وتزويدها بالكتب",
      priority: '1',
    },
  },
  المراكز_الصحية: {
    fields: [
      { name: "معرف المركز", key: "id", editable: false },
      { name: "رمز المركز", key: "neighborhood_id", editable: false },
      { name: "اسم المركز", key: "name", editable: false, type: "text" },
      { name: "منطقة الخدمة", key: "coverage", editable: false, type: "text" },
      { name: "حالة البنية التحتية", key: "infrastructure", editable: false, type: "select", options: ["متضرر كليا", "متضرر جزئيا", "غير متضرر"] },
      { name: "حالة الموظفين", key: "staff", editable: false, type: "select", options: ["متاح", "متاح بحدود", "غير متاح"] },
      { name: "حالة المستهلكات", key: "supplies", editable: false, type: "select", options: ["متاح", "متاح بحدود", "غير متاح"] },
      { name: "حالة التشغيل", key: "status", editable: false, type: "select", options: ["يعمل بشكل اعتيادي", "يعمل بشكل مقبول", "يعمل بشكل متقطع", "لا يعمل (معدوم)"] },
      { name: "وصف الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "HC-001",
      neighborhood_id: "",
      name: "مركز صلاح الدين",
      coverage: "صلاح الدين وما حوله",
      infrastructure: "غير متضرر",
      staff: "متاح بحدود",
      supplies: "غير متاح",
      status: "يعمل بشكل اعتيادي",
      needs: "معدات طبية ومولد كهربائي",
      priority: '1',
    },
  },
  شبكة_الكهرباء: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم الحي", key: "neighborhood_name", type: "text", editable: false },
      { name: "ضرر المحول", key: "transformer_damage", editable: false, type: "select", options: ["شديد", "متوسط", "خفيف", "معدوم"] },
      { name: "ضرر الخط", key: "line_damage", editable: false, type: "select",  options: ["شديد", "متوسط", "خفيف", "معدوم"] },
      { name: "حالة الشبكة", key: "status", editable: false, type: "select", options: ["تعمل", "تعمل جزئيا", "لا تعمل"] },
      { name: "وصف الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      priority: '1',
      id: "ELE-001",
      neighborhood_id: "",
      neighborhood_name:"",
      transformer_damage: "شديد",
      line_damage: "متوسط",
      status: "تعمل",
      needs: "استبدال محول وصيانة الخطوط",
    },
  },
  شبكة_الاتصالات: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم الحي", key: "neighborhood_name", type: "text", editable: false },
      { name: "ضرر المحول", key: "transformer_damage", editable: false, type: "select", options: ["شديد", "متوسط", "خفيف", "معدوم"] },
      { name: "ضرر الخط", key: "line_damage", editable: false, type: "select",  options: ["شديد", "متوسط", "خفيف", "معدوم"] },
      { name: "حالة الشبكة", key: "status", editable: false, type: "select", options: ["تعمل", "تعمل جزئيا", "لا تعمل"] },
      { name: "وصف الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      priority: '1',
      id: "ELE-001",
      neighborhood_id: "",
      neighborhood_name:"",
      transformer_damage: "خفيف",
      line_damage: "متوسط",
      status: "لا تعمل",
      needs: "إصلاح الشبكة الارضية",
    },
  },
  إمدادات_المياه: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم الحي", key: "neighborhood_name", type: "text", editable: false },
      { name: "متصل بالشبكة", key: "connected", editable: false, type: "select", options: ["نعم", "لا"] },
      { name: "الضرر", key: "main_damage", editable: false, type: "select", options: ["منخفض", "متوسط", "مرتفع", "عالٍ جداً"] },
      { name: "نسبة الضرر", key: "damag_ratio", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]},
      { name: "التشغيل", key: "main_status", editable: false, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف"] },
      { name: "نسبة التشغيل", key: "secondary_status", editable: false, type: "select",options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]},
      { name: "الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "WTR-001",
      neighborhood_id: "",
      neighborhood_name:"",
      connected: "نعم",
      main_damage: "مرتفع",
      damag_ratio: "30%",
      main_status: "متوقف",
      secondary_status: "60%",
      needs: "إعادة تأهيل الأنابيب",
      priority: '1',
    },
  },
  شبكة_الصرف_الصحي: {
    fields: [
      { name: "معرف الشبكة", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم الحي", key: "neighborhood_name", type: "text", editable: false },
      { name: "متصل بالشبكة", key: "connected", editable: false, type: "select", options: ["نعم", "لا"] },
      { name: "الضرر", key: "main_damage", editable: false, type: "select", options: ["منخفض", "متوسط", "مرتفع", "عالٍ جداً"] },
      { name: "نسبة الضرر", key: "damag_ratio", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]},
      { name: "التشغيل", key: "main_status", editable: false, type: "select", options: ["يعمل كاملاً", "يعمل جزئياً", "متوقف"] },
      { name: "نسبة التشغيل", key: "secondary_status", editable: false, type: "select",options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]},
      { name: "الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "WTR-001",
      neighborhood_id: "",
      neighborhood_name:"",
      connected: "نعم",
      main_damage: "متوسط",
      damag_ratio: "40%",
      main_status: "يعمل جزئياً",
      secondary_status: "40%",
      needs: "صيانة المجمعات الرئيسية",
      priority: '1',
    },
  },
  أضرار_الإسكان: {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "اسم الحي", key: "neighborhood_name", type: "text" },
      { name: "إجمالي الوحدات", key: "units_total", editable: false, type: "number", min: 0 },
      { name: "الوحدات الشاغرة", key: "vacant_units", editable: false, type: "number", min: 0 },
      { name: "نمط الملكية السائد", key: "documentaion_type", editable: false, type: "select", options: ["طابو زراعي", "طابو نظامي", "كاتب عدل", "غير ذلك"] },
      { name: "التوثيق والحماية", key: "documentaion", editable: false, type: "select", options: ["محمى كلي", "محمي جزئي", "غير محمي"] },
      { name: "ضرر شديد", key: "severe_damage", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر متوسط", key: "medium_damage", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "ضرر خفيف", key: "light_damage", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "وحدات سليمة", key: "undamaged_units", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الملاحظات", key: "notes", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      id: "HSD-001",
      neighborhood_id: "13",
      neighborhood_name: "التلل",
      units_total: "400",
      vacant_units: "100",
      documentaion_type: "طابو نظامي",
      documentaion: "محمي جزئي",
      severe_damage: "40%",
      medium_damage: "30%",
      light_damage: "20%",
      undamaged_units: "10%",
      notes: "",
      priority: '1',
    },
  },
  النسيج_الحضري: {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: " اسم الحي", key: "urban_area", editable: false, type: "text" },
      { name: " المساحة العمرانية", key: "texture_status", editable: false, type: "number", },
      { name: "الحالة العمرانية", key: "urbn_status", editable: false, type: "select", options: ["منظم", "عشوائي", "بلدة قديمة", "مختلط"] },
      { name: "السكن العشوائي", key: "informal_percent", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة المساكن الطابقية", key: "highrise_percent", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة المساكن التقليدية", key: "traditional_percent", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الوظيفة العمرانية السائدة", key: "urbn_func", editable: false, type: "select", options: ["سكني", "سكني تجاري", "تجاري", "خدمي", "إداري", "سياحي", "حرفي", "مختلط"] },
      { name: "ملاحظات", key: "notes", editable: false, type: "textarea" },
    ],
    sampleData: {
      id: "URB-001",
      neighborhood_id: "",
      urban_area: "الميدان",
      texture_status: "10000",
      urbn_status: "بلدة قديمة",
      informal_percent: "30%",
      highrise_percent: "20%",
      traditional_percent: "50%",
      urbn_func: "سكني",
      notes: "مناطق تقليدية مهددة بالزوال",
    },
  },
  التغيرات_السكانية: {
    fields: [
      { name: "معرف السجل", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "عدد السكان", key: "population", editable: false, type: "number", min: 0 },
      { name: "نسبة المهاجرين", key: "migrants", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "نسبة العائدين", key: "returnees", editable: false, type: "select", options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"] },
      { name: "الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      priority: '1',
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
      { name: "اسم المختار", key: "mukhtar_name", editable: false, type: "text" },
      { name: "عدد الأعضاء", key: "members_count", editable: false, type: "number", min: 0, max: 100 },
      { name: "اسم أمين السر", key: "secretary_name", editable: false, type: "text" },
      { name: "نسبة الذكور من الأعضاء", key: "male_percentage", editable: false, type: "select", options: ["30%", "40%", "50%", "60%", "70%", "80%", "90%"] },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      priority: '1',
      id: "POP-001",
      neighborhood_id: "",
      mukhtar_name: "عمر بو فاعور",
      members_count: "8",
      secretary_name: "يسار",
      male_percentage: "60%",
    },
  },
  "معلومات التواصل مع لجنة الحي": {
    fields: [
      { name: "معرف مميز", key: "id", editable: false },
      { name: "معرف الحي", key: "neighborhood_id", editable: false },
      { name: "وسيلة التنسيق والتواصل", key: "population", editable: false, type: "select", options: ["عن طريق المختار", "عن طريق أمين السر", "عن طريق الاجتماعات", "عن طريق الهاتف", "عن طريق البريد الإلكتروني"] },
      { name: "رقم الهاتف", key: "migrants", editable: false, type: "tel", pattern: "[0-9]{10}" },
      { name: "تواجد المقر", key: "returnees", editable: false, type: "select", options: ["نعم", "لا"] },
      { name: "الاحتياجات", key: "needs", editable: false, type: "textarea" },
      { name: 'أولوية التدخل', key: 'priority', editable: false, type: 'select', options: ['1', '2', '3'] }
    ],
    sampleData: {
      priority: '1',
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
  const backdrop = document.getElementById("modal-backdrop");

  if (!infoPanel || !infoTitle || !infoContent) return;

  // Show the backdrop and panel
  if (backdrop) backdrop.classList.add('show');
  infoPanel.classList.add('show');

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
    labelCell.style.padding = "2px 10px";
    labelCell.style.borderRight = "1px solid #ddd";

    // Create value cell
    const valueCell = document.createElement("td");
    valueCell.style.padding = "2px 10px";

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
  // Dynamic label based on language
  const lang = document.documentElement.lang || "ar";
  cancelButton.textContent = (window.translations && window.translations[lang] && window.translations[lang].nextTab)
    ? window.translations[lang].nextTab
    : (lang === "ar" ? "التالي" : "Next");
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
  // Change behavior: go to next tab, or show save all on last tab
  cancelButton.addEventListener("click", function (e) {
    e.preventDefault();
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
      let nextTab = activeTab.nextElementSibling;
      // Skip non-tab-button siblings (e.g., text nodes)
      while (nextTab && !nextTab.classList.contains('tab-button')) {
        nextTab = nextTab.nextElementSibling;
      }
      if (nextTab && nextTab.classList.contains('tab-button')) {
        // Simulate a real click on the next tab
        nextTab.click();
      } else {
        // Last tab: replace buttons with Save All button
        buttonGroup.innerHTML = '';
        const saveAllBtn = document.createElement('button');
        saveAllBtn.id = 'save-all-btn';
        saveAllBtn.textContent = (window.translations && window.translations[lang] && window.translations[lang].saveAllData)
          ? window.translations[lang].saveAllData
          : (lang === 'ar' ? 'حفظ جميع البيانات' : 'Save All Data');
        saveAllBtn.style.flex = '1';
        saveAllBtn.style.padding = '12px 15px';
        saveAllBtn.style.fontSize = '1rem';
        saveAllBtn.style.fontWeight = '600';
        saveAllBtn.style.backgroundColor = '#1e40af';
        saveAllBtn.style.color = 'white';
        saveAllBtn.style.border = 'none';
        saveAllBtn.style.borderRadius = '6px';
        saveAllBtn.style.cursor = 'pointer';
        saveAllBtn.style.transition = 'all 0.2s ease';
        saveAllBtn.addEventListener('click', function (ev) {
          ev.preventDefault();
          showSaveAllModal(lang);
        });
        buttonGroup.appendChild(saveAllBtn);
      }
    }
  });

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
  const backdrop = document.getElementById("modal-backdrop");

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
  toggleButton.addEventListener('click', function () {
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
      setTimeout(function () {
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
  if (backdrop) backdrop.classList.remove('show');

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

function showSaveAllModal(lang) {
  // Remove any existing modal
  let oldModal = document.getElementById('save-all-modal');
  if (oldModal) oldModal.remove();

  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'save-all-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.35)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '4000';

  // Modal content
  const content = document.createElement('div');
  content.style.background = '#fff';
  content.style.borderRadius = '12px';
  content.style.padding = '2.5rem 2.5rem 2rem 2.5rem';
  content.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  content.style.textAlign = 'center';
  content.style.maxWidth = '90vw';
  content.style.minWidth = '260px';

  // Modal text
  const msg = document.createElement('div');
  msg.style.fontSize = '1.15rem';
  msg.style.marginBottom = '1.5rem';
  msg.style.color = '#b91c1c';
  msg.style.fontWeight = 'bold';
  msg.textContent = (window.translations && window.translations[lang] && window.translations[lang].saveAllWarning)
    ? window.translations[lang].saveAllWarning
    : (lang === 'ar' ? 'سيتم حفظ جميع التغييرات بشكل دائم. هل أنت متأكد من المتابعة؟' : 'All changes will be saved permanently. Are you sure you want to continue?');
  content.appendChild(msg);

  // Buttons
  const btns = document.createElement('div');
  btns.style.display = 'flex';
  btns.style.justifyContent = 'center';
  btns.style.gap = '20px';

  const continueBtn = document.createElement('button');
  continueBtn.textContent = (window.translations && window.translations[lang] && window.translations[lang].continue)
    ? window.translations[lang].continue
    : (lang === 'ar' ? 'متابعة' : 'Continue');
  continueBtn.style.background = '#1e40af';
  continueBtn.style.color = 'white';
  continueBtn.style.border = 'none';
  continueBtn.style.borderRadius = '6px';
  continueBtn.style.padding = '0.7rem 2.2rem';
  continueBtn.style.fontSize = '1.1rem';
  continueBtn.style.fontWeight = 'bold';
  continueBtn.style.cursor = 'pointer';
  continueBtn.addEventListener('click', function () {
    // Close info-panel and tabs
    document.getElementById('info-panel').classList.remove('show');
    document.getElementById('modal-backdrop').classList.remove('show');
    const tabs = document.querySelector('.tabs-container');
    if (tabs) {
      tabs.classList.remove('visible');
      tabs.classList.add('hidden');
      setTimeout(function () { tabs.style.display = 'none'; }, 400);
    }
    modal.remove();
    showSuccessNotification(lang);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = (window.translations && window.translations[lang] && window.translations[lang].cancel)
    ? window.translations[lang].cancel
    : (lang === 'ar' ? 'إلغاء' : 'Cancel');
  cancelBtn.style.background = '#f3f4f6';
  cancelBtn.style.color = '#4b5563';
  cancelBtn.style.border = '1px solid #ddd';
  cancelBtn.style.borderRadius = '6px';
  cancelBtn.style.padding = '0.7rem 2.2rem';
  cancelBtn.style.fontSize = '1.1rem';
  cancelBtn.style.fontWeight = 'bold';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.addEventListener('click', function () {
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
  let oldNotif = document.getElementById('success-notification');
  if (oldNotif) oldNotif.remove();

  const notif = document.createElement('div');
  notif.id = 'success-notification';
  notif.style.position = 'fixed';
  notif.style.top = '40px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.background = 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
  notif.style.color = 'white';
  notif.style.padding = '1.1rem 2.5rem';
  notif.style.borderRadius = '12px';
  notif.style.boxShadow = '0 4px 24px rgba(34,197,94,0.18)';
  notif.style.fontSize = '1.15rem';
  notif.style.fontWeight = 'bold';
  notif.style.zIndex = '5000';
  notif.style.display = 'flex';
  notif.style.alignItems = 'center';
  notif.style.gap = '12px';
  notif.style.opacity = '0';
  notif.style.transition = 'opacity 0.4s';

  // Success icon
  notif.innerHTML = `<span style="font-size:1.6rem;display:flex;align-items:center;">✅</span>`;
  const msg = document.createElement('span');
  msg.textContent = (window.translations && window.translations[lang] && window.translations[lang].successMessage)
    ? window.translations[lang].successMessage
    : (lang === 'ar' ? 'تم تحديث جميع البيانات بنجاح!' : 'All data saved successfully!');
  notif.appendChild(msg);

  document.body.appendChild(notif);
  setTimeout(() => { notif.style.opacity = '1'; }, 10);
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 3500);
}