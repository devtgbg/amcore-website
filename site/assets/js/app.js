const siteData = window.AMPCORE_SITE_DATA;
const currentPath = window.location.pathname.replace(/\\/g, "/");
const isSubpage = currentPath.includes("/pages/");
const comparisonColumns = [
  { key: "name", label: "Model" },
  { key: "voltage", label: "Voltage" },
  { key: "capacity", label: "Capacity" },
  { key: "energy", label: "Energy" },
  { key: "maxDischarge", label: "Max Discharge" },
  { key: "weight", label: "Weight (Approx.)" }
];
const pageFiles = {
  products: "products.html",
  product: "product.html",
  applications: "applications.html",
  technology: "technology.html",
  support: "support.html",
  contact: "contact.html"
};

function assetPath(path) {
  return isSubpage ? `../${path}` : path;
}

function pageHref(key, query = "") {
  if (key === "home") {
    return isSubpage ? "../index.html" : "index.html";
  }

  const file = pageFiles[key];
  if (!file) return query ? `${query}` : "#";
  const base = isSubpage ? file : `pages/${file}`;
  return `${base}${query}`;
}

function brandLockup() {
  return `
    <a class="brand" href="${pageHref("home")}" aria-label="AmpCore Energy home">
      <img src="${assetPath("assets/brand/brand-mark.svg")}" alt="" width="56" height="56" />
      <span class="brand-copy">
        <strong>AMPCORE</strong>
        <span>ENERGY</span>
      </span>
    </a>
  `;
}

function navLinks(currentPage) {
  const links = [
    ["home", "Home"],
    ["products", "Products"],
    ["applications", "Applications"],
    ["technology", "Technology"],
    ["support", "Support"],
    ["contact", "Contact"]
  ];

  return links
    .map(([key, label]) => {
      const active = currentPage === key ? "is-active" : "";
      const variant = key === "contact" ? "nav-contact" : "";
      const classes = [active, variant].filter(Boolean).join(" ");
      return `<a class="${classes}" href="${pageHref(key)}">${label}</a>`;
    })
    .join("");
}

function renderShell() {
  const page = document.body.dataset.page || "";
  const shellHeader = document.querySelector("[data-site-header]");
  const shellFooter = document.querySelector("[data-site-footer]");

  if (shellHeader) {
    shellHeader.innerHTML = `
      <div class="shell-container nav-shell">
        ${brandLockup()}
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav id="site-nav" class="site-nav">
          ${navLinks(page)}
        </nav>
      </div>
    `;
  }

  if (shellFooter) {
    shellFooter.innerHTML = `
      <div class="shell-container footer-grid">
        <div>
          ${brandLockup()}
          <p class="footer-copy">Premium LiFePO4 battery systems for electric mobility, utility vehicles, and long-lasting regional reliability.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <a href="${pageHref("products")}">Product Range</a>
          <a href="${pageHref("applications")}">Applications</a>
          <a href="${pageHref("technology")}">Technology</a>
          <a href="${pageHref("support")}">Warranty & Support</a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href="mailto:sales@ampcore.tech">sales@ampcore.tech</a>
          <a href="mailto:support@ampcore.tech">support@ampcore.tech</a>
          <a href="tel:+971542249901">+971 54 224 9901</a>
        </div>
      </div>
    `;
  }
}

function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const nextState = !(toggle.getAttribute("aria-expanded") === "true");
    toggle.setAttribute("aria-expanded", String(nextState));
    nav.classList.toggle("is-open", nextState);
  });
}

function renderProductsPreview() {
  const host = document.querySelector("[data-products-preview]");
  if (!host) return;

  host.innerHTML = siteData.products
    .map(
      (product) => `
        <article class="product-card reveal-card">
          <p class="eyebrow">${product.rangeLabel}</p>
          <h3>${product.shortName}</h3>
          <p>${product.description}</p>
          <dl class="product-metrics">
            <div><dt>Energy</dt><dd>${product.energy}</dd></div>
            <div><dt>Dimensions</dt><dd>${product.dimensions}</dd></div>
          </dl>
          <a class="text-link" href="${pageHref("product", `?model=${product.slug}`)}">View Specification</a>
        </article>
      `
    )
    .join("");
}

function renderProductsGrid() {
  const host = document.querySelector("[data-products-grid]");
  if (!host) return;

  host.innerHTML = siteData.products
    .map(
      (product) => `
        <article class="range-card reveal-card">
          <div class="range-copy">
            <p class="eyebrow">${product.rangeLabel}</p>
            <h3>${product.shortName}</h3>
            <p>${product.description}</p>
            <div class="range-highlights">
              ${product.highlights.map((item) => `<span>${item}</span>`).join("")}
            </div>
          </div>
          <img src="${assetPath(product.image)}" alt="${product.name} battery render" loading="lazy" />
          <div class="range-actions">
            <span>${product.energy}</span>
            <a class="button button-secondary" href="${pageHref("product", `?model=${product.slug}`)}">Open Product Page</a>
          </div>
        </article>
      `
    )
    .join("");
}

function getComparisonSortValue(product, key) {
  if (key === "name") {
    return product.name.toLowerCase();
  }

  const value = String(product[key]);
  const numericMatch = value.match(/-?\d+(?:\.\d+)?/);
  return numericMatch ? Number.parseFloat(numericMatch[0]) : 0;
}

function formatComparisonCell(product, key) {
  if (key === "name") {
    return `<a href="${pageHref("product", `?model=${product.slug}`)}">${product.name}</a>`;
  }

  if (key === "weight") {
    return String(product.weight).replace(/^Approx\.\s*/i, "");
  }

  return product[key];
}

function renderComparisonRows(products) {
  return products
    .map(
      (product) => `
        <tr>
          ${comparisonColumns
            .map((column) => `<td>${formatComparisonCell(product, column.key)}</td>`)
            .join("")}
        </tr>
      `
    )
    .join("");
}

function getSortedProducts(sortKey, sortDirection) {
  const products = [...siteData.products];
  if (!sortKey) return products;

  const direction = sortDirection === "desc" ? -1 : 1;

  return products.sort((left, right) => {
    const leftValue = getComparisonSortValue(left, sortKey);
    const rightValue = getComparisonSortValue(right, sortKey);

    if (leftValue < rightValue) return -1 * direction;
    if (leftValue > rightValue) return 1 * direction;
    return left.name.localeCompare(right.name);
  });
}

function updateComparisonTable(host) {
  const body = host.querySelector("[data-comparison-body]");
  if (!body) return;

  const sortKey = host.dataset.sortKey || "";
  const sortDirection = host.dataset.sortDirection || "asc";
  body.innerHTML = renderComparisonRows(getSortedProducts(sortKey, sortDirection));

  host.querySelectorAll("[data-sort-column]").forEach((heading) => {
    const isActive = heading.dataset.sortColumn === sortKey;
    const direction = isActive ? sortDirection : "none";
    const arrow = heading.querySelector(".sort-arrow");
    const button = heading.querySelector(".sort-toggle");

    heading.setAttribute(
      "aria-sort",
      direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"
    );

    if (button) {
      button.classList.toggle("is-active", isActive);
      button.dataset.direction = direction;
      button.setAttribute(
        "aria-label",
        isActive
          ? `Sorted by ${heading.dataset.sortLabel} ${direction === "asc" ? "ascending" : "descending"}. Click to reverse order.`
          : `Sort by ${heading.dataset.sortLabel} ascending`
      );
    }

    if (arrow) {
      arrow.innerHTML =
        direction === "asc" ? "&uarr;" : direction === "desc" ? "&darr;" : "&varr;";
    }
  });
}

function renderComparisonTable() {
  const host = document.querySelector("[data-comparison-table]");
  if (!host) return;

  host.dataset.sortKey = "";
  host.dataset.sortDirection = "asc";
  host.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          ${comparisonColumns
            .map(
              (column) => `
                <th scope="col" data-sort-column="${column.key}" data-sort-label="${column.label}" aria-sort="none">
                  <button class="sort-toggle" type="button" data-sort-key="${column.key}">
                    <span>${column.label}</span>
                    <span class="sort-arrow" aria-hidden="true">&varr;</span>
                  </button>
                </th>
              `
            )
            .join("")}
        </tr>
      </thead>
      <tbody data-comparison-body></tbody>
    </table>
  `;

  updateComparisonTable(host);
}

function setupComparisonSorting() {
  const host = document.querySelector("[data-comparison-table]");
  if (!host) return;

  host.addEventListener("click", (event) => {
    const button = event.target.closest(".sort-toggle");
    if (!button) return;

    const nextSortKey = button.dataset.sortKey || "";
    const currentSortKey = host.dataset.sortKey || "";
    const currentDirection = host.dataset.sortDirection || "asc";

    host.dataset.sortKey = nextSortKey;
    host.dataset.sortDirection =
      currentSortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc";
    updateComparisonTable(host);
  });
}

function renderTechnologyCards() {
  const host = document.querySelector("[data-technology-cards]");
  if (!host) return;

  host.innerHTML = siteData.technology
    .map(
      (item) => `
        <article class="feature-card reveal-card">
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `
    )
    .join("");
}

function renderProtectionList() {
  const host = document.querySelector("[data-protection-list]");
  if (!host) return;
  host.innerHTML = siteData.protection.map((item) => `<li>${item}</li>`).join("");
}

function renderSupportHighlights() {
  const host = document.querySelector("[data-support-highlights]");
  if (!host) return;

  const icons = {
    shield: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.6-2.8 8.7-7 10-4.2-1.3-7-5.4-7-10V6l7-3z"></path>
        <path d="M9.3 12.3l1.8 1.8 3.8-4.2"></path>
      </svg>
    `,
    calendar: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3v3M17 3v3"></path>
        <rect x="4" y="5" width="16" height="15" rx="3"></rect>
        <path d="M4 9h16M8 13h3M13 13h3M8 17h8"></path>
      </svg>
    `,
    support: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12a7 7 0 0 1 14 0"></path>
        <rect x="3" y="11" width="4" height="6" rx="2"></rect>
        <rect x="17" y="11" width="4" height="6" rx="2"></rect>
        <path d="M19 17a4 4 0 0 1-4 4h-2.5"></path>
        <circle cx="10.5" cy="21" r="1"></circle>
      </svg>
    `,
    sun: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"></path>
      </svg>
    `
  };

  host.innerHTML = siteData.supportHighlights
    .map(
      (item) => `
        <article class="support-point reveal-card">
          <span class="support-icon">${icons[item.icon] || ""}</span>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function renderContactCards() {
  const host = document.querySelector("[data-contact-cards]");
  if (!host) return;

  host.innerHTML = siteData.contacts
    .map(
      (person) => `
        <article class="contact-card reveal-card">
          <img src="${assetPath(person.image)}" alt="${person.name}" loading="lazy" />
          <div>
            <p class="eyebrow">${person.role}</p>
            <h3>${person.name}</h3>
            <a href="mailto:${person.email}">${person.email}</a>
            <a href="tel:${person.phone.replace(/[^+\d]/g, "")}">${person.phone}</a>
          </div>
        </article>
      `
    )
    .join("");
}

function renderProductDetail() {
  const host = document.querySelector("[data-product-detail]");
  if (!host) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("model") || siteData.products[0].slug;
  const product = siteData.products.find((item) => item.slug === slug) || siteData.products[0];

  document.title = `${product.name} | AmpCore Energy`;

  host.innerHTML = `
    <section class="hero hero-product">
      <div class="shell-container hero-grid hero-grid-product">
        <div class="hero-copy reveal">
          <p class="eyebrow">Product Specification</p>
          <h1>${product.shortName}</h1>
          <p class="hero-lead">${product.description}</p>
          <div class="stat-row">
            <div class="stat-card">
              <strong>${product.energy}</strong>
              <span>Stored Energy</span>
            </div>
            <div class="stat-card">
              <strong>${product.capacity}</strong>
              <span>Rated Capacity</span>
            </div>
            <div class="stat-card">
              <strong>${product.maxDischarge}</strong>
              <span>Continuous Discharge</span>
            </div>
          </div>
        </div>
        <div class="hero-visual hero-visual-panel reveal delay-2">
          <img src="${assetPath(product.image)}" alt="${product.name} battery render" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell-container section-grid-spec">
        <article class="spec-panel reveal-card">
          <p class="eyebrow">At A Glance</p>
          <div class="spec-list">
            <div><span>Model</span><strong>${product.name}</strong></div>
            <div><span>Voltage</span><strong>${product.voltage}</strong></div>
            <div><span>Capacity</span><strong>${product.capacity}</strong></div>
            <div><span>Energy</span><strong>${product.energy}</strong></div>
            <div><span>Size</span><strong>${product.dimensions}</strong></div>
            <div><span>Weight</span><strong>${product.weight}</strong></div>
            <div><span>Cycle Life</span><strong>${product.cycleLife}</strong></div>
            <div><span>Temperature Range</span><strong>${product.temperatureDischarge}</strong></div>
          </div>
        </article>
        <article class="spec-panel reveal-card">
          <p class="eyebrow">Performance & Care</p>
          <div class="spec-list">
            <div><span>Voltage Range</span><strong>${product.voltageRange}</strong></div>
            <div><span>Max Continuous Discharge</span><strong>${product.maxDischarge}</strong></div>
            <div><span>Peak Discharge</span><strong>${product.peakDischarge}</strong></div>
            <div><span>Charge Current</span><strong>${product.chargeCurrent}</strong></div>
            <div><span>Charging Method</span><strong>CC/CV</strong></div>
            <div><span>Battery Type</span><strong>LiFePO4 (LFP)</strong></div>
            <div><span>Monitoring</span><strong>Bluetooth, PCAN bus, status display</strong></div>
            <div><span>Protection</span><strong>Thermal, overcurrent, short-circuit, balancing</strong></div>
          </div>
        </article>
      </div>
    </section>

    <section class="section section-soft">
      <div class="shell-container dual-panel">
        <div class="copy-block reveal">
          <p class="eyebrow">Why Choose It</p>
          <h2>Simple benefits you can feel day to day.</h2>
          <ul class="tick-list">
            ${product.highlights.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div class="copy-block reveal delay-2">
          <p class="eyebrow">Peace Of Mind</p>
          <h2>Built for long-term ownership.</h2>
          <p>Each battery is supported by built-in protection systems, charging guidance, and local technical support to help keep performance steady over time.</p>
          <a class="button" href="${pageHref("support")}">View Warranty & Support</a>
        </div>
      </div>
    </section>
  `;
}

function setupRevealAnimation() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );

  const elements = document.querySelectorAll(".reveal, .reveal-card");
  elements.forEach((element) => observer.observe(element));

  window.setTimeout(() => {
    elements.forEach((element) => element.classList.add("is-visible"));
  }, 1400);
}

document.addEventListener("DOMContentLoaded", () => {
  renderShell();
  renderProductsPreview();
  renderProductsGrid();
  renderComparisonTable();
  setupComparisonSorting();
  renderTechnologyCards();
  renderProtectionList();
  renderSupportHighlights();
  renderContactCards();
  renderProductDetail();
  setupNavToggle();
  setupRevealAnimation();
});
