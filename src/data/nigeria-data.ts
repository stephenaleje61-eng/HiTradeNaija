import { Category, NigerianLocation } from '../types';

export const NIGERIAN_STATES_AND_CITIES: NigerianLocation[] = [
  {
    state: 'Lagos',
    cities: ['Ikeja', 'Lekki', 'Victoria Island', 'Yaba', 'Surulere', 'Ikorodu', 'Alaba', 'Oshodi', 'Maryland', 'Festac', 'Agege', 'Ajah', 'Ikoyi']
  },
  {
    state: 'Abuja (FCT)',
    cities: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Jabi', 'Utako', 'Lugbe', 'Apo', 'Dawaki']
  },
  {
    state: 'Rivers',
    cities: ['Port Harcourt', 'Obio-Akpor', 'Oyigbo', 'Eleme', 'Bonny', 'Ikwerre', 'Okrika']
  },
  {
    state: 'Oyo',
    cities: ['Ibadan North', 'Ibadan South', 'Bodija', 'Dugbe', 'Moniya', 'Oyo Town', 'Ogbomoso', 'Iseyin']
  },
  {
    state: 'Kano',
    cities: ['Kano Municipal', 'Fagge', 'Nassarawa', 'Gwale', 'Dala', 'Tarauni', 'Bichi']
  },
  {
    state: 'Anambra',
    cities: ['Onitsha', 'Awka', 'Nnewi', 'Ekwulobia', 'Ihiala', 'Ogidi']
  },
  {
    state: 'Enugu',
    cities: ['Enugu North', 'Enugu South', 'Independence Layout', 'New Haven', 'Nsukka', '9th Mile']
  },
  {
    state: 'Delta',
    cities: ['Warri', 'Asaba', 'Effurun', 'Sapele', 'Ughelli', 'Agbor', 'Oghara']
  },
  {
    state: 'Edo',
    cities: ['Benin City', 'Uselu', 'GRA Benin', 'Ekpoma', 'Auchi', 'Uromi']
  },
  {
    state: 'Ogun',
    cities: ['Abeokuta', 'Ota', 'Sagamu', 'Ijebu Ode', 'Mowe', 'Ibafo', 'Ilaro']
  },
  {
    state: 'Kaduna',
    cities: ['Kaduna North', 'Kaduna South', 'Zaria', 'Barnawa', 'Kafanchan', 'Sabon Gari']
  },
  {
    state: 'Akwa Ibom',
    cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Abak']
  },
  {
    state: 'Imo',
    cities: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise', 'Oguta']
  },
  {
    state: 'Plateau',
    cities: ['Jos North', 'Jos South', 'Bukuru', 'Pankshin', 'Shendam']
  },
  {
    state: 'Abia',
    cities: ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu']
  },
  {
    state: 'Ondo',
    cities: ['Akure', 'Ondo Town', 'Owo', 'Ikare', 'Ore']
  },
  {
    state: 'Kwara',
    cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba']
  },
  {
    state: 'Cross River',
    cities: ['Calabar', 'Ikom', 'Ogoja', 'Ugep']
  },
  {
    state: 'Osun',
    cities: ['Osogbo', 'Ile-Ife', 'Ede', 'Ilesa', 'Ikirun']
  },
  {
    state: 'Benue',
    cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala']
  },
  {
    state: 'Bayelsa',
    cities: ['Yenagoa', 'Brass', 'Ogbia', 'Sagbama']
  },
  {
    state: 'Niger',
    cities: ['Minna', 'Suleja', 'Bida', 'Kontagora']
  },
  {
    state: 'Bauchi',
    cities: ['Bauchi', 'Azare', 'Misau', 'Jama\'are']
  },
  {
    state: 'Adamawa',
    cities: ['Yola', 'Mubi', 'Jimeta', 'Numan']
  },
  {
    state: 'Kogi',
    cities: ['Lokoja', 'Okene', 'Kabba', 'Anyigba']
  },
  {
    state: 'Ekiti',
    cities: ['Ado-Ekiti', 'Ikere-Ekiti', 'Oye-Ekiti', 'Ijero']
  },
  {
    state: 'Sokoto',
    cities: ['Sokoto', 'Tambuwal', 'Wamakko', 'Bodinga']
  },
  {
    state: 'Gombe',
    cities: ['Gombe', 'Kaltungo', 'Billiri', 'Bajoga']
  },
  {
    state: 'Nasarawa',
    cities: ['Lafia', 'Keffi', 'Mararaba', 'Akwanga']
  },
  {
    state: 'Kebbi',
    cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru']
  },
  {
    state: 'Katsina',
    cities: ['Katsina', 'Daura', 'Funtua', 'Malumfashi']
  },
  {
    state: 'Taraba',
    cities: ['Jalingo', 'Wukari', 'Bali', 'Gembu']
  },
  {
    state: 'Ebonyi',
    cities: ['Abakaliki', 'Afikpo', 'Onueke']
  },
  {
    state: 'Jigawa',
    cities: ['Dutse', 'Hadejia', 'Kazaure', 'Gumel']
  },
  {
    state: 'Yobe',
    cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru']
  },
  {
    state: 'Zamfara',
    cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara']
  },
  {
    state: 'Borno',
    cities: ['Maiduguri', 'Biu', 'Bama', 'Monguno']
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-phones',
    name: 'Phones & Tablets',
    slug: 'phones-and-tablets',
    iconName: 'Smartphone',
    description: 'Smartphones, iPhones, Samsung, accessories, tablets & smartwatches',
    subcategories: ['Smartphones', 'Tablets', 'Phone Accessories', 'Smartwatches', 'Screen Protectors & Cases']
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Gadgets',
    slug: 'electronics',
    iconName: 'Tv',
    description: 'Smart TVs, sound systems, generators, solar inverters & home tech',
    subcategories: ['Televisions', 'Home Theatres & Audio', 'Generators & Inverters', 'Solar Panels & Batteries', 'Cameras']
  },
  {
    id: 'cat-computers',
    name: 'Computers & Accessories',
    slug: 'computers-and-accessories',
    iconName: 'Laptop',
    description: 'Laptops, desktops, PC accessories, printers, networking & storage',
    subcategories: ['Laptops', 'Desktop PCs', 'Computer Monitors', 'Hard Drives & SSDs', 'Printers & Scanners', 'Keyboards & Mice']
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Clothing',
    slug: 'fashion',
    iconName: 'Shirt',
    description: 'Nigerian traditional wear, senator suits, Ankara, dresses & casuals',
    subcategories: ['Men\'s Wear', 'Women\'s Wear', 'Traditional & Ankara', 'Kids Fashion', 'Underwear & Sleepwear']
  },
  {
    id: 'cat-shoes-bags',
    name: 'Shoes & Bags',
    slug: 'shoes-and-bags',
    iconName: 'ShoppingBag',
    description: 'Sneakers, formal leather shoes, boots, handbags & travel luggage',
    subcategories: ['Men\'s Shoes', 'Women\'s Shoes', 'Handbags & Purses', 'Travel Bags & Luggage', 'Backpacks']
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty-and-personal-care',
    iconName: 'Sparkles',
    description: 'Skincare, perfumes, hair extensions, wigs, makeup & grooming',
    subcategories: ['Skincare', 'Fragrances & Perfumes', 'Wigs & Hair Bundles', 'Makeup', 'Oral & Bath Care']
  },
  {
    id: 'cat-home-kitchen',
    name: 'Home & Kitchen',
    slug: 'home-and-kitchen',
    iconName: 'Home',
    description: 'Refrigerators, cookers, blenders, utensils, bedding & decor',
    subcategories: ['Kitchen Appliances', 'Cookware & Utensils', 'Bedding & Linens', 'Home Decor', 'Lighting & Fans']
  },
  {
    id: 'cat-furniture',
    name: 'Furniture',
    slug: 'furniture',
    iconName: 'Armchair',
    description: 'Living room sofas, beds, wardrobes, office desks & dining sets',
    subcategories: ['Living Room Sofas', 'Beds & Mattresses', 'Office Furniture', 'Wardrobes & Cabinets', 'Dining Tables']
  },
  {
    id: 'cat-groceries',
    name: 'Food & Groceries',
    slug: 'groceries',
    iconName: 'UtensilsCrossed',
    description: 'Rice, cooking oils, beverages, tubers, snacks & Nigerian spices',
    subcategories: ['Grains & Flours', 'Cooking Oils & Spices', 'Beverages & Drinks', 'Snacks & Sweets', 'Packaged Food']
  },
  {
    id: 'cat-baby-kids',
    name: 'Baby & Kids',
    slug: 'baby-and-kids',
    iconName: 'Baby',
    description: 'Baby food, diapers, strollers, toys, children wear & maternity',
    subcategories: ['Diapers & Wipes', 'Baby Food & Formula', 'Strollers & Car Seats', 'Toys & Games', 'Kids Clothes']
  },
  {
    id: 'cat-health',
    name: 'Health & Wellness',
    slug: 'health-and-wellness',
    iconName: 'HeartPulse',
    description: 'Vitamins, supplements, fitness trackers, medical kits & wellness',
    subcategories: ['Vitamins & Supplements', 'First Aid & Monitors', 'Fitness Equipment', 'Personal Hygiene']
  },
  {
    id: 'cat-automotive',
    name: 'Automotive & Vehicles',
    slug: 'automotive',
    iconName: 'Car',
    description: 'Car spare parts, car audio, engine oils, car trackers & tyres',
    subcategories: ['Car Spare Parts', 'Car Tyres & Rims', 'Oils & Fluids', 'Car Accessories', 'Motorcycles & Tricycles']
  },
  {
    id: 'cat-agriculture',
    name: 'Agriculture & Farm Produce',
    slug: 'agriculture',
    iconName: 'Wheat',
    description: 'Farm seeds, livestock feed, fertilizers, equipment & fresh harvests',
    subcategories: ['Seeds & Seedlings', 'Livestock Feed', 'Fertilizers & Chemicals', 'Farm Tools', 'Bulk Produce']
  },
  {
    id: 'cat-sports',
    name: 'Sports & Fitness',
    slug: 'sports-and-fitness',
    iconName: 'Trophy',
    description: 'Jerseys, gym gear, dumbbells, sports footwear & outdoor games',
    subcategories: ['Football Jerseys', 'Gym & Workout Gear', 'Sports Shoes', 'Camping & Outdoor']
  },
  {
    id: 'cat-books',
    name: 'Books & Stationery',
    slug: 'books-and-education',
    iconName: 'BookOpen',
    description: 'Textbooks, novels, office supplies, school bags & writing tools',
    subcategories: ['School Textbooks', 'Self-Development & Fiction', 'Notebooks & Stationery', 'Art Supplies']
  },
  {
    id: 'cat-services',
    name: 'Services & Trades',
    slug: 'services',
    iconName: 'Wrench',
    description: 'Artisans, electricians, phone repairs, event decorators & logistics',
    subcategories: ['Phone & Laptop Repairs', 'Artisan Services', 'Logistics & Moving', 'Events & Catering', 'Tailoring']
  }
];

export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

export function formatNigerianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+234 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function getCleanWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  } else if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppLink(phone: string, productTitle?: string): string {
  const cleanNumber = getCleanWhatsAppNumber(phone);
  if (!cleanNumber) return '';
  const message = productTitle 
    ? `Hello, I saw your product "${productTitle}" on TradeNaija. Is it still available?`
    : `Hello, I saw your listing on TradeNaija. Is it still available?`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export const POST_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days active window

export function isPostExpired(createdAt: string, expiresAt?: string): boolean {
  if (expiresAt) {
    return Date.now() > new Date(expiresAt).getTime();
  }
  const created = new Date(createdAt).getTime();
  return (Date.now() - created) > POST_LIFETIME_MS;
}

export function getRemainingDays(createdAt: string, expiresAt?: string): number {
  const expiryTime = expiresAt ? new Date(expiresAt).getTime() : new Date(createdAt).getTime() + POST_LIFETIME_MS;
  const diff = expiryTime - Date.now();
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function formatExpiryBadge(createdAt: string, expiresAt?: string): string {
  const days = getRemainingDays(createdAt, expiresAt);
  if (days <= 0 || isPostExpired(createdAt, expiresAt)) {
    return 'Expired (7 days completed)';
  }
  if (days === 1) {
    return 'Expires today';
  }
  return `${days} days left`;
}
