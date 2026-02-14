const { PermissionFlagsBits } = require("discord.js");

function hasAdminAccess(member) {
  if (!member) return false;

  return member.permissions.has(PermissionFlagsBits.Administrator);
}

module.exports = hasAdminAccess;
