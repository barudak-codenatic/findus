"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("services", "province_id", {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
    await queryInterface.addColumn("services", "province_name", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn("services", "regency_id", {
      type: Sequelize.STRING(4),
      allowNull: true,
    });
    await queryInterface.addColumn("services", "regency_name", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn("services", "district_id", {
      type: Sequelize.STRING(7),
      allowNull: true,
    });
    await queryInterface.addColumn("services", "district_name", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("services", "province_id");
    await queryInterface.removeColumn("services", "province_name");
    await queryInterface.removeColumn("services", "regency_id");
    await queryInterface.removeColumn("services", "regency_name");
    await queryInterface.removeColumn("services", "district_id");
    await queryInterface.removeColumn("services", "district_name");
  },
};
