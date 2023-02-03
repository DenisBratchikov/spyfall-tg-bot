const mongoose = require('mongoose');

const PersonDefinition = {
  id: Number,
  username: String,
  name: String,
  chatId: Number,
  words: [String]
};

const GameRoom = mongoose.model('Game', {
  mode: String,
  adminId: Number,
  inProgress: Boolean,
  admin: PersonDefinition,
  players: [PersonDefinition],
  usedWords: [String]
});

module.exports = { GameRoom };
