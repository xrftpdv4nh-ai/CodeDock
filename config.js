require("dotenv").config();

module.exports = {
  token: process.env.TOKEN,
  devRoleId: process.env.DEV_ROLE_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID
};
