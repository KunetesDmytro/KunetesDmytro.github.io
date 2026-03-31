/* ============================================================
   PizzaCraft — app.js
   Features: Cart (add/remove/qty), Orders, Filters, Nav, Toast
   ============================================================ */

// ── State ──────────────────────────────────────────────────
let cart = [];
let orderIdCounter = 43;

// ── DOM refs ───────────────────────────────────────────────
const cartListEl    = document.getElementById('cart-list');
const cartEmptyEl   = document.getElementById('cart-empty');
const cartCountEl   = document.getElementById('cart-count');
const subtotalEl    = document.getElementById('subtotal');
const deliveryCostEl= document.getElementById('delivery-cost');
const totalEl       = document.getElementById('total');
const ordersListEl  = document.getElementById('orders-list');

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Cart logic ─────────────────────────────────────────────
function addToCart(name, price, icon) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, icon, qty: 1 });
  }
  renderCart();
  showToast(`🍕 ${name} додано до кошика!`);

  // Update nav badge
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = total;
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
  renderCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = total;
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  renderCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = total;
  showToast(`Видалено з кошика`);
}

function renderCart() {
  // Clear cart items (keep empty msg)
  const items = cartListEl.querySelectorAll('.cart-item');
  items.forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmptyEl.style.display = 'flex';
    updateTotals(0);
    return;
  }
  cartEmptyEl.style.display = 'none';

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>₴ ${item.price} за шт.</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name}', +1)">+</button>
      </div>
      <div class="item-total">₴ ${item.price * item.qty}</div>
      <button class="remove-btn" onclick="removeFromCart('${item.name}')" aria-label="Видалити">✕</button>
    `;
    cartListEl.appendChild(el);
  });

  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const delivery = subtotal === 0 ? 0 : subtotal >= 600 ? 0 : 50;
  subtotalEl.textContent    = `₴ ${subtotal}`;
  deliveryCostEl.textContent= delivery === 0 && subtotal > 0
    ? '🎉 Безкоштовно'
    : `₴ ${delivery}`;
  totalEl.textContent       = `₴ ${subtotal + delivery}`;
}

// ── Place order ─────────────────────────────────────────────
function placeOrder() {
  if (cart.length === 0) {
    showToast('⚠️ Спочатку додайте піцу до кошика!');
    return;
  }

  const id    = `#PC-2025-0${orderIdCounter++}`;
  const now   = new Date();
  const dateStr = `Сьогодні, ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 600 ? 0 : 50;
  const totalAmt = subtotal + delivery;

  const itemsHtml = cart
    .map(i => `<li>${i.icon} ${i.name} × ${i.qty} — <strong>₴ ${i.price * i.qty}</strong></li>`)
    .join('');

  const card = document.createElement('article');
  card.className = 'order-card status-cooking';
  card.innerHTML = `
    <div class="order-header">
      <div>
        <span class="order-id">${id}</span>
        <span class="order-date">${dateStr}</span>
      </div>
      <span class="order-status cooking">🔥 Готується</span>
    </div>
    <ul class="order-items">${itemsHtml}</ul>
    <div class="order-footer">
      <span>Разом: <strong>₴ ${totalAmt}</strong></span>
      <button class="btn-track" onclick="alert('Відстеження: ваше замовлення готується!')">Відстежити</button>
    </div>
  `;

  // Insert at top of orders
  ordersListEl.insertBefore(card, ordersListEl.firstChild);

  // Reset cart
  cart = [];
  cartCountEl.textContent = '0';
  renderCart();

  showToast(`✅ Замовлення ${id} оформлено! Очікуйте 40–60 хв.`);

  // Scroll to orders
  setTimeout(() => {
    document.getElementById('orders').scrollIntoView({ behavior: 'smooth' });
  }, 600);
}

// ── Category filters ────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const pizzaCards = document.querySelectorAll('.pizza-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.cat;
    pizzaCards.forEach(card => {
      const match = cat === 'all' || card.dataset.cat === cat;
      card.style.display = match ? 'flex' : 'none';
    });
  });
});

// ── Mobile burger nav ───────────────────────────────────────
const burger = document.getElementById('burger');
const nav    = document.getElementById('main-nav');

burger.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Close nav on link click
nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    nav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// ── Highlight active nav on scroll ─────────────────────────
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => observer.observe(s));
