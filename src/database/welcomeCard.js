const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Title: { type: String, default: "Welcome"},
    Message: { type: String, default: "Welcome To Our Server"},
    Background: {
        type: String,
        default: "https://cdn.discordapp.com/attachments/1194904102832963625/1196910810681839776/image.png?ex=65b9590e&is=65a6e40e&hm=d438c96244818eb05d97766d2401800249cdb541b6dd2434ce946ec4672ab730&"
    },
    Color: {
        type: String,
        default: "0fffc0"
    }
});

module.exports = mongoose.model("WelcomeCard", Schema);