import { useEffect } from "react";

function Timer({ timeRemaining, dispatch }) {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [dispatch]);

  return (
    <div className="timer">
      {mins <= 10 ? `0${mins}` : mins}:{secs < 10 ? `0${secs}` : secs}
    </div>
  );
}

export default Timer;
