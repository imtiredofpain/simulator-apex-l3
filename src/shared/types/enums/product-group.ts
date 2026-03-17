export const ProductGroups = {
  '0': {
    name: 'NaN',
    description: 'Не определена',
  },
  '1': {
    name: 'lp',
    description:
      'Предметы одежды, белье постельное, столовое, туалетное и кухонное',
  },
  '2': {
    name: 'shoes',
    description: 'Обувные товары',
  },
  '3': {
    name: 'tobacco',
    description: 'Табачные изделия',
  },
  '4': {
    name: 'perfumery',
    description: 'Духи и туалетная вода',
  },
  '5': {
    name: 'tires',
    description: 'Шины и покрышки пневматические резиновые новые',
  },
  '6': {
    name: 'electronics',
    description: 'Фотокамеры (кроме кинокамер), фотовспышки и лампы-вспышки',
  },
  '7': {
    name: 'pharma',
    description: 'Лекарственные препараты для медицинского применения',
  },
  '8': {
    name: 'milk',
    description: 'Молочная продукция',
  },
  '9': {
    name: 'bicycle',
    description: 'Велосипеды и велосипедные рамы',
  },
  '10': {
    name: 'wheelchairs',
    description: 'Медицинские изделия',
  },
  '12': {
    name: 'otp',
    description: 'Альтернативная табачная продукция',
  },
  '13': {
    name: 'water',
    description: 'Упакованная вода',
  },
  '15': {
    name: 'beer',
    description:
      'Пиво, напитки, изготавливаемые на основе пива, слабоалкогольные напитки',
  },
  '16': {
    name: 'ncp',
    description: 'Никотиносодержащая продукция',
  },
  '17': {
    name: 'bio',
    description: 'Биологические активные добавки к пище',
  },
  '19': {
    name: 'antiseptic',
    description: 'Антисептики и дезинфицирующие средства',
  },
  '20': {
    name: 'petfood',
    description: 'Корма для животных',
  },
  '21': {
    name: 'seafood',
    description: 'Морепродукты',
  },
  '22': {
    name: 'nabeer',
    description: 'Безалкогольное пиво',
  },
  '23': {
    name: 'softdrinks',
    description: 'Соковая продукция и безалкогольные напитки',
  },
  '25': {
    name: 'meat',
    description: 'Мясо',
  },
  '26': {
    name: 'vetpharma',
    description: 'Ветеринарные препараты',
  },
  '27': {
    name: 'toys',
    description: 'Игры и игрушки для детей',
  },
  '28': {
    name: 'radio',
    description: 'Радиоэлектронная продукция',
  },
  '31': {
    name: 'titan',
    description: 'Титановая металлопродукция',
  },
  '32': {
    name: 'conserve',
    description: 'Консервированная продукция',
  },
  '33': {
    name: 'vegetableoil',
    description: 'Растительные масла',
  },
  '34': {
    name: 'opticfiber',
    description: 'Оптоволокно и оптоволоконная продукция',
  },
  '35': {
    name: 'chemistry',
    description: 'Парфюмерные и косметические средства и бытовая химия',
  },
  '36': {
    name: 'books',
    description: 'Печатная продукция',
  },
  '37': {
    name: 'grocery',
    description: 'Бакалейная продукция',
  },
  '39': {
    name: 'construction',
    description: 'Строительные материалы',
  },
  '40': {
    name: 'fire',
    description:
      'Пиротехнические изделия и средства обеспечения пожарной безопасности и пожаротушения',
  },
  '41': {
    name: 'heater',
    description: 'Отопительные приборы',
  },
  '65533': {
    name: 'NotLabeling',
    description: 'Не подлежит обязательной маркировке',
  },
} as const;

export type TProductGroups = keyof typeof ProductGroups;
