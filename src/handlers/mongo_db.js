const { mongoose } = require("mongoose");
module.exports = async (client) => {
  try {
    const MONGO = client.config.MONGO_DB || process.env.MONGO;
    async function connect() {
        mongoose.set('strictQuery', false);
      mongoose.connect(MONGO, {
        autoIndex: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      }).then(() => client.logger("Connected to MongoDB".bold))
        .catch((err) => console.error("MongoDB ❌\n", err));
    }
    connect()
  } catch (error) {
    console.log(error)
  }
}