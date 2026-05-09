import type { Route } from '@/types'

export const routes: Route[] = [
  {
    id: 'lagos-cotonou',
    from: 'Lagos',
    fromCode: 'LOS',
    fromCountry: 'Nigeria',
    to: 'Cotonou',
    toCode: 'COT',
    toCountry: 'Benin Republic',
    durationHours: 3.5,
    popular: true,
    image: '/images/routes/lagos-cotonou.jpg',
    description:
      'The most popular cross-border route. Direct executive service from Lagos to Cotonou city centre, crossing the Seme–Kraké border.',
    descriptionFr:
      'La route transfrontalière la plus populaire. Service exécutif direct de Lagos au centre-ville de Cotonou.',
    borderCrossings: ['Seme–Kraké'],
  },
  {
    id: 'cotonou-togo',
    from: 'Cotonou',
    fromCode: 'COT',
    fromCountry: 'Benin Republic',
    to: 'Lomé',
    toCode: 'LFW',
    toCountry: 'Togo',
    durationHours: 3,
    popular: true,
    image: '/images/routes/cotonou-lome.jpg',
    description:
      'Comfortable coastal drive from Cotonou to the Togolese capital Lomé, passing through scenic beach towns.',
    descriptionFr:
      'Trajet côtier confortable de Cotonou à Lomé, la capitale togolaise, en passant par des villes balnéaires pittoresques.',
    borderCrossings: ['Hillacondji–Sanvee Condji'],
  },
  {
    id: 'togo-ghana',
    from: 'Lomé',
    fromCode: 'LFW',
    fromCountry: 'Togo',
    to: 'Accra',
    toCode: 'ACC',
    toCountry: 'Ghana',
    durationHours: 4,
    popular: true,
    image: '/images/routes/lome-accra.jpg',
    description:
      "Cross the Togo–Ghana border at Aflao for a smooth onward journey to Accra's business district.",
    descriptionFr:
      "Traversez la frontière Togo–Ghana à Aflao pour rejoindre le quartier des affaires d'Accra.",
    borderCrossings: ['Aflao–Kodjoviakopé'],
  },
  {
    id: 'lagos-togo',
    from: 'Lagos',
    fromCode: 'LOS',
    fromCountry: 'Nigeria',
    to: 'Lomé',
    toCode: 'LFW',
    toCountry: 'Togo',
    durationHours: 6.5,
    popular: false,
    image: '/images/routes/lagos-lome.jpg',
    description:
      'One-way through Benin Republic into Togo. Ideal for business travellers and tourists heading directly to Lomé.',
    descriptionFr:
      "Aller simple à travers le Bénin jusqu'au Togo. Idéal pour les voyageurs d'affaires se rendant à Lomé.",
    borderCrossings: ['Seme–Kraké', 'Hillacondji–Sanvee Condji'],
  },
  {
    id: 'lagos-ghana',
    from: 'Lagos',
    fromCode: 'LOS',
    fromCountry: 'Nigeria',
    to: 'Accra',
    toCode: 'ACC',
    toCountry: 'Ghana',
    durationHours: 10.5,
    popular: false,
    image: '/images/routes/lagos-accra.jpg',
    description:
      'The ultimate West African overland journey from Nigeria to Ghana, passing through Benin Republic and Togo.',
    descriptionFr:
      'Le voyage terrestre ouest-africain ultime du Nigeria au Ghana, en passant par le Bénin et le Togo.',
    borderCrossings: ['Seme–Kraké', 'Hillacondji–Sanvee Condji', 'Aflao–Kodjoviakopé'],
  },
]

/** Official origin/destination cities for booking search */
export const bookingCities = [
  { city: 'Lagos', country: 'Nigeria', code: 'LOS' },
  { city: 'Cotonou', country: 'Benin Republic', code: 'COT' },
  { city: 'Lomé', country: 'Togo', code: 'LFW' },
  { city: 'Accra', country: 'Ghana', code: 'ACC' },
]
