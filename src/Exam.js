import React, { useEffect, useState } from "react";
import { formatTime, loadAllQuestions } from "./utils";
import { renderFigure } from "./figure";

function Exam({ name, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const showVi = JSON.parse(localStorage.getItem("timo-show-vi") || "false");
  useEffect(() => {
    // loadAllQuestions().then(setQuestions);
    loadAllQuestions(["logic-thinking"], 50, false).then(setQuestions);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (val) => {
    const updated = [...questions];
    updated[index].userAnswer = val;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(
      (q) => !q.userAnswer || q.userAnswer === ""
    ).length;
    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `⚠️ Còn ${unanswered} câu chưa chọn đáp án. Bạn có chắc muốn nộp bài không?`
      );
      if (!confirmSubmit) return;
    }

    const correctCount = questions.filter(
      (q) => q.answer && q.answer.key === q.userAnswer
    ).length;
    const score = correctCount * 4;
    const spentSeconds = Math.floor((Date.now() - startTime) / 1000);

    const historyItem = {
      name,
      correct: correctCount,
      total: questions.length,
      score,
      spent: formatTime(spentSeconds),
      time: new Date().toLocaleString(),
    };

    setResult(historyItem);
    onFinish(historyItem, true);
    setFinished(true);
  };

  if (finished && result && !reviewMode) {
    return (
      <div className="container mt-5 text-center">
        <h3>Kết quả</h3>
        <p>
          ✅ Correct {showVi && <i>(Đúng)</i>}: <b>{result.correct}</b> /{" "}
          {result.total}
        </p>
        <p>
          ❌ Incorrect {showVi && <i>(Sai)</i>}:{" "}
          <b>{result.total - result.correct}</b>
        </p>
        <p>
          🎯 Points {showVi && <i>(Điểm)</i>}: <b>{result.score}</b> / 100
        </p>
        <p>
          ⏱️ Testing time {showVi && <i>(Thời gian làm)</i>}: {result.spent}
        </p>
        <div className="mt-4">
          <button
            className="btn btn-primary me-3"
            onClick={() => setReviewMode(true)}
          >
            Review your test {showVi && <i>(Xem lại bài)</i>}
          </button>
          <button className="btn btn-success" onClick={() => onFinish(null)}>
            Go home {showVi && <i>(Về trang chủ)</i>}
          </button>
        </div>
      </div>
    );
  }

  if (finished && reviewMode) {
    return (
      <div className="container mt-5 question review">
        <h3 className="mb-4">
          Review your test {showVi && <i>(Xem lại bài)</i>}
        </h3>
        {questions.map((q, qi) => {
          const isCorrect = q.answer && q.answer.key === q.userAnswer;
          return (
            <div key={qi} className="mb-4 border rounded p-3 bg-light">
              <div className="mb-2">
                <strong>
                  Question {qi + 1} {showVi && <i>(Câu {qi + 1})</i>}:
                </strong>
                <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
                {showVi && (
                  <div
                    style={{ fontStyle: "italic" }}
                    dangerouslySetInnerHTML={{ __html: q.stem.vi }}
                  />
                )}
              </div>
              {renderFigure(q)}
              <div className="mt-2">
                {q.choices &&
                  q.choices.map((choice, i) => {
                    const chosen = q.userAnswer === choice.id;
                    const isRightAnswer =
                      q.answer && q.answer.key === choice.id;

                    let answeredAttr = {};
                    let labelClass = "form-check-label";

                    if (chosen && isCorrect) {
                      answeredAttr = { answered: "true" };
                      labelClass += " text-success fw-bold";
                    } else if (chosen && !isCorrect) {
                      answeredAttr = { answered: "false" };
                      labelClass += " text-danger fw-bold";
                    } else if (!chosen && !isCorrect && isRightAnswer) {
                      labelClass += " text-success fw-bold";
                    }

                    return (
                      <div className="form-check" key={i}>
                        <input
                          type="radio"
                          disabled
                          className="form-check-input"
                          checked={chosen}
                          readOnly
                        />
                        <label {...answeredAttr} className={labelClass}>
                          <span>{choice.id}.</span> <span>{choice.en}</span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
        <button
          className="btn btn-success mt-3 mb-5"
          onClick={() => onFinish(null)}
        >
          Go home {showVi && <i>(Về trang chủ)</i>}
        </button>
      </div>
    );
  }

  // Giao diện làm bài
  const q = questions[index];
  return questions.length === 0 ? (
    <p>Loading...</p>
  ) : (
    <div className="container mt-5 question">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">
          🧠 <strong>{q.type}</strong>
        </h4>
        <div className="d-flex justify-content-between">
          <span className="badge bg-warning text-dark me-2 fs-5">
            ⏰ {formatTime(secondsLeft)}
          </span>
          <button className="btn btn-danger" onClick={handleSubmit}>
            Finish Test {showVi && <i>(Nộp bài)</i>}
          </button>
        </div>
      </div>

      <div className="mb-2">
        <strong>
          Question {index + 1} {showVi && <i>(Câu {index + 1})</i>}:
        </strong>
      </div>
      <div className="border rounded p-3 bg-light mb-3">
        <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
        {showVi && (
          <div
            style={{ fontStyle: "italic" }}
            dangerouslySetInnerHTML={{ __html: q.stem.vi }}
          />
        )}
        {renderFigure(q)}
      </div>

      <div className="mb-4">
        {q.choices && q.choices.length > 0 ? (
          <div>
            {q.choices.map((choice, i) => (
              <div className="form-check" key={i}>
                <input
                  name={`q-${q.id}`}
                  type="radio"
                  id={`q-${q.id}-choice-${i}`}
                  className="form-check-input"
                  value={choice.id}
                  checked={q.userAnswer === choice.id}
                  onChange={() => handleAnswer(choice.id)}
                />
                <label htmlFor={`q-${q.id}-choice-${i}`}>
                  <span className="form-check-label">{choice.id}.</span>{" "}
                  <span className="form-check-label">{choice.en}</span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <input
            type="text"
            className="form-control"
            placeholder="Nhập đáp án"
            value={q.userAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}
      </div>
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-secondary btn-lg"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          ◀ Back {showVi && <i>(Trước)</i>}
        </button>
        <button
          className="btn btn-primary btn-lg"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next ▶ {showVi && <i>(Tiếp)</i>}
        </button>
      </div>
    </div>
  );
}

export default Exam;
