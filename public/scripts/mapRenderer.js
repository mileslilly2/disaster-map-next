// static/js/mapRenderer.js

// --- Exported initMap() ---
export function initMap() {
  // 1) Color & severity lookup tables
  const EVENT_COLORS = {
    "Tornado Warning":            "#d73027",
    "Severe Thunderstorm Warning":"#fc8d59",
    "Severe Thunderstorm Watch":   "#fee08b",
    "Flash Flood Warning":        "#7f0000",
    "Flash Flood Watch":          "#4575b4",
    "Flood Warning":              "#313695",
    "Flood Advisory":             "#74add1",
    "Flood Watch":                "#abd9e9",
    "Special Weather Statement":  "#fdae61",
    "Heat Advisory":              "#f46d43",
    "Excessive Heat Warning":     "#a50026",
    "Red Flag Warning":           "#ff006e",
    "Wind Advisory":              "#ffffbf",
    "High Wind Warning":          "#d8daeb",
    "Dust Advisory":              "#e0cfa9",
    "Dust Storm Warning":         "#bf812d",
    "Winter Storm Warning":       "#542788",
    "Fire Weather Watch":         "#b35806",
    "Air Quality Alert":          "#4daf4a",
    "Small Craft Advisory":       "#225ea8",
    "Special Marine Warning":     "#9ebcda",
    "Gale Warning":               "#f1b6da",
    "Coastal Flood Statement":    "#abd9e9",
    "Practice/Demo Warning":      "#bbbbbb",
    default:                      "#dddddd"
  };

  const SEVERITY_INTENSITY = {
    "Severe":   0,   // original color
    "Moderate": 40,  // lighter
    "Minor":    80   // much lighter
  };

  // 2) Initialize Leaflet map
  window.map = L.map("map").setView([39.8283, -98.5795], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:  3,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // 3) Legend-toggle control (top-right)
  const legendToggle = L.control({ position: "topright" });
  legendToggle.onAdd = () => {
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.style.cssText = "background:#fff;padding:4px;cursor:pointer;";
    container.innerHTML = `
      <label style="display:flex;align-items:center;margin:0;font-size:14px;">
        <input type="checkbox" id="toggle-legend" checked style="margin-right:4px;">
        Legend
      </label>`;
    L.DomEvent.disableClickPropagation(container);
    return container;
  };
  legendToggle.addTo(map);

  // 4) Placeholder for the gauge legend (will be set later)
  let gaugeLegend;

  // 5) Build the main color-intensity legend (bottom-left)
  const legend = L.control({ position: "bottomleft" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    div.style.cssText = `
      background:#fff;
      padding:6px 8px;
      border:2px solid #444;
      border-radius:4px;
      max-height:260px;
      overflow-y:auto;
      font-size:13px;
      line-height:18px;`;
    div.innerHTML = "<b>Event Legend</b><br>";

    Object.entries(EVENT_COLORS).forEach(([event, baseColor]) => {
      if (event === "default") return;
      div.innerHTML += `<b>${event}</b><br>`;
      Object.entries(SEVERITY_INTENSITY).forEach(([sev, pct]) => {
        const R = parseInt(baseColor.slice(1,3),16),
              G = parseInt(baseColor.slice(3,5),16),
              B = parseInt(baseColor.slice(5,7),16);
        const r2 = Math.min(255, R*(100+pct)/100)|0,
              g2 = Math.min(255, G*(100+pct)/100)|0,
              b2 = Math.min(255, B*(100+pct)/100)|0;
        const fill = `#${r2.toString(16).padStart(2,"0")}`
                   + `${g2.toString(16).padStart(2,"0")}`
                   + `${b2.toString(16).padStart(2,"0")}`;
        div.innerHTML += `
          <i style="
            background:${fill};
            display:inline-block;
            width:14px;height:14px;
            margin-right:6px;
            border:1px solid #444;
            vertical-align:middle;
          "></i>${sev}<br>`;
      });
      div.innerHTML += "<br>";
    });

    return div;
  };

  // 6) Load & render alerts GeoJSON
  fetch("/data/alert.geojson")
    .then(r => r.json())
    .then(data => {
      const alertsLayer = L.geoJSON(data, {
        style: feature => {
          const p    = feature.properties || {};
          const base = EVENT_COLORS[p.event] || EVENT_COLORS.default;
          const pct  = SEVERITY_INTENSITY[p.severity] ?? 60;

          // shadeColor(base, pct) inline:
          const R = parseInt(base.slice(1,3),16),
                G = parseInt(base.slice(3,5),16),
                B = parseInt(base.slice(5,7),16);
          const r2 = Math.min(255, R*(100+pct)/100)|0,
                g2 = Math.min(255, G*(100+pct)/100)|0,
                b2 = Math.min(255, B*(100+pct)/100)|0;
          const fill = `#${r2.toString(16).padStart(2,"0")}`
                     + `${g2.toString(16).padStart(2,"0")}`
                     + `${b2.toString(16).padStart(2,"0")}`;

          return {
            color:     base,
            fillColor: fill,
            weight:    2,
            fillOpacity: 0.7
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(
            `<strong>${p.event||"No event"}</strong><br/>
             Severity: ${p.severity||"N/A"}`
          );
        }
      }).addTo(map);

      L.control.layers(null, { "Alerts": alertsLayer }, { collapsed: false })
       .addTo(map);
    })
    .catch(err => console.error("Alerts load error:", err));

  // 7) Load & render gauge GeoJSON + legend (bottom-right)
  fetch("/data/gauge_data.geojson")
    .then(r => r.json())
    .then(data => {
      // extract observed values
      const obs = data.features
        .map(f => f.properties?.observed)
        .filter(v => typeof v === "number");
      const min = Math.min(...obs),
            max = Math.max(...obs);

      const ramp = [
        "#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c",
        "#fc4e2a","#e31a1c","#bd0026","#800026"
      ];
      const scale = chroma.scale(ramp).domain([min,max]);

      const gaugeLayer = L.geoJSON(data, {
        pointToLayer: (feat, latlng) => {
          const v = feat.properties?.observed;
          if (typeof v !== "number") return;

          const radius = 0.1 + 5*(v - min)/(max - min);
          const col    = scale(v).hex();

          return L.circleMarker(latlng, {
            radius, color: col, fillColor: col,
            weight: 1, fillOpacity: 0.8
          }).bindPopup(
            `<strong>${feat.properties?.name||"Gauge"}</strong><br/>
             Observed: ${v.toFixed(2)}<br/>
             Forecast: ${feat.properties?.forecast||"N/A"}`
          );
        }
      }).addTo(map);

      L.control.layers(null, { "Gauges": gaugeLayer }, { collapsed: false })
       .addTo(map);

      // build gauge legend
      gaugeLegend = L.control({ position: "bottomright" });
      gaugeLegend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        div.style.cssText = `
          background:#fff;
          padding:6px 8px;
          border:2px solid #444;
          border-radius:4px;
          font-size:13px;`;
        div.innerHTML = "<b>Observed Precipitation</b><br>";

        const steps = 6;
        for (let i = 0; i < steps; i++) {
          const t   = i/(steps-1);
          const val = (min + t*(max-min)).toFixed(1);
          const c   = scale(val).hex();
          div.innerHTML += `
            <i style="
              background:${c};
              width:18px;height:18px;
              display:inline-block;
              margin-right:4px;
              border:1px solid #444;
            "></i>${val}<br>`;
        }
        return div;
      };
      gaugeLegend.addTo(map);
    })
    .catch(err => console.error("Gauge load error:", err));

  // 8) Legend toggle behavior
  const legendBox = document.getElementById("toggle-legend");
  if (legendBox.checked) legend.addTo(map);
  legendBox.addEventListener("change", () => {
    if (legendBox.checked) {
      legend.addTo(map);
      gaugeLegend.addTo(map);
    } else {
      map.removeControl(legend);
      map.removeControl(gaugeLegend);
    }
  });
}
