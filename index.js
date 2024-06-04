const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
require(`colors`)
const client = new Client({
  allowedMentions: {
    parse: ["roles", "users", "everyone"],
    repliedUser: false,
  },
  intents: ["3276799"],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});


[`variables`, `extraEvents`, `checker`, `mongo_db`, `server`, 'slashCommand', 'events', `antiCrash`].forEach((handler) => {
  const file = require(`./src/handlers/${handler}`)
  if (file.execute) file.execute(client);
  else file(client);
});

client.login(client.config.TOKEN).catch((error) => { console.log((error.message).bold.red) });


module.exports = client;