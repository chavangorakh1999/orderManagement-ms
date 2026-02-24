const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { validate } = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/orderValidator');

const router = Router();

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
