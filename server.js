const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const root = __dirname;
const publicRoot = path.join(root, 'WEBDEV_FINAL PROJECT', 'connected');
const assetRoot = path.join(publicRoot, 'assets', 'original');
const fail = (status, message) => Object.assign(new Error(message), { status });
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
function read(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT' && fallback !== undefined) return fallback; throw e; } }
function save(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file + '.tmp', JSON.stringify(value, null, 2) + '\n'); fs.renameSync(file + '.tmp', file); }
function text(value, label, max = 100) { if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw fail(400, `${label} is required (maximum ${max} characters).`); return value.trim(); }
function product(value, id) {
  if (!value || typeof value !== 'object') throw fail(400, 'Invalid product.');
  const result = { id, name: text(value.name, 'Name'), image: text(value.image, 'Image', 1000), category: text(value.category, 'Category', 50), price: value.price };
  if (!/^(https?:\/\/|\/assets\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)$|\/?(?:img\/)?[^:/\\]+$)/i.test(result.image) || result.image.includes('..')) throw fail(400, 'Use an http(s) image URL or a local image filename.');
  if (typeof result.price !== 'number' || !Number.isFinite(result.price) || result.price <= 0 || result.price > 1000000 || Math.abs(result.price * 100 - Math.round(result.price * 100)) > .00001) throw fail(400, 'Use a positive price with up to two decimal places.');
  return result;
}
function profile(value) {
  const firstName = text(value.firstName || value.username, 'First name', 60), lastName = typeof value.lastName === 'string' ? value.lastName.trim().slice(0, 60) : '';
  const middleName = typeof value.middleName === 'string' ? value.middleName.trim().slice(0, 60) : '';
  const dateOfBirth = value.dateOfBirth || '';
  if (dateOfBirth && (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || Number.isNaN(Date.parse(dateOfBirth)) || dateOfBirth > new Date().toISOString().slice(0, 10))) throw fail(400, 'Use a valid birthdate.');
  const avatar = value.avatar || '';
  if (typeof avatar !== 'string' || avatar.length > 700000 || avatar && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar)) throw fail(400, 'Choose a JPG, PNG, or WebP profile photo under 500 KB.');
  return { firstName, middleName, lastName, dateOfBirth, avatar, name: [firstName, middleName, lastName].filter(Boolean).join(' ') };
}
async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw fail(400, 'Use a password with 8–128 characters.');
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: (await scrypt(password, salt, 64)).toString('hex') };
}
async function body(request) {
  if (!request.headers['content-type']?.startsWith('application/json')) throw fail(415, 'Use application/json.');
  let bytes = 0; const chunks = [];
  for await (const chunk of request) { bytes += chunk.length; if (bytes > 1100000) throw fail(413, 'Request is too large.'); chunks.push(chunk); }
  try { const value = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!value || typeof value !== 'object') throw new Error(); return value; }
  catch { throw fail(400, 'Invalid JSON.'); }
}
const publicUser = user => user ? Object.fromEntries(Object.entries(user).filter(([key]) => !['salt', 'hash'].includes(key))) : null;

function legacyDestination(pathname) {
  const name = path.posix.basename(decodeURIComponent(pathname)).toLowerCase();
  return ({
    'productpage.html': '/ProductPage.html', 'menu.html': '/Menu.html',
    'menu1.html': '/Menu.html', 'menuk.html': '/Menu.html',
    'about.html': '/About.html', 'review.html': '/About.html#experiences',
    'reviews.html': '/About.html#experiences', 'index.html': '/login.html',
    'login.html': '/login.html', 'register.html': '/register.html',
    'profile.html': '/account.html', 'account.html': '/account.html',
    'admindashboard.html': '/admin.html', 'admin.html': '/admin.html',
    'crud.html': '/admin.html', 'cart.html': '/cart.html'
  })[name] || '/ProductPage.html';
}

function createPreviewRedirectServer(origin = 'http://127.0.0.1:8000') {
  return http.createServer((request, response) => {
    try {
      const target = legacyDestination(new URL(request.url, origin).pathname);
      response.writeHead(302, { Location: origin + target, 'Cache-Control': 'no-store' });
      response.end();
    } catch {
      response.writeHead(400); response.end('Invalid preview URL.');
    }
  });
}

function createServer({ dataDir = path.join(publicRoot, 'data') } = {}) {
  const file = name => path.join(dataDir, `${name}.json`);
  if (!fs.existsSync(file('products'))) save(file('products'), read(path.join(publicRoot, 'seed-products.json')));
  const clients = new Set();
  const attempts = new Map();
  const notify = () => { for (const response of clients) response.write('event: state-changed\ndata: {}\n\n'); };
  const catalogue = () => read(file('products'));
  const validCart = cart => {
    const available = new Set(catalogue().map(p => p.id));
    return (Array.isArray(cart) ? cart : []).filter(item => item && available.has(item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99).map(({ id, quantity }) => ({ id, quantity }));
  };
  const getCart = id => validCart(read(file('carts'), {})[id] || []);
  const setCart = (id, cart) => { const carts = read(file('carts'), {}); carts[id] = validCart(cart); save(file('carts'), carts); notify(); return carts[id]; };
  const server = http.createServer(async (request, response) => {
    const json = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(data)); };
    try {
      const url = new URL(request.url, `http://${request.headers.host}`), route = url.pathname, method = request.method;
      if (request.headers.origin && request.headers.origin !== url.origin) throw fail(403, 'Cross-origin requests are not allowed.');
      const token = request.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('stepbrew_session='))?.slice(17);
      const tokenKey = token ? crypto.createHash('sha256').update(token).digest('hex') : '';
      const sessions = read(file('sessions'), {});
      const session = sessions[tokenKey];
      const users = read(file('users'), []);
      const user = session && session.expires > Date.now() ? users.find(u => u.id === session.userId) : null;
      const signedIn = () => { if (!user) throw fail(401, 'Please sign in to continue.'); return user; };
      const admin = () => { signedIn(); if (user.role !== 'admin') throw fail(403, 'Administrator access required.'); };
      const setSession = account => {
        const token = crypto.randomBytes(32).toString('hex');
        // Read again after password hashing, so concurrent logins retain both sessions.
        const sessions = read(file('sessions'), {});
        for (const key in sessions) if (sessions[key].expires <= Date.now()) delete sessions[key];
        sessions[crypto.createHash('sha256').update(token).digest('hex')] = { userId: account.id, expires: Date.now() + 7 * 86400000 };
        save(file('sessions'), sessions);
        response.setHeader('Set-Cookie', `stepbrew_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`);
        notify();
      };
      if (route === '/events' && method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        response.write('event: ready\ndata: {}\n\n'); clients.add(response);
        const heartbeat = setInterval(() => response.write(': heartbeat\n\n'), 15000);
        request.on('close', () => { clearInterval(heartbeat); clients.delete(response); });
        return;
      }
      if (route === '/api/state' && method === 'GET') return json(200, { products: catalogue(), member: publicUser(user), cart: user ? getCart(user.id) : null, reviews: read(file('reviews'), []), setupRequired: !users.length });
      if (['/api/auth/register', '/api/auth/login'].includes(route) && method === 'POST') {
        const ip = request.socket.remoteAddress, now = Date.now();
        for (const [key, limit] of attempts) if (limit.reset < now) attempts.delete(key);
        const limit = attempts.get(ip) || { count: 0, reset: now + 15 * 60000 }; attempts.set(ip, limit);
        if (++limit.count > 30) throw fail(429, 'Too many sign-in attempts. Please try again later.');
        const value = await body(request), username = text(value.username, 'User ID', 32).toLowerCase();
        if (!/^[a-z0-9_.-]{3,32}$/.test(username)) throw fail(400, 'User ID must use 3–32 letters, numbers, dots, underscores, or hyphens.');
        if (route.endsWith('register')) {
          const details = profile(value), credentials = await passwordHash(value.password);
          const latest = read(file('users'), []);
          if (latest.some(u => u.username === username)) throw fail(409, 'This User ID is already taken.');
          const account = { id: crypto.randomUUID(), username, ...details, ...credentials, role: latest.length ? 'customer' : 'admin', createdAt: new Date().toISOString() };
          latest.push(account); save(file('users'), latest); setSession(account); return json(201, publicUser(account));
        }
        if (typeof value.password !== 'string' || value.password.length > 128) throw fail(400, 'Invalid password.');
        const account = read(file('users'), []).find(u => u.username === username);
        const candidate = await scrypt(value.password, account?.salt || 'stepbrew-nonexistent', 64);
        if (!account || !crypto.timingSafeEqual(candidate, Buffer.from(account.hash, 'hex'))) throw fail(401, 'User ID or password is incorrect.');
        limit.count = 0; setSession(account); return json(200, publicUser(account));
      }
      if (route === '/api/auth/logout' && method === 'POST') {
        const latest = read(file('sessions'), {}); delete latest[tokenKey]; save(file('sessions'), latest);
        response.setHeader('Set-Cookie', 'stepbrew_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); notify(); return json(200, { ok: true });
      }
      if (route === '/api/profile' && method === 'PUT') {
        signedIn(); const details = profile(await body(request)); const index = users.findIndex(u => u.id === user.id);
        users[index] = { ...users[index], ...details }; save(file('users'), users); notify(); return json(200, publicUser(users[index]));
      }
      if (route === '/api/cart' && method === 'GET') { signedIn(); return json(200, getCart(user.id)); }
      if (route === '/api/cart' && method === 'POST') {
        signedIn(); const value = await body(request);
        if (!catalogue().some(p => p.id === value.id) || !Number.isInteger(value.delta) || ![-1, 1].includes(value.delta)) throw fail(400, 'Invalid bag change.');
        let cart = getCart(user.id); const entry = cart.find(i => i.id === value.id);
        if (entry) entry.quantity = Math.min(99, entry.quantity + value.delta);
        else if (value.delta > 0) cart.push({ id: value.id, quantity: 1 });
        return json(200, setCart(user.id, cart.filter(i => i.quantity > 0)));
      }
      if (route === '/api/cart/merge' && method === 'POST') {
        signedIn(); const value = await body(request);
        if (!Array.isArray(value.items) || value.items.length > 1000) throw fail(400, 'Invalid bag.');
        const cart = getCart(user.id), seen = new Set();
        for (const item of validCart(value.items)) {
          if (seen.has(item.id)) continue; seen.add(item.id);
          const entry = cart.find(i => i.id === item.id);
          if (entry) entry.quantity = Math.min(99, entry.quantity + item.quantity); else cart.push(item);
        }
        return json(200, setCart(user.id, cart));
      }
      if (route === '/update-products' && method === 'GET') return json(200, catalogue());
      if (route === '/update-products' && method === 'POST') {
        admin(); const value = await body(request), products = catalogue(); const p = product(value, Math.max(0, ...products.map(p => p.id)) + 1);
        products.push(p); save(file('products'), products); notify(); return json(201, p);
      }
      const productRoute = route.match(/^\/update-products\/(\d+)$/);
      if (productRoute && ['PUT', 'DELETE'].includes(method)) {
        admin(); const value = method === 'PUT' ? await body(request) : null, products = catalogue(), index = products.findIndex(p => p.id === Number(productRoute[1]));
        if (index < 0) throw fail(404, 'Product not found.');
        const updated = value ? product(value, products[index].id) : null;
        if (updated) products[index] = updated; else products.splice(index, 1);
        save(file('products'), products); notify(); return json(200, updated || { ok: true });
      }
      if (route === '/api/uploads' && method === 'POST') {
        admin(); const value = await body(request);
        const match = typeof value.data === 'string' && value.data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
        if (!match) throw fail(400, 'Choose a PNG, JPG, or WebP image.');
        const bytes = Buffer.from(match[2], 'base64');
        if (!bytes.length || bytes.length > 500000) throw fail(400, 'Choose an image under 500 KB.');
        const valid = match[1] === 'png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
        if (!valid) throw fail(400, 'The file does not match its image type.');
        const name = crypto.randomUUID() + '.' + (match[1] === 'jpeg' ? 'jpg' : match[1]);
        const directory = path.join(publicRoot, 'assets', 'uploads'); fs.mkdirSync(directory, {recursive:true}); fs.writeFileSync(path.join(directory,name),bytes);
        return json(201, { image: '/assets/uploads/' + name });
      }
      if (route === '/api/users' && method === 'GET') { admin(); return json(200, users.map(publicUser)); }
      const userRoute = route.match(/^\/api\/users\/([a-f0-9-]+)$/);
      if (userRoute && ['PUT', 'DELETE'].includes(method)) {
        admin(); const value = method === 'PUT' ? await body(request) : null, index = users.findIndex(u => u.id === userRoute[1]);
        if (index < 0) throw fail(404, 'User not found.');
        if (users[index].id === user.id) throw fail(400, 'Update your own details on the Profile page. You cannot remove your own account here.');
        if (value) { const details = profile(value); if (!['admin', 'customer'].includes(value.role)) throw fail(400, 'Invalid role.'); users[index] = { ...users[index], ...details, role: value.role }; }
        const updated = value ? publicUser(users[index]) : { ok: true };
        if (!value) users.splice(index, 1);
        save(file('users'), users); notify(); return json(200, updated);
      }
      if (route === '/orders' && method === 'GET') { signedIn(); return json(200, read(file('orders'), []).filter(o => user.role === 'admin' && url.searchParams.get('all') === '1' || o.userId === user.id).reverse()); }
      if (route === '/orders' && method === 'POST') {
        signedIn(); const value = await body(request), requestId = text(value.requestId, 'Order reference', 80);
        const orders = read(file('orders'), []), existing = orders.find(o => o.userId === user.id && o.requestId === requestId);
        if (existing) return json(200, existing);
        if (!Array.isArray(value.items) || !value.items.length || value.items.length > 1000) throw fail(400, 'Your bag is empty or too large.');
        const products = catalogue(), seen = new Set();
        const items = value.items.map(item => {
          if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw fail(400, 'Quantity must be between 1 and 99.');
          const p = products.find(p => p.id === item.id); if (!p || seen.has(item.id)) throw fail(400, 'A bag item is unavailable or duplicated. Please refresh.');
          seen.add(item.id); return { id: p.id, name: p.name, price: p.price, quantity: item.quantity };
        });
        const order = { id: crypto.randomUUID(), requestId, userId: user.id, customer: user.name, createdAt: new Date().toISOString(), status: 'Brewing', items, total: items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100 };
        orders.push(order); save(file('orders'), orders);
        setCart(user.id, getCart(user.id).map(i => ({ ...i, quantity: i.quantity - (items.find(p => p.id === i.id)?.quantity || 0) })).filter(i => i.quantity > 0));
        return json(201, order);
      }
      const orderRoute = route.match(/^\/orders\/([a-f0-9-]+)$/);
      if (orderRoute && method === 'PATCH') {
        admin(); const value = await body(request); if (!['Brewing', 'Ready for pickup', 'Completed', 'Cancelled'].includes(value.status)) throw fail(400, 'Invalid status.');
        const orders = read(file('orders'), []), order = orders.find(o => o.id === orderRoute[1]); if (!order) throw fail(404, 'Order not found.');
        order.status = value.status; save(file('orders'), orders); notify(); return json(200, order);
      }
      if (route === '/api/reviews' && method === 'POST') {
        signedIn(); const value = await body(request), review = { id: crypto.randomUUID(), name: user.name, body: text(value.body, 'Review', 600), rating: value.rating, createdAt: new Date().toISOString() };
        if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) throw fail(400, 'Choose a rating from 1 to 5.');
        const reviews = read(file('reviews'), []); reviews.unshift(review); save(file('reviews'), reviews); notify(); return json(201, review);
      }
      if (route.startsWith('/api/') || route.startsWith('/update-products') || route.startsWith('/orders')) throw fail(404, 'Not found.');
      if (!['GET', 'HEAD'].includes(method)) throw fail(405, 'Method not allowed.');
      // Reviews are the Experience section of the original About page.
      // Keep old bookmarks on that one shared layout and review source.
      if (['/review.html', '/reviews.html', '/reviews', '/review'].includes(route)) {
        response.writeHead(302, { Location: '/About.html#experiences', 'Cache-Control': 'no-store' });
        return response.end();
      }
      if (/\/(?:WEBDEV_FINAL PROJECT|STEP BREW|REG_LOGIN_ADMIN_DASHBOARD)(?:[ /]|$)/i.test(decodeURIComponent(route))) {
        response.writeHead(302, { Location: legacyDestination(route), 'Cache-Control': 'no-store' });
        return response.end();
      }
      const aliases = { '/': 'ProductPage.html', '/index.html': 'login.html', '/Register.html': 'register.html', '/profile.html': 'account.html', '/adminDashboard.html': 'admin.html', '/cart.html': 'cart.html', '/Menu1.html': 'Menu.html', '/MenuK.html': 'Menu.html', '/crud.html': 'admin.html' };
      const requested = aliases[route] || decodeURIComponent(route).replace(/^\//, '');
      if (requested.split('/').some(part => part.startsWith('.')) || requested.includes('\\') || !types[path.extname(requested).toLowerCase()]) throw fail(404, 'Not found.');
      let served;
      for (const base of [publicRoot, ...(types[path.extname(requested).toLowerCase()].startsWith('image/') ? [assetRoot] : [])]) {
        const candidate = path.resolve(base, requested);
        if (!candidate.startsWith(base + path.sep)) continue;
        if (fs.existsSync(candidate)) { const real = fs.realpathSync(candidate); if (real.startsWith(base + path.sep) && fs.statSync(real).isFile()) { served = real; break; } }
      }
      if (!served) throw fail(404, 'Not found.');
      response.writeHead(200, { 'Content-Type': types[path.extname(served).toLowerCase()], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
      response.end(method === 'HEAD' ? undefined : fs.readFileSync(served));
    } catch (error) {
      if (response.headersSent) return response.end();
      const status = error.status || (['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : error instanceof URIError ? 400 : 500);
      if (status === 500) console.error(error);
      json(status, { error: status === 500 ? 'Unable to load or save data. Please try again.' : error.message });
    }
  });
  server.on('close', () => { for (const client of clients) client.end(); clients.clear(); });
  return server;
}
if (require.main === module) {
  const port = Number(process.env.PORT || 8000);
  createServer().listen(port, '127.0.0.1', () => console.log(`Step Brew running at http://127.0.0.1:${port}`));
  if (port === 8000) {
    const preview = createPreviewRedirectServer();
    preview.on('error', error => console.error(`Unable to redirect the old preview: ${error.message}`));
    preview.listen(8001, '127.0.0.1', () => console.log('Old preview links redirect to the current project.'));
  }
}
module.exports = { createServer, createPreviewRedirectServer };
