const { join, leavegame, stopgame } = require('./aliases');
const { MODES, MAX_PLAYERS_COUT } = require('../constants');
const { GameRoom } = require('../db');
const { getWordsMessage } = require('./sendwords');

async function handler(person, text) {
  const roomId = text.split(' ')[1];
  if (!roomId) {
    return { msg: 'Некорректная ссылка на игру!' };
  }

  const createdRoom = await GameRoom.findOne({ adminId: person.id });
  if (createdRoom) {
    return {
      msg: `У вас есть созданная игра. Сначала завершите ее командой ${stopgame.command}, потом присоединяйтесь к другой игре.`
    };
  }

  const [joinedRoom] = (await GameRoom.find({ 'players.id': person.id })) || [];
  if (joinedRoom) {
    const msg =
      joinedRoom.id === roomId
        ? 'Вы уже присоединились к данной игре.'
        : `Вы уже присоединились к другой игре. Сначала покиньте текущую игру командой ${leavegame.command}.`;
    return { msg };
  }

  const room = await GameRoom.findById(roomId);

  if (!room) {
    return {
      msg: 'Игра не найдена! Пожалуйста, проверьте ссылку на игру или создайте игру заново.'
    };
  } else if (room.players.length >= MAX_PLAYERS_COUT - 1) {
    return {
      msg: `Достигнут лимит участников (${MAX_PLAYERS_COUT}) - невозможно присоединиться к данной игре.`
    };
  }

  let player = room.players.find(({ id }) => id === person.id);
  let connectMsg = 'Вы уже присоединились.';

  if (!player) {
    player = { ...person, words: [] };
    room.players.push(player);
    await room.save();
    connectMsg = 'Вы успешно присоединились!';
  }

  const postfix =
    room.mode === MODES.custom
      ? getWordsMessage(player)
      : 'Ожидайте начала игры.';

  return {
    msg: `${connectMsg} ${postfix}`,
    options: { parse_mode: 'HTML' }
  };
}

module.exports = {
  ...join,
  handler
};
