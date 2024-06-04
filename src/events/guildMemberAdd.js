const colors = require("colors");
const { welcomeCard } = require('greetify');
const Discord = require("discord.js");
const Welcome = require(`${process.cwd()}/src/database/welcome.js`);
const WelcomeCardDB = require(`${process.cwd()}/src/database/welcomeCard.js`);
const mongoose = require('mongoose');

module.exports = {
    async execute(client) {
        client.on("guildMemberAdd", async (member) => {
            if (member.user.bot) return;

           
      
            const guildId = member.guild.id;

            const welcomeData = await Welcome.findOne({ GuildID: guildId });
            if (welcomeData) {
                const cardData = await WelcomeCardDB.findOne({ Guild: guildId });

                const Card = new welcomeCard()
                    .setName(member.user.username)
                    .setAvatar(member.user.displayAvatarURL())
                    .setMessage(cardData ? cardData.Message : `Welcome to our server`)
                    .setBackground(cardData ? cardData.Background : "https://media.discordapp.net/attachments/1150054842048450602/1198303755997810818/f.gif?ex=65be6a56&is=65abf556&hm=8340698b47ba65b8788452225006df78bbecd815fb1f2df58cfa17e4947cacab&=&width=692&height=389")
                    .setColor(cardData ? cardData.Color : "0fffc0")
                    .setTitle(cardData ? cardData.Title : "Welcome");

                const output = await Card.build();
                const attachment = new Discord.AttachmentBuilder(output, { name: `welcome.png` });

                let channel = member.guild.channels.cache.get(welcomeData.Channel);
                if (!channel) return;

                let Msg = welcomeData.Message || "🔥 Welcome {user:mention} to **{guild:name}** 🔥\n\n **Server Info**\n> 💫  User Position: **{user:position}**\n> 💫  Member Count: **{guild:memberCount}**\n> 💫  User Created At: **{user:createdAt}**\n> 💫  User Name: **{user:username}**";




                Msg = Msg.replace("{user:mention}", `${member}`)
                    .replace("{user:username}", `${member.user.username}`)
                .replace("{user:position}", `${member.guild.memberCount - member.guild.members.cache.filter(member => member.user.bot).size}`)
                    .replace("{guild:memberCount}", `${member.guild.memberCount}`)
                    .replace("{guild:name}", `${member.guild.name}`)
                    .replace("{user:createdAt}", `<t:${parseInt(member.user.createdAt / 1000)}:R>`, true);

                if (channel) {
                    channel.send({
                        embeds: [new Discord.EmbedBuilder().setTitle(`Welcome ${member.user.username}`).setColor("0fffc0").setDescription(Msg).setThumbnail(member.guild.iconURL({ dynamic: true })).setImage("attachment://welcome.png")],
                        files: [attachment],
                    });
                }
            }
        });
    },
};