const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "findus",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

// Import models
const User = require("./user")(sequelize);
const Service = require("./service")(sequelize);
const Cart = require("./cart")(sequelize);
const Order = require("./order")(sequelize);
const Payment = require("./payment")(sequelize);
const Review = require("./review")(sequelize);

// Setup associations
User.hasMany(Service, { foreignKey: "provider_id" });
Service.belongsTo(User, { foreignKey: "provider_id" });

User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Service.hasMany(Cart, { foreignKey: "service_id" });
Cart.belongsTo(Service, { foreignKey: "service_id" });

User.hasMany(Order, { foreignKey: "user_id", as: "CustomerOrders" });
User.hasMany(Order, { foreignKey: "provider_id", as: "ProviderOrders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "Customer" });
Order.belongsTo(User, { foreignKey: "provider_id", as: "Provider" });

Service.hasMany(Order, { foreignKey: "service_id" });
Order.belongsTo(Service, { foreignKey: "service_id" });

Order.hasOne(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

Order.hasOne(Review, { foreignKey: "order_id" });
Review.belongsTo(Order, { foreignKey: "order_id" });

User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Service,
  Cart,
  Order,
  Payment,
  Review,
};
