import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyAvp2PMN4F81IqCYiTe9Ap9uW0eZks8d0U';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: 'user',
      parts: [
        {
          text: 'I am providing answers from a student’s recent quiz. After reviewing the responses, please return a JSON object that includes:\npoints_forts: Highlights where the student performed well.\ndomaines_d_amélioration: Identifies areas where the student can improve.\nrecommandations: Provides actionable suggestions for improvement, such as study resources or exercises.\nThe feedback should be in French and concise enough for a student to easily understand and use for improvement.\nstudent responese:\n[\n  {\n    question: "What is JSX in React?",\n    student_answer: "A type of JavaScript",\n    right_answer: "A syntax extension for JavaScript"\n  },\n  {\n    question: "What is the purpose of `useState` in React?",\n    student_answer: "To handle component rendering",\n    right_answer: "To manage state in a functional component"\n  },\n  {\n    question: "What is a React component?",\n    student_answer: "A function that returns HTML",\n    right_answer: "A function or class that returns JSX and manages UI logic"\n  }\n];\n',
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: '```json\n{\n  "points_forts": [\n    "Vous comprenez les concepts de base de React, comme l\'idée d\'un composant et sa fonction de retour."\n  ],\n  "domaines_d_amélioration": [\n    "Précision des définitions: Vos réponses sont proches de la vérité mais manquent de précision.",\n    "Compréhension de JSX:  Il est important de comprendre que JSX n\'est pas simplement du JavaScript, mais une extension de syntaxe." ,\n    "Rôle de useState:  Votre réponse sur useState est incomplète; il gère plus que le rendu, il gère l\'état du composant."\n  ],\n  "recommandations": [\n    "Relisez la documentation officielle de React sur les concepts de JSX, `useState` et les composants.",\n    "Pratiquez la création de composants React simples en utilisant `useState` pour gérer l\'état.",\n    "Essayez de résoudre des exercices pratiques sur les sites web comme Codewars, HackerRank ou freeCodeCamp pour consolider vos connaissances.",\n    "Consultez des tutoriels vidéo sur YouTube ou des cours en ligne (ex: Udemy, Coursera) pour une explication plus approfondie."\n  ]\n}\n```\n',
        },
      ],
    },
  ],
});
