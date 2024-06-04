const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
module.exports = {
	name: 'help',
	description: "help command of GreetHub",
  usage: "",
  category: "info",
	userPerms: [''],
	botPerms: [''],
	cooldown: 30,
  guildOnly: false,
  ownerOnly: false,
  toggleOff: false,
  nsfwOnly: false,
  maintenance: false,
	type: ApplicationCommandType.ChatInput,
	run: async (client, interaction) => {
    try{
        
        const embed = client.Embed()
        .setAuthor({ name: "Greethub's Help Menu", iconURL: `${interaction.user.displayAvatarURL()}`})
        .setColor("fc0834")
        .setThumbnail(client.user.displayAvatarURL())
        .setImage("https://cdn.discordapp.com/attachments/1166075911045656638/1247363258311114752/greethub.gif?ex=665fc10f&is=665e6f8f&hm=a3869a6beed5809c02ff822b3cb797ea490b61cbf61f7a229ab811659a58fe70&")
        .addFields(
        { name: "<:information:1247341266514219039> Information [4]", value: `${client.slashCommands.filter((cmd) => cmd.category === "info").sort((a, b) => a.name.localeCompare(b?.name)).map((cmd) => `\`${cmd.name}\``).join("︲") || "No slash command in this category"}`, inline: true},
        { name: "<:rocket:1247341254635683892> Welcome [2]", value: `${client.slashCommands.filter((cmd) => cmd.category === "welcome").sort((a, b) => a.name.localeCompare(b?.name)).map((cmd) => `\`${cmd.name}\``).join("︲") || "No slash command in this category"}`, inline: true}
        )
        const row = new ActionRowBuilder()
        .addComponents(
        new ButtonBuilder()
            .setLabel("Invite")
            .setEmoji("<:link:1247345804730044466>")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/oauth2/authorize?client_id=1157637157016584192&permissions=8&scope=bot+applications.commands"),
        new ButtonBuilder()
            .setLabel("Support")
            .setEmoji("<:topgg:1247371536105476166>")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/${client.config.CLIENT_ID}/vote`),
        new ButtonBuilder()
            .setLabel("Source Code")
            .setEmoji("<:github:1247355542645637120>")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/devanshyadav2010/Greethub"),
        )
        
        await interaction.reply({ embeds: [embed], components: [row] })
        
                 } catch (error){
      client.slash_err(client, interaction, error);
    }
	}
};