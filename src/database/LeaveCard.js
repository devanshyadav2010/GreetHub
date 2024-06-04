const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Title: { type: String, default: "GoodBye"},
    Message: { type: String, default: "One Member Leaved Server"},
    Background: {
        type: String,
        default: "https://cdn.treobot.me/image-5.png"
    },
    Color: {
        type: String,
        default: "0fffc0"
    }
});

module.exports = mongoose.model("LeaveCard", Schema);