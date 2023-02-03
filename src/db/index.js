const mongoose = require('mongoose');
const { GameRoom } = require('./room');
const { Films } = require('./films');
const { Locations } = require('./locations');

mongoose.connect('');

module.exports = { GameRoom, Films, Locations };
