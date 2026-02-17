const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'users'
  });

  User.associate = (models) => {
    User.hasMany(models.Alert, { foreignKey: 'user_id', as: 'alerts' });
  };

  return User;
};
