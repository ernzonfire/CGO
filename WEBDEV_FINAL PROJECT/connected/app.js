(() => {
  const page = document.body.dataset.page;
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => '₱ ' + value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const imageURL = image => /^(https?:\/\/|\/|assets\/|img\/)/i.test(image) ? image : 'img/' + image;
  const imageTag = (product, className = '') => `<img class="${className}" src="${escape(imageURL(product.image))}" alt="${escape(product.name)}">`;

  const socialIcons = {"facebook": "<svg class=\"social-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M80 299.3l0 212.7 116 0 0-212.7 86.5 0 18-97.8-104.5 0 0-34.6c0-51.7 20.3-71.5 72.7-71.5 16.3 0 29.4 .4 37 1.2l0-88.7C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4l0 42.1-66 0 0 97.8 66 0z\"/></svg>", "instagram": "<svg class=\"social-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z\"/></svg>", "linkedin": "<svg class=\"social-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M100.3 448l-92.9 0 0-299.1 92.9 0 0 299.1zM53.8 108.1C24.1 108.1 0 83.5 0 53.8 0 39.5 5.7 25.9 15.8 15.8s23.8-15.8 38-15.8 27.9 5.7 38 15.8 15.8 23.8 15.8 38c0 29.7-24.1 54.3-53.8 54.3zM447.9 448l-92.7 0 0-145.6c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7l0 148.1-92.8 0 0-299.1 89.1 0 0 40.8 1.3 0c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3l0 164.3-.1 0z\"/></svg>", "twitter": "<svg class=\"social-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103l0-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z\"/></svg>", "youtube": "<svg class=\"social-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z\"/></svg>", "google": "<svg class=\"social-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2026 Fonticons, Inc. --><path fill=\"currentColor\" d=\"M500 261.8C500 403.3 403.1 504 260 504 122.8 504 12 393.2 12 256S122.8 8 260 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9c-88.3-85.2-252.5-21.2-252.5 118.2 0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9l-140.8 0 0-85.3 236.1 0c2.3 12.7 3.9 24.9 3.9 41.4z\"/></svg>"};
  function socialItem(network, label, url = '', owner = '') {
    const icon = socialIcons[network];
    if (url) return `<a class="social-item" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(owner ? owner + ' on ' + label : label)}" title="${escape(label)}">${icon}</a>`;
    return `<span class="social-item" role="img" aria-label="${escape(label)}" title="${escape(label)}">${icon}</span>`;
  }
  function renderTeamSocials() {
    const ownerLinks = {"facebook": "https://www.facebook.com/ErnzOnFire", "instagram": "https://www.instagram.com/ernie.demaluan/", "linkedin": "https://www.linkedin.com/in/ernie-demaluan-b98673191/"};
    document.querySelectorAll('.team-card .team-social').forEach((node, index) => {
      node.removeAttribute('aria-hidden');
      const owner = node.closest('.team-card').querySelector('h3').textContent;
      node.innerHTML = [['facebook','Facebook'],['instagram','Instagram'],['linkedin','LinkedIn']].map(([network,label]) => socialItem(network, label, index === 0 ? ownerLinks[network] : '', owner)).join('');
    });
  }
  function renderFooter() {
    const footer = $('.site-footer');
    const brandLogo = `<span class="logo-lockup" role="img" aria-label="Step Brew"><img class="logo-symbol" src="StepBrewLogo.png" alt=""><img class="logo-wordmark" src="StepBrewTransparent.png" alt=""></span>`;
    const payments = [['bpi','BPI'],['gcash','GCash'],['maya','Maya'],['alipay','Alipay'],['mastercard','Mastercard'],['paypal','PayPal'],['visa','Visa']];
    footer.innerHTML = `
      <div class="footer-brand-column">
        <a class="footer-brand" href="ProductPage.html" aria-label="Step Brew home">${brandLogo}</a>
        <p>As part of Chilli Garlic Oil (CGO), Step Brew brings together a passion for coffee, community, and the little moments that make each day better.</p>
        <p class="footer-location">Lapu-Lapu City, Philippines</p>
      </div>
      <nav class="footer-column" aria-label="About Step Brew">
        <h2>ABOUT STEPBREW</h2>
        <a href="About.html#about">About Us</a>
        <a href="About.html#experiences">Reviews</a>
        <a href="About.html#team">Developers</a>
        <a href="Menu.html">Our Menu</a>
      </nav>
      <div class="footer-column footer-payments">
        <h2>PAYMENT</h2>
        <div class="payment-logos" aria-label="Payment brand logos">${payments.map(([file,label]) => `<span class="payment-logo"><img src="assets/brands/${file}.svg" alt="${label}" loading="lazy"></span>`).join('')}</div>
        <p class="footer-note">Demo orders are paid at the counter on pickup.</p>
      </div>
      <div class="footer-column footer-logistics">
        <h2>LOGISTICS</h2>
        <div class="delivery-logos" aria-label="Delivery brand references">
          <span class="delivery-logo"><img src="assets/brands/grabfood.png" alt="GrabFood" loading="lazy"></span>
          <span class="delivery-logo foodpanda-logo"><img src="assets/brands/foodpanda.svg" alt="" loading="lazy"><span>foodpanda</span></span>
        </div>
        <p class="footer-note">Pickup only for this demo.</p>
      </div>
      <div class="footer-column footer-follow">
        <h2>FOLLOW US</h2>
        <div class="footer-socials">${[['facebook','Facebook'],['instagram','Instagram'],['linkedin','LinkedIn'],['twitter','Twitter'],['youtube','YouTube']].map(([network,label]) => `<span class="footer-social-row">${socialItem(network,label)}<span>${label}</span></span>`).join('')}</div>
      </div>
      <div class="footer-bottom"><small>© 2023 Step Brew. All Rights Reserved.</small><a href="photo-credits.html">Image & icon credits</a></div>`;
  }

  const guestKey = 'step-brew-guest-cart';
  let state = { products: [], member: null, cart: null, reviews: [], setupRequired: false };
  let guest = readGuest(), category = '', search = '', ready = false, refreshPromise, refreshAgain = false, cartBusy = false, orderBusy = false, adminTab = 'products', requestId = '', pageSerial = 0;
  const categories = ['Hot Drinks', 'Cold Drinks', 'Desserts', 'Sandwiches', 'Pastas', 'Pastries'];
  let toastTimer;
  function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 4000); }
  async function api(route, method = 'GET', data) {
    const response = await fetch(route, { method, cache: 'no-store', headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
    const value = await response.json();
    if (!response.ok) { const error = new Error(value.error || 'Something went wrong. Please try again.'); error.status = response.status; throw error; }
    return value;
  }
  function readGuest() {
    try {
      let saved = localStorage.getItem(guestKey);
      // Retain the bag from an older open Step Brew page during the upgrade.
      if (saved === null) {
        saved = localStorage.getItem('step-brew-cart');
        if (saved !== null) localStorage.setItem(guestKey, saved);
      }
      const value = JSON.parse(saved || '[]');
      const seen = new Set();
      return (Array.isArray(value) ? value : []).filter(i => i && Number.isSafeInteger(i.id) && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 99 && !seen.has(i.id) && seen.add(i.id)).map(({ id, quantity }) => ({ id, quantity }));
    }
    catch { return []; }
  }
  function saveGuest() { try { localStorage.setItem(guestKey, JSON.stringify(guest)); } catch { toast('Your browser cannot keep your guest bag after this page closes.'); } }
  function cart() { return state.member ? state.cart || [] : guest.filter(i => state.products.some(p => p.id === i.id)); }
  function renderHeader() {
    const header = $('.site-header');
    if (!header.dataset.shared) {
      header.innerHTML = "<a class=\"brand\" href=\"ProductPage.html\"><span class=\"logo-lockup\" role=\"img\" aria-label=\"Step Brew\"><img class=\"logo-symbol\" src=\"StepBrewLogo.png\" alt=\"\"><img class=\"logo-wordmark\" src=\"StepBrewTransparent.png\" alt=\"\"></span></a><nav aria-label=\"Main navigation\"><a href=\"ProductPage.html\">HOME</a><a href=\"Menu.html\">MENU</a><a href=\"About.html\">ABOUT</a></nav><div id=\"header-actions\" class=\"header-actions\"></div>";
      header.dataset.shared = 'true';
    }
    const member = state.member;
    $('#header-actions').innerHTML = `<button class="bag-toggle" data-action="open-bag" aria-label="Open shopping bag"><svg width="22" height="25" viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M5 9h14l2 16H3L5 9Z" stroke="currentColor" stroke-width="2"/><path d="M8 11V6a4 4 0 0 1 8 0v5" stroke="currentColor" stroke-width="2"/></svg><span class="bag-count">0</span></button>${member ? `${member.role === 'admin' ? '<a class="pill outline" href="admin.html">ADMIN</a>' : ''}<a class="profile-link" href="account.html" aria-label="Your profile">${escape(member.firstName || member.username)}</a><button class="pill" data-action="logout">LOGOUT</button>` : '<a class="pill outline" href="register.html">SIGN UP</a><a class="pill" href="login.html">SIGN IN</a>'}`;
    const path = ({ home: 'ProductPage.html', menu: 'Menu.html', about: 'About.html' })[page] || location.pathname.split('/').pop();
    document.querySelectorAll('.site-header nav a').forEach(link => {
      if (link.getAttribute('href') === path) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    renderBag();
  }
  function renderProducts() {
    const grid = $('#product-grid'); if (!grid) return;
    $('#categories').innerHTML = [...new Set([...categories, ...state.products.map(p => p.category)])].map(name => `<button class="category-link" data-category="${escape(name)}" aria-pressed="${name === category}">${escape(name)}</button>`).join('');
    const visible = state.products.filter(p => (!category || p.category === category) && p.name.toLowerCase().includes(search.toLowerCase()));
    grid.innerHTML = visible.map(p => `<article class="product-card">${imageTag(p)}<h2>${escape(p.name)}</h2><p class="product-price">${money(p.price)}</p><button class="add-button" data-add="${p.id}" aria-label="Add ${escape(p.name)} to bag">Add To Bag</button></article>`).join('') || '<p class="empty-message">No products found.</p>';
  }
  function renderBag() {
    const entries = cart(); let cents = 0, count = 0;
    $('#bag-items').innerHTML = entries.map(entry => {
      const p = state.products.find(p => p.id === entry.id); if (!p) return '';
      const line = Math.round(p.price * 100) * entry.quantity; cents += line; count += entry.quantity;
      return `<li class="bag-item">${imageTag(p)}<span>${escape(p.name)}</span><span>${money(line / 100)}</span><div class="quantity-controls"><button data-delta="-1" data-id="${p.id}" aria-label="Decrease ${escape(p.name)} quantity" ${cartBusy || orderBusy ? 'disabled' : ''}>−</button><span>${entry.quantity}</span><button data-delta="1" data-id="${p.id}" aria-label="Increase ${escape(p.name)} quantity" ${cartBusy || orderBusy || entry.quantity >= 99 ? 'disabled' : ''}>+</button></div></li>`;
    }).join('') || '<li class="empty-message">Your bag is empty.<br><br><a href="Menu.html">Browse the menu</a></li>';
    document.querySelectorAll('.bag-count').forEach(node => node.textContent = count);
    $('#bag-total').textContent = money(cents / 100);
    $('#place-order').disabled = !ready || !count || orderBusy || cartBusy;
    $('#place-order').textContent = orderBusy ? 'Placing order…' : 'Place Order';
  }
  async function changeCart(id, delta) {
    if (!ready || cartBusy || orderBusy) return;
    cartBusy = true; renderBag();
    try {
      if (state.member) state.cart = await api('/api/cart', 'POST', { id, delta });
      else { guest = readGuest(); const item = guest.find(i => i.id === id); if (item) item.quantity = Math.min(99, item.quantity + delta); else if (delta > 0) guest.push({ id, quantity: 1 }); guest = guest.filter(i => i.quantity > 0); saveGuest(); }
      requestId = ''; $('#bag-message').textContent = '';
    } catch (error) { toast(error.message); if (error.status === 401) await refresh(); }
    finally { cartBusy = false; renderBag(); }
  }
  function openBag() { $('#shopping-bag').hidden = false; $('[data-action="close-bag"]').focus(); }
  function closeBag() { $('#shopping-bag').hidden = true; $('.bag-toggle')?.focus(); }
  async function refresh() {
    if (refreshPromise) { refreshAgain = true; return refreshPromise; }
    refreshPromise = (async () => {
      try {
        const next = await api('/api/state');
        const productsChanged = JSON.stringify(next.products) !== JSON.stringify(state.products);
        const memberChanged = JSON.stringify(next.member) !== JSON.stringify(state.member);
        const reviewsChanged = JSON.stringify(next.reviews) !== JSON.stringify(state.reviews);
        state = next; guest = readGuest(); ready = true; $('#load-status').hidden = true;
        if (memberChanged || !$('#header-actions').children.length) renderHeader();
        if (productsChanged) renderProducts();
        renderBag();
        if (page === 'register') $('#setup-note').textContent = state.setupRequired ? 'The first registered account will manage this local shop.' : '';
        if (page === 'account' && (memberChanged || !$('#profile-content').children.length)) renderProfile();
        if (page === 'about') { if (reviewsChanged || !$('#reviews-list').children.length) renderReviews(); if (memberChanged || !$('#review-form-slot').children.length) renderReviewForm(); }
        if (page === 'admin' || page === 'account') await renderPrivatePage();
      } catch (error) { $('#load-status').textContent = 'Unable to connect to Step Brew. ' + error.message; $('#load-status').hidden = false; }
    })();
    try { await refreshPromise; } finally { refreshPromise = null; if (refreshAgain) { refreshAgain = false; refresh(); } }
  }
  function loginPrompt() { return '<section class="panel"><h2>Please sign in</h2><p>Sign in to view your account.</p><a class="orange-button" href="login.html">SIGN IN</a></section>'; }
  function renderProfile() {
    const node = $('#profile-content'); if (!node) return;
    if (!state.member) { node.innerHTML = loginPrompt(); return; }
    const u = state.member;
    node.innerHTML = `<h1>Your Profile</h1><p>Username: <strong>${escape(u.username)}</strong> · ${escape(u.role)}</p><form id="profile-form" class="profile-form"><label>First Name<input name="firstName" value="${escape(u.firstName)}" required maxlength="60"></label><label>Middle Name<input name="middleName" value="${escape(u.middleName)}" maxlength="60"></label><label>Last Name<input name="lastName" value="${escape(u.lastName)}" maxlength="60"></label><label>Birthdate<input type="date" name="dateOfBirth" value="${escape(u.dateOfBirth)}"></label><p class="form-error" role="status"></p><button class="orange-button">SAVE PROFILE</button></form>`;
  }
  function orderTable(orders, admin) {
    if (!orders.length) return '<p class="empty-message">No orders yet.</p>';
    return `<div class="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${orders.map(o => `<tr><td>${escape(o.id.slice(0, 8))}<br><small>${escape(new Date(o.createdAt).toLocaleString())}</small></td><td>${escape(o.customer)}</td><td>${o.items.map(i => `${i.quantity} × ${escape(i.name)}`).join('<br>')}</td><td>${money(o.total)}</td><td>${admin ? `<select data-order="${escape(o.id)}" aria-label="Order ${escape(o.id.slice(0, 8))} status">${['Brewing', 'Ready for pickup', 'Completed', 'Cancelled'].map(status => `<option ${status === o.status ? 'selected' : ''}>${status}</option>`).join('')}</select>` : escape(o.status)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  async function renderPrivatePage() {
    const serial = ++pageSerial;
    if (page === 'account') {
      if (!state.member) { $('#my-orders').innerHTML = '<p>Sign in to see your orders.</p>'; return; }
      try { const orders = await api('/orders'); if (serial === pageSerial) $('#my-orders').innerHTML = orderTable(orders, false); } catch (error) { if (serial === pageSerial) $('#my-orders').textContent = error.message; }
      return;
    }
    if (page !== 'admin') return;
    $('#admin-content').classList.toggle('is-locked', !state.member || state.member.role !== 'admin');
    if (!state.member || state.member.role !== 'admin') { $('#admin-content').innerHTML = `<section class="panel"><h1>Admin Panel</h1><p>${state.member ? 'Administrator access is required.' : 'Sign in with the shop administrator account.'}</p><a class="orange-button" href="${state.setupRequired ? 'register.html' : 'login.html'}">${state.setupRequired ? 'CREATE OWNER ACCOUNT' : 'SIGN IN'}</a></section>`; return; }
    if (!$('#add-product-form')) {
      $('#admin-content').innerHTML = `<aside class="admin-form-panel">${productForm(null, 'add-product-form')}</aside><section><div class="admin-tabs"><button data-admin-tab="products">Products</button><button data-admin-tab="orders">Orders</button><button data-admin-tab="users">Users</button></div><div id="admin-table"></div></section>`;
    }
    document.querySelectorAll('[data-admin-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.adminTab === adminTab)));
    if (adminTab === 'products') {
      $('#admin-table').innerHTML = `<div class="table-scroll"><table><thead><tr><th>Product Image</th><th>Product Name</th><th>Product Price</th><th>Category</th><th>Action</th></tr></thead><tbody>${state.products.map(p => `<tr><td>${imageTag(p)}</td><td>${escape(p.name)}</td><td>${money(p.price)}</td><td>${escape(p.category)}</td><td><button class="row-action" data-edit-product="${p.id}">Edit</button><button class="row-action delete" data-delete-product="${p.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
    } else {
      try {
        const data = await api(adminTab === 'orders' ? '/orders?all=1' : '/api/users');
        if (serial !== pageSerial) return;
        $('#admin-table').innerHTML = adminTab === 'orders' ? orderTable(data, true) : `<div class="table-scroll"><table><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Action</th></tr></thead><tbody>${data.map(u => `<tr><td>${escape(u.username)}</td><td>${escape(u.name)}</td><td>${escape(u.role)}</td><td>${u.id === state.member.id ? '<a href="account.html">Your Profile</a>' : `<button class="row-action" data-edit-user="${escape(u.id)}">Edit</button><button class="row-action delete" data-delete-user="${escape(u.id)}">Delete</button>`}</td></tr>`).join('')}</tbody></table></div>`;
      } catch (error) { if (serial === pageSerial) $('#admin-table').textContent = error.message; }
    }
  }
  function productForm(p, id) {
    return `<form id="${id}" class="product-form" ${p ? `data-product-id="${p.id}"` : ''}><img class="product-preview" src="${escape(p ? imageURL(p.image) : 'Coffee.png')}" alt="Product preview"><label class="file-upload">Upload Image<input type="file" name="imageFile" accept="image/png,image/jpeg,image/webp" aria-label="Upload product image"></label><label>Product Image URL<input name="image" value="${escape(p?.image || '')}" placeholder="Image URL or filename" ${p ? '' : 'required'}></label><label>Product Name<input name="name" value="${escape(p?.name || '')}" required maxlength="100"></label><label>Product Price<input name="price" type="number" min="0.01" max="1000000" step="0.01" value="${p?.price ?? ''}" required></label><label>Product Category<select name="category">${[...new Set([...categories, ...state.products.map(p => p.category)])].map(c => `<option ${c === p?.category ? 'selected' : ''}>${escape(c)}</option>`).join('')}</select></label><p class="form-error" role="status"></p><button class="orange-button">${p ? 'UPDATE' : 'ADD PRODUCT'}</button></form>`;
  }
  function openEditor(content) { $('#editor-content').innerHTML = content; $('#editor-dialog').showModal(); }
  function renderReviews() {
    const examples = [
      { name: 'Johnny Sins', photo: 'assets/reviews/johnny-sins.jpg', demo: true, rating: 5, body: 'Step Brew is my daily ritual for the perfect cup of coffee. The aroma, the warmth, and the friendly faces behind the counter make it more than just a coffee shop. It’s my morning sanctuary, and I can’t imagine starting my day without a “What are you doing, Step Brew?” moment.' },
      { name: 'Lana Rhoades', photo: 'assets/reviews/lana-rhoades.jpg', demo: true, rating: 4, body: 'Step Brew isn’t just about coffee; it’s about the experience. The baristas at Step Brew are artists, turning every cup into a masterpiece. From the first sip to the last drop, it’s evident that they take pride in crafting the perfect brew. Steep in, savor the flavor, and you’ll understand.' },
      { name: 'Lily Adams', photo: 'assets/reviews/lily-adams.jpg', demo: true, rating: 4, body: 'As a coffee enthusiast, I’ve tried numerous coffee shops, but Step Brew stands out. The attention to detail, the cozy atmosphere, and the diverse menu make it my top choice. What are you doing, Step Brew? Answering that question means enjoying the best coffee in town.' },
      { name: 'AJ Raval', photo: 'assets/reviews/aj-raval.jpg', demo: true, rating: 5, body: 'Step Brew has this magical ability to turn a regular coffee break into a memorable experience. The rich flavors and the friendly staff create a welcoming vibe. What are you doing, Step Brew? I’m enjoying a cup of perfection and a moment of tranquility in the heart of the city.' }
    ];
    $('#reviews-list').innerHTML = [...state.reviews, ...examples].map(r => `<article class="review-card">${r.photo ? `<img class="review-avatar" src="${escape(r.photo)}" alt="${escape(r.name)}" loading="lazy">` : `<div class="review-avatar" aria-hidden="true">${escape(r.name.split(' ').slice(0, 2).map(n => n[0]).join(''))}</div>`}<h3>${escape(r.name)}</h3>${r.demo ? '<small class="demo-review-label">Demo review</small>' : ''}<div class="stars" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><p>“${escape(r.body)}”</p></article>`).join('');
  }
  function renderReviewForm() {
    $('#review-form-slot').innerHTML = state.member ? '<form id="review-form" class="review-form"><h3>Share your Step Brew experience</h3><label>Rating<select name="rating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></label><label>Your review<textarea name="body" maxlength="600" required></textarea></label><p class="form-error" role="status"></p><button class="orange-button">POST REVIEW</button></form>' : '<p style="text-align:center"><a href="login.html">Sign in to share your experience.</a></p>';
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('button, [data-team]'); if (!button) return;
    try {
      const action = button.dataset.action;
      if (action === 'open-bag') openBag();
      if (action === 'close-bag') closeBag();
      if (action === 'close-dialog') $('#editor-dialog').close();
      if (action === 'close-order') $('#order-dialog').close();
      if (action === 'logout') { button.disabled = true; await api('/api/auth/logout', 'POST', {}); await refresh(); toast('You have signed out.'); }
      if (button.dataset.add) { await changeCart(Number(button.dataset.add), 1); if (!cartBusy) toast('Added to your bag.'); }
      if (button.dataset.delta) await changeCart(Number(button.dataset.id), Number(button.dataset.delta));
      if (button.dataset.category) { category = button.dataset.category; renderProducts(); }
      if (button.id === 'clear-filter') { category = ''; search = ''; $('#searchBar').value = ''; renderProducts(); }
      if (button.dataset.adminTab) { adminTab = button.dataset.adminTab; await renderPrivatePage(); }
      if (button.dataset.editProduct) { const p = state.products.find(p => p.id === Number(button.dataset.editProduct)); if (p) openEditor(productForm(p, 'edit-product-form')); }
      if (button.dataset.deleteProduct) { const p = state.products.find(p => p.id === Number(button.dataset.deleteProduct)); if (p) openEditor(`<h2>Delete ${escape(p.name)}?</h2><p>This removes the product from the menu.</p><button class="orange-button" data-confirm-product="${p.id}">DELETE PRODUCT</button>`); }
      if (button.dataset.confirmProduct) { button.disabled = true; await api('/update-products/' + button.dataset.confirmProduct, 'DELETE'); $('#editor-dialog').close(); await refresh(); toast('Product deleted.'); }
      if (button.dataset.editUser) {
        const users = await api('/api/users'), u = users.find(u => u.id === button.dataset.editUser);
        if (u) openEditor(`<h2>Edit ${escape(u.username)}</h2><form id="edit-user-form" class="profile-form" data-id="${escape(u.id)}"><label>First Name<input name="firstName" value="${escape(u.firstName)}" required></label><label>Middle Name<input name="middleName" value="${escape(u.middleName)}"></label><label>Last Name<input name="lastName" value="${escape(u.lastName)}"></label><label>Birthdate<input type="date" name="dateOfBirth" value="${escape(u.dateOfBirth)}"></label><label>Role<select name="role"><option ${u.role === 'customer' ? 'selected' : ''}>customer</option><option ${u.role === 'admin' ? 'selected' : ''}>admin</option></select></label><p class="form-error" role="status"></p><button class="orange-button">SAVE USER</button></form>`);
      }
      if (button.dataset.deleteUser) openEditor(`<h2>Delete this account?</h2><p>The user will no longer be able to sign in.</p><button class="orange-button" data-confirm-user="${escape(button.dataset.deleteUser)}">DELETE USER</button>`);
      if (button.dataset.confirmUser) { button.disabled = true; await api('/api/users/' + button.dataset.confirmUser, 'DELETE'); $('#editor-dialog').close(); await refresh(); toast('User deleted.'); }
      if (button.dataset.team) { const card = button.closest('.team-card'); openEditor(`<h2>${escape(card.querySelector('h3').textContent)}</h2><p>${escape(card.querySelector('p').textContent)}</p><p>Original Chilli Garlic Oil (CGO) Step Brew project team.</p>`); }
    } catch (error) { button.disabled = false; toast(error.message); }
  });
  $('#place-order').addEventListener('click', async () => {
    if (!state.member) { location.href = 'login.html?next=cart.html'; return; }
    if (orderBusy || !cart().length) return;
    orderBusy = true; renderBag(); requestId ||= crypto.randomUUID();
    try {
      const order = await api('/orders', 'POST', { requestId, items: cart() });
      requestId = ''; await refresh(); closeBag();
      $('#order-reference').textContent = `Order ${order.id.slice(0, 8)} · ${money(order.total)} · Pay on pickup`;
      $('#order-dialog').showModal();
    } catch (error) { $('#bag-message').textContent = error.message; }
    finally { orderBusy = false; renderBag(); }
  });
  document.addEventListener('submit', async event => {
    const form = event.target; event.preventDefault(); if (form.id === 'search-form') return;
    const submit = form.querySelector('button[type="submit"], button.orange-button'); if (!submit || submit.disabled) return;
    submit.disabled = true; const message = form.querySelector('.form-error'); if (message) message.textContent = '';
    try {
      const data = Object.fromEntries(new FormData(form));
      if (form.id === 'auth-form') {
        await api('/api/auth/' + form.dataset.mode, 'POST', { username: data.username, password: data.password });
        const pending = readGuest();
        if (pending.length) { await api('/api/cart/merge', 'POST', { items: pending }); guest = []; saveGuest(); }
        await refresh(); const next = new URLSearchParams(location.search).get('next');
        location.href = ['cart.html', 'Menu.html', 'account.html', 'admin.html'].includes(next) ? next : state.member.role === 'admin' ? 'admin.html' : 'ProductPage.html';
      } else if (form.classList.contains('product-form')) {
        await api(form.dataset.productId ? '/update-products/' + form.dataset.productId : '/update-products', form.dataset.productId ? 'PUT' : 'POST', { name: data.name, image: data.image, price: Number(data.price), category: data.category });
        if (form.dataset.productId) $('#editor-dialog').close(); else { form.reset(); form.querySelector('.product-preview').src = 'Coffee.png'; }
        await refresh(); toast('Product saved. All open pages have been updated.');
      } else if (form.id === 'profile-form' || form.id === 'edit-user-form') {
        await api(form.id === 'profile-form' ? '/api/profile' : '/api/users/' + form.dataset.id, 'PUT', { ...data, avatar: '' });
        if (form.id === 'edit-user-form') $('#editor-dialog').close(); await refresh(); toast('Profile saved.');
      } else if (form.id === 'review-form') { await api('/api/reviews', 'POST', { rating: Number(data.rating), body: data.body }); form.reset(); await refresh(); toast('Review posted.'); }
    } catch (error) { if (message) message.textContent = error.message; else toast(error.message); }
    finally { submit.disabled = false; }
  });
  document.addEventListener('change', async event => {
    const input = event.target;
    if (input.name === 'imageFile' && input.files[0]) {
      const form = input.closest('form'), file = input.files[0], message = form.querySelector('.form-error'), submit = form.querySelector('.orange-button');
      submit.disabled = true;
      try {
        if (file.size > 500000) throw new Error('Choose a product image under 500 KB.');
        const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        const result = await api('/api/uploads', 'POST', { data });
        form.elements.image.value = result.image; form.querySelector('.product-preview').src = result.image; message.textContent = '';
      } catch (error) { message.textContent = error.message; }
      finally { submit.disabled = false; }
    }
    if (input.dataset.order) { try { await api('/orders/' + input.dataset.order, 'PATCH', { status: input.value }); toast('Order status updated.'); } catch (error) { toast(error.message); await refresh(); } }
    if (input.name === 'image') input.closest('form').querySelector('.product-preview').src = imageURL(input.value);
  });
  $('#searchBar')?.addEventListener('input', event => { search = event.target.value; renderProducts(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeBag(); });
  window.addEventListener('storage', event => { if (event.key === guestKey || event.key === null) { guest = readGuest(); renderBag(); } });
  window.addEventListener('pageshow', refresh); window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  const events = new EventSource('/events'); events.addEventListener('ready', refresh); events.addEventListener('state-changed', refresh);
  renderFooter(); renderTeamSocials(); renderHeader(); refresh().then(() => { if (page === 'cart') openBag(); });
})();
