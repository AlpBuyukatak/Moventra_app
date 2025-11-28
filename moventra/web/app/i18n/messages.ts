// app/i18n/messages.ts
export type Language = "en" | "tr" | "de";

// Leaf değerler: string veya string[]
type MessageLeaf = string | string[];

// NestedMessages artık string, string[] veya nested object tutabilir
type NestedMessages = {
  [key: string]: MessageLeaf | NestedMessages;
};

export const messages: Record<Language, NestedMessages> = {
  en: {
    common: {
      brandName: "Moventra",
    },
    nav: {
      events: "Events",
      hobbies: "All hobbies",
      nearbyTitle: "Nearby events",
      nearbySubtitle:
        "We’ll ping you when new events appear near your location.",
      nearbyChecking: "Checking your city…",
      nearbyNoneWithCity: "No new events near {city} this week.",
      nearbyNoneNoCity:
        "Add your city in your profile to get nearby event alerts.",
      signedInAs: "Signed in as",
      yourEvents: "Your events",
      yourGroups: "Your groups",
      viewProfile: "View profile",
      settings: "Settings",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      logout: "Log out",
      messagesAria: "Messages (coming soon)",
      notificationsAria: "Notifications",
      taglines: [
        "find new friends in every city",
        "meet people through your hobbies",
        "discover small, interest-based meetups",
        "move, travel, meet people",
      ],
    },
    footer: {
      ctaTitle: "Do you host events?",
      ctaText:
        "Let Moventra help you fill your small group meetups with people who share the same hobbies. Create an event in a few clicks.",
      ctaButton: "Create an event",
      ctaNote:
        "No big crowd tools here – focused on small, hobby-based groups.",
      miniStats: {
        cities: "cities",
        hobbies: "hobbies",
        events: "events this week",
        currentlyExploring: "Currently exploring:",
        changeCity: "Change city",
      },
      brandText:
        "Meet people through your hobbies, in any city. Small groups, friendly events, less awkwardness.",
      brandSubText:
        "Built with care for small, real-world communities – not noisy, anonymous crowds.",
      discoverTitle: "Discover",
      discoverItems: {
        nearYou: "Events near you",
        popular: "Popular hobbies",
        remote: "Remote meetups",
      },
      organizersTitle: "For organizers",
      organizersItems: {
        howItWorks: "How it works",
        hostGuidelines: "Host guidelines",
        safetyTips: "Safety tips",
      },
      organizersNote:
        "Moventra is designed around small, safe, friendly groups and clear community standards.",
      connectTitle: "Connect",
      connectNote:
        "App links & social profiles will live here later. iOS and Android apps are on the roadmap.",
      newsletterPlaceholder: "Your email (coming soon)",
      newsletterButton: "Get updates",
      bottom: {
        rights: "All rights reserved.",
        builtWithLove: "Built with ❤️ for hobby-based communities.",
        terms: "Terms",
        privacy: "Privacy",
        cookies: "Cookies",
        languageLabel: "Language",
      },
    },
      home: {
        hero: {
          welcome: "Welcome to Moventra",
          titleLine1: "Meet people",
          titleLine2: "through your hobbies.",
          description:
            "Discover local and global events based on what you love: board games, sports, workshops, language exchange and more. Join small, friendly groups instead of crowded random meetups.",
          browseEvents: "Browse events",
          seeHobbies: "See all hobbies",
          smallNote:
            "No spam, no giant crowds. Just small, interest-based meetups.",
        },
why: {
  freeNote:
    "Moventra is free to use – you only pay when an organizer charges for a specific event.",

  title: "Why Moventra?",
  text:
    "Instead of scrolling through random events, Moventra focuses on hobbies first. You choose what you love, we show you where you can meet.",
  citiesLabel: "Cities tested",
  hobbiesLabel: "Hobby types",
  groupsLabel: "Small group meetups",
  pill1: "Great for newcomers",
  pill2: "Perfect for expats & students",
  pill3: "No big crowds",

  // SLIDE 2
  page2Title: "Small groups, real conversations",
  page2Text:
    "Moventra focuses on friendly, small-group meetups where you can actually talk.",
  page2Bullet1:
    "Hosts keep groups intentionally small and welcoming.",
  page2Bullet2:
    "Clear event descriptions help you know what to expect.",
  page2Bullet3:
    "Ideal if big, noisy meetups feel draining or awkward.",
  page2Tag1: "small groups",
  page2Tag2: "easy conversations",

  // SLIDE 3
  page3Title: "Designed for hobby-first discovery",
  page3Text:
    "Instead of endless feeds, Moventra helps you meet people through what you already enjoy.",
  page3Bullet1:
    "Browse events by what you like, not by random categories.",
  page3Bullet2:
    "Get ideas for new meetups from real hobby examples.",
  page3Bullet3:
    "Filter by city so you only see events that are relevant to you.",
  page3BottomNote:
    "Start with a hobby you already love – or use Moventra to restart something you stopped doing.",

  // ⭐ NEW — SLIDE 3 TAGS (tasarım için istediğin ek alanlar)
  page3Tag1: "No algorithmic feeds",
  page3Tag2: "No follower counts",
  page3Tag3: "Real-life meetups first",
},
      spotlight: {
        prefix: "Right now, people are mostly meeting for",
      },
      how: {
        title: "How Moventra works",
        text:
          "Pick your city, choose a hobby, and join a small group. Moventra keeps things simple so you can focus on real conversations, not endless feeds.",
        step1Title: "Choose your city",
        step1Text:
          "Set your home base or travel destination. We'll show events nearby first.",
        step2Title: "Pick your hobbies",
        step2Text:
          "From board games to hiking, language exchange or tech talks: choose what you actually enjoy.",
        step3Title: "Join small groups",
        step3Text:
          "Meet up in small, friendly groups where it's easy to talk and actually remember people's names.",
      },
      explore: {
        title: "Explore by hobby",
        subtitle:
          "Some of the most popular ways people use Moventra right now.",
        viewAll: "View all hobbies →",
        cards: {
          boardGames: {
            title: "Board games",
            text: "Catan, Codenames, chess nights & more.",
          },
          walkTalk: {
            title: "Walk & talk",
            text: "Casual city walks and coffee afterwards.",
          },
          language: {
            title: "Language exchange",
            text: "Practice English, German, Turkish & more.",
          },
          sports: {
            title: "Outdoor & sports",
            text: "Running clubs, hiking groups, cycling meetups.",
          },
          tech: {
            title: "Tech & startup",
            text: "Side-project nights, coding meetups, study groups.",
          },
          creative: {
            title: "Creative hobbies",
            text: "Drawing, photography and creative workshops.",
          },
        },
      },
      trust: {
        title: "Built for real-world conversations",
        text:
          "Moventra is for people who want to actually meet – not just join another online group. Events are designed around small groups, clear descriptions and real interests.",
        bullet1:
          "Hosts share clear event details, locations and group size.",
        bullet2:
          "You decide how often you join – no commitment, no pressure.",
        bullet3:
          "Great for moving to a new city or restarting old hobbies.",
        boxTitle: "Ready to meet people through your hobbies?",
        boxText:
          "Start by browsing events in your city or explore all hobbies to see what's possible with Moventra.",
        browseEvents: "Browse nearby events",
        exploreHobbies: "Explore hobby ideas",
      },
    },
    profile: {
      loading: "Loading your profile…",
      error: {
        couldNotLoad: "Could not load profile.",
      },
      hero: {
        defaultName: "there",
        title: "What are you up to, {name}?",
        subtitle:
          "Plan new events, explore groups and manage your Moventra profile from here.",
      },
      dashboard: {
        events: {
          title: "Your events",
          ctaAll: "See all",
          empty: "No plans yet? Let’s fix that!",
          button: "Find events",
        },
        groups: {
          title: "Your groups",
          ctaAll: "See all",
          text:
            "Join a group that shares your passions – and start connecting today.",
          button: "Explore groups near you",
        },
        interests: {
          title: "Your interests",
          edit: "Edit",
          empty: "You haven’t added any interests yet.",
          addButton: "+ Add interests",
        },
      },
      card: {
        title: "Profile & account details",
        subtitle:
          "Update your basic info in Settings. We use this to personalise events and recommendations for you.",
        editInSettingsButton: "Edit profile in Settings",
      },
      summary: {
        homeCity: "Home city:",
        memberSince: "Member since",
        plan: "Plan:",
      },
      stats: {
        groups: "Groups",
        interests: "Interests",
        rsvps: "RSVPs",
      },
    },
    hobbies: {
      intro:
        "Click a hobby to see events worldwide related to that interest.",
      list: {
        count: "{count} hobby found",
        empty: "No hobbies found for this search.",
      },
      search: {
        placeholder: "Search hobbies...",
      },
      loading: "Loading hobbies...",
      error: {
        couldNotLoad: "Could not load hobbies.",
        generic: "Something went wrong while loading hobbies.",
      },
    },
    hobbyNames: {
      "coffeeMeetup": "Coffee Meetup",
      "brunchMeetup": "Brunch Meetup",
      "afterworkDrinks": "Afterwork Drinks",
      "newInTownMeetup": "New in Town Meetup",
      "digitalNomadMeetup": "Digital Nomad Meetup",
      "remoteWorkersMeetup": "Remote Workers Meetup",
      "internationalStudentsMeetup": "International Students Meetup",
      "erasmusMeetup": "Erasmus Meetup",
      "expatsMeetup": "Expats Meetup",
      "womenInTechMeetup": "Women in Tech Meetup",
      "startupFoundersMeetup": "Startup Founders Meetup",
      "soloTravelersMeetup": "Solo Travelers Meetup",
      "weekendSocialMixer": "Weekend Social Mixer",
      "networkingEvent": "Networking Event",
      "speedNetworking": "Speed Networking",
      "introvertsFriendlyMeetup": "Introverts Friendly Meetup",
      "smallTalkPractice": "Small Talk Practice",
      "boardGameChill": "Board Game & Chill",
      "parkPicnicMeetup": "Park Picnic Meetup",
      "cozyCafeHangout": "Cozy Cafe Hangout",
      "studyGroupGeneral": "Study Group - General",
      "studyGroupMathematics": "Study Group - Mathematics",
      "studyGroupPhysics": "Study Group - Physics",
      "studyGroupComputerScience": "Study Group - Computer Science",
      "studyGroupEngineering": "Study Group - Engineering",
      "studyGroupProgramming": "Study Group - Programming",
      "studyGroupDataScience": "Study Group - Data Science",
      "studyGroupAiMachineLearning": "Study Group - AI & Machine Learning",
      "studyGroupExamPrep": "Study Group - Exam Prep",
      "studyGroupUniversityEntrance": "Study Group - University Entrance",
      "deepWorkSession": "Deep Work Session",
      "silentStudySession": "Silent Study Session",
      "pomodoroStudySession": "Pomodoro Study Session",
      "libraryStudyHangout": "Library Study Hangout",
      "coWorkingAtCafe": "Co-working at Cafe",
      "coWorkingAtLibrary": "Co-working at Library",
      "onlineCoWorkingSession": "Online Co-working Session",
      "thesisWritingSprint": "Thesis Writing Sprint",
      "researchPaperReadingClub": "Research Paper Reading Club",
      "journalClub": "Journal Club",
      "codingMeetup": "Coding Meetup",
      "webDevelopmentMeetup": "Web Development Meetup",
      "mobileDevelopmentMeetup": "Mobile Development Meetup",
      "gameDevelopmentMeetup": "Game Development Meetup",
      "backendEngineeringMeetup": "Backend Engineering Meetup",
      "frontendEngineeringMeetup": "Frontend Engineering Meetup",
      "devopsCloudMeetup": "DevOps & Cloud Meetup",
      "cybersecurityMeetup": "Cybersecurity Meetup",
      "aiMachineLearningMeetup": "AI & Machine Learning Meetup",
      "dataScienceMeetup": "Data Science Meetup",
      "dataEngineeringMeetup": "Data Engineering Meetup",
      "openSourceContributorsMeetup": "Open Source Contributors Meetup",
      "hackathon": "Hackathon",
      "competitiveProgrammingPractice": "Competitive Programming Practice",
      "leetCodeNight": "LeetCode Night",
      "techTalksLightningTalks": "Tech Talks & Lightning Talks",
      "productManagementMeetup": "Product Management Meetup",
      "uiUxDesignMeetup": "UI/UX Design Meetup",
      "noCodeLowCodeMeetup": "No-Code / Low-Code Meetup",
      "makersHardwareHacking": "Makers & Hardware Hacking",
      "boardGames": "Board Games",
      "strategyBoardGames": "Strategy Board Games",
      "partyBoardGames": "Party Board Games",
      "chessClub": "Chess Club",
      "goBadukClub": "Go / Baduk Club",
      "cardGamesNight": "Card Games Night",
      "tabletopRpgSession": "Tabletop RPG Session",
      "dungeonsDragonsNight": "Dungeons & Dragons Night",
      "tradingCardGames": "Trading Card Games",
      "esports": "Esports",
      "casualGaming": "Casual Gaming",
      "lanParty": "LAN Party",
      "retroGamingNight": "Retro Gaming Night",
      "mobileGamesMeetup": "Mobile Games Meetup",
      "puzzleBrainGames": "Puzzle & Brain Games",
      "boardGameDesign": "Board Game Design",
      "murderMysteryNight": "Murder Mystery Night",
      "triviaNight": "Trivia Night",
      "quizNight": "Quiz Night",
      "casinoNightJustForFun": "Casino Night (Just for Fun)",
      "running": "Running",
      "cycling": "Cycling",
      "roadCycling": "Road Cycling",
      "mountainBiking": "Mountain Biking",
      "gymFitness": "Gym / Fitness",
      "calisthenics": "Calisthenics",
      "crossfit": "CrossFit",
      "football": "Football",
      "basketball": "Basketball",
      "volleyball": "Volleyball",
      "beachVolleyball": "Beach Volleyball",
      "tennis": "Tennis",
      "tableTennis": "Table Tennis",
      "badminton": "Badminton",
      "hiking": "Hiking",
      "trailRunning": "Trail Running",
      "climbing": "Climbing",
      "bouldering": "Bouldering",
      "swimming": "Swimming",
      "openWaterSwimming": "Open Water Swimming",
      "yoga": "Yoga",
      "pilates": "Pilates",
      "functionalTraining": "Functional Training",
      "parkWorkout": "Park Workout",
      "morningRunClub": "Morning Run Club",
      "eveningWalkClub": "Evening Walk Club",
      "stretchingMobility": "Stretching & Mobility",
      "urbanCyclingTour": "Urban Cycling Tour",
      "skateboarding": "Skateboarding",
      "rollerSkating": "Roller Skating",
      "skiingSnowboarding": "Skiing & Snowboarding",
      "dancingSalsa": "Dancing - Salsa",
      "dancingBachata": "Dancing - Bachata",
      "dancingKizomba": "Dancing - Kizomba",
      "dancingTango": "Dancing - Tango",
      "dancingHipHop": "Dancing - Hip Hop",
      "dancingKPop": "Dancing - K-Pop",
      "zumba": "Zumba",
      "contemporaryDance": "Contemporary Dance",
      "socialDanceNight": "Social Dance Night",
      "dancePracticeSession": "Dance Practice Session",
      "painting": "Painting",
      "watercolorPainting": "Watercolor Painting",
      "acrylicPainting": "Acrylic Painting",
      "drawing": "Drawing",
      "sketchingInTheCity": "Sketching in the City",
      "digitalArt": "Digital Art",
      "graphicDesignJam": "Graphic Design Jam",
      "calligraphy": "Calligraphy",
      "photography": "Photography",
      "streetPhotographyWalk": "Street Photography Walk",
      "portraitPhotography": "Portrait Photography",
      "filmPhotography": "Film Photography",
      "videography": "Videography",
      "contentCreationMeetup": "Content Creation Meetup",
      "youTubeCreatorsMeetup": "YouTube Creators Meetup",
      "podcastingMeetup": "Podcasting Meetup",
      "3dPrintingMakerLab": "3D Printing & Maker Lab",
      "arduinoElectronicsWorkshop": "Arduino & Electronics Workshop",
      "roboticsMeetup": "Robotics Meetup",
      "craftsDiy": "Crafts & DIY",
      "knittingCrochet": "Knitting & Crochet",
      "embroidery": "Embroidery",
      "handmadeJewelryWorkshop": "Handmade Jewelry Workshop",
      "potteryCeramics": "Pottery & Ceramics",
      "origami": "Origami",
      "modelBuilding": "Model Building",
      "jamSession": "Jam Session",
      "guitarCircle": "Guitar Circle",
      "pianoLoversMeetup": "Piano Lovers Meetup",
      "singingCircle": "Singing Circle",
      "choirPractice": "Choir Practice",
      "openMicNight": "Open Mic Night",
      "karaokeNight": "Karaoke Night",
      "songwritingCircle": "Songwriting Circle",
      "djElectronicMusicMeetup": "DJ & Electronic Music Meetup",
      "musicProductionMeetup": "Music Production Meetup",
      "liveConcertBuddyGroup": "Live Concert Buddy Group",
      "streetMusicJam": "Street Music Jam",
      "classicalMusicAppreciation": "Classical Music Appreciation",
      "jazzListeningSession": "Jazz Listening Session",
      "bandPracticeSession": "Band Practice Session",
      "languageExchangeEnglish": "Language Exchange - English",
      "languageExchangeGerman": "Language Exchange - German",
      "languageExchangeTurkish": "Language Exchange - Turkish",
      "languageExchangeSpanish": "Language Exchange - Spanish",
      "languageExchangeItalian": "Language Exchange - Italian",
      "languageExchangeFrench": "Language Exchange - French",
      "languageExchangeMixed": "Language Exchange - Mixed",
      "coffeeLanguageExchange": "Coffee & Language Exchange",
      "conversationPracticeBeginner": "Conversation Practice - Beginner",
      "conversationPracticeIntermediate":
        "Conversation Practice - Intermediate",
      "conversationPracticeAdvanced": "Conversation Practice - Advanced",
      "bookClub": "Book Club",
      "nonFictionBookClub": "Non-fiction Book Club",
      "fictionBookClub": "Fiction Book Club",
      "philosophyReadingGroup": "Philosophy Reading Group",
      "cultureExchangeNight": "Culture Exchange Night",
      "travelStoriesNight": "Travel Stories Night",
      "movieNight": "Movie Night",
      "documentaryNight": "Documentary Night",
      "animeMangaMeetup": "Anime & Manga Meetup",
      "cookingClass": "Cooking Class",
      "baking": "Baking",
      "dessertWorkshop": "Dessert Workshop",
      "baristaCoffeeWorkshop": "Barista & Coffee Workshop",
      "teaTasting": "Tea Tasting",
      "wineTasting": "Wine Tasting",
      "beerTasting": "Beer Tasting",
      "craftBeerMeetup": "Craft Beer Meetup",
      "veganCookingWorkshop": "Vegan Cooking Workshop",
      "streetFoodTour": "Street Food Tour",
      "restaurantDiscoveryGroup": "Restaurant Discovery Group",
      "internationalCuisineNight": "International Cuisine Night",
      "potluckDinner": "Potluck Dinner",
      "picnicSnacksMeetup": "Picnic & Snacks Meetup",
      "foodPhotographyWalk": "Food Photography Walk",
      "meditation": "Meditation",
      "mindfulnessPractice": "Mindfulness Practice",
      "breathworkSession": "Breathwork Session",
      "soundHealing": "Sound Healing",
      "yogaMeditation": "Yoga & Meditation",
      "morningRoutineClub": "Morning Routine Club",
      "gratitudeJournalCircle": "Gratitude Journal Circle",
      "mentalHealthSupportCircle": "Mental Health Support Circle",
      "stressReliefWalk": "Stress Relief Walk",
      "natureWalkMindfulness": "Nature Walk & Mindfulness",
      "digitalDetoxMeetup": "Digital Detox Meetup",
      "journalingMeetup": "Journaling Meetup",
      "goalSettingSession": "Goal Setting Session",
      "accountabilityGroup": "Accountability Group",
      "lifeDesignWorkshop": "Life Design Workshop",
      "volunteeringCharity": "Volunteering & Charity",
      "beachCleanup": "Beach Cleanup",
      "parkCleanup": "Park Cleanup",
      "animalShelterVolunteering": "Animal Shelter Volunteering",
      "communityGardenMeetup": "Community Garden Meetup",
      "charityRunWalk": "Charity Run / Walk",
      "fundraisingEvents": "Fundraising Events",
      "teachingKidsCoding": "Teaching Kids Coding",
      "mentoringStudents": "Mentoring Students",
      "localCommunityProjects": "Local Community Projects",
      "neighborhoodMeetGreet": "Neighborhood Meet & Greet",
      "refugeeSupportVolunteers": "Refugee Support Volunteers",
      "recyclingSustainabilityMeetup":
        "Recycling & Sustainability Meetup",
      "climateActionMeetup": "Climate Action Meetup",
      "socialImpactProjects": "Social Impact Projects",
      "cityWalkingTour": "City Walking Tour",
      "hiddenSpotsInTheCity": "Hidden Spots in the City",
      "museumGalleryVisit": "Museum & Gallery Visit",
      "historicalSitesTour": "Historical Sites Tour",
      "weekendTripPlanning": "Weekend Trip Planning",
      "backpackingMeetup": "Backpacking Meetup",
      "soloTravelPlanning": "Solo Travel Planning",
      "travelPhotoWalk": "Travel Photo Walk",
      "trainTripMeetup": "Train Trip Meetup",
      "natureDayTrip": "Nature Day Trip",
      "onlineStudyGroup": "Online Study Group",
      "onlineCodingSession": "Online Coding Session",
      "onlineLanguageExchange": "Online Language Exchange",
      "onlineGameNight": "Online Game Night",
      "onlineMovieNight": "Online Movie Night",
      "remoteBookClub": "Remote Book Club",
      "virtualCoworking": "Virtual Coworking",
      "virtualCoffeeChat": "Virtual Coffee Chat",
      "onlineNetworkingEvent": "Online Networking Event",
      "remoteTeamBuilding": "Remote Team Building",
    },
    settings: {
      pageTitle: "Settings",
      sidebar: {
        profile: "Edit profile",
        account: "Account management",
        email: "Email updates",
        privacy: "Privacy",
        social: "Social media",
        interests: "Interests",
        payments: "Payment methods",
        badgeSoon: "soon",
      },
      profile: {
        title: "Edit profile",
        subtitle:
          "Update your basic info. We use this to personalise events and recommendations for you.",
        nameLabel: "Name",
        namePlaceholder: "Your name",
        locationLabel: "Your location",
        locationPlaceholder: "Select city",
        locationButton: "Edit address",
        locationHelper: "We'll use this to show you nearby events.",
        birthdateLabel: "Birth date",
        birthdateDay: "Day",
        birthdateMonth: "Month",
        birthdateYear: "Year",
        birthdateHelper:
          "We’ll never show your exact birthday publicly. It’s only used for age-appropriate recommendations.",
        genderLabel: "Gender",
        genderPlaceholder: "Prefer not to say",
        genderOptions: {
          female: "Female",
          male: "Male",
          nonBinary: "Non-binary",
          preferNot: "Prefer not to say",
        },
        bioLabel: "Bio",
        bioPlaceholder: "Write a little bit about yourself here",
        toggles: {
          showGroupsLabel: "Show Meetup-style groups",
          showGroupsDescription:
            "On your profile, people can see all groups you belong to.",
          showInterestsLabel: "Show interests",
          showInterestsDescription:
            "On your profile, people can see your list of interests.",
        },
        saveButton: "Save changes",
        savingButton: "Saving…",
        saveSuccess: "Profile updated.",
        saveError: "Could not save profile.",
        loadingProfile: "Loading profile…",
      },
      account: {
        title: "Account management",
        emailLabel: "Your email",
        languageLabel: "Language",
        languageHelper:
          "This changes the language used across Moventra on this device.",
        timeZoneLabel: "Primary time zone",
        timeZoneHelper:
          'Your choice will influence how event times are displayed. If you want the time zone to be determined by your location, select "System time (default)".',
        timeZoneOptions: {
          system: "System time (default) – use device time zone",
          cet: "Central European Time (CET)",
          gmt: "Greenwich Mean Time (GMT)",
        },
        changePassword: {
          title: "Change your password",
          helper:
            "When you change your password, you'll be automatically signed out from your other sessions.",
          openButton: "Change password",
          cancelButton: "Cancel",
          currentPlaceholder: "Current password",
          newPlaceholder: "New password",
          confirmPlaceholder: "Confirm new password",
          errorFillAll: "Please fill in all fields.",
          errorMismatch: "New passwords do not match.",
          errorTooShort: "New password must be at least 8 characters.",
          genericError: "Could not change password.",
          success: "Your password has been updated.",
          submitButton: "Save new password",
          submittingButton: "Updating…",
        },
        deactivate: {
          title: "Deactivate your account",
          helper:
            "If you decide to leave Moventra, you'll need to create a new account to come back.",
          confirmMessage:
            "Are you sure you want to deactivate your Moventra account? This will sign you out and you won't be able to use this account again.",
          button: "Deactivate account",
          buttonLoading: "Deactivating…",
          statusSuccess: "Your account has been deactivated.",
          statusError:
            "Could not deactivate account. Please try again.",
        },
        gdpr: {
          title: "Data & GDPR requests",
          helper:
            "Submit requests for data portability and erasure in accordance with GDPR regulations.",
          typeLabel: "Request type",
          typeOptions: {
            access: "Access / export my personal data",
            erasure: "Delete / erase my personal data",
            other: "Other GDPR request",
          },
          detailsLabel: "Details (optional)",
          detailsPlaceholder:
            "Add any details that might help us process your request faster.",
          submitButton: "Submit GDPR request",
          submittingButton: "Submitting…",
          statusSuccess:
            "Your request has been submitted. We'll contact you via email.",
          statusError: "Could not submit GDPR request.",
        },
      },
      email: {
        title: "Email updates",
        intro:
          "Select what email updates you get about your activity, events and groups. When certain push notifications are on, we can skip sending the same info via email.",
        sections: {
          updatesTitle: "Updates from Moventra",
          updatesHelper:
            "Control what types of email notifications from Moventra you get.",
          turnOffTitle: "Turn off all email updates",
          turnOffHelper:
            "We’ll stop sending you email updates. You may still receive certain communications, such as legal announcements and transactional updates.",
          turnOffButton: "Turn off",
        },
        rows: {
          messagesTitle: "Messages",
          messagesDescription:
            "Email me when someone sends me a message.",
          repliesTitle: "Replies to my comments",
          repliesDescription:
            "Email me when someone replies to my comments.",
          suggestedTitle: "Suggested events",
          suggestedDescription:
            "Weekly highlights based on your groups and interests.",
          newGroupsTitle: "New Moventra groups",
          newGroupsDescription:
            "Tell me about new groups that match my interests.",
          updatesHQTitle: "Updates from Moventra HQ",
          updatesHQDescription:
            "Tell me about new features and important Moventra news.",
          surveysTitle: "Moventra surveys",
          surveysDescription:
            "Ask me things that could make Moventra better.",
          icalTitle: "iCal attachments",
          icalDescription:
            "Send me email reminders with calendar attachments.",
          proNetworkTitle: "Updates from Pro networks",
          proNetworkDescription:
            "Receive updates from my Pro groups.",
          connectionsTitle: "Connections",
          connectionsDescription:
            "Notify me about new connections on Moventra.",
        },
      },
      privacy: {
        title: "Privacy",
        intro:
          "Control who can contact you and what others can see on your public profile.",
        contactsTitle: "Contacts",
        contactsHelper:
          "Who can contact you on Moventra? You can adjust this at any time.",
        contactsOptions: {
          organizers: "Organizers only",
          groups: "Members of my groups only",
          anyone: "Anyone on Moventra",
        },
        publicProfileTitle: "Public profile",
        publicProfileHelper:
          "Control what others are able to see on your public profile.",
        editProfileButton: "Edit profile",
      },
      comingSoon: {
        title: "Coming soon",
        text: "This settings section will be available in a future update.",
      },
    },
    cityPicker: {
      // ✅ Modal başlığı
      title: "Choose city",

      // ✅ Ülke dropdown placeholder
      countryPlaceholder: "Select country",

      // ✅ Şehir dropdown normal placeholder (ülke seçilip, loading bitince)
      statePlaceholder: "Select city / region",

      // ✅ Ülke seçilmemişken gösterilen metin
      selectCountryFirst: "Select a country first",

      // ✅ Şehirler yüklenirken gösterilen metin
      loadingStates: "Loading cities...",

      // ✅ Buton yazısı
      showEventsButton: "Show events in this location",

      // (Eski key’ler – istersen bırakabilirsin, başka yer kullanıyorsa bozulmasın)
      statePlaceholderNoCountry: "Select a country first",
      statePlaceholderLoading: "Loading…",
      statePlaceholderReady: "Select city / region",
      buttonLabel: "Show events in this location",
    },

  },

  tr: {
    common: {
      brandName: "Moventra",
    },
    nav: {
      events: "Etkinlikler",
      hobbies: "Tüm hobiler",
      nearbyTitle: "Yakındaki etkinlikler",
      nearbySubtitle:
        "Konumuna yakın yeni etkinlikler olduğunda sana haber vereceğiz.",
      nearbyChecking: "Şehrin kontrol ediliyor…",
      nearbyNoneWithCity: "{city} yakınında bu hafta yeni etkinlik yok.",
      nearbyNoneNoCity:
        "Yakındaki etkinlikler için profilinden şehrini ekle.",
      signedInAs: "Giriş yapılan hesap",
      yourEvents: "Etkinliklerin",
      yourGroups: "Grupların",
      viewProfile: "Profili görüntüle",
      settings: "Ayarlar",
      darkMode: "Karanlık tema",
      lightMode: "Açık tema",
      logout: "Çıkış yap",
      messagesAria: "Mesajlar (yakında)",
      notificationsAria: "Bildirimler",
      taglines: [
        "her şehirde yeni arkadaşlar bul",
        "hobilerin üzerinden insanlarla tanış",
        "küçük, ilgi odaklı buluşmalar keşfet",
        "hareket et, seyahat et, insanlarla tanış",
      ],
    },
    footer: {
      ctaTitle: "Etkinlik mi düzenliyorsun?",
      ctaText:
        "Moventra, küçük grup buluşmalarını seninle aynı hobileri paylaşan insanlarla doldurmana yardımcı olsun. Birkaç tıklamayla etkinlik oluştur.",
      ctaButton: "Etkinlik oluştur",
      ctaNote:
        "Kalabalık kitle araçları yok – sadece küçük, hobi odaklı gruplar.",
      miniStats: {
        cities: "şehir",
        hobbies: "hobi",
        events: "etkinlik (bu hafta)",
        currentlyExploring: "Şu an keşfedilen şehir:",
        changeCity: "Şehir değiştir",
      },
      brandText:
        "Hobilerin üzerinden, her şehirde insanlarla tanış. Küçük gruplar, samimi etkinlikler, daha az kasıntı.",
      brandSubText:
        "Gerçek, küçük topluluklar için özenle tasarlandı – gürültülü, anonim kalabalıklar için değil.",
      discoverTitle: "Keşfet",
      discoverItems: {
        nearYou: "Yakındaki etkinlikler",
        popular: "Popüler hobiler",
        remote: "Online buluşmalar",
      },
      organizersTitle: "Organizatörler için",
      organizersItems: {
        howItWorks: "Nasıl çalışır?",
        hostGuidelines: "Ev sahibi rehberi",
        safetyTips: "Güvenlik ipuçları",
      },
      organizersNote:
        "Moventra küçük, güvenli, samimi gruplar ve net topluluk kuralları etrafında tasarlandı.",
      connectTitle: "Bağlantı",
      connectNote:
        "Uygulama linkleri ve sosyal hesaplar ileride burada olacak. iOS ve Android uygulamaları planlarda.",
      newsletterPlaceholder: "E-posta adresin (yakında)",
      newsletterButton: "Güncellemeleri al",
      bottom: {
        rights: "Tüm hakları saklıdır.",
        builtWithLove:
          "Hobi temelli topluluklar için ❤️ ile geliştirildi.",
        terms: "Şartlar",
        privacy: "Gizlilik",
        cookies: "Çerezler",
        languageLabel: "Dil",
      },
    },
    home: {
      hero: {
        welcome: "Moventra’ya hoş geldin",
        titleLine1: "İnsanlarla tanış",
        titleLine2: "hobilerin üzerinden.",
        description:
          "Sevdiğin şeylere göre lokal ve global etkinlikleri keşfet: kutu oyunları, spor, atölyeler, dil değişimi ve daha fazlası. Kalabalık ve rastgele gruplar yerine küçük, samimi buluşmalara katıl.",
        browseEvents: "Etkinliklere göz at",
        seeHobbies: "Tüm hobileri gör",
        smallNote:
          "Spam yok, dev kalabalıklar yok. Sadece küçük, ilgi odaklı buluşmalar.",
      },
why: {
  freeNote:
    "Moventra’yı ücretsiz kullanabilirsin – sadece bazı etkinlikler ücretliyse onları ödersin.",

  title: "Neden Moventra?",
  text:
    "Rastgele etkinlikler arasında kaybolmak yerine Moventra önce hobilerine odaklanır. Neyi sevdiğini seçersin, biz de nerede buluşabileceğini gösteririz.",

  citiesLabel: "Test edilen şehir",
  hobbiesLabel: "Hobi türü",
  groupsLabel: "Küçük grup buluşmaları",

  pill1: "Yeni gelenler için ideal",
  pill2: "Yabancılar ve öğrenciler için harika",
  pill3: "Kalabalık yok",

  // SLAYT 2
  page2Title: "Küçük gruplar, gerçek sohbetler",
  page2Text:
    "Moventra, gerçekten sohbet edebileceğin küçük ve samimi buluşmalara odaklanır.",
  page2Bullet1:
    "Gruplar, yeni gelenleri de düşünerek bilinçli olarak küçük tutulur.",
  page2Bullet2:
    "Net etkinlik açıklamaları, seni neyin beklediğini önceden görmeni sağlar.",
  page2Bullet3:
    "Kalabalık ve gürültülü buluşmalardan yorulanlar için ideal bir yapı sunar.",
  page2Tag1: "küçük gruplar",
  page2Tag2: "rahat sohbetler",

  // SLAYT 3
  page3Title: "Önce hobi, sonra etkinlik",
  page3Text:
    "Sonsuz feed’ler yerine Moventra, önce ilgi alanlarından yola çıkarak seni insanlarla buluşturur.",
  page3Bullet1:
    "Etkinliklere rastgele değil, hobilerine göre göz atarsın.",
  page3Bullet2:
    "Yeni şehirlerde, sevdiğin şeyler üzerinden insanlarla tanışırsın.",
  page3Bullet3:
    "Filtreleri kullanarak sadece sana uygun şehir ve hobileri görürsün.",
  page3BottomNote:
    "Önce sevdiğin bir hobiden başla; istersen uzun zamandır ertelediğin bir hobiyi Moventra ile yeniden canlandır.",

  // ⭐ SLAYT 3 – yeni eklenen 3 tag
  page3Tag1: "Algoritma akışı yok",
  page3Tag2: "Takipçi sayısı yok",
  page3Tag3: "Gerçek buluşmalar ön planda",
},

      spotlight: {
        prefix: "Şu anda insanlar en çok şunun için buluşuyor:",
      },
      how: {
        title: "Moventra nasıl çalışır?",
        text:
          "Şehrini seç, hobilerini belirle ve küçük bir gruba katıl. Moventra, sonsuz feed’ler yerine gerçek sohbetlere odaklanmanı kolaylaştırır.",
        step1Title: "Şehrini seç",
        step1Text:
          "Ev şehrini veya seyahat edeceğin yeri ayarla. Önce yakınındaki etkinlikleri gösteririz.",
        step2Title: "Hobilerini seç",
        step2Text:
          "Kutu oyunlarından yürüyüşe, dil değişiminden teknik sohbetlere: gerçekten keyif aldığın şeyleri seç.",
        step3Title: "Küçük gruplara katıl",
        step3Text:
          "Kolayca sohbet edebileceğin ve insanların isimlerini hatırlayabileceğin küçük, samimi gruplarla buluş.",
      },
      explore: {
        title: "Hobilere göre keşfet",
        subtitle:
          "Şu anda insanların Moventra’yı en çok kullandığı hobilerden bazıları.",
        viewAll: "Tüm hobileri gör →",
        cards: {
          boardGames: {
            title: "Kutu oyunları",
            text: "Catan, Codenames, satranç geceleri ve daha fazlası.",
          },
          walkTalk: {
            title: "Yürüyüş & sohbet",
            text: "Şehir yürüyüşleri ve ardından kahve molası.",
          },
          language: {
            title: "Dil değişimi",
            text: "İngilizce, Almanca, Türkçe ve daha fazlasını pratiğe dök.",
          },
          sports: {
            title: "Outdoor & spor",
            text: "Koşu kulüpleri, hiking grupları, bisiklet buluşmaları.",
          },
          tech: {
            title: "Teknoloji & startup",
            text: "Yan projeler, kodlama buluşmaları, çalışma grupları.",
          },
          creative: {
            title: "Yaratıcı hobiler",
            text: "Çizim, fotoğrafçılık ve yaratıcı atölyeler.",
          },
        },
      },
      trust: {
        title: "Gerçek sohbetler için tasarlandı",
        text:
          "Moventra, sadece yeni bir online gruba katılmak değil, gerçekten insanlarla tanışmak isteyenler için. Etkinlikler küçük gruplar, net açıklamalar ve gerçek ilgi alanları etrafında planlanır.",
        bullet1:
          "Ev sahipleri net etkinlik detayları, konum ve grup sayısını paylaşır.",
        bullet2:
          "Ne sıklıkta katılacağına sen karar verirsin – zorunluluk yok, baskı yok.",
        bullet3:
          "Yeni bir şehre taşınırken veya eski hobilerine geri dönerken harika.",
        boxTitle: "Hobilerin üzerinden insanlarla tanışmaya hazır mısın?",
        boxText:
          "Önce şehrindeki etkinliklere göz at veya Moventra ile neler mümkün görmek için tüm hobileri keşfet.",
        browseEvents: "Yakındaki etkinliklere göz at",
        exploreHobbies: "Hobi fikirlerini keşfet",
      },
    },
    profile: {
      loading: "Profilin yükleniyor…",
      error: {
        couldNotLoad: "Profil yüklenemedi.",
      },
      hero: {
        defaultName: "sen",
        title: "Neler yapıyorsun, {name}?",
        subtitle:
          "Buradan yeni etkinlikler planla, grupları keşfet ve Moventra profilini yönet.",
      },
      dashboard: {
        events: {
          title: "Etkinliklerin",
          ctaAll: "Hepsini gör",
          empty: "Henüz planın yok mu? Hemen bir şeyler ayarlayalım!",
          button: "Etkinlik bul",
        },
        groups: {
          title: "Grupların",
          ctaAll: "Hepsini gör",
          text:
            "Aynı tutkuları paylaşan bir gruba katıl ve bağlantı kurmaya başla.",
          button: "Yakındaki grupları keşfet",
        },
        interests: {
          title: "İlgi alanların",
          edit: "Düzenle",
          empty: "Henüz hiç ilgi alanı eklemedin.",
          addButton: "+ İlgi alanı ekle",
        },
      },
      card: {
        title: "Profil & hesap detayları",
        subtitle:
          "Temel bilgilerini Ayarlar bölümünden güncelleyebilirsin. Bunları, etkinlikleri ve önerileri kişiselleştirmek için kullanıyoruz.",
        editInSettingsButton: "Profili Ayarlar’dan düzenle",
      },
      summary: {
        homeCity: "Ev şehri:",
        memberSince: "Üye olduğu tarih",
        plan: "Plan:",
      },
      stats: {
        groups: "Gruplar",
        interests: "İlgi alanları",
        rsvps: "RSVP'ler",
      },
    },
    hobbies: {
      intro:
        "İlgini çeken hobilerle ilgili dünyadaki etkinlikleri görmek için bir hobiye tıkla.",
      list: {
        count: "{count} hobi bulundu",
        empty: "Bu aramada hiç hobi bulunamadı.",
      },
      search: {
        placeholder: "Hobi ara...",
      },
      loading: "Hobiler yükleniyor...",
      error: {
        couldNotLoad: "Hobiler yüklenemedi.",
        generic: "Hobileri yüklerken bir hata oluştu.",
      },
    },
    hobbyNames: {
      "coffeeMeetup": "Kahve buluşması",
      "brunchMeetup": "Brunch buluşması",
      "afterworkDrinks": "İş çıkışı içecek buluşması",
      "newInTownMeetup": "Şehre yeni gelenler buluşması",
      "digitalNomadMeetup": "Dijital göçmen buluşması",
      "remoteWorkersMeetup": "Uzaktan çalışanlar buluşması",
      "internationalStudentsMeetup": "Uluslararası öğrenciler buluşması",
      "erasmusMeetup": "Erasmus buluşması",
      "expatsMeetup": "Yabancılar (expat) buluşması",
      "womenInTechMeetup": "Teknolojide kadınlar buluşması",
      "startupFoundersMeetup": "Startup kurucuları buluşması",
      "soloTravelersMeetup": "Yalnız seyahat edenler buluşması",
      "weekendSocialMixer": "Hafta sonu sosyal buluşma",
      "networkingEvent": "Networking etkinliği",
      "speedNetworking": "Hızlı networking",
      "introvertsFriendlyMeetup": "İçe dönüklere uygun buluşma",
      "smallTalkPractice": "Küçük sohbet pratiği",
      "boardGameChill": "Kutu oyunları & takılma",
      "parkPicnicMeetup": "Park piknik buluşması",
      "cozyCafeHangout": "Sıcacık kafe buluşması",

      "studyGroupGeneral": "Çalışma grubu - Genel",
      "studyGroupMathematics": "Çalışma grubu - Matematik",
      "studyGroupPhysics": "Çalışma grubu - Fizik",
      "studyGroupComputerScience": "Çalışma grubu - Bilgisayar bilimi",
      "studyGroupEngineering": "Çalışma grubu - Mühendislik",
      "studyGroupProgramming": "Çalışma grubu - Programlama",
      "studyGroupDataScience": "Çalışma grubu - Veri bilimi",
      "studyGroupAiMachineLearning": "Çalışma grubu - Yapay zeka & makine öğrenmesi",
      "studyGroupExamPrep": "Çalışma grubu - Sınav hazırlığı",
      "studyGroupUniversityEntrance": "Çalışma grubu - Üniversiteye giriş",
      "deepWorkSession": "Derin çalışma oturumu",
      "silentStudySession": "Sessiz çalışma oturumu",
      "pomodoroStudySession": "Pomodoro çalışma oturumu",
      "libraryStudyHangout": "Kütüphane çalışma buluşması",
      "coWorkingAtCafe": "Kafede ortak çalışma",
      "coWorkingAtLibrary": "Kütüphanede ortak çalışma",
      "onlineCoWorkingSession": "Online ortak çalışma oturumu",
      "thesisWritingSprint": "Tez yazma sprinti",
      "researchPaperReadingClub": "Makale okuma kulübü",
      "journalClub": "Journal club (makale tartışma grubu)",

      "codingMeetup": "Kodlama buluşması",
      "webDevelopmentMeetup": "Web geliştirme buluşması",
      "mobileDevelopmentMeetup": "Mobil geliştirme buluşması",
      "gameDevelopmentMeetup": "Oyun geliştirme buluşması",
      "backendEngineeringMeetup": "Backend mühendisliği buluşması",
      "frontendEngineeringMeetup": "Frontend mühendisliği buluşması",
      "devopsCloudMeetup": "DevOps & bulut buluşması",
      "cybersecurityMeetup": "Siber güvenlik buluşması",
      "aiMachineLearningMeetup": "Yapay zeka & makine öğrenmesi buluşması",
      "dataScienceMeetup": "Veri bilimi buluşması",
      "dataEngineeringMeetup": "Veri mühendisliği buluşması",
      "openSourceContributorsMeetup": "Açık kaynak katkıcıları buluşması",
      "hackathon": "Hackathon",
      "competitiveProgrammingPractice": "Rekabetçi programlama pratiği",
      "leetCodeNight": "LeetCode gecesi",
      "techTalksLightningTalks": "Teknik konuşmalar & lightning talks",
      "productManagementMeetup": "Ürün yönetimi buluşması",
      "uiUxDesignMeetup": "UI/UX tasarım buluşması",
      "noCodeLowCodeMeetup": "No-code / low-code buluşması",
      "makersHardwareHacking": "Maker & donanım hackleme",

      "boardGames": "Kutu oyunları",
      "strategyBoardGames": "Strateji kutu oyunları",
      "partyBoardGames": "Parti kutu oyunları",
      "chessClub": "Satranç kulübü",
      "goBadukClub": "Go / Baduk kulübü",
      "cardGamesNight": "Kart oyunları gecesi",
      "tabletopRpgSession": "Masaüstü RPG oturumu",
      "dungeonsDragonsNight": "Dungeons & Dragons gecesi",
      "tradingCardGames": "Koleksiyon kart oyunları",
      "esports": "Espor",
      "casualGaming": "Normal (casual) oyun buluşması",
      "lanParty": "LAN partisi",
      "retroGamingNight": "Retro oyun gecesi",
      "mobileGamesMeetup": "Mobil oyunlar buluşması",
      "puzzleBrainGames": "Bulmaca & zeka oyunları",
      "boardGameDesign": "Kutu oyunu tasarımı",
      "murderMysteryNight": "Katil kim / gizem gecesi",
      "triviaNight": "Bilgi yarışması gecesi",
      "quizNight": "Quiz gecesi",
      "casinoNightJustForFun": "Casino gecesi (sadece eğlence için)",

      "running": "Koşu",
      "cycling": "Bisiklet",
      "roadCycling": "Yol bisikleti",
      "mountainBiking": "Dağ bisikleti",
      "gymFitness": "Spor salonu & fitness",
      "calisthenics": "Kalisthenik (vücut ağırlığı egzersizleri)",
      "crossfit": "CrossFit",
      "football": "Futbol",
      "basketball": "Basketbol",
      "volleyball": "Voleybol",
      "beachVolleyball": "Plaj voleybolu",
      "tennis": "Tenis",
      "tableTennis": "Masa tenisi",
      "badminton": "Badminton",
      "hiking": "Doğa yürüyüşü (hiking)",
      "trailRunning": "Patika koşusu",
      "climbing": "Tırmanış",
      "bouldering": "Bouldering (ipssiz kısa duvar tırmanışı)",
      "swimming": "Yüzme",
      "openWaterSwimming": "Açık su yüzme",
      "yoga": "Yoga",
      "pilates": "Pilates",
      "functionalTraining": "Fonksiyonel antrenman",
      "parkWorkout": "Parkta egzersiz",
      "morningRunClub": "Sabah koşu kulübü",
      "eveningWalkClub": "Akşam yürüyüş kulübü",
      "stretchingMobility": "Esneme & mobilite",
      "urbanCyclingTour": "Şehir içi bisiklet turu",
      "skateboarding": "Kaykay",
      "rollerSkating": "Paten",
      "skiingSnowboarding": "Kayak & snowboard",

      "dancingSalsa": "Dans - Salsa",
      "dancingBachata": "Dans - Bachata",
      "dancingKizomba": "Dans - Kizomba",
      "dancingTango": "Dans - Tango",
      "dancingHipHop": "Dans - Hip Hop",
      "dancingKPop": "Dans - K-Pop",
      "zumba": "Zumba",
      "contemporaryDance": "Modern dans",
      "socialDanceNight": "Sosyal dans gecesi",
      "dancePracticeSession": "Dans pratik oturumu",

      "painting": "Resim",
      "watercolorPainting": "Sulu boya resim",
      "acrylicPainting": "Akrilik resim",
      "drawing": "Çizim",
      "sketchingInTheCity": "Şehirde eskiz yapma",
      "digitalArt": "Dijital sanat",
      "graphicDesignJam": "Grafik tasarım jam",
      "calligraphy": "Kaligrafi",
      "photography": "Fotoğrafçılık",
      "streetPhotographyWalk": "Sokak fotoğrafçılığı yürüyüşü",
      "portraitPhotography": "Portre fotoğrafçılığı",
      "filmPhotography": "Analog fotoğrafçılık",
      "videography": "Video çekimi (videografi)",
      "contentCreationMeetup": "İçerik üretimi buluşması",
      "youTubeCreatorsMeetup": "YouTube içerik üreticileri buluşması",
      "podcastingMeetup": "Podcast buluşması",
      "3dPrintingMakerLab": "3B baskı & maker atölyesi",
      "arduinoElectronicsWorkshop": "Arduino & elektronik atölyesi",
      "roboticsMeetup": "Robotik buluşması",
      "craftsDiy": "El işleri & DIY (kendin yap)",
      "knittingCrochet": "Örgü & tığ işi",
      "embroidery": "Nakış",
      "handmadeJewelryWorkshop": "El yapımı takı atölyesi",
      "potteryCeramics": "Seramik & çömlek",
      "origami": "Origami",
      "modelBuilding": "Model yapımı",

      "jamSession": "Jam session (serbest müzik)",
      "guitarCircle": "Gitar buluşması",
      "pianoLoversMeetup": "Piyano severler buluşması",
      "singingCircle": "Şarkı söyleme buluşması",
      "choirPractice": "Koro provası",
      "openMicNight": "Open mic gecesi",
      "karaokeNight": "Karaoke gecesi",
      "songwritingCircle": "Şarkı yazma buluşması",
      "djElectronicMusicMeetup": "DJ & elektronik müzik buluşması",
      "musicProductionMeetup": "Müzik prodüksiyonu buluşması",
      "liveConcertBuddyGroup": "Konser arkadaş grubu",
      "streetMusicJam": "Sokak müziği jam",
      "classicalMusicAppreciation": "Klasik müzik dinleme & sohbet",
      "jazzListeningSession": "Caz dinleme oturumu",
      "bandPracticeSession": "Grup (band) prova oturumu",

      "languageExchangeEnglish": "Dil değişimi - İngilizce",
      "languageExchangeGerman": "Dil değişimi - Almanca",
      "languageExchangeTurkish": "Dil değişimi - Türkçe",
      "languageExchangeSpanish": "Dil değişimi - İspanyolca",
      "languageExchangeItalian": "Dil değişimi - İtalyanca",
      "languageExchangeFrench": "Dil değişimi - Fransızca",
      "languageExchangeMixed": "Dil değişimi - Karışık diller",
      "coffeeLanguageExchange": "Kahve & dil değişimi",
      "conversationPracticeBeginner": "Konuşma pratiği - Başlangıç",
      "conversationPracticeIntermediate": "Konuşma pratiği - Orta seviye",
      "conversationPracticeAdvanced": "Konuşma pratiği - İleri seviye",

      "bookClub": "Kitap kulübü",
      "nonFictionBookClub": "Kurgu dışı (non-fiction) kitap kulübü",
      "fictionBookClub": "Kurgu (roman) kitap kulübü",
      "philosophyReadingGroup": "Felsefe okuma grubu",
      "cultureExchangeNight": "Kültür paylaşımı gecesi",
      "travelStoriesNight": "Seyahat hikayeleri gecesi",
      "movieNight": "Film gecesi",
      "documentaryNight": "Belgesel gecesi",
      "animeMangaMeetup": "Anime & manga buluşması",

      "cookingClass": "Yemek kursu",
      "baking": "Fırın & hamur işleri",
      "dessertWorkshop": "Tatlı atölyesi",
      "baristaCoffeeWorkshop": "Barista & kahve atölyesi",
      "teaTasting": "Çay tadımı",
      "wineTasting": "Şarap tadımı",
      "beerTasting": "Bira tadımı",
      "craftBeerMeetup": "Craft bira buluşması",
      "veganCookingWorkshop": "Vegan yemek atölyesi",
      "streetFoodTour": "Sokak lezzetleri turu",
      "restaurantDiscoveryGroup": "Restoran keşif grubu",
      "internationalCuisineNight": "Dünya mutfakları gecesi",
      "potluckDinner": "Herkes bir şey getirsin yemeği (potluck)",
      "picnicSnacksMeetup": "Piknik & atıştırmalık buluşması",
      "foodPhotographyWalk": "Yemek fotoğrafçılığı yürüyüşü",

      "meditation": "Meditasyon",
      "mindfulnessPractice": "Mindfulness pratiği",
      "breathworkSession": "Nefes çalışması",
      "soundHealing": "Ses terapisi / sound healing",
      "yogaMeditation": "Yoga & meditasyon",
      "morningRoutineClub": "Sabah rutin kulübü",
      "gratitudeJournalCircle": "Şükran günlüğü buluşması",
      "mentalHealthSupportCircle": "Ruh sağlığı destek grubu",
      "stressReliefWalk": "Stres atma yürüyüşü",
      "natureWalkMindfulness": "Doğa yürüyüşü & mindfulness",
      "digitalDetoxMeetup": "Dijital detoks buluşması",
      "journalingMeetup": "Günlük tutma (journaling) buluşması",
      "goalSettingSession": "Hedef belirleme oturumu",
      "accountabilityGroup": "Birbirini motive etme grubu",
      "lifeDesignWorkshop": "Hayat tasarımı atölyesi",

      "volunteeringCharity": "Gönüllülük & yardım etkinlikleri",
      "beachCleanup": "Sahil temizliği",
      "parkCleanup": "Park temizliği",
      "animalShelterVolunteering": "Hayvan barınağı gönüllülüğü",
      "communityGardenMeetup": "Topluluk bahçesi buluşması",
      "charityRunWalk": "Yardım koşusu / yürüyüşü",
      "fundraisingEvents": "Bağış toplama etkinlikleri",
      "teachingKidsCoding": "Çocuklara kodlama öğretme",
      "mentoringStudents": "Öğrencilere mentorluk",
      "localCommunityProjects": "Yerel topluluk projeleri",
      "neighborhoodMeetGreet": "Mahalle tanışma buluşması",
      "refugeeSupportVolunteers": "Mülteci destek gönüllüleri",
      "recyclingSustainabilityMeetup": "Geri dönüşüm & sürdürülebilirlik buluşması",
      "climateActionMeetup": "İklim aksiyonu buluşması",
      "socialImpactProjects": "Sosyal etki projeleri",

      "cityWalkingTour": "Şehir yürüyüş turu",
      "hiddenSpotsInTheCity": "Şehirde gizli noktalar turu",
      "museumGalleryVisit": "Müze & galeri ziyareti",
      "historicalSitesTour": "Tarihi yerler turu",
      "weekendTripPlanning": "Hafta sonu gezi planlama",
      "backpackingMeetup": "Backpacking buluşması",
      "soloTravelPlanning": "Yalnız seyahat planlama",
      "travelPhotoWalk": "Seyahat fotoğraf yürüyüşü",
      "trainTripMeetup": "Tren yolculuğu buluşması",
      "natureDayTrip": "Doğa günü gezisi",

      "onlineStudyGroup": "Online çalışma grubu",
      "onlineCodingSession": "Online kodlama oturumu",
      "onlineLanguageExchange": "Online dil değişimi",
      "onlineGameNight": "Online oyun gecesi",
      "onlineMovieNight": "Online film gecesi",
      "remoteBookClub": "Online kitap kulübü",
      "virtualCoworking": "Sanal ortak çalışma",
      "virtualCoffeeChat": "Sanal kahve sohbeti",
      "onlineNetworkingEvent": "Online networking etkinliği",
      "remoteTeamBuilding": "Uzaktan ekip kaynaştırma etkinliği",
    },
    settings: {
      pageTitle: "Ayarlar",
      sidebar: {
        profile: "Profili düzenle",
        account: "Hesap yönetimi",
        email: "E-posta güncellemeleri",
        privacy: "Gizlilik",
        social: "Sosyal medya",
        interests: "İlgi alanları",
        payments: "Ödeme yöntemleri",
        badgeSoon: "yakında",
      },
      profile: {
        title: "Profili düzenle",
        subtitle:
          "Temel bilgilerini güncelle. Bunları etkinlikleri ve önerileri kişiselleştirmek için kullanıyoruz.",
        nameLabel: "İsim",
        namePlaceholder: "İsmin",
        locationLabel: "Konumun",
        locationPlaceholder: "Şehir seç",
        locationButton: "Adresi düzenle",
        locationHelper: "Yakındaki etkinlikleri göstermek için bunu kullanacağız.",
        birthdateLabel: "Doğum tarihi",
        birthdateDay: "Gün",
        birthdateMonth: "Ay",
        birthdateYear: "Yıl",
        birthdateHelper:
          "Doğum gününü asla tam olarak herkese açık göstermeyeceğiz. Sadece yaşa uygun öneriler için kullanılır.",
        genderLabel: "Cinsiyet",
        genderPlaceholder: "Belirtmek istemiyorum",
        genderOptions: {
          female: "Kadın",
          male: "Erkek",
          nonBinary: "Non-binary",
          preferNot: "Belirtmek istemiyorum",
        },
        bioLabel: "Hakkında",
        bioPlaceholder: "Kendin hakkında kısaca bir şeyler yaz",
        toggles: {
          showGroupsLabel: "Meetup tarzı grupları göster",
          showGroupsDescription:
            "Profilinde, insanların üyesi olduğun tüm grupları görmesine izin ver.",
          showInterestsLabel: "İlgi alanlarını göster",
          showInterestsDescription:
            "Profilinde, insanların ilgi alanı listenini görmesine izin ver.",
        },
        saveButton: "Değişiklikleri kaydet",
        savingButton: "Kaydediliyor…",
        saveSuccess: "Profil güncellendi.",
        saveError: "Profil kaydedilemedi.",
        loadingProfile: "Profil yükleniyor…",
      },
      account: {
        title: "Hesap yönetimi",
        emailLabel: "E-posta adresin",
        languageLabel: "Dil",
        languageHelper:
          "Bu cihazda Moventra arayüzünün kullanılacağı dili değiştirir.",
        timeZoneLabel: "Birincil saat dilimi",
        timeZoneHelper:
          "Seçimin, etkinlik saatlerinin nasıl gösterileceğini etkiler. Saat diliminin konumuna göre belirlenmesini istiyorsan \"Sistem saati (varsayılan)\" seçeneğini kullan.",
        timeZoneOptions: {
          system: "Sistem saati (varsayılan) – cihaz saat dilimini kullan",
          cet: "Orta Avrupa Saati (CET)",
          gmt: "Greenwich Ortalama Saati (GMT)",
        },
        changePassword: {
          title: "Şifreni değiştir",
          helper:
            "Şifreni değiştirdiğinde, diğer oturumlarından otomatik olarak çıkış yapılır.",
          openButton: "Şifre değiştir",
          cancelButton: "İptal",
          currentPlaceholder: "Mevcut şifre",
          newPlaceholder: "Yeni şifre",
          confirmPlaceholder: "Yeni şifreyi tekrar yaz",
          errorFillAll: "Lütfen tüm alanları doldur.",
          errorMismatch: "Yeni şifreler birbiriyle eşleşmiyor.",
          errorTooShort: "Yeni şifre en az 8 karakter olmalı.",
          genericError: "Şifre değiştirilemedi.",
          success: "Şifren güncellendi.",
          submitButton: "Yeni şifreyi kaydet",
          submittingButton: "Güncelleniyor…",
        },
        deactivate: {
          title: "Hesabını devre dışı bırak",
          helper:
            "Moventra’dan ayrılmaya karar verirsen, geri dönmek için yeni bir hesap oluşturman gerekir.",
          confirmMessage:
            "Moventra hesabını devre dışı bırakmak istediğine emin misin? Bu işlem seni çıkış yaptırır ve bu hesabı tekrar kullanamazsın.",
          button: "Hesabı devre dışı bırak",
          buttonLoading: "Devre dışı bırakılıyor…",
          statusSuccess: "Hesabın devre dışı bırakıldı.",
          statusError: "Hesap devre dışı bırakılamadı. Lütfen tekrar dene.",
        },
        gdpr: {
          title: "Veri & GDPR talepleri",
          helper:
            "GDPR kapsamında veri taşınabilirliği ve silme taleplerini buradan iletebilirsin.",
          typeLabel: "Talep türü",
          typeOptions: {
            access: "Kişisel verilerime erişim / dışa aktarma",
            erasure: "Kişisel verilerimi sil / yok et",
            other: "Diğer GDPR talebi",
          },
          detailsLabel: "Detaylar (isteğe bağlı)",
          detailsPlaceholder:
            "Talebinin daha hızlı işlenmesine yardımcı olabilecek detayları ekleyebilirsin.",
          submitButton: "GDPR talebini gönder",
          submittingButton: "Gönderiliyor…",
          statusSuccess:
            "Talebin bize ulaştı. Seninle e-posta üzerinden iletişime geçeceğiz.",
          statusError: "GDPR talebi gönderilemedi.",
        },
      },
      email: {
        title: "E-posta güncellemeleri",
        intro:
          "Hangi e-posta güncellemelerini almak istediğini seç. Bazı anlık bildirimler açıksa, aynı bilgiyi e-posta ile göndermemize gerek kalmaz.",
        sections: {
          updatesTitle: "Moventra bildirimleri",
          updatesHelper:
            "Moventra’dan hangi tür e-posta bildirimleri alacağını kontrol et.",
          turnOffTitle: "Tüm e-posta güncellemelerini kapat",
          turnOffHelper:
            "E-posta güncellemelerini göndermeyi bırakacağız. Yine de yasal duyurular ve işlem bildirimleri gibi bazı e-postaları alabilirsin.",
          turnOffButton: "Kapat",
        },
        rows: {
          messagesTitle: "Mesajlar",
          messagesDescription:
            "Biri bana mesaj gönderdiğinde e-posta al.",
          repliesTitle: "Yorumlara gelen yanıtlar",
          repliesDescription:
            "Biri yorumlarıma yanıt yazdığında e-posta al.",
          suggestedTitle: "Önerilen etkinlikler",
          suggestedDescription:
            "Gruplarına ve ilgi alanlarına göre haftalık öne çıkanlar.",
          newGroupsTitle: "Yeni Moventra grupları",
          newGroupsDescription:
            "İlgi alanlarıma uyan yeni gruplardan haberdar et.",
          updatesHQTitle: "Moventra merkezden güncellemeler",
          updatesHQDescription:
            "Yeni özellikler ve önemli Moventra haberleri hakkında bilgi ver.",
          surveysTitle: "Moventra anketleri",
          surveysDescription:
            "Moventra’yı daha iyi hale getirebilecek şeyler hakkında bana sorular gönder.",
          icalTitle: "iCal ekleri",
          icalDescription:
            "Takvim eki içeren e-posta hatırlatıcıları gönder.",
          proNetworkTitle: "Pro ağlarından güncellemeler",
          proNetworkDescription:
            "Pro gruplarımdan güncellemeler al.",
          connectionsTitle: "Bağlantılar",
          connectionsDescription:
            "Moventra’da yeni bağlantılar hakkında beni bilgilendir.",
        },
      },
      privacy: {
        title: "Gizlilik",
        intro:
          "Sana kimin ulaşabileceğini ve profilinde başkalarının neleri görebileceğini kontrol et.",
        contactsTitle: "Kişiler",
        contactsHelper:
          "Moventra’da sana kimler mesaj gönderebilir? İstediğin zaman değiştirebilirsin.",
        contactsOptions: {
          organizers: "Sadece organizatörler",
          groups: "Sadece üyesi olduğum grupların üyeleri",
          anyone: "Moventra’daki herkes",
        },
        publicProfileTitle: "Herkese açık profil",
        publicProfileHelper:
          "Herkese açık profilinde başkalarının neleri görebileceğini kontrol et.",
        editProfileButton: "Profili düzenle",
      },
      comingSoon: {
        title: "Yakında",
        text: "Bu ayarlar bölümü ileride bir güncelleme ile açılacak.",
      },
    },
 cityPicker: {
      title: "Şehir Seç",
      countryPlaceholder: "Ülke seç",
      statePlaceholder: "Şehir / bölge seç",
      selectCountryFirst: "Önce ülke seç",
      loadingStates: "Şehirler yükleniyor...",
      showEventsButton: "Bu konumdaki etkinlikleri göster",

      // Eski key’ler – istersen kalsın
      statePlaceholderNoCountry: "Önce ülke seç",
      statePlaceholderLoading: "Yükleniyor...",
      statePlaceholderReady: "Şehir / bölge seç",
      buttonLabel: "Bu konumdaki etkinlikleri göster",
    },
  },

  de: {
    common: {
      brandName: "Moventra",
    },
    nav: {
      events: "Events",
      hobbies: "Alle Hobbys",
      nearbyTitle: "Events in deiner Nähe",
      nearbySubtitle:
        "Wir informieren dich, wenn neue Events in deiner Nähe erscheinen.",
      nearbyChecking: "Deine Stadt wird geprüft…",
      nearbyNoneWithCity:
        "Keine neuen Events in der Nähe von {city} in dieser Woche.",
      nearbyNoneNoCity:
        "Füge deine Stadt in deinem Profil hinzu, um Benachrichtigungen zu erhalten.",
      signedInAs: "Angemeldet als",
      yourEvents: "Deine Events",
      yourGroups: "Deine Gruppen",
      viewProfile: "Profil ansehen",
      settings: "Einstellungen",
      darkMode: "Dunkles Design",
      lightMode: "Helles Design",
      logout: "Abmelden",
      messagesAria: "Nachrichten (bald verfügbar)",
      notificationsAria: "Benachrichtigungen",
      taglines: [
        "neue Freunde in jeder Stadt finden",
        "Menschen über deine Hobbys treffen",
        "kleine, interessenbasierte Treffen entdecken",
        "bewegen, reisen, Menschen treffen",
      ],
    },
    footer: {
      ctaTitle: "Veranstaltest du Events?",
      ctaText:
        "Lass Moventra dir helfen, deine kleinen Gruppentreffen mit Menschen zu füllen, die die gleichen Hobbys teilen. Erstelle ein Event in wenigen Klicks.",
      ctaButton: "Event erstellen",
      ctaNote:
        "Keine Tools für riesige Massen – Fokus auf kleine, hobbybasierte Gruppen.",
      miniStats: {
        cities: "Städte",
        hobbies: "Hobbys",
        events: "Events diese Woche",
        currentlyExploring: "Aktuell erkundete Stadt:",
        changeCity: "Stadt ändern",
      },
      brandText:
        "Lerne Menschen über deine Hobbys kennen – in jeder Stadt. Kleine Gruppen, freundliche Events, weniger awkward.",
      brandSubText:
        "Mit Liebe für kleine, reale Communities gebaut – nicht für laute, anonyme Massen.",
      discoverTitle: "Entdecken",
      discoverItems: {
        nearYou: "Events in deiner Nähe",
        popular: "Beliebte Hobbys",
        remote: "Online-Treffen",
      },
      organizersTitle: "Für Veranstalter",
      organizersItems: {
        howItWorks: "So funktioniert es",
        hostGuidelines: "Richtlinien für Hosts",
        safetyTips: "Sicherheitstipps",
      },
      organizersNote:
        "Moventra ist rund um kleine, sichere, freundliche Gruppen und klare Community-Standards aufgebaut.",
      connectTitle: "Kontakt",
      connectNote:
        "App-Links und Social-Profile werden später hier stehen. iOS- und Android-Apps sind geplant.",
      newsletterPlaceholder: "Deine E-Mail (bald verfügbar)",
      newsletterButton: "Updates erhalten",
      bottom: {
        rights: "Alle Rechte vorbehalten.",
        builtWithLove:
          "Mit ❤️ für hobbybasierte Communities gebaut.",
        terms: "AGB",
        privacy: "Datenschutz",
        cookies: "Cookies",
        languageLabel: "Sprache",
      },
    },
    home: {
      hero: {
        welcome: "Willkommen bei Moventra",
        titleLine1: "Lerne Menschen kennen",
        titleLine2: "über deine Hobbys.",
        description:
          "Entdecke lokale und globale Events basierend auf dem, was du liebst: Brettspiele, Sport, Workshops, Sprachaustausch und mehr. Schließe dich kleinen, freundlichen Gruppen an statt zufälligen Großveranstaltungen.",
        browseEvents: "Events durchsuchen",
        seeHobbies: "Alle Hobbys ansehen",
        smallNote:
          "Kein Spam, keine riesigen Menschenmengen. Nur kleine, interessenbasierte Treffen.",
      },
home: {
why: {
  freeNote:
    "Moventra ist in der Nutzung kostenlos – du zahlst nur, wenn ein bestimmtes Event kostenpflichtig ist.",

  title: "Warum Moventra?",
  text:
    "Anstatt durch zufällige Events zu scrollen, fokussiert sich Moventra zuerst auf deine Hobbys. Du wählst, was du magst, wir zeigen dir, wo du Leute treffen kannst.",

  citiesLabel: "Getestete Städte",
  hobbiesLabel: "Hobby-Typen",
  groupsLabel: "Kleine Gruppentreffen",

  pill1: "Ideal für Neuzugezogene",
  pill2: "Perfekt für Expats & Studierende",
  pill3: "Keine großen Menschenmengen",

  // SLIDE 2
  page2Title: "Kleine Gruppen, echte Gespräche",
  page2Text:
    "Moventra legt den Fokus auf kleine, freundliche Treffen, in denen man wirklich reden kann.",
  page2Bullet1:
    "Gruppen bleiben bewusst klein und einladend.",
  page2Bullet2:
    "Klare Eventbeschreibungen machen Erwartungen von Anfang an transparent.",
  page2Bullet3:
    "Ideal, wenn große, laute Meetups dich schnell erschöpfen.",
  page2Tag1: "kleine Gruppen",
  page2Tag2: "leichte Gespräche",

  // SLIDE 3
  page3Title: "Für hobby-first discovery gebaut",
  page3Text:
    "Statt endloser Feeds hilft dir Moventra, Menschen über das zu treffen, was dir ohnehin Spaß macht.",
  page3Bullet1:
    "Stöbere nach Events basierend auf deinen Hobbys, nicht auf zufälligen Kategorien.",
  page3Bullet2:
    "Lass dich von Beispiel-Hobbys für neue Treffen inspirieren.",
  page3Bullet3:
    "Filtere nach Stadt, damit du nur relevante Events siehst.",
  page3BottomNote:
    "Starte mit einem Hobby, das du bereits magst – oder reaktiviere eines, das du lange nicht gemacht hast.",

  // ⭐ SLIDE 3 – yeni üç tag
  page3Tag1: "Kein Algorithmus-Feed",
  page3Tag2: "Keine Follower-Zahlen",
  page3Tag3: "Fokus auf echte Treffen",
},

}
,
      spotlight: {
        prefix: "Gerade jetzt treffen sich Menschen vor allem für",
      },
      how: {
        title: "Wie Moventra funktioniert",
        text:
          "Wähle deine Stadt, suche dir ein Hobby aus und schließe dich einer kleinen Gruppe an. Moventra bleibt simpel, damit du dich auf echte Gespräche konzentrieren kannst – nicht auf endlose Feeds.",
        step1Title: "Wähle deine Stadt",
        step1Text:
          "Lege deinen Wohnort oder dein Reiseziel fest. Wir zeigen dir zuerst die Events in deiner Nähe.",
        step2Title: "Wähle deine Hobbys",
        step2Text:
          "Von Brettspielen über Wandern bis hin zu Sprachaustausch oder Tech-Talks: Wähle, was dir wirklich Spaß macht.",
        step3Title: "Schließe dich kleinen Gruppen an",
        step3Text:
          "Triff dich mit kleinen, freundlichen Gruppen, in denen man leicht ins Gespräch kommt und sich Namen merkt.",
      },
      explore: {
        title: "Nach Hobby entdecken",
        subtitle:
          "Einige der beliebtesten Arten, wie Menschen Moventra derzeit nutzen.",
        viewAll: "Alle Hobbys ansehen →",
        cards: {
          boardGames: {
            title: "Brettspiele",
            text: "Catan, Codenames, Schachabende & mehr.",
          },
          walkTalk: {
            title: "Spaziergang & Gespräch",
            text: "Stadtspaziergänge und Kaffee danach.",
          },
          language: {
            title: "Sprachaustausch",
            text: "Englisch, Deutsch, Türkisch und mehr üben.",
          },
          sports: {
            title: "Outdoor & Sport",
            text: "Laufgruppen, Wanderungen, Fahrradtreffen.",
          },
          tech: {
            title: "Tech & Start-up",
            text: "Side-Projects, Coding-Treffen, Lerngruppen.",
          },
          creative: {
            title: "Kreative Hobbys",
            text: "Zeichnen, Fotografie und kreative Workshops.",
          },
        },
      },
      trust: {
        title: "Für echte Gespräche gebaut",
        text:
          "Moventra ist für Menschen, die wirklich Leute treffen wollen – nicht nur einer weiteren Online-Gruppe beitreten. Events sind um kleine Gruppen, klare Beschreibungen und echte Interessen herum gestaltet.",
        bullet1:
          "Hosts teilen klare Eventdetails, Locations und Gruppengrößen.",
        bullet2:
          "Du entscheidest, wie oft du teilnimmst – keine Verpflichtung, kein Druck.",
        bullet3:
          "Perfekt, wenn du in eine neue Stadt ziehst oder alte Hobbys wiederbeleben willst.",
        boxTitle:
          "Bereit, Menschen über deine Hobbys kennenzulernen?",
        boxText:
          "Beginne damit, Events in deiner Stadt zu durchsuchen oder entdecke alle Hobbys, um zu sehen, was mit Moventra möglich ist.",
        browseEvents: "Events in der Nähe durchsuchen",
        exploreHobbies: "Hobby-Ideen entdecken",
      },
    },
    profile: {
      loading: "Dein Profil wird geladen…",
      error: {
        couldNotLoad: "Profil konnte nicht geladen werden.",
      },
      hero: {
        defaultName: "du",
        title: "Was machst du gerade, {name}?",
        subtitle:
          "Plane neue Events, entdecke Gruppen und verwalte dein Moventra-Profil von hier aus.",
      },
      dashboard: {
        events: {
          title: "Deine Events",
          ctaAll: "Alle ansehen",
          empty:
            "Noch keine Pläne? Lass uns das ändern!",
          button: "Events finden",
        },
        groups: {
          title: "Deine Gruppen",
          ctaAll: "Alle ansehen",
          text:
            "Tritt einer Gruppe bei, die deine Interessen teilt – und knüpfe neue Kontakte.",
          button: "Gruppen in deiner Nähe entdecken",
        },
        interests: {
          title: "Deine Interessen",
          edit: "Bearbeiten",
          empty: "Du hast noch keine Interessen hinzugefügt.",
          addButton: "+ Interessen hinzufügen",
        },
      },
      card: {
        title: "Profil- & Kontodetails",
        subtitle:
          "Aktualisiere deine Basisdaten in den Einstellungen. Wir nutzen sie, um Events und Empfehlungen für dich zu personalisieren.",
        editInSettingsButton: "Profil in den Einstellungen bearbeiten",
      },
      summary: {
        homeCity: "Heimatstadt:",
        memberSince: "Mitglied seit",
        plan: "Plan:",
      },
      stats: {
        groups: "Gruppen",
        interests: "Interessen",
        rsvps: "RSVPs",
      },
    },
    hobbies: {
      intro:
        "Klicke auf ein Hobby, um Events weltweit zu diesem Interesse zu sehen.",
      list: {
        count: "{count} Hobby gefunden",
        empty: "Keine Hobbys für diese Suche gefunden.",
      },
      search: {
        placeholder: "Hobbys suchen...",
      },
      loading: "Hobbys werden geladen...",
      error: {
        couldNotLoad: "Hobbys konnten nicht geladen werden.",
        generic:
          "Beim Laden der Hobbys ist ein Fehler aufgetreten.",
      },
    },
    hobbyNames: {
      "coffeeMeetup": "Kaffee-Treffen",
      "brunchMeetup": "Brunch-Treffen",
      "afterworkDrinks": "Afterwork-Drinks",
      "newInTownMeetup": "Neu-in-der-Stadt-Treffen",
      "digitalNomadMeetup": "Digital-Nomads-Treffen",
      "remoteWorkersMeetup": "Remote-Worker-Treffen",
      "internationalStudentsMeetup": "Treffen für internationale Studierende",
      "erasmusMeetup": "Erasmus-Treffen",
      "expatsMeetup": "Expats-Treffen",
      "womenInTechMeetup": "Women-in-Tech-Treffen",
      "startupFoundersMeetup": "Startup-Gründer:innen-Treffen",
      "soloTravelersMeetup": "Solo-Reisende-Treffen",
      "weekendSocialMixer": "Social-Mixer am Wochenende",
      "networkingEvent": "Networking-Event",
      "speedNetworking": "Speed-Networking",
      "introvertsFriendlyMeetup": "Introvert:innen-freundliches Treffen",
      "smallTalkPractice": "Small-Talk-Training",
      "boardGameChill": "Brettspiele & Chillen",
      "parkPicnicMeetup": "Picknick im Park",
      "cozyCafeHangout": "Gemütliches Café-Treffen",

      "studyGroupGeneral": "Lerngruppe - Allgemein",
      "studyGroupMathematics": "Lerngruppe - Mathematik",
      "studyGroupPhysics": "Lerngruppe - Physik",
      "studyGroupComputerScience": "Lerngruppe - Informatik",
      "studyGroupEngineering": "Lerngruppe - Ingenieurwesen",
      "studyGroupProgramming": "Lerngruppe - Programmierung",
      "studyGroupDataScience": "Lerngruppe - Data Science",
      "studyGroupAiMachineLearning": "Lerngruppe - KI & Machine Learning",
      "studyGroupExamPrep": "Lerngruppe - Klausurvorbereitung",
      "studyGroupUniversityEntrance": "Lerngruppe - Studienvorbereitung",
      "deepWorkSession": "Deep-Work-Session",
      "silentStudySession": "Stille Lernsitzung",
      "pomodoroStudySession": "Pomodoro-Lernsitzung",
      "libraryStudyHangout": "Lernen in der Bibliothek",
      "coWorkingAtCafe": "Coworking im Café",
      "coWorkingAtLibrary": "Coworking in der Bibliothek",
      "onlineCoWorkingSession": "Online-Coworking-Session",
      "thesisWritingSprint": "Thesis-Writing-Sprint",
      "researchPaperReadingClub": "Paper-Reading-Club",
      "journalClub": "Journal Club",

      "codingMeetup": "Coding-Meetup",
      "webDevelopmentMeetup": "Webentwicklung-Meetup",
      "mobileDevelopmentMeetup": "Mobile-Entwicklung-Meetup",
      "gameDevelopmentMeetup": "Game-Development-Meetup",
      "backendEngineeringMeetup": "Backend-Engineering-Meetup",
      "frontendEngineeringMeetup": "Frontend-Engineering-Meetup",
      "devopsCloudMeetup": "DevOps & Cloud-Meetup",
      "cybersecurityMeetup": "Cybersecurity-Meetup",
      "aiMachineLearningMeetup": "KI & Machine-Learning-Meetup",
      "dataScienceMeetup": "Data-Science-Meetup",
      "dataEngineeringMeetup": "Data-Engineering-Meetup",
      "openSourceContributorsMeetup": "Open-Source-Contributors-Meetup",
      "hackathon": "Hackathon",
      "competitiveProgrammingPractice": "Competitive-Programming-Training",
      "leetCodeNight": "LeetCode-Nacht",
      "techTalksLightningTalks": "Tech-Talks & Lightning-Talks",
      "productManagementMeetup": "Product-Management-Meetup",
      "uiUxDesignMeetup": "UI/UX-Design-Meetup",
      "noCodeLowCodeMeetup": "No-Code / Low-Code-Meetup",
      "makersHardwareHacking": "Makers & Hardware-Hacking",

      "boardGames": "Brettspiele",
      "strategyBoardGames": "Strategie-Brettspiele",
      "partyBoardGames": "Party-Brettspiele",
      "chessClub": "Schachclub",
      "goBadukClub": "Go / Baduk-Club",
      "cardGamesNight": "Kartenabend",
      "tabletopRpgSession": "Tabletop-RPG-Session",
      "dungeonsDragonsNight": "Dungeons-&-Dragons-Abend",
      "tradingCardGames": "Trading-Card-Games",
      "esports": "E-Sports",
      "casualGaming": "Casual-Gaming-Treffen",
      "lanParty": "LAN-Party",
      "retroGamingNight": "Retro-Gaming-Abend",
      "mobileGamesMeetup": "Mobile-Games-Meetup",
      "puzzleBrainGames": "Puzzle- & Denkspiele",
      "boardGameDesign": "Brettspiel-Design",
      "murderMysteryNight": "Murder-Mystery-Abend",
      "triviaNight": "Trivia-Abend",
      "quizNight": "Quiz-Abend",
      "casinoNightJustForFun": "Casino-Abend (nur zum Spaß)",

      "running": "Laufen",
      "cycling": "Radfahren",
      "roadCycling": "Rennradfahren",
      "mountainBiking": "Mountainbiken",
      "gymFitness": "Fitnessstudio & Training",
      "calisthenics": "Calisthenics",
      "crossfit": "CrossFit",
      "football": "Fußball",
      "basketball": "Basketball",
      "volleyball": "Volleyball",
      "beachVolleyball": "Beachvolleyball",
      "tennis": "Tennis",
      "tableTennis": "Tischtennis",
      "badminton": "Badminton",
      "hiking": "Wandern",
      "trailRunning": "Trailrunning",
      "climbing": "Klettern",
      "bouldering": "Bouldern",
      "swimming": "Schwimmen",
      "openWaterSwimming": "Freiwasserschwimmen",
      "yoga": "Yoga",
      "pilates": "Pilates",
      "functionalTraining": "Funktionelles Training",
      "parkWorkout": "Workout im Park",
      "morningRunClub": "Morning-Run-Club",
      "eveningWalkClub": "Evening-Walk-Club",
      "stretchingMobility": "Stretching & Mobilität",
      "urbanCyclingTour": "Stadt-Radtour",
      "skateboarding": "Skateboarden",
      "rollerSkating": "Rollschuhlaufen / Inlineskaten",
      "skiingSnowboarding": "Ski- & Snowboardfahren",

      "dancingSalsa": "Tanzen - Salsa",
      "dancingBachata": "Tanzen - Bachata",
      "dancingKizomba": "Tanzen - Kizomba",
      "dancingTango": "Tanzen - Tango",
      "dancingHipHop": "Tanzen - Hip-Hop",
      "dancingKPop": "Tanzen - K-Pop",
      "zumba": "Zumba",
      "contemporaryDance": "Zeitgenössischer Tanz",
      "socialDanceNight": "Social-Dance-Abend",
      "dancePracticeSession": "Tanz-Übungssession",

      "painting": "Malen",
      "watercolorPainting": "Aquarellmalerei",
      "acrylicPainting": "Acrylmalerei",
      "drawing": "Zeichnen",
      "sketchingInTheCity": "Skizzieren in der Stadt",
      "digitalArt": "Digitale Kunst",
      "graphicDesignJam": "Graphic-Design-Jam",
      "calligraphy": "Kalligrafie",
      "photography": "Fotografie",
      "streetPhotographyWalk": "Street-Fotografie-Spaziergang",
      "portraitPhotography": "Porträtfotografie",
      "filmPhotography": "Analoge Fotografie",
      "videography": "Videografie",
      "contentCreationMeetup": "Content-Creation-Meetup",
      "youTubeCreatorsMeetup": "YouTube-Creators-Meetup",
      "podcastingMeetup": "Podcasting-Meetup",
      "3dPrintingMakerLab": "3D-Druck & Maker-Lab",
      "arduinoElectronicsWorkshop": "Arduino- & Elektronik-Workshop",
      "roboticsMeetup": "Robotik-Meetup",
      "craftsDiy": "Basteln & DIY",
      "knittingCrochet": "Stricken & Häkeln",
      "embroidery": "Sticken",
      "handmadeJewelryWorkshop": "Handgemachter-Schmuck-Workshop",
      "potteryCeramics": "Töpferei & Keramik",
      "origami": "Origami",
      "modelBuilding": "Modellbau",

      "jamSession": "Jam-Session",
      "guitarCircle": "Gitarrenrunde",
      "pianoLoversMeetup": "Piano-Lovers-Treffen",
      "singingCircle": "Singkreis",
      "choirPractice": "Chorprobe",
      "openMicNight": "Open-Mic-Abend",
      "karaokeNight": "Karaoke-Abend",
      "songwritingCircle": "Songwriting-Kreis",
      "djElectronicMusicMeetup": "DJ- & elektronische Musik-Meetup",
      "musicProductionMeetup": "Musikproduktion-Meetup",
      "liveConcertBuddyGroup": "Konzert-Buddy-Gruppe",
      "streetMusicJam": "Straßenmusik-Jam",
      "classicalMusicAppreciation": "Klassische Musik hören & austauschen",
      "jazzListeningSession": "Jazz-Hörsession",
      "bandPracticeSession": "Bandprobe",

      "languageExchangeEnglish": "Sprachaustausch - Englisch",
      "languageExchangeGerman": "Sprachaustausch - Deutsch",
      "languageExchangeTurkish": "Sprachaustausch - Türkisch",
      "languageExchangeSpanish": "Sprachaustausch - Spanisch",
      "languageExchangeItalian": "Sprachaustausch - Italienisch",
      "languageExchangeFrench": "Sprachaustausch - Französisch",
      "languageExchangeMixed": "Sprachaustausch - Gemischte Sprachen",
      "coffeeLanguageExchange": "Kaffee & Sprachaustausch",
      "conversationPracticeBeginner": "Konversationspraxis - Anfänger",
      "conversationPracticeIntermediate": "Konversationspraxis - Mittelstufe",
      "conversationPracticeAdvanced": "Konversationspraxis - Fortgeschrittene",

      "bookClub": "Buchclub",
      "nonFictionBookClub": "Sachbuch-Buchclub",
      "fictionBookClub": "Roman-Buchclub",
      "philosophyReadingGroup": "Philosophie-Lesegruppe",
      "cultureExchangeNight": "Kulturaustausch-Abend",
      "travelStoriesNight": "Reisegeschichten-Abend",
      "movieNight": "Filmabend",
      "documentaryNight": "Doku-Abend",
      "animeMangaMeetup": "Anime- & Manga-Meetup",

      "cookingClass": "Kochkurs",
      "baking": "Backen",
      "dessertWorkshop": "Dessert-Workshop",
      "baristaCoffeeWorkshop": "Barista- & Kaffee-Workshop",
      "teaTasting": "Tee-Verkostung",
      "wineTasting": "Weinverkostung",
      "beerTasting": "Bierverkostung",
      "craftBeerMeetup": "Craft-Beer-Meetup",
      "veganCookingWorkshop": "Vegan-Kochen-Workshop",
      "streetFoodTour": "Street-Food-Tour",
      "restaurantDiscoveryGroup": "Restaurant-Entdeckergruppe",
      "internationalCuisineNight": "Abend mit internationaler Küche",
      "potluckDinner": "Potluck-Dinner",
      "picnicSnacksMeetup": "Picknick & Snacks-Treffen",
      "foodPhotographyWalk": "Food-Fotografie-Spaziergang",

      "meditation": "Meditation",
      "mindfulnessPractice": "Achtsamkeitspraxis",
      "breathworkSession": "Breathwork-Session",
      "soundHealing": "Klangheilung / Sound-Healing",
      "yogaMeditation": "Yoga & Meditation",
      "morningRoutineClub": "Morning-Routine-Club",
      "gratitudeJournalCircle": "Dankbarkeitstagebuch-Kreis",
      "mentalHealthSupportCircle": "Mental-Health-Unterstützungsgruppe",
      "stressReliefWalk": "Stressabbau-Spaziergang",
      "natureWalkMindfulness": "Naturspaziergang & Achtsamkeit",
      "digitalDetoxMeetup": "Digital-Detox-Meetup",
      "journalingMeetup": "Journaling-Meetup",
      "goalSettingSession": "Zielsetzungs-Session",
      "accountabilityGroup": "Accountability-Gruppe",
      "lifeDesignWorkshop": "Life-Design-Workshop",

      "volunteeringCharity": "Ehrenamt & Charity",
      "beachCleanup": "Strandreinigung",
      "parkCleanup": "Parkreinigung",
      "animalShelterVolunteering": "Ehrenamt im Tierheim",
      "communityGardenMeetup": "Community-Garten-Meetup",
      "charityRunWalk": "Charity-Lauf / -Walk",
      "fundraisingEvents": "Fundraising-Events",
      "teachingKidsCoding": "Kindern Programmieren beibringen",
      "mentoringStudents": "Studierenden-Mentoring",
      "localCommunityProjects": "Lokale Community-Projekte",
      "neighborhoodMeetGreet": "Nachbarschafts-Treffen",
      "refugeeSupportVolunteers": "Freiwillige für Geflüchtetenhilfe",
      "recyclingSustainabilityMeetup": "Recycling & Nachhaltigkeit-Meetup",
      "climateActionMeetup": "Klimaschutz-Meetup",
      "socialImpactProjects": "Social-Impact-Projekte",

      "cityWalkingTour": "Stadtspaziergang",
      "hiddenSpotsInTheCity": "Versteckte Orte in der Stadt",
      "museumGalleryVisit": "Museums- & Galerie-Besuch",
      "historicalSitesTour": "Tour zu historischen Orten",
      "weekendTripPlanning": "Wochenendtrip-Planung",
      "backpackingMeetup": "Backpacking-Meetup",
      "soloTravelPlanning": "Solo-Reisen planen",
      "travelPhotoWalk": "Travel-Fotografie-Spaziergang",
      "trainTripMeetup": "Zugreise-Meetup",
      "natureDayTrip": "Tagesausflug in die Natur",

      "onlineStudyGroup": "Online-Lerngruppe",
      "onlineCodingSession": "Online-Coding-Session",
      "onlineLanguageExchange": "Online-Sprachaustausch",
      "onlineGameNight": "Online-Spieleabend",
      "onlineMovieNight": "Online-Filmabend",
      "remoteBookClub": "Remote-Buchclub",
      "virtualCoworking": "Virtuelles Coworking",
      "virtualCoffeeChat": "Virtueller Kaffee-Talk",
      "onlineNetworkingEvent": "Online-Networking-Event",
      "remoteTeamBuilding": "Remote-Teambuilding",
    },
    settings: {
      pageTitle: "Einstellungen",
      sidebar: {
        profile: "Profil bearbeiten",
        account: "Kontoverwaltung",
        email: "E-Mail-Updates",
        privacy: "Datenschutz",
        social: "Soziale Medien",
        interests: "Interessen",
        payments: "Zahlungsmethoden",
        badgeSoon: "bald",
      },
      profile: {
        title: "Profil bearbeiten",
        subtitle:
          "Aktualisiere deine Basisdaten. Wir nutzen sie, um Events und Empfehlungen für dich zu personalisieren.",
        nameLabel: "Name",
        namePlaceholder: "Dein Name",
        locationLabel: "Dein Standort",
        locationPlaceholder: "Stadt auswählen",
        locationButton: "Adresse bearbeiten",
        locationHelper:
          "Wir verwenden dies, um dir Events in deiner Nähe zu zeigen.",
        birthdateLabel: "Geburtsdatum",
        birthdateDay: "Tag",
        birthdateMonth: "Monat",
        birthdateYear: "Jahr",
        birthdateHelper:
          "Wir zeigen dein genaues Geburtsdatum niemals öffentlich. Es wird nur für altersgerechte Empfehlungen genutzt.",
        genderLabel: "Geschlecht",
        genderPlaceholder: "Möchte ich nicht angeben",
        genderOptions: {
          female: "Weiblich",
          male: "Männlich",
          nonBinary: "Nicht-binär",
          preferNot: "Möchte ich nicht angeben",
        },
        bioLabel: "Über dich",
        bioPlaceholder:
          "Schreibe hier ein paar Sätze über dich",
        toggles: {
          showGroupsLabel: "Meetup-artige Gruppen anzeigen",
          showGroupsDescription:
            "Auf deinem Profil können andere alle Gruppen sehen, in denen du Mitglied bist.",
          showInterestsLabel: "Interessen anzeigen",
          showInterestsDescription:
            "Auf deinem Profil können andere deine Interessenliste sehen.",
        },
        saveButton: "Änderungen speichern",
        savingButton: "Wird gespeichert…",
        saveSuccess: "Profil aktualisiert.",
        saveError: "Profil konnte nicht gespeichert werden.",
        loadingProfile: "Profil wird geladen…",
      },
      account: {
        title: "Kontoverwaltung",
        emailLabel: "Deine E-Mail-Adresse",
        languageLabel: "Sprache",
        languageHelper:
          "Dies ändert die Sprache, die auf diesem Gerät in Moventra verwendet wird.",
        timeZoneLabel: "Primäre Zeitzone",
        timeZoneHelper:
          "Deine Auswahl beeinflusst, wie Eventzeiten angezeigt werden. Wenn die Zeitzone von deinem Standort abhängen soll, wähle „Systemzeit (Standard)“.",
        timeZoneOptions: {
          system:
            "Systemzeit (Standard) – Zeitzone des Geräts verwenden",
          cet: "Mitteleuropäische Zeit (CET)",
          gmt: "Greenwich Mean Time (GMT)",
        },
        changePassword: {
          title: "Passwort ändern",
          helper:
            "Wenn du dein Passwort änderst, wirst du automatisch aus anderen Sitzungen abgemeldet.",
          openButton: "Passwort ändern",
          cancelButton: "Abbrechen",
          currentPlaceholder: "Aktuelles Passwort",
          newPlaceholder: "Neues Passwort",
          confirmPlaceholder: "Neues Passwort bestätigen",
          errorFillAll: "Bitte alle Felder ausfüllen.",
          errorMismatch:
            "Die neuen Passwörter stimmen nicht überein.",
          errorTooShort:
            "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
          genericError: "Passwort konnte nicht geändert werden.",
          success: "Dein Passwort wurde aktualisiert.",
          submitButton: "Neues Passwort speichern",
          submittingButton: "Wird aktualisiert…",
        },
        deactivate: {
          title: "Dein Konto deaktivieren",
          helper:
            "Wenn du Moventra verlassen möchtest, musst du später ein neues Konto erstellen, um zurückzukehren.",
          confirmMessage:
            "Bist du sicher, dass du dein Moventra-Konto deaktivieren möchtest? Du wirst abgemeldet und kannst dieses Konto nicht mehr verwenden.",
          button: "Konto deaktivieren",
          buttonLoading: "Wird deaktiviert…",
          statusSuccess: "Dein Konto wurde deaktiviert.",
          statusError:
            "Konto konnte nicht deaktiviert werden. Bitte versuche es erneut.",
        },
        gdpr: {
          title: "Daten- & DSGVO-Anfragen",
          helper:
            "Sende hier Anfragen zur Datenübertragbarkeit und Löschung gemäß DSGVO.",
          typeLabel: "Art der Anfrage",
          typeOptions: {
            access:
              "Zugriff auf / Export meiner personenbezogenen Daten",
            erasure: "Meine personenbezogenen Daten löschen",
            other: "Sonstige DSGVO-Anfrage",
          },
          detailsLabel: "Details (optional)",
          detailsPlaceholder:
            "Füge Details hinzu, die helfen können, deine Anfrage schneller zu bearbeiten.",
          submitButton: "DSGVO-Anfrage senden",
          submittingButton: "Wird gesendet…",
          statusSuccess:
            "Deine Anfrage wurde übermittelt. Wir melden uns per E-Mail bei dir.",
          statusError: "DSGVO-Anfrage konnte nicht gesendet werden.",
        },
      },
      email: {
        title: "E-Mail-Updates",
        intro:
          "Wähle aus, welche E-Mail-Updates du zu deiner Aktivität, Events und Gruppen erhalten möchtest. Wenn bestimmte Push-Benachrichtigungen aktiv sind, müssen wir dieselben Infos nicht zusätzlich per E-Mail senden.",
        sections: {
          updatesTitle: "Updates von Moventra",
          updatesHelper:
            "Steuere, welche Arten von E-Mail-Benachrichtigungen du von Moventra erhältst.",
          turnOffTitle: "Alle E-Mail-Updates deaktivieren",
          turnOffHelper:
            "Wir hören auf, dir E-Mail-Updates zu senden. Bestimmte E-Mails wie rechtliche Hinweise und Transaktionsmails kannst du trotzdem erhalten.",
          turnOffButton: "Deaktivieren",
        },
        rows: {
          messagesTitle: "Nachrichten",
          messagesDescription:
            "E-Mail erhalten, wenn mir jemand eine Nachricht sendet.",
          repliesTitle: "Antworten auf meine Kommentare",
          repliesDescription:
            "E-Mail erhalten, wenn jemand auf meine Kommentare antwortet.",
          suggestedTitle: "Vorgeschlagene Events",
          suggestedDescription:
            "Wöchentliche Highlights basierend auf meinen Gruppen und Interessen.",
          newGroupsTitle: "Neue Moventra-Gruppen",
          newGroupsDescription:
            "Informiere mich über neue Gruppen, die zu meinen Interessen passen.",
          updatesHQTitle: "Updates von Moventra HQ",
          updatesHQDescription:
            "Informiere mich über neue Features und wichtige Moventra-News.",
          surveysTitle: "Moventra-Umfragen",
          surveysDescription:
            "Schicke mir Umfragen, die Moventra verbessern könnten.",
          icalTitle: "iCal-Anhänge",
          icalDescription:
            "Sende mir E-Mail-Erinnerungen mit Kalenderanhängen.",
          proNetworkTitle: "Updates aus Pro-Netzwerken",
          proNetworkDescription:
            "Updates von meinen Pro-Gruppen erhalten.",
          connectionsTitle: "Verbindungen",
          connectionsDescription:
            "Über neue Verbindungen auf Moventra benachrichtigen.",
        },
      },
      privacy: {
        title: "Datenschutz",
        intro:
          "Steuere, wer dich kontaktieren kann und was andere in deinem öffentlichen Profil sehen können.",
        contactsTitle: "Kontakte",
        contactsHelper:
          "Wer kann dich auf Moventra kontaktieren? Du kannst dies jederzeit anpassen.",
        contactsOptions: {
          organizers: "Nur Veranstalter",
          groups: "Nur Mitglieder meiner Gruppen",
          anyone: "Alle auf Moventra",
        },
        publicProfileTitle: "Öffentliches Profil",
        publicProfileHelper:
          "Steuere, was andere in deinem öffentlichen Profil sehen können.",
        editProfileButton: "Profil bearbeiten",
      },
      comingSoon: {
        title: "Bald verfügbar",
        text: "Dieser Einstellungsbereich wird in einem zukünftigen Update verfügbar sein.",
      },
    },
    cityPicker: {
      title: "Stadt wählen",
      countryPlaceholder: "Land wählen",
      statePlaceholder: "Stadt / Region wählen",
      selectCountryFirst: "Bitte zuerst ein Land wählen",
      loadingStates: "Städte werden geladen...",
      showEventsButton: "Events an diesem Ort anzeigen",

      // Eski key’ler – istersen kalsın
      statePlaceholderNoCountry: "Zuerst ein Land auswählen",
      statePlaceholderLoading: "Wird geladen...",
      statePlaceholderReady: "Stadt / Region auswählen",
      buttonLabel: "Events an diesem Ort anzeigen",
    },
  },
};

// Basit key resolver: "home.hero.titleLine1" gibi path'leri çözer
// Eksikse önce seçili dilde, sonra EN fallback dener.
export function resolveMessage(
  lang: Language,
  key: string
): string | undefined {
  const parts = key.split(".");

  function getFromLanguage(l: Language): string | undefined {
    const base = messages[l];
    let current: any = base;

    for (const p of parts) {
      if (current == null) return undefined;
      current = current[p];
    }

    return typeof current === "string" ? current : undefined;
  }

  // Önce seçili dili dene
  const fromCurrent = getFromLanguage(lang);
  if (fromCurrent !== undefined) return fromCurrent;

  // Bulamazsa EN'e düş
  if (lang !== "en") {
    const fromEn = getFromLanguage("en");
    if (fromEn !== undefined) return fromEn;
  }

  return undefined;
}
