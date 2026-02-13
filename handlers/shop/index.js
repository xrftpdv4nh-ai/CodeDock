module.exports = (client) => {
  require("./openShop")(client);
  require("./closeShop")(client);
  require("./renameShop")(client);
  require("./renewShop")(client);
  require("./warnshop")(client);
  require("./unwarnshop")(client);
};
