const TelegramBot = require('node-telegram-bot-api');
const {
  userCommands,
  startBot: startBotCommand,
  joinGame: joinGameCommand
} = require('./commands');
const { COMMON_ERROR_MSG } = require('./constants');

const token = '';

const bot = new TelegramBot(token, { polling: true });

const sendError = (chatId) => {
  bot.sendMessage(chatId, COMMON_ERROR_MSG);
};

bot.setMyCommands(
  userCommands.map(({ command, description }) => ({ command, description }))
);

bot.on('message', async (message) => {
  const chatId = message.chat.id;
  const { from, text } = message;
  const person = {
    name: `${from.last_name || ''} ${from.first_name || ''}`.trim(),
    id: from.id,
    username: from.username,
    chatId
  };

  if (message.reply_to_message) {
    for (let i = 0; i < userCommands.length; i++) {
      const replyHandler = userCommands[i].getReplyHandler?.(message, person);
      if (replyHandler) {
        return replyHandler(bot);
      }
    }
  }

  if (text === startBotCommand.command) {
    return bot.sendMessage(chatId, startBotCommand.handler(), {
      parse_mode: 'HTML'
    });
  } else if (text.startsWith(joinGameCommand.command)) {
    return joinGameCommand
      .handler(person, text)
      .then(({ msg, options }) => bot.sendMessage(chatId, msg, options))
      .catch(() => {
        sendError(chatId);
      });
  }

  const userCommand = userCommands.find(({ command }) => command === text);

  if (userCommand) {
    return userCommand
      .handler(person)
      .then(({ msg, options, cb }) =>
        cb ? cb(bot, message) : bot.sendMessage(chatId, msg, options)
      )
      .catch((err) => {
        sendError(chatId);
      });
  }

  bot.sendMessage(chatId, `Получено сообщение: ${text}`);
});

bot.on('callback_query', (query) => {
  const data = query.data;

  const command = userCommands.find(({ command }) => data.startsWith(command));

  if (!command?.keyboardCallback) {
    bot.sendMessage(query.message.chat.id, COMMON_ERROR_MSG);
  }

  return command
    .keyboardCallback(query.from.id, data)
    .then((result) => {
      if (!result) {
        return;
      }
      const { msg, options, cb } = result;
      if (cb) {
        cb(bot, query);
      } else {
        bot.editMessageText(msg, {
          ...options,
          chat_id: query.message.chat.id,
          message_id: query.message.message_id
        });
      }
    })
    .catch(sendError);
});

bot.startPolling({ restart: true });
