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
    url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d",
    alt: "Abstract neon lights"
  }
];

export const generateRandomEvent = () => {
  const titles = ["Team Meeting", "Product Launch", "Workshop", "Conference", "Webinar"];
  const descriptions = [
    "Join us for an exciting discussion about upcoming projects.",
    "Discover the latest innovations in our product line.",
    "Learn new skills in this hands-on workshop session.",
    "Connect with industry experts and peers.",
    "Gain insights from our expert speakers."
  ];

  const randomDate = new Date();
  randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    date: randomDate.toISOString().split('T')[0],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    imageUrl: EVENT_IMAGES[Math.floor(Math.random() * EVENT_IMAGES.length)].url
  };
};
