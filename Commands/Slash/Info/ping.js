const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const os = require('os');
require('ms');
module.exports = {
  name: "ping",
  description: "Check bot's ping.",
  usage: "",
  category: "info",
  userPerms: [""],
  botPerms: [""],
  cooldown: 10,
  guildOnly: false,
  ownerOnly: false,
  toggleOff: false,
  nsfwOnly: false,
  maintenance: false,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    try {
      let days = Math.floor(client.uptime / 86400000)
      let hours = Math.floor(client.uptime / 3600000) % 24
      let minutes = Math.floor(client.uptime / 60000) % 60
      let seconds = Math.floor(client.uptime / 1000) % 60
      let webLatency = new Date() - interaction.createdAt
      let apiLatency = client.ws.ping
      let totalLatency = webLatency + apiLatency
      let emLatency = {
        Green: '🟢',
        Yellow: '🟡',
        Red: '🔴'
      }
      interaction.reply({
        embeds: [
         client.Embed()
            .setColor(totalLatency < 200 ? client.embed.successcolor : totalLatency < 500 ? client.embed.stanbycolor : client.embed.wrongcolor)
            .setTitle(`Returns Latency And API Ping`)
            .setFields([
              {
                name: `<:websocket:1247347094902145095> Websocket Latency`,
                value: `>>> \`\`\`yml\n${webLatency <= 200 ? emLatency.Green : webLatency <= 400 ? emLatency.Yellow : emLatency.Red} ${webLatency}ms\`\`\``,
                inline: true
              },
              {
                name: `<:api:1247347051872784476> API Latency`,
                value: `>>> \`\`\`yml\n${apiLatency <= 200 ? emLatency.Green : apiLatency <= 400 ? emLatency.Yellow : emLatency.Red} ${apiLatency}ms\`\`\``,
                inline: true
              },
              {
                name: `<:uptime:1247347024534442138> Uptime`,
                value: `>>> \`\`\`m\n${days} Days : ${hours} Hrs : ${minutes} Mins : ${seconds} Secs\`\`\``,
                inline: false
              }
            ])]
      })
    } catch (error) {
      client.slash_err(client, interaction, error);
    }
  }
};