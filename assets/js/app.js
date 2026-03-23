(function () {
  const dataApi = window.NgasonData;
  const renderers = window.NgasonRenderers;

  function setHtml(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    }
  }

  function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  function activateReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  }

  function resolvePath(path) {
    return `${dataApi.getBasePath()}/${path}`;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  }

  function getRelationLookups(relations) {
    return {
      historicalBySlug: new Map(relations.historicalUnits.map((item) => [item.slug, item])),
      modernBySlug: new Map(relations.modernUnits.map((item) => [item.slug, item]))
    };
  }

  function getCommuneSuccessorNames(relation, lookups) {
    return (relation?.successors || [])
      .map((slug) => lookups.modernBySlug.get(slug)?.name || lookups.historicalBySlug.get(slug)?.name)
      .filter(Boolean);
  }

  function getCommuneFormedFromNames(relation, lookups) {
    return (relation?.formedFrom || [])
      .map((slug) => lookups.historicalBySlug.get(slug)?.name || lookups.modernBySlug.get(slug)?.name)
      .filter(Boolean);
  }

  function getRelatedTimelineEntries(relation, timeline) {
    if (!relation) {
      return [];
    }

    return timeline.filter((item) => relation.milestones.includes(item.id));
  }

  function renderHeader(site) {
    const basePath = dataApi.getBasePath();
    const current = window.location.pathname.split("/").pop() || "index.html";
    const links = site.navigation.map((item) => {
      const href = basePath === "." ? item.href : item.href.replace(/^\.\//, "../");
      const target = href.split("/").pop();
      const active = current === target ? "is-active" : "";
      return `<a class="${active}" href="${href}">${item.label}</a>`;
    }).join("");

    setHtml("[data-site-header]", `
      <div class="nav-shell">
        <a class="brand-lockup" href="${basePath === "." ? "./index.html" : "../index.html"}">
          <span class="brand-title">ngason.com</span>
          <span class="brand-subtitle">Lưu giữ địa danh, ký ức và tư liệu</span>
        </a>
        <nav class="nav-links" aria-label="Điều hướng chính">${links}</nav>
      </div>
    `);
  }

  function renderFooter(site) {
    const basePath = dataApi.getBasePath();
    const links = site.navigation.map((item) => {
      const href = basePath === "." ? item.href : item.href.replace(/^\.\//, "../");
      return `<a href="${href}">${item.label}</a>`;
    }).join("");

    setHtml("[data-site-footer]", `
      <div class="footer-shell">
        <div>
          <div class="brand-title">ngason.com</div>
          <p class="footer-copy">${site.footer.note}</p>
        </div>
        <div class="footer-links">${links}</div>
      </div>
    `);
  }

  function renderNotices(site) {
    if (!document.querySelector("[data-notice-list]")) {
      return;
    }

    setHtml("[data-notice-list]", `
      <div class="notice-list">
        ${site.notices.map((notice) => `<div class="notice-card">${notice}</div>`).join("")}
      </div>
    `);
  }

  async function loadHome(site) {
    const [communes, timeline, people, posts, gallery] = await Promise.all([
      dataApi.getCommunes(),
      dataApi.getTimeline(),
      dataApi.getPeople(),
      dataApi.getPosts(),
      dataApi.getGallery()
    ]);

    setText("[data-home-title]", site.home.title);
    setText("[data-home-summary]", site.home.summary);
    setHtml("[data-feature-grid]", site.home.features.map(renderers.renderFeatureCard).join(""));
    setHtml("[data-home-communes]", communes.slice(0, 3).map((item) => renderers.renderCommuneCard(item, dataApi.getBasePath())).join(""));
    setHtml("[data-home-timeline]", timeline.slice(0, 3).map((item) => renderers.renderTimelineItem(item, item.relatedCommunes)).join(""));
    setHtml("[data-home-posts]", posts.slice(0, 2).map((item) => renderers.renderPostCard(item, dataApi.getBasePath())).join(""));
    setHtml("[data-home-people]", people.slice(0, 2).map((item) => renderers.renderPersonCard(item, dataApi.getBasePath())).join(""));
    setHtml("[data-home-gallery]", gallery.slice(0, 3).map((item) => `
      <div class="gallery-thumb">
        <img src="${resolvePath(item.image)}" alt="${item.alt}">
      </div>
    `).join(""));
  }

  async function loadCommunes() {
    const [communes, relations, timeline] = await Promise.all([
      dataApi.getCommunes(),
      dataApi.getCommuneRelations(),
      dataApi.getTimeline()
    ]);
    const lookups = getRelationLookups(relations);
    const modernCards = relations.modernUnits.map((unit) => renderers.renderModernUnitCard(unit, getCommuneFormedFromNames(unit, lookups))).join("");

    setHtml("[data-commune-stats]", [
      renderers.renderStatCard("Hồ sơ lịch sử", String(communes.length), "Số hồ sơ xã và thị trấn lịch sử đang phục vụ cho tra cứu."),
      renderers.renderStatCard("Mốc cần đối chiếu thêm", String(communes.filter((item) => item.status !== "verified").length), "Các mục đã có cấu trúc nhưng còn cần nâng độ chắc chắn nguồn ở một số mốc."),
      renderers.renderStatCard("Xã mới sau 2025", String(relations.modernUnits.length), "Các đơn vị hiện nay để người dùng tra ngược từ tên mới về tên cũ.")
    ].join(""));

    setHtml("[data-modern-communes-list]", modernCards);

    const listElement = document.querySelector("[data-communes-list]");
    const searchInput = document.querySelector("[data-commune-search-input]");
    const metaElement = document.querySelector("[data-commune-search-meta]");
    const timelineMatchesElement = document.querySelector("[data-commune-search-timeline]");

    function renderCommuneResults(query) {
      const needle = normalize(query);
      const communeMatches = communes.filter((item) => {
        const relation = lookups.historicalBySlug.get(item.slug);
        const haystack = [
          item.name,
          item.summary,
          ...(item.alternateNames || []),
          ...(item.tags || []),
          ...(relation?.searchTerms || []),
          ...getCommuneSuccessorNames(relation, lookups)
        ].join(" ");
        return !needle || normalize(haystack).includes(needle);
      });

      const modernMatches = relations.modernUnits.filter((item) => {
        const formedFrom = getCommuneFormedFromNames(item, lookups).join(" ");
        const haystack = [item.name, item.period, formedFrom, ...(item.searchTerms || [])].join(" ");
        return needle && normalize(haystack).includes(needle);
      });

      const timelineMatches = timeline.filter((item) => {
        const haystack = [item.period, item.title, item.summary, ...(item.relatedCommunes || [])].join(" ");
        return needle && normalize(haystack).includes(needle);
      });

      setHtml("[data-communes-list]", communeMatches.length
        ? communeMatches.map((item) => renderers.renderCommuneCard(item, dataApi.getBasePath())).join("")
        : renderers.renderEmptyState("Không tìm thấy hồ sơ xã phù hợp với từ khóa đang nhập."));

      if (needle && modernMatches.length) {
        setHtml("[data-modern-communes-list]", modernMatches.map((item) => renderers.renderModernUnitCard(item, getCommuneFormedFromNames(item, lookups))).join(""));
      } else {
        setHtml("[data-modern-communes-list]", modernCards);
      }

      setHtml("[data-commune-search-timeline]", needle
        ? (timelineMatches.length
          ? timelineMatches.map((item) => renderers.renderTimelineItem(item, item.relatedCommunes)).join("")
          : renderers.renderEmptyState("Không có mốc timeline nào khớp với từ khóa hiện tại."))
        : "");

      if (metaElement) {
        metaElement.textContent = needle
          ? `Tìm thấy ${communeMatches.length} hồ sơ lịch sử, ${modernMatches.length} xã mới và ${timelineMatches.length} mốc timeline.`
          : "Đang hiển thị toàn bộ hồ sơ lịch sử và 6 xã mới sau năm 2025.";
      }
    }

    renderCommuneResults("");

    if (searchInput && listElement && timelineMatchesElement) {
      searchInput.addEventListener("input", (event) => renderCommuneResults(event.target.value));
    }
  }

  async function loadCommune() {
    const [communes, posts, people, timeline, relations] = await Promise.all([
      dataApi.getCommunes(),
      dataApi.getPosts(),
      dataApi.getPeople(),
      dataApi.getTimeline(),
      dataApi.getCommuneRelations()
    ]);
    const lookups = getRelationLookups(relations);

    const current = dataApi.findBySlug(communes, dataApi.getSlug()) || communes[0];

    if (!current) {
      return;
    }

    setHtml("[data-commune-hero]", renderers.renderDetailHero(current, "commune", dataApi.getBasePath()));
    setHtml("[data-commune-body]", renderers.renderRichSections(current.sections));

    const relation = lookups.historicalBySlug.get(current.slug);
    const formedFromNames = getCommuneFormedFromNames(relation, lookups);
    const successorNames = getCommuneSuccessorNames(relation, lookups);
    const relatedTimeline = getRelatedTimelineEntries(relation, timeline);

    setHtml("[data-commune-aside]", renderers.renderKeyValueList([
      { label: "Tên gọi khác", value: current.alternateNames },
      { label: "Tình trạng tư liệu", value: current.sourceStatus },
      { label: "Nhãn giai đoạn", value: current.periodLabel },
      { label: "Thẻ chủ đề", value: current.tags },
      { label: "Đơn vị kế thừa", value: successorNames },
      { label: "Tiền thân", value: formedFromNames }
    ]));

    setHtml("[data-commune-transition]", [
      formedFromNames.length
        ? renderers.renderInfoCard("Được hình thành từ", formedFromNames.join(", "), [renderers.renderBadge("Tiền thân")])
        : renderers.renderInfoCard("Vị trí trong chuỗi lịch sử", "Đây là một xã nền hoặc đơn vị gốc trong lớp dữ liệu lịch sử của Nga Sơn.", [renderers.renderBadge("Lớp gốc")]),
      successorNames.length
        ? renderers.renderInfoCard("Đơn vị kế thừa", successorNames.join(", "), [renderers.renderBadge("Sau sáp nhập", "badge-neutral")])
        : renderers.renderInfoCard("Đơn vị kế thừa", "Chưa xác định đơn vị kế thừa trong dữ liệu hiện tại.", [renderers.renderBadge("Đang cập nhật", "badge-neutral")])
    ].join(""));

    setHtml("[data-commune-timeline]", relatedTimeline.length
      ? relatedTimeline.map((item) => renderers.renderTimelineItem(item, item.relatedCommunes)).join("")
      : renderers.renderEmptyState("Chưa có mốc timeline gắn trực tiếp với hồ sơ này."));

    setHtml("[data-commune-modern-links]", successorNames.length
      ? successorNames.map((name) => renderers.renderInfoCard(name, `Đây là đơn vị hiện nay hoặc đơn vị kế tiếp có liên hệ trực tiếp với ${current.name}.`, [renderers.renderBadge("Tra cứu ngược")])).join("")
      : renderers.renderEmptyState("Hồ sơ này hiện chưa có đơn vị kế thừa trong dữ liệu quan hệ."));

    const relatedPosts = posts.filter((item) => current.relatedPosts.includes(item.slug));
    const relatedPeople = people.filter((item) => current.relatedPeople.includes(item.slug));

    setHtml("[data-commune-posts]", relatedPosts.length
      ? relatedPosts.map((item) => renderers.renderPostCard(item, dataApi.getBasePath())).join("")
      : renderers.renderEmptyState("Chưa nối bài viết nào với hồ sơ xã này."));
    setHtml("[data-commune-people]", relatedPeople.length
      ? relatedPeople.map((item) => renderers.renderPersonCard(item, dataApi.getBasePath())).join("")
      : renderers.renderEmptyState("Chưa nối hồ sơ nhân vật nào với xã này."));
  }

  async function loadTimeline() {
    const timeline = await dataApi.getTimeline();
    const input = document.querySelector("[data-timeline-search-input]");
    const meta = document.querySelector("[data-timeline-search-meta]");

    function renderTimelineResults(query) {
      const needle = normalize(query);
      const matches = timeline.filter((item) => {
        const haystack = [item.period, item.title, item.summary, ...(item.relatedCommunes || [])].join(" ");
        return !needle || normalize(haystack).includes(needle);
      });

      setHtml("[data-timeline-list]", matches.length
        ? matches.map((item) => renderers.renderTimelineItem(item, item.relatedCommunes)).join("")
        : renderers.renderEmptyState("Không tìm thấy mốc lịch sử phù hợp với từ khóa đang nhập."));

      if (meta) {
        meta.textContent = needle
          ? `Đang hiển thị ${matches.length} mốc khớp với từ khóa.`
          : `Đang hiển thị toàn bộ ${timeline.length} mốc lịch sử.`;
      }
    }

    renderTimelineResults("");

    if (input) {
      input.addEventListener("input", (event) => renderTimelineResults(event.target.value));
    }
  }

  async function loadPeople() {
    const people = await dataApi.getPeople();
    setHtml("[data-people-list]", people.map((item) => renderers.renderPersonCard(item, dataApi.getBasePath())).join(""));
  }

  async function loadPerson() {
    const people = await dataApi.getPeople();
    const current = dataApi.findBySlug(people, dataApi.getSlug()) || people[0];

    if (!current) {
      return;
    }

    setHtml("[data-person-hero]", renderers.renderDetailHero(current, "person", dataApi.getBasePath()));
    setHtml("[data-person-body]", renderers.renderRichSections(current.sections));
    setHtml("[data-person-aside]", renderers.renderKeyValueList([
      { label: "Vai trò", value: current.role },
      { label: "Tình trạng tư liệu", value: current.sourceStatus },
      { label: "Địa danh liên hệ", value: current.relatedCommunes },
      { label: "Thẻ chủ đề", value: current.tags }
    ]));
  }

  async function loadPosts() {
    const posts = await dataApi.getPosts();
    setHtml("[data-posts-list]", posts.map((item) => renderers.renderPostCard(item, dataApi.getBasePath())).join(""));
  }

  async function loadPost() {
    const posts = await dataApi.getPosts();
    const current = dataApi.findBySlug(posts, dataApi.getSlug()) || posts[0];

    if (!current) {
      return;
    }

    setHtml("[data-post-hero]", renderers.renderDetailHero(current, "post", dataApi.getBasePath()));
    setHtml("[data-post-body]", renderers.renderRichSections(current.sections));
    setHtml("[data-post-aside]", renderers.renderKeyValueList([
      { label: "Chuyên mục", value: current.category },
      { label: "Tình trạng biên tập", value: current.statusLabel },
      { label: "Liên hệ xã", value: current.relatedCommunes },
      { label: "Liên hệ nhân vật", value: current.relatedPeople },
      { label: "Nguồn", value: current.sourceStatus }
    ]));
  }

  async function loadGallery() {
    const gallery = await dataApi.getGallery();
    setHtml("[data-gallery-list]", gallery.map((item) => renderers.renderGalleryCard(item, dataApi.getBasePath())).join(""));
    window.NgasonLightbox.initLightbox();
  }

  async function loadAbout(site) {
    const html = site.about.sections.map((section) => `
      <section>
        <h2>${section.title}</h2>
        ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
        ${section.list?.length ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
      </section>
    `).join("");
    setHtml("[data-about-content]", html);
  }

  async function bootstrap() {
    try {
      const site = await dataApi.getSite();
      renderHeader(site);
      renderFooter(site);
      renderNotices(site);

      switch (document.body.dataset.page) {
        case "home":
          await loadHome(site);
          break;
        case "communes":
          await loadCommunes();
          break;
        case "commune":
          await loadCommune();
          break;
        case "timeline":
          await loadTimeline();
          break;
        case "people":
          await loadPeople();
          break;
        case "person":
          await loadPerson();
          break;
        case "posts":
          await loadPosts();
          break;
        case "post":
          await loadPost();
          break;
        case "gallery":
          await loadGallery();
          break;
        case "about":
          await loadAbout(site);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
    } finally {
      activateReveal();
    }
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();