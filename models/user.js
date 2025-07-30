// models/User.js
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        // unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      role: {
        type: DataTypes.ENUM("USER", "PROVIDER"),
        allowNull: false,
      },
      photo_url: {
        type: DataTypes.STRING(255),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["email"],
          name: "email_unique_index", // beri nama yang konsisten
        },
      ],
    }
  );

  return User;
};
