// static/js/dashboard.js
import {
  renderWordCloud,
  renderSentimentHistogramBins,
  renderTopicGraphPositions,
  renderDataTable
} from './renderers.js';

export function initMastoTab() {
  return fetch('/data/mastodon.json')
    .then(r => r.json())
    .then(posts => {
      /* ---------- NEW: data table ---------- */
      const mastoCols = [
        { field: 'url',   header: 'url'     },   // or whatever date key your JSON uses
        { field: 'clean_content',header: 'Post'     },
        { field: 'sentiment',    header: 'Sentiment'},
        { field: 'topic_label',  header: 'Topic'    }
      ];
      renderDataTable(posts, '#table_masto', mastoCols);

      /* ---------- existing prep ---------- */
      const values = posts.map(d => +d.sentiment).filter(v => !isNaN(v));
      const bins   = d3.bin().domain([-1, 1]).thresholds(20)(values);

      const freq = new Map();
      posts.forEach(d => (d.keywords || []).forEach(w =>
        freq.set(w, (freq.get(w) || 0) + 1)
      ));
      const words = Array.from(freq.entries()).map(([t, s]) => ({ text: t, size: s }));

      const topics = Array.from(new Set(posts.map(d => d.topic_id)));
      const xPos   = d3.scalePoint().domain(topics).range([50, 550]);
      const nodes  = posts.map((d, i) => ({
        id: i,
        topic: d.topic_id,
        label: d.topic_label,
        text: d.clean_content || ''
      }));

      const sim = d3.forceSimulation(nodes)
        .force('charge',  d3.forceManyBody().strength(-20))
        .force('center',  d3.forceCenter(300, 200))
        .force('x',       d3.forceX(d => xPos(d.topic)).strength(0.4))
        .force('y',       d3.forceY(200).strength(0.1))
        .force('collide', d3.forceCollide(8))
        .stop();
      for (let i = 0; i < 30; i++) sim.tick();

      /* ---------- existing renders ---------- */
      renderWordCloud(words,            '#wordCloud_masto');
      renderSentimentHistogramBins(bins,'#sentimentHistogram_masto');
      renderTopicGraphPositions(nodes,  '#topicGraph_masto');
    })
    .catch(err => console.error('initMastoTab error:', err));
}

export function initNewsTab() {
  return fetch('/data/gdelt_enriched.json')
    .then(r => r.json())
    .then(arts => {
      // ---------- prep ----------
      arts.forEach(a => (a.keywords = a.tokens || []));

      const values = arts.map(d => +d.sentiment).filter(v => !isNaN(v));
      const bins   = d3.bin().domain([-1, 1]).thresholds(20)(values);

      const freq = new Map();
      arts.forEach(d => (d.keywords || []).forEach(w =>
        freq.set(w, (freq.get(w) || 0) + 1)
      ));
      const words = Array.from(freq.entries()).map(([t, s]) => ({ text: t, size: s }));

      const topics = Array.from(new Set(arts.map(d => d.topic_id)));
      const xPos   = d3.scalePoint().domain(topics).range([50, 550]);
      const nodes  = arts.map((d, i) => ({
        id: i,
        topic: d.topic_id,
        label: d.topic_label,
        text: d.clean_content || ''
      }));

      const sim = d3.forceSimulation(nodes)
        .force('charge',  d3.forceManyBody().strength(-20))
        .force('center',  d3.forceCenter(300, 200))
        .force('x',       d3.forceX(d => xPos(d.topic)).strength(0.4))
        .force('y',       d3.forceY(200).strength(0.1))
        .force('collide', d3.forceCollide(8))
        .stop();
      for (let i = 0; i < 30; i++) sim.tick();

      // ---------- render ----------
      renderWordCloud(words,            '#wordCloud_news');
      renderSentimentHistogramBins(bins,'#sentimentHistogram_news');
      renderTopicGraphPositions(nodes,  '#topicGraph_news');

      // ---------- NEW: data table ----------
      const newsCols = [
        { field: 'url',    header: 'url'      },
        { field: 'title',       header: 'Headline'  },
        { field: 'sentiment',   header: 'Sentiment' },
        { field: 'topic_label', header: 'Topic'     }
      ];
      renderDataTable(arts, '#table_news', newsCols);
    })
    .catch(err => console.error('initNewsTab error:', err));
}

