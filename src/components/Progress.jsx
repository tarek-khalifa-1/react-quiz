function Progress({ index, numQuestions, score, maxPossibleScore, answer }) {
  return (
    <>
      <header className="progress">
        <progress
          value={index + Number(answer !== null)}
          max={numQuestions}
        ></progress>
        <p>
          Question <strong>{index + 1}</strong> / {numQuestions}
        </p>
        <p>
          <strong>{score}</strong> points / {maxPossibleScore}
        </p>
      </header>
    </>
  );
}

export default Progress;
