const { leavegame, stopgame } = require('./aliases');
const { GameRoom } = require('../db');

async function handler(person) {
  const createdRoom = await GameRoom.findOne({ adminId: person.id });

  if (createdRoom) {
    return {
      msg: `Вы не можете покинуть игру, которую создали. Необходимо завершить ее для всех учестников командой ${stopgame.command}`
    };
  }

  const room = await GameRoom.findOne({ 'players.id': person.id });

  if (!room) {
    return {
      msg: 'Вы не состоите ни в одной игре'
    };
  }

  room.players = room.players.filter(({ id }) => id !== person.id);
  await room.save();

  return {
    msg: 'Вы покинули игру'
  };
}

module.exports = {
  ...leavegame,
  handler
};
