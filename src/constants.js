import avatar1 from './assets/profile_pictures/uifaces-cartoon-image (1).jpg';
import avatar2 from './assets/profile_pictures/uifaces-cartoon-image (2).jpg';
import avatar3 from './assets/profile_pictures/uifaces-cartoon-image (3).jpg';
import avatar4 from './assets/profile_pictures/uifaces-cartoon-image (4).jpg';
import avatar5 from './assets/profile_pictures/uifaces-cartoon-image (5).jpg';
import avatar6 from './assets/profile_pictures/uifaces-cartoon-image (6).jpg';
import avatar7 from './assets/profile_pictures/uifaces-cartoon-image (7).jpg';
import avatar8 from './assets/profile_pictures/uifaces-cartoon-image (8).jpg';
import avatar9 from './assets/profile_pictures/uifaces-cartoon-image (9).jpg';
import avatar10 from './assets/profile_pictures/uifaces-cartoon-image (10).jpg';
import avatar11 from './assets/profile_pictures/uifaces-cartoon-image (11).jpg';
import avatar12 from './assets/profile_pictures/uifaces-cartoon-image (12).jpg';
import avatar14 from './assets/profile_pictures/uifaces-cartoon-image (14).jpg';
import avatar15 from './assets/profile_pictures/uifaces-cartoon-image (15).jpg';
import avatar16 from './assets/profile_pictures/uifaces-cartoon-image.jpg';

// Import event pictures from local directory
import eventPic1 from './assets/events_pictures/event_pic_1.jpg';
import eventPic2 from './assets/events_pictures/event_pic_2.jpg';
import eventPic3 from './assets/events_pictures/event_pic_3.jpg';
import eventPic4 from './assets/events_pictures/event_pic_4.jpg';
import eventPic5 from './assets/events_pictures/event_pic_5.jpg';
import eventPic6 from './assets/events_pictures/event_pic_6.jpg';
import eventPic7 from './assets/events_pictures/event_pic_7.jpg';
import eventPic8 from './assets/events_pictures/event_pic_8.jpg';
import eventPic9 from './assets/events_pictures/event_pic_9.jpg';
import eventPic10 from './assets/events_pictures/event_pic_10.jpg';

export const EVENT_IMAGES = [
  {
    id: 1,
    url: eventPic1,
    alt: "Event picture 1"
  },
  {
    id: 2,
    url: eventPic2,
    alt: "Event picture 2"
  },
  {
    id: 3,
    url: eventPic3,
    alt: "Event picture 3"
  },
  {
    id: 4,
    url: eventPic4,
    alt: "Event picture 4"
  },
  {
    id: 5,
    url: eventPic5,
    alt: "Event picture 5"
  },
  {
    id: 6,
    url: eventPic6,
    alt: "Event picture 6"
  },
  {
    id: 7,
    url: eventPic7,
    alt: "Event picture 7"
  },
  {
    id: 8,
    url: eventPic8,
    alt: "Event picture 8"
  },
  {
    id: 9,
    url: eventPic9,
    alt: "Event picture 9"
  },
  {
    id: 10,
    url: eventPic10,
    alt: "Event picture 10"
  }
];

export const PROFILE_PICTURES = [
  {
    id: 1,
    url: avatar1,
    alt: "Cartoon profile avatar 1"
  },
  {
    id: 2,
    url: avatar2,
    alt: "Cartoon profile avatar 2"
  },
  {
    id: 3,
    url: avatar3,
    alt: "Cartoon profile avatar 3"
  },
  {
    id: 4,
    url: avatar4,
    alt: "Cartoon profile avatar 4"
  },
  {
    id: 5,
    url: avatar5,
    alt: "Cartoon profile avatar 5"
  },
  {
    id: 6,
    url: avatar6,
    alt: "Cartoon profile avatar 6"
  },
  {
    id: 7,
    url: avatar7,
    alt: "Cartoon profile avatar 7"
  },
  {
    id: 8,
    url: avatar8,
    alt: "Cartoon profile avatar 8"
  },
  {
    id: 9,
    url: avatar9,
    alt: "Cartoon profile avatar 9"
  },
  {
    id: 10,
    url: avatar10,
    alt: "Cartoon profile avatar 10"
  },
  {
    id: 11,
    url: avatar11,
    alt: "Cartoon profile avatar 11"
  },
  {
    id: 12,
    url: avatar12,
    alt: "Cartoon profile avatar 12"
  },
  {
    id: 14,
    url: avatar14,
    alt: "Cartoon profile avatar 14"
  },
  {
    id: 15,
    url: avatar15,
    alt: "Cartoon profile avatar 15"
  },
  {
    id: 16,
    url: avatar16,
    alt: "Cartoon profile avatar 16"
  }
];

export const generateRandomEvent = () => {
  const events = [
    { 
      title: "ערב אוכל", 
      englishTitle: "Food Evening",
      description: "ערב קולינרי מיוחד עם מגוון מטעמים מהמטבח העולמי. בואו לטעום ולהנות!",
      englishDescription: "Special culinary evening featuring a variety of delicacies from world cuisines. Come taste and enjoy!"
    },
    { 
      title: "ערב אומנות", 
      englishTitle: "Art Evening",
      description: "ערב יצירה והשראה עם אומנים מקומיים. הזדמנות לחוות יצירה משותפת ולהתנסות בטכניקות חדשות.",
      englishDescription: "An evening of creativity and inspiration with local artists. An opportunity to experience collaborative creation and try new techniques."
    },
    { 
      title: "אירוע ט\"ו בשבט", 
      englishTitle: "Tu B'Shvat Event",
      description: "חגיגה לכבוד ראש השנה לאילנות, עם נטיעות, סדר ט\"ו בשבט ופעילויות לכל המשפחה.",
      englishDescription: "A celebration of the New Year for Trees, featuring planting activities, a Tu B'Shvat Seder, and activities for the whole family."
    },
    { 
      title: "יריד בשקל", 
      englishTitle: "Shekel Fair",
      description: "יריד מיוחד בו כל המוצרים נמכרים בשקל אחד בלבד! הזדמנות מצוינת למציאות ולתרומה לקהילה.",
      englishDescription: "A special fair where all items are sold for just one shekel! An excellent opportunity for bargains while contributing to the community."
    },
    { 
      title: "מסיבת פורים", 
      englishTitle: "Purim Party",
      description: "מסיבת תחפושות שמחה וצבעונית לכבוד חג הפורים, עם תחרות תחפושות, משלוחי מנות וקריאת מגילה.",
      englishDescription: "A joyful and colorful costume party celebrating Purim, featuring a costume contest, gift baskets exchange, and Megillah reading."
    },
    { 
      title: "יום העצמאות", 
      englishTitle: "Independence Day",
      description: "חגיגה לציון יום העצמאות של מדינת ישראל, עם מופע זיקוקים, מנגלים ופעילויות מיוחדות.",
      englishDescription: "A celebration marking Israel's Independence Day, featuring fireworks, barbecues, and special activities."
    },
    { 
      title: "פעילויות פנאי", 
      englishTitle: "Leisure Activities",
      description: "המשך פעילות רגילה - מגוון פעילויות פנאי להנאה ולהפגה, כולל משחקים, סדנאות ומפגשים חברתיים.",
      englishDescription: "Continuation of regular activities - a variety of leisure activities for enjoyment and relaxation, including games, workshops, and social gatherings."
    },
    { 
      title: "יציאת חוץ", 
      englishTitle: "Outdoor Trip",
      description: "יציאה מאורגנת לטיול בטבע, עם פעילויות מגבשות ומסלול הליכה מותאם לכל הגילים.",
      englishDescription: "An organized nature trip with team-building activities and a walking route suitable for all ages."
    },
    { 
      title: "תפוח בדבש", 
      englishTitle: "Apple in Honey",
      description: "אירוע מיוחד לכבוד ראש השנה, עם טעימות דבש מקומי, הכנת ברכות לשנה החדשה וארוחה חגיגית.",
      englishDescription: "A special Rosh Hashanah event featuring local honey tastings, preparation of New Year greetings, and a festive meal."
    },
    { 
      title: "מסיבת חנוכה", 
      englishTitle: "Hanukkah Party",
      description: "חגיגת חנוכה מסורתית עם הדלקת נרות, סופגניות, סביבונים ופעילויות לכל המשפחה.",
      englishDescription: "Traditional Hanukkah celebration with candle lighting, sufganiyot (donuts), dreidels, and activities for the whole family."
    },
    { 
      title: "מיוחדים בשרון", 
      englishTitle: "Specials in Sharon",
      description: "אירוע קהילתי מיוחד המציג כישרונות מקומיים ויוזמות חברתיות באזור השרון.",
      englishDescription: "A special community event showcasing local talents and social initiatives in the Sharon region."
    }
  ];
  
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  
  const randomDate = new Date();
  randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));
  const randomHour = Math.floor(Math.random() * 12) + 9; // Between 9AM and 9PM
  const randomMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // Only 00, 15, 30, 45
  randomDate.setHours(randomHour, randomMinute, 0, 0); 
  
  // Format time properly with leading zeros
  const formattedStartHour = randomHour.toString().padStart(2, '0');
  const formattedStartMinute = randomMinute.toString().padStart(2, '0');
  const randomStartTime = `${formattedStartHour}:${formattedStartMinute}`;
  
  // Event duration between 1-3 hours
  const duration = Math.floor(Math.random() * 3) + 1;
  const endHour = (randomHour + duration) % 24;
  const formattedEndHour = endHour.toString().padStart(2, '0');
  const randomEndTime = `${formattedEndHour}:${formattedStartMinute}`; 

  const randomCapacity = Math.floor(Math.random() * 8) + 1; // Between 1-9
  const randomStandbyCapacity = Math.floor(Math.random() * 5) + 1; // Between 1-5

  return {
    title: randomEvent.title,
    date: randomDate.toISOString().split('T')[0],
    startTime: randomStartTime,
    endTime: randomEndTime,
    description: randomEvent.description,
    imageUrl: EVENT_IMAGES[Math.floor(Math.random() * EVENT_IMAGES.length)].url,
    capacity: randomCapacity,
    standbyCapacity: randomStandbyCapacity
  };
};
