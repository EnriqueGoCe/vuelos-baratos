const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SearchCache = sequelize.define('SearchCache', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    cache_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    results: {
      type: DataTypes.JSON,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'search_cache',
    updatedAt: false
  });

  return SearchCache;
};
