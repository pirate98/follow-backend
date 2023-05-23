const _ = require('lodash');
const { Users, Followers } = require('../models');

const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await Users.findByPk(id, {
    attributes: ['name', 'email', 'avatar'],
    include: [{
      model: Followers,
      attributes: ['followerId'],
      as: 'followers'
    }, {
      model: Followers,
      attributes: ['userId'],
      as: 'followings'
    }]
  });

  if (!user) {
    return res.status(404).send({
      message: "User not found"
    });
  }

  return res.status(200).json(user);
};

const update = async (req, res) => {
  const { body } = req;

  if (req.file) {
    body.avatar = req.file.location;
  }

  const user = await req.user.update(body)
  return res.status(200).json(user.getProfileData());
};

const updateFollowStatus = async (req, res) => {
  const { userId, status } = req.body;

  // ============= request validation =============
  if (Number(userId) === req.user.id) {
    return res.status(400).send({
      message: "Bad Request"
    });
  }

  const user = await Users.findByPk(userId);
  if (!user) {
    return res.status(404).send({
      message: "User not found"
    });
  }
  // ==============================================

  const followed = await Followers.findOne({
    where: {
      userId,
      followerId: req.user.id,
    }
  });
  if (status === 'true' && !followed) {
    await Followers.create({
      userId,
      followerId: req.user.id,
    });
  } else if (status === 'false' && followed) {
    await followed.destroy();
  }

  return res.status(200).json({ success: true });
};

const getUserFollowings = async (req, res) => {
  const { id } = req.params;

  const followings = await Followers.findAll({
    attributes: [],
    where: {
      followerId: id
    },
    include: [{
      model: Users,
      attributes: ['id', 'username', 'name', 'email'],
      as: 'user'
    }]
  });

  return res.status(200).json({ followings });
};

const getUserFollowers = async (req, res) => {
  const { id } = req.params;

  const followers = await Followers.findAll({
    attributes: [],
    where: {
      userId: id
    },
    include: [{
      model: Users,
      attributes: ['id', 'username', 'name', 'email'],
      as: 'follower'
    }]
  });

  return res.status(200).json({ followers });
};

module.exports = {
  getUserById,
  update,
  updateFollowStatus,
  getUserFollowings,
  getUserFollowers
}
