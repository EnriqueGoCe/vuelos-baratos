const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Alert = require('./Alert')(sequelize);
const PriceHistory = require('./PriceHistory')(sequelize);
const SearchCache = require('./SearchCache')(sequelize);
const Airport = require('./Airport')(sequelize);
const ApiUsage = require('./ApiUsage')(sequelize);

const models = { User, Alert, PriceHistory, SearchCache, Airport, ApiUsage };

// Ejecutar asociaciones
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
