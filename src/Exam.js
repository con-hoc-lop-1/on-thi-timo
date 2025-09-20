import React, { useEffect, useState } from "react";
import { formatTime, loadAllQuestions } from "./utils";
import { renderFigure } from "./figure";

function Exam({ name, mode, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    mode === "heat" ? 90 * 60 : 60 * 60
  );

  useEffect(() => {
    // loadAllQuestions().then(setQuestions);
    loadAllQuestions(["number-theory"], 50, false).then(setQuestions);
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

    const correct = questions.filter((q) => q.answer === q.userAnswer).length;
    const history = JSON.parse(localStorage.getItem("timo-history") || "[]");
    history.unshift({
      name,
      mode,
      score: correct * 5,
      duration: (mode === "heat" ? 90 : 60) * 60 - secondsLeft,
      timestamp: Date.now(),
    });
    localStorage.setItem("timo-history", JSON.stringify(history.slice(0, 20)));
    onFinish();
  };

  const q = questions[index];

  return questions.length === 0 ? (
    <p>Đang tải đề...</p>
  ) : (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">
          🧠 Đề thi <b>{mode}</b> - Phần <strong>{q.type}</strong>
        </h4>
        <div className="d-flex justify-content-between">
          <span className="badge bg-warning text-dark me-2 fs-5">
            ⏰ {formatTime(secondsLeft)}
          </span>
          <button className="btn btn-danger" onClick={handleSubmit}>
            Nộp bài
          </button>
        </div>
      </div>

      <div className="mb-2">
        <strong>Câu {index + 1}:</strong>
      </div>
      <div className="border rounded p-3 bg-light mb-3">
        <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
        {mode === "preliminary" ? (
          <div
            style={{ fontStyle: "italic" }}
            dangerouslySetInnerHTML={{ __html: q.stem.vi }}
          />
        ) : (
          ""
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
                  <span className="form-check-label">{choice.id}.</span>
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
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          ◀ Trước
        </button>
        <button
          className="btn btn-primary"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Tiếp ▶
        </button>
      </div>
    </div>
  );
}

export default Exam;
