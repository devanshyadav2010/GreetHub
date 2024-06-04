module.exports = {
  TOKEN: process.env.TOKEN || "YOUR_DISCORD_TOKEN_HERE",
  MONGO_DB: process.env.MONGO_DB || "YOUR_MONGO_DB_CONNECTION_STRING_HERE",
  CLIENT_ID: process.env.CLIENT_ID || "YOUR_CLIENT_ID_HERE",
  OWNERS: ["YOUR_DISCORD_USER_ID_HERE"],
  SUPPORT_SERVER: "https://discord.com/invite/fDrwgNG5UN",
  CHANNELS: {
    COMMANDS_LOGS: "YOUR_COMMANDS_LOG_CHANNEL_ID_HERE",
    ERROR_COMMAND_LOGS: "YOUR_ERROR_COMMAND_LOG_CHANNEL_ID_HERE"
  },
  TOPGG: {
    STATUS: false, // make it true if your bot is listed on top.gg and put topgg token
    TOKEN: "YOUR_TOPGG_TOKEN_HERE"
  }
}