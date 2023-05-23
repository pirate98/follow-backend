'use strict';

const {
  Model
} = require('sequelize');
const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Users.hasMany(models.Followers, {
        foreignKey: 'userId',
        as: 'followers',
      });
      models.Users.hasMany(models.Followers, {
        foreignKey: 'followerId',
        as: 'followings'
      });
    }
  }

  Users.init({
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    birthday: DataTypes.STRING,
    location: DataTypes.STRING,
    gender: DataTypes.STRING,
    bio: DataTypes.TEXT,
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    paranoid: true
  });

  // Avoid leaking password while querying data
  Users.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;

    return values;
  };

  Users.prototype.getProfileData = function () {
    const values = Object.assign({}, this.get());

    return _.omit(values, ['password', 'isEmailVerified', 'createdAt', 'updatedAt', 'deletedAt']);
  };

  return Users;
};