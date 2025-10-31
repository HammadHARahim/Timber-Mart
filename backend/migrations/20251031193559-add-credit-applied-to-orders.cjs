'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'credit_applied', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Amount of customer credit applied to this order'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'credit_applied');
  }
};
