const bcrypt = require('bcrypt');
const _ = require('lodash');
const { Users } = require('../models');
const { jwtService, mailService } = require('../services');

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({
    where: { email }
  });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send({ 
      message: "Incorrect email or password"
    });
  }

  const token = await jwtService().issue({ jti: user.id });

  return res.status(200).json({
    ...user.getProfileData(),
    token,
  });
};

const register = async (req, res) => {
  const { email, password } = req.body;

  if (await Users.findOne({ where: { email } })) {
    return res.status(400).send({ 
      message: 'Your email is already registered.'
    });
  }

  const user = await Users.create({
    ...req.body,
    password: bcrypt.hashSync(password, 10)
  });

  const emailId = email.split("@")[0];
  user.username = `${emailId}${user.id}`;
  await user.save();

  const token = await jwtService().issue({ jti: user.id });

  return res.status(200).json({
    ...user.getProfileData(),
    token,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ where: { email } });

  if (!user) {
    return res.status(200).json({ success: true });
  }

  const token = await jwtService().generatePasswordResetToken(user.id);
  // need to send email asynchronously
  mailService().sendForgotPasswordEmail(email, token);

  return res.status(200).json({ success: true });
}

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenContent = await jwtService().verify(token);
    if (!tokenContent || tokenContent.kind !== "password-reset") {
      return res.status(400).json({ message: "Incorrect or expired token" });
    }

    const user = await Users.findByPk(tokenContent.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = bcrypt.hashSync(password, 10);
    await user.save();
    await jwtService().revoke(tokenContent.jti);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Incorrect or expired token" });
  }
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword
}
