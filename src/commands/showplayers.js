const { showplayers } = require('./aliases');
const { TG_USER_ID_URL } = require('../constants');
const { GameRoom } = require('../db');

function getUser({ id, name, username }) {
  return (
    '✔ ' +
    (username
      ? `${name}, @${username}`
      : `<a href="${TG_USER_ID_URL}${id}">${
          name.trim() || 'Name was not defined'
        }</a>`)
  );
}

async function handler(person) {
  const rooms = await GameRoom.find({
    $or: [{ 'players.id': person.id }, { adminId: person.id }]
  });

  if (!rooms.length) {
    return {
      msg: 'У вас нет созданных игр и вы не состоите ни в одной игре.'
    };
  }

  const [room] = rooms;
  const admin = room.admin;

  const players = ['Активные игроки:']
    .concat(
      getUser(admin) + ' <strong>(admin)</strong>',
      room.players.map(getUser)
    )
    .join('\n');
  return {
    msg: players,
    options: {
      parse_mode: 'HTML'
    }
  };
}

module.exports = {
  ...showplayers,
  handler,
  getUser
};
