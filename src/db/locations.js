const STORE = [
  'Орбитальная станция',
  'Воинская часть',
  'Университет',
  'Полицейский участок',
  'Корпоративная вечеринка',
  'Подводная лодка',
  'Пляж',
  'База террористов',
  'Отель',
  'Церковь',
  'Казино',
  'Пиратский корабль',
  'Больница',
  'Войско крестоносцев',
  'Театр',
  'Самолет',
  'Киностудия',
  'Посольство',
  'Полярная станция',
  'Супермаркет',
  'Цирк-шапито',
  'Банк',
  'Океанский лайнер',
  'Станция техобслуживания',
  'Спа-салон',
  'Пассажирский поезд',
  'Овощебаза',
  'Ресторан',
  'Партизанский отряд',
  'Школа',
  'Стрипбар',
  'Психбольница',
  'Белый дом',
  'ЗАГС',
  'Следственный изолятор',
  'Суд'
];

const Locations = {
  aggregate() {
    return {
      async exec() {
        return STORE;
      }
    };
  }
};

module.exports = {
  Locations
};
