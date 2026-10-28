// 100% Halal Background Image Catalog & Infinite Rotator Engine
// STRICT SHARIAH COMPLIANCE:
// 1. ZERO living beings (No humans, no faces, no pilgrims, no crowds, no animals, no birds).
// 2. ZERO non-Islamic religious iconography (Zero churches, zero European castles, zero temples, zero pagodas, zero statues, zero crosses).
// 3. ZERO Taj Mahal or tomb mausoleums.
// 4. PURELY: Holy Quran, Authentic Masjids (Sultanahmet/Blue Mosque, Sheikh Zayed, Jeddah Floating Mosque, Isfahan Muqarnas, Sultan Salahuddin), and Allah's Majestic Nature (Cosmos, Milky Way, Stars, Andromeda Galaxy, Crescent Moon, Deserts, Mountains, Waters, Dawn & Dusk).

export interface HalalScene {
  id: string;
  titleBn: string;
  category: 'masjid' | 'nature' | 'sky' | 'desert';
  url: string;
}

export const HALAL_SCENES: HalalScene[] = [
  // -------------------------------------------------------------------------
  // 1. HOLY QURAN & AUTHENTIC MASJIDS (100% Zero Faces/Crowds/Living Beings)
  // -------------------------------------------------------------------------
  {
    id: 'holy-quran-reverence',
    titleBn: 'পবিত্র আল-কুরআনুল কারীম',
    category: 'masjid',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'holy-quran-flowers',
    titleBn: 'পবিত্র কুরআন ও স্নিগ্ধ আলো',
    category: 'masjid',
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sheikh-zayed-grand-dusk',
    titleBn: 'শেখ জায়েদ গ্র্যান্ড মসজিদ, আবুধাবি (গোধূলির প্রতিচ্ছবি)',
    category: 'masjid',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'istanbul-blue-mosque-silhouette',
    titleBn: 'সুলতানাহমেত নীল মসজিদ ও মিনারমালার রূপরেখা, ইস্তাম্বুল',
    category: 'masjid',
    url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'cairo-citadel-minarets',
    titleBn: 'ঐতিহাসিক কায়রো দুর্গের মসজিদ ও মিনার',
    category: 'masjid',
    url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'isfahan-muqarnas-vault',
    titleBn: 'ঐতিহাসিক জামে মসজিদ, সূক্ষ্ম মুকারনাস খিলান কারুকাজ',
    category: 'masjid',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Gran_Mezquita_de_Isfah%C3%A1n%2C_Isfah%C3%A1n%2C_Ir%C3%A1n%2C_2016-09-20%2C_DD_26.jpg/1920px-Gran_Mezquita_de_Isfah%C3%A1n%2C_Isfah%C3%A1n%2C_Ir%C3%A1n%2C_2016-09-20%2C_DD_26.jpg'
  },
  {
    id: 'jeddah-floating-mosque',
    titleBn: 'লোহিত সাগরে ভাসমান আল-রাহমা মসজিদ, জেদ্দা',
    category: 'masjid',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Mosque_on_Water_V2.jpg/1920px-Mosque_on_Water_V2.jpg'
  },
  {
    id: 'malaysia-blue-mosque',
    titleBn: 'সুলতান সালাহউদ্দিন আব্দুল আজিজ মসজিদ, মালয়েশিয়া',
    category: 'masjid',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=2560&q=90'
  },

  // -------------------------------------------------------------------------
  // 2. CELESTIAL SKIES, STARS & COSMIC SIGNS (ALLAH'S CREATION)
  // -------------------------------------------------------------------------
  {
    id: 'starry-cosmos-night',
    titleBn: 'তারকাময় মহাবিশ্ব ও ছায়াপথ (সুরা মুলক)',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'crescent-moon-gradient',
    titleBn: 'গোধূলির আকাশে উজ্জ্বল একফালি চাঁদ',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'andromeda-galaxy',
    titleBn: 'মহাশূন্যে ঘূর্ণায়মান গ্যালাক্সি (আল্লাহর মহিমা)',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'snowy-peaks-shooting-star',
    titleBn: 'তুষারাবৃত পর্বত ও জ্বলজ্বলে উল্কাপাত',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'milkyway-galaxy-arm',
    titleBn: 'রাতের নিস্তব্ধ আকাশে মিল্কিওয়ে ছায়াপথ',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'aurora-borealis-snow',
    titleBn: 'উত্তর মেরুর মনোমুগ্ধকর আলোকচ্ছটা (অরোরা)',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'mountain-star-canopy',
    titleBn: 'পর্বতের চূড়ায় অজস্র তারকার মেলা',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'earth-from-space',
    titleBn: 'মহাকাশ থেকে পৃথিবীর দৃশ্য ও নক্ষত্রমণ্ডল',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'orbital-clouds',
    titleBn: 'বায়ুমণ্ডলের মেঘ ও নীলাভ দিগন্ত',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'crimson-sunset-clouds',
    titleBn: 'মাগরিবের রক্তিম মেঘমালার অপূর্ব রূপ',
    category: 'sky',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2560&q=90'
  },

  // -------------------------------------------------------------------------
  // 3. TRANQUIL DESERTS & MOUNTAINS (100% Non-Living Nature)
  // -------------------------------------------------------------------------
  {
    id: 'desert-canyon-pass',
    titleBn: 'মরুভূমির লাল গিরিখাতের শান্ত উন্মুক্ত পথ',
    category: 'desert',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'mountain-peaks-sunbeam',
    titleBn: 'পর্বতের শৈলশিরায় সকালের প্রথম রোদের আভা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'green-mountain-gorge',
    titleBn: 'সবুজ পর্বতময় গিরিখাতে ফজরের সূর্যোদয়',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'yosemite-valley-dawn',
    titleBn: 'শান্ত উপত্যকা ও নদীর নির্মল জলধারা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'alaska-wilderness-peaks',
    titleBn: 'মেঘের ওপরে জেগে থাকা বরফাবৃত পর্বতমালা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'misty-pine-silence',
    titleBn: 'কুয়াশাচ্ছন্ন পাইন অরণ্য ও প্রশান্ত নীরবতা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'quiraing-dawn-valley',
    titleBn: 'ভোরের প্রথম আলোয় কুয়াশার চাদরে ঢাকা উপত্যকা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sunrise-misty-hills',
    titleBn: 'ফজরের স্নিগ্ধ আলোয় পাহাড়ি দিগন্তরেখা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sunbeam-forest-trees',
    titleBn: 'অরণ্যের পাতার ফাঁক গলে আসা সোনালী আলো',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sunset-tranquil-lake',
    titleBn: 'মাগরিবের শান্ত হ্রদে অস্তগামী সূর্যের প্রতিবিম্ব',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'el-capitan-monolith',
    titleBn: 'বিশাল গ্রানাইট পর্বত ও সোনালী ঘাস',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'clear-mountain-lake',
    titleBn: 'স্ফটিকের মতো স্বচ্ছ পাহাড়ি হ্রদের দর্পণ',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'golden-meadow-sunrise',
    titleBn: 'ভোরের মৃদু আলোয় শ্যামল প্রান্তর ও পাহাড়',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'solitary-majestic-tree',
    titleBn: 'উন্মুক্ত প্রান্তরে একাকী মহীরুহের সৌন্দর্য',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'grand-tree-sunburst',
    titleBn: 'বিশাল বৃক্ষের শাখায় সূর্যের দীপ্তি',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'high-mountain-ridges',
    titleBn: 'নীল আকাশের বুকে সুউচ্চ পর্বতশ্রেণী',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sunset-golden-wheat',
    titleBn: 'গোধূলিলগ্নে সোনালী ফসলের নীরব মাঠ',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'turquoise-ocean-shore',
    titleBn: 'শান্ত সমুদ্র সৈকত ও নীল জলরাশি',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'snow-peaks-twilight',
    titleBn: 'সন্ধ্যা নামার মুহূর্তে শুভ্র বরফে মোড়া পর্বতশৃঙ্গ',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sierra-mountain-autumn',
    titleBn: 'শরতের সোনালী মাঠ ও তুষারাবৃত পাহাড়',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'tall-redwood-canopy',
    titleBn: 'উচ্চশির বৃক্ষরাজির আকাশছোঁয়া ছায়া',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'red-poppy-field',
    titleBn: 'প্রশান্ত প্রান্তরে রক্তিম ফুলের সমারোহ',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'sunset-lake-stars',
    titleBn: 'সূর্যাস্তের মায়াবী আলো ও সন্ধ্যার প্রথম তারা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'emerald-river-forest',
    titleBn: 'সবুজ বনাঞ্চল ও শান্ত নদীর নীল জলধারা',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2560&q=90'
  },
  {
    id: 'pine-canopy-road',
    titleBn: 'পাইন অরণ্যের বুক চিরে যাওয়া নির্জন পথ',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=2560&q=90'
  }
];

// Helper to shuffle array non-destructively (Fisher-Yates)
export function shuffleScenes(list: HalalScene[]): HalalScene[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
