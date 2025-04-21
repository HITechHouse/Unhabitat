
// Load MPK from URL
function loadMpkFromUrl() {
    const url = document.getElementById('mpk-url').value;
    if (!url) {
      alert('الرجاء إدخال رابط خدمة MPK');
      return;
    }
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        updateLayerList(data.layers);
        loadLayersToMap(data.layers);
      })
      .catch(error => {
        alert('حدث خطأ أثناء تحميل الخدمة');
        console.error(error);
      });
  }
  
  function updateLayerList(layers) {
    const layerList = document.getElementById('layer-list');
    layerList.innerHTML = layers.map(layer => `
      <div class="layer-item">
        <input type="checkbox" id="layer-${layer.id}" checked onchange="toggleLayer('${layer.id}')">
        <label for="layer-${layer.id}">${layer.name}</label>
      </div>
    `).join('');
  }
  
  function toggleLayer(layerId) {
    const layer = map.layerManager.get(layerId);
    if (layer) {
      const checkbox = document.getElementById(`layer-${layerId}`);
      if (checkbox.checked) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    }
  }
  
  function runQuery() {
    const field = document.getElementById('field-select').value;
    const operator = document.getElementById('operator-select').value;
    const value = document.getElementById('value-input').value;
  
    if (!field || !value) {
      alert('الرجاء إدخال جميع معايير الاستعلام');
      return;
    }
  
    const results = [];
    map.eachLayer(layer => {
      if (layer.feature) {
        const featureValue = layer.feature.properties[field];
        if (evaluateCondition(featureValue, operator, value)) {
          results.push(layer.feature);
          layer.setStyle({
            color: '#ff0000',
            weight: 3,
            fillOpacity: 0.7
          });
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
        ${results.map(r => `
          <div class="result-item">
            <strong>${r.properties.Names || 'غير معروف'}</strong>
            <span>${r.properties.Sector_01 || 'غير محدد'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  