import React, { useState } from "react";
import Exam from "./Exam";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";

function App() {
  const [name, setName] = useState(
    localStorage.getItem("timo-user-name") || ""
  );
  const [isStarted, setIsStarted] = useState(false);
  const [paperMode, setPaperMode] = useState(false);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("timo-history") || "[]")
  );
  const [showVi, setShowVi] = useState(
    JSON.parse(localStorage.getItem("timo-show-vi") || "false")
  );

  const handleStart = () => {
    if (!name.trim()) return alert("Vui lòng nhập tên");
    localStorage.setItem("timo-user-name", name.trim());
    setIsStarted(true);
  };

  const handleFinish = (result, isStarted = false) => {
    if (result) {
      const newHistory = [result, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("timo-history", JSON.stringify(newHistory));
    }
    if (!isStarted) setIsStarted(false);
  };

  if (isStarted)
    return <Exam name={name} paperMode={paperMode} onFinish={handleFinish} />;

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <h1 className="text-center mb-4">TIMO 1</h1>
      <div className="mb-3">
        <label className="form-label">
          Your name <i>(Nhập tên học sinh)</i>:
        </label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">
          Question language <i>(Tùy chọn đề bài)</i>:
        </label>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            disabled={true}
            id="showEn"
            checked={true}
          />
          <label className="form-check-label" htmlFor="showVi">
            English
          </label>
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="showVi"
            checked={showVi}
            onChange={(e) => {
              setShowVi(e.target.checked);
              localStorage.setItem(
                "timo-show-vi",
                JSON.stringify(e.target.checked)
              );
            }}
          />
          <label className="form-check-label" htmlFor="showVi">
            Tiếng Việt
          </label>
        </div>
      </div>
      <hr />
      <div className="mb-4">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="paperMode"
            checked={paperMode}
            onChange={(e) => setPaperMode(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="paperMode">
            Test with paper <i>(Làm bằng giấy trắc nghiệm)</i>
          </label>
        </div>
      </div>
      <button className="btn btn-primary w-100" onClick={handleStart}>
        {paperMode ? "PRINT (IN RA GIẤY)" : "STARTING TEST (LÀM BÀI)"}
      </button>

      {history.length > 0 && (
        <div className="mt-4">
          <h5>
            History <i>(Lịch sử làm bài)</i>
          </h5>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>
                  Name
                  <br />
                  <i>(Tên thí sinh)</i>
                </th>
                <th>
                  Corrects / Total
                  <br />
                  <i>(Số câu đúng)</i>
                </th>
                <th>
                  Points
                  <br />
                  <i>(Điểm)</i>
                </th>
                <th>
                  Testing time
                  <br />
                  <i>(Thời gian làm bài)</i>
                </th>
                <th>
                  Timestamp
                  <br />
                  <i>(Ngày giờ)</i>
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.name}</td>
                  <td>
                    {h.correct} / {h.total}
                  </td>
                  <td>{h.score} / 100</td>
                  <td>{h.spent}</td>
                  <td>{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
