const request = require('supertest');
const app = require('../src/app');
const MenuItem = require('../src/models/MenuItem');

let testMenuItem;

const validCustomer = {
  name: 'John Doe',
  address: '123 Main Street, Springfield',
  phone: '+1234567890',
};

beforeEach(async () => {
  testMenuItem = await MenuItem.create({
    name: 'Test Pizza',
    description: 'A delicious test pizza with all the toppings you can imagine',
    price: 12.99,
    image: '/images/test-pizza.jpg',
    category: 'Pizza',
  });
});

const createValidOrder = () => ({
  items: [
    {
      menuItemId: testMenuItem.id,
      name: testMenuItem.name,
      price: testMenuItem.price,
      quantity: 2,
    },
  ],
  customer: { ...validCustomer },
});

describe('Order API', () => {
  describe('POST /api/orders', () => {
    it('creates order with valid data', async () => {
      const res = await request(app).post('/api/orders').send(createValidOrder());
      expect(res.status).toBe(201);
      expect(res.body.order.id).toBeDefined();
      expect(res.body.order.status).toBe('received');
      expect(res.body.order.items).toHaveLength(1);
      expect(res.body.order.customer.name).toBe('John Doe');
      expect(res.body.order.createdAt).toBeDefined();
    });

    it('computes totalAmount correctly on the server', async () => {
      const orderData = createValidOrder();
      orderData.items[0].quantity = 3;
      const res = await request(app).post('/api/orders').send(orderData);
      expect(res.status).toBe(201);
      expect(res.body.order.totalAmount).toBe(38.97);
    });

    it('returns 400 when items array is empty', async () => {
      const res = await request(app).post('/api/orders').send({ items: [], customer: validCustomer });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when customer name is missing', async () => {
      const orderData = createValidOrder();
      delete orderData.customer.name;
      const res = await request(app).post('/api/orders').send(orderData);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when phone format is invalid', async () => {
      const orderData = createValidOrder();
      orderData.customer.phone = 'not-a-phone';
      const res = await request(app).post('/api/orders').send(orderData);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when address is too short', async () => {
      const orderData = createValidOrder();
      orderData.customer.address = 'AB';
      const res = await request(app).post('/api/orders').send(orderData);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when menuItemId does not exist', async () => {
      const orderData = createValidOrder();
      orderData.items[0].menuItemId = '000000000000000000000000';
      const res = await request(app).post('/api/orders').send(orderData);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_MENU_ITEM');
    });

    it('includes customerId in created order', async () => {
      const res = await request(app).post('/api/orders').send(createValidOrder());
      expect(res.status).toBe(201);
      expect(res.body.order.customerId).toBeDefined();
    });

    it('reuses the same customer for the same phone number', async () => {
      const res1 = await request(app).post('/api/orders').send(createValidOrder());
      const res2 = await request(app).post('/api/orders').send(createValidOrder());
      expect(res1.body.order.customerId).toBe(res2.body.order.customerId);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('returns an existing order', async () => {
      const createRes = await request(app).post('/api/orders').send(createValidOrder());
      const orderId = createRes.body.order.id;
      const res = await request(app).get('/api/orders/' + orderId);
      expect(res.status).toBe(200);
      expect(res.body.order.id).toBe(orderId);
      expect(res.body.order.status).toBe('received');
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/000000000000000000000000');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/orders', () => {
    it('returns all orders', async () => {
      await request(app).post('/api/orders').send(createValidOrder());
      await request(app).post('/api/orders').send(createValidOrder());
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(2);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('transitions from received to preparing', async () => {
      const createRes = await request(app).post('/api/orders').send(createValidOrder());
      const orderId = createRes.body.order.id;
      const res = await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'preparing' });
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('preparing');
    });

    it('transitions through full lifecycle', async () => {
      const createRes = await request(app).post('/api/orders').send(createValidOrder());
      const orderId = createRes.body.order.id;
      await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'preparing' });
      await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'out_for_delivery' });
      const res = await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'delivered' });
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('delivered');
    });

    it('returns 400 for invalid status transition (skipping)', async () => {
      const createRes = await request(app).post('/api/orders').send(createValidOrder());
      const orderId = createRes.body.order.id;
      const res = await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'delivered' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('returns 400 for backward transition', async () => {
      const createRes = await request(app).post('/api/orders').send(createValidOrder());
      const orderId = createRes.body.order.id;
      await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'preparing' });
      const res = await request(app).patch('/api/orders/' + orderId + '/status').send({ status: 'received' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app).patch('/api/orders/000000000000000000000000/status').send({ status: 'preparing' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
