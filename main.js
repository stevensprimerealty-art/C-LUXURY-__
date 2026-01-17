/* =============================
   C-LUXURY — FINAL main.js (COPY/PASTE)
   FIXES:
   - Mini slider swipe works on iPhone (prevents page scroll)
   - Swipe does NOT accidentally open overlay (iOS “ghost click” fix) ✅
   - Tap on product image opens overlay options (NOT product page)
   - BUY NOW link goes to ACTIVE product url
   - Swift Buy goes to CHECKOUT (adds active variant first) SAME TAB
   - Add to cart adds ACTIVE variant + opens cart drawer
   - Arrivals auto-scroll loops smoother
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
  if (backdrop && (!cartDrawer || cartDrawer.getAttribute("aria-hidden") !== "false"))
    backdrop.hidden = true;
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
  if (backdrop && (!menu || menu.getAttribute("aria-hidden") !== "false"))
    backdrop.hidden = true;
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
  }
});

// ===== Hero slider + rings
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

function syncOverlayLinks(card) {
  const { url } = getActiveVariantAndUrl(card);
  const buyNow = card.querySelector("a.buyNow");
  if (buyNow) buyNow.href = url && url !== "#" ? url : "#";
}

// ===== Product overlay behavior
const products = Array.from(document.querySelectorAll(".product"));

function openOverlay(card) {
  products.forEach((x) => x.classList.remove("is-open"));
  card.classList.add("is-open");
  syncOverlayLinks(card);
}

products.forEach((p) => {
  // Tap anywhere on card (except buttons/links) opens overlay
  p.addEventListener("click", (e) => {
    // ✅ iOS ghost click after swipe fix
    if (p.dataset.suppressClick === "1") {
      p.dataset.suppressClick = "0";
      return;
    }

    const el = e.target;
    if (el.closest("a") || el.closest("button")) return;

    const isOpen = p.classList.contains("is-open");
    products.forEach((x) => x.classList.remove("is-open"));
    if (!isOpen) openOverlay(p);
  });

  // BUY NOW chip opens overlay (not navigate)
  const chip = p.querySelector(".buy-chip");
  if (chip) {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openOverlay(p);
    });
  }

  // BuyNow link navigates normally (href is synced)
  const buyNow = p.querySelector("a.buyNow");
  if (buyNow) {
    buyNow.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".product"))
    products.forEach((x) => x.classList.remove("is-open"));
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

    // same tab is smoother on iPhone
    window.location.href = SHOPIFY.checkoutUrl;
  });
});

// ================= ARRIVALS AUTO SCROLL =================
const arrivalsCarousel = document.getElementById("arrivalsCarousel");

if (arrivalsCarousel) {
  let autoScrollTimer = null;
  const AUTO_SCROLL_DELAY = 4500;

  function stopAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(() => {
      const maxScroll = arrivalsCarousel.scrollWidth - arrivalsCarousel.clientWidth;

      if (arrivalsCarousel.scrollLeft >= maxScroll - 10) {
        arrivalsCarousel.style.scrollBehavior = "auto";
        arrivalsCarousel.scrollLeft = 0;
        requestAnimationFrame(() => {
          arrivalsCarousel.style.scrollBehavior = "smooth";
        });
      } else {
        arrivalsCarousel.scrollBy({
          left: Math.max(280, arrivalsCarousel.clientWidth * 0.9),
          behavior: "smooth"
        });
      }
    }, AUTO_SCROLL_DELAY);
  }

  ["touchstart", "mousedown", "wheel", "pointerdown"].forEach((evt) => {
    arrivalsCarousel.addEventListener(evt, stopAutoScroll, { passive: true });
  });

  ["touchend", "touchcancel", "mouseup", "pointerup"].forEach((evt) => {
    arrivalsCarousel.addEventListener(evt, () => setTimeout(startAutoScroll, 1200), { passive: true });
  });

  startAutoScroll();
}

// ================= MINI SLIDER (SWIPE) =================
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

  // keep overlay buyNow synced to active product
  syncOverlayLinks(card);
}

function initMiniSliders() {
  const cards = Array.from(document.querySelectorAll(".arrivals-card"));

  cards.forEach((card) => {
    const imgs = Array.from(card.querySelectorAll(".mini-media img"));
    const startIdx = Math.max(0, imgs.findIndex((i) => i.classList.contains("is-active")));
    setMiniActive(card, startIdx);

    const media = card.querySelector(".mini-media");
    if (!media) return;

    // Let vertical scroll work, we handle horizontal
    media.style.touchAction = "pan-y";

    let startX = 0;
    let dx = 0;
    let tracking = false;
    let moved = false;

    media.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches[0]) return;
      tracking = true;
      moved = false;
      startX = e.touches[0].clientX;
      dx = 0;
    }, { passive: true });

    media.addEventListener("touchmove", (e) => {
      if (!tracking || !e.touches || !e.touches[0]) return;
      dx = e.touches[0].clientX - startX;

      // if user is swiping horizontally, stop page from scrolling
      if (Math.abs(dx) > 12) {
        moved = true;
        e.preventDefault();
      }
    }, { passive: false });

    media.addEventListener("touchend", () => {
      if (!tracking) return;
      tracking = false;

      // swipe changes mini image
      if (Math.abs(dx) >= 35) {
        // ✅ IMPORTANT: prevent iOS “ghost click” after swipe
        card.dataset.suppressClick = "1";

        const cur = parseInt(card.dataset.miniIndex || "0", 10) || 0;
        if (dx < 0) setMiniActive(card, cur + 1);
        else setMiniActive(card, cur - 1);
        return;
      }

      // tap image opens overlay options (NOT product page)
      if (!moved) openOverlay(card);
    }, { passive: true });

    media.addEventListener("touchcancel", () => {
      tracking = false;
      dx = 0;
      moved = false;
    }, { passive: true });
  });
}

initMiniSliders();
