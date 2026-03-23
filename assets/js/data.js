(function () {
  const cache = new Map();

  function getBasePath() {
    return window.location.pathname.includes("/pages/") ? ".." : ".";
  }

  async function loadJson(relativePath) {
    const path = `${getBasePath()}${relativePath}`;

    if (cache.has(path)) {
      return cache.get(path);
    }

    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }

    const data = await response.json();
    cache.set(path, data);
    return data;
  }

  function getSlug() {
    return new URLSearchParams(window.location.search).get("slug");
  }

  function findBySlug(collection, slug) {
    return collection.find((item) => item.slug === slug);
  }

  window.NgasonData = {
    getBasePath,
    getSlug,
    findBySlug,
    getSite: () => loadJson("/data/site.json"),
    getCommunes: () => loadJson("/data/communes.json"),
    getTimeline: () => loadJson("/data/timeline.json"),
    getPeople: () => loadJson("/data/people.json"),
    getPosts: () => loadJson("/data/posts.json"),
    getGallery: () => loadJson("/data/gallery.json")
  };
})();