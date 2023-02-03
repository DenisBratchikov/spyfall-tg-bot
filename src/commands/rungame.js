const { rungame, sendwords, stopgame } = require('./aliases');
const { MODES, WORDS_COUNT } = require('../constants');
const { GameRoom, Films, Locations } = require('../db');
const { getWordsMessage } = require('./sendwords');
const { getUser } = require('./showplayers');

const CHASE_COMMAND = 'chase';
const CHASE_BUTTON = {
  text: 'Поторопить игроков',
  callback_data: `${rungame.command} ${CHASE_COMMAND}`
};

function getFewWordsPlayers(players) {
  return players.filter((item) => item.words.length < WORDS_COUNT);
}

function getPlayerString(player) {
  return `${getUser(player)} - ${player.words.length} / ${WORDS_COUNT} слов`;
}

function getChaseMessage(players) {
  return [`Не все игроки отправили по ${WORDS_COUNT} слов:`]
    .concat(players.map(getPlayerString))
    .join('\n');
}

async function handler(person) {
  const room = await GameRoom.findOne({ adminId: person.id });
  if (!room) {
    return {
      msg: 'У вас нет созданных игр.'
    };
  }

  const playersCount = room.players.length;
  if (playersCount < 2) {
    return {
      msg: `Недостаточно игроков. Требуется минимум 3 игрока (текущее количество: ${
        playersCount + 1
      })`
    };
  }

  if (room.mode === MODES.custom) {
    if (room.admin.words.length < WORDS_COUNT) {
      return {
        msg: getWordsMessage(room.admin),
        options: { parse_mode: 'HTML' }
      };
    }
    const fewWordsPlayers = getFewWordsPlayers(room.players);
    if (fewWordsPlayers.length) {
      return {
        msg: getChaseMessage(fewWordsPlayers),
        options: {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[CHASE_BUTTON]]
          }
        }
      };
    }
  }

  const players = room.players.concat(room.admin.toJSON());
  let secret;
  let shouldSaveRoom = !room.inProgress;

  if (room.mode === MODES.custom) {
    const words = players.reduce((acc, player) => {
      return acc.concat(
        player.words.filter((word) => !room.usedWords.includes(word))
      );
    }, []);

    if (words.length === 0) {
      return {
        msg: `Сыграны все заданные слова. Завершите текущую игру командой ${stopgame.command} и начните новую.`
      };
    }

    const randIndex = Math.floor(Math.random() * words.length);
    secret = words[randIndex];
    if (secret) {
      room.usedWords.push(secret);
      shouldSaveRoom = true;
    }
  } else {
    [secret] = await (room.mode === MODES.films ? Films : Locations)
      .aggregate([{ $sample: { size: 1 } }])
      .exec();
  }

  if (!secret) {
    return {
      msg: `Не удалось получить секретное слово. Пожалуйста, попробуйте позже`
    };
  }

  if (shouldSaveRoom) {
    room.inProgress = true;
    await room.save();
  }

  return {
    cb: (bot) => {
      const spyIndex = Math.floor(Math.random() * players.length);
      players.forEach((elem, i) => {
        const msg = i === spyIndex ? 'Вы шпион!' : secret;
        bot.sendMessage(elem.chatId, msg);
      });
    }
  };
}

async function keyboardCallback(from_id, data) {
  const room = await GameRoom.findOne({ adminId: from_id });
  if (!room) {
    return {
      msg: 'Ошибка - игра не найдена! Пожалуйста, создайте новую игру.'
    };
  }

  const [_, command] = data.split(' ');

  if (command !== CHASE_COMMAND) {
    return { msg: 'Неизвестная команда. Пожалуйста, повторите позже.' };
  }

  return {
    cb: (bot, query) => {
      const fewWordsPlayers = getFewWordsPlayers(room.players);
      fewWordsPlayers.forEach(({ chatId }) => {
        bot.sendMessage(
          chatId,
          `Пожалуйста, отправьте свои секретные слова командой ${sendwords.command} для старта игры.`
        );
      });
      bot.editMessageText(
        `${getChaseMessage(fewWordsPlayers)}\n` +
          '<strong>Уведомления отправлены!</strong>',
        {
          parse_mode: 'HTML',
          chat_id: query.message.chat.id,
          message_id: query.message.message_id
        }
      );
    }
  };
}

module.exports = {
  ...rungame,
  handler,
  keyboardCallback
};
