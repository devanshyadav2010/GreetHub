const { EmbedBuilder, Collection, PermissionsBitField } = require('discord.js')
const { slash } = require(`${process.cwd()}/src/functions/onCoolDown.js`);
const { parsePermissions } = require(`${process.cwd()}/src/functions/functions.js`);
const set = require(`${process.cwd()}/Assets/Config/settings`);
// ================================================================================
module.exports = {
  async execute(client) {
    const emojis = client.emotes;
    client.on('interactionCreate', async interaction => {
      // ==============================< Command Handling >=============================\\
      const slashCommand = client.slashCommands.get(interaction.commandName);
      if (interaction.type == 4) {
        if (slashCommand.autocomplete) {
          const choices = [];
          await slashCommand.autocomplete(interaction, choices)
        }
      }
      if (!interaction.type == 2) return;
      // ==============================< If command doesn't found >=============================\\
      if (!slashCommand) return client.slashCommands.delete(interaction.commandName);
      // ==============================< Other Command Handling list >=============================\\
      try {
        // ==============================< Toggle off >=============================\\
        if (slashCommand.toggleOff) {
          return await interaction.reply({
            ephemeral: true,
            embeds: [new EmbedBuilder()
              .setTitle(`${emojis.MESSAGE.x} **That Command Has Been Disabled By The Developers! Please Try Later.**`).setColor(client.embed.wrongcolor)
            ]
          }).catch((e) => {
            console.log(e)
          });
        }
        // ==============================< On Mainenance Mode >============================= \\
        if (slashCommand.maintenance) {
          return await interaction.reply({
            ephemeral: true,
            content: `${emojis.MESSAGE.x} **${slashCommand.name} command is on __Maintenance Mode__** try again later!`
          })
        }
        // ==============================< Owner Only >============================= \\            
        if (slashCommand.ownerOnly) {
          const owners = client.config.OWNERS;
          if (!owners.includes(interaction.user.id)) return await interaction.reply({
            ephemeral: true,
            embeds: [new EmbedBuilder()
              .setDescription(`${emojis.MESSAGE.x} **You cannot use \`${slashCommand.name}\` command as this is a developer command.**`).setColor(client.embed.wrongcolor)
            ]
          }).catch((e) => {
            console.log(String(e).grey)
          });
        }
        // ==============================< Only for offical guilds >============================= \\
        if (slashCommand.guildOnly) {
          const private = client.config.SERVER.OFFICIAL.Guild_ID_1
            .concat(client.config.SERVER.Guild_ID_2);
          if (!private.includes(interaction.guild.id)) {
            return interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  .setTitle(`${emojis.MESSAGE.x} ${interaction.user.username} You have entered an invalid command!`)
                  .setDescription(`The command \`${slashCommand.name}\` can only be used in the official server.`).setColor(client.embed.wrongcolor)
              ]
            })
          }
        }
        // ==============================< NSFW checking >============================= \\
        if (slashCommand.nsfwOnly && !interaction.channel.nsfw) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setDescription(`${emojis.MESSAGE.x} This command can only be used in NSFW channels!`)
                .setColor(client.embed.wrongcolor)
            ]
          })
        }

        // ==============================< CoolDown checking >============================= \\
        if (slashCommand.cooldown && slash(interaction, slashCommand)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setTitle(`${emojis.MESSAGE.x} You have been cooldown for \`${slashCommand.cooldown}\` seconds!`)
                .setDescription(`Please wait \`${slash(interaction, slashCommand).toFixed(1)}\` Before using the \`${slashCommand.name}\` command again!`)
                .setColor(client.embed.wrongcolor)

            ]
          })
        }
          
                  // ==============================< vote checking >============================= \\
          
             if (client.config.TOPGG.STATUS === true) {
       if (slashCommand.voters && !(await client.topgg.hasVoted(interaction.user.id))) {
          return interaction.reply({
            embeds: [
              client.Embed()
                .setTitle(`<:lock:1247370184029896774> Vote to Unlock`)
                .setDescription(`Unlock this command by casting your vote on [TOP.GG](https://top.gg/bot/${client.config.CLIENT_ID}/vote).`)
                .setColor(client.color),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Vote Now').setStyle(ButtonStyle.Link).setURL(`https://top.gg/bot/${client.config.CLIENT_ID}/vote`).setEmoji("<:topgg:1247371536105476166>")
              ),
            ],
          });
        }
    }
          
        // ==============================< Start The Command >============================= \\	       
        await slashCommand.run(client, interaction);
     /* if (client.config.CHANNELS.COMMANDS_LOGS) await client.channels.cache.get(client.config.CHANNELS.COMMANDS_LOGS).send({
          embeds: [new EmbedBuilder()
            .setColor(client.embed.color)
            .setAuthor({ name: "Slash Command", iconURL: `https://cdn.discordapp.com/emojis/942758826904551464.webp?size=28&quality=lossless` })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields([
              { name: "**Author**", value: `\`\`\`yml\n${interaction.user.tag} [${interaction.user.id}]\`\`\`` },
              { name: "**Command Name**", value: `\`\`\`yml\n${slashCommand.data.name}\`\`\`` },
               { name: `**Guild**`, value: `\`\`\`yml\n${interaction.guild.name} [${interaction.guild.id}]\`\`\`` }
            ])
          ]
        });*/
        // ==============================< On Error >============================= \\
      } catch (error) {
        client.slash_err(client, interaction, error);
      }
    });
  }
}