const { editgame } = require('./aliases');
const { MODES, MODES_MAP } = require('../constants');
const { GameRoom } = require('../db');

const MODE_FIELD = 'mode';

function getContentAndMarkup(room) {
  const modeButtons = [
    {
      text: `Режим - ${MODES_MAP[MODES.classic]}`,
      mode: MODES.classic,
      callback_data: `${editgame.command} ${MODE_FIELD} ${MODES.classic}`
    },
    {
      text: `Режим - ${MODES_MAP[MODES.films]}`,
      mode: MODES.films,
      callback_data: `${editgame.command} ${MODE_FIELD} ${MODES.films}`
    },
    {
      text: `Режим - ${MODES_MAP[MODES.custom]}`,
      mode: MODES.custom,
      callback_data: `${editgame.command} ${MODE_FIELD} ${MODES.custom}`
    }
  ].filter(({ mode }) => room.mode !== mode);

  return {
    msg: [
      'Текущие настройки игры:',
      `✔ режим - *${MODES_MAP[room.mode]}*`,
      'Вы можете поменять настройки с помощью кнопок под этим сообщением.'
    ].join('\n'),
    options: {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [modeButtons]
      }
    }
  };
}

async function handler({ id }) {
  const room = await GameRoom.findOne({ adminId: id });
  if (!room) {
    return {
      msg: 'У вас нет созданных игр. Для редактирования сначала создайте игру.'
    };
  }

  return getContentAndMarkup(room);
}

async function keyboardCallback(from_id, data) {
  const room = await GameRoom.findOne({ adminId: from_id });
  if (!room) {
    return {
      msg: 'Ошибка обновления настроек - игра не найдена! Пожалуйста, создайте новую игру.'
    };
  }

  const [_, field, value] = data.split(' ');

  if (field === MODE_FIELD) {
    const newMode = Object.values(MODES).find((mode) => mode === value);
    if (newMode) {
      room.mode = newMode;
      await room.save();
    }
  }

  return getContentAndMarkup(room);
}

module.exports = {
  ...editgame,
  handler,
  keyboardCallback
};
