// static/js/main.js
import { initMap }        from './mapRenderer.js';
import { initMastoTab,
         initNewsTab }    from './dashboard.js';




let mastoInited = false,
    newsInited  = false;

function showTab(tabId) {
  document.querySelectorAll('.tab-content')
    .forEach(el=>el.style.display='none');
  document.getElementById(tabId).style.display='block';

  if(tabId==='mastoTab' && !mastoInited) {
    console.time('Mastodon');
    initMastoTab().then(()=>{
      console.timeEnd('Mastodon');
      mastoInited = true;
    });
  }
  if(tabId==='newsTab' && !newsInited) {
    console.time('News');
    initNewsTab().then(()=>{  
      console.timeEnd('News');
      newsInited = true;
    });
  }
  if(tabId==='mapTab' && window.map) {
    window.map.invalidateSize();
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  console.log("main.js loaded");
  initMap();

  // wire up buttons
  document.querySelectorAll('.tab-button').forEach(btn=>{
    btn.addEventListener('click',()=> showTab(btn.dataset.tab));
  });

  // show map by default
  showTab('mapTab');
});
