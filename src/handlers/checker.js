const set = require(`${process.cwd()}/Assets/Config/settings`)
module.exports = {
  async execute(ex) {
    if (!ex.config.TOKEN) {
      ex.logger("Enter The Bot Token".bold.red)
      process.exit(1)
    }
    if (!ex.config.MONGO_DB) {
      ex.logger("Enter MONGO_DB If you dont have then you can find one in our server => https://discord.gg/uoaio".bold.red)
      process.exit(1)
    }
    if (!ex.config.CLIENT_ID) {
      ex.logger("Enter client id".bold.red)
      process.exit(1)
    }
    if (!set.SLASH_GLOBLE && !ex.config.SUPPORT_SERVER) {
      ex.logger("Enter SUPPORT_SERVER (guild id) in config file".bold.red)
      process.exit(1)
    }
  }
}