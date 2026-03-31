import { createContext, useContext, useEffect, useReducer } from "react";

const QuizContext = createContext();

const BASE_URL = "https://69cb2d280b417a19e07a5344.mockapi.io/v1";
const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  // loading, error, ready, active, finished
  status: "loading",
  index: 0,
  answer: null,
  score: 0,
  highScore: 0,
  // time in seconds
  timeRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };

    case "dataFailed":
      return { ...state, status: "error" };

    case "start":
      return {
        ...state,
        status: "active",
        timeRemaining: state.questions.length * SECS_PER_QUESTION,
      };

    case "newAnswer":
      // eslint-disable-next-line no-case-declarations
      const question = state.questions[state.index];
      return {
        ...state,
        answer: action.payload,
        score:
          question.correctOption === action.payload
            ? state.score + question.points
            : state.score,
      };

    case "nextQuestion":
      return { ...state, index: state.index++, answer: null };
    case "finished":
      return {
        ...state,
        status: "finished",
        highScore:
          state.score > state.highScore ? state.score : state.highScore,
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
        highScore: state.highScore,
      };
    case "tick":
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
        status: state.timeRemaining === 0 ? "finished" : state.status,
      };

    default:
      throw new Error("Action Unkown");
  }
}

function QuizProvider({ children }) {
  const [
    { questions, status, index, answer, score, highScore, timeRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`${BASE_URL}/questions`);
        if (!res.ok) throw new Error("failed to fetch questions");
        const data = await res.json();
        dispatch({
          type: "dataReceived",
          payload: data.slice(0),
        });
      } catch (error) {
        dispatch({ type: "dataFailed" });
      }
    }

    fetchQuestions();
  }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        status,
        index,
        answer,
        score,
        highScore,
        timeRemaining,
        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const value = useContext(QuizContext);
  if (value === undefined) throw new Error("Used context outside Provider");
  return value;
}

export { QuizProvider, useQuiz };
