const { ApplicationCommandType, ButtonStyle } = require('discord.js');
const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ChannelSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    AttachmentBuilder
} = require('discord.js');
const { welcomeCard } = require("greetify")
const Leave = require(`${process.cwd()}/src/database/Leave.js`);
const LeaveCardDB = require(`${process.cwd()}/src/database/LeaveCard.js`);
const { isImageURLValid } = require(`${process.cwd()}/src/functions/functions`);
module.exports = {
    name: "leave",
    description: "Set up Leave settings",
    usage: "/Leave",
    category: "welcome",
    userPerms: ["ManageGuild"],
    botPerms: [],
    cooldown: 5,
    guildOnly: false,
    ownerOnly: false,
    toggleOff: false,
    nsfwOnly: false,
    maintenance: false,
    type: ApplicationCommandType.ModalSubmit,
    options: [
        {
        name: 'setup',
        description: 'Setup Leave system in your server.',
        type: 1,
    }
    ],
    run: async (client, interaction) => {
        try {
            const sub = interaction.options._subcommand;

            let timeouted = false;
           if (sub === "setup") {
        const data = await Leave.findOne({
          GuildID: interaction.guild.id,
        });

        let homeBtn = new ButtonBuilder()
          .setCustomId("home-btn")
          .setStyle(2)
          .setLabel("Home Page");
        let msgBtn = new ButtonBuilder()
          .setCustomId("Leave-message-btn")
          .setStyle(3)
          .setLabel("Setup Leave Message");

        let emotes = {
          del: "<:bin:1247341259014803506>",
          rocket: "<:rocket:1247341254635683892>",
          channel: "<:channels:1247341241885261824>",
          message: "<:message:1247341246222176297>"
        };

        let emoteLink = (em) =>
          `https://cdn.discordapp.com/emojis/${emotes[em]}`;

        const select = (disabled = false) =>
          new StringSelectMenuBuilder()
            .setCustomId("Leave-config")
            .setPlaceholder("Dont Make Selection!")
            .setDisabled(disabled)
            .setMaxValues(1)
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel("Channel For Leave")
                .setDescription(`Enable/Disable/Set Channel For Leave!`)
                .setValue("Leave-channel")
                .setEmoji(emotes.channel),
              new StringSelectMenuOptionBuilder()
                .setLabel("Message On Leave")
                .setDescription(`Enable/Disable/Set Message For Leave!`)
                .setValue("Leave-msg")
                .setEmoji(emotes.message),
              new StringSelectMenuOptionBuilder()
                .setLabel("Leave Card")
                .setDescription(`Configure RankCard`)
                .setValue("Leave-card")
                .setEmoji(emotes.rocket),
              new StringSelectMenuOptionBuilder()
                .setLabel("Reset ALL")
                .setDescription(`Delete all custom data`)
                .setValue("level-reset")
                .setEmoji(emotes.del)
            );

        const row = new ActionRowBuilder().addComponents(select());
        const row2 = new ActionRowBuilder().addComponents(select(true));
        const homeRow = new ActionRowBuilder().addComponents(homeBtn);
        const msgRow = new ActionRowBuilder().addComponents(msgBtn);
        let homeEmbed = client
          .Embed()
          .setAuthor({
            name: "Leave System",
            url: "https://discord.gg/kYr3sZ6gJs",
          })
          .setDescription(
            "**Select an option from the following list to get started!**\n\n> *Join Our [**Discord**](https://discord.gg/kYr3sZ6gJs) or dm [@Devansh Yadav](https://discord.com/users/) if you need help!*"
          )
          .setThumbnail(
            "https://cdn.discordapp.com/emojis/1068024801186295808.gif"
          );

        let message = await interaction.reply({
          embeds: [homeEmbed],
          components: [row],
        });

        const collector = message.createMessageComponentCollector({
          componentType: 0,
          time: 120 * 1000,
        });

        collector.on("collect", async (i) => {
          if (i.user.id !== interaction.user.id)
            return i.reply({
              content: "# What are you doing? \nJoin Us: discord.gg/kYr3sZ6gJs",
              ephemeral: true,
            });
          if (i.values) { 
              if (i.values[0] === "Leave-channel") {
              let embed = client
                .Embed(false)
                .setAuthor({
                  name: "Leave Channel",
                  url: "https://discord.gg/kYr3sZ6gJs",
                  iconURL: emoteLink("channel"),
                })
                .setThumbnail(emoteLink("channel"))
                .setDescription(
                  "*Select a channel from given channels to set as Leave channel!*"
                );
              const channelSelect = (disabled = false) =>
                new ChannelSelectMenuBuilder()
                  .setCustomId("Leave-channel")
                  .setPlaceholder("Dont Make Selection!")
                  .setDisabled(disabled)
                  .setMaxValues(1)
                  .setChannelTypes(0);

              const channelRow = new ActionRowBuilder().addComponents(
                channelSelect()
              );

              await i.update({
                embeds: [embed],
                components: [channelRow, homeRow],
              });
            } else if (i.customId === "Leave-channel") {
              if (!data)
                new Leave({
                  GuildID: interaction.guild.id,
                  Channel: i.values[0],
                }).save();
              else {
                data.Guild = interaction.guild.id;
                data.Channel = i.values[0];
                data.save();
              }

              await i.update(await home());

              //// set level message
            } else if (i.values[0] === "Leave-msg") {
              let embed = client
                .Embed()
                .setAuthor({
                  name: "Setup Leave Message",
                  url: "https://discord.gg/kYr3sZ6gJs",
                  iconURL: emoteLink("message"),
                })
                .setThumbnail(emoteLink("message"))
                .setDescription(
                  "**Click the button below to set/update Leave message.**\n## Avaliable  Variables\n - `{user:username}` - Returns username eg: deviladam\n - `{user:mention}` - Will Mention User eg: <@" +
                    i.user +
                    ">\n - `{user:createdAt}` - Retruns User's Acount Creation Data\n - `{user:position}` - Returns User's Posting In Server\n- `{guild:memberCount}` - Returns Guild Member Count\n - `{guild:name}` - Returns Guild Name"
                );
              await i.update({
                embeds: [embed],
                components: [msgRow, homeRow],
              });
            } else if (i.values[0] === "Leave-card") {
              await i.update({
                embeds: [client.Embed(false).setDescription("Wait a sec!")],
                components: [],
              });
              if (timeouted) return;
              await message.edit(await LeaveCard());
            } else if (i.values[0] === "Leave-reset") {
              let yesBtn = new ButtonBuilder()
                .setCustomId("Leave-reset-yes")
                .setStyle(3)
                .setLabel("Yes!");
              let noBtn = new ButtonBuilder()
                .setCustomId("Leave-reset-no")
                .setStyle(4)
                .setLabel("No!");
              const confirmRow = new ActionRowBuilder().addComponents(
                yesBtn,
                noBtn
              );
              let embed = client
                .Embed(false)
                .setDescription(
                  client.emotes.loading +
                    " Do You Really Want To Delete All Custom Data?"
                );

              await i.update({
                embeds: [embed],
                components: [confirmRow],
              });
            }
          } else if (i.customId === "Leave-message-btn") {
            const input_1 = new TextInputBuilder()
              .setCustomId("LeaveMsg")
              .setLabel("Leave Message")
              .setRequired(true)
              .setPlaceholder("Enter some text!")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(1000);

            const modal = new ModalBuilder()
              .setCustomId("LeaveMsg")
              .setTitle("Leave System")
              .addComponents(new ActionRowBuilder().addComponents(input_1));

            await i.showModal(modal);

            const response = await interaction.awaitModalSubmit({
              filter: (i) =>
                i.customId === "LeaveMsg" &&
                i.user.id === interaction.user.id,
              time: 60 * 1000,
            });

            /// on modal submit
            if (response.isModalSubmit()) {
              if (data)
                new Leave({
                  Guild: interaction.guild.id,
                  Message: response.fields.fields.get("LeaveMsg").value,
                }).save();
              else {
                data.Guild = interaction.guild.id;
                data.Message = response.fields.fields.get("LeaveMsg").value;
                data.save();
              }

              await response.update(await home());
            }
          } else if (i.customId.includes("LeaveCard")) {
            const LeaveCardData = await LeaveCardDB.findOne({
              Guild: interaction.guild.id,
            });
            let whichBtn = i.customId.replace("LeaveCard-", "");
            if (whichBtn === "reset") {
              await i.update({
                embeds: [client.Embed(false).setDescription("Wait a sec!")],
                components: [],
                files: [],
              });

              await LeaveCardDB.deleteMany({
                Guild: interaction.guild.id,
              });
              if (timeouted) return;

              await message.edit(await LeaveCard());

              return;
            } else if (whichBtn === "bg") {
              const input_1 = new TextInputBuilder()
                .setCustomId("LeaveCard")
                .setLabel("Background")
                .setRequired(true)
                .setPlaceholder("Enter Valid Picture URL")
                .setStyle(1)
                .setMaxLength(300);

              const modal = new ModalBuilder()
                .setCustomId("LeaveCardBg")
                .setTitle("Leave System")
                .addComponents(new ActionRowBuilder().addComponents(input_1));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "LeaveCardBg" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              /// on modal submit
              if (response.isModalSubmit()) {
                let value = response.fields.fields.get("LeaveCardBg").value;

                if (whichBtn === "bg") {
                  if (!(await isImageURLValid(value)))
                    return await response.reply({
                      embeds: [
                        client
                          .Embed(false)
                          .setDescription("Kindly Provide A Vaild URL."),
                      ],
                      ephemeral: true,
                    });
                }
                if (!LeaveCardData) {
                  if (whichBtn === "bg")
                    await new LeaveCardDB({
                      Guild: interaction.guild.id,
                      Background: value,
                    }).save();
                } else {
                  LeaveCardData.Background = value;
                  await LeaveCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await LeaveCard());
            } else if (whichBtn === "title") {
              const input_2 = new TextInputBuilder()
                .setCustomId("LeaveCardTitle")
                .setLabel("Title")
                .setRequired(true)
                .setPlaceholder("Enter Title")
                .setStyle(1)
                .setMaxLength(15);

              const modal = new ModalBuilder()
                .setCustomId("LeaveCardTitle")
                .setTitle("Leave System")
                .addComponents(new ActionRowBuilder().addComponents(input_2));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "LeaveCardTitle" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              /// on modal submit
              if (response.isModalSubmit()) {
                let value =
                  response.fields.fields.get("LeaveCardTitle").value;

                if (!LeaveCardData) {
                  await new LeaveCardDB({
                    Guild: interaction.guild.id,
                    Title: value,
                  }).save();
                } else {
                  LeaveCardData.Title = value;
                  await LeaveCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await LeaveCard());
            } else if (whichBtn === "message") {
              const input_3 = new TextInputBuilder()
                .setCustomId("LeaveCardMessage")
                .setLabel("Message")
                .setRequired(true)
                .setPlaceholder("Enter Message")
                .setStyle(1)
                .setMaxLength(35);

              const modal = new ModalBuilder()
                .setCustomId("LeaveCardMessage")
                .setTitle("Leave System")
                .addComponents(new ActionRowBuilder().addComponents(input_3));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "LeaveCardMessage" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              /// on modal submit
              if (response.isModalSubmit()) {
                let value =
                  response.fields.fields.get("LeaveCardMessage").value;

                if (!LeaveCardData) {
                  await new LeaveCardDB({
                    Guild: interaction.guild.id,
                    Message: value,
                  }).save();
                } else {
                  LeaveCardData.Message = value;
                  await LeaveCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await LeaveCard());
            } else if (whichBtn === "color") {
              const input_3 = new TextInputBuilder()
                .setCustomId("LeaveCardColor")
                .setLabel("Color")
                .setRequired(true)
                .setPlaceholder("Enter Hex Code")
                .setStyle(1)
                .setMaxLength(6);

              const modal = new ModalBuilder()
                .setCustomId("LeaveCardColor")
                .setTitle("Leave System")
                .addComponents(new ActionRowBuilder().addComponents(input_3));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "LeaveCardColor" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              /// on modal submit
              if (response.isModalSubmit()) {
                let value =
                  response.fields.fields.get("LeaveCardColor").value;

                if (whichBtn === "color" && !/^[A-Fa-f0-9]{6}$/.test(value))
                  return await response.reply({
                    embeds: [
                      client
                        .Embed(false)
                        .setDescription(
                          "Kindly Provide A Vaild Hex Code. eg: 00ffaa, ffffff, 000000......"
                        ),
                    ],
                    ephemeral: true,
                  });

                if (!LeaveCardData) {
                  await new LeaveCardDB({
                    Guild: interaction.guild.id,
                    Color: value,
                  }).save();
                } else {
                  LeaveCardData.Color = value;
                  await LeaveCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await LeaveCard());
            }
            // end rank card btns
          } else if (i.customId === "Leave-reset-yes") {
            await i.update({
              embeds: [client.Embed(false).setDescription("Wait a sec!")],
              components: [],
            });
            let embed2 = client
              .Embed(false)
              .setDescription("Data Not Found!");
            let embed = client
              .Embed(false)
              .setDescription("Deleted All Data!");
            const data = await Leave.findOne({
              GuildID: interaction.guild.id,
            });
            const data2 = await LeaveCardDB.findOne({
              Guild: interaction.guild.id,
            });
            if (!data && !data2) {
              if (timeouted) return;
              await message.edit({
                embeds: [embed2],
                components: [homeRow],
              });
            } else {
              if (data)
                await Leave.deleteMany({
                  GuildID: interaction.guild.id,
                });

              if (data2)
                await LeaveCardDB.deleteMany({
                  Guild: interaction.guild.id,
                });
              if (timeouted) return;

              await message.edit({
                embeds: [embed],
                components: [homeRow],
              });
            }
          } else if (
            i.customId === "home-btn" ||
            i.customId === "Leave-reset-no"
          )
            await i.update(await home());

          async function home() {
            const Newdata = await Leave.findOne({
              GuildID: interaction.guild.id,
            });
            const NewRow = new ActionRowBuilder().addComponents(
              select(false, Newdata && Newdata.Leave)
            );
            return {
              files: [],
              embeds: [homeEmbed],
              content: "",
              components: [NewRow],
            };
          }

          async function LeaveCard() {
            const LeaveCardData = await LeaveCardDB.findOne({
              Guild: interaction.guild.id,
            });
            let titleBtn = new ButtonBuilder()
              .setCustomId("LeaveCard-title")
              .setStyle(3)
              .setLabel("Title");
            let messageBtn = new ButtonBuilder()
              .setCustomId("LeaveCard-message")
              .setStyle(3)
              .setLabel("Message");
            let bgBtn = new ButtonBuilder()
              .setCustomId("LeaveCard-bg")
              .setStyle(3)
              .setLabel("Background");
            let colorBtn = new ButtonBuilder()
              .setCustomId("LeaveCard-color")
              .setStyle(3)
              .setLabel("Color");
            let LeaveCardDataReset = new ButtonBuilder()
              .setCustomId("LeaveCard-reset")
              .setStyle(2)
              .setLabel("Reset")
              .setEmoji("979818265582899240")
              .setDisabled(LeaveCardData ? false : true);

            const LeaveCardRow = new ActionRowBuilder().addComponents(
              titleBtn,
              messageBtn,
              bgBtn,
              colorBtn,
              LeaveCardDataReset
            );

            const Card = new welcomeCard()
              .setName(interaction.user.username)
              .setAvatar(
                interaction.user.displayAvatarURL({
                  forceStatic: true,
                  extension: "png",
                })
              )
              .setBackground(
                LeaveCardData &&
                  LeaveCardData.Background &&
                  (await isImageURLValid(LeaveCardData.Background))
                  ? LeaveCardData.Background
                  : "https://media.discordapp.net/attachments/1041589448523128874/1143180518528131102/image.png?width=694&height=244"
              )
              .setColor(
                LeaveCardData && LeaveCardData.BoderColor
                  ? "#" + LeaveCardData.BoderColor
                  : "#fb0237"
              )
              .setTitle(
                LeaveCardData && LeaveCardData.Title
                  ? LeaveCardData.Title
                  : "Leave"
              )
              .setMessage(
                LeaveCardData && LeaveCardData.Message
                  ? LeaveCardData.Message
                  : "Leave To The Server"
              );
            const output = await Card.build();

            return {
              files: [
                {
                  attachment: output,
                  name: `Leave-${interaction.user.id}.png`,
                },
              ],
              embeds: [],
              components: [LeaveCardRow, homeRow],
            };
          }
        });

        collector.on("end", async (i) => {});
        collector.on("stop", async (i) => {});

        const timeout = setTimeout(async () => {
          try {
            // Set timeout flag
            timeouted = true;

            // Edit the interaction with a timeout message
            await interaction.editReply({
              embeds: [
                client
                  .Embed(false)
                  .setDescription("**Timeout!** Run Command Again."),
              ],
              files: [],
              content: "",
              components: [],
            });
          } catch (error) {
            console.error("Timeout error:", error);
          }
        }, 125 * 1000);
      }
            } catch (error) {
                client.slash_err(client, interaction, error);
            }
        }
    }