const request = require('supertest');
const app = require('../src/app');
const { menuStore } = require('../src/store/menuStore');

const validMenuItem = {
  name: 'Test Pizza',
  description: 'A delicious test pizza with all the toppings you can imagine',
  price: 12.99,
  image: '/images/test-pizza.jpg',
  category: 'Pizza',
};

beforeEach(() => {
  menuStore.clear();
});

describe('Menu API', () => {
  describe('GET /api/menu', () => {
    it('returns an empty array when no items exist', async () => {
      const res = await request(app).get('/api/menu');

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    it('returns all seeded menu items', async () => {
      menuStore.create(validMenuItem);
      menuStore.create({ ...validMenuItem, name: 'Test Burger', category: 'Burger' });

      const res = await request(app).get('/api/menu');

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
    });
  });

  describe('GET /api/menu/:id', () => {
    it('returns a single menu item by ID', async () => {
      const created = menuStore.create(validMenuItem);

      const res = await request(app).get(`/api/menu/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.item.name).toBe('Test Pizza');
      expect(res.body.item.id).toBe(created.id);
    });

    it('returns 404 for non-existent ID', async () => {
      const res = await request(app).get('/api/menu/non_existent_id');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/menu', () => {
    it('creates a new menu item with valid data', async () => {
      const res = await request(app).post('/api/menu').send(validMenuItem);

      expect(res.status).toBe(201);
      expect(res.body.item.name).toBe('Test Pizza');
      expect(res.body.item.price).toBe(12.99);
      expect(res.body.item.id).toBeDefined();
      expect(res.body.item.createdAt).toBeDefined();
    });

    it('returns 400 when name is missing', async () => {
      const { name, ...withoutName } = validMenuItem;

      const res = await request(app).post('/api/menu').send(withoutName);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when price is negative', async () => {
      const res = await request(app)
        .post('/api/menu')
        .send({ ...validMenuItem, price: -5 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when price is not a number', async () => {
      const res = await request(app)
        .post('/api/menu')
        .send({ ...validMenuItem, price: 'free' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when category is invalid', async () => {
      const res = await request(app)
        .post('/api/menu')
        .send({ ...validMenuItem, category: 'InvalidCategory' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when description is too short', async () => {
      const res = await request(app)
        .post('/api/menu')
        .send({ ...validMenuItem, description: 'Short' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/menu/:id', () => {
    it('updates an existing menu item', async () => {
      const created = menuStore.create(validMenuItem);

      const res = await request(app)
        .put(`/api/menu/${created.id}`)
        .send({ name: 'Updated Pizza', price: 15.99 });

      expect(res.status).toBe(200);
      expect(res.body.item.name).toBe('Updated Pizza');
      expect(res.body.item.price).toBe(15.99);
      expect(res.body.item.description).toBe(validMenuItem.description);
    });

    it('returns 404 for non-existent ID', async () => {
      const res = await request(app)
        .put('/api/menu/non_existent_id')
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for invalid update data', async () => {
      const created = menuStore.create(validMenuItem);

      const res = await request(app)
        .put(`/api/menu/${created.id}`)
        .send({ price: -10 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/menu/:id', () => {
    it('deletes an existing menu item', async () => {
      const created = menuStore.create(validMenuItem);

      const res = await request(app).delete(`/api/menu/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
      expect(menuStore.getById(created.id)).toBeNull();
    });

    it('returns 404 for non-existent ID', async () => {
      const res = await request(app).delete('/api/menu/non_existent_id');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
