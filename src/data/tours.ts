import type { Tour } from '@/types'

/**
 * Tour packages offered by Beninfy.
 * `startingFromNGN` is the price for a Saloon Car booking.
 * For other vehicle types, multiply tourDailyRates (pricing.ts) × durationDays.
 */
export const tours: Tour[] = [
  {
    id: 'benin-history-lake',
    title: 'Ouidah History & Ganvié Lake Village',
    titleFr: 'Histoire d’Ouidah & Village Lacustre de Ganvié',
    destination: 'Cotonou & Ouidah',
    destinationFr: 'Cotonou & Ouidah',
    country: 'Benin Republic',
    durationDays: 3,
    startingFromNGN: 315_000,
    image: '/images/tours/benin-ouidah.jpg',
    description:
      'Immerse yourself in the UNESCO-listed history of Ouidah, the birthplace of Voodoo, and glide across Ganvié, the Venice of Africa.',
    descriptionFr:
      'Plongez dans l’histoire classée par l’UNESCO d’Ouidah, berceau du Vaudou, et glissez sur les eaux de Ganvié, la Venise d’Afrique.',
    highlights: [
      'Route des Esclaves, Ouidah',
      'Fondation Zinsou Museum',
      'Ganvié Lake Village by pirogue',
      'Temple des Pythons',
    ],
    highlightsFr: [
      'Route des Esclaves, Ouidah',
      'Musée Fondation Zinsou',
      'Village lacustre de Ganvié en pirogue',
      'Temple des Pythons',
    ],
    included: [
      'Private executive transport',
      'Hotel (3-star, Cotonou)',
      'English / French guide',
      'Daily breakfast',
    ],
    includedFr: [
      'Transport exécutif privé',
      'Hôtel 3 étoiles, Cotonou',
      'Guide anglophone / francophone',
      'Petit-déjeuner quotidien',
    ],
  },
  {
    id: 'lome-aneho-beach',
    title: 'Lomé Exploration & Aného Beach',
    titleFr: 'Exploration de Lomé & Plage d’Aného',
    destination: 'Lomé & Aného',
    destinationFr: 'Lomé & Aného',
    country: 'Togo',
    durationDays: 2,
    startingFromNGN: 210_000,
    image: '/images/tours/togo-lome.jpg',
    description:
      'Discover Lomé — the only capital city on a beach — and its vibrant Grand Marché, then relax on the pristine sands of Aného.',
    descriptionFr:
      'Découvrez Lomé — la seule capitale située sur une plage — et son animé Grand Marché, puis détendez-vous sur les sables d’Aného.',
    highlights: [
      'Grand Marché de Lomé',
      'Palais de Lomakoé',
      'Fetish Market (Marché des Fléchéistes)',
      'Aného beach & colonial old town',
    ],
    highlightsFr: [
      'Grand Marché de Lomé',
      'Palais de Lomakoé',
      'Marché des Fléchéistes',
      'Plage d’Aného & vieille ville coloniale',
    ],
    included: [
      'Private executive transport',
      'Hotel (3-star, Lomé)',
      'English / French guide',
      'Daily breakfast',
    ],
    includedFr: [
      'Transport exécutif privé',
      'Hôtel 3 étoiles, Lomé',
      'Guide anglophone / francophone',
      'Petit-déjeuner quotidien',
    ],
  },
  {
    id: 'accra-cape-coast',
    title: 'Accra City & Cape Coast Castles',
    titleFr: 'Accra & Châteaux de Cape Coast',
    destination: 'Accra & Cape Coast',
    destinationFr: 'Accra & Cape Coast',
    country: 'Ghana',
    durationDays: 5,
    startingFromNGN: 525_000,
    image: '/images/tours/ghana-accra.jpg',
    description:
      'From the Gold Coast history of Cape Coast Castle to Accra’s vibrant nightlife and arts scene. Ghana at its finest.',
    descriptionFr:
      'De l’histoire de la Côte de l’Or au château de Cape Coast jusqu’à la vie nocturne d’Accra. Le Ghana à son meilleur.',
    highlights: [
      'Cape Coast Castle & slave dungeons',
      'Kakum National Park canopy walk',
      'Makola Market, Accra',
      'Labadi Beach & nightlife',
    ],
    highlightsFr: [
      'Château de Cape Coast & cachots',
      'Promenade dans la canopée du Parc de Kakum',
      'Marché Makola, Accra',
      'Plage de Labadi & vie nocturne',
    ],
    included: [
      'Private executive transport',
      'Hotel (4-star, Accra)',
      'English guide',
      'Breakfast & dinner daily',
    ],
    includedFr: [
      'Transport exécutif privé',
      'Hôtel 4 étoiles, Accra',
      'Guide anglophone',
      'Petit-déjeuner et dîner quotidiens',
    ],
  },
  {
    id: 'west-africa-grand-tour',
    title: 'West Africa Grand Tour',
    titleFr: 'Grand Circuit Afrique de l’Ouest',
    destination: 'Lagos → Cotonou → Lomé → Accra',
    destinationFr: 'Lagos → Cotonou → Lomé → Accra',
    country: 'Nigeria / Benin Republic / Togo / Ghana',
    durationDays: 10,
    startingFromNGN: 1_050_000,
    image: '/images/tours/west-africa-grand.jpg',
    description:
      'The ultimate West African overland journey through four countries, four capitals, and four distinct cultures. Fully escorted.',
    descriptionFr:
      'Le voyage terrestre ouest-africain ultime à travers quatre pays, quatre capitales et quatre cultures distinctes. Entièrement escorté.',
    highlights: [
      'Lagos markets & waterfront',
      'Ouidah Voodoo heritage & Ganvié Lake',
      'Lomé beach & colonial architecture',
      'Cape Coast Castle & Accra arts district',
    ],
    highlightsFr: [
      'Marchés & front de mer de Lagos',
      'Patrimoine Vaudou d’Ouidah & Lac Ganvié',
      'Plage de Lomé & architecture coloniale',
      'Château de Cape Coast & quartier artistique d’Accra',
    ],
    included: [
      'All cross-border executive transport',
      'Hotel (4-star throughout)',
      'Bilingual guide (English & French)',
      'All meals',
      'Border documentation assistance',
    ],
    includedFr: [
      'Tous les transports transfrontaliers exécutifs',
      'Hôtel 4 étoiles tout au long',
      'Guide bilingue (anglais & français)',
      'Tous les repas',
      'Assistance pour les documents frontaliers',
    ],
  },
]
