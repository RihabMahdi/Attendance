import { createSelector, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../api/config';

const initialState = {
  quizzes: [],
  questions: {},
  modules: [],
  competences: [],
  status: 'idle',
  error: null,
};

export const selectModulesData = (state) => state.modules?.modules || [];
export const selectMemoizedModules = createSelector([selectModulesData], (modulesData) =>
  modulesData.map((module) => ({
    moduleId: module.courseId,
    moduleName: module.courseName,
  }))
);
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get('/quizzes');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addQuiz = createAsyncThunk('quizzes/addQuiz', async (quiz, { rejectWithValue }) => {
  try {
    const response = await apiService.post('/quizzes', quiz);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateQuiz = createAsyncThunk(
  'quizzes/updateQuiz',
  async (quiz, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/quizzes/${quiz.id}`, quiz);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/deleteQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      await apiService.delete(`/quizzes/${quizId}`);
      return quizId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  'quiz/fetchQuestions',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addQuestion = createAsyncThunk(
  'quizzes/addQuestion',
  async ({ quizId, question }, { rejectWithValue }) => {
    try {
      const quizResponse = await apiService.get(`/quizzes/${quizId}`);
      const quiz = quizResponse.data;
      const newQuestion = {
        ...question,
        id: Date.now().toString(),
      };

      if (!quiz.questions) {
        quiz.questions = [];
      }
      quiz.questions.push(newQuestion);

      await apiService.put(`/quizzes/${quizId}`, quiz);
      return { quizId, question: newQuestion };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Add this action along with your other createAsyncThunk actions

export const deleteAllQuestions = createAsyncThunk(
  'quizzes/deleteAllQuestions',
  async ({ quizId, questionIds }, { rejectWithValue }) => {
    try {
      const quizResponse = await apiService.get(`/quizzes/${quizId}`);
      const quiz = quizResponse.data;

      // Filter out questions with the specified IDs
      quiz.questions = quiz.questions.filter((q) => !questionIds.includes(q.id));

      await apiService.put(`/quizzes/${quizId}`, quiz);
      return { quizId, questionIds };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const deleteQuestion = createAsyncThunk(
  'quizzes/deleteQuestion',
  async ({ quizId, questionId }, { rejectWithValue }) => {
    try {
      const quizResponse = await apiService.get(`/quizzes/${quizId}`);
      const quiz = quizResponse.data;

      // Filter out the question with the specific ID
      quiz.questions = quiz.questions.filter((q) => q.id !== questionId);

      await apiService.put(`/quizzes/${quizId}`, quiz);
      return { quizId, questionId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// src/features/quizzes/quizzesSlice.js
// Add this with your other createAsyncThunk actions

// src/features/quizzes/quizzesSlice.js
export const fetchModules = createAsyncThunk('quizzes/fetchModules', async () => {
  const response = await fetch('/api/modules'); // adjust the API endpoint as needed
  const data = await response.json();
  return data.modules; // matches your API response structure
});

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState: {
    quizzes: [],
    questions: [],
    questionAnswers: [],
    competences: [],
    modules: {
      modules: [],
    },
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateQuestionAnswers: (state, action) => {
      state.questionAnswers = action.payload;
    },
    clearQuestionAnswers: (state) => {
      state.questionAnswers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.modules = {
          modules: action.payload,
        };
        state.status = 'succeeded';
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        const { quizId, questionId } = action.payload;
        if (Array.isArray(state.questions[quizId])) {
          state.questions[quizId] = state.questions[quizId].filter((q) => q.id !== questionId);
        }
      })
      // Also add the case to your extraReducers in the slice:
      .addCase(deleteAllQuestions.fulfilled, (state, action) => {
        const { quizId, questionIds } = action.payload;
        if (Array.isArray(state.questions[quizId])) {
          state.questions[quizId] = state.questions[quizId].filter(
            (q) => !questionIds.includes(q.id)
          );
        }
      })
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        if (action.payload && action.payload.id) {
          // Add null check
          const index = state.quizzes.findIndex((quiz) => quiz.id === action.payload.id);
          if (index !== -1) {
            state.quizzes[index] = action.payload;
          }
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((quiz) => quiz.id !== action.payload);
      })

      .addCase(addQuestion.fulfilled, (state, action) => {
        if (!state.questions[action.payload.quizId]) {
          state.questions[action.payload.quizId] = [];
        }
        state.questions[action.payload.quizId].push(action.payload.question);
      })
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateQuestionAnswers, clearQuestionAnswers } = quizzesSlice.actions;
export default quizzesSlice.reducer;
