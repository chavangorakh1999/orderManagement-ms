const http = require('http');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const app = require('../src/app');
const { setupOrderSocket } = require('../src/socket/orderSocket');
const { menuStore } = require('../src/store/menuStore');
const { orderStore } = require('../src/store/orderStore');
const request = require('supertest');

let server;
let io;
let clientSocket;

const PORT = 0; // Random available port

beforeAll((done) => {
  server = http.createServer(app);
  io = new Server(server, { cors: { origin: '*' } });
  app.set('io', io);
  setupOrderSocket(io);

  server.listen(PORT, () => {
    const port = server.address().port;
    clientSocket = ioClient(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
    });
    clientSocket.on('connect', done);
  });
});

afterAll((done) => {
  if (clientSocket) clientSocket.disconnect();
  io.close();
  server.close(done);
});

beforeEach(() => {
  menuStore.clear();
  orderStore.clear();
  menuStore.create({
    name: 'Test Pizza',
    description: 'A delicious test pizza with all the toppings you can imagine',
    price: 12.99,
    image: '/images/test-pizza.jpg',
    category: 'Pizza',
  });
});

describe('Order Socket.io', () => {
  it('handles order:subscribe and order:unsubscribe', (done) => {
    clientSocket.emit('order:subscribe', { orderId: 'test_order_123' });

    // Small delay to ensure the join completes
    setTimeout(() => {
      clientSocket.emit('order:unsubscribe', { orderId: 'test_order_123' });
      done();
    }, 100);
  });

  it('emits order:error when subscribing without orderId', (done) => {
    clientSocket.on('order:error', (data) => {
      expect(data.message).toBe('orderId is required');
      clientSocket.off('order:error');
      done();
    });

    clientSocket.emit('order:subscribe', {});
  });

  it('emits order:statusUpdate when status is updated via API', (done) => {
    const menuItems = menuStore.getAll();
    const menuItem = menuItems[0];

    // Create an order first
    request(app)
      .post('/api/orders')
      .send({
        items: [{ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }],
        customer: { name: 'John Doe', address: '123 Main Street, Springfield', phone: '+1234567890' },
      })
      .then((createRes) => {
        const orderId = createRes.body.order.id;

        // Subscribe to the order room
        clientSocket.emit('order:subscribe', { orderId });

        // Listen for status update
        clientSocket.on('order:statusUpdate', (data) => {
          expect(data.orderId).toBe(orderId);
          expect(data.status).toBe('preparing');
          expect(data.updatedAt).toBeDefined();
          clientSocket.off('order:statusUpdate');
          done();
        });

        // Wait for subscription to complete, then update status
        setTimeout(() => {
          request(app)
            .patch(`/api/orders/${orderId}/status`)
            .send({ status: 'preparing' })
            .then(() => {});
        }, 100);
      });
  });

  it('only sends update to the subscribed room', (done) => {
    const menuItems = menuStore.getAll();
    const menuItem = menuItems[0];

    // Create two orders
    Promise.all([
      request(app)
        .post('/api/orders')
        .send({
          items: [{ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }],
          customer: { name: 'Alice', address: '456 Oak Avenue, Springfield', phone: '+1987654321' },
        }),
      request(app)
        .post('/api/orders')
        .send({
          items: [{ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }],
          customer: { name: 'Bob', address: '789 Pine Road, Springfield', phone: '+1111111111' },
        }),
    ]).then(([res1, res2]) => {
      const orderId1 = res1.body.order.id;
      const orderId2 = res2.body.order.id;

      // Subscribe only to order 1
      clientSocket.emit('order:subscribe', { orderId: orderId1 });

      let receivedUpdate = false;

      clientSocket.on('order:statusUpdate', (data) => {
        // Should only receive updates for order 1
        expect(data.orderId).toBe(orderId1);
        receivedUpdate = true;
        clientSocket.off('order:statusUpdate');
      });

      setTimeout(() => {
        // Update order 2 (should NOT trigger our listener)
        request(app)
          .patch(`/api/orders/${orderId2}/status`)
          .send({ status: 'preparing' })
          .then(() => {
            // Update order 1 (should trigger our listener)
            setTimeout(() => {
              request(app)
                .patch(`/api/orders/${orderId1}/status`)
                .send({ status: 'preparing' })
                .then(() => {
                  setTimeout(() => {
                    expect(receivedUpdate).toBe(true);
                    done();
                  }, 100);
                });
            }, 100);
          });
      }, 100);
    });
  });
});
