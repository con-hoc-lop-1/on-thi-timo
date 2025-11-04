import React, { useEffect, useState } from "react";
import { formatTime, loadAllQuestions } from "./utils";
import { renderFigure } from "./figure";

function Exam({
  name,
  onFinish,
  paperMode,
  dataType = "preliminary",
  isDebug = false,
}) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    (dataType === "preliminary" ? 60 : 90) * 60
  );
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [startDate] = useState(new Date().toLocaleString());
  const showVi = (function () {
    const saved = JSON.parse(localStorage.getItem("timo-show-vi") || "false");
    if (isDebug) return true; // Luôn hiển thị cả tiếng Việt trong chế độ debug
    return dataType === "preliminary" ? saved : false;
  })();

  useEffect(() => {
    loadAllQuestions(
      [
        "arithmetic",
        "combinatorics",
        "geometry",
        "logic-thinking",
        "number-theory",
      ],
      isDebug ? 5000 : 5,
      !isDebug,
      dataType
    ).then(setQuestions);
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
  }, [dataType]);

  useEffect(() => {
    document.title = `${name} - TIMO TEST (${startDate})`;
  }, [startDate]);

  const handleAnswer = (val) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], userAnswer: val };
    setQuestions(updated);
  };

  // Debug editors: update stem.en and choices[i].en
  const handleStemChange = (qIndex, newEn) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      next[qIndex] = { ...q, stem: { ...(q.stem || {}), en: newEn } };
      return next;
    });
  };

  // Debug editors: update stem.vi
  const handleStemViChange = (qIndex, newVi) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      next[qIndex] = { ...q, stem: { ...(q.stem || {}), vi: newVi } };
      return next;
    });
  };

  const handleChoiceTextChange = (qIndex, choiceIndex, newEn) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex];
      if (!q) return prev;
      const choices = (q.choices || []).map((c, i) =>
        i === choiceIndex ? { ...c, en: newEn } : c
      );
      next[qIndex] = { ...q, choices };
      return next;
    });
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

  const copyQuestion = (q) => {
    try {
      const txt = JSON.stringify(q, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(() => {
          alert("Đã chép nội dung câu hỏi vào clipboard.");
        });
      } else {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("Đã chép nội dung câu hỏi vào clipboard.");
      }
    } catch (e) {
      console.error(e);
      alert("Không thể chép nội dung câu hỏi");
    }
  };

  // 📄 Chế độ giấy trắc nghiệm
  if (paperMode) {
    return (
      <div className="container-fluid mt-4 paper-mode">
        <h3 className="m-3">
          {name} - TIMO TEST ({startDate})
        </h3>
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="mb-3 border rounded p-3 bg-light paper-question"
          >
            <div className="mb-2">
              <div className="question-title d-flex justify-content-between align-items-center">
                <strong>
                  Question {qi + 1} {showVi && <i>(Câu {qi + 1})</i>}:{" "}
                  {isDebug && q.id && (
                    <span className="badge bg-secondary ms-2">ID: {q.id}</span>
                  )}
                </strong>
                <span className="ms-2">
                  {name} - TIMO TEST ({startDate})
                </span>
                {isDebug && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => copyQuestion(q)}
                    title="Chép JSON câu hỏi"
                  >
                    CHÉP
                  </button>
                )}
              </div>
              {isDebug ? (
                <div className="mb-2">
                  <label className="form-label">stem.en</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={(q.stem && q.stem.en) || ""}
                    onChange={(e) => handleStemChange(qi, e.target.value)}
                  />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
              )}
              {showVi &&
                (isDebug ? (
                  <div className="mb-2">
                    <label className="form-label">stem.vi</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={(q.stem && q.stem.vi) || ""}
                      onChange={(e) => handleStemViChange(qi, e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    style={{ fontStyle: "italic" }}
                    dangerouslySetInnerHTML={{ __html: q.stem.vi }}
                  />
                ))}
              <div className="figure-container">{renderFigure(q)}</div>
            </div>
            <div className="mt-2">
              <div className="row">
                {q.choices.map((choice, i) => {
                  const isRightAnswer = q.answer && q.answer.key === choice.id;
                  const rightStyle =
                    isDebug && isRightAnswer
                      ? { backgroundColor: "#e6ffed" }
                      : {};
                  return (
                    <div
                      className="col-12 col-md-3 mb-2"
                      key={i}
                      style={rightStyle}
                    >
                      {isDebug ? (
                        <div className="d-flex align-items-center">
                          <b style={{ color: "gray", width: 24 }}>
                            {choice.id}.
                          </b>
                          <input
                            type="text"
                            className="form-control ms-2"
                            value={choice.en || ""}
                            onChange={(e) =>
                              handleChoiceTextChange(qi, i, e.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <label className="form-check-label">
                          <b style={{ color: "gray" }}>{choice.id}.</b>{" "}
                          {choice.en}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Trang riêng cho đáp án */}
        <div className="answer-sheet">
          {!isDebug ? (
            <div className="blank-page">
              <div className="info-box">
                <h4 className="mb-3">
                  {name} - TIMO TEST ({startDate})
                </h4>
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td>Full name:</td>
                      <td>DOB:</td>
                    </tr>
                    <tr>
                      <td>School name:</td>
                      <td>Class:</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="question-grid">
                {[...Array(25)].map((_, i) => (
                  <div className="question" key={i}>
                    <div>{i + 1}</div>
                    <div className="choices">
                      <div className="choice">
                        A<div className="box"></div>
                      </div>
                      <div className="choice">
                        B<div className="box"></div>
                      </div>
                      <div className="choice">
                        C<div className="box"></div>
                      </div>
                      <div className="choice">
                        D<div className="box"></div>
                      </div>
                      <div className="choice">
                        E<div className="box"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            ""
          )}
          <hr />
          <h3 className="mt-2">
            Answer <i>(Đáp án)</i>
          </h3>
          <h6>
            {name} - TIMO TEST ({startDate})
          </h6>
          <div className="answer-grid">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="answer-item border rounded me-2 ms-2 mb-1 p-2 bg-light"
              >
                <span className="top-left">{qi + 1}</span>
                <strong>{q.answer ? q.answer.key : ""}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 📄 Trang kết quả online
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
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <div>
                  <strong>
                    Question {qi + 1} {showVi && <i>(Câu {qi + 1})</i>}:{" "}
                    {isDebug && q.id && (
                      <span className="badge bg-secondary ms-2">
                        ID: {q.id}
                      </span>
                    )}
                  </strong>
                </div>
                {isDebug && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => copyQuestion(q)}
                    title="Chép JSON câu hỏi"
                  >
                    CHÉP
                  </button>
                )}
              </div>
              {isDebug ? (
                <div className="mb-2">
                  <label className="form-label">stem.en</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={(q.stem && q.stem.en) || ""}
                    onChange={(e) => handleStemChange(qi, e.target.value)}
                  />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
              )}
              {showVi &&
                (isDebug ? (
                  <div className="mb-2">
                    <label className="form-label">stem.vi</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={(q.stem && q.stem.vi) || ""}
                      onChange={(e) => handleStemViChange(qi, e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    style={{ fontStyle: "italic" }}
                    dangerouslySetInnerHTML={{ __html: q.stem.vi }}
                  />
                ))}
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

                    const rightStyle =
                      isDebug && isRightAnswer
                        ? { backgroundColor: "#e6ffed" }
                        : {};

                    return (
                      <div
                        className="form-check p-2 rounded"
                        key={i}
                        style={rightStyle}
                      >
                        <input
                          type="radio"
                          disabled
                          className="form-check-input"
                          checked={chosen}
                          readOnly
                        />
                        <label
                          {...answeredAttr}
                          className={labelClass + " me-2"}
                        >
                          <span>{choice.id}.</span>
                          <span className="form-check-label"> {choice.en}</span>
                        </label>
                        {isDebug ? (
                          <input
                            type="text"
                            className="form-control d-inline-block"
                            style={{ width: "auto", minWidth: 200 }}
                            value={choice.en || ""}
                            onChange={(e) =>
                              handleChoiceTextChange(qi, i, e.target.value)
                            }
                          />
                        ) : (
                          ""
                        )}
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

  // 📄 Giao diện làm bài online
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

      <div className="mb-2 d-flex justify-content-between align-items-center">
        <div>
          <strong>
            Question {index + 1} {showVi && <i>(Câu {index + 1})</i>}:{" "}
            {isDebug && q.id && (
              <span className="badge bg-secondary ms-2">ID: {q.id}</span>
            )}
          </strong>
        </div>
        {isDebug && (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => copyQuestion(q)}
            title="Chép JSON câu hỏi"
          >
            CHÉP
          </button>
        )}
      </div>
      <div className="border rounded p-3 bg-light mb-3">
        {isDebug ? (
          <div className="mb-2">
            <label className="form-label">stem.en</label>
            <textarea
              className="form-control"
              rows={3}
              value={(q.stem && q.stem.en) || ""}
              onChange={(e) => handleStemChange(index, e.target.value)}
            />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
        )}
        {showVi &&
          (isDebug ? (
            <div className="mb-2">
              <label className="form-label">stem.vi</label>
              <textarea
                className="form-control"
                rows={3}
                value={(q.stem && q.stem.vi) || ""}
                onChange={(e) => handleStemViChange(index, e.target.value)}
              />
            </div>
          ) : (
            <div
              style={{ fontStyle: "italic" }}
              dangerouslySetInnerHTML={{ __html: q.stem.vi }}
            />
          ))}
        {renderFigure(q)}
      </div>

      <div className="mb-4">
        {q.choices && q.choices.length > 0 ? (
          <div>
            {q.choices.map((choice, i) => {
              const isRightAnswer = q.answer && q.answer.key === choice.id;
              const rightStyle =
                isDebug && isRightAnswer ? { backgroundColor: "#e6ffed" } : {};
              return (
                <div
                  className="form-check p-2 rounded"
                  key={i}
                  style={rightStyle}
                >
                  <input
                    name={`q-${q.id}`}
                    type="radio"
                    id={`q-${q.id}-choice-${i}`}
                    className="form-check-input"
                    value={choice.id}
                    checked={q.userAnswer === choice.id}
                    onChange={() => handleAnswer(choice.id)}
                  />
                  <label
                    htmlFor={`q-${q.id}-choice-${i}`}
                    className="ms-1 me-2"
                  >
                    <span className="form-check-label">{choice.id}.</span>
                    <span className="form-check-label">{choice.en}</span>
                  </label>
                  {isDebug ? (
                    <input
                      type="text"
                      className="form-control d-inline-block"
                      style={{ width: "auto", minWidth: 200 }}
                      value={choice.en || ""}
                      onChange={(e) =>
                        handleChoiceTextChange(index, i, e.target.value)
                      }
                    />
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
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
