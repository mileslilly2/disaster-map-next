// static/js/renderers.js
export function renderWordCloud(words, sel) {
  d3.select(sel).selectAll("svg").remove();
  const layout = d3.layout.cloud()
    .size([500,300]).words(words)
    .padding(5).rotate(() => ~~(Math.random()*2)*90)
    .fontSize(d=>Math.sqrt(d.size)*6)
    .on("end", draw)
    .start();

  function draw(arr) {
    const svg = d3.select(sel).append("svg")
      .attr("width",500).attr("height",300)
      .append("g").attr("transform","translate(250,150)");
    svg.selectAll("text")
      .data(arr).join("text")
        .style("font-size", d=>d.size+"px")
        .attr("text-anchor","middle")
        .attr("transform",d=>"translate("+d.x+","+d.y+")rotate("+d.rotate+")")
        .text(d=>d.text);
  }
}

export function renderSentimentHistogramBins(bins, sel) {
  const svg = d3.select(sel);
  svg.selectAll("*").remove();
  const W = +svg.attr("width"), H = +svg.attr("height");
  const m = {top:20,right:20,bottom:40,left:50};
  const x = d3.scaleLinear().domain([-1,1]).range([m.left, W-m.right]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins,d=>d.length)||0])
    .range([H-m.bottom, m.top]);

  svg.append("g")
    .attr("transform",`translate(0,${H-m.bottom})`)
    .call(d3.axisBottom(x).ticks(9));
  svg.append("g")
    .attr("transform",`translate(${m.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(bins).join("rect")
      .attr("x",    d=>x(d.x0)+1)
      .attr("y",    d=>y(d.length))
      .attr("width",d=>Math.max(0,x(d.x1)-x(d.x0)-2))
      .attr("height",d=>y(0)-y(d.length))
      .attr("fill","#69b3a2");
}

export function renderTopicGraphPositions(nodes, sel) {
  const svg = d3.select(sel);
  svg.selectAll("*").remove();
  const W = +svg.attr("width"), H = +svg.attr("height");

  const topics = Array.from(new Set(nodes.map(d=>d.topic)));
  const color  = d3.scaleOrdinal(d3.schemeCategory10).domain(topics);

  svg.append("g").selectAll("circle")
    .data(nodes).join("circle")
      .attr("r", 6)
      .attr("cx", d=>d.x)
      .attr("cy", d=>d.y)
      .attr("fill", d=>color(d.topic))
      .on("mouseover", (e,d) => {
        tooltip.html(`<strong>${d.label}</strong><br/>${d.text.slice(0,80)}…`)
               .style("visibility","visible");
      })
      .on("mousemove", e => {
        tooltip.style("left",(e.pageX+10)+"px")
               .style("top",(e.pageY-18)+"px");
      })
      .on("mouseout", () => tooltip.style("visibility","hidden"));
}

// static/js/tableRenderer.js
export function renderDataTable(data, sel, columns) {
  const container = document.querySelector(sel);
  if (!container) {
    console.warn(`No container ${sel}`);
    return;
  }
  container.innerHTML = ""; // clear old table

  // --- build <table> ---
  const table = document.createElement("table");
  table.classList.add("data-table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  // ----- header -----
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach((col, i) => {
    const th = document.createElement("th");
    th.textContent = col.header;
    th.style.cursor = "pointer";
    th.style.padding = "4px 8px";
    th.style.borderBottom = "2px solid #666";

    // sort on click
    th.addEventListener("click", () => {
      const asc = th._asc = !th._asc;
      const rows = Array.from(tbody.rows);
      rows.sort((a, b) => {
        const aVal = a.cells[i].textContent;
        const bVal = b.cells[i].textContent;
        return asc
          ? aVal.localeCompare(bVal, undefined, { numeric: true })
          : bVal.localeCompare(aVal, undefined, { numeric: true });
      });
      rows.forEach(r => tbody.appendChild(r));
    });

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ----- body -----
  const tbody = document.createElement("tbody");

  data.forEach(item => {
    const tr = document.createElement("tr");

    columns.forEach(col => {
      const td = document.createElement("td");
      let v = item[col.field];

      // join arrays for display
      if (Array.isArray(v)) v = v.join(", ");

      // ---- make URLs clickable ----
      const isLink = col.link || (typeof v === "string" && /^https?:\/\//i.test(v));
      if (isLink && v) {
        const a = document.createElement("a");
        a.href        = v;
        a.textContent = v;
        a.target      = "_blank";   // open in new tab
        a.rel         = "noopener"; // security best‑practice
        td.appendChild(a);
      } else {
        td.textContent = v == null ? "" : v;
      }

      td.style.padding = "4px 8px";
      td.style.borderBottom = "1px solid #ddd";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}



