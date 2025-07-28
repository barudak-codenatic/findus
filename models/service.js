// models/Service.js
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
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
