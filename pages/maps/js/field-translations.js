/**
 * field-translations.js
 * Contains translations for field names in the tabs
 */

// Field translations for all tabs
const fieldTranslations = {
  ar: {
    // Common fields
    id: "معرف",
    neighborhood_id: "معرف الحي",
    status: "الحالة",
    needs: "الاحتياجات",
    
    // التدخلات_الإنسانية
    type: "نوع التدخل",
    start_date: "تاريخ البدء",
    org: "المنظمة المسؤولة",
    
    // الأسواق_الأساسية
    name: "الاسم",
    shops: "عدد المحلات",
    hours: "ساعات العمل",
    
    // إدارة_النفايات_الصلبة
    dumping_sites: "مواقع التفريغ العشوائي",
    cleanliness: "مستوى نظافة الشوارع",
    pest_control: "مكافحة القوارض",
    rubble_removal: "إزالة الأنقاض",
    
    // الحدائق_والمساحات_المعيشية
    coverage: "منطقة الخدمة",
    water: "توفر المياه",
    lighting: "الإضاءة",
    furniture: "أثاث الحدائق",
    
    // المرافق_التعليمية & المراكز_الصحية
    infrastructure: "حالة البنية التحتية",
    staff: "حالة الموظفين",
    supplies: "حالة المستهلكات",
    
    // شبكة_الكهرباء
    transformer_damage: "ضرر المحول",
    line_damage: "ضرر الخط",
    
    // شبكة_الاتصالات
    landline_damage: "ضرر الخط الأرضي",
    tower_damage: "ضرر البرج",
    
    // إمدادات_المياه & شبكة_الصرف_الصحي
    connected: "متصل بالشبكة",
    main_damage: "ضرر رئيسي",
    secondary_damage: "ضرر فرعي",
    main_status: "تشغيل رئيسي",
    secondary_status: "تشغيل فرعي",
    damage_percent: "نسبة الضرر",
    operation_percent: "نسبة التشغيل",
    
    // أضرار_الإسكان
    units_total: "إجمالي الوحدات",
    vacant_units: "الوحدات الشاغرة",
    severe_damage: "ضرر شديد",
    medium_damage: "ضرر متوسط",
    light_damage: "ضرر خفيف",
    undamaged_units: "وحدات سليمة",
    
    // النسيج_الحضري
    urban_area: "المنطقة الحضرية",
    texture_status: "حالة النسيج",
    informal_percent: "نسبة غير الرسمي",
    highrise_percent: "نسبة عالي الارتفاع",
    traditional_percent: "نسبة تقليدي",
    notes: "ملاحظات",
    
    // التغيرات_السكانية
    population: "عدد السكان",
    migrants: "نسبة المهاجرين",
    returnees: "نسبة العائدين",

    // أعضاء لجنة الحي
    mukhtar_name: "اسم المختار",
    members_count: "عدد الأعضاء",
    secretary_name: "اسم أمين السر",
    male_percentage: "نسبة الذكور من الأعضاء",
  },
  en: {
    // Common fields
    id: "ID",
    neighborhood_id: "Neighborhood ID",
    status: "Status",
    needs: "Needs",
    
    // التدخلات_الإنسانية (Humanitarian Interventions)
    type: "Intervention Type",
    start_date: "Start Date",
    org: "Responsible Organization",
    
    // الأسواق_الأساسية (Basic Markets)
    name: "Name",
    shops: "Number of Shops",
    hours: "Working Hours",
    
    // إدارة_النفايات_الصلبة (Solid Waste Management)
    dumping_sites: "Random Dumping Sites",
    cleanliness: "Street Cleanliness Level",
    pest_control: "Pest Control",
    rubble_removal: "Rubble Removal",
    
    // الحدائق_والمساحات_المعيشية (Parks and Living Spaces)
    coverage: "Service Area",
    water: "Water Availability",
    lighting: "Lighting",
    furniture: "Park Furniture",
    
    // المرافق_التعليمية (Educational Facilities) & المراكز_الصحية (Health Centers)
    infrastructure: "Infrastructure Condition",
    staff: "Staff Status",
    supplies: "Supplies Status",
    
    // شبكة_الكهرباء (Electricity Network)
    transformer_damage: "Transformer Damage",
    line_damage: "Line Damage",
    
    // شبكة_الاتصالات (Communications Network)
    landline_damage: "Landline Damage",
    tower_damage: "Tower Damage",
    
    // إمدادات_المياه (Water Supply) & شبكة_الصرف_الصحي (Sewage Network)
    connected: "Connected to Network",
    main_damage: "Main Damage",
    secondary_damage: "Secondary Damage",
    main_status: "Main Operation",
    secondary_status: "Secondary Operation",
    damage_percent: "Damage Percentage",
    operation_percent: "Operation Percentage",
    
    // أضرار_الإسكان (Housing Damage)
    units_total: "Total Units",
    vacant_units: "Vacant Units",
    severe_damage: "Severe Damage",
    medium_damage: "Medium Damage",
    light_damage: "Light Damage",
    undamaged_units: "Undamaged Units",
    
    // النسيج_الحضري (Urban Fabric)
    urban_area: "Urban Area",
    texture_status: "Texture Status",
    informal_percent: "Informal Percentage",
    highrise_percent: "High-rise Percentage",
    traditional_percent: "Traditional Percentage",
    notes: "Notes",
    
    // التغيرات_السكانية (Population Changes)
    population: "Population",
    migrants: "Migrants Percentage",
    returnees: "Returnees Percentage",

    // أعضاء لجنة الحي (Neighborhood Committee Members)
    mukhtar_name: "Mukhtar Name",
    members_count: "Number of Members",
    secretary_name: "Secretary Name",
    male_percentage: "Male Members Percentage",
  }
};

// Status translations
const statusTranslations = {
  ar: {
    // Common statuses
    active: "نشط",
    pending: "معلق",
    completed: "مكتمل",
    cancelled: "ملغى",
    
    // Availability
    available: "متوفر",
    limited: "محدود",
    unavailable: "غير متوفر",
    
    // Quality levels
    good: "جيد",
    medium: "متوسط",
    poor: "ضعيف",
    bad: "سيء",
    
    // Operation status
    fully_operational: "يعمل كاملاً",
    partially_operational: "يعمل جزئياً",
    not_operational: "متوقف",
    
    // Yes/No
    yes: "نعم",
    no: "لا",
  },
  en: {
    // Common statuses
    active: "Active",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    
    // Availability
    available: "Available",
    limited: "Limited",
    unavailable: "Unavailable",
    
    // Quality levels
    good: "Good",
    medium: "Medium",
    poor: "Poor",
    bad: "Bad",
    
    // Operation status
    fully_operational: "Fully Operational",
    partially_operational: "Partially Operational",
    not_operational: "Not Operational",
    
    // Yes/No
    yes: "Yes",
    no: "No",
  }
};

// Make translations available globally
window.fieldTranslations = fieldTranslations;
window.statusTranslations = statusTranslations;
