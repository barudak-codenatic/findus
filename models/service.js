// models/Service.js
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      provider_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image_url: DataTypes.STRING(255),
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      province_id: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      province_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      regency_id: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      regency_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      district_id: {
        type: DataTypes.STRING(7),
        allowNull: true,
      },
      district_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "services",
      timestamps: false,
    }
  );

  return Service;
};
