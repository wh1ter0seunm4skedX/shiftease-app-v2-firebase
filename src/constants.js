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
export const EVENT_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
    alt: "Abstract purple and blue waves"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3",
    alt: "Abstract colorful gradient"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    alt: "Abstract geometric shapes"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1614850715649-1d0106293bd1",
    alt: "Abstract fluid art"
  },
  {
    id: 5,
    url: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    alt: "Abstract neon lights"
  },
  {
    id: 6,
    url: "https://images.pexels.com/photos/30708629/pexels-photo-30708629/free-photo-of-abstract-colorful-waves-in-blue-and-yellow-tones.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    alt: "Abstract digital waves"
  },
  {
    id: 7,
    url: "https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=10",
    alt: "Vibrant abstract paint strokes"
  },
  {
    id: 8,
    url: "https://images.pexels.com/photos/29533798/pexels-photo-29533798/free-photo-of-abstract-pink-and-black-swirl-art-painting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    alt: "Abstract futuristic grid"
  },
  {
    id: 9,
    url: "https://images.pexels.com/photos/15315570/pexels-photo-15315570/free-photo-of-vibrant-purple-fluid-art.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    alt: "Abstract blue smoke"
  },
  {
    id: 10,
    url: "https://images.pexels.com/photos/2693212/pexels-photo-2693212.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    alt: "Abstract glowing particles"
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
  const titles = [
    "Team Meeting", 
    "Product Launch", 
    "Workshop", 
    "Conference", 
    "Webinar",
    "Networking Event",
    "Hackathon",
    "Training Session",
    "Annual Gala",
    "Tech Demo"
  ];
  
  const descriptions = [
    "Join us for an exciting discussion about upcoming projects.",
    "Discover the latest innovations in our product line.",
    "Learn new skills in this hands-on workshop session.",
    "Connect with industry experts and peers.",
    "Gain insights from our expert speakers.",
    "A great opportunity to meet and connect with professionals.",
    "Compete, code, and create in this intense hackathon!",
    "Improve your skills with guidance from experienced mentors.",
    "Celebrate the successes of the year with us!",
    "Experience live demonstrations of our latest tech solutions."
  ];

  const randomDate = new Date();
  randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));
  const randomHour = Math.floor(Math.random() * 24);
  const randomMinute = Math.floor(Math.random() * 60);
  randomDate.setHours(randomHour, randomMinute, 0, 0); 
  const randomStartTime = `${randomHour}:${randomMinute < 10 ? '0' : ''}${randomMinute}`;
  const randomEndTime = `${(randomHour + 1) % 24}:${randomMinute < 10 ? '0' : ''}${randomMinute}`; 

  const randomCapacity = Math.floor(Math.random() * 10) + 1;
  const randomStandbyCapacity = Math.floor(Math.random() * 5) + 1;

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    date: randomDate.toISOString().split('T')[0],
    startTime: randomStartTime,
    endTime: randomEndTime,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    imageUrl: EVENT_IMAGES[Math.floor(Math.random() * EVENT_IMAGES.length)].url,
    capacity: randomCapacity,
    standbyCapacity: randomStandbyCapacity
  };
};
