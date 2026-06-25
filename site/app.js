const state = { papers: [] };

function textOf(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

function authorText(paper) {
  return (paper.authors || []).map((a) => a.name).join(", ");
}

function affiliationHtml(paper) {
  const rows = paper.author_affiliations || [];
  if (!rows.length) return "<p class=\"muted\">待补全</p>";
  return `<ul>${rows.map((row) => `<li>${row.author || ""}: ${row.affiliation_cn || "待补全"}</li>`).join("")}</ul>`;
}

function render(papers) {
  const root = document.querySelector("#papers");
  if (!papers.length) {
    root.innerHTML = "<p class=\"muted\">没有匹配的论文。</p>";
    return;
  }
  root.innerHTML = papers.map((paper) => `
    <article class="paper">
      <h2>${paper.title || ""}</h2>
      <div class="meta-row">
        <span class="chip">${(paper.published || "").slice(0, 10)}</span>
        <span class="chip">${paper.primary_category || ""}</span>
        <span class="chip">${paper.enrichment_status || "ok"}</span>
      </div>
      <p class="muted">${authorText(paper)}</p>
      <p class="summary">${paper.summary_cn || "中文摘要待补全。"}</p>
      <p class="muted">${paper.relevance_note_cn || ""}</p>
      <details>
        <summary>作者单位</summary>
        ${affiliationHtml(paper)}
      </details>
      <details>
        <summary>英文摘要</summary>
        <p>${paper.abstract || ""}</p>
      </details>
      <div class="links">
        <a href="${paper.arxiv_url}" target="_blank" rel="noreferrer">arXiv</a>
        <a href="${paper.pdf_url}" target="_blank" rel="noreferrer">PDF</a>
      </div>
    </article>
  `).join("");
}

async function boot() {
  const response = await fetch("./data/papers.json");
  state.papers = await response.json();
  document.querySelector("#meta").textContent = `${state.papers.length} 篇论文`;
  render(state.papers);
}

document.querySelector("#search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  if (!query) return render(state.papers);
  render(state.papers.filter((paper) => [
    paper.title,
    paper.abstract,
    paper.summary_cn,
    paper.primary_category,
    authorText(paper),
    textOf(paper.keywords_cn)
  ].join("\n").toLowerCase().includes(query)));
});

boot().catch((error) => {
  document.querySelector("#meta").textContent = `加载失败：${error}`;
});

