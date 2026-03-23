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
    const communes = await dataApi.getCommunes();
    setHtml("[data-commune-stats]", [
      renderers.renderStatCard("Hồ sơ đã tạo", String(communes.length), "Số mục đã có khung dữ liệu và có thể tiếp tục mở rộng."),
      renderers.renderStatCard("Mục cần kiểm chứng", String(communes.filter((item) => item.status === "pending").length), "Nội dung mẫu đã có cấu trúc nhưng cần dữ liệu lịch sử chính xác."),
      renderers.renderStatCard("Mô hình dữ liệu", "JSON", "Mỗi xã được quản lý bằng schema thống nhất để dễ thêm mới.")
    ].join(""));

    setHtml("[data-communes-list]", communes.length
      ? communes.map((item) => renderers.renderCommuneCard(item, dataApi.getBasePath())).join("")
      : renderers.renderEmptyState("Chưa có hồ sơ xã nào được nhập."));
  }

  async function loadCommune() {
    const [communes, posts, people] = await Promise.all([
      dataApi.getCommunes(),
      dataApi.getPosts(),
      dataApi.getPeople()
    ]);

    const current = dataApi.findBySlug(communes, dataApi.getSlug()) || communes[0];

    if (!current) {
      return;
    }

    setHtml("[data-commune-hero]", renderers.renderDetailHero(current, "commune", dataApi.getBasePath()));
    setHtml("[data-commune-body]", renderers.renderRichSections(current.sections));
    setHtml("[data-commune-aside]", renderers.renderKeyValueList([
      { label: "Tên gọi khác", value: current.alternateNames },
      { label: "Tình trạng tư liệu", value: current.sourceStatus },
      { label: "Nhãn giai đoạn", value: current.periodLabel },
      { label: "Thẻ chủ đề", value: current.tags }
    ]));

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
    setHtml("[data-timeline-list]", timeline.map((item) => renderers.renderTimelineItem(item, item.relatedCommunes)).join(""));
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