const TG_URL = 'https://t.me/';
const TG_USER_ID_URL = 'tg://user?id=';
const BOT_NAME = 'spyfall_board_game_bot';

const WORDS_COUNT = 6;

const MODES = { films: 'films', classic: 'classic', custom: 'custom' };
const MODES_MAP = {
  [MODES.classic]: 'классика',
  [MODES.films]: 'кино',
  [MODES.custom]: 'свои слова'
};

const COMMON_ERROR_MSG =
  'Внутренняя ошибка приложения. Пожалуйста, повторите позже.';

const MAX_PLAYERS_COUT = 15;

module.exports = {
  TG_URL,
  TG_USER_ID_URL,
  BOT_NAME,
  MODES,
  MODES_MAP,
  COMMON_ERROR_MSG,
  WORDS_COUNT,
  MAX_PLAYERS_COUT
};
