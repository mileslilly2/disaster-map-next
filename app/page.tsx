/* eslint-disable @next/next/no-sync-scripts */
export default function HomePage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Disaster Dashboard</h1>

      {/* Tabs */}
      <div className="tabs">
        <button className="tab-button" data-tab="mapTab">🗺️ Map</button>
        <button className="tab-button" data-tab="mastoTab">📣 Mastodon</button>
        <button className="tab-button" data-tab="newsTab">📰 News</button>
      </div>

      {/* Map Tab */}
      <div id="mapTab" className="tab-content" style={{ display: "block" }}>
        <div style={{ margin: "8px 0" }}>
          <label>
            <input type="checkbox" id="toggle-legend" defaultChecked /> Show legends
          </label>
        </div>
        <div id="map" style={{ height: 600 }} />
      </div>

      {/* Mastodon Tab */}
      <div id="mastoTab" className="tab-content" style={{ display: "none" }}>
        <h2>Mastodon</h2>
        <div id="table_masto" />
        <h3 style={{ marginTop: 16 }}>Word Cloud</h3>
        <div id="wordCloud_masto" />
        <h3 style={{ marginTop: 16 }}>Sentiment Histogram</h3>
        <svg id="sentimentHistogram_masto" width="600" height="320" />
        <h3 style={{ marginTop: 16 }}>Topic Graph</h3>
        <svg id="topicGraph_masto" width="600" height="400" />
      </div>

      {/* News Tab */}
      <div id="newsTab" className="tab-content" style={{ display: "none" }}>
        <h2>News</h2>
        <div id="table_news" />
        <h3 style={{ marginTop: 16 }}>Word Cloud</h3>
        <div id="wordCloud_news" />
        <h3 style={{ marginTop: 16 }}>Sentiment Histogram</h3>
        <svg id="sentimentHistogram_news" width="600" height="320" />
        <h3 style={{ marginTop: 16 }}>Topic Graph</h3>
        <svg id="topicGraph_news" width="600" height="400" />
      </div>

      {/* Vendor JS */}
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/d3@7/dist/d3.min.js"></script>
      <script src="https://unpkg.com/d3-cloud/build/d3.layout.cloud.js"></script>

      {/* App JS (as modules) */}
      <script type="module" src="/scripts/main.js"></script>
    </main>
  );
}
