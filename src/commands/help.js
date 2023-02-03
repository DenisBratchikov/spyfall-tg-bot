const {
  editgame,
  help,
  leavegame,
  newgame,
  rungame,
  sendwords,
  showplayers,
  stopgame
} = require('./aliases');
const {
  WORDS_COUNT,
  MODES,
  MODES_MAP,
  MAX_PLAYERS_COUT
} = require('../constants');

const RULES = `<a href="https://hobbyworld.ru/download/rules/SPY_rules_new-web.pdf">правила</a>`;
const RULES_FILMS = `<a href="https://www.youtube.com/watch?v=oOjVzsPTd08">пример игры</a>`;

const MSG = [
  'Доступные команды:',
  `${newgame.command} - создает новую игру и генерирует ссылку для присоединения к игре` +
    ` (одновременно может быть только одна игра, перед созданием новой игры необходимо завершить текущую командой ${stopgame.command});`,
  `${editgame.command} - позволяет изменять настройки созданной игры (на данный момент - только режим игры);`,
  `${rungame.command} - запускает созданную игру / начинает новый раунд (команду следует отправлять, когда присоединились все участники);`,
  `${stopgame.command} - завершает текущую игру игру;`,
  `${leavegame.command} - позволяет покинуть текущую игру одному из участников.`,
  `${showplayers.command} - показать игроков, присоединившихся к игре.`,
  `${sendwords.command} - отправить слова для режима игры "${
    MODES_MAP[MODES.custom]
  }"`,
  `Максимальное число участников - ${MAX_PLAYERS_COUT}`,
  'Правила игры:',
  `✔ ${MODES_MAP[MODES.classic]} - ${RULES};`,
  `✔ ${MODES_MAP[MODES.films]} - ${RULES_FILMS};`,
  `✔ ${
    MODES_MAP[MODES.custom]
  } - те же правила, что и для классического варианта, но набор секретных слов формируется игроками перед игрой.`,
  `В последнем варианте после отправки команды ${newgame.command} всем игрокам будет предложено отправить ${WORDS_COUNT} секретных слов.` +
    'Игра начнется, как только все участники отправят слова.'
].join('\n');

async function handler() {
  return {
    msg: MSG,
    options: { parse_mode: 'HTML' }
  };
}

module.exports = {
  ...help,
  handler,
  RULES,
  RULES_FILMS
};
