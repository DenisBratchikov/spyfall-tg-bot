module.exports = {
  editgame: {
    command: '/editgame',
    description: 'Редактировать созданную игру'
  },
  help: {
    command: '/help',
    description: 'Показать доступные команды с описанием'
  },
  join: { command: '/start', description: 'Присоединиться к игре' },
  leavegame: { command: '/leavegame', description: 'Покинуть текущую игру' },
  newgame: { command: '/newgame', description: 'Начать новую игру' },
  rungame: { command: '/rungame', description: 'Начать / продолжить игру' },
  sendwords: {
    command: '/sendwords',
    description: 'Отправить слова для режима игры со своими словами'
  },
  showplayers: {
    command: '/showplayers',
    description: 'Показать всех игроков'
  },
  start: { command: '/start', description: 'Запустить бот' },
  stopgame: {
    command: '/finishgame',
    description: 'Завершить и удалить созданную игру'
  }
};
