const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApiUsage = sequelize.define('ApiUsage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    month: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    call_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'api_usage',
    createdAt: false,
    indexes: [
      { unique: true, fields: ['provider', 'month'] }
    ]
  });

  return ApiUsage;
};
