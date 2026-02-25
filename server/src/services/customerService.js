const Customer = require('../models/Customer');

/**
 * Finds a customer by phone number, or creates one if not found.
 * Always updates name and address to the latest values provided.
 */
const findOrCreateCustomer = async ({ name, phone, address }) => {
  return Customer.findOneAndUpdate(
    { phone },
    { $set: { name, address } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
};

module.exports = { findOrCreateCustomer };
