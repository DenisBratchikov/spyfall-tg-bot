const { stopgame } = require('./aliases');
const { GameRoom } = require('../db');

async function handler({ id }) {
  const room = await GameRoom.findOne({ adminId: id });

  if (!room) {
    return { msg: 'Игр, которые можно удалить, не найдено.' };
  }

  await room.deleteOne();

  return {
    msg: 'Игра успешно завершена! Теперь вы можете создать новую игру.'
  };
}

module.exports = {
  ...stopgame,
  handler
};
