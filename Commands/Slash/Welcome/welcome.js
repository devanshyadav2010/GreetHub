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
const Welcome = require(`${process.cwd()}/src/database/welcome.js`);
const WelcomeCardDB = require(`${process.cwd()}/src/database/welcomeCard.js`);
const { isImageURLValid } = require(`${process.cwd()}/src/functions/functions`);
module.exports = {
    name: "welcome",
    description: "Set up welcome settings",
    usage: "/welcome",
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
        description: 'Setup welcome system in your server.',
        type: 1,
    }
    ],
    run: async (client, interaction) => {
        try {
            const sub = interaction.options._subcommand;

            let timeouted = false;
           if (sub === "setup") {
        const data = await Welcome.findOne({
          GuildID: interaction.guild.id,
        });

        let homeBtn = new ButtonBuilder()
          .setCustomId("home-btn")
          .setStyle(2)
          .setLabel("Home Page");
        let msgBtn = new ButtonBuilder()
          .setCustomId("welcome-message-btn")
          .setStyle(3)
          .setLabel("Setup Welcome Message");

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
            .setCustomId("welcome-config")
            .setPlaceholder("Dont Make Selection!")
            .setDisabled(disabled)
            .setMaxValues(1)
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel("Channel For Welcome")
                .setDescription(`Enable/Disable/Set Channel For Welcome!`)
                .setValue("welcome-channel")
                .setEmoji(emotes.channel),
              new StringSelectMenuOptionBuilder()
                .setLabel("Message On Welcome")
                .setDescription(`Enable/Disable/Set Message For Welcome!`)
                .setValue("welcome-msg")
                .setEmoji(emotes.message),
              new StringSelectMenuOptionBuilder()
                .setLabel("Welcome Card")
                .setDescription(`Configure RankCard`)
                .setValue("welcome-card")
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
            name: "Welcome System",
            url: "https://discord.gg/kYr3sZ6gJs",
          })
          .setDescription(
            "**Select an option from the following list to get started!**\n\n> *Join Our [**Discord**](https://discord.com/invite/fDrwgNG5UN) or dm [@Devansh Yadav](https://discord.com/users/) if you need help!*"
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
              content: "# What are you doing? \nJoin Us: https://discord.com/invite/fDrwgNG5UN",
              ephemeral: true,
            });
          if (i.values) {
            if (i.values[0] === "welcome-channel") {
              let embed = client
                .Embed(false)
                .setAuthor({
                  name: "Welcome Channel",
                  url: "https://discord.gg/kYr3sZ6gJs",
                  iconURL: emoteLink("channel"),
                })
                .setThumbnail(emoteLink("channel"))
                .setDescription(
                  "*Select a channel from given channels to set as welcome channel!*"
                );
              const channelSelect = (disabled = false) =>
                new ChannelSelectMenuBuilder()
                  .setCustomId("welcome-channel")
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
            } else if (i.customId === "welcome-channel") {
              if (!data)
                new Welcome({
                  GuildID: interaction.guild.id,
                  Channel: i.values[0],
                }).save();
              else {
                data.Guild = interaction.guild.id;
                data.Channel = i.values[0];
                data.save();
              }

              await i.update(await home());

            } else if (i.values[0] === "welcome-msg") {
              let embed = client
                .Embed()
                .setAuthor({
                  name: "Setup Welcome Message",
                  url: "https://discord.gg/kYr3sZ6gJs",
                  iconURL: emoteLink("message"),
                })
                .setThumbnail(emoteLink("message"))
                .setDescription(
                  "**Click the button below to set/update welcome message.**\n## Avaliable  Variables\n - `{user:username}` - Returns username eg: deviladam\n - `{user:mention}` - Will Mention User eg: <@" +
                    i.user +
                    ">\n - `{user:createdAt}` - Retruns User's Acount Creation Data\n - `{guild:memberCount}` - Returns Guild Member Count\n - `{guild:name}` - Returns Guild Name"
                );
              await i.update({
                embeds: [embed],
                components: [msgRow, homeRow],
              });
            } else if (i.values[0] === "welcome-card") {
              await i.update({
                embeds: [client.Embed(false).setDescription("Wait a sec!")],
                components: [],
              });
              if (timeouted) return;
              await message.edit(await WelcomeCard());
            } else if (i.values[0] === "welcome-reset") {
              let yesBtn = new ButtonBuilder()
                .setCustomId("welcome-reset-yes")
                .setStyle(3)
                .setLabel("Yes!");
              let noBtn = new ButtonBuilder()
                .setCustomId("welcome-reset-no")
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
          } else if (i.customId === "welcome-message-btn") {
            const input_1 = new TextInputBuilder()
              .setCustomId("welcomeMsg")
              .setLabel("Welcome Message")
              .setRequired(true)
              .setPlaceholder("Enter some text!")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(1000);

            const modal = new ModalBuilder()
              .setCustomId("welcomeMsg")
              .setTitle("Welcome System")
              .addComponents(new ActionRowBuilder().addComponents(input_1));

            await i.showModal(modal);

            const response = await interaction.awaitModalSubmit({
              filter: (i) =>
                i.customId === "welcomeMsg" &&
                i.user.id === interaction.user.id,
              time: 60 * 1000,
            });

            if (response.isModalSubmit()) {
              if (data)
                new Welcome({
                  Guild: interaction.guild.id,
                  Message: response.fields.fields.get("welcomeMsg").value,
                }).save();
              else {
                data.GuildID = interaction.guild.id;
                data.Message = response.fields.fields.get("welcomeMsg").value;
                data.save();
              }

              await response.update(await home());
            }
          } else if (i.customId.includes("welcomeCard")) {
            const WelcomeCardData = await WelcomeCardDB.findOne({
              Guild: interaction.guild.id,
            });
            let whichBtn = i.customId.replace("welcomeCard-", "");
            if (whichBtn === "reset") {
              await i.update({
                embeds: [client.Embed(false).setDescription("Wait a sec!")],
                components: [],
                files: [],
              });

              await WelcomeCardDB.deleteMany({
                Guild: interaction.guild.id,
              });
              if (timeouted) return;

              await message.edit(await WelcomeCard());

              return;
            } else if (whichBtn === "bg") {
              const input_1 = new TextInputBuilder()
                .setCustomId("welcomeCard")
                .setLabel("Background")
                .setRequired(true)
                .setPlaceholder("Enter Valid Picture URL")
                .setStyle(1)
                .setMaxLength(300);

              const modal = new ModalBuilder()
                .setCustomId("welcomeCardBg")
                .setTitle("Welcome System")
                .addComponents(new ActionRowBuilder().addComponents(input_1));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "welcomeCardBg" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              if (response.isModalSubmit()) {
                let value = response.fields.fields.get("welcomeCardBg").value;

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
                if (!WelcomeCardData) {
                  if (whichBtn === "bg")
                    await new WelcomeCardDB({
                      Guild: interaction.guild.id,
                      Background: value,
                    }).save();
                } else {
                  WelcomeCardData.Background = value;
                  await WelcomeCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await WelcomeCard());
            } else if (whichBtn === "title") {
              const input_2 = new TextInputBuilder()
                .setCustomId("welcomeCardTitle")
                .setLabel("Title")
                .setRequired(true)
                .setPlaceholder("Enter Title")
                .setStyle(1)
                .setMaxLength(15);

              const modal = new ModalBuilder()
                .setCustomId("welcomeCardTitle")
                .setTitle("Welcome System")
                .addComponents(new ActionRowBuilder().addComponents(input_2));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "welcomeCardTitle" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              if (response.isModalSubmit()) {
                let value =
                  response.fields.fields.get("welcomeCardTitle").value;

                if (!WelcomeCardData) {
                  await new WelcomeCardDB({
                    Guild: interaction.guild.id,
                    Title: value,
                  }).save();
                } else {
                  WelcomeCardData.Title = value;
                  await WelcomeCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await WelcomeCard());
            } else if (whichBtn === "message") {
              const input_3 = new TextInputBuilder()
                .setCustomId("welcomeCardMessage")
                .setLabel("Message")
                .setRequired(true)
                .setPlaceholder("Enter Message")
                .setStyle(1)
                .setMaxLength(35);

              const modal = new ModalBuilder()
                .setCustomId("welcomeCardMessage")
                .setTitle("Welcome System")
                .addComponents(new ActionRowBuilder().addComponents(input_3));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "welcomeCardMessage" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              if (response.isModalSubmit()) {
                let value =
                  response.fields.fields.get("welcomeCardMessage").value;

                if (!WelcomeCardData) {
                  await new WelcomeCardDB({
                    Guild: interaction.guild.id,
                    Message: value,
                  }).save();
                } else {
                  WelcomeCardData.Message = value;
                  await WelcomeCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await WelcomeCard());
            } else if (whichBtn === "color") {
              const input_3 = new TextInputBuilder()
                .setCustomId("welcomeCardColor")
                .setLabel("Color")
                .setRequired(true)
                .setPlaceholder("Enter Hex Code")
                .setStyle(1)
                .setMaxLength(6);

              const modal = new ModalBuilder()
                .setCustomId("welcomeCardColor")
                .setTitle("Welcome System")
                .addComponents(new ActionRowBuilder().addComponents(input_3));

              await i.showModal(modal);

              const response = await interaction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === "welcomeCardColor" &&
                  i.user.id === interaction.user.id,
                time: 60 * 1000,
              });

              if (response.isModalSubmit()) {
                let value =
                  response.fields.fields.get("welcomeCardColor").value;

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

                if (!WelcomeCardData) {
                  await new WelcomeCardDB({
                    Guild: interaction.guild.id,
                    Color: value,
                  }).save();
                } else {
                  WelcomeCardData.Color = value;
                  await WelcomeCardData.save();
                }

                await response.update({
                  embeds: [client.Embed(false).setDescription("Wait a sec!")],
                  components: [],
                  files: [],
                });
              }

              if (timeouted) return;

              await message.edit(await WelcomeCard());
            }
          } else if (i.customId === "welcome-reset-yes") {
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
            const data = await Welcome.findOne({
              GuildID: interaction.guild.id,
            });
            const data2 = await WelcomeCardDB.findOne({
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
                await Welcome.deleteMany({
                  GuildID: interaction.guild.id,
                });

              if (data2)
                await WelcomeCardDB.deleteMany({
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
            i.customId === "welcome-reset-no"
          )
            await i.update(await home());

          async function home() {
            const Newdata = await Welcome.findOne({
              GuildID: interaction.guild.id,
            });
            const NewRow = new ActionRowBuilder().addComponents(
              select(false, Newdata && Newdata.Welcome)
            );
            return {
              files: [],
              embeds: [homeEmbed],
              content: "",
              components: [NewRow],
            };
          }

          async function WelcomeCard() {
            const WelcomeCardData = await WelcomeCardDB.findOne({
              Guild: interaction.guild.id,
            });
            let titleBtn = new ButtonBuilder()
              .setCustomId("welcomeCard-title")
              .setStyle(3)
              .setLabel("Title");
            let messageBtn = new ButtonBuilder()
              .setCustomId("welcomeCard-message")
              .setStyle(3)
              .setLabel("Message");
            let bgBtn = new ButtonBuilder()
              .setCustomId("welcomeCard-bg")
              .setStyle(3)
              .setLabel("Background");
            let colorBtn = new ButtonBuilder()
              .setCustomId("welcomeCard-color")
              .setStyle(3)
              .setLabel("Color");
            let WelcomeCardDataReset = new ButtonBuilder()
              .setCustomId("welcomeCard-reset")
              .setStyle(2)
              .setLabel("Reset")
              .setEmoji("979818265582899240")
              .setDisabled(WelcomeCardData ? false : true);

            const welcomeCardRow = new ActionRowBuilder().addComponents(
              titleBtn,
              messageBtn,
              bgBtn,
              colorBtn,
              WelcomeCardDataReset
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
                WelcomeCardData &&
                  WelcomeCardData.Background &&
                  (await isImageURLValid(WelcomeCardData.Background))
                  ? WelcomeCardData.Background
                  : "https://cdn.treobot.me/image-5.png"
              )
              .setColor(
                WelcomeCardData && WelcomeCardData.BoderColor
                  ? "#" + WelcomeCardData.BoderColor
                  : "#fb0237"
              )
              .setTitle(
                WelcomeCardData && WelcomeCardData.Title
                  ? WelcomeCardData.Title
                  : "WELCOME"
              )
              .setMessage(
                WelcomeCardData && WelcomeCardData.Message
                  ? WelcomeCardData.Message
                  : "Welcome To The Server"
              );
            const output = await Card.build();

            return {
              files: [
                {
                  attachment: output,
                  name: `welcome-${interaction.user.id}.png`,
                },
              ],
              embeds: [],
              components: [welcomeCardRow, homeRow],
            };
          }
        });

        collector.on("end", async (i) => {});
        collector.on("stop", async (i) => {});

        const timeout = setTimeout(async () => {
          try {
            timeouted = true;
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