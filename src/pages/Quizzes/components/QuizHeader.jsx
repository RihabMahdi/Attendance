import React from 'react';

const QuizHeader = ({ competence, quizId, Deadline }) => (
  <div className="card bg-base-200 shadow-xl mb-8">
    <div className="card-body">
      {/* Display competence */}
      {competence && <p className="text-sm opacity-70">competence: {competence}</p>}

      <div className="flex flex-col gap-1">
        <p className="text-sm opacity-70">Quiz ID: {quizId}</p>
        <p className="text-sm opacity-70">Due: {new Date(Deadline).toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);

export default QuizHeader;
