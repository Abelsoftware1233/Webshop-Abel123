/**
 * LUXE Webshop — script.js
 * Volledig werkende winkelmandje + PayPal Sandbox checkout
 */

/* ======================================================
   1. PRODUCT CATALOGUS
   ====================================================== */
const PRODUCTS = [
  {
    id: 1,
    name: "Obsidian Parfum",
    category: "Geur",
    desc: "Een diepe, houtachtige geur met noten van amber, cederhout en zwarte iris.",
    price: 89.95,
    emoji: "🖤",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Zijden Sjaal",
    category: "Mode",
    desc: "Handgeweven zijde uit Milaan, in een tijdloos geometrisch patroon.",
    price: 149.00,
    emoji: "🧣",
    badge: null,
  },
  {
    id: 3,
    name: "Gold Leaf Thee",
    category: "Welzijn",
    desc: "Zeldzame eerste vluch witte thee, verrijkt met 24-karaats goudvlokjes.",
    price: 42.50,
    emoji: "🍵",
    badge: "Nieuw",
  },
  {
    id: 4,
    name: "Leren Portemonnee",
    category: "Accessoires",
    desc: "Vol-grainy calfskin leer, met hand-afgewerkte randen en goud beslag.",
    price: 195.00,
    emoji: "👛",
    badge: null,
  },
  {
    id: 5,
    name: "Kristallen Kaars",
    category: "Interieur",
    desc: "Sojawas kaars met rozenkwarts, sandelhout en patchouli, 60 branduren.",
    price: 54.00,
    emoji: "🕯️",
    badge: "Populair",
  },
  {
    id: 6,
    name: "Merino Trui",
    category: "Mode",
    desc: "Extra-fijn merino wol uit Nieuw-Zeeland. Licht, warm en tijdloos.",
    price: 219.00,
    emoji: "🧥",
    badge: null,
  },
  {
    id: 7,
    name: "Bronzen Dienblad",
    category: "Interieur",
    desc: "Handgegoten brons met gehamerd oppervlak. Een sculptuur én gebruiksvoorwerp.",
    price: 128.00,
    emoji: "🫙",
    badge: null,
  },
  {
    id: 8,
    name: "Gember Elixir",
    category: "Welzijn",
    desc: "Biologische gember-, kurkuma- en zwarte peper tincture. 100ml flesje.",
    price: 38.00,
    emoji: "✨",
    badge: "Nieuw",
  },
];

/* ======================================================
   2. STATE
   ====================================================== */
let cart = JSON.parse(localStorage.getItem("luxe_cart") || "[]");

/* ======================================================
   3. DOM HELPERS
   ====================================================== */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatPrice(n) {
  return "€" + n.toFixed(2).replace(".", ",");
}

/* ======================================================
   4. RENDER PRODUCTEN
   ====================================================== */
function renderProducts() {
  const grid = $("#productsGrid");
  grid.innerHTML = "";

  PRODUCTS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${i * 0.07}s`;
    card.dataset.id = p.id;

    card.innerHTML = `
      <div class="card-image">
        <span class="product-emoji">${p.emoji}</span>
        ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-footer">
          <div class="card-price">${formatPrice(p.price)}<span> incl. BTW</span></div>
          <button class="add-to-cart" data-id="${p.id}">+ Toevoegen</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Event listeners
  $$(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id)));
  });
}

/* ======================================================
   5. CART LOGIC
   ====================================================== */
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  updateCartUI();
  flashAddButton(productId);
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("luxe_cart", JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ======================================================
   6. CART UI
   ====================================================== */
function updateCartUI() {
  // Badge
  const count = cartCount();
  const badge = $("#cartCount");
  badge.textContent = count;
  badge.classList.toggle("visible", count > 0);

  // Items list
  const container = $("#cartItems");
  const emptyEl   = $("#cartEmpty");
  const footer    = $("#cartFooter");

  // Clear old items (keep empty placeholder)
  container.innerHTML = "";

  if (cart.length === 0) {
    const emptyClone = document.createElement("div");
    emptyClone.className = "cart-empty";
    emptyClone.id = "cartEmpty";
    emptyClone.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <p>Uw mandje is leeg</p>
    `;
    container.appendChild(emptyClone);
    footer.style.display = "none";
    return;
  }

  footer.style.display = "block";

  cart.forEach((item) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price * item.qty)}</p>
      </div>
      <div class="cart-item-controls">
        <div class="qty-controls">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
        <button class="remove-item" data-id="${item.id}">Verwijder</button>
      </div>
    `;
    container.appendChild(el);
  });

  // Qty buttons
  $$(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      changeQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta))
    );
  });
  $$(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(parseInt(btn.dataset.id)));
  });

  // Totals
  const subtotal = cartTotal();
  const tax      = subtotal - subtotal / 1.21;
  const total    = subtotal;

  $("#cartSubtotal").textContent = formatPrice(subtotal);
  $("#cartTax").textContent      = formatPrice(tax);
  $("#cartTotal").textContent    = formatPrice(total);

  // Re-init PayPal after DOM update
  initPayPal();
}

/* ======================================================
   7. CART OPEN / CLOSE
   ====================================================== */
function openCart() {
  $("#cartSidebar").classList.add("open");
  $("#cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cartSidebar").classList.remove("open");
  $("#cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

/* ======================================================
   8. PAYPAL INTEGRATIE
   ====================================================== */
let paypalRendered = false;

function initPayPal() {
  const container = $("#paypal-button-container");
  if (!container || cart.length === 0) return;

  // Verwijder oude knop en herrender
  container.innerHTML = "";
  paypalRendered = false;

  if (typeof paypal === "undefined") {
    container.innerHTML = `<p style="color:#c9a84c;font-size:12px;text-align:center;">PayPal laadt...</p>`;
    return;
  }

  paypal
    .Buttons({
      style: {
        layout:  "vertical",
        color:   "gold",
        shape:   "rect",
        label:   "pay",
        height:  44,
      },

      // Maak de bestelling aan
      createOrder: function (data, actions) {
        const items = cart.map((item) => ({
          name:      item.name,
          quantity:  String(item.qty),
          unit_amount: {
            currency_code: "EUR",
            value: item.price.toFixed(2),
          },
        }));

        const subtotal = cartTotal();

        return actions.order.create({
          purchase_units: [
            {
              description: "LUXE Webshop bestelling",
              amount: {
                currency_code: "EUR",
                value: subtotal.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: "EUR",
                    value: subtotal.toFixed(2),
                  },
                },
              },
              items: items,
            },
          ],
        });
      },

      // Betaling goedgekeurd
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          const name = details.payer?.name?.given_name || "klant";
          closeCart();
          showSuccessModal(name, details.id);
          cart = [];
          saveCart();
          updateCartUI();
        });
      },

      // Betaling geannuleerd
      onCancel: function () {
        showToast("Betaling geannuleerd. Uw mandje blijft bewaard.");
      },

      // Fout
      onError: function (err) {
        console.error("PayPal fout:", err);
        showToast("Er is een fout opgetreden. Probeer het opnieuw.");
      },
    })
    .render("#paypal-button-container");

  paypalRendered = true;
}

/* ======================================================
   9. SUCCESS MODAL
   ====================================================== */
function showSuccessModal(customerName, orderId) {
  const modal = $("#successModal");
  $("#successMsg").textContent =
    `Bedankt ${customerName}! Uw bestelling (${orderId.slice(0,8)}…) is bevestigd. U ontvangt een bevestiging per e-mail.`;
  modal.style.display = "flex";
}

$("#closeModal").addEventListener("click", () => {
  $("#successModal").style.display = "none";
});

/* ======================================================
   10. TOAST NOTIFICATIE
   ====================================================== */
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
      position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
      background:#1c1c19; border:1px solid rgba(201,168,76,0.3);
      color:#f5f0e8; padding:14px 24px; font-size:13px;
      letter-spacing:0.5px; z-index:999; box-shadow:0 8px 30px rgba(0,0,0,0.4);
      transition:opacity 0.3s; opacity:0; white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
}

/* ======================================================
   11. ADD-BUTTON ANIMATIE
   ====================================================== */
function flashAddButton(productId) {
  const btn = $(`[data-id="${productId}"].add-to-cart`);
  if (!btn) return;
  const original = btn.textContent;
  btn.classList.add("added");
  btn.textContent = "✓ Toegevoegd";
  setTimeout(() => {
    btn.classList.remove("added");
    btn.textContent = original;
  }, 1500);
}

/* ======================================================
   12. HEADER SCROLL EFFECT
   ====================================================== */
window.addEventListener("scroll", () => {
  $("#header").classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

/* ======================================================
   13. INITIALISATIE
   ====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();

  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#cartOverlay").addEventListener("click", closeCart);

  // ESC key sluit mandje
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      if ($("#successModal").style.display !== "none") {
        $("#successModal").style.display = "none";
      }
    }
  });
});
