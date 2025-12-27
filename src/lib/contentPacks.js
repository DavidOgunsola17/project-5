export const CONTENT_PACKS = {
  general: {
    name: 'General',
    popQuizQuestions: [
      { question: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 1 },
      { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mars', 'Mercury', 'Earth'], correct: 2 },
      { question: 'Who wrote Romeo and Juliet?', options: ['Dickens', 'Shakespeare', 'Austen', 'Hemingway'], correct: 1 },
      { question: 'What is 7 x 8?', options: ['54', '56', '63', '48'], correct: 1 },
      { question: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
      { question: 'What year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2 },
      { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2 },
      { question: 'What is the chemical symbol for gold?', options: ['Go', 'Au', 'Gd', 'Ag'], correct: 1 },
    ],
    secretPhrases: [
      { phrase: 'PIZZA PARTY', clues: ['Round food', 'Italian dish', 'Cheese topping', 'Group gathering', 'Birthday celebration', 'Pepperoni option'] },
      { phrase: 'SUMMER VACATION', clues: ['Hot season', 'Time off', 'Beach trip', 'School break', 'Travel plans', 'July adventure'] },
      { phrase: 'COFFEE BREAK', clues: ['Morning drink', 'Caffeine boost', 'Work pause', 'Brown beverage', 'Rest period', 'Espresso time'] },
    ],
    syncQuestions: [
      { question: 'Best season?', options: ['Spring', 'Summer', 'Fall', 'Winter'] },
      { question: 'Pizza or Tacos?', options: ['Pizza', 'Tacos', 'Both!', 'Neither'] },
      { question: 'Morning or Night person?', options: ['Morning', 'Night', 'Both', 'Neither'] },
      { question: 'Coffee or Tea?', options: ['Coffee', 'Tea', 'Both', 'Neither'] },
      { question: 'Beach or Mountains?', options: ['Beach', 'Mountains', 'Both', 'Neither'] },
      { question: 'Cats or Dogs?', options: ['Cats', 'Dogs', 'Both', 'Neither'] },
      { question: 'Books or Movies?', options: ['Books', 'Movies', 'Both', 'Neither'] },
    ],
  },
  'pop-culture': {
    name: 'Pop Culture',
    popQuizQuestions: [
      { question: 'Which movie won Best Picture at the 2023 Oscars?', options: ['Avatar 2', 'Everything Everywhere All at Once', 'Top Gun', 'The Fabelmans'], correct: 1 },
      { question: 'Who is known as the "King of Pop"?', options: ['Elvis', 'Michael Jackson', 'Prince', 'Madonna'], correct: 1 },
      { question: 'What year did the first iPhone release?', options: ['2005', '2006', '2007', '2008'], correct: 2 },
      { question: 'Which streaming service created "Stranger Things"?', options: ['Hulu', 'Netflix', 'Disney+', 'Prime Video'], correct: 1 },
      { question: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Rembrandt'], correct: 2 },
      { question: 'What social media platform uses a bird logo?', options: ['Facebook', 'Instagram', 'X (Twitter)', 'TikTok'], correct: 2 },
      { question: 'Which band sang "Bohemian Rhapsody"?', options: ['The Beatles', 'Queen', 'Led Zeppelin', 'The Rolling Stones'], correct: 1 },
      { question: 'What is the most-watched video on YouTube?', options: ['Gangnam Style', 'Despacito', 'Baby Shark', 'See You Again'], correct: 2 },
    ],
    secretPhrases: [
      { phrase: 'BINGE WATCHING', clues: ['Screen time', 'Multiple episodes', 'Netflix activity', 'Couch potato', 'Series marathon', 'Streaming habit'] },
      { phrase: 'VIRAL TREND', clues: ['Internet sensation', 'Social media', 'Going viral', 'Millions of views', 'Everyone talking', 'TikTok famous'] },
      { phrase: 'RED CARPET', clues: ['Celebrity event', 'Fashion show', 'Award ceremony', 'Paparazzi flash', 'Hollywood glamour', 'Designer gowns'] },
    ],
    syncQuestions: [
      { question: 'Streaming or Cable TV?', options: ['Streaming', 'Cable', 'Both', 'Neither'] },
      { question: 'Marvel or DC?', options: ['Marvel', 'DC', 'Both', 'Neither'] },
      { question: 'TikTok or Instagram?', options: ['TikTok', 'Instagram', 'Both', 'Neither'] },
      { question: 'Music or Podcasts?', options: ['Music', 'Podcasts', 'Both', 'Neither'] },
      { question: 'Action or Comedy movies?', options: ['Action', 'Comedy', 'Both', 'Neither'] },
      { question: 'Concert or Movie premiere?', options: ['Concert', 'Movie', 'Both', 'Neither'] },
      { question: 'Reality TV or Documentaries?', options: ['Reality TV', 'Docs', 'Both', 'Neither'] },
    ],
  },
  school: {
    name: 'Your School',
    popQuizQuestions: [
      { question: 'What time do most first period classes start?', options: ['7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM'], correct: 1 },
      { question: 'Which subject has the most homework?', options: ['Math', 'English', 'Science', 'History'], correct: 0 },
      { question: 'Where do people usually eat lunch?', options: ['Cafeteria', 'Quad', 'Library', 'Classrooms'], correct: 0 },
      { question: 'What day is the big rivalry game?', options: ['Monday', 'Wednesday', 'Friday', 'Saturday'], correct: 2 },
      { question: 'Which coffee shop is closest to campus?', options: ['Starbucks', 'Local cafe', 'Dunkin', 'School cafe'], correct: 0 },
      { question: 'How many students are in a typical class?', options: ['15-20', '20-25', '25-30', '30-35'], correct: 2 },
      { question: 'What color is the school mascot?', options: ['Blue', 'Red', 'Green', 'Yellow'], correct: 0 },
      { question: 'Which building was built most recently?', options: ['Science Lab', 'Library', 'Gym', 'Arts Center'], correct: 2 },
    ],
    secretPhrases: [
      { phrase: 'FINALS WEEK', clues: ['Exam period', 'Stress time', 'Study marathon', 'End of semester', 'Late night library', 'Cramming session'] },
      { phrase: 'PEP RALLY', clues: ['School spirit', 'Gym gathering', 'Cheerleaders', 'Team support', 'Loud crowd', 'Friday afternoon'] },
      { phrase: 'STUDY GROUP', clues: ['Classmates meet', 'Homework help', 'Library session', 'Collaborative work', 'Test prep', 'Share notes'] },
    ],
    syncQuestions: [
      { question: 'Morning or Afternoon classes?', options: ['Morning', 'Afternoon', 'Both', 'Neither'] },
      { question: 'Cafeteria or Bring lunch?', options: ['Cafeteria', 'Bring', 'Both', 'Neither'] },
      { question: 'Library or Coffee shop study?', options: ['Library', 'Coffee shop', 'Both', 'Neither'] },
      { question: 'Football or Basketball games?', options: ['Football', 'Basketball', 'Both', 'Neither'] },
      { question: 'Group projects or Solo work?', options: ['Group', 'Solo', 'Both', 'Neither'] },
      { question: 'Campus or Off-campus housing?', options: ['Campus', 'Off-campus', 'Both', 'Neither'] },
      { question: 'Lecture or Discussion sections?', options: ['Lecture', 'Discussion', 'Both', 'Neither'] },
    ],
  },
  'dorm-life': {
    name: 'Dorm Life',
    popQuizQuestions: [
      { question: 'What time is quiet hours?', options: ['9 PM', '10 PM', '11 PM', 'Midnight'], correct: 1 },
      { question: 'Most common midnight snack?', options: ['Pizza', 'Ramen', 'Chips', 'Ice cream'], correct: 1 },
      { question: 'Where do laundry disputes happen most?', options: ['Washers', 'Dryers', 'Folding tables', 'Detergent area'], correct: 1 },
      { question: 'What appliance is always broken?', options: ['Microwave', 'Fridge', 'Toaster', 'Coffee maker'], correct: 0 },
      { question: 'Busiest shower time?', options: ['6 AM', '8 AM', '6 PM', '10 PM'], correct: 1 },
      { question: 'Most forgotten item in common room?', options: ['Phone', 'Keys', 'Wallet', 'Laptop'], correct: 2 },
      { question: 'Which floor is loudest?', options: ['First', 'Second', 'Third', 'Fourth'], correct: 0 },
      { question: 'Best study spot in dorm?', options: ['Common room', 'Own room', 'Lounge', 'Kitchen'], correct: 2 },
    ],
    secretPhrases: [
      { phrase: 'MOVE IN DAY', clues: ['New semester', 'Boxes everywhere', 'Meet roommate', 'Parents helping', 'Elevator wait', 'First day'] },
      { phrase: 'MIDNIGHT SNACK', clues: ['Late night', 'Kitchen raid', 'Hungry time', 'After hours', 'Ramen noodles', 'Quiet eating'] },
      { phrase: 'FIRE DRILL', clues: ['Loud alarm', 'Everyone outside', 'Unexpected wake', 'Building evacuation', '2 AM surprise', 'Safety check'] },
    ],
    syncQuestions: [
      { question: 'Single or Roommate?', options: ['Single', 'Roommate', 'Both', 'Neither'] },
      { question: 'Early bird or Night owl?', options: ['Early bird', 'Night owl', 'Both', 'Neither'] },
      { question: 'Common room or Own room hangout?', options: ['Common', 'Own', 'Both', 'Neither'] },
      { question: 'Meal plan or Cook yourself?', options: ['Meal plan', 'Cook', 'Both', 'Neither'] },
      { question: 'Shower morning or Night?', options: ['Morning', 'Night', 'Both', 'Neither'] },
      { question: 'Study music or Silence?', options: ['Music', 'Silence', 'Both', 'Neither'] },
      { question: 'Door open or Closed?', options: ['Open', 'Closed', 'Both', 'Neither'] },
    ],
  },
  sports: {
    name: 'Sports',
    popQuizQuestions: [
      { question: 'How many players on a basketball team?', options: ['4', '5', '6', '7'], correct: 1 },
      { question: 'What sport uses a puck?', options: ['Soccer', 'Hockey', 'Lacrosse', 'Field hockey'], correct: 1 },
      { question: 'How many points is a touchdown?', options: ['5', '6', '7', '8'], correct: 1 },
      { question: 'Which sport has a "love" score?', options: ['Golf', 'Tennis', 'Badminton', 'Squash'], correct: 1 },
      { question: 'How many innings in baseball?', options: ['7', '8', '9', '10'], correct: 2 },
      { question: 'What color card means ejection in soccer?', options: ['Yellow', 'Red', 'Blue', 'Green'], correct: 1 },
      { question: 'How long is an NBA quarter?', options: ['10 min', '12 min', '15 min', '20 min'], correct: 1 },
      { question: 'What is a birdie in golf?', options: ['-1', '-2', 'Even', '+1'], correct: 0 },
    ],
    secretPhrases: [
      { phrase: 'GAME DAY', clues: ['Competition time', 'Team ready', 'Fans gather', 'Stadium full', 'Kickoff soon', 'Match start'] },
      { phrase: 'OVERTIME THRILLER', clues: ['Extra period', 'Close score', 'Exciting finish', 'Edge of seat', 'Tied game', 'Bonus round'] },
      { phrase: 'CHAMPIONSHIP RUN', clues: ['Playoff push', 'Title chase', 'Final games', 'Trophy hunt', 'Season climax', 'Winner takes all'] },
    ],
    syncQuestions: [
      { question: 'Team or Individual sports?', options: ['Team', 'Individual', 'Both', 'Neither'] },
      { question: 'Watch or Play sports?', options: ['Watch', 'Play', 'Both', 'Neither'] },
      { question: 'Indoor or Outdoor sports?', options: ['Indoor', 'Outdoor', 'Both', 'Neither'] },
      { question: 'Summer or Winter sports?', options: ['Summer', 'Winter', 'Both', 'Neither'] },
      { question: 'Pro or College sports?', options: ['Pro', 'College', 'Both', 'Neither'] },
      { question: 'Home game or Away game?', options: ['Home', 'Away', 'Both', 'Neither'] },
      { question: 'Playoffs or Regular season?', options: ['Playoffs', 'Regular', 'Both', 'Neither'] },
    ],
  },
  food: {
    name: 'Food',
    popQuizQuestions: [
      { question: 'What country invented pizza?', options: ['USA', 'Italy', 'Greece', 'France'], correct: 1 },
      { question: 'Which fruit has seeds on the outside?', options: ['Apple', 'Strawberry', 'Orange', 'Banana'], correct: 1 },
      { question: 'What is the main ingredient in guacamole?', options: ['Tomato', 'Avocado', 'Pepper', 'Onion'], correct: 1 },
      { question: 'Which spice is the most expensive?', options: ['Vanilla', 'Saffron', 'Cardamom', 'Cinnamon'], correct: 1 },
      { question: 'What makes bread rise?', options: ['Sugar', 'Yeast', 'Salt', 'Butter'], correct: 1 },
      { question: 'Which nut is in pesto?', options: ['Almond', 'Cashew', 'Pine nut', 'Walnut'], correct: 2 },
      { question: 'What temperature is medium-rare steak?', options: ['120°F', '135°F', '145°F', '160°F'], correct: 1 },
      { question: 'Which vegetable is technically a fruit?', options: ['Carrot', 'Lettuce', 'Tomato', 'Potato'], correct: 2 },
    ],
    secretPhrases: [
      { phrase: 'FOOD TRUCK', clues: ['Mobile kitchen', 'Street food', 'On wheels', 'Quick lunch', 'Outdoor dining', 'Menu board'] },
      { phrase: 'HAPPY HOUR', clues: ['After work', 'Drink specials', 'Appetizer deals', 'Social time', 'Bar discount', 'Evening start'] },
      { phrase: 'COMFORT FOOD', clues: ['Home cooking', 'Feel good meal', 'Nostalgic dish', 'Warm and filling', 'Mom recipe', 'Soul warming'] },
    ],
    syncQuestions: [
      { question: 'Sweet or Savory?', options: ['Sweet', 'Savory', 'Both', 'Neither'] },
      { question: 'Cook or Delivery?', options: ['Cook', 'Delivery', 'Both', 'Neither'] },
      { question: 'Breakfast or Dinner favorite?', options: ['Breakfast', 'Dinner', 'Both', 'Neither'] },
      { question: 'Spicy or Mild?', options: ['Spicy', 'Mild', 'Both', 'Neither'] },
      { question: 'Restaurant or Home-cooked?', options: ['Restaurant', 'Home', 'Both', 'Neither'] },
      { question: 'Appetizer or Dessert?', options: ['Appetizer', 'Dessert', 'Both', 'Neither'] },
      { question: 'Fast food or Sit-down?', options: ['Fast food', 'Sit-down', 'Both', 'Neither'] },
    ],
  },
};

export const TOPIC_SUGGESTIONS = [
  { id: 'pop-culture', label: 'Pop culture', icon: '🎬' },
  { id: 'school', label: 'Your school', icon: '🎓' },
  { id: 'dorm-life', label: 'Dorm life', icon: '🏠' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'food', label: 'Food', icon: '🍕' },
];

export function selectContentPack(topicInput) {
  if (!topicInput || topicInput.trim() === '') {
    return CONTENT_PACKS.general;
  }

  const input = topicInput.toLowerCase().trim();

  if (input.includes('pop') || input.includes('culture') || input.includes('movie') || input.includes('music') || input.includes('celebrity')) {
    return CONTENT_PACKS['pop-culture'];
  }
  if (input.includes('school') || input.includes('class') || input.includes('campus') || input.includes('college') || input.includes('university')) {
    return CONTENT_PACKS.school;
  }
  if (input.includes('dorm') || input.includes('roommate') || input.includes('residence')) {
    return CONTENT_PACKS['dorm-life'];
  }
  if (input.includes('sport') || input.includes('game') || input.includes('team') || input.includes('football') || input.includes('basketball')) {
    return CONTENT_PACKS.sports;
  }
  if (input.includes('food') || input.includes('restaurant') || input.includes('cooking') || input.includes('dining')) {
    return CONTENT_PACKS.food;
  }

  return CONTENT_PACKS.general;
}
