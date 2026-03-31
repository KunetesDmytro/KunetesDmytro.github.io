// ============================================================
// PizzaCraft — Лабораторна робота №2
// JavaScript: DOM, події, цикли (for/while), умови
// ============================================================

const menuData = [
  { id: 1, name: 'Маргарита',     price: 189, category: 'pizza',   desc: 'Томатний соус, моцарела, свіжий базилік',    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', badge: 'Хіт' },
  { id: 2, name: 'Пепероні',      price: 219, category: 'pizza',   desc: 'Гостра ковбаса, моцарела, томатний соус',    img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', badge: '' },
  { id: 3, name: 'Філадельфія',   price: 265, category: 'sushi',   desc: 'Лосось, вершковий сир, авокадо, огірок',     img: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&q=80', badge: 'Новинка' },
  { id: 4, name: 'Каліфорнія',    price: 245, category: 'sushi',   desc: 'Краб, авокадо, огірок, ікра тобіко',         img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80', badge: '' },
  { id: 5, name: 'Капучіно',      price: 89,  category: 'drinks',  desc: 'Еспресо, молочна піна, кориця',              img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80', badge: '' },
  { id: 6, name: 'Класик Бургер', price: 199, category: 'burgers', desc: 'Яловичина, чедер, салат, томат, соус',       img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', badge: 'Хіт' },
];

let cart = [];
let orders = [];
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCart();
  renderOrders();
  initNavigation();
  initOrderButton();
});

// ---- НАВІГАЦІЯ ----
function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        activateSection(href.slice(1));
      }
    });
  });
}

function activateSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active-section');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
  });
}

// ---- РЕНДЕР МЕНЮ — цикл for ----
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 0; i < menuData.length; i++) {
    const d = menuData[i];
    const badgeHtml = d.badge ? `<span class="dish-badge${d.badge === 'Новинка' ? ' new' : ''}">${d.badge}</span>` : '';
    const card = document.createElement('article');
    card.className = 'dish-card';
    card.innerHTML = `
      <div class="dish-img-wrap">
        <img src="${d.img}" alt="${d.name}" class="dish-img" loading="lazy" />
        ${badgeHtml}
      </div>
      <div class="dish-info">
        <h3 class="dish-name">${d.name}</h3>
        <p class="dish-desc">${d.desc}</p>
        <div class="dish-footer">
          <span class="dish-price">${d.price} ₴</span>
          <button class="btn-add" data-id="${d.id}">+ Додати</button>
        </div>
      </div>`;
    grid.appendChild(card);
  }

  grid.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(parseInt(btn.getAttribute('data-id')));
      btn.textContent = '✓ Додано';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = '+ Додати'; btn.classList.remove('added'); }, 1500);
    });
  });
}

// ---- КОШИК ----
function addToCart(dishId) {
  const dish = menuData.find(d => d.id === dishId);
  if (!dish) return;
  const ex = cart.find(i => i.id === dishId);
  if (ex) { ex.qty++; } else { cart.push({ id: dish.id, name: dish.name, price: dish.price, qty: 1 }); }
  renderCart();
  updateCartBadge();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { renderCart(); updateCartBadge(); }
}

// ---- РЕНДЕР КОШИКА — цикл for ----
function renderCart() {
  const cartGrid    = document.getElementById('cartGrid');
  const cartContent = document.getElementById('cartContent');
  const cartEmpty   = document.getElementById('cartEmpty');
  const totalItems  = document.getElementById('totalItems');
  const totalPrice  = document.getElementById('totalPrice');
  if (!cartGrid) return;

  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartContent.classList.add('hidden');
    return;
  } else {
    cartEmpty.classList.add('hidden');
    cartContent.classList.remove('hidden');
  }

  cartGrid.innerHTML = '';
  let total = 0, totalQty = 0;

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    totalQty += item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-unit">${item.price} ₴ / шт.</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
      </div>
      <div class="cart-item-total">${lineTotal} ₴</div>
      <button class="btn-remove" data-id="${item.id}">Видалити</button>`;
    cartGrid.appendChild(row);
  }

  totalItems.textContent = totalQty;
  totalPrice.textContent = total + ' ₴';

  cartGrid.querySelectorAll('.qty-btn').forEach(b =>
    b.addEventListener('click', () => changeQty(parseInt(b.getAttribute('data-id')), parseInt(b.getAttribute('data-delta'))))
  );
  cartGrid.querySelectorAll('.btn-remove').forEach(b =>
    b.addEventListener('click', () => removeFromCart(parseInt(b.getAttribute('data-id'))))
  );
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

// ---- ОФОРМЛЕННЯ + ТАЙМЕР ----
function initOrderButton() {
  const btn = document.getElementById('btnOrder');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (cart.length === 0) return;
    const order = {
      id: orders.length + 1,
      items: cart.map(i => ({ ...i })),
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      date: new Date().toLocaleString('uk-UA'),
    };
    orders.push(order);
    cart = [];
    renderCart();
    updateCartBadge();
    renderOrders();
    startDeliveryTimer();
    activateSection('orders');
  });
}

function startDeliveryTimer() {
  if (timerInterval) clearInterval(timerInterval);
  const ordersSection = document.getElementById('orders');
  let existing = document.getElementById('deliveryTimer');
  if (existing) existing.remove();
  let remaining = 60;
  const timerBox = document.createElement('div');
  timerBox.id = 'deliveryTimer';
  timerBox.className = 'delivery-timer';
  timerBox.innerHTML = `
    <div class="timer-label">🛵 Очікуваний час доставки</div>
    <div class="timer-countdown" id="timerCountdown">${formatTime(remaining)}</div>
    <div class="timer-bar-wrap"><div class="timer-bar" id="timerBar"></div></div>`;
  ordersSection.querySelector('.section-header').after(timerBox);
  const initial = remaining;
  timerInterval = setInterval(() => {
    remaining--;
    const cd = document.getElementById('timerCountdown');
    const bar = document.getElementById('timerBar');
    if (cd) cd.textContent = formatTime(remaining);
    if (bar) {
      bar.style.width = (remaining / initial * 100) + '%';
      if (remaining > 30) bar.style.background = '#2e7d32';
      else if (remaining > 10) bar.style.background = '#f57c00';
      else bar.style.background = '#d32f2f';
    }
    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (cd) cd.textContent = '🎉 Замовлення доставлено!';
    }
  }, 1000);
}

function formatTime(s) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

// ---- РЕНДЕР ЗАМОВЛЕНЬ — цикл while ----
function renderOrders() {
  const grid  = document.getElementById('ordersGrid');
  const empty = document.getElementById('ordersEmpty');
  if (!grid) return;
  if (orders.length === 0) { empty.classList.remove('hidden'); grid.innerHTML = ''; return; }
  empty.classList.add('hidden');
  grid.innerHTML = '';
  let i = orders.length - 1;
  while (i >= 0) {
    const o = orders[i];
    const itemsHtml = o.items.map(it => `<li><span>${it.name} × ${it.qty}</span><span>${it.price * it.qty} ₴</span></li>`).join('');
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <div class="order-header">
        <span class="order-id">Замовлення #${o.id}</span>
        <span class="order-date">${o.date}</span>
      </div>
      <ul class="order-items-list">${itemsHtml}</ul>
      <div class="order-total">
        <span class="order-total-label">Загальна сума:</span>
        <span class="order-total-price">${o.total} ₴</span>
        <span class="order-status">Доставлено</span>
      </div>`;
    grid.appendChild(card);
    i--;
  }
}
