'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'users',
      'birthday',
      {
        allowNull: true,
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      'users',
      'location',
      {
        allowNull: true,
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      'users',
      'gender',
      {
        allowNull: true,
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      'users',
      'bio',
      {
        allowNull: true,
        type: Sequelize.TEXT,
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      'users',
      'birthday'
    );
    await queryInterface.removeColumn(
      'users',
      'location'
    );
    await queryInterface.removeColumn(
      'users',
      'gender'
    );
    await queryInterface.removeColumn(
      'users',
      'bio'
    );
  }
};
