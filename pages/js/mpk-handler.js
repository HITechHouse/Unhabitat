
// Load MPK from URL
function loadMpkFromUrl() {
    const url = document.getElementById('mpk-url').value;
    if (url) {
      loadMpkLayers(url);
    }
  }
  
  // Run spatial query
  function runQuery() {
    const field = document.getElementById('field-select').value;
    const operator = document.getElementById('operator-select').value;
    const value = document.getElementById('value-input').value;
    
    if (!field || !value) return;
  
    const results = [];
    map.eachLayer(layer => {
      if (layer.feature) {
        const featureValue = layer.feature.properties[field];
        if (evaluateCondition(featureValue, operator, value)) {
          results.push(layer.feature);
          layer.setStyle({ color: '#ff0000', weight: 3 });
        }
      }
    });
  
    displayResults(results);
  }
  
  function evaluateCondition(a, operator, b) {
    switch(operator) {
      case '=': return a == b;
      case '>': return a > b;
      case '<': return a < b;
      default: return false;
    }
  }
  
  function displayResults(results) {
    const container = document.getElementById('analysis-results');
    container.innerHTML = `
      <h4>نتائج التحليل</h4>
      <p>عدد النتائج: ${results.length}</p>
      <div class="results-list">
        ${results.map(r => `<div>${r.properties.Names || 'غير معروف'}</div>`).join('')}
      </div>
    `;
  }
  