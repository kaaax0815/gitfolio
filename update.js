const { getConfig } = require("./utils");
const { updateHTML } = require("./populate");

async function updateCommand() {
  const data = await getConfig();
  var username = data[0].username;
  if (username == null) {
    console.log(
      "username not found in config.json, please run build command before using update"
    );
    return;
  }
  const opts = {
    sort: data[0].sort,
    order: data[0].order,
    includeFork: data[0].includeFork,
    types: data[0].types,
    twitter: data[0].twitter
  };
  updateHTML(username, opts);
}

module.exports = {
  updateCommand
};
