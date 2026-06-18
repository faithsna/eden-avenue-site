// ============================================================
//  EDEN AVENUE — Système Panier Global (cart.js)
//  Partagé entre index.html, marque-holyghost.html, produit.html
// ============================================================

const Cart = (() => {
  const KEY = 'ea-cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }

  function getItems() { return load(); }

  function add(product) {
    const items = load();
    const idx = items.findIndex(i => i.id === product.id && i.size === product.size && i.color === product.color);
    if (idx > -1) { items[idx].qty += 1; }
    else { items.push({ ...product, qty: 1 }); }
    save(items);
    updateBadge();
    renderDrawer();
    showToastCart(`✓ ${product.name} ajouté au panier`);
  }

  function remove(id, size, color) {
    let items = load().filter(i => !(i.id === id && i.size === size && i.color === color));
    save(items);
    updateBadge();
    renderDrawer();
  }

  function updateQty(id, size, color, qty) {
    let items = load();
    const idx = items.findIndex(i => i.id === id && i.size === size && i.color === color);
    if (idx > -1) {
      if (qty <= 0) { items.splice(idx, 1); }
      else { items[idx].qty = qty; }
    }
    save(items);
    updateBadge();
    renderDrawer();
  }

  function clear() { save([]); updateBadge(); renderDrawer(); }

  function total() {
    return load().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function count() {
    return load().reduce((s, i) => s + i.qty, 0);
  }

  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      const n = count();
      b.textContent = n;
      b.style.display = 'flex';
    });
  }

  function showToastCart(msg) {
    let t = document.getElementById('ea-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ea-toast';
      t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a18;color:#faf9f6;font-family:"DM Sans",sans-serif;font-size:13px;letter-spacing:0.04em;padding:12px 24px;border-left:3px solid #c9a84c;z-index:99999;opacity:0;transition:opacity 0.25s,transform 0.25s;pointer-events:none;white-space:nowrap;border-radius:0;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2800);
  }

  function injectDrawer() {
    if (document.getElementById('ea-cart-drawer')) return;
    const el = document.createElement('div');
    el.innerHTML = `
      <div id="ea-cart-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9998;display:none;opacity:0;transition:opacity 0.3s;"></div>
      <div id="ea-cart-drawer" style="position:fixed;top:0;right:0;bottom:0;width:420px;max-width:100vw;background:#faf9f6;z-index:9999;transform:translateX(100%);transition:transform 0.35s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e0d9ce;flex-shrink:0;">
          <div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;letter-spacing:0.06em;color:#0e0e0d;">Mon Panier</div>
            <div id="ea-cart-count-label" style="font-size:11px;color:#6b6b62;letter-spacing:0.08em;text-transform:uppercase;margin-top:2px;">0 article</div>
          </div>
          <button id="ea-cart-close" style="background:none;border:1px solid #e0d9ce;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a18" stroke-width="2" width="16" height="16"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="ea-cart-items" style="flex:1;overflow-y:auto;padding:0;"></div>
        <div id="ea-cart-footer" style="border-top:1px solid #e0d9ce;padding:20px 24px;flex-shrink:0;background:#faf9f6;">
          <div style="display:flex;align-items:center;gap:10px;background:#f2ede4;padding:12px 14px;margin-bottom:16px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.8" width="18" height="18"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span style="font-size:12px;color:#6b6b62;">Prochain départ Abidjan → Paris : <strong style="color:#0e0e0d;">11 Juin 2026</strong></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#6b6b62;letter-spacing:0.04em;">Sous-total</span>
            <span id="ea-cart-subtotal" style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:#0e0e0d;">€0,00</span>
          </div>
          <div style="font-size:11px;color:#6b6b62;margin-bottom:18px;">Livraison calculée à l'étape suivante</div>
          <button id="ea-checkout-btn" style="width:100%;background:#0e0e0d;color:#faf9f6;border:none;padding:15px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;margin-bottom:10px;">
            Commander — <span id="ea-checkout-total">€0,00</span>
          </button>
          <button onclick="Cart.clear()" style="width:100%;background:none;color:#6b6b62;border:1px solid #e0d9ce;padding:10px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;letter-spacing:0.06em;">
            Vider le panier
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('ea-cart-close').addEventListener('click', closeDrawer);
    document.getElementById('ea-cart-overlay').addEventListener('click', closeDrawer);
    // ✅ BOUTON COMMANDER → redirige vers commande.html
    document.getElementById('ea-checkout-btn').addEventListener('click', () => {
      if (count() === 0) {
        showToastCart('Votre panier est vide');
        return;
      }
      window.location.href = 'commande.html';
    });
  }

  function openDrawer() {
    const drawer = document.getElementById('ea-cart-drawer');
    const overlay = document.getElementById('ea-cart-overlay');
    if (!drawer) return;
    overlay.style.display = 'block';
    setTimeout(() => { overlay.style.opacity = '1'; drawer.style.transform = 'translateX(0)'; }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const drawer = document.getElementById('ea-cart-drawer');
    const overlay = document.getElementById('ea-cart-overlay');
    if (!drawer) return;
    overlay.style.opacity = '0';
    drawer.style.transform = 'translateX(100%)';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }

  function renderDrawer() {
    const items = load();
    const container = document.getElementById('ea-cart-items');
    const countLabel = document.getElementById('ea-cart-count-label');
    const subtotal = document.getElementById('ea-cart-subtotal');
    const checkoutTotal = document.getElementById('ea-checkout-total');
    if (!container) return;

    const n = count();
    if (countLabel) countLabel.textContent = n === 0 ? 'Panier vide' : `${n} article${n > 1 ? 's' : ''}`;

    const t = total();
    const fmt = v => '€' + v.toFixed(2).replace('.', ',');
    if (subtotal) subtotal.textContent = fmt(t);
    if (checkoutTotal) checkoutTotal.textContent = fmt(t);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:48px 24px;text-align:center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#e0d9ce" stroke-width="1.5" width="56" height="56" style="margin-bottom:16px;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <div style="font-family:'Cormorant Garamond',serif;font-size:20px;color:#1a1a18;margin-bottom:8px;">Votre panier est vide</div>
          <div style="font-size:13px;color:#6b6b62;margin-bottom:24px;">Découvrez nos marques et ajoutez vos articles préférés.</div>
          <button onclick="Cart.close();window.location.href='index.html'" style="background:#0e0e0d;color:#faf9f6;border:none;padding:12px 24px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;">
            Voir les marques
          </button>
        </div>`;
      return;
    }

    // Build items HTML with data attributes instead of inline onclick
    container.innerHTML = items.map((item, index) => `
      <div style="display:flex;gap:14px;padding:16px 24px;border-bottom:1px solid #e0d9ce;align-items:flex-start;">
        <div style="width:72px;height:88px;flex-shrink:0;background:#f2ede4;display:flex;align-items:center;justify-content:center;position:relative;">
          ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;" alt="${item.name}">` : `<span style="font-family:'Cormorant Garamond',serif;font-size:22px;font-style:italic;color:rgba(0,0,0,0.12);">HG</span>`}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b6b62;margin-bottom:2px;">${item.brand || 'Holy Ghost'}</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:500;color:#0e0e0d;margin-bottom:4px;line-height:1.2;">${item.name}</div>
          ${item.size ? `<div style="font-size:11px;color:#6b6b62;margin-bottom:2px;">Taille : ${item.size}</div>` : ''}
          ${item.color ? `<div style="font-size:11px;color:#6b6b62;margin-bottom:8px;">Couleur : ${item.color}</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
            <div style="display:flex;align-items:center;border:1px solid #e0d9ce;">
              <button data-action="minus" data-idx="${index}" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:16px;color:#1a1a18;display:flex;align-items:center;justify-content:center;">−</button>
              <span style="width:28px;text-align:center;font-size:13px;font-weight:600;">${item.qty}</span>
              <button data-action="plus" data-idx="${index}" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:16px;color:#1a1a18;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:#0e0e0d;">€${(item.price * item.qty).toFixed(2).replace('.',',')}</div>
          </div>
        </div>
        <button data-action="remove" data-idx="${index}" style="background:none;border:none;cursor:pointer;color:#6b6b62;padding:2px;flex-shrink:0;" title="Retirer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `).join('');

    // Event delegation — works reliably on all browsers including Safari
    container.onclick = function(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx);
      const currentItems = load();
      if (idx < 0 || idx >= currentItems.length) return;
      const item = currentItems[idx];
      const action = btn.dataset.action;
      if (action === 'remove') {
        remove(item.id, item.size, item.color);
      } else if (action === 'minus') {
        updateQty(item.id, item.size, item.color, item.qty - 1);
      } else if (action === 'plus') {
        updateQty(item.id, item.size, item.color, item.qty + 1);
      }
    };
  }

  function init() {
    injectDrawer();
    updateBadge();
    renderDrawer();
    document.querySelectorAll('.icon-btn[aria-label="Panier"], .icon-btn[aria-label="panier"]').forEach(btn => {
      btn.addEventListener('click', () => { openDrawer(); renderDrawer(); });
    });
  }

  return { add, remove, updateQty, clear, getItems, count, total, open: openDrawer, close: closeDrawer, init, toast: showToastCart };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Cart.init);
} else {
  Cart.init();
}
