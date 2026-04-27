// script.js - Holland Cheese

let cart = {};

/* ── CART PERSISTENCE ────────────────────── */
function loadCart() {
    try {
        const saved = localStorage.getItem('hollandCheeseCart');
        if (saved) cart = JSON.parse(saved);
    } catch (e) { cart = {}; }
    updateCartDisplay();
    updateCartVisibility();
    updateCartBadge();
}

function saveCart() {
    localStorage.setItem('hollandCheeseCart', JSON.stringify(cart));
}

/* ── ADD ITEM ─────────────────────────────── */
function addSizedItem(button) {
    const card = button.closest('.cheese-card');
    const prepSelect = card.querySelector('.prep-select');
    const sizeSelect = card.querySelector('.size-select');
    const qtySpan = card.querySelector('.card-quantity');
    const quantity = parseInt(qtySpan.textContent) || 1;

    let fullItemName = prepSelect ? prepSelect.dataset.base : sizeSelect.dataset.item;

    if (prepSelect && prepSelect.value !== '') {
        fullItemName += ` — ${prepSelect.value}`;
    }

    if (sizeSelect && !sizeSelect.classList.contains('hidden')) {
        const [size] = sizeSelect.value.split('-');
        fullItemName += ` — ${size}`;
    }

    if (!cart[fullItemName]) cart[fullItemName] = 0;
    cart[fullItemName] += quantity;

    saveCart();
    updateCartDisplay();
    updateCartBadge();
    showToast(`Added to cart ✓`);
    qtySpan.textContent = '1';

    // Pulse badge
    const badge = document.getElementById('cart-badge');
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');

    // Open cart briefly
    const cartEl = document.getElementById('floating-cart');
    cartEl.classList.add('show');
}

/* ── CARD QUANTITY ───────────────────────── */
function changeCardQuantity(btn, change) {
    const card = btn.closest('.cheese-card');
    const qtySpan = card.querySelector('.card-quantity');
    let qty = parseInt(qtySpan.textContent) || 1;
    qty = Math.max(1, qty + change);
    qtySpan.textContent = qty;
}

/* ── CART DISPLAY ────────────────────────── */
function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items');
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';

    let totalItems = 0;

    for (const [fullItemName, quantity] of Object.entries(cart)) {
        if (quantity > 0) {
            totalItems += quantity;
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="cart-item-row">
                    <span class="item-name">${fullItemName}</span>
                    <span class="remove-text" onclick="removeItem('${fullItemName.replace(/'/g, "\\'")}')">Remove</span>
                </div>
                <div class="quantity-controls">
                    <button onclick="changeQuantity('${fullItemName.replace(/'/g, "\\'")}', -1)">–</button>
                    <span class="quantity">× ${quantity}</span>
                    <button onclick="changeQuantity('${fullItemName.replace(/'/g, "\\'")}', 1)">+</button>
                </div>
            `;
            cartItemsList.appendChild(li);
        }
    }

    const header = document.querySelector('#floating-cart h3');
    if (header) {
        header.textContent = totalItems > 0 ? `Your Cart (${totalItems})` : 'Your Cart';
    }

    updateCartBadge();
}

function updateCartVisibility() {
    const floatingCart = document.getElementById('floating-cart');
    if (!floatingCart) return;
    const hasItems = Object.values(cart).some(qty => qty > 0);
    if (!hasItems) floatingCart.classList.remove('show');
}

function toggleFloatingCart() {
    const cartEl = document.getElementById('floating-cart');
    cartEl.classList.toggle('show');
}

// Close cart when clicking outside
document.addEventListener('click', function (event) {
    const cartEl = document.getElementById('floating-cart');
    const cartBtn = document.querySelector('.floating-cart-btn');
    if (!cartEl || !cartBtn) return;
    if (cartEl.contains(event.target) || cartBtn.contains(event.target)) return;
    if (cartEl.classList.contains('show')) cartEl.classList.remove('show');
});

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    badge.textContent = total;
}

function changeQuantity(itemName, change) {
    if (cart[itemName] !== undefined) {
        cart[itemName] += change;
        if (cart[itemName] <= 0) delete cart[itemName];
        saveCart();
        updateCartDisplay();
        updateCartVisibility();
        updateCartBadge();
    }
}

function removeItem(itemName) {
    delete cart[itemName];
    saveCart();
    updateCartDisplay();
    updateCartVisibility();
    updateCartBadge();
    showToast(`Removed from cart`);
}

/* ── ORDER ──────────────────────────────── */
function placeOrder() {
    if (Object.keys(cart).length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    let message = '🧀 Hello Holland Cheese!\nI would like to order:\n\n';
    for (const [itemName, quantity] of Object.entries(cart)) {
        if (quantity > 0) {
            message += `• ${itemName}: ${quantity} unit${quantity > 1 ? 's' : ''}\n`;
        }
    }
    message += '\nThank you! 😊';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/256752628397?text=${encodedMessage}`, '_blank');
}

/* ── TOAST ──────────────────────────────── */
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    void toast.offsetHeight;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(8px)';
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

/* ── SCROLL REVEAL ──────────────────────── */
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(
        '.reveal, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3, .reveal-delay-4, .reveal-section'
    ).forEach(el => observer.observe(el));

    // Staggered card reveal
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('in-view');
                }, i * 80);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal-card').forEach(el => cardObserver.observe(el));
}

/* ── NAVBAR SCROLL ──────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

/* ── PREP SELECT TOGGLE ─────────────────── */
function initPrepSelects() {
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('prep-select')) {
            const card = e.target.closest('.cheese-card');
            const sizeSelect = card.querySelector('.size-select');
            sizeSelect.classList.toggle('hidden', e.target.value === '');
        }
    });
}

/* ── INIT ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    initReveal();
    initNavbar();
    initPrepSelects();

    // Trigger hero reveals immediately
    setTimeout(() => {
        document.querySelectorAll('.reveal, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3, .reveal-delay-4').forEach(el => {
            el.classList.add('in-view');
        });
    }, 100);
});