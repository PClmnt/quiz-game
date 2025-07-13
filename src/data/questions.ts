import { Round } from '@/types/quiz';

export const generalKnowledgeQuestions: Round = {
  id: '1',
  name: 'General Knowledge',
  type: 'general',
  questions: [
    {
      id: '1',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      type: 'general'
    },
    {
      id: '2',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      type: 'general'
    },
    {
      id: '3',
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
      correctAnswer: 2,
      type: 'general'
    },
    {
      id: '4',
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
      type: 'general'
    },
    {
      id: '5',
      question: 'In which year did World War II end?',
      options: ['1944', '1945', '1946', '1947'],
      correctAnswer: 1,
      type: 'general'
    },
    {
      id: '6',
      question: 'What is the chemical symbol for gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctAnswer: 2,
      type: 'general'
    },
    {
      id: '7',
      question: 'Which country is home to Machu Picchu?',
      options: ['Bolivia', 'Ecuador', 'Peru', 'Colombia'],
      correctAnswer: 2,
      type: 'general'
    },
    {
      id: '8',
      question: 'What is the smallest prime number?',
      options: ['0', '1', '2', '3'],
      correctAnswer: 2,
      type: 'general'
    }
  ]
};

export const logoQuestions: Round = {
  id: '2',
  name: 'Logo Round',
  type: 'logo',
  questions: [
    {
      id: '9',
      question: 'Which company uses this bitten apple logo?',
      options: ['Microsoft', 'Apple', 'Google', 'Samsung'],
      correctAnswer: 1,
      type: 'logo',
      mediaUrl: '🍎'
    },
    {
      id: '10',
      question: 'Which social media platform uses this blue bird logo?',
      options: ['Facebook', 'Instagram', 'Twitter/X', 'LinkedIn'],
      correctAnswer: 2,
      type: 'logo',
      mediaUrl: '🐦'
    },
    {
      id: '11',
      question: 'Which fast food chain uses golden arches?',
      options: ['Burger King', 'McDonald\'s', 'KFC', 'Subway'],
      correctAnswer: 1,
      type: 'logo',
      mediaUrl: '🍟'
    },
    {
      id: '12',
      question: 'Which streaming service uses this red N logo?',
      options: ['Hulu', 'Netflix', 'Amazon Prime', 'Disney+'],
      correctAnswer: 1,
      type: 'logo',
      mediaUrl: '🎬'
    }
  ]
};

export const soundQuestions: Round = {
  id: '3',
  name: 'Sound Round',
  type: 'sound',
  questions: [
    {
      id: '13',
      question: 'Which instrument makes this sound?',
      options: ['Piano', 'Guitar', 'Violin', 'Drums'],
      correctAnswer: 0,
      type: 'sound',
      mediaUrl: '🎹'
    },
    {
      id: '14',
      question: 'What animal makes this sound?',
      options: ['Dog', 'Cat', 'Cow', 'Horse'],
      correctAnswer: 2,
      type: 'sound',
      mediaUrl: '🐄'
    },
    {
      id: '15',
      question: 'Which vehicle makes this sound?',
      options: ['Car', 'Train', 'Airplane', 'Motorcycle'],
      correctAnswer: 1,
      type: 'sound',
      mediaUrl: '🚂'
    }
  ]
};

export const allRounds: Round[] = [
  generalKnowledgeQuestions,
  logoQuestions,
  soundQuestions
];