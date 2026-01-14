/* =============================
   C-LUXURY — v3 JS (FINAL FIX)
   Fixes only:
   - Prevent script crashing if elements missing
   - Rings tap works reliably
   - Wishlist swipe works on iPhone (touch + pointer + inertia)
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
  if (!menu || !backdrop) return;
  menu.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeMenuFn(){
  if (!menu) return;
  menu.setAttribute("aria-hidden", "true");
  if (backdrop && (!cartDrawer || cartDrawer.getAttribute("aria-hidden") !== "false")) backdrop.hidden = true;
}
if (menuBtn) menuBtn.addEventListener("click", openMenu);
if (closeMenu) closeMenu.addEventListener("click", closeMenuFn);

// ===== Cart
function openCart(){
  if (!cartDrawer || !backdrop) return;
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  if (cartFrame) cartFrame.src = SHOPIFY.cartUrl + "?t=" + Date.now();
}
function closeCart(){
  if (!cartDrawer) return;
  cartDrawer.setAttribute("aria-hidden", "true");
  if (backdrop && (!menu || menu.getAttribute("aria-hidden") !== "false")) backdrop.hidden = true;
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
];

const INTERVAL = 4300;
let index = 0;
let timer = null;

function buildRings(){
  if (!ringsWrap || !slides.length) return;
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
  if (!ringsWrap) return;
  const all = ringsWrap.querySelectorAll(".ring");
  all.forEach(r => r.classList.remove("is-active"));
  if (all[i]) all[i].classList.add("is-active");
}
function goToSlide(i, resetTimer = false){
  if (!slides.length) return;

  if (heroText) heroText.classList.add("fadeout");

  setTimeout(() => {
    slides.forEach(s => s.classList.remove("active"));
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
// WISHLIST — TRUE SWIPE/DRAG + INFINITE + INERTIA (FINAL)
// =====================================================
const slider = document.getElementById("wishlistSlider");
const track = document.getElementById("wishlistTrack");

if (slider && track) {
  const originals = Array.from(track.children);
  const cloneBefore = originals.map(node => node.cloneNode(true));
  const cloneAfter  = originals.map(node => node.cloneNode(true));

  cloneBefore.forEach(n => track.insertBefore(n, track.firstChild));
  cloneAfter.forEach(n => track.appendChild(n));

  function setWidth(){
    return originals.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) + (14 * (originals.length - 1));
  }

  let x = 0;
  let isDown = false;
  let startX = 0;
  let startTranslate = 0;

  let lastMoveTime = 0;
  let lastMoveX = 0;
  let velocity = 0;
  let raf = null;

  function apply(){ track.style.transform = `translate3d(${x}px,0,0)`; }

  function centerToMiddle(){
    const w = setWidth();
    x = -w;
    apply();
  }

  function normalize(){
    const w = setWidth();
    if (x > 0) x -= w;
    if (x < -2*w) x += w;
  }

  function stopInertia(){
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function inertiaStep(){
    velocity *= 0.92;
    x += velocity;
    normalize();
    apply();
    if (Math.abs(velocity) > 0.2) raf = requestAnimationFrame(inertiaStep);
  }

  function startDrag(clientX){
    isDown = true;
    stopInertia();
    startX = clientX;
    startTranslate = x;
    velocity = 0;
    lastMoveTime = performance.now();
    lastMoveX = clientX;
  }

  function dragMove(clientX){
    if (!isDown) return;
    const dx = clientX - startX;
    x = startTranslate + dx;
    normalize();
    apply();

    const now = performance.now();
    const dt = Math.max(16, now - lastMoveTime);
    const vx = (clientX - lastMoveX) / dt;
    velocity = vx * 18;

    lastMoveTime = now;
    lastMoveX = clientX;
  }

  function endDrag(){
    if (!isDown) return;
    isDown = false;
    if (Math.abs(velocity) > 0.2) raf = requestAnimationFrame(inertiaStep);
  }

  // Pointer
  slider.addEventListener("pointerdown", (e) => {
    slider.setPointerCapture(e.pointerId);
    startDrag(e.clientX);
  });
  slider.addEventListener("pointermove", (e) => dragMove(e.clientX));
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);

  // Touch fallback (iPhone Safari)
  slider.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startDrag(t.clientX);
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    dragMove(t.clientX);
  }, { passive: true });

  slider.addEventListener("touchend", endDrag, { passive: true });
  slider.addEventListener("touchcancel", endDrag, { passive: true });

  window.addEventListener("resize", centerToMiddle);
  centerToMiddle();
}
