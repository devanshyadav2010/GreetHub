const colors = require("colors");
const { welcomeCard } = require('greetify');
const Discord = require("discord.js");
const Leave = require(`${process.cwd()}/src/database/Leave.js`);
const LeaveCardDB = require(`${process.cwd()}/src/database/LeaveCard.js`);
const mongoose = require('mongoose');

module.exports = {
    async execute(client) {
        client.on("guildMemberRemove", async (member) => {
            if (member.user.bot) return;

           
      
            const guildId = member.guild.id;

            const LeaveData = await Leave.findOne({ GuildID: guildId });
            if (LeaveData) {
                const cardData = await LeaveCardDB.findOne({ Guild: guildId });

                const Card = new welcomeCard()
                    .setName(member.user.username)
                    .setAvatar(member.user.displayAvatarURL())
                    .setMessage(cardData ? cardData.Message : `${member.user.username} Leaved The Server`)
                    .setBackground(cardData ? cardData.Background : "https://cdn.treobot.me/image-5.png")
                    .setColor(cardData ? cardData.Color : "0fffc0")
                    .setTitle(cardData ? cardData.Title : "GoodBye");

                const output = await Card.build();
                const attachment = new Discord.AttachmentBuilder(output, { name: `Leave.png` });

                let channel = member.guild.channels.cache.get(LeaveData.Channel);
                if (!channel) return;

                let Msg = LeaveData.Message || `🌠 {user:mention} Leaved The **{guild:name}** 🌠

> **Server Info**
> 💫  Member Count: **{guild:memberCount}**
> 💫  User Created At: **{user:createdAt}**
> 💫  User Name: **{user:username}**
`;




                Msg = Msg.replace("{user:mention}", `${member}`)
                    .replace("{user:username}", `${member.user.username}`)
                    .replace("{guild:memberCount}", `${member.guild.memberCount}`)
                    .replace("{guild:name}", `${member.guild.name}`)
                    .replace("{user:createdAt}", `<t:${parseInt(member.user.createdAt / 1000)}:R>`, true);

                if (channel) {
                    channel.send({
                        embeds: [new Discord.EmbedBuilder().setTitle(`Leave ${member.user.username}`).setColor("0fffc0").setDescription(Msg).setThumbnail(member.guild.iconURL({ dynamic: true })).setImage("attachment://Leave.png")],
                        files: [attachment],
                    });
                }
            }
        });
    },
};