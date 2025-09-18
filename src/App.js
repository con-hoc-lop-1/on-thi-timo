import React, { useState } from "react";
import Exam from "./Exam";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";

function App() {
  const [name, setName] = useState(
    localStorage.getItem("timo-user-name") || ""
  );
  const [mode, setMode] = useState("");
  const [done, setDone] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const handleStart = () => {
    if (!name.trim()) return alert("Vui lòng nhập tên");
    localStorage.setItem("timo-user-name", name.trim());
    if (!mode) return alert("Chọn chế độ thi");
    setMode(mode);
    setIsStarted(true);
  };

  if (done)
    return (
      <div className="container py-5 text-center">
        <h2>✅ Đã nộp bài! Xem điểm sau.</h2>
      </div>
    );
  if (isStarted)
    return <Exam name={name} mode={mode} onFinish={() => setDone(true)} />;

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h1 className="text-center mb-4">Ôn luyện TIMO Lớp 1</h1>
      <div className="mb-3">
        <label className="form-label">Nhập tên học sinh:</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Chọn đề thi:</label>
        <select
          className="form-select"
          onChange={(e) => setMode(e.target.value)}
          value={mode}
        >
          <option value="">--</option>
          <option value="preliminary">Preliminary</option>
          <option value="heat" disabled={true}>
            Heat
          </option>
        </select>
      </div>
      <button className="btn btn-primary w-100" onClick={handleStart}>
        LÀM BÀI
      </button>
    </div>
  );
}

export default App;
