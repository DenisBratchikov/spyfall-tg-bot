const editgame = require('./editgame');
const help = require('./help');
const leavegame = require('./leavegame');
const newgame = require('./newgame');
const rungame = require('./rungame');
const sendwords = require('./sendwords');
const showplayers = require('./showplayers');
const stopgame = require('./stopgame');

const startBot = require('./start');
const joinGame = require('./join');

module.exports = {
  userCommands: [
    editgame,
    help,
    leavegame,
    newgame,
    rungame,
    sendwords,
    showplayers,
    stopgame
  ],
  startBot,
  joinGame
};
