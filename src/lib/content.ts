// ─────────────────────────────────────────────────────────────────────────────
// ROYALTY NAILS & SPA — Content Data
// Source: https://timetraveldeliciously522c32104c-ipkwn.wpcomstaging.com/
//
// NOTE: Package names and prices are mirrored exactly from the live site.
// To update, edit this file — both the Home and Packages pages are wired to it.
// ─────────────────────────────────────────────────────────────────────────────

export const businessInfo = {
  name: 'Royalty Nails & Spa',
  tagline: 'Where Luxury Meets Artistry',
  address: '6909 Rowlett Road, Suite 102, Rowlett, Texas 75089',
  phone: '(214) 501-4300',
  email: 'royaltynailsspa37@gmail.com',
  hours: {
    weekdays: 'Monday – Saturday: 10:00 AM – 7:00 PM',
    weekends: 'Sunday: By Appointment Only',
  },
  social: {
    instagram: '#',
    facebook: '#',
    google: '#',
  },
}

export type Package = {
  name: string
  price: number
  priceNote?: string
  description: string
  includes: string[]
  bestFor: string
  featured?: boolean
  badge?: string
}

export type ServiceCategory = {
  id: string
  name: string
  eyebrow: string
  description: string
  packages: Package[]
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'manicures',
    name: 'Manicures',
    eyebrow: 'Hand Care Collection',
    description:
      'Elevate your hands with our signature manicure collection, crafted for those who demand nothing less than perfection.',
    packages: [
      {
        name: 'Regular Manicure',
        price: 22,
        description: 'Nail trimming, cuticle care, buffing, and filing.',
        includes: [
          'Nail trimming & shaping',
          'Cuticle care & clean-up',
          'Buffing & filing',
          'Polish of your choice',
        ],
        bestFor: 'Everyday maintenance and quick refresh',
        featured: false,
      },
      {
        name: 'Classic Manicure',
        price: 30,
        description:
          'Nail shaping, cuticle care, polish application, and hand massage.',
        includes: [
          'Nail shaping & filing',
          'Cuticle care',
          'Polish application',
          'Relaxing hand massage',
        ],
        bestFor: 'Those who want a complete, polished look',
        featured: false,
      },
      {
        name: 'Deluxe Manicure',
        price: 45,
        description:
          'Sea salt scrub, moisturizing mask, regular polish, massage, and warm towel wrap.',
        includes: [
          'Sea salt exfoliating scrub',
          'Moisturizing mask',
          'Regular polish',
          'Relaxing hand massage',
          'Warm towel wrap',
        ],
        bestFor: 'A deeper, more indulgent pampering experience',
        featured: false,
      },
      {
        name: 'Royal Manicure',
        price: 50,
        description:
          'Nail trimming, cuticle care, buffing, steaming, moisturizing, hand mask, hot stone massage, nail polish of your choice.',
        includes: [
          'Nail trimming & cuticle care',
          'Buffing & steaming',
          'Moisturizing treatment',
          'Hand mask application',
          'Hot stone massage',
          'Polish of your choice',
        ],
        bestFor: 'The ultimate hand indulgence',
        featured: true,
        badge: 'Most Popular',
      },
      {
        name: 'Exotic Manicure',
        price: 67,
        description:
          'Enriched with healing and therapeutic properties to meet your specific hand needs.',
        includes: [
          'Customized treatment formula',
          'Therapeutic healing ingredients',
          'Deep nourishment & repair',
          'Extended massage therapy',
          'Premium polish finish',
        ],
        bestFor: 'Those seeking therapeutic and healing benefits',
        featured: false,
        badge: 'Specialty',
      },
    ],
  },
  {
    id: 'pedicures',
    name: 'Pedicures',
    eyebrow: 'Foot Care Collection',
    description:
      'Indulge your feet with our tiered pedicure experiences — from restorative essentials to our coveted Diamond treatment.',
    packages: [
      {
        name: 'Regular Pedicure',
        price: 25,
        description:
          'Essential foot care with nail trimming, cuticle attention, and polish.',
        includes: [
          'Nail trimming & shaping',
          'Cuticle care',
          'Basic exfoliation',
          'Polish application',
        ],
        bestFor: 'Regular upkeep and maintenance',
        featured: false,
      },
      {
        name: 'Basic Pedicure',
        price: 40,
        description: 'Complete foot care with relaxing soak and massage.',
        includes: [
          'Relaxing foot soak',
          'Nail trimming & shaping',
          'Cuticle care',
          'Callus removal',
          'Relaxing massage',
          'Polish',
        ],
        bestFor: 'A complete, refreshing treatment',
        featured: false,
      },
      {
        name: 'Deluxe Pedicure',
        price: 46,
        description:
          'Enhanced pedicure with exfoliating treatments and extended massage.',
        includes: [
          'Aromatic foot soak',
          'Exfoliating scrub',
          'Cuticle care',
          'Extended massage',
          'Warm towel wrap',
          'Polish',
        ],
        bestFor: 'An elevated pampering session',
        featured: false,
      },
      {
        name: 'Royal Pedicure',
        price: 50,
        description:
          'A regal treatment with hot stones and premium moisturizing.',
        includes: [
          'Luxury foot soak',
          'Full exfoliation',
          'Callus treatment',
          'Hot stone massage',
          'Moisturizing mask',
          'Polish',
        ],
        bestFor: 'Those who deserve royal treatment',
        featured: false,
      },
      {
        name: 'Milk and Honey',
        price: 60,
        description:
          'Nourishing milk and honey soak with deep moisturizing treatment.',
        includes: [
          'Milk & honey aromatic soak',
          'Exfoliating scrub',
          'Honey mask treatment',
          'Deep moisturizing',
          'Extended massage',
          'Polish',
        ],
        bestFor: 'Deeply dry or sensitive skin',
        featured: false,
      },
      {
        name: 'Collagen Pedicure',
        price: 70,
        description:
          'Anti-aging collagen treatment for visibly smoother, firmer skin.',
        includes: [
          'Collagen-rich soak',
          'Full exfoliation',
          'Collagen mask application',
          'Firming massage',
          'Extended treatment time',
          'Polish',
        ],
        bestFor: 'Anti-aging and skin rejuvenation',
        featured: false,
        badge: 'Anti-Aging',
      },
      {
        name: 'Gold Pedicure',
        price: 75,
        description:
          'Premium gold-infused treatment for luminous, radiant skin.',
        includes: [
          'Gold-infused aromatic soak',
          'Luxury exfoliation',
          'Gold mask application',
          'Extended hot stone massage',
          'Deep moisturizing',
          'Polish',
        ],
        bestFor: 'A truly luxurious, radiant experience',
        featured: true,
        badge: 'Luxury',
      },
      {
        name: 'Diamond Pedicure',
        price: 80,
        description:
          'Our pinnacle pedicure experience with diamond dust exfoliation.',
        includes: [
          'Diamond dust exfoliation',
          'Luxury mineral soak',
          'Premium mask treatment',
          'Full hot stone massage',
          'Paraffin wax dip',
          'Polish',
        ],
        bestFor: 'The ultimate pedicure experience',
        featured: false,
        badge: 'Signature',
      },
    ],
  },
  {
    id: 'combinations',
    name: 'Signature Combinations',
    eyebrow: 'Complete Spa Journeys',
    description:
      'Our curated combination experiences for the complete head-to-toe luxury spa journey — for individuals and couples alike.',
    packages: [
      {
        name: 'Signature Pedicure & Manicure',
        price: 110,
        description:
          'Exfoliating scrubs, moisturizing mud masks, hot towel wraps, paraffin wax dips, and extended hot stone massages.',
        includes: [
          'Exfoliating scrubs',
          'Moisturizing mud masks',
          'Hot towel wraps',
          'Paraffin wax dips',
          'Extended hot stone massages',
          'Polish for hands & feet',
        ],
        bestFor: 'A complete luxury mani-pedi experience',
        featured: true,
        badge: 'Best Value',
      },
      {
        name: 'Couple Pedicure & Manicure',
        price: 150,
        description:
          'Side-by-side spa experience with simultaneous treatments, gel polish for lady included.',
        includes: [
          'Side-by-side luxury treatment',
          'Simultaneous mani-pedi service',
          'Gel polish for lady included',
          'Hot stone massage',
          'Premium moisturizing treatment',
        ],
        bestFor: 'Special occasions & shared luxury moments',
        featured: false,
        badge: 'For Two',
      },
    ],
  },
  {
    id: 'acrylics',
    name: 'Acrylic Services',
    eyebrow: 'Nail Enhancements',
    description:
      'Expert acrylic enhancements for flawless, long-lasting nails shaped to your exact preference.',
    packages: [
      {
        name: 'Acrylic Full Set',
        price: 45,
        description:
          'Complete acrylic nail application with your choice of shape and length.',
        includes: [
          'Full set acrylic application',
          'Shape of your choice',
          'Regular polish included',
          'Finishing & buffing',
        ],
        bestFor: 'Those wanting durable nail extensions',
        featured: false,
      },
      {
        name: 'Acrylic Fill',
        price: 40,
        description: 'Maintenance fill for existing acrylic nails.',
        includes: [
          'Fill in new growth',
          'Shape refinement',
          'Surface buffing',
          'Polish refresh',
        ],
        bestFor: 'Maintaining existing acrylic nails',
        featured: false,
      },
      {
        name: 'Gel Acrylic Full Set',
        price: 65,
        description:
          'Premium gel-acrylic hybrid for ultimate strength and high-gloss shine.',
        includes: [
          'Gel-acrylic full set application',
          'Shape of your choice',
          'Gel topcoat',
          'High-gloss finish',
        ],
        bestFor: 'Maximum durability with brilliant gel shine',
        featured: true,
        badge: 'Premium',
      },
    ],
  },
  {
    id: 'facials',
    name: 'Facial Services',
    eyebrow: 'Skin Treatments',
    description:
      'Transformative facial treatments tailored to your skin\'s unique needs — from an express refresh to advanced Hydrafacial technology.',
    packages: [
      {
        name: 'Express Facial',
        price: 55,
        description: 'A quick yet effective facial refresh for glowing skin.',
        includes: [
          'Cleansing',
          'Exfoliation',
          'Mask application',
          'Moisturizing & SPF',
        ],
        bestFor: 'A quick skin refresh on a busy schedule',
        featured: false,
      },
      {
        name: 'Dermaplaning Facial',
        price: 75,
        description:
          'Professional dermaplaning for ultra-smooth, radiant skin.',
        includes: [
          'Deep cleansing',
          'Dermaplaning treatment',
          'Serum application',
          'Moisturizer & SPF',
        ],
        bestFor: 'Smoother texture and better product absorption',
        featured: false,
      },
      {
        name: 'Relaxation Facial',
        price: 95,
        description:
          'A deeply relaxing facial with extended massage and premium products.',
        includes: [
          'Deep cleansing',
          'Exfoliation',
          'Extended face & neck massage',
          'Premium mask application',
          'Serum & moisturizer',
        ],
        bestFor: 'Stress relief and comprehensive skin rejuvenation',
        featured: false,
      },
      {
        name: 'Hydrafacial',
        price: 180,
        description:
          'Advanced water suction technology to remove impurities, hydrate, and protect the skin.',
        includes: [
          'Hydradermabrasion cleansing',
          'Acid peel exfoliation',
          'Automated painless extractions',
          'Intense skin hydration',
          'Antioxidant & peptide fusion',
        ],
        bestFor: 'Advanced hydration and comprehensive skin correction',
        featured: true,
        badge: 'Advanced',
      },
    ],
  },
  {
    id: 'waxing',
    name: 'Waxing',
    eyebrow: 'Hair Removal',
    description:
      'Smooth, precise waxing services for face and body — performed with care to minimize discomfort and maximize results.',
    packages: [
      {
        name: 'Eyebrow Wax',
        price: 12,
        description: 'Clean, defined brow shaping with professional wax.',
        includes: ['Precision brow shaping', 'Wax removal', 'Soothing aftercare'],
        bestFor: 'Maintaining clean, shaped brows',
        featured: false,
      },
      {
        name: 'Lip Wax',
        price: 10,
        description: 'Quick and effective upper lip hair removal.',
        includes: ['Upper lip wax', 'Soothing aftercare'],
        bestFor: 'Smooth, hair-free upper lip',
        featured: false,
      },
      {
        name: 'Chin Wax',
        price: 12,
        description: 'Precise chin hair removal for a clean, smooth finish.',
        includes: ['Chin area wax', 'Soothing aftercare'],
        bestFor: 'Clean chin and jaw area',
        featured: false,
      },
      {
        name: 'Full Face Wax',
        price: 35,
        description: 'Complete facial waxing — brows, lip, chin, and cheeks.',
        includes: ['Brow shaping', 'Lip wax', 'Chin wax', 'Cheek wax', 'Soothing aftercare'],
        bestFor: 'A comprehensive facial hair removal experience',
        featured: false,
      },
      {
        name: 'Underarm Wax',
        price: 20,
        description: 'Smooth underarm waxing with gentle soothing aftercare.',
        includes: ['Full underarm wax', 'Soothing aftercare'],
        bestFor: 'Clean, smooth underarms',
        featured: false,
      },
      {
        name: 'Half Leg Wax',
        price: 30,
        description: 'Waxing from knee to ankle for smooth lower legs.',
        includes: ['Lower leg wax', 'Soothing aftercare'],
        bestFor: 'Smooth lower legs',
        featured: false,
      },
      {
        name: 'Full Leg Wax',
        price: 50,
        description: 'Complete leg waxing from ankle to upper thigh.',
        includes: ['Full leg wax', 'Soothing aftercare'],
        bestFor: 'Complete leg smoothness',
        featured: true,
        badge: 'Popular',
      },
      {
        name: 'Bikini Wax',
        price: 35,
        description: 'Neat bikini line waxing for a clean, confident look.',
        includes: ['Bikini line wax', 'Soothing aftercare'],
        bestFor: 'Clean bikini line',
        featured: false,
      },
      {
        name: 'Brazilian Wax',
        price: 60,
        description: 'Full Brazilian waxing performed with precision and care.',
        includes: ['Full Brazilian wax', 'Extended soothing aftercare'],
        bestFor: 'Complete, long-lasting smoothness',
        featured: false,
        badge: 'Specialty',
      },
    ],
  },
]

export type AddOn = {
  name: string
  price: number
  priceNote?: string
  description: string
}

export const addOns: AddOn[] = [
  {
    name: 'Gel Polish Upgrade',
    price: 20,
    description: 'Upgrade any polish service to long-lasting gel polish',
  },
  {
    name: 'Paraffin Wax Dip',
    price: 15,
    description: 'Deep moisturizing paraffin treatment for hands or feet',
  },
  {
    name: 'Nail Art Design',
    price: 5,
    priceNote: 'per nail',
    description: 'Accent nail art (minimum 2 nails)',
  },
  {
    name: 'French Tips',
    price: 10,
    description: 'Classic or ombre French tip application',
  },
  {
    name: 'Nail Repair',
    price: 5,
    priceNote: 'per nail',
    description: 'Single nail repair for acrylics or gel',
  },
  {
    name: 'Polish Change',
    price: 15,
    description: 'Quick polish change with no additional treatments',
  },
  {
    name: 'Hot Stone Add-on',
    price: 12,
    description: 'Add hot stone massage therapy to any service',
  },
  {
    name: 'Callus Treatment',
    price: 15,
    description: 'Intensive callus removal and softening treatment',
  },
]

export type Testimonial = {
  name: string
  location: string
  rating: number
  text: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Melissa T.',
    location: 'Rowlett, TX',
    rating: 5,
    text: "I've been to many nail salons across the DFW area, but Royalty Nails & Spa is in a league of its own. The Diamond Pedicure left my feet feeling incredible, and the attention to detail was remarkable. This is my place.",
  },
  {
    name: 'Sarah K.',
    location: 'Garland, TX',
    rating: 5,
    text: "The Royal Manicure is worth every single penny. The hot stone massage alone could make you forget the world outside. This has become my non-negotiable self-care ritual, and I wouldn't have it any other way.",
  },
  {
    name: 'Jennifer L.',
    location: 'Rockwall, TX',
    rating: 5,
    text: "My Hydrafacial experience was truly transformative. My skin glowed for weeks afterward. The staff is professional, the space is immaculate, and every visit feels like a genuine luxury. Highly recommend.",
  },
  {
    name: 'Amanda R.',
    location: 'Rowlett, TX',
    rating: 5,
    text: "The Couple Pedicure & Manicure package was the perfect anniversary treat for my husband and me. We left feeling pampered, refreshed, and completely relaxed. We've already booked our next visit.",
  },
]

export type FAQ = {
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  {
    question: 'Do I need an appointment, or do you accept walk-ins?',
    answer:
      "We welcome both appointments and walk-ins. However, we strongly recommend booking in advance — especially for weekend visits or signature treatments — to ensure your preferred time and service provider are available. Walk-ins are accommodated based on availability, and we always do our best to serve you.",
  },
  {
    question: 'How long do most services take?',
    answer:
      "Service duration varies by treatment. A Regular Manicure typically takes 30–45 minutes, while a Royal or Exotic Manicure can take 60–90 minutes. Combination packages (Mani & Pedi) run 90–120 minutes. During booking, your technician will provide a precise time estimate so you can plan accordingly.",
  },
  {
    question: 'Are your products safe for sensitive skin or allergies?',
    answer:
      'We use premium, dermatologist-tested products and take client sensitivities very seriously. Please inform our team of any known allergies or sensitivities before your service. We will select the most appropriate products to ensure your complete comfort, safety, and satisfaction.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'We ask for at least 24 hours\' notice for cancellations or rescheduling. Late cancellations or no-shows may be subject to a courtesy fee. We understand that life is unpredictable — please reach out to us as soon as possible if your plans change, and we will do our best to accommodate you.',
  },
  {
    question: 'Do you offer gift cards?',
    answer:
      "Yes, we offer beautifully presented gift cards in any denomination. They make a deeply thoughtful gift for birthdays, anniversaries, holidays, or simply to share the luxury of Royalty Nails & Spa with someone you love. Ask about our gift card options when you visit or call.",
  },
  {
    question: 'What safety and hygiene standards do you maintain?',
    answer:
      'Cleanliness is our highest priority. All tools are fully sterilized after every use, pedicure basins are sanitized between every client, and we use disposable liners for all spa chairs. Our technicians adhere to the strictest hygiene standards to ensure every visit is safe, pristine, and worry-free.',
  },
  {
    question: 'Can I customize a package or add services during my visit?',
    answer:
      "Absolutely. Our service menu is a starting point — our technicians love recommending enhancements, add-ons, or modifications based on your specific needs and preferences. Simply let us know what you'd like, and we will craft a tailored experience that exceeds your expectations.",
  },
  {
    question: 'Do you accommodate children?',
    answer:
      'Yes, we offer a dedicated Kids Services menu with age-appropriate treatments starting at just $7. We believe in introducing self-care and confidence early, and our team is experienced in creating a fun, welcoming, and comfortable environment for our younger guests.',
  },
]

export const howItWorks = [
  {
    step: '01',
    title: 'Reserve Your Experience',
    description:
      'Book your preferred service and time slot online or by phone. Our team will confirm your reservation and prepare everything for your arrival.',
  },
  {
    step: '02',
    title: 'Arrive & Unwind',
    description:
      'Step into a serene, beautifully appointed space designed for total relaxation. Your dedicated technician will greet you and discuss your preferences.',
  },
  {
    step: '03',
    title: 'Experience the Difference',
    description:
      'Indulge in your chosen treatment, executed with precision and genuine care. Leave refreshed, refined, and with a standing invitation to return.',
  },
]

export const signatureOfferings = [
  {
    id: 'manicures',
    icon: '◇',
    title: 'Manicure Collection',
    description:
      'Five tiers of hand care — from the refined Classic to the indulgent Royal and the therapeutic Exotic — each crafted to elevate.',
    link: '/packages#manicures',
    priceFrom: 'From $22',
  },
  {
    id: 'pedicures',
    icon: '◇',
    title: 'Pedicure Collection',
    description:
      'Eight distinct pedicure experiences, from restorative essentials to our coveted Gold and Diamond treatments.',
    link: '/packages#pedicures',
    priceFrom: 'From $25',
  },
  {
    id: 'combinations',
    icon: '◇',
    title: 'Signature Combinations',
    description:
      'Complete mani-pedi journeys for individuals and couples — for those who want the full experience.',
    link: '/packages#combinations',
    priceFrom: 'From $110',
  },
  {
    id: 'facials',
    icon: '◇',
    title: 'Advanced Facials',
    description:
      'From the quick Express Facial to the transformative Hydrafacial — comprehensive skin correction at its finest.',
    link: '/packages#facials',
    priceFrom: 'From $55',
  },
]

export const trustCues = [
  'Serving Rowlett & DFW',
  'Premium Sterilized Tools',
  '100+ Five-Star Reviews',
  'Licensed & Insured Technicians',
  'Walk-ins Welcome',
  'Gift Cards Available',
]

export const brandValues = [
  {
    title: 'Artistry',
    description:
      'Every service is performed with the precision and creativity of a true craft. We take pride in every detail — every shape, every stroke, every finish.',
  },
  {
    title: 'Hygiene',
    description:
      'Immaculate cleanliness is non-negotiable. Every tool is sterilized, every surface sanitized, every standard upheld — because you deserve nothing less.',
  },
  {
    title: 'Personalization',
    description:
      'No two clients are the same. We listen, advise, and tailor every experience to your unique needs, preferences, and lifestyle.',
  },
  {
    title: 'Excellence',
    description:
      'We set a high bar and we clear it, every time. From our product selection to our team\'s ongoing training — excellence is embedded in everything we do.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALS
// Edit this array to update monthly or holiday promotions.
// Each special appears on the Home page Specials section.
// ─────────────────────────────────────────────────────────────────────────────
export type Special = {
  id: string
  eyebrow: string
  title: string
  description: string
  highlight: string  // The specific service or deal being promoted
  validThrough: string
  badge?: string
}

export const specials: Special[] = [
  {
    id: 'spring-refresh-2026',
    eyebrow: 'Spring Special',
    title: 'Spring Refresh Package',
    description:
      'Celebrate the season with a complete head-to-toe renewal. Book a Signature Pedicure & Manicure and receive a complimentary Paraffin Wax Dip — on us.',
    highlight: 'Signature Pedicure & Manicure + Free Paraffin Wax Dip',
    validThrough: 'March 31, 2026',
    badge: 'Limited Time',
  },
  {
    id: 'referral-2026',
    eyebrow: 'Ongoing Offer',
    title: 'Refer a Friend & Save',
    description:
      'Bring a new guest and both of you receive $10 off any service $40 or more. Share the luxury — it\'s better together.',
    highlight: '$10 off for you & your guest',
    validThrough: 'No expiration',
    badge: 'Ongoing',
  },
  {
    id: 'first-visit-2026',
    eyebrow: 'New Client Special',
    title: 'First Visit Welcome',
    description:
      'New to Royalty Nails & Spa? Enjoy 10% off your first service of $35 or more. Experience the difference — we think you\'ll come back.',
    highlight: '10% off your first visit',
    validThrough: 'No expiration',
    badge: 'New Clients',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Comparison features for the packages comparison grid
export const comparisonFeatures = [
  { feature: 'Nail Trimming & Shaping', basic: true, deluxe: true, royal: true, exotic: true },
  { feature: 'Cuticle Care', basic: true, deluxe: true, royal: true, exotic: true },
  { feature: 'Polish Application', basic: true, deluxe: true, royal: true, exotic: true },
  { feature: 'Hand/Foot Massage', basic: false, deluxe: true, royal: true, exotic: true },
  { feature: 'Exfoliating Scrub', basic: false, deluxe: true, royal: true, exotic: true },
  { feature: 'Moisturizing Mask', basic: false, deluxe: true, royal: true, exotic: true },
  { feature: 'Warm Towel Wrap', basic: false, deluxe: true, royal: true, exotic: true },
  { feature: 'Hot Stone Massage', basic: false, deluxe: false, royal: true, exotic: true },
  { feature: 'Steaming Treatment', basic: false, deluxe: false, royal: true, exotic: true },
  { feature: 'Therapeutic Formula', basic: false, deluxe: false, royal: false, exotic: true },
  { feature: 'Extended Treatment Time', basic: false, deluxe: false, royal: false, exotic: true },
]
