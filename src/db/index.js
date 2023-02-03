const mongoose = require('mongoose');
const { GameRoom } = require('./room');
const { Films } = require('./films');
const { Locations } = require('./locations');

mongoose.connect(process.env.MONGO_URL);

module.exports = { GameRoom, Films, Locations };
