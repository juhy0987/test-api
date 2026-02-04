const User = require('./User');
const VerificationToken = require('./VerificationToken');

// Define associations
User.hasMany(VerificationToken, {
  foreignKey: 'user_id',
  as: 'verificationTokens'
});

VerificationToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  User,
  VerificationToken
};
