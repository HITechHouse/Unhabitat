/**
 * aleppo-analysis.js
 * file for spatial analysis of Aleppo neighborhoods
 */

// spatial analysis functions

/**
 * calculate basic statistics for a GeoJSON dataset
 * @param {Object} geojsonData - GeoJSON data
 * @return {Object} basic statistics
 */
function calculateBasicStatistics(geojsonData) {
  if (
    !geojsonData ||
    !geojsonData.features ||
    geojsonData.features.length === 0
  ) {
    console.error("بيانات GeoJSON غير صالحة أو فارغة");
    return {
      count: 0,
      totalArea: 0,
      avgArea: 0,
      minArea: 0,
      maxArea: 0,
      sectors: {},
      sectorCount: 0,
    };
  }

  const features = geojsonData.features;
  const count = features.length;

  // calculate the areas
  let totalArea = 0;
  let minArea = Infinity;
  let maxArea = 0;

  // calculate the sectors
  const sectors = {};

  features.forEach((feature) => {
    // calculate the area
    const area = feature.properties.Shape_Area || 0;
    totalArea += area;

    if (area < minArea) minArea = area;
    if (area > maxArea) maxArea = area;

    // calculate the sector
    const sector = feature.properties.Sector_01 || "غير محدد";
    if (sectors[sector]) {
      sectors[sector]++;
    } else {
      sectors[sector] = 1;
    }
  });

  // convert the areas to square kilometers
  totalArea = totalArea / 1000000;
  minArea = minArea / 1000000;
  maxArea = maxArea / 1000000;
  const avgArea = totalArea / count;

  return {
    count,
    totalArea,
    avgArea,
    minArea,
    maxArea,
    sectors,
    sectorCount: Object.keys(sectors).length,
  };
}

/**
 * analyze the spatial distribution of neighborhoods
 * @param {Object} geojsonData - GeoJSON data
 * @return {Object} spatial distribution data
 */
function analyzeAreaDistribution(geojsonData) {
  if (
    !geojsonData ||
    !geojsonData.features ||
    geojsonData.features.length === 0
  ) {
    console.error("بيانات GeoJSON غير صالحة أو فارغة");
    return [];
  }

  // classify the neighborhoods by area
  const areaRanges = {
    "< 1 كم²": 0,
    "1 - 2 كم²": 0,
    "2 - 5 كم²": 0,
    "5 - 10 كم²": 0,
    "> 10 كم²": 0,
  };

  geojsonData.features.forEach((feature) => {
    const areaKm2 = feature.properties.Shape_Area / 1000000;

    if (areaKm2 < 1) {
      areaRanges["< 1 كم²"]++;
    } else if (areaKm2 < 2) {
      areaRanges["1 - 2 كم²"]++;
    } else if (areaKm2 < 5) {
      areaRanges["2 - 5 كم²"]++;
    } else if (areaKm2 < 10) {
      areaRanges["5 - 10 كم²"]++;
    } else {
      areaRanges["> 10 كم²"]++;
    }
  });

  // convert to an array of objects for the chart
  return Object.keys(areaRanges).map((range) => {
    return {
      range,
      count: areaRanges[range],
    };
  });
}

/**
 * analyze the sector distribution of neighborhoods
 * @param {Object} geojsonData - GeoJSON data
 * @return {Object} sector distribution data
 */
function analyzeSectorDistribution(geojsonData) {
  if (
    !geojsonData ||
    !geojsonData.features ||
    geojsonData.features.length === 0
  ) {
    console.error("بيانات GeoJSON غير صالحة أو فارغة");
    return [];
  }

  // calculate the sectors
  const sectors = {};

  geojsonData.features.forEach((feature) => {
    const sector = feature.properties.Sector_01 || "غير محدد";
    if (sectors[sector]) {
      sectors[sector]++;
    } else {
      sectors[sector] = 1;
    }
  });

  // convert to an array of objects for the chart
  return Object.keys(sectors)
    .map((sector) => {
      return {
        sector,
        count: sectors[sector],
      };
    })
    .sort((a, b) => b.count - a.count); // sort descending by count
}

/**
 * classify the data using the equal intervals method
 * @param {Array} data - array of values
 * @param {Number} classCount - number of classes
 * @return {Array} class breaks
 */
function calculateEqualIntervals(data, classCount) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const interval = (max - min) / classCount;

  const breaks = [min];
  for (let i = 1; i < classCount; i++) {
    breaks.push(min + i * interval);
  }
  breaks.push(max);

  return breaks;
}

/**
 * classify the data using the quantile method
 * @param {Array} data - array of values
 * @param {Number} classCount - number of classes
 * @return {Array} class breaks
 */
function calculateQuantileBreaks(data, classCount) {
  // sort the data ascending
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;

  const breaks = [sortedData[0]]; // lowest value

  for (let i = 1; i < classCount; i++) {
    const position = Math.floor((i * n) / classCount);
    breaks.push(sortedData[position]);
  }

  breaks.push(sortedData[n - 1]); // highest value

  return breaks;
}

/**
 * classify the data using the natural breaks method (Jenks algorithm)
 * @param {Array} data - array of values
 * @param {Number} classCount - number of classes
 * @return {Array} class breaks
 */
function calculateNaturalBreaks(data, classCount) {
  // note: this is a simplified version of the Jenks Natural Breaks algorithm
  // for the real application, it is recommended to use a specialized library

  // sort the data ascending
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;

  // for simplicity, we use a simple method to select the natural breaks
  const breaks = [sortedData[0]]; // lowest value

  // calculate the differences between the consecutive values
  const differences = [];
  for (let i = 1; i < n; i++) {
    differences.push({
      value: sortedData[i],
      diff: sortedData[i] - sortedData[i - 1],
    });
  }

  // sort the differences descending
  const breakPoints = differences.slice(0, classCount - 1).map((d) => d.value);
  breakPoints.sort((a, b) => a - b);

  // add the break points
  breaks.push(...breakPoints);
  breaks.push(sortedData[n - 1]); // highest value

  return breaks;
}

/**
 * determine the class for a value using the specified breaks
 * @param {Number} value - the value
 * @param {Array} breaks - the breaks
 * @return {Number} the class number (0 to number of breaks - 1)
 */
function getClassForValue(value, breaks) {
  for (let i = 1; i < breaks.length; i++) {
    if (value <= breaks[i]) {
      return i - 1;
    }
  }
  return breaks.length - 2; // the last class
}

/**
 * get the color for a class
 * @param {Number} classIndex - the class index
 * @param {Array} colorScale - the color scale
 * @return {String} the color value (HEX)
 */
function getColorForClass(classIndex, colorScale) {
  const defaultColorScale = [
    "#edf8fb",
    "#b2e2e2",
    "#66c2a4",
    "#2ca25f",
    "#006d2c",
  ];

  const colors = colorScale || defaultColorScale;
  return colors[Math.min(classIndex, colors.length - 1)];
}

/**
 * apply the spatial analysis to the GeoJSON data
 * @param {Object} geojsonData - GeoJSON data
 * @param {String} field - the field to analyze
 * @param {String} method - the analysis method
 * @param {Number} classCount - number of classes
 * @param {Array} colorScale - the color scale
 * @return {Object} GeoJSON data with the analysis properties added
 */
function applySpatialAnalysis(
  geojsonData,
  field,
  method,
  classCount,
  colorScale
) {
  if (
    !geojsonData ||
    !geojsonData.features ||
    geojsonData.features.length === 0
  ) {
    console.error("بيانات GeoJSON غير صالحة أو فارغة");
    return geojsonData;
  }

  classCount = classCount || 5;

  // extract the field values from the data
  const fieldValues = [];

  geojsonData.features.forEach((feature) => {
    let value;

    // extract the value based on the field type
    switch (field) {
      case "area":
        value = feature.properties.Shape_Area / 1000000; // convert to square kilometers
        break;
      case "population":
        // use a fixed simulated value
        value = getSimulatedValue(feature.properties.ID, 1000, 10000);
        break;
      case "damage":
        // use a fixed simulated value
        value = getSimulatedValue(feature.properties.ID, 0, 100);
        break;
      case "priority":
        // use a fixed simulated value
        value = getSimulatedValue(feature.properties.ID, 1, 5);
        break;
      default:
        value = 0;
    }

    fieldValues.push(value);
  });

  // calculate the class breaks based on the analysis method
  let breaks;

  switch (method) {
    case "equal":
      breaks = calculateEqualIntervals(fieldValues, classCount);
      break;
    case "quantile":
      breaks = calculateQuantileBreaks(fieldValues, classCount);
      break;
    case "natural":
      breaks = calculateNaturalBreaks(fieldValues, classCount);
      break;
    default:
      breaks = calculateEqualIntervals(fieldValues, classCount);
  }

  // create a deep copy of the GeoJSON data
  const analyzedData = JSON.parse(JSON.stringify(geojsonData));

  // add the analysis properties to each feature
  analyzedData.features.forEach((feature, index) => {
    let value;

    // extract the value again (can be improved)
    switch (field) {
      case "area":
        value = feature.properties.Shape_Area / 1000000;
        break;
      case "population":
        value = getSimulatedValue(feature.properties.ID, 1000, 10000);
        break;
      case "damage":
        value = getSimulatedValue(feature.properties.ID, 0, 100);
        break;
      case "priority":
        value = getSimulatedValue(feature.properties.ID, 1, 5);
        break;
      default:
        value = 0;
    }

    // determine the class and color
    const classIndex = getClassForValue(value, breaks);
    const color = getColorForClass(classIndex, colorScale);

    // add the analysis properties
    feature.properties.analysisValue = value;
    feature.properties.analysisClass = classIndex;
    feature.properties.analysisColor = color;
  });

  // add the analysis information
  analyzedData.analysisInfo = {
    field,
    method,
    classCount,
    breaks,
    colorScale: colorScale || getDefaultColorScale(field),
  };

  return analyzedData;
}

/**
 * get the default color scale for the analysis type
 * @param {String} field - the field to analyze
 * @return {Array} the color scale
 */
function getDefaultColorScale(field) {
  switch (field) {
    case "area":
      return ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"];
    case "population":
      return ["#f1eef6", "#d4b9da", "#a980bb", "#7a5195", "#581b7c"];
    case "damage":
      return ["#ffffcc", "#ffeda0", "#fd8d3c", "#fc4e2a", "#e31a1c"];
    case "priority":
      return ["#00796b", "#26a69a", "#ffb300", "#f57c00", "#d32f2f"];
    default:
      return ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"];
  }
}

/**
 * calculate the area of a polygon using the geodesic method
 * @param {Array} latLngs - array of points [lat, lng]
 * @return {Number} the area in square meters
 */
function calculateGeodesicArea(latLngs) {
  // implement the geodesic area calculation algorithm
  const earthRadius = 6371000; // earth radius in meters

  // convert the points to rad
  const points = latLngs.map((point) => ({
    lat: (point[0] * Math.PI) / 180,
    lng: (point[1] * Math.PI) / 180,
  }));

  let area = 0;

  // calculate the area using the spherical polygon formula
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    area += (p2.lng - p1.lng) * Math.sin((p1.lat + p2.lat) / 2);
  }

  // close the polygon
  const pn = points[points.length - 1];
  const p0 = points[0];
  area += (p0.lng - pn.lng) * Math.sin((pn.lat + p0.lat) / 2);

  // calculate the final area
  area = Math.abs((area * earthRadius * earthRadius) / 2);

  return area;
}

/**
 * calculate the distance between two points using the Haversine formula
 * @param {Array} point1 - the first point [lat, lng]
 * @param {Array} point2 - the second point [lat, lng]
 * @return {Number} the distance in meters
 */
function calculateHaversineDistance(point1, point2) {
  const R = 6371000; // earth radius in meters
  const dLat = ((point2[0] - point1[0]) * Math.PI) / 180;
  const dLon = ((point2[1] - point1[1]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1[0] * Math.PI) / 180) *
      Math.cos((point2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * get a fixed simulated value based on the id
 * @param {Number} id - the id
 * @param {Number} min - the minimum value
 * @param {Number} max - the maximum value
 * @return {Number} a fixed value in the range [min, max]
 */
function getSimulatedValue(id, min, max) {
  // use the id as a seed to create fixed values
  const seed = id * 1000;
  const rand = Math.sin(seed) * 10000;
  const normalized = rand - Math.floor(rand);

  return min + normalized * (max - min);
}

// export the functions
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateBasicStatistics,
    analyzeAreaDistribution,
    analyzeSectorDistribution,
    calculateEqualIntervals,
    calculateQuantileBreaks,
    calculateNaturalBreaks,
    getClassForValue,
    getColorForClass,
    applySpatialAnalysis,
    getDefaultColorScale,
    calculateGeodesicArea,
    calculateHaversineDistance,
    getSimulatedValue,
  };
}
