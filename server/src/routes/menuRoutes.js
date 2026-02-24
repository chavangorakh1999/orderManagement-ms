const { Router } = require('express');
const menuController = require('../controllers/menuController');
const { validate } = require('../middleware/validate');
const { createMenuItemSchema, updateMenuItemSchema } = require('../validators/menuValidator');

const router = Router();

router.get('/', menuController.getAllMenuItems);
router.get('/:id', menuController.getMenuItemById);
router.post('/', validate(createMenuItemSchema), menuController.createMenuItem);
router.put('/:id', validate(updateMenuItemSchema), menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
