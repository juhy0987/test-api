const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const VerificationToken = sequelize.define('VerificationToken', {
  tokenId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'token_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'user_id'
    },
    onDelete: 'CASCADE'
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'verification_tokens',
  timestamps: false
});

// Static method to generate token
VerificationToken.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create verification token
VerificationToken.createVerificationToken = async function(userId, expirationHours = 24) {
  const token = this.generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  return await this.create({
    userId,
    token,
    expiresAt
  });
};

// Instance method to check if token is valid
VerificationToken.prototype.isValid = function() {
  return !this.isUsed && new Date() < this.expiresAt;
};

module.exports = VerificationToken;
