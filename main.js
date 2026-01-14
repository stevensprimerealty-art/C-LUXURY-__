/* =============================
   C-LUXURY — v3 JS
   Adds:
   - Wishlist: true swipe/drag + infinite loop + inertia
   Keeps:
   - Menu overlay
   - Cart drawer iframe
   - Hero slider + rings
   - Product overlay + add-to-cart (iframe method)
   ============================= */

const SHOPIFY = {
  domain: "https://mrcharliestxs.myshopify.com",
  cartUrl: "https://mrcharliestxs.myshopify.com/cart",
  cartAddPermalink: (variantId, qty = 1) =>
    `https://mrcharliestxs.myshopify.com/cart/add?id=${encodeURIComponent(variantId)}&quantity=${encodeURIComponent(qty)}`
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
function openMenu(){
  menu.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeMenuFn(){
  menu.setAttribute("aria-hidden", "true");
  if (cartDrawer.getAttribute("aria-hidden") !== "false") backdrop.hidden = true;
}
menuBtn.addEventListener("click", openMenu);
closeMenu.addEventListener("click", closeMenuFn);

// ===== Cart
function openCart(){
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  cartFrame.src = SHOPIFY.cartUrl + "?t=" + Date.now();
}
function closeCart(){
  cartDrawer.setAttribute("aria-hidden", "true");
  if (menu.getAttribute("aria-hidden") !== "false") backdrop.hidden = true;
}
cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);

backdrop.addEventListener("click", () => {
  closeMenuFn();
  closeCart();
});
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
];

const INTERVAL = 4300;
let index = 0;
let timer = null;

function buildRings(){
  ringsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "ring" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i+1}`);
    b.addEventListener("click", () => goToSlide(i, true));
    ringsWrap.appendChild(b);
  });
}
function setActiveRing(i){
  const all = ringsWrap.querySelectorAll(".ring");
  all.forEach(r => r.classList.remove("is-active"));
  if (all[i]) all[i].classList.add("is-active");
}
function goToSlide(i, resetTimer = false){
  heroText.classList.add("fadeout");
  setTimeout(() => {
    slides.forEach(s => s.classList.remove("active"));
    slides[i].classList.add("active");
    heroText.innerHTML = texts[i];
    setActiveRing(i);
    heroText.classList.remove("fadeout");
    index = i;
  }, 220);

  if (resetTimer) restartTimer();
}
function nextSlide(){
  goToSlide((index + 1) % slides.length, false);
}
function restartTimer(){
  if (timer) clearInterval(timer);
  timer = setInterval(nextSlide, INTERVAL);
}
buildRings();
restartTimer();

// ===== Product overlay tap + add to cart
const products = Array.from(document.querySelectorAll(".product"));
products.forEach(p => {
  p.addEventListener("click", (e) => {
    const el = e.target;
    if (el.closest("a") || el.closest("button.addToCart") || el.classList.contains("buy-chip")) return;
    const isOpen = p.classList.contains("is-open");
    products.forEach(x => x.classList.remove("is-open"));
    if (!isOpen) p.classList.add("is-open");
  });

  const chip = p.querySelector(".buy-chip");
  if (chip){
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      products.forEach(x => x.classList.remove("is-open"));
      p.classList.add("is-open");
    });
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".product")) products.forEach(x => x.classList.remove("is-open"));
});

function addToCartViaIframe(variantId){
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
      }, 400);
    };
    document.body.appendChild(iframe);
  });
}

document.querySelectorAll(".addToCart").forEach(btn => {
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

// =====================================================
// WISHLIST — TRUE SWIPE/DRAG + INFINITE + INERTIA
// =====================================================
const slider = document.getElementById("wishlistSlider");
const track = document.getElementById("wishlistTrack");

if (slider && track) {
  // Clone content to both ends for infinite loop
  const originals = Array.from(track.children);
  const cloneBefore = originals.map(node => node.cloneNode(true));
  const cloneAfter  = originals.map(node => node.cloneNode(true));

  cloneBefore.forEach(n => track.insertBefore(n, track.firstChild));
  cloneAfter.forEach(n => track.appendChild(n));

  // Measure one set width
  function setWidth(){
    // total width of one "original set"
    return originals.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) + (14 * (originals.length - 1));
  }

  // We simulate scroll by translating track
  let x = 0;               // current translateX
  let isDown = false;
  let startX = 0;
  let startTranslate = 0;

  // Inertia
  let lastMoveTime = 0;
  let lastMoveX = 0;
  let velocity = 0;
  let raf = null;

  function apply(){
    track.style.transform = `translate3d(${x}px,0,0)`;
  }

  // Start centered on the middle (originals area)
  function centerToMiddle(){
    const w = setWidth();
    x = -w; // move left by exactly one set, so middle set is visible
    apply();
  }

  function normalize(){
    const w = setWidth();
    // if user drags too far, wrap
    if (x > 0) x -= w;
    if (x < -2*w) x += w;
  }

  function stopInertia(){
   
