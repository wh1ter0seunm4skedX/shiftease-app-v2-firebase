// Profile pictures removed; avatars are initials-based

// Import event pictures from local directory
// Removed hardcoded event images; we use the image API now.

// PROFILE_PICTURES removed
// EVENT_PICTURES removed

export const generateRandomEvent = () => {
  const events = [
    { 
      title: "ערב אוכל", 
      description: "ערב טעים עם מטעמים מכל העולם!",
    },
    { 
      title: "ערב אומנות", 
      description: "מפגש השראה עם אומנים ויצירה חווייתית.",
    },
    { 
      title: "אירוע ט\"ו בשבט", 
      description: "חגיגה ירוקה עם נטיעות ופעילויות משפחתיות.",
    },
    { 
      title: "יריד בשקל", 
      description: "הזדמנות לקנות הכל בשקל אחד בלבד!",
    },
    { 
      title: "מסיבת פורים", 
      description: "תחפושות, מוזיקה ותחרות פרסים שווה במיוחד!",
    },
    { 
      title: "חגיגת יום העצמאות", 
      description: "מופע זיקוקים, מנגלים ופעילויות לכולם.",
    },
    { 
      title: "פעילויות פנאי", 
      description: "מגוון סדנאות, משחקים ומפגשים מהנים.",
    },
    { 
      title: "יציאת חוץ", 
      description: "טיול בטבע עם מסלול מותאם לכל גיל.",
    },
    { 
      title: "תפוח בדבש", 
      description: "ראש השנה מתוק עם טעימות דבש וברכות.",
    },
    { 
      title: "מסיבת חנוכה", 
      description: "הדלקת נרות, סופגניות וסביבונים לכולם.",
    },
    { 
      title: "מיוחדים בשרון", 
      description: "אירוע קהילתי שמציג כישרונות מקומיים.",
    }
  ];
  
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  
  const randomDate = new Date();
  randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));
  const randomHour = Math.floor(Math.random() * 12) + 9; // Between 9AM and 9PM
  const randomMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // Only 00, 15, 30, 45
  randomDate.setHours(randomHour, randomMinute, 0, 0); 
  
  const formattedStartHour = randomHour.toString().padStart(2, '0');
  const formattedStartMinute = randomMinute.toString().padStart(2, '0');
  const randomStartTime = `${formattedStartHour}:${formattedStartMinute}`;
  
  const duration = Math.floor(Math.random() * 3) + 1;
  const endHour = (randomHour + duration) % 24;
  const formattedEndHour = endHour.toString().padStart(2, '0');
  const randomEndTime = `${formattedEndHour}:${formattedStartMinute}`; 

  const randomCapacity = Math.floor(Math.random() * 8) + 1; 
  const randomStandbyCapacity = Math.floor(Math.random() * 5) + 1;

  return {
    title: randomEvent.title,
    date: randomDate.toISOString().split('T')[0],
    startTime: randomStartTime,
    endTime: randomEndTime,
    description: randomEvent.description,
    imageUrl: '',
    capacity: randomCapacity,
    standbyCapacity: randomStandbyCapacity
  };
};
