alert("main.js loaded ✅");
/* =============================
   C-LUXURY — FINAL main.js (v9)
   - Currency toggles USD <-> NGN and updates ALL prices
   - Fullscreen chat sheet like screenshot
   - Mini slider swipe only
   - BUY NOW chip opens actions below
   ============================= */

/* ---------- Shopify helpers ---------- */
const SHOPIFY = {
  domain: "https://mrcharliestxs.myshopify.com",
  cartUrl: "https://mrcharliestxs.myshopify.com/cart",
  checkoutUrl: "https://mrcharliestxs.myshopify.com/checkout",
  cartAddPermalink: (variantId, qty = 1) =>
    `https://mrcharliestxs.myshopify.com/cart/add?id=${encodeURIComponent(
      variantId
    )}&quantity=${encodeURIComponent(qty)}`
};

/* ---------- Elements (header/menu/cart) ---------- */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const closeMenu = document.getElementById("closeMenu");

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const backdrop = document.getElementById("backdrop");
const cartFrame = document.getElementById("cartFrame");

/* ---------- Hero ---------- */
const heroText = document.getElementById("heroText");
const ringsWrap = document.getElementById("rings");
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));

/* ---------- Menu ---------- */
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
menuBtn?.addEventListener("click", openMenu);
closeMenu?.addEventListener("click", closeMenuFn);

/* ---------- Cart ---------- */
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
cartBtn?.addEventListener("click", openCart);
cartClose?.addEventListener("click", closeCart);

/* ---------- Product actions ---------- */
const products = Array.from(document.querySelectorAll(".product"));

function closeAllActions() {
  products.forEach((x) => x.classList.remove("is-open"));
}

function openActions(card) {
  closeAllActions();
  card.classList.add("is-open");
  syncActionLinks(card);
}

/* close panels on backdrop click */
backdrop?.addEventListener("click", () => {
  closeMenuFn();
  closeCart();
  closeAllActions();
  if (typeof closeChat === "function") closeChat();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenuFn();
    closeCart();
    closeAllActions();
    if (typeof closeChat === "function") closeChat();
  }
});

/* ---------- Hero slider ---------- */
const heroTexts = [
  "A NEW YEAR<br>WITH PRESENCE",
  "SILENCE<br>CONNOTES NOISE",
  "LUXURY<br>WITHOUT NOISE",
  "PRESENCE<br>WITHOUT NOISE",
  "SILENCE IS POWER",
  "LUXURY<br>WITHOUT NOISE"
].slice(0, heroSlides.length);

const HERO_INTERVAL = 4300;
let heroIndex = 0;
let heroTimer = null;

function buildRings() {
  if (!ringsWrap || !heroSlides.length) return;
  ringsWrap.innerHTML = "";
  heroSlides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "ring" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => goToHero(i, true));
    ringsWrap.appendChild(b);
  });
}
function setActiveRing(i) {
  if (!ringsWrap) return;
  ringsWrap.querySelectorAll(".ring").forEach((r) => r.classList.remove("is-active"));
  ringsWrap.querySelectorAll(".ring")[i]?.classList.add("is-active");
}
function goToHero(i, resetTimer = false) {
  if (!heroSlides.length) return;

  heroText?.classList.add("fadeout");

  setTimeout(() => {
    heroSlides.forEach((s) => s.classList.remove("active"));
    heroSlides[i].classList.add("active");
    if (heroText) {
      heroText.innerHTML = heroTexts[i] || "";
      heroText.classList.remove("fadeout");
    }
    setActiveRing(i);
    heroIndex = i;
  }, 220);

  if (resetTimer) restartHeroTimer();
}
function restartHeroTimer() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => goToHero((heroIndex + 1) % heroSlides.length), HERO_INTERVAL);
}
buildRings();
restartHeroTimer();

/* ---------- Helpers ---------- */
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
  const buyNow = card.querySelector(".actions-panel a.buyNow");
  if (buyNow) buyNow.href = url && url !== "#" ? url : "#";
}

/* ---------- BUY NOW chip opens options ---------- */
products.forEach((p) => {
  const chip = p.querySelector(".buy-chip");
  chip?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openActions(p);
  });

  const panel = p.querySelector(".actions-panel");
  panel?.addEventListener("click", (e) => e.stopPropagation());
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".product")) closeAllActions();
});

/* ---------- Add to cart ---------- */
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

/* ---------- Swift Buy ---------- */
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

document.querySelectorAll(".actions-panel a.buyNow").forEach((a) => {
  a.addEventListener("click", (e) => e.stopPropagation());
});

/* ================= MINI SLIDER (SWIPE ONLY) ================= */
function setMiniActive(card, newIndex) {
  const media = card.querySelector(".mini-media");
  if (!media) return;

  const imgs = Array.from(media.querySelectorAll("img"));
  if (!imgs.length) return;

  const count = imgs.length;
  const idx = (newIndex + count) % count;

  imgs.forEach((im) => im.classList.remove("is-active"));
  imgs[idx].classList.add("is-active");

  // update title + price from active image (in USD base)
  const active = imgs[idx];
  const name = active.getAttribute("data-name") || "";
  const price = active.getAttribute("data-price") || "";

  const nameEl = card.querySelector(".p-name");
  const priceEl = card.querySelector(".p-price");

  if (nameEl) nameEl.textContent = name.toUpperCase();
  if (priceEl) priceEl.textContent = price; // will be converted by currency system

  card.dataset.miniIndex = String(idx);
  syncActionLinks(card);

  // currency refresh for this card
  applyCurrencyToCard(card);
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
     
    media.style.webkitUserSelect = "none";
    media.style.userSelect = "none";
    media.style.webkitTouchCallout = "none";
     
    let startX = 0;
    let dx = 0;
    let tracking = false;

    media.addEventListener("touchstart", (e) => {
      if (!e.touches?.[0]) return;
      card.classList.remove("is-open");
      tracking = true;
      startX = e.touches[0].clientX;
      dx = 0;
    }, { passive: true });

    media.addEventListener("touchmove", (e) => {
      if (!tracking || !e.touches?.[0]) return;
      dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 12) e.preventDefault();
    }, { passive: false });

    media.addEventListener("touchend", () => {
      if (!tracking) return;
      tracking = false;

      if (Math.abs(dx) >= 35) {
        const cur = parseInt(card.dataset.miniIndex || "0", 10) || 0;
        if (dx < 0) setMiniActive(card, cur + 1);
        else setMiniActive(card, cur - 1);
      }
    }, { passive: true });

    media.addEventListener("touchcancel", () => {
      tracking = false;
      dx = 0;
    }, { passive: true });
  });
}
initMiniSliders();

/* ==========================================================
   CURRENCY SYSTEM — converts ALL prices on your page
   Base prices are USD in your HTML data-price="$87.41"
   ========================================================== */

const currencyBtn = document.getElementById("currencyBtn");
const currencyLabel = document.getElementById("currencyLabel");
const currencyRateEl = document.getElementById("currencyRate");

let currencyMode = "USD"; // USD or NGN
let usdToNgn = null;

function parseUsd(priceStr) {
  // expects "$87.41"
  const n = Number(String(priceStr).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatMoney(amount, mode) {
  if (!Number.isFinite(amount)) return "—";
  if (mode === "USD") return `$${amount.toFixed(2)}`;
  // NGN format
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

function applyCurrencyToCard(card) {
  if (!card) return;

  const priceEl = card.querySelector(".p-price");
  if (!priceEl) return;

  // 1) Prefer active mini-media image (your mini slider)
  const activeImg = card.querySelector(".mini-media img.is-active");
  let baseUsd = activeImg ? parseUsd(activeImg.getAttribute("data-price") || "") : null;

  // 2) Fallback: read the current text price (ex: "$87.41") if no data-price
  if (baseUsd === null) {
    baseUsd = parseUsd(priceEl.textContent || "");
  }
  if (baseUsd === null) return;

  if (currencyMode === "USD") {
    priceEl.textContent = formatMoney(baseUsd, "USD");
  } else {
    if (!usdToNgn) return;
    priceEl.textContent = formatMoney(baseUsd * usdToNgn, "NGN");
  }
}

function applyCurrencyEverywhere() {
  document.querySelectorAll(".product").forEach((card) => applyCurrencyToCard(card));
}

function renderCurrencyPill() {
  if (!currencyLabel || !currencyRateEl) return;

  if (currencyMode === "USD") {
    currencyLabel.textContent = "USD";
    currencyRateEl.textContent = usdToNgn ? `1$ = ₦${Math.round(usdToNgn).toLocaleString("en-NG")}` : "—";
  } else {
    currencyLabel.textContent = "NGN";
    currencyRateEl.textContent = usdToNgn ? `₦1 = $${(1 / usdToNgn).toFixed(6)}` : "—";
  }
}

async function fetchUsdToNgn() {
  try {
    // ✅ Best CORS-friendly source (works on GitHub Pages)
    const r = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      { cache: "no-store" }
    );
    const j = await r.json();

    if (j?.usd?.ngn) {
      usdToNgn = Number(j.usd.ngn);
      renderCurrencyPill();
      applyCurrencyEverywhere();
      return;
    }

    // fallback 2
    const r2 = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    const j2 = await r2.json();

    if (j2?.rates?.NGN) {
      usdToNgn = Number(j2.rates.NGN);
      renderCurrencyPill();
      applyCurrencyEverywhere();
      return;
    }

    throw new Error("No NGN rate");
  } catch (e) {
    usdToNgn = null;
    if (currencyRateEl) currencyRateEl.textContent = "—";
  }
}

currencyBtn?.addEventListener("click", () => {
  currencyMode = currencyMode === "USD" ? "NGN" : "USD";
  renderCurrencyPill();
  applyCurrencyEverywhere();
});

// initial
fetchUsdToNgn();
setInterval(fetchUsdToNgn, 30 * 60 * 1000);

/* ==========================================================
   CHAT SHEET — fullscreen like your screenshot
   ========================================================== */

const chatBtn = document.getElementById("chatBtn");
const chatSheet = document.getElementById("chatSheet");
const chatClose = document.getElementById("chatClose");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatMessages = document.getElementById("chatMessages");

function openChat() {
  closeAllActions();
  if (!chatSheet) return;
  chatSheet.hidden = false;
  chatSheet.setAttribute("aria-hidden", "false");
  setTimeout(() => chatInput?.focus(), 150);
}

function closeChat() {
  if (!chatSheet) return;
  chatSheet.hidden = true;
  chatSheet.setAttribute("aria-hidden", "true");
}

chatBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  openChat();
});
chatClose?.addEventListener("click", closeChat);

function addChatBubble(text, who = "user") {
  if (!chatMessages) return;
  const div = document.createElement("div");
  div.className = `chat-bubble ${who}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.querySelectorAll(".instant-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!chatInput) return;
    chatInput.value = btn.textContent.trim();
    chatInput.focus();
  });
});

function sendMessage() {
  const msg = (chatInput?.value || "").trim();
  if (!msg) return;

  addChatBubble(msg, "user");
  chatInput.value = "";

  // simple bot mock reply
  setTimeout(() => addChatBubble("Thanks — we’ll reply shortly.", "bot"), 700);
}

chatSend?.addEventListener("click", sendMessage);
chatInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

/* ==========================================================
   CINEMATIC BANNER — auto fade + dots + shop button
   ========================================================== */

const cineBanner = document.getElementById("cineBanner");
const cineSlides = Array.from(document.querySelectorAll("#cineBanner .cine-slide"));
const cineText = document.getElementById("cineText");
const cineDots = document.getElementById("cineDots");

const cineTexts = [
  "A new standard of streetwear",
  "Luxury without noise",
  "Presence without noise"
].slice(0, cineSlides.length);

let cineIndex = 0;
let cineTimer = null;
const CINE_INTERVAL = 4200;

function buildCineDots(){
  if (!cineDots) return;
  cineDots.innerHTML = "";
  cineSlides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cine-dot" + (i === 0 ? " is-active" : "");
    b.setAttribute("aria-label", `Go to banner ${i+1}`);
    b.addEventListener("click", () => goToCine(i, true));
    cineDots.appendChild(b);
  });
}

function setActiveCineDot(i){
  if (!cineDots) return;
  cineDots.querySelectorAll(".cine-dot").forEach(d => d.classList.remove("is-active"));
  cineDots.querySelectorAll(".cine-dot")[i]?.classList.add("is-active");
}

function goToCine(i, reset=false){
  if (!cineSlides.length) return;

  cineSlides.forEach(s => s.classList.remove("is-active"));
  cineSlides[i].classList.add("is-active");

  if (cineText){
    cineText.classList.remove("is-show");
    setTimeout(() => {
      cineText.textContent = cineTexts[i] || "";
      cineText.classList.add("is-show");
    }, 180);
  }

  setActiveCineDot(i);
  cineIndex = i;

  if (reset) restartCine();
}

function restartCine(){
  if (cineTimer) clearInterval(cineTimer);
  cineTimer = setInterval(() => {
    goToCine((cineIndex + 1) % cineSlides.length);
  }, CINE_INTERVAL);
}

if (cineBanner && cineSlides.length){
  buildCineDots();
  goToCine(0, false);     // ✅ force first state (fade-ready)
  restartCine();
}
