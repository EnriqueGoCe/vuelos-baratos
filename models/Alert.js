const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    target_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    last_checked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    last_triggered_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'alerts',
    updatedAt: false
  });

  Alert.associate = (models) => {
    Alert.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Alert;
};
