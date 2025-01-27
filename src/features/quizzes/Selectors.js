// src/features/quizzes/selectors.js
import { createSelector } from '@reduxjs/toolkit';

// Base selector for quizzes state
const selectQuizzesState = (state) => state.quizzes;

// Select all quizzes
export const selectAllQuizzes = createSelector(
  [selectQuizzesState],
  (quizzesState) => quizzesState.quizzes
);

// Select loading status
export const selectQuizzesStatus = createSelector(
  [selectQuizzesState],
  (quizzesState) => quizzesState.status
);

// Select error state
export const selectQuizzesError = createSelector(
  [selectQuizzesState],
  (quizzesState) => quizzesState.error
);

// Select questions for a specific quiz
export const selectQuizQuestions = createSelector(
  [selectQuizzesState, (state, quizId) => quizId],
  (quizzesState, quizId) => quizzesState.questions[quizId] || []
);

// Select modules
export const selectModules = createSelector(
  [selectQuizzesState],
  (quizzesState) => quizzesState.modules
);
