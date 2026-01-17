/* =============================
   C-LUXURY — FINAL main.js (COPY/PASTE)
   RULES YOU WANTED:
   - Mini slider: swipe only (no options while swiping)
   - Product options open ONLY when tapping BUY NOW chip
   - Options are BELOW the card (card-actions)
   - No arrivals auto-scroll
   ============================= */

const SHOPIFY = {
  domain: "https://mrcharliestxs.myshopify.com",
  cartUrl: "https://mrcharliestxs.myshopify.com/cart",
  checkoutUrl: "https://mrcharliestxs.myshopify.com/checkout",
  cartAddPermalink: (variantId, qty = 1) =>
    `https://mrcharliestxs.myshopify.com/cart/add?id=${encodeURIComponent(
      variantId
    )}&quantity=${encodeURIComponent(qty)}`
};

// ===== Elements
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const closeMenu = document.getElementById("closeMenu");

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const backdrop = document.getElementById("backdrop");
const cartFrame = document.getElementById("cartFrame");

const heroText = document.getElementById("heroText");
const ringsWrap = document.getElementById("rings");
const slides = Array.from(document.querySelectorAll(".hero-slide"));

// ===== Menu
function openMenu() {
  if (!menu || !backdrop) return;
  menu.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeMenuFn() {
  if (!menu) return;
  menu.setAttribute("aria-hidden", "true");
  if (backdrop && (!cartDrawer || cartDrawer.getAttribute("aria-hidden") !== "false")) {
    backdrop.hidden = true;
  }
}
if (menuBtn) menuBtn.addEventListener("click", openMenu);
if (closeMenu) closeMenu.addEventListener("click", closeMenuFn);

// ===== Cart
function openCart() {
  if (!cartDrawer || !backdrop) return;
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  if (cartFrame) cartFrame.src = SHOPIFY.cartUrl + "?t=" + Date.now();
}
function closeCart() {
  if (!cartDrawer) return;
  cartDrawer.setAttribute("aria-hidden", "true");
  if (backdrop && (!menu || menu.getAttribute("aria-hidden") !== "false")) {
    backdrop.hidden = true;
  }
}
if (cartBtn) cartBtn.addEventListener("click", openCart);
if (cartClose) cartClose.addEventListener("click", closeCart);

if (backdrop) {
  backdrop.addEventListener("click", () => {
    closeMenuFn();
    closeCart();
  });
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenuFn();
    closeCart();
    document.querySelectorAll(".product.is-open").forEach((x) => x.classList.remove("is-open"));
  }
});

// ===== Hero slider + rings (keep this)
const texts = [
  "A NEW YEAR<br>WITH PRESENCE",
  "SILENCE<br>CONNOTES NOISE",
  "LUXURY<br>WITHOUT NOISE",
  "PRESENCE<br>WITHOUT NOISE",
  "SILENCE IS POWER",
  "LUXURY<br>WITHOUT NOISE"
].slice(0, slides.length);

const INTERVAL = 4300;
let index = 0;
let timer = null;

function buildRings() {
  if (!ringsWrap || !slides.length) return;
  ringsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "ring" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => goToSlide(i, true));
    ringsWrap.appendChild(b);
  });
}
function setActiveRing(i) {
  if (!ringsWrap) return;
  const all = ringsWrap.querySelectorAll(".ring");
  all.forEach((r) => r.classList.remove("is-active"));
  if (all[i]) all[i].classList.add("is-active");
}
function goToSlide(i, resetTimer = false) {
  if (!slides.length) return;

  if (heroText) heroText.classList.add("fadeout");

  setTimeout(() => {
    slides.forEach((s) => s.classList.remove("active"));
    slides[i].classList.add("active");
    if (heroText) {
      heroText.innerHTML = texts[i] || "";
      heroText.classList.remove("fadeout");
    }
    setActiveRing(i);
    index = i;
  }, 220);

  if (resetTimer) restartTimer();
}
function nextSlide() {
  goToSlide((index + 1) % slides.length, false);
}
function restartTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(nextSlide, INTERVAL);
}
buildRings();
restartTimer();

// ===== Helpers
function addToCartViaIframe(variantId) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.src = SHOPIFY.cartAddPermalink(variantId, 1);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.remove();
        resolve();
      }, 450);
    };
    document.body.appendChild(iframe);
  });
}

function getActiveVariantAndUrl(card) {
  const activeImg = card.querySelector(".mini-media img.is-active");
  const variant = activeImg?.getAttribute("data-variant") || "";
  const url = activeImg?.getAttribute("data-url") || "#";
  return { variant, url };
}

function syncActionLinks(card) {
  const { url } = getActiveVariantAndUrl(card);

  // Buy Now button in card-actions must go to active url
  const buyNow = card.querySelector(".card-actions a.buyNow");
  if (buyNow) buyNow.href = url && url !== "#" ? url : "#";
}

// ===== Product actions open ONLY on BUY NOW CHIP
const products = Array.from(document.querySelectorAll(".product"));

function closeAllActions() {
  products.forEach((x) => x.classList.remove("is-open"));
}

function openActions(card) {
  closeAllActions();
  card.classList.add("is-open");
  syncActionLinks(card);
}

products.forEach((p) => {
  // ✅ DO NOT open options on tapping image/card anymore
  // So we do NOT attach "click anywhere opens overlay"

  // ✅ Only BUY NOW chip opens options
  const chip = p.querySelector(".buy-chip");
  if (chip) {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openActions(p);
    });
  }
});

// close when clicking outside products
document.addEventListener("click", (e) => {
  if (!e.target.closest(".product")) closeAllActions();
});

// ===== Add to cart (ACTIVE variant)
document.querySelectorAll(".addToCart").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest(".arrivals-card");
    if (!card) return;

    const { variant } = getActiveVariantAndUrl(card);
    if (!variant) return;

    const original = btn.textContent;
    btn.textContent = "ADDING…";
    btn.disabled = true;

    await addToCartViaIframe(variant);

    btn.textContent = "ADDED";
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 900);

    openCart();
  });
});

// ===== Swift Buy (ACTIVE variant -> checkout, SAME TAB)
document.querySelectorAll("a.swift").forEach((a) => {
  a.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = a.closest(".arrivals-card");
    if (!card) return;

    const { variant } = getActiveVariantAndUrl(card);
    if (!variant) return;

    const original = a.textContent;
    a.textContent = "LOADING…";

    await addToCartViaIframe(variant);

    a.textContent = original;
    window.location.href = SHOPIFY.checkoutUrl;
  });
});

// ===== Keep buyNow clicks normal (just stop closing)
document.querySelectorAll("a.buyNow").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

// ================= MINI SLIDER (SWIPE ONLY) =================
function setMiniActive(card, newIndex) {
  const media = card.querySelector(".mini-media");
  if (!media) return;

  const imgs = Array.from(media.querySelectorAll("img"));
  if (!imgs.length) return;

  const count = imgs.length;
  const idx = (newIndex + count) % count;

  imgs.forEach((im) => im.classList.remove("is-active"));
  imgs[idx].classList.add("is-active");

  const active = imgs[idx];
  const name = active.getAttribute("data-name") || "";
  const price = active.getAttribute("data-price") || "";

  const nameEl = card.querySelector(".p-name");
  const priceEl = card.querySelector(".p-price");
  if (nameEl) nameEl.textContent = name.toUpperCase();
  if (priceEl) priceEl.textContent = price;

  card.dataset.miniIndex = String(idx);

  // keep card-actions Buy Now synced to active product
  syncActionLinks(card);
}

function initMiniSliders() {
  const cards = Array.from(document.querySelectorAll(".arrivals-card"));

  cards.forEach((card) => {
    const imgs = Array.from(card.querySelectorAll(".mini-media img"));
    const startIdx = Math.max(0, imgs.findIndex((i) => i.classList.contains("is-active")));
    setMiniActive(card, startIdx);

    const media = card.querySelector(".mini-media");
    if (!media) return;

    media.style.touchAction = "pan-y";

    let startX = 0;
    let dx = 0;
    let tracking = false;

    media.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches[0]) return;

      // ✅ while swiping, close actions (so nothing shows)
      card.classList.remove("is-open");

      tracking = true;
      startX = e.touches[0].clientX;
      dx = 0;
    }, { passive: true });

    media.addEventListener("touchmove", (e) => {
      if (!tracking || !e.touches || !e.touches[0]) return;
      dx = e.touches[0].clientX - startX;

      if (Math.abs(dx) > 12) {
        e.preventDefault(); // stop page scroll on horizontal swipe
      }
    }, { passive: false });

    media.addEventListener("touchend", () => {
      if (!tracking) return;
      tracking = false;

      // swipe changes image
      if (Math.abs(dx) >= 35) {
        const cur = parseInt(card.dataset.miniIndex || "0", 10) || 0;
        if (dx < 0) setMiniActive(card, cur + 1);
        else setMiniActive(card, cur - 1);
      }

      // ✅ tap does NOTHING (no open)
    }, { passive: true });

    media.addEventListener("touchcancel", () => {
      tracking = false;
      dx = 0;
    }, { passive: true });
  });
}

initMiniSliders();

/* ✅ Arrivals auto-scroll REMOVED بالكامل (nothing here) */
