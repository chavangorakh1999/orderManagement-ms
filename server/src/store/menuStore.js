const { generateMenuId } = require('../utils/generateId');

class MenuStore {
  constructor() {
    this.items = new Map();
  }

  getAll() {
    return Array.from(this.items.values());
  }

  getById(id) {
    return this.items.get(id) || null;
  }

  create(data) {
    const item = {
      id: generateMenuId(),
      ...data,
      available: data.available !== undefined ? data.available : true,
      createdAt: new Date().toISOString(),
    };
    this.items.set(item.id, item);
    return item;
  }

  update(id, data) {
    const existing = this.items.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    this.items.set(id, updated);
    return updated;
  }

  delete(id) {
    const existing = this.items.get(id);
    if (!existing) return false;

    this.items.delete(id);
    return true;
  }

  clear() {
    this.items.clear();
  }
}

const menuStore = new MenuStore();

module.exports = { menuStore, MenuStore };
