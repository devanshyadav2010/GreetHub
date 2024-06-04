const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    GuildID: String,
    Channel: String,
    Message: String,
});

module.exports = mongoose.model("Leave", Schema);