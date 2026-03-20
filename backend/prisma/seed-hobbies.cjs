// prisma/seed-hobbies.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const hobbies = [
  // --- Social & casual meetups ---
  "Coffee Meetup",
  "Brunch Meetup",
  "Afterwork Social Meetup",
  "New in Town Meetup",
  "Digital Nomad Meetup",
  "Remote Workers Meetup",
  "International Students Meetup",
  "Erasmus Meetup",
  "Expats Meetup",
  "Women in Tech Meetup",
  "Startup Founders Meetup",
  "Solo Travelers Meetup",
  "Weekend Social Mixer",
  "Networking Event",
  "Speed Networking",
  "Introverts Friendly Meetup",
  "Small Talk Practice",
  "Board Game & Chill",
  "Park Picnic Meetup",
  "Cozy Cafe Hangout",

  // --- Study & co-learning / ortak ders çalışma ---
  "Study Group - General",
  "Silent Study Session",
  "Pomodoro Study Session",
  "Library Study Hangout",
  "Co-working at Cafe",
  "Co-working at Library",
  "Online Study Session",
  "Online work Session",
  "Thesis Writing Sprint",
  "Research Paper Reading Club",
  "Journal Club",

  // --- Tech & coding ---
  "Coding Meetup",
  "Hackathon",
  "Competitive Programming Practice",
  "LeetCode Night",
  "CV & LinkedIn Review Meetup",
  "Job Interview Practice",
  "Career Change Circle",
  "Junior Developers Meetup",
  "Freelancers & Creators Meetup",
  "Side Project Builders Meetup",

  // --- Board games & gaming ---
  "Board Games",
  "Strategy Board Games",
  "Party Board Games",
  "Chess Club",
  "Go / Baduk Club",
  "Card Games Night",
  "Tabletop RPG Session",
  "Dungeons & Dragons Night",
  "Trading Card Games",
  "Esports Meetup",
  "Casual Gaming",
  "LAN Party",
  "Retro Gaming Night",
  "Mobile Games Meetup",
  "Puzzle & Brain Games",
  "Board Game Design",
  "Murder Mystery Night",
  "Trivia Night",
  "Quiz Night",

  // --- Sports & outdoor ---
  "Running",
  "Cycling",
  "Road Cycling",
  "Mountain Biking",
  "Gym & Fitness",
  "Calisthenics",
  "CrossFit",
  "Football",
  "Basketball",
  "Volleyball",
  "Beach Volleyball",
  "Tennis",
  "Table Tennis",
  "Badminton",
  "Hiking",
  "Trail Running",
  "Climbing",
  "Bouldering",
  "Swimming",
  "Open Water Swimming",
  "Yoga",
  "Pilates",
  "Functional Training",
  "Park Workout",
  "Morning Run Club",
  "Evening Walk Club",
  "Stretching & Mobility",
  "Urban Cycling Tour",
  "Skateboarding",
  "Roller Skating",
  "Skiing & Snowboarding",

  // --- Dance & movement ---
  "Dancing",
  "Zumba",
  "Contemporary Dance",
  "Social Dance Night",
  "Dance Practice Session",

  // --- Arts, crafts & making ---
  "Painting",
  "Watercolor Painting",
  "Acrylic Painting",
  "Drawing",
  "Sketching in the City",
  "Digital Art",
  "Graphic Design Jam",
  "Calligraphy",
  "Illustration",
  "Photography",
  "Street Photography Walk",
  "Portrait Photography",
  "Film Photography",
  "Videography",
  "Content Creation Meetup",
  "YouTube Creators Meetup",
  "Podcasting Meetup",
  "3D Printing & Maker Lab",
  "Arduino & Electronics Workshop",
  "Robotics Meetup",
  "Crafts & DIY",
  "Knitting & Crochet",
  "Embroidery",
  "Handmade Jewelry Workshop",
  "Pottery & Ceramics",
  "Origami",
  "Model Building",

  // --- Music & performance ---
  "Music Jam Session",
  "Guitar Circle",
  "Piano Lovers Meetup",
  "Singing Circle",
  "Choir Practice",
  "Open Mic Night",
  "Karaoke Night",
  "Songwriting Circle",
  "DJ & Electronic Music Meetup",
  "Music Production Meetup",
  "Live Concert Buddy Group",
  "Street Music Jam",
  "Classical Music Appreciation",
  "Jazz Listening Session",
  "Band Practice Session",
  // --- Local Business Support ---
"Local Cafe Meetup",
"Independent Cafe Tour",
"Coffee Tasting with Local Barista",
"Local Bookstore Meetup",
"Poetry Night at Indie Bookshop",
"Local Makerspace Tour",
"Terrarium Workshop (Plant Shop)",
"Handcrafted Soap Workshop",
"Ceramics Studio Experience",
"Yoga Studio Open Class",
"Pilates Studio Experience",
"Climbing Gym Beginner Day",
"Local Brewery Tour",
"Local Live Music Night",
"Meet the Local Founder",
"Small Business Networking Night",
"Local Farmers' Market Visit",
"Flea Market Treasure Hunt",
"Indie Fashion & Thrift Tour",
"Handmade Market Meetup",
"Local Street Food Night",

  // --- Language & culture ---
  "Language Exchange",
  "Coffee & Language Exchange",
  "Conversation Practice - Beginner",
  "Conversation Practice - Intermediate",
  "Conversation Practice - Advanced",
  "Book Club",
  "Non-fiction Book Club",
  "Fiction Book Club",
  "Philosophy Reading Group",
  "Culture Exchange Night",
  "Travel Stories Night",
  "Movie Night",
  "Documentary Night",
  "Anime & Manga Meetup",

  // --- Food & drink ---
  "Cooking Class",
  "Baking Class",
  "Dessert Workshop",
  "Barista & Coffee Workshop",
  "Tea Tasting",
  "Wine Tasting",
  "Beer Tasting",
  "Craft Beer Meetup",
  "Vegan Cooking Workshop",
  "Street Food Tour",
  "Restaurant Discovery Group",
  "International Cuisine Night",
  "Potluck Dinner",
  "Picnic & Snacks Meetup",
  "Food Photography Walk",

  // --- Wellness & mental health ---
  "Meditation",
  "Mindfulness Practice",
  "Breathwork Session",
  "Sound Healing",
  "Yoga & Meditation",
  "Morning Routine Club",
  "Gratitude Journal Circle",
  "Mental Health Support Circle",
  "Stress Relief Walk",
  "Nature Walk & Mindfulness",
  "Digital Detox Meetup",
  "Accountability Group",
  "Life Design Workshop",

  // --- Volunteering & community ---
  "Volunteering & Charity",
  "Beach Cleanup",
  "Park Cleanup",
  "Animal Shelter Volunteering",
  "Community Garden Meetup",
  "Charity Run & Walk",
  "Fundraising Events",
  "Teaching Kids Coding",
  "Mentoring Students",
  "Local Community Projects",
  "Neighborhood Meet & Greet",
  "Refugee Support Volunteers",
  "Recycling & Sustainability Meetup",
  "Climate Action Meetup",
  "Social Impact Projects",

  // --- Travel, city & exploration ---
  "City Walking Tour",
  "Hidden Spots in the City",
  "Museum & Gallery Visit",
  "Historical Sites Tour",
  "Weekend Trip Planning",
  "Backpacking Meetup",
  "Solo Travel Planning",
  "Travel Photo Walk",
  "Train Trip Meetup",
  "Nature Day Trip",

  // --- Online / hybrid specific ---
  "Online Study Group",
  "Online Language Exchange",
  "Online Game Night",
  "Online Movie Night",
  "Remote Book Club",
  "Virtual Coworking",
  "Virtual Coffee Chat",
  "Online Networking Event",
];

async function main() {
  console.log("⏳ Resetting hobbies to curated list...");

  // 1) Önce event ile ilgili bütün çocuk kayıtları sil
  await prisma.eventParticipant.deleteMany({});
  await prisma.eventFavorite.deleteMany({});
  await prisma.eventMessage.deleteMany({});
  await prisma.eventComment.deleteMany({});
  await prisma.eventView.deleteMany({});
  await prisma.eventClick.deleteMany({});

  // 2) Sonra eventlerin kendisini sil
  await prisma.event.deleteMany({});

  // 3) Kullanıcı-hobi bağlantılarını sil
  await prisma.userHobby.deleteMany({});

  // 4) En son hobi tablosunu tamamen boşalt
  await prisma.hobby.deleteMany({});

  // 5) Sadece yeni listeni ekle
  await prisma.hobby.createMany({
    data: hobbies.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log(`✅ Done. Inserted ${hobbies.length} hobbies.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
