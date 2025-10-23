import Item from '../models/Item.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class ItemService {
  // Create new item/product
  async createItem(itemData, userId) {
    const { name, name_urdu, description, unit, default_price, category, sku, minimum_quantity } = itemData;

    // Generate unique item ID
    const item_id = `ITEM-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const item = await Item.create({
      item_id,
      name,
      name_urdu,
      description,
      unit: unit || 'piece',
      default_price: default_price || 0,
      category,
      sku,
      minimum_quantity: minimum_quantity || 1,
      created_by_user_id: userId,
      is_active: true,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return item;
  }

  // Get item by ID
  async getItemById(id) {
    const item = await Item.findByPk(id, {
      include: ['creator']
    });

    if (!item) {
      throw new Error('Item not found');
    }

    return item;
  }

  // Get all items
  async getAllItems(filters = {}) {
    const { search, category, is_active, page = 1, limit = 50 } = filters;

    const where = {};

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by active status
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    // Search by name, name_urdu, or sku
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { name_urdu: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { item_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Item.findAndCountAll({
      where,
      include: ['creator'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    return {
      items: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  // Update item
  async updateItem(id, itemData) {
    const item = await Item.findByPk(id);

    if (!item) {
      throw new Error('Item not found');
    }

    await item.update({
      ...itemData,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return item;
  }

  // Soft delete (deactivate) item
  async deactivateItem(id) {
    const item = await Item.findByPk(id);

    if (!item) {
      throw new Error('Item not found');
    }

    await item.update({
      is_active: false,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return { message: 'Item deactivated successfully' };
  }

  // Reactivate item
  async activateItem(id) {
    const item = await Item.findByPk(id);

    if (!item) {
      throw new Error('Item not found');
    }

    await item.update({
      is_active: true,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    });

    return { message: 'Item activated successfully' };
  }

  // Delete item permanently
  async deleteItem(id) {
    const item = await Item.findByPk(id);

    if (!item) {
      throw new Error('Item not found');
    }

    await item.destroy();

    return { message: 'Item deleted successfully' };
  }

  // Get items by category
  async getItemsByCategory(category) {
    const items = await Item.findAll({
      where: {
        category,
        is_active: true
      },
      order: [['name', 'ASC']]
    });

    return items;
  }

  // Search items for autocomplete (quick search)
  async searchItems(searchTerm, limit = 10) {
    const items = await Item.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { name_urdu: { [Op.iLike]: `%${searchTerm}%` } },
          { sku: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['name', 'ASC']],
      attributes: ['id', 'item_id', 'name', 'name_urdu', 'unit', 'default_price', 'category']
    });

    return items;
  }

  // Get all categories
  async getCategories() {
    const categories = await Item.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        category: { [Op.ne]: null }
      },
      raw: true
    });

    return categories.map(c => c.category);
  }

  // Bulk create items (for imports/seeding)
  async bulkCreateItems(itemsArray, userId) {
    const itemsToCreate = itemsArray.map(item => ({
      ...item,
      item_id: item.item_id || `ITEM-${Date.now()}-${uuidv4().substring(0, 8)}`,
      created_by_user_id: userId,
      sync_status: 'SYNCED',
      last_synced_at: new Date()
    }));

    const items = await Item.bulkCreate(itemsToCreate);

    return items;
  }
}

export default new ItemService();
