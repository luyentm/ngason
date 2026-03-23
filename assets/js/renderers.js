(function () {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderBadge(label, modifier = "") {
    return `<span class="badge ${modifier}">${escapeHtml(label)}</span>`;
  }

  function renderEmptyState(message) {
    return `<div class="empty-state">${escapeHtml(message)}</div>`;
  }

  function renderFeatureCard(item) {
    return `
      <article class="feature-card reveal is-visible">
        <p class="eyebrow">${escapeHtml(item.kicker)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <a class="text-link" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>
      </article>
    `;
  }

  function renderCommuneCard(item, basePath) {
    const imagePath = `${basePath}/${item.featuredImage}`;
    return `
      <article class="card reveal is-visible">
        <img class="card-media" src="${escapeHtml(imagePath)}" alt="${escapeHtml(item.name)}">
        <div class="card-meta">
          ${renderBadge(item.statusLabel)}
          ${renderBadge(item.periodLabel, "badge-neutral")}
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <a class="text-link" href="${escapeHtml(basePath)}/pages/commune.html?slug=${escapeHtml(item.slug)}">Mở hồ sơ xã</a>
      </article>
    `;
  }

  function renderPersonCard(item, basePath) {
    return `
      <article class="card reveal is-visible">
        <img class="card-media" src="${escapeHtml(basePath)}/${escapeHtml(item.featuredImage)}" alt="${escapeHtml(item.name)}">
        <div class="card-meta">
          ${renderBadge(item.statusLabel)}
          ${renderBadge(item.role, "badge-neutral")}
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <a class="text-link" href="${escapeHtml(basePath)}/pages/person.html?slug=${escapeHtml(item.slug)}">Mở hồ sơ nhân vật</a>
      </article>
    `;
  }

  function renderPostCard(item, basePath) {
    return `
      <article class="stack-card reveal is-visible">
        <div class="stack-meta">
          ${renderBadge(item.statusLabel)}
          ${renderBadge(item.category, "badge-neutral")}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <a class="text-link" href="${escapeHtml(basePath)}/pages/post.html?slug=${escapeHtml(item.slug)}">Đọc bài</a>
      </article>
    `;
  }

  function renderTimelineItem(item, linkedNames) {
    const links = linkedNames.length
      ? `<div class="inline-links">${linkedNames.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>`
      : "";

    return `
      <article class="timeline-item reveal is-visible">
        <div class="timeline-meta">
          ${renderBadge(item.period)}
          ${renderBadge(item.statusLabel, "badge-neutral")}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        ${links}
      </article>
    `;
  }

  function renderGalleryCard(item, basePath) {
    const imagePath = `${basePath}/${item.image}`;
    return `
      <article class="gallery-card reveal is-visible">
        <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(item.alt)}">
        <div class="gallery-meta">
          ${renderBadge(item.period)}
          ${renderBadge(item.statusLabel, "badge-neutral")}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="gallery-caption">${escapeHtml(item.caption)}</p>
        <button class="button button-secondary" type="button" data-lightbox-trigger data-lightbox-image="${escapeHtml(imagePath)}" data-lightbox-alt="${escapeHtml(item.alt)}" data-lightbox-caption="${escapeHtml(item.caption)}">Xem ảnh lớn</button>
      </article>
    `;
  }

  function renderStatCard(label, value, description) {
    return `
      <article class="stat-card reveal is-visible">
        <strong>${escapeHtml(value)}</strong>
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(description)}</p>
      </article>
    `;
  }

  function renderDetailHero(item, type, basePath) {
    const subtitle = type === "commune"
      ? item.periodLabel
      : type === "person"
        ? item.role
        : item.category;
    return `
      <div class="detail-header-grid">
        <div>
          <p class="eyebrow">${escapeHtml(subtitle)}</p>
          <h1>${escapeHtml(item.name || item.title)}</h1>
          <div class="meta-row">
            ${renderBadge(item.statusLabel)}
            ${item.sourceStatus ? renderBadge(item.sourceStatus, "badge-neutral") : ""}
          </div>
          <p class="section-intro">${escapeHtml(item.summary)}</p>
        </div>
        <img class="detail-cover" src="${escapeHtml(basePath)}/${escapeHtml(item.featuredImage)}" alt="${escapeHtml(item.name || item.title)}">
      </div>
    `;
  }

  function renderKeyValueList(rows) {
    return rows
      .filter((row) => row.value && row.value.length !== 0)
      .map((row) => `
        <div>
          <h3>${escapeHtml(row.label)}</h3>
          <p>${Array.isArray(row.value) ? escapeHtml(row.value.join(", ")) : escapeHtml(row.value)}</p>
        </div>
      `)
      .join("");
  }

  function renderRichSections(sections) {
    return sections
      .map((section) => {
        const paragraphs = section.paragraphs
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("");
        const list = section.list?.length
          ? `<ul>${section.list.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>`
          : "";
        return `<section><h2>${escapeHtml(section.title)}</h2>${paragraphs}${list}</section>`;
      })
      .join("");
  }

  window.NgasonRenderers = {
    renderBadge,
    renderEmptyState,
    renderFeatureCard,
    renderCommuneCard,
    renderPersonCard,
    renderPostCard,
    renderTimelineItem,
    renderGalleryCard,
    renderStatCard,
    renderDetailHero,
    renderKeyValueList,
    renderRichSections
  };
})();