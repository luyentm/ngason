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
    const revealElements = document.querySelectorAll(".reveal");

    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        element.classList.add("is-visible");
      }
    });

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: "0px 0px -8% 0px"
    });

    revealElements.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        observer.observe(element);
      }
    });
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

  function buildCommuneNameLookups(communes, relations) {
    const lookup = new Map();

    communes.forEach((item) => {
      lookup.set(normalize(item.name), item.slug);
      (item.alternateNames || []).forEach((name) => lookup.set(normalize(name), item.slug));
    });

    relations.modernUnits.forEach((item) => {
      lookup.set(normalize(item.name), item.slug);
    });

    return lookup;
  }

  function getTimelineLinkItems(names, nameLookups) {
    return (names || []).map((name) => {
      const slug = nameLookups.get(normalize(name));
      return slug
        ? { name, href: `${dataApi.getBasePath()}/pages/commune.html?slug=${slug}` }
        : { name };
    });
  }

  function buildProfileFromSlug(slug, communes, lookups) {
    const commune = dataApi.findBySlug(communes, slug);
    if (commune) {
      return commune;
    }

    const modernUnit = lookups.modernBySlug.get(slug);
    return modernUnit ? buildModernCommuneProfile(modernUnit, lookups, communes) : null;
  }

  function getSuccessorChain(slug, lookups, visited = new Set()) {
    if (!slug || visited.has(slug)) {
      return [];
    }

    visited.add(slug);
    const relation = lookups.historicalBySlug.get(slug);
    if (!relation) {
      return [];
    }

    const historicalSuccessor = (relation.successors || []).find((item) => lookups.historicalBySlug.has(item));
    if (historicalSuccessor) {
      return [historicalSuccessor, ...getSuccessorChain(historicalSuccessor, lookups, visited)];
    }

    const modernSuccessor = (relation.successors || []).find((item) => lookups.modernBySlug.has(item));
    return modernSuccessor ? [modernSuccessor] : [];
  }

  function getCommuneBreadcrumbItems(current, relation, lookups, communes) {
    const items = [
      {
        label: "Danh sách xã",
        href: `${dataApi.getBasePath()}/pages/communes.html`
      }
    ];

    if (relation?.kind === "modern") {
      items.push({ label: current.name });
      return items;
    }

    const successorChain = getSuccessorChain(current.slug, lookups)
      .map((slug) => buildProfileFromSlug(slug, communes, lookups))
      .filter(Boolean)
      .reverse();

    successorChain.forEach((item) => {
      items.push({
        label: item.name,
        href: `${dataApi.getBasePath()}/pages/commune.html?slug=${item.slug}`
      });
    });

    items.push({ label: current.name });
    return items;
  }

  function getHistoricalCommunesBySlugs(slugs, lookups, communes) {
    return (slugs || [])
      .map((slug) => {
        const relation = lookups.historicalBySlug.get(slug);
        if (!relation) {
          return null;
        }

        const commune = communes.find((item) => item.slug === slug);
        return commune ? { slug: commune.slug, name: commune.name } : null;
      })
      .filter(Boolean);
  }

  function getModernUnitsBySlugs(slugs, lookups) {
    return (slugs || [])
      .map((slug) => lookups.modernBySlug.get(slug))
      .filter(Boolean);
  }

  function getClusterRelatedCommunes(currentRelation, relations, currentSlug, communes) {
    if (!currentRelation) {
      return [];
    }

    const successorSet = new Set(currentRelation.successors || []);
    const formedFromSet = new Set(currentRelation.formedFrom || []);

    return relations.historicalUnits
      .filter((item) => item.slug !== currentSlug)
      .filter((item) => {
        const sharesSuccessor = (item.successors || []).some((slug) => successorSet.has(slug));
        const isParentOrChild = formedFromSet.has(item.slug) || (item.formedFrom || []).includes(currentSlug);
        const sharesSameFormation = (item.formedFrom || []).some((slug) => formedFromSet.has(slug));
        return sharesSuccessor || isParentOrChild || sharesSameFormation;
      })
      .map((item) => {
        const commune = communes.find((entry) => entry.slug === item.slug);
        return commune ? { slug: commune.slug, name: commune.name } : null;
      })
      .filter(Boolean);
  }

  function getCommuneKindLabel(kind) {
    switch (kind) {
      case "modern":
        return "Xã hiện nay";
      case "intermediate":
        return "Đơn vị trung gian";
      case "historical":
        return "Đơn vị lịch sử";
      default:
        return "Hồ sơ hành chính";
    }
  }

  function buildModernCommuneProfile(unit, lookups, communes) {
    const formedFromCommunes = getHistoricalCommunesBySlugs(unit.formedFrom || [], lookups, communes);
    const formedFromNames = formedFromCommunes.map((item) => item.name);

    return {
      id: unit.slug,
      slug: unit.slug,
      name: unit.name,
      alternateNames: [],
      summary: `${unit.name} là xã hiện nay của khu vực Nga Sơn cũ, được tổ chức lại từ năm 2025 trên cơ sở ${formedFromNames.join(", ")}.`,
      periodLabel: unit.period,
      status: "verified",
      statusLabel: "Đơn vị hiện nay",
      sourceStatus: "Tổng hợp từ Nghị quyết 1686 năm 2025 và bảng ánh xạ các xã cũ của Nga Sơn",
      featuredImage: "assets/images/commune-placeholder.svg",
      relatedPosts: [],
      relatedPeople: [],
      tags: ["2025", "xã hiện nay", ...formedFromNames],
      sections: [
        {
          title: "Hình thành",
          paragraphs: [
            `${unit.name} là một trong 6 xã mới của khu vực Nga Sơn sau đợt sắp xếp năm 2025.`,
            formedFromNames.length
              ? `Đơn vị này được hình thành từ các xã và đơn vị liền trước gồm ${formedFromNames.join(", ")}.`
              : "Dữ liệu hiện tại chưa có đủ thông tin về các đơn vị cấu thành trực tiếp."
          ]
        },
        {
          title: "Cách tra cứu ngược",
          paragraphs: [
            `Trang này giúp người đọc đi từ tên xã hiện nay ${unit.name} ngược về các xã cũ từng thuộc huyện Nga Sơn.`,
            "Đây là lớp thông tin quan trọng cho người xa quê khi chỉ còn nhớ tên xã cũ hoặc tên xã mới sau sáp nhập."
          ]
        }
      ]
    };
  }

  function getProfileFacts(current, relation, relatedTimeline) {
    return [
      { label: "Loại hồ sơ", value: getCommuneKindLabel(relation?.kind) },
      { label: "Giai đoạn", value: current.periodLabel },
      { label: "Mốc đầu", value: relation?.start || "Chưa rõ" },
      { label: "Mốc cuối", value: relation?.end || "Chưa rõ" },
      { label: "Mốc liên quan", value: String(relatedTimeline.length) },
      { label: "Độ chắc chắn", value: current.statusLabel }
    ];
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
    const [communes, timeline, relations, people, posts, gallery] = await Promise.all([
      dataApi.getCommunes(),
      dataApi.getTimeline(),
      dataApi.getCommuneRelations(),
      dataApi.getPeople(),
      dataApi.getPosts(),
      dataApi.getGallery()
    ]);
    const nameLookups = buildCommuneNameLookups(communes, relations);

    setText("[data-home-title]", site.home.title);
    setText("[data-home-summary]", site.home.summary);
    setHtml("[data-feature-grid]", site.home.features.map(renderers.renderFeatureCard).join(""));
    setHtml("[data-home-communes]", communes.slice(0, 3).map((item) => renderers.renderCommuneCard(item, dataApi.getBasePath())).join(""));
    setHtml("[data-home-timeline]", timeline.slice(0, 3).map((item) => renderers.renderTimelineItem(item, getTimelineLinkItems(item.relatedCommunes, nameLookups))).join(""));
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
    const nameLookups = buildCommuneNameLookups(communes, relations);
    const modernCards = relations.modernUnits.map((unit) => renderers.renderModernUnitCard({ ...unit, href: `${dataApi.getBasePath()}/pages/commune.html?slug=${unit.slug}` }, getCommuneFormedFromNames(unit, lookups))).join("");

    setHtml("[data-commune-stats]", [
      renderers.renderStatCard("Hồ sơ lịch sử", String(communes.length), "Số hồ sơ xã và thị trấn lịch sử đang phục vụ cho tra cứu."),
      renderers.renderStatCard("Mốc cần đối chiếu thêm", String(communes.filter((item) => item.status !== "verified").length), "Các mục đã có cấu trúc nhưng còn cần nâng độ chắc chắn nguồn ở một số mốc."),
      renderers.renderStatCard("Xã mới sau 2025", String(relations.modernUnits.length), "Các đơn vị hiện nay để người dùng tra ngược từ tên mới về tên cũ.")
    ].join(""));

    setHtml("[data-commune-directory]", renderers.renderDirectoryLinks(
      [...communes].sort((left, right) => left.name.localeCompare(right.name, "vi")),
      dataApi.getBasePath(),
      "Chưa có danh mục xã để hiển thị."
    ));

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
        setHtml("[data-modern-communes-list]", modernMatches.map((item) => renderers.renderModernUnitCard({ ...item, href: `${dataApi.getBasePath()}/pages/commune.html?slug=${item.slug}` }, getCommuneFormedFromNames(item, lookups))).join(""));
      } else {
        setHtml("[data-modern-communes-list]", modernCards);
      }

      setHtml("[data-commune-search-timeline]", needle
        ? (timelineMatches.length
          ? timelineMatches.map((item) => renderers.renderTimelineItem(item, getTimelineLinkItems(item.relatedCommunes, nameLookups))).join("")
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
    const nameLookups = buildCommuneNameLookups(communes, relations);
    const currentSlug = dataApi.getSlug();
    const modernUnit = lookups.modernBySlug.get(currentSlug);
    const current = dataApi.findBySlug(communes, currentSlug) || (modernUnit ? buildModernCommuneProfile(modernUnit, lookups, communes) : communes[0]);

    if (!current) {
      return;
    }

    setHtml("[data-commune-hero]", renderers.renderDetailHero(current, "commune", dataApi.getBasePath()));
    setHtml("[data-commune-body]", renderers.renderRichSections(current.sections));

    const relation = lookups.historicalBySlug.get(current.slug) || (modernUnit
      ? {
        slug: modernUnit.slug,
        kind: "modern",
        start: "2025",
        end: "Nay",
        formedFrom: modernUnit.formedFrom || [],
        successors: [],
        milestones: ["timeline-2025"],
        searchTerms: modernUnit.searchTerms || []
      }
      : null);
    const formedFromNames = getCommuneFormedFromNames(relation, lookups);
    const successorNames = getCommuneSuccessorNames(relation, lookups);
    const relatedTimeline = getRelatedTimelineEntries(relation, timeline);
    const predecessorCommunes = getHistoricalCommunesBySlugs(relation?.formedFrom || [], lookups, communes);
    const successorCommunes = getHistoricalCommunesBySlugs(relation?.successors || [], lookups, communes);
    const successorModernUnits = getModernUnitsBySlugs(relation?.successors || [], lookups);
    const clusterRelatedCommunes = relation?.kind === "modern"
      ? predecessorCommunes
      : getClusterRelatedCommunes(relation, relations, current.slug, communes);
    const allProfiles = [...communes, ...relations.modernUnits.map((unit) => buildModernCommuneProfile(unit, lookups, communes))];
    const sortedCommunes = allProfiles.sort((left, right) => left.name.localeCompare(right.name, "vi"));
    const currentIndex = sortedCommunes.findIndex((item) => item.slug === current.slug);
    const previousCommune = currentIndex > 0 ? sortedCommunes[currentIndex - 1] : null;
    const nextCommune = currentIndex >= 0 && currentIndex < sortedCommunes.length - 1 ? sortedCommunes[currentIndex + 1] : null;
    const searchTerms = Array.from(new Set([...(current.alternateNames || []), ...(relation?.searchTerms || [])]));
    const breadcrumbItems = getCommuneBreadcrumbItems(current, relation, lookups, communes);

    setHtml("[data-commune-breadcrumb]", renderers.renderBreadcrumbs(breadcrumbItems));

    setHtml("[data-commune-aside]", renderers.renderKeyValueList([
      { label: "Tên gọi khác", value: current.alternateNames },
      { label: "Tình trạng tư liệu", value: current.sourceStatus },
      { label: "Nhãn giai đoạn", value: current.periodLabel },
      { label: "Thẻ chủ đề", value: current.tags },
      { label: "Đơn vị kế thừa", value: successorNames },
      { label: "Tiền thân", value: formedFromNames }
    ]));

    setHtml("[data-commune-profile-cards]", [
      renderers.renderInfoCard("Tổng quan hồ sơ", current.summary, [renderers.renderBadge(current.statusLabel)]),
      renderers.renderInfoCard("Tình trạng nguồn", current.sourceStatus, [renderers.renderBadge(current.periodLabel, "badge-neutral")]),
      renderers.renderFactGrid(getProfileFacts(current, relation, relatedTimeline))
    ].join(""));

    setHtml("[data-commune-search-terms]", [
      renderers.renderInfoCard(
        "Tên và từ khóa để tra cứu",
        searchTerms.length
          ? "Dùng các tên dưới đây để tìm xã này từ ký ức địa phương, tên hành chính cũ hoặc tên gọi trong các lần sáp nhập."
          : "Hồ sơ này hiện chưa có thêm tên gọi phụ ngoài tên chính."
      ),
      renderers.renderLinkPills(
        predecessorCommunes,
        dataApi.getBasePath(),
        "Hồ sơ này không có đơn vị tiền thân trực tiếp trong dữ liệu hiện tại."
      ),
      searchTerms.length
        ? renderers.renderTextPills(searchTerms, "")
        : ""
    ].join(""));

    setHtml("[data-commune-same-cluster]", [
      renderers.renderInfoCard(
        "Các xã cùng nhóm chuyển đổi",
        clusterRelatedCommunes.length
          ? `${current.name} nằm trong cùng cụm biến động hành chính với các hồ sơ dưới đây.`
          : `Hiện chưa có thêm hồ sơ nào được xác định cùng cụm chuyển đổi trực tiếp với ${current.name}.`
      ),
      renderers.renderLinkPills(
        clusterRelatedCommunes,
        dataApi.getBasePath(),
        "Chưa có xã liên quan nào khác trong cùng cụm sáp nhập hoặc hình thành."
      )
    ].join(""));

    setHtml("[data-commune-transition]", [
      predecessorCommunes.length
        ? renderers.renderLinkCard("Được hình thành từ", formedFromNames.join(", "), `${dataApi.getBasePath()}/pages/commune.html?slug=${predecessorCommunes[0].slug}`, "Mở một hồ sơ tiền thân", [renderers.renderBadge("Tiền thân")])
        : renderers.renderInfoCard("Vị trí trong chuỗi lịch sử", "Đây là một xã nền hoặc đơn vị gốc trong lớp dữ liệu lịch sử của Nga Sơn.", [renderers.renderBadge("Lớp gốc")]),
      successorNames.length
        ? renderers.renderInfoCard("Đơn vị kế thừa", successorNames.join(", "), [renderers.renderBadge("Sau sáp nhập", "badge-neutral")])
        : renderers.renderInfoCard("Đơn vị kế thừa", "Chưa xác định đơn vị kế thừa trong dữ liệu hiện tại.", [renderers.renderBadge("Đang cập nhật", "badge-neutral")])
    ].join(""));

    setHtml("[data-commune-timeline]", relatedTimeline.length
      ? relatedTimeline.map((item) => renderers.renderTimelineItem(item, getTimelineLinkItems(item.relatedCommunes, nameLookups))).join("")
      : renderers.renderEmptyState("Chưa có mốc timeline gắn trực tiếp với hồ sơ này."));

    setHtml("[data-commune-modern-links]", successorModernUnits.length
      ? successorModernUnits.map((unit) => renderers.renderLinkCard(unit.name, `Hình thành từ ${getCommuneFormedFromNames(unit, lookups).join(", ")}. Đây là điểm tra ngược từ tên mới về các xã cũ liên quan đến ${current.name}.`, `${dataApi.getBasePath()}/pages/commune.html?slug=${unit.slug}`, "Mở trang xã mới", [renderers.renderBadge(unit.period), renderers.renderBadge("Tra cứu ngược", "badge-neutral")])).join("")
      : successorCommunes.length
        ? successorCommunes.map((unit) => renderers.renderLinkCard(unit.name, `Đơn vị lịch sử kế tiếp có liên hệ trực tiếp với ${current.name}.`, `${dataApi.getBasePath()}/pages/commune.html?slug=${unit.slug}`, "Mở hồ sơ", [renderers.renderBadge("Kế tiếp", "badge-neutral")])).join("")
      : renderers.renderEmptyState("Hồ sơ này hiện chưa có đơn vị kế thừa trong dữ liệu quan hệ."));

    setHtml("[data-commune-related-links]", [
      predecessorCommunes.length
        ? renderers.renderLinkPills(predecessorCommunes, dataApi.getBasePath(), "")
        : "",
      renderers.renderLinkPills(clusterRelatedCommunes, dataApi.getBasePath(), "Chưa có thêm hồ sơ xã liên quan để điều hướng chéo.")
    ].join(""));

    setHtml("[data-commune-navigation]", [
      previousCommune
        ? renderers.renderLinkCard(previousCommune.name, `Mở hồ sơ liền trước theo thứ tự bảng chữ cái để rà soát toàn bộ danh mục xã Nga Sơn.`, `${dataApi.getBasePath()}/pages/commune.html?slug=${previousCommune.slug}`, "Xem hồ sơ trước", [renderers.renderBadge("Trước")])
        : renderers.renderInfoCard("Đầu danh mục", "Đây là hồ sơ đầu tiên theo thứ tự tên trong danh mục xã hiện có.", [renderers.renderBadge("Điều hướng")]),
      nextCommune
        ? renderers.renderLinkCard(nextCommune.name, `Mở hồ sơ liền sau để tiếp tục duyệt toàn bộ phần xã một cách tuần tự.`, `${dataApi.getBasePath()}/pages/commune.html?slug=${nextCommune.slug}`, "Xem hồ sơ tiếp", [renderers.renderBadge("Sau")])
        : renderers.renderInfoCard("Cuối danh mục", "Đây là hồ sơ cuối cùng theo thứ tự tên trong danh mục xã hiện có.", [renderers.renderBadge("Điều hướng")])
    ].join(""));

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
    const [timeline, communes, relations] = await Promise.all([
      dataApi.getTimeline(),
      dataApi.getCommunes(),
      dataApi.getCommuneRelations()
    ]);
    const nameLookups = buildCommuneNameLookups(communes, relations);
    const input = document.querySelector("[data-timeline-search-input]");
    const meta = document.querySelector("[data-timeline-search-meta]");

    function renderTimelineResults(query) {
      const needle = normalize(query);
      const matches = timeline.filter((item) => {
        const haystack = [item.period, item.title, item.summary, ...(item.relatedCommunes || [])].join(" ");
        return !needle || normalize(haystack).includes(needle);
      });

      setHtml("[data-timeline-list]", matches.length
        ? matches.map((item) => renderers.renderTimelineItem(item, getTimelineLinkItems(item.relatedCommunes, nameLookups))).join("")
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
    const input = document.querySelector("[data-people-search-input]");
    const meta = document.querySelector("[data-people-search-meta]");

    function renderPeopleResults(query) {
      const needle = normalize(query);
      const matches = people.filter((item) => {
        const haystack = [
          item.name,
          item.role,
          item.lifeSpan,
          item.hometown,
          item.summary,
          ...(item.relatedCommunes || []),
          ...(item.tags || [])
        ].join(" ");

        return !needle || normalize(haystack).includes(needle);
      });

      setHtml("[data-people-list]", matches.length
        ? matches.map((item) => renderers.renderPersonCard(item, dataApi.getBasePath())).join("")
        : renderers.renderEmptyState("Không tìm thấy danh nhân gốc Nga Sơn khớp với từ khóa đang nhập."));

      if (meta) {
        meta.textContent = needle
          ? `Tìm thấy ${matches.length} danh nhân khớp với từ khóa.`
          : `Đang hiển thị ${people.length} hồ sơ danh nhân gốc Nga Sơn.`;
      }
    }

    renderPeopleResults("");

    if (input) {
      input.addEventListener("input", (event) => renderPeopleResults(event.target.value));
    }
  }

  async function loadPerson() {
    const [people, posts] = await Promise.all([
      dataApi.getPeople(),
      dataApi.getPosts()
    ]);
    const current = dataApi.findBySlug(people, dataApi.getSlug()) || people[0];

    if (!current) {
      return;
    }

    const relatedPosts = posts.filter((item) => (current.relatedPosts || []).includes(item.slug));

    setHtml("[data-person-hero]", renderers.renderDetailHero(current, "person", dataApi.getBasePath()));
    setHtml("[data-person-body]", renderers.renderRichSections(current.sections));
    setHtml("[data-person-aside]", renderers.renderKeyValueList([
      { label: "Vai trò", value: current.role },
      { label: "Giai đoạn", value: current.lifeSpan },
      { label: "Quê gốc", value: current.hometown },
      { label: "Tình trạng tư liệu", value: current.sourceStatus },
      { label: "Địa danh liên hệ", value: current.relatedCommunes },
      { label: "Thẻ chủ đề", value: current.tags }
    ]));
    setHtml("[data-person-posts]", relatedPosts.length
      ? relatedPosts.map((item) => renderers.renderPostCard(item, dataApi.getBasePath())).join("")
      : renderers.renderEmptyState("Hồ sơ này chưa có bài viết riêng được liên kết."));
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
    const categories = [...new Set(gallery.map((item) => item.category).filter(Boolean))];
    const filtersElement = document.querySelector("[data-gallery-filters]");
    const metaElement = document.querySelector("[data-gallery-meta]");

    function renderGalleryResults(activeCategory) {
      const matches = activeCategory
        ? gallery.filter((item) => item.category === activeCategory)
        : gallery;

      setHtml("[data-gallery-list]", matches.length
        ? matches.map((item) => renderers.renderGalleryCard(item, dataApi.getBasePath())).join("")
        : renderers.renderEmptyState("Không có ảnh tư liệu nào trong chuyên mục này."));

      if (metaElement) {
        metaElement.textContent = activeCategory
          ? `Đang hiển thị ${matches.length} ảnh trong chuyên mục "${activeCategory}".`
          : `Đang hiển thị toàn bộ ${gallery.length} ảnh tư liệu.`;
      }

      window.NgasonLightbox.initLightbox();
    }

    if (filtersElement && categories.length > 1) {
      const buttons = [`<button class="filter-btn is-active" data-filter="">Tất cả</button>`]
        .concat(categories.map((cat) => `<button class="filter-btn" data-filter="${cat}">${cat}</button>`));
      filtersElement.innerHTML = buttons.join("");

      filtersElement.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-filter]");
        if (!btn) return;
        filtersElement.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderGalleryResults(btn.dataset.filter || "");
      });
    }

    renderGalleryResults("");
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