const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Airport = sequelize.define('Airport', {
    iata_code: {
      type: DataTypes.STRING(3),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: false
    }
  }, {
    tableName: 'airports',
    timestamps: false
  });

  return Airport;
};
