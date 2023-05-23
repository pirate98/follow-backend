'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Followers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Followers.belongsTo(models.Users, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });
      models.Followers.belongsTo(models.Users, {
        foreignKey: 'followerId',
        targetKey: 'id',
        as: 'follower'
      });
    }
  }

  Followers.init({
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    followerId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'Followers',
    tableName: 'followers',
    timestamps: false,
    paranoid: false
  });

  return Followers;
};