/* =============================
   C-LUXURY — FINAL main.js (COPY/PASTE)
   FIXES:
   - Mini slider swipe works on iPhone (prevents page scroll)
   - Product image tap goes to ACTIVE product link
   - Swift Buy goes to CHECKOUT (adds active variant first)
   - Arrivals auto-scroll loops smoothly (no ugly jump)
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
  if (
    backdrop &&
    (!cartDrawer || cartDrawer.getAttribute("aria-hidden") !== "false")
  ) backdrop.hidden = true;
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

// ===== Product overlay tap + open overlay
const products = Array.from(document.querySelectorAll(".product"));

products.forEach((p) => {
  p.addEventListener("click", (e) => {
    const el = e.target;

    // don't toggle overlay if clicking links/buttons
    if (el.closest("a") || el.closest("button")) return;

    const isOpen = p.classList.contains("is-open");
    products.forEach((x) => x.classList.remove("is-open"));
    if (!isOpen) p.classList.add("is-open");
  });

  const chip = p.querySelector(".buy-chip");
  if (chip) {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      products.forEach((x) => x.classList.remove("is-open"));
      p.classList.add("is-open");
    });
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".product"))
    products.forEach((x) => x.classList.remove("is-open"));
});

// ===== ADD TO CART button
document.querySelectorAll(".addToCart").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId = btn.getAttribute("data-variant");
    if (!variantId) return;

    const original = btn.textContent;
    btn.textContent = "ADDING…";
    btn.disabled = true;

    await addToCartViaIframe(variantId);

    btn.textContent = "ADDED";
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 900);

    openCart();
  });
});

// ===== SWIFT BUY (go to checkout, not image link)
document.querySelectorAll("a.swift").forEach((a) => {
  a.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = a.closest(".arrivals-card");
    if (!card) return;

    const activeImg = card.querySelector(".mini-media img.is-active");
    const variantId =
      (activeImg && activeImg.getAttribute("data-variant")) ||
      card.querySelector("button.addToCart")?.getAttribute("data-variant");

    if (!variantId) {
      window.open(SHOPIFY.checkoutUrl, "_blank");
      return;
    }

    a.textContent = "LOADING…";

    await addToCartViaIframe(variantId);

    a.textContent = "SWIFT BUY";
    window.open(SHOPIFY.checkoutUrl, "_blank");
  });
});

// ✅ Wishlist is CSS-native scroll only (no JS)

// ================= MAIN ARRIVALS AUTO SCROLL (4.5s) =================
const arrivalsCarousel = document.getElementById("arrivalsCarousel");

if (arrivalsCarousel) {
  let autoScrollTimer = null;
  const AUTO_SCROLL_DELAY = 4500;
  let isAutoJumping = false;

  function stopAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(() => {
      if (isAutoJumping) return;

      const maxScroll =
        arrivalsCarousel.scrollWidth - arrivalsCarousel.clientWidth;

      // if near the end -> smooth back to start, then unlock
      if (arrivalsCarousel.scrollLeft >= maxScroll - 10) {
        isAutoJumping = true;
        arrivalsCarousel.scrollTo({ left: 0, behavior: "smooth" });
        setTimeout(() => (isAutoJumping = false), 700);
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
    arrivalsCarousel.addEventListener(
      evt,
      () => setTimeout(startAutoScroll, 1200),
      { passive: true }
    );
  });

  startAutoScroll();
}

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
  const url = active.getAttribute("data-url") || "#";
  const variant = active.getAttribute("data-variant") || "";

  // update meta text
  const nameEl = card.querySelector(".p-name");
  const priceEl = card.querySelector(".p-price");
  if (nameEl) nameEl.textContent = name.toUpperCase();
  if (priceEl) priceEl.textContent = price;

  // update product tap link (image click)
  const productLink = card.querySelector("a.productLink");
  if (productLink) productLink.href = url;

  // update add-to-cart variant
  const addBtn = card.querySelector("button.addToCart");
  if (addBtn && variant) addBtn.setAttribute("data-variant", variant);

  card.dataset.miniIndex = String(idx);
}

function initMiniSliders() {
  const cards = Array.from(document.querySelectorAll(".arrivals-card"));

  cards.forEach((card) => {
    const imgs = Array.from(card.querySelectorAll(".mini-media img"));
    const startIdx = Math.max(
      0,
      imgs.findIndex((i) => i.classList.contains("is-active"))
    );
    setMiniActive(card, startIdx);

    const media = card.querySelector(".mini-media");
    if (!media) return;

    // iPhone swipe fix
    media.style.touchAction = "pan-y";

    let startX = 0;
    let dx = 0;
    let tracking = false;

    media.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        tracking = true;
        startX = e.touches[0].clientX;
        dx = 0;
      },
      { passive: true }
    );

    // passive:false so preventDefault works
    media.addEventListener(
      "touchmove",
      (e) => {
        if (!tracking || !e.touches || !e.touches[0]) return;
        e.preventDefault();
        dx = e.touches[0].clientX - startX;
      },
      { passive: false }
    );

    media.addEventListener(
      "touchend",
      () => {
        if (!tracking) return;
        tracking = false;

        if (Math.abs(dx) < 35) return;

        const cur = parseInt(card.dataset.miniIndex || "0", 10) || 0;
        if (dx < 0) setMiniActive(card, cur + 1);
        else setMiniActive(card, cur - 1);
      },
      { passive: true }
    );

    media.addEventListener(
      "touchcancel",
      () => {
        tracking = false;
        dx = 0;
      },
      { passive: true }
    );
  });
}

initMiniSliders();
