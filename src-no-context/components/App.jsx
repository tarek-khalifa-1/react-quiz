import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import Button from "./Button";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";

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

const SECS_PER_QUESTION = 30;

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

export default function App() {
  const [
    { questions, status, index, answer, score, highScore, timeRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;

  const maxPossibleScore = questions.reduce(
    (prev, cur) => prev + cur.points,
    0,
  );

  useEffect(() => {
    async function fetchQuestions() {
      try {
        // const res = await fetch("http://localhost:8000/questions");

        // JSON FROM GITHUB
        const res = await fetch(
          "https://raw.githubusercontent.com/tarek-khalifa-1/react-quiz/refs/heads/main/data/questions.json",
        );
        if (!res.ok) throw new Error("failed to fetch questions");
        const data = await res.json();
        dispatch({
          type: "dataReceived",
          payload: data.questions.slice(0),
        });
      } catch (error) {
        dispatch({ type: "dataFailed" });
      }
    }

    fetchQuestions();
  }, []);

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              answer={answer}
              score={score}
              maxPossibleScore={maxPossibleScore}
            />
            <Question
              question={questions[index]}
              answer={answer}
              dispatch={dispatch}
            />
            <Footer>
              <Timer dispatch={dispatch} timeRemaining={timeRemaining} />
              <Button
                answer={answer}
                dispatch={dispatch}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </>
        )}

        {status === "finished" && (
          <FinishScreen
            score={score}
            maxPossibleScore={maxPossibleScore}
            highScore={highScore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}
