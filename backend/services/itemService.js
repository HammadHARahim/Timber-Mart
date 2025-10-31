import Item from '../models/Item.js';
import Shortcut from '../models/Shortcut.js';
import { sequelize } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class ItemService {
  // Create new item/product with shortcuts
  async createItem(itemData, userId) {
    const { name, name_urdu, description, unit, default_price, category, sku, minimum_quantity, shortcuts } = itemData;

    // Use transaction for atomicity
    const transaction = await sequelize.transaction();

    try {
      // Generate unique item ID
      const item_id = `ITEM-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // Create the item
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
      }, { transaction });

      // Create shortcuts if provided
      if (shortcuts && Array.isArray(shortcuts) && shortcuts.length > 0) {
        const shortcutsToCreate = shortcuts.map(sc => ({
          shortcut_code: sc.shortcut_code,
          item_id: item.id,
          quantity: sc.quantity || 1,
          description: sc.description,
          is_active: true,
          sync_status: 'SYNCED',
          last_synced_at: new Date()
        }));

        await Shortcut.bulkCreate(shortcutsToCreate, { transaction });
      }

      await transaction.commit();

      // Fetch the complete item with shortcuts
      return await this.getItemById(item.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get item by ID with shortcuts
  async getItemById(id) {
    const item = await Item.findByPk(id, {
      include: [
        'creator',
        {
          model: Shortcut,
          as: 'shortcuts',
          attributes: ['id', 'shortcut_code', 'quantity', 'description', 'is_active']
        }
      ]
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
      include: [
        'creator',
        {
          model: Shortcut,
          as: 'shortcuts',
          attributes: ['id', 'shortcut_code', 'quantity', 'description', 'is_active']
        }
      ],
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

  // Update item with shortcuts
  async updateItem(id, itemData) {
    const transaction = await sequelize.transaction();

    try {
      const item = await Item.findByPk(id);

      if (!item) {
        throw new Error('Item not found');
      }

      // Extract shortcuts from itemData
      const { shortcuts, ...itemFields } = itemData;

      // Update item fields
      await item.update({
        ...itemFields,
        sync_status: 'SYNCED',
        last_synced_at: new Date()
      }, { transaction });

      // Handle shortcuts if provided
      if (shortcuts !== undefined) {
        // Get existing shortcuts
        const existingShortcuts = await Shortcut.findAll({
          where: { item_id: id },
          transaction
        });

        const existingIds = existingShortcuts.map(s => s.id);
        const incomingIds = shortcuts.filter(s => s.id).map(s => s.id);

        // Delete shortcuts that are no longer in the list
        const toDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (toDelete.length > 0) {
          await Shortcut.destroy({
            where: { id: toDelete },
            transaction
          });
        }

        // Update or create shortcuts
        for (const shortcut of shortcuts) {
          if (shortcut.id) {
            // Update existing shortcut
            await Shortcut.update({
              shortcut_code: shortcut.shortcut_code,
              quantity: shortcut.quantity || 1,
              description: shortcut.description,
              is_active: shortcut.is_active !== undefined ? shortcut.is_active : true,
              sync_status: 'SYNCED',
              last_synced_at: new Date()
            }, {
              where: { id: shortcut.id },
              transaction
            });
          } else {
            // Create new shortcut
            await Shortcut.create({
              shortcut_code: shortcut.shortcut_code,
              item_id: id,
              quantity: shortcut.quantity || 1,
              description: shortcut.description,
              is_active: true,
              sync_status: 'SYNCED',
              last_synced_at: new Date()
            }, { transaction });
          }
        }
      }

      await transaction.commit();

      // Return updated item with shortcuts
      return await this.getItemById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
    // Search for items by name, name_urdu, SKU, or shortcut code
    const items = await Item.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { name_urdu: { [Op.iLike]: `%${searchTerm}%` } },
          { sku: { [Op.iLike]: `%${searchTerm}%` } },
          // Include items that have matching shortcuts
          {
            '$shortcuts.shortcut_code$': { [Op.iLike]: `%${searchTerm}%` }
          }
        ]
      },
      include: [
        {
          model: Shortcut,
          as: 'shortcuts',
          attributes: ['id', 'shortcut_code', 'quantity', 'description', 'is_active'],
          required: false // LEFT JOIN so items without shortcuts are still included
        }
      ],
      limit: parseInt(limit),
      order: [['name', 'ASC']],
      attributes: ['id', 'item_id', 'name', 'name_urdu', 'unit', 'default_price', 'category'],
      distinct: true // Avoid duplicates when item has multiple shortcuts
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
