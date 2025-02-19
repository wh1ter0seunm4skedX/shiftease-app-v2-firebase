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
  },
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
  randomDate.setHours(randomHour, randomMinute, 0, 0);  // setting seconds and milliseconds to 0
  const randomStartTime = `${randomHour}:${randomMinute < 10 ? '0' : ''}${randomMinute}`;
  const randomEndTime = `${(randomHour + 1) % 24}:${randomMinute < 10 ? '0' : ''}${randomMinute}`;  // end time 1 hour later

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    date: randomDate.toISOString().split('T')[0],
    startTime: randomStartTime,
    endTime: randomEndTime,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    imageUrl: EVENT_IMAGES[Math.floor(Math.random() * EVENT_IMAGES.length)].url
  };
};
