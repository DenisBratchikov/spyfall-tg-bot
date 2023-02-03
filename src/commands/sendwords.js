const { sendwords } = require('./aliases');
const { BOT_NAME, MODES, MODES_MAP, WORDS_COUNT } = require('../constants');
const { GameRoom } = require('../db');

const WORDS_REGEX = /^(\d)?[\.\s]?\s*(\S.*?)\s*[,\.;]?$/;
const NO_GAMES_ERROR =
  'У вас нет созданных игр и вы не состоите ни в одной игре.';
const ROOM_IN_PROGRESS_ERROR =
  'Нельзя изменять слова уже начатой игры. Необходимо закончить текущую игру и начать новую.';

const DEFAULT_INTRODUCTION =
  'Для задания секретных слов ответьте на это сообщение (клик правой кнопкой мыши на ПК / слайд в сторону в мобильном приложении).';

function getWordsMessage(player, introduction) {
  const result = [
    introduction ??
      `Для начала игры необходимо отправить секретные слова (в соответствии с текущим режимом игры) командой ${sendwords.command}.`
  ];

  result.push(
    `Вы отправили <strong>${
      player.words.length
    } / ${WORDS_COUNT}</strong> слов${player.words.length ? ':' : '.'}`,
    ...player.words.filter((word) => !!word).map((word) => `✔ ${word}`)
  );

  if (player.words.length === WORDS_COUNT) {
    result.push('Ожидайте начала игры.');
  }

  return result.join('\n');
}

async function getPlayerRoom(person) {
  const rooms = await GameRoom.find({
    $or: [{ 'players.id': person.id }, { adminId: person.id }]
  });

  if (!rooms.length) {
    throw new Error(NO_GAMES_ERROR);
  }

  const [room] = rooms;

  if (room.mode !== MODES.custom) {
    throw new Error(
      `Текущая игра не поддерживает отправку слов. Используйте режим *"${
        MODES_MAP[MODES.custom]
      }"* для игры со своими словами.`
    );
  }

  return room;
}

function errHandler(err) {
  return {
    msg: err.message,
    options: { parse_mode: 'Markdown' }
  };
}

async function handler(person) {
  return getPlayerRoom(person)
    .then((room) => {
      if (room.inProgress) {
        return { msg: ROOM_IN_PROGRESS_ERROR };
      }
      return {
        cb: (bot, message) => {
          bot.sendMessage(
            message.chat.id,
            [
              DEFAULT_INTRODUCTION,
              'В ответном сообщении отправьте список секретных слов *(не более 200 символов!)*. Например, если вы загадываете города:',
              'Санкт-Петербург',
              'Токио',
              '....',
              'Амстердам',
              `*Важно* начинать каждое секретное слово с новой строки! Максимум - ${WORDS_COUNT} слов.`,
              'Вы можете отправить слова несколькими сообщениями: по одному / два и т.д.',
              'Если вы хотите исправить некоторые слова - отправьте в ответе порядковый номер и новое слово, например:',
              '1. Москва',
              '3. Чикаго',
              'Слова без нумерации или с некорректным номером будут проигнорированы.'
            ].join('\n'),
            { parse_mode: 'Markdown' }
          );
        }
      };
    })
    .catch(errHandler);
}

function checkReply(text) {
  if (text.length < 1) {
    return 'Слишком короткий ответ!';
  } else if (text.length > 200) {
    return 'Слишком длинный ответ!';
  }
}

function updatePlayerWords(player, text) {
  text.split('\n').forEach((str) => {
    const match = str.match(WORDS_REGEX);
    if (!match?.length) {
      return;
    }

    const [_, ordinalNumber, secret] = match;
    const position = ordinalNumber - 1;
    if (!secret) {
      return;
    }

    if (
      !position &&
      player.words.length < WORDS_COUNT &&
      !player.words.includes(secret)
    ) {
      player.words.push(secret);
    } else if (
      position >= 0 &&
      position < WORDS_COUNT &&
      player.words[position]
    ) {
      player.words[position] = secret;
    }
  });
}

function getReplyHandler(message, person) {
  const replyMsg = message.reply_to_message;
  if (
    replyMsg &&
    replyMsg.from.is_bot &&
    replyMsg.from.username === BOT_NAME &&
    replyMsg.text.startsWith(DEFAULT_INTRODUCTION)
  ) {
    return async (bot) => {
      const text = message.text.trim();

      const invalidTextMsg = checkReply(text);
      if (invalidTextMsg) {
        return bot.sendMessage(message.chat.id, invalidTextMsg, {
          parse_mode: 'Markdown'
        });
      }

      const { msg, options } = await getPlayerRoom(person)
        .then(async (room) => {
          if (room.inProgress) {
            return { msg: ROOM_IN_PROGRESS_ERROR };
          }

          let player;

          if (room.adminId === person.id) {
            player = room.admin;
          } else {
            const playerIndex = room.players.findIndex(
              (player) => player.id === person.id
            );
            if (playerIndex === -1) {
              throw new Error(NO_GAMES_ERROR);
            }
            player = room.players[playerIndex];
          }

          updatePlayerWords(player, text);

          await room.save();

          return {
            msg: getWordsMessage(player, 'Секретные слова успешно записаны!'),
            options: { parse_mode: 'HTML' }
          };
        })
        .catch(errHandler);
      bot.sendMessage(message.chat.id, msg, options);
    };
  }
}

module.exports = {
  ...sendwords,
  handler,
  getWordsMessage,
  getReplyHandler
};
