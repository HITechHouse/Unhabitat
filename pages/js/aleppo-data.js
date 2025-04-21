// مصفوفة بيانات أحياء حلب
const aleppoNeighborhoods = [
  {
    id: 1,
    name: "ضهرة عواد",
    name_en: "Dahret Awad",
    sector: "قاضي عسكر",
    area: 1932680.72
  },
  {
    id: 4,
    name: "عويجة وتوابعها",
    name_en: "Owaija",
    sector: "هنانو",
    area: 7064658.61
  },
  {
    id: 5,
    name: "حي البكارة وتوابعه",
    name_en: "Al-Bakara",
    sector: "السريان",
    area: 4664113.92
  },
  {
    id: 6,
    name: "الليرمون",
    name_en: "Al-Liramoun",
    sector: "حلب الجديدة",
    area: 4986747.08
  },
  {
    id: 7,
    name: "الرصافة",
    name_en: "Al-Rasafa",
    sector: "السريان",
    area: 5716164.83
  },
  {
    id: 8,
    name: "الشيخ مقصود)2(",
    name_en: "Al-Sheikh Maqsoud 1",
    sector: "السريان",
    area: 5148605.37
  },
  {
    id: 17,
    name: "الشيخ مقصود)1(",
    name_en: "Al-Sheikh Maqsoud 2",
    sector: "السريان",
    area: 296861.07
  },
  {
    id: 18,
    name: "عين التل",
    name_en: "Ein Al-Tal",
    sector: "السليمانية",
    area: 2450888.72
  },
  {
    id: 19,
    name: "حي الباسل",
    name_en: "Al-Basel",
    sector: "هنانو",
    area: 855257.46
  },
  {
    id: 20,
    name: "هنانو)3(",
    name_en: "Hanano 3",
    sector: "هنانو",
    area: 338234.49
  },
  {
    id: 21,
    name: "هنانو)2(",
    name_en: "Hanano 2",
    sector: "هنانو",
    area: 971735.52
  },
  {
    id: 22,
    name: "هنانو)1(",
    name_en: "Hanano 1",
    sector: "هنانو",
    area: 479884.40
  },
  {
    id: 23,
    name: "الحيدرية 2",
    name_en: "Al-Haidarieh 2",
    sector: "هنانو",
    area: 1428008.67
  },
  {
    id: 24,
    name: "تراب الهلك",
    name_en: "Torab Al-Holouk",
    sector: "السليمانية",
    area: 442303.73
  },
  {
    id: 25,
    name: "بستان الباشا",
    name_en: "Bustan Al-Basha",
    sector: "السليمانية",
    area: 787672.30
  },
  {
    id: 26,
    name: "الشيخ فارس",
    name_en: "Al-Sheikh Faris",
    sector: "السليمانية",
    area: 488002.56
  },
  {
    id: 27,
    name: "الحيدرية 1",
    name_en: "Al-Haidarieh 1",
    sector: "هنانو",
    area: 989442.59
  },
  {
    id: 28,
    name: "مقر الأنبياء",
    name_en: "Maqar Al-Anbia'a",
    sector: "باب النيرب",
    area: 12092589.79
  },
  {
    id: 29,
    name: "كرم ميسر",
    name_en: "Karm Miasar",
    sector: "قاضي عسكر",
    area: 1043848.50
  },
  {
    id: 30,
    name: "كرم القاطرجي",
    name_en: "Karm Al-Qatrji",
    sector: "قاضي عسكر",
    area: 904567.85
  },
  {
    id: 31,
    name: "حلب الجديدة الجنوبي",
    name_en: "New Aleppo South",
    sector: "حلب الجديدة",
    area: 2044985.36
  },
  {
    id: 32,
    name: "حلب الجديدة الشمالي",
    name_en: "New Aleppo North",
    sector: "حلب الجديدة",
    area: 2738801.28
  },
  {
    id: 33,
    name: "حي الفيلات",
    name_en: "Al-Filat",
    sector: "الحمدانية",
    area: 528743.85
  },
  {
    id: 34,
    name: "حلب الجديدة الشهداء",
    name_en: "New Aleppo Al-Shahba'a",
    sector: "حلب الجديدة",
    area: 939656.75
  },
  {
    id: 35,
    name: "الحمدانية الحي الثاني",
    name_en: "Al-Hamadaneih 2",
    sector: "الحمدانية",
    area: 2055718.63
  }
];

// بيانات القطاعات
const sectors = [
  { id: 1, name: "قاضي عسكر" },
  { id: 2, name: "هنانو" },
  { id: 3, name: "السريان" },
  { id: 4, name: "حلب الجديدة" },
  { id: 5, name: "السليمانية" },
  { id: 6, name: "باب النيرب" },
  { id: 7, name: "الحمدانية" }
];

// بيانات حالة البنية التحتية (بيانات تخيلية للعرض)
const infrastructureData = [
  { neighborhoodId: 1, waterNetworkStatus: "medium", sewerageNetworkStatus: "poor", electricityNetworkStatus: "medium", communicationNetworkStatus: "good" },
  { neighborhoodId: 4, waterNetworkStatus: "good", sewerageNetworkStatus: "medium", electricityNetworkStatus: "good", communicationNetworkStatus: "medium" },
  { neighborhoodId: 5, waterNetworkStatus: "poor", sewerageNetworkStatus: "poor", electricityNetworkStatus: "medium", communicationNetworkStatus: "poor" },
  { neighborhoodId: 6, waterNetworkStatus: "medium", sewerageNetworkStatus: "medium", electricityNetworkStatus: "good", communicationNetworkStatus: "medium" },
  { neighborhoodId: 7, waterNetworkStatus: "good", sewerageNetworkStatus: "medium", electricityNetworkStatus: "good", communicationNetworkStatus: "good" }
];

// بيانات المراكز الصحية (بيانات تخيلية للعرض)
const healthCenters = [
  { id: 1, name: "مركز صحي الأول", neighborhoodId: 1, serviceArea: "ضهرة عواد", infrastructureStatus: "medium", staffStatus: "good", consumablesStatus: "medium", operationalStatus: "operational", interventionPriority: "medium" },
  { id: 2, name: "مركز صحي الثاني", neighborhoodId: 4, serviceArea: "عويجة", infrastructureStatus: "poor", staffStatus: "medium", consumablesStatus: "poor", operationalStatus: "partially", interventionPriority: "high" },
  { id: 3, name: "مركز صحي الثالث", neighborhoodId: 7, serviceArea: "الرصافة", infrastructureStatus: "good", staffStatus: "good", consumablesStatus: "good", operationalStatus: "operational", interventionPriority: "low" }
];

// بيانات المرافق التعليمية (بيانات تخيلية للعرض)
const educationFacilities = [
  { id: 1, name: "مدرسة الأولى", neighborhoodId: 1, serviceArea: "ضهرة عواد", infrastructureStatus: "medium", staffStatus: "medium", consumablesStatus: "medium", operationalStatus: "operational", interventionPriority: "medium" },
  { id: 2, name: "مدرسة الثانية", neighborhoodId: 4, serviceArea: "عويجة", infrastructureStatus: "poor", staffStatus: "poor", consumablesStatus: "poor", operationalStatus: "non-operational", interventionPriority: "high" },
  { id: 3, name: "مدرسة الثالثة", neighborhoodId: 7, serviceArea: "الرصافة", infrastructureStatus: "good", staffStatus: "medium", consumablesStatus: "medium", operationalStatus: "operational", interventionPriority: "medium" }
];

// بيانات الإسكان والعمران (بيانات تخيلية للعرض)
const housingData = [
  { neighborhoodId: 1, totalUnits: 3200, vacantPercentage: 15, ownershipType: "private", severeDamagePercentage: 20, mediumDamagePercentage: 30, lightDamagePercentage: 25, noDamagePercentage: 25, interventionPriority: "medium" },
  { neighborhoodId: 4, totalUnits: 5600, vacantPercentage: 25, ownershipType: "mixed", severeDamagePercentage: 45, mediumDamagePercentage: 30, lightDamagePercentage: 15, noDamagePercentage: 10, interventionPriority: "high" },
  { neighborhoodId: 7, totalUnits: 4200, vacantPercentage: 10, ownershipType: "private", severeDamagePercentage: 5, mediumDamagePercentage: 15, lightDamagePercentage: 30, noDamagePercentage: 50, interventionPriority: "low" }
];

// بيانات السكان والتغيرات الديموغرافية (بيانات تخيلية للعرض)
const populationData = [
  { neighborhoodId: 1, populationCount: 12500, immigrantPercentage: 25, returneePercentage: 15, humanNeeds: "medium", interventionPriority: "medium" },
  { neighborhoodId: 4, populationCount: 23600, immigrantPercentage: 45, returneePercentage: 5, humanNeeds: "high", interventionPriority: "high" },
  { neighborhoodId: 7, populationCount: 18200, immigrantPercentage: 10, returneePercentage: 25, humanNeeds: "low", interventionPriority: "low" }
];

// بيانات التدخلات الإنسانية (بيانات تخيلية للعرض)
const humanitarianInterventions = [
  { neighborhoodId: 1, healthSupport: "available", foodAid: "available", clothingHousingAid: "limited", shelterHousing: "available", educationSupport: "limited", psychologicalFamilySupport: "limited", incomeGenerationProjects: "available" },
  { neighborhoodId: 4, healthSupport: "limited", foodAid: "available", clothingHousingAid: "unavailable", shelterHousing: "limited", educationSupport: "unavailable", psychologicalFamilySupport: "unavailable", incomeGenerationProjects: "limited" },
  { neighborhoodId: 7, healthSupport: "available", foodAid: "available", clothingHousingAid: "available", shelterHousing: "available", educationSupport: "available", psychologicalFamilySupport: "limited", incomeGenerationProjects: "available" }
];

// إحداثيات مركز مدينة حلب (تقريبية)
const aleppoCoordinates = {
  lat: 36.2021,
  lng: 37.1343
};

// إحداثيات الأحياء (تقريبية - مستخرجة من ملف GeoJSON الأصلي)
const neighborhoodsLocations = {
  1: { lat: 36.1948696, lng: 37.2132675 }, // ضهرة عواد
  4: { lat: 36.2401827, lng: 37.2018803 }, // عويجة
  5: { lat: 36.2730859, lng: 37.1666246 }, // البكارة
  6: { lat: 36.2312291, lng: 37.1114114 }, // الليرمون
  7: { lat: 36.2562156, lng: 37.1512593 }, // الرصافة
  8: { lat: 36.2502135, lng: 37.1704347 }  // الشيخ مقصود 2
};