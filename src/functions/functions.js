const permissions = require(`${process.cwd()}/src/validator/permissions`);
const axios = require('axios');
require("colors")
module.exports.parsePermissions = parsePermissions;
module.exports.isImageURLValid = isImageURLValid;

function parsePermissions(perms) {
  const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
  return "`" + perms.map((perm) => permissions[perm]).join(", ") + "` " + permissionWord;
}

async function isImageURLValid(imageURL) {
  try {
    const response = await axios.head(imageURL);
    if (response.status !== 200) {
      return false;
    }
    const contentType = response.headers['content-type'];
    if (!contentType.startsWith('image/')) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}