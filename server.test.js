const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { createServer } = require('./server');

async function setup(t) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'step-brew-api-'));
  const server = createServer({ dataDir }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); fs.rmSync(dataDir, { recursive: true, force: true }); });
  const client = () => {
    let cookie = '';
    const request = async (route, method = 'GET', data, headers = {}) => {
      const response = await fetch(url + route, { method, headers: { ...(data === undefined ? {} : { 'Content-Type': 'application/json' }), Cookie: cookie, ...headers }, body: data === undefined ? undefined : JSON.stringify(data) });
      if (response.headers.has('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
      return response;
    };
    const register = async username => { const r = await request('/api/auth/register', 'POST', { username, password: 'Testing-Password-17!' }); assert.equal(r.status, 201); return r.json(); };
    return { request, register, cookie: () => cookie };
  };
  return { server, dataDir, url, client };
}

test('registration and login use one account store; public responses exclude password hashes', async t => {
  const { client, dataDir } = await setup(t); const owner = client();
  const admin = await owner.register('shopowner'); assert.equal(admin.role, 'admin'); assert.equal(admin.firstName, 'shopowner');
  assert.equal(admin.hash, undefined); assert.equal(admin.salt, undefined);
  const customer = client(); const member = await customer.register('regularcustomer'); assert.equal(member.role, 'customer');
  assert.equal((await customer.request('/api/auth/register', 'POST', { username: 'shopowner', password: 'Testing-Password-17!' })).status, 409);
  assert.equal((await customer.request('/api/auth/login', 'POST', { username: 'regularcustomer', password: 'incorrect' })).status, 401);
  assert.equal((await customer.request('/api/auth/login', 'POST', { username: 'regularcustomer', password: 'Testing-Password-17!' })).status, 200);
  const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'))); assert.equal(users[0].password, undefined); assert.ok(users[0].hash); assert.notEqual(users[0].hash, 'Testing-Password-17!');
  const state = await (await customer.request('/api/state')).json(); assert.equal(state.member.id, member.id);
  await customer.request('/api/auth/logout', 'POST', {}); assert.equal((await (await customer.request('/api/state')).json()).member, null);
});

test('admin routes enforce server roles; a username starting with admin does not grant access', async t => {
  const { client } = await setup(t); const owner = client(); await owner.register('owner');
  const customer = client(); await customer.register('admin_imposter');
  const product = { name: 'Test Latte', image: 'HAmericano.png', price: 95.5, category: 'Hot Drinks' };
  assert.equal((await client().request('/update-products', 'POST', product)).status, 401);
  assert.equal((await customer.request('/update-products', 'POST', product)).status, 403);
  assert.equal((await customer.request('/api/users')).status, 403);
  assert.equal((await owner.request('/update-products', 'POST', product, { Origin: 'https://example.com' })).status, 403);
  const response = await owner.request('/update-products', 'POST', product); assert.equal(response.status, 201); const added = await response.json();
  assert.equal((await owner.request('/update-products/' + added.id, 'PUT', { ...product, price: 99.25 })).status, 200);
  assert.equal((await owner.request('/update-products/' + added.id, 'DELETE')).status, 200);
  const products = await (await customer.request('/update-products')).json(); assert.ok(!products.some(p => p.id === added.id));
});

test('cart persists by account and concurrent changes retain quantities; accounts stay isolated', async t => {
  const { client } = await setup(t); const a = client(); await a.register('owner'); const b = client(); await b.register('customer');
  await a.request('/api/cart/merge', 'POST', { items: [{ id: 1, quantity: 2 }] });
  const results = await Promise.all(Array.from({ length: 5 }, () => a.request('/api/cart', 'POST', { id: 1, delta: 1 }))); assert.ok(results.every(r => r.status === 200));
  assert.deepEqual(await (await a.request('/api/cart')).json(), [{ id: 1, quantity: 7 }]);
  assert.deepEqual(await (await b.request('/api/cart')).json(), []);
  await a.request('/api/cart', 'POST', { id: 1, delta: -1 }); assert.equal((await (await a.request('/api/cart')).json())[0].quantity, 6);
  assert.equal((await b.request('/api/cart', 'POST', { id: 9999, delta: 1 })).status, 400);
});

test('sessions and saved carts survive a server restart', async t => {
  const { server, client, dataDir } = await setup(t); const owner = client(); const user = await owner.register('owner');
  await owner.request('/api/cart', 'POST', { id: 12, delta: 1 }); const cookie = owner.cookie();
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  const restarted = createServer({ dataDir }); restarted.listen(0, '127.0.0.1'); await once(restarted, 'listening');
  try { const response = await fetch(`http://127.0.0.1:${restarted.address().port}/api/state`, { headers: { Cookie: cookie } }); const state = await response.json(); assert.equal(state.member.id, user.id); assert.deepEqual(state.cart, [{ id: 12, quantity: 1 }]); }
  finally { restarted.closeAllConnections(); await new Promise(resolve => restarted.close(resolve)); }
});

test('checkout calculates saved prices, is idempotent, clears purchased items and protects order ownership', async t => {
  const { client } = await setup(t); const owner = client(); await owner.register('owner'); const buyer = client(); await buyer.register('buyer'); const stranger = client(); await stranger.register('otherbuyer');
  await buyer.request('/api/cart/merge', 'POST', { items: [{ id: 1, quantity: 2 }, { id: 12, quantity: 3 }] });
  const body = { requestId: 'test-order-once', items: [{ id: 1, quantity: 2, price: 0 }, { id: 12, quantity: 3 }], total: 0 };
  const response = await buyer.request('/orders', 'POST', body); assert.equal(response.status, 201); const order = await response.json(); assert.equal(order.total, 466.25);
  const repeated = await buyer.request('/orders', 'POST', body); assert.equal(repeated.status, 200); assert.equal((await repeated.json()).id, order.id);
  assert.deepEqual(await (await buyer.request('/api/cart')).json(), []);
  assert.equal((await (await buyer.request('/orders')).json()).length, 1); assert.deepEqual(await (await stranger.request('/orders?all=1')).json(), []);
  assert.equal((await stranger.request('/orders/' + order.id, 'PATCH', { status: 'Completed' })).status, 403);
  assert.equal((await owner.request('/orders/' + order.id, 'PATCH', { status: 'Ready for pickup' })).status, 200);
  assert.equal((await (await buyer.request('/orders')).json())[0].status, 'Ready for pickup');
  assert.equal((await (await owner.request('/orders?all=1')).json()).length, 1);
});

test('live events notify open pages after product and cart mutations', async t => {
  const { client, url } = await setup(t); const owner = client(); await owner.register('owner');
  const controller = new AbortController(); const response = await fetch(url + '/events', { signal: controller.signal });
  const reader = response.body.getReader(); assert.match(new TextDecoder().decode((await reader.read()).value), /event: ready/);
  await owner.request('/update-products', 'POST', { name: 'Live Latte', image: 'HAmericano.png', price: 50, category: 'Hot Drinks' });
  assert.match(new TextDecoder().decode((await reader.read()).value), /state-changed/);
  await owner.request('/api/cart', 'POST', { id: 1, delta: 1 });
  assert.match(new TextDecoder().decode((await reader.read()).value), /state-changed/);
  controller.abort();
});

test('profile, user management and reviews use saved account data without exposing credentials', async t => {
  const { client } = await setup(t); const owner = client(); const admin = await owner.register('owner'); const buyer = client(); const customer = await buyer.register('buyer');
  assert.equal((await buyer.request('/api/profile', 'PUT', { firstName: 'Juan', lastName: 'Cruz', middleName: '', dateOfBirth: '' })).status, 200);
  assert.equal((await owner.request('/api/users/' + customer.id, 'PUT', { firstName: 'Juan', lastName: 'Cruz', role: 'customer' })).status, 200);
  assert.equal((await buyer.request('/api/reviews', 'POST', { rating: 5, body: 'Great coffee!' })).status, 201);
  assert.equal((await (await owner.request('/api/state')).json()).reviews[0].name, 'Juan Cruz');
  assert.equal((await owner.request('/api/users/' + admin.id, 'DELETE')).status, 400);
  const users = await (await owner.request('/api/users')).json(); assert.ok(users.every(u => !u.hash && !u.salt));
  await owner.request('/api/users/' + customer.id, 'DELETE'); assert.equal((await buyer.request('/orders')).status, 401);
});

test('invalid input preserves saved data and private files cannot be downloaded', async t => {
  const { client, url, dataDir } = await setup(t); const owner = client(); await owner.register('owner');
  const before = fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8');
  for (const price of [-1, 0, 5.111, '50', null]) assert.equal((await owner.request('/update-products', 'POST', { name: 'Invalid', image: 'HAmericano.png', category: 'Hot Drinks', price })).status, 400);
  assert.equal(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'), before);
  for (const route of ['/server.js', '/data/users.json', '/seed-products.json', '/.git/config', '/%2e%2e%2fserver.js', '/assets/no-file.png']) assert.equal((await fetch(url + route)).status, 404, route);
  for (const route of ['/', '/login.html', '/register.html', '/Menu.html', '/About.html', '/admin.html', '/app.js', '/app.css', '/img/HLatte%20Macchiato.png']) assert.equal((await fetch(url + route)).status, 200, route);
});

test('old preview and legacy menu links always lead to the connected project', async t => {
  const { createPreviewRedirectServer } = require('./server');
  const { url } = await setup(t);
  const preview = createPreviewRedirectServer(url);
  preview.listen(0, '127.0.0.1'); await once(preview, 'listening');
  const legacy = `http://127.0.0.1:${preview.address().port}`;
  t.after(async () => { preview.closeAllConnections(); await new Promise(resolve => preview.close(resolve)); });
  for (const [old, current] of [
    ['/STEP%20BREW%2011-15-2023/ProductPage.html', '/ProductPage.html'],
    ['/STEP%20BREW%2011-15-2023/Menu.html', '/Menu.html'],
    ['/STEP%20BREW%2011-15-2023/review.html', '/About.html#experiences'],
    ['/REG_LOGIN_ADMIN_DASHBOARD/index.html', '/login.html']
  ]) {
    const response = await fetch(legacy + old, { redirect: 'manual' });
    assert.equal(response.status, 302); assert.equal(response.headers.get('location'), url + current);
  }
  const nested = await fetch(url + '/WEBDEV_FINAL%20PROJECT/STEP%20BREW/Menu.html', { redirect: 'manual' });
  assert.equal(nested.status, 302); assert.equal(nested.headers.get('location'), '/Menu.html');
  assert.equal((await fetch(url + '/MenuK.html')).status, 200);
  assert.equal((await fetch(url + '/StyleK.css')).status, 404);
});
