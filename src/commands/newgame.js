const { newgame, stopgame, rungame } = require('./aliases');
const { GameRoom } = require('../db');
const { TG_URL, BOT_NAME, MODES } = require('../constants');
const { getWordsMessage } = require('./sendwords');

function getGameUrl(id) {
  const url = new URL(BOT_NAME, TG_URL);
  url.searchParams.append('start', id);
  return url.toString();
}

async function handler(admin) {
  const options = { parse_mode: 'HTML' };

  const room = await GameRoom.findOne({ adminId: admin.id });
  if (room) {
    const url = getGameUrl(room.id);
    return {
      msg: `Вы уже создали игру ${url}! Для создания новой, сначала завершите текущую игру командой ${stopgame.command}`
    };
  }

  const adminData = { ...admin, words: [] };

  const newRoom = new GameRoom({
    mode: MODES.custom,
    adminId: admin.id,
    inProgress: false,
    admin: adminData,
    players: []
  });

  return newRoom.save().then((data) => {
    const url = getGameUrl(data.id);
    const creationMsg = `Игра успешно создана! Отправьте ссылку ${url} участникам и, когда все будут готовы, отправьте команду ${rungame.command}.`;
    return {
      msg:
        creationMsg +
        (data.mode === MODES.custom ? `\n${getWordsMessage(adminData)}` : ''),
      options
    };
  });
}

module.exports = {
  ...newgame,
  handler
};
