// Word lists by difficulty level

export const wordLists = {
  easy: [
    "dog", "cat", "house", "car", "tree", "book", "phone", "water", "food", "chair",
    "table", "door", "window", "sun", "moon", "star", "flower", "bird", "fish", "ball",
    "shoe", "hat", "shirt", "pants", "bed", "clock", "watch", "cup", "plate", "fork",
    "spoon", "knife", "bowl", "box", "bag", "key", "lock", "pen", "pencil", "paper"
  ],
  medium: [
    "adventure", "birthday", "chocolate", "dinosaur", "elephant", "festival", "giraffe",
    "hamburger", "internet", "jellyfish", "kangaroo", "lemonade", "mountain", "notebook",
    "octopus", "pancake", "question", "rainbow", "sandwich", "telescope", "umbrella",
    "vacation", "waterfall", "xylophone", "yesterday", "zucchini", "airplane", "butterfly",
    "crocodile", "detective", "electricity", "firefighter", "grasshopper", "helicopter"
  ],
  hard: [
    "aristocracy", "bureaucracy", "catastrophe", "democracy", "enthusiasm", "fascination",
    "generosity", "hypothesis", "illustration", "jurisdiction", "kaleidoscope", "legislation",
    "metropolitan", "negotiation", "opportunity", "philosophy", "qualification", "renaissance",
    "surveillance", "technology", "understanding", "vulnerability", "wilderness", "xenophobia",
    "zoologist", "archaeology", "bibliography", "choreography", "demonstration", "encyclopedia"
  ]
};

export function getRandomWord(difficulty: string = 'easy'): string {
  const words = wordLists[difficulty as keyof typeof wordLists] || wordLists.easy;
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}
