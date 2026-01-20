/* =============================
   C-LUXURY — FINAL main.js (COPY/PASTE)
   RULES YOU WANTED:
   - Mini slider: swipe only (no options while swiping)
   - Product options open ONLY when tapping BUY NOW chip
   - Options are BELOW the card (.actions-panel)
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
  if (
    backdrop &&
    (!cartDrawer || cartDrawer.getAttribute("aria-hidden") !== "false")
  ) {
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
    closeAllActions();
  });
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenuFn();
    closeCart();
    closeAllActions();
  }
});

// ===== Hero slider + rings (keep)
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

  // ✅ matches your HTML container (.actions-panel)
  const buyNow = card.querySelector(".actions-panel a.buyNow");
  if (buyNow) buyNow.href = url && url !== "#" ? url : "#";
}

// ===== Product actions open ONLY on BUY NOW chip
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
  // ✅ Only BUY NOW chip opens options
  const chip = p.querySelector(".buy-chip");
  if (chip) {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openActions(p);
    });
  }

  // ✅ Stop clicks inside actions panel from closing
  const panel = p.querySelector(".actions-panel");
  if (panel) {
    panel.addEventListener("click", (e) => e.stopPropagation());
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
document.querySelectorAll(".actions-panel a.swift").forEach((a) => {
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

// ===== Buy Now click normal (don’t close instantly)
document.querySelectorAll(".actions-panel a.buyNow").forEach((a) => {
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

  // keep actions Buy Now synced
  syncActionLinks(card);
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

    media.style.touchAction = "pan-y";

    let startX = 0;
    let dx = 0;
    let tracking = false;

    media.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || !e.touches[0]) return;

        // ✅ while swiping, close options
        card.classList.remove("is-open");

        tracking = true;
        startX = e.touches[0].clientX;
        dx = 0;
      },
      { passive: true }
    );

    media.addEventListener(
      "touchmove",
      (e) => {
        if (!tracking || !e.touches || !e.touches[0]) return;
        dx = e.touches[0].clientX - startX;

        if (Math.abs(dx) > 12) {
          e.preventDefault(); // stop vertical scroll when horizontal swipe
        }
      },
      { passive: false }
    );

    media.addEventListener(
      "touchend",
      () => {
        if (!tracking) return;
        tracking = false;

        if (Math.abs(dx) >= 35) {
          const cur = parseInt(card.dataset.miniIndex || "0", 10) || 0;
          if (dx < 0) setMiniActive(card, cur + 1);
          else setMiniActive(card, cur - 1);
        }

        // ✅ tap does NOTHING
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

/* ✅ Arrivals auto-scroll REMOVED بالكامل */

/* =========================================
   C-LUXURY: Banner + Currency + AI Chat
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1) CINEMATIC BANNER AUTO FADE ---------- */
  const banner = document.getElementById("cineBanner");
  if (banner) {
    const slides = Array.from(banner.querySelectorAll(".cine-slide"));
    const textEl = document.getElementById("cineText");
    const dotsWrap = document.getElementById("cineDots");
    if (!dotsWrap) return;

    const texts = [
  "A new standard of streetwear",
  "Understated, intentional",
  "Unmistakably bold"
];

    let i = 0;
    let timer = null;

    // build dots
    dotsWrap.innerHTML = "";
    slides.forEach((_, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cine-dot" + (idx === 0 ? " is-active" : "");
      b.setAttribute("aria-label", `Banner slide ${idx + 1}`);
      b.addEventListener("click", () => go(idx, true));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.querySelectorAll(".cine-dot"));

    function go(next, userClick=false){
      slides[i].classList.remove("is-active");
      dots[i].classList.remove("is-active");

      i = next;

      slides[i].classList.add("is-active");
      dots[i].classList.add("is-active");

      if (textEl) {
        textEl.classList.remove("is-show");
        // small delay for cinematic fade
        setTimeout(() => {
          textEl.textContent = texts[i] || texts[0];
          textEl.classList.add("is-show");
        }, 220);
      }

      if (userClick) restart();
    }

    function start(){
      if (!slides.length) return;
      // set first
      slides.forEach((s, idx) => s.classList.toggle("is-active", idx === 0));
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === 0));
      if (textEl){
        textEl.textContent = texts[0];
        textEl.classList.add("is-show");
      }
      timer = setInterval(() => {
        go((i + 1) % slides.length, false);
      }, 3300);
    }

    function restart(){
      clearInterval(timer);
      timer = setInterval(() => {
        go((i + 1) % slides.length, false);
      }, 3300);
    }

    start();
  }

  /* ---------- 2) CURRENCY AUTO UPDATE (USD/NGN) ---------- */
  const rateEl = document.getElementById("currencyRate");
  const labelEl = document.getElementById("currencyLabel");
let currencyMode = "USDNGN"; // "USDNGN" or "NGNUSD"
let lastUsdToNgn = null;

const currencyBtn = document.getElementById("currencyBtn");

function renderRate() {
  if (!rateEl || !labelEl || !lastUsdToNgn) return;

  if (currencyMode === "USDNGN") {
    labelEl.textContent = "USD/NGN";
    rateEl.textContent = lastUsdToNgn.toFixed(2);
  } else {
    labelEl.textContent = "NGN/USD";
    rateEl.textContent = (1 / lastUsdToNgn).toFixed(6);
  }
}

currencyBtn?.addEventListener("click", () => {
  currencyMode = currencyMode === "USDNGN" ? "NGNUSD" : "USDNGN";
  renderRate();
});

   
  async function fetchRate(){
  try{
    let data;

    // 1) main source
    try{
      const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      data = await res.json();
    }catch(_){
      data = null;
    }

    // 2) fallback source
    if (!data?.rates?.NGN){
      const res2 = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=NGN", { cache: "no-store" });
      const data2 = await res2.json();
      const ngn2 = data2?.rates?.NGN;
      if (!ngn2) throw new Error("NGN rate missing");
      lastUsdToNgn = Number(ngn2);
      renderRate();
      return;
    }

    const ngn = data.rates.NGN;
    lastUsdToNgn = Number(ngn);
    renderRate();

  }catch(e){
    if (rateEl) rateEl.textContent = "—";
  }
}
  // first load + auto refresh every 30 minutes
  fetchRate();
  setInterval(fetchRate, 30 * 60 * 1000);

  /* ---------- 3) AI CHAT BOX (opens panel) ---------- */
  const chatBtn = document.getElementById("chatBtn");
  const chatPanel = document.getElementById("chatPanel");
  const chatClose = document.getElementById("chatClose");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatBody = document.getElementById("chatBody");

  function openChat(){
    if (!chatPanel) return;
    chatPanel.hidden = false;
    chatPanel.setAttribute("aria-hidden", "false");
    setTimeout(() => chatInput?.focus(), 120);
  }

  function closeChat(){
    if (!chatPanel) return;
    chatPanel.hidden = true;
    chatPanel.setAttribute("aria-hidden", "true");
  }

  chatBtn?.addEventListener("click", openChat);
  chatClose?.addEventListener("click", closeChat);

  // helper: add bubble
  function addBubble(text, who="user"){
    if (!chatBody) return;
    const div = document.createElement("div");
    div.className = `chat-bubble ${who}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // simple AI “fallback” response after 3 seconds (if no human)
  let botTimer = null;

function botReplyAfter3s(){
  if (botTimer) clearTimeout(botTimer);
  botTimer = setTimeout(() => {
    addBubble("How can we assist you today?", "bot");
  }, 3000);
}

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = (chatInput?.value || "").trim();
    if (!msg) return;

    addBubble(msg, "user");
    chatInput.value = "";

    // for now: AI fallback
    botReplyAfter3s();
  });
});
