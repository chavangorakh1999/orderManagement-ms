const { nanoid } = require('nanoid');

const generateMenuId = () => `m_${nanoid(10)}`;
const generateOrderId = () => `ord_${nanoid(10)}`;

module.exports = { generateMenuId, generateOrderId };
