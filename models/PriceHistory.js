const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriceHistory = sequelize.define('PriceHistory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    origin: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    departure_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    lowest_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    average_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    highest_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR'
    },
    sample_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'price_history',
    timestamps: false,
    indexes: [
      { fields: ['origin', 'destination', 'departure_date'] },
      { fields: ['recorded_at'] }
    ]
  });

  return PriceHistory;
};
