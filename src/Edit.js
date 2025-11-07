import React, { useEffect, useState } from "react";
import { loadAllQuestions } from "./utils";
import { renderFigure } from "./figure";

function Edit({ dataType = "preliminary" }) {
  const [questions, setQuestions] = useState([]);
  const [copied, setCopied] = useState(0);
  const [saved, setSaved] = useState(0);
  useEffect(() => {
    loadAllQuestions(
      [
        // "arithmetic",
        "combinatorics",
        // "geometry",
        // "logic-thinking",
        // "number-theory",
      ],
      5000,
      false,
      dataType
    ).then(setQuestions);
  }, [dataType]);

  const reloadAll = async () => {
    const all = await loadAllQuestions(
      [
        // "arithmetic",
        "combinatorics",
        // "geometry",
        // "logic-thinking",
        // "number-theory",
      ],
      5000,
      false,
      dataType
    );
    setQuestions(all);
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
  const handleFigureChange = (qIndex, newFigure) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      try {
        // Parse the newFigure string to JSON
        const figureObj = JSON.parse(newFigure);
        next[qIndex] = { ...q, figure: figureObj };
      } catch (e) {
        // If parsing fails, store as is
        next[qIndex] = { ...q, figure: newFigure };
      }
      return next;
    });
  };
  const handleChoiceChange = (qIndex, newChoice) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      try {
        // Parse the newChoice string to JSON
        const choiceObj = JSON.parse(newChoice);
        next[qIndex] = { ...q, choices: choiceObj };
      } catch (e) {
        // If parsing fails, store as is
        next[qIndex] = { ...q, choices: newChoice };
      }
      return next;
    });
  };
  const handleAnswerChange = (qIndex, newAnswer) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      try {
        // Parse the newAnswer string to JSON
        const answerObj = JSON.parse(newAnswer);
        next[qIndex] = { ...q, answer: answerObj };
      } catch (e) {
        // If parsing fails, store as is
        next[qIndex] = { ...q, answer: newAnswer };
      }
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

  const copyQuestion = (q) => {
    try {
      const txt = JSON.stringify(q, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(() => {
          setCopied(q.id);
        });
      } else {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(q.id);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể chép nội dung câu hỏi");
    }
  };

  // LƯU: ghi đè tệp JSON
  // Ưu tiên gọi API cục bộ khi debug+localhost để ghi trực tiếp không cần hộp thoại.
  // Fallback: File System Access API hoặc tải xuống.
  const saveQuestion = async (q) => {
    try {
      // Xác định file theo loại câu hỏi
      const typeToFile = {
        Arithmetic: "arithmetic.json",
        Combinatorics: "combinatorics.json",
        Geometry: "geometry.json",
        "Logic Thinking": "logic-thinking.json",
        "Logic-Thinking": "logic-thinking.json",
        Logic: "logic-thinking.json",
        "Number Theory": "number-theory.json",
        "Number-Theory": "number-theory.json",
      };
      const fileName =
        typeToFile[q.type] ||
        `${String(q.type || "")
          .toLowerCase()
          .replace(/\s+/g, "-")}.json`;

      // Đọc toàn bộ danh mục hiện tại
      // Chọn nguồn dữ liệu: trong debug+localhost thì dùng API shadow để tránh reload trang
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const isDebug =
        params &&
        (params.get("debug") === "1" || params.get("debug") === "true");
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const useApi = isDebug && isLocalhost;
      const basePath = useApi
        ? `http://localhost:4500/api/database/${dataType}`
        : `/on-thi-timo/database/${dataType}`;
      const res = await fetch(
        `${basePath}/${fileName}` + (useApi ? `?v=${Date.now()}` : ""),
        useApi ? { cache: "no-store" } : undefined
      );
      if (!res.ok) throw new Error(`Không thể tải ${fileName}`);
      const arr = await res.json();
      if (!Array.isArray(arr))
        throw new Error("Định dạng tệp không hợp lệ (không phải mảng)");

      // Tạo bản sao đã làm sạch (loại bỏ các field tạm thời)
      const sanitizeQuestion = (src) => {
        const clone = JSON.parse(JSON.stringify(src));
        delete clone.userAnswer;
        return clone;
      };
      const cleaned = sanitizeQuestion(q);

      // Thay thế theo id (nếu không thấy thì thêm vào cuối)
      let found = false;
      const updated = arr.map((item) => {
        if (item && item.id === cleaned.id) {
          found = true;
          return cleaned;
        }
        return item;
      });
      if (!found) {
        updated.push(cleaned);
      }

      const text = JSON.stringify(updated, null, 2);

      // Ưu tiên: nếu đang debug và chạy trên localhost, gọi API lưu trực tiếp
      try {
        if (isDebug && isLocalhost) {
          const resp = await fetch(
            `http://localhost:4500/api/save/${dataType}/${fileName}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": "timo-local-dev",
              },
              body: text,
            }
          );
          if (resp.ok) {
            // Sau khi lưu thành công, refetch toàn bộ câu hỏi (không reload trang)
            const all = await loadAllQuestions(
              [
                "arithmetic",
                "combinatorics",
                "geometry",
                "logic-thinking",
                "number-theory",
              ],
              5000,
              false,
              dataType
            );
            setQuestions(all);
            setSaved(q.id);
            return;
          } else {
            console.warn("Local save API trả về lỗi", await resp.text());
          }
        }
      } catch (e) {
        console.warn(
          "Local save API không khả dụng, fallback sang các cách khác.",
          e
        );
      }

      // Nếu trình duyệt hỗ trợ File System Access API → cho phép ghi đè trực tiếp theo file người dùng chọn
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "JSON files",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
        alert(`Đã lưu nội dung vào tệp: ${handle.name}`);
        return;
      }

      // Fallback: tải xuống file đã cập nhật
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Đã tạo file JSON đã cập nhật (tải xuống).");
    } catch (err) {
      console.error(err);
      alert("Không thể lưu. Chi tiết trong console.");
    }
  };

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  useEffect(() => {
    if (saved) {
      const timeout = setTimeout(() => {
        setSaved(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [saved]);

  // 📄 Chế độ giấy trắc nghiệm
  return (
    <div className="container-fluid mt-4 paper-mode">
      <div className="d-flex justify-content-between align-items-center m-3">
        <h3 className="m-0">{dataType.toUpperCase()} - EDIT MODE</h3>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={reloadAll}
          >
            REFRESH
          </button>
        </div>
      </div>
      {questions.map((q, qi) => (
        <div
          key={qi}
          className="mb-3 border rounded p-3 bg-light paper-question"
        >
          <div className="mb-2">
            <div className="question-title d-flex justify-content-between align-items-center">
              <strong>
                Question {qi + 1} <i>(Câu {qi + 1})</i>
                {q.id && (
                  <span className="badge bg-secondary ms-2">ID: {q.id}</span>
                )}
              </strong>
              <span className="ms-2">{dataType.toUpperCase()} - EDIT MODE</span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${copied === q.id ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => copyQuestion(q)}
                  title="Chép JSON câu hỏi"
                >
                  {copied === q.id ? "ĐÃ CHÉP" : "CHÉP"}
                </button>
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">stem</label>
              <textarea
                className="form-control"
                rows={4}
                value={JSON.stringify(q.stem, null, 2)}
                onChange={(e) => handleStemChange(qi, e.target.value)}
              />
            </div>
            <div className="figure-container">{renderFigure(q)}</div>
            <div className="figure-container">
              <label className="form-label">Figure</label>
              <textarea
                className="form-control"
                rows={10}
                value={JSON.stringify(q.figure, null, 2)}
                onChange={(e) => handleFigureChange(qi, e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="row">
              {q.choices.map((choice, i) => {
                const isRightAnswer = q.answer && q.answer.key === choice.id;
                const rightStyle = isRightAnswer
                  ? { backgroundColor: "#e6ffed" }
                  : {};
                return (
                  <div
                    className="col-12 col-md-3 mb-2"
                    key={i}
                    style={rightStyle}
                  >
                    <div className="d-flex align-items-center">
                      <b style={{ color: "gray", width: 24 }}>{choice.id}.</b>
                      <input
                        type="text"
                        className="form-control ms-2"
                        value={choice.en || ""}
                        onChange={(e) =>
                          handleChoiceTextChange(qi, i, e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="row">
              <div className="col-12">
                <label className="form-label">Choice</label>
                <textarea
                  className="form-control"
                  rows={10}
                  value={JSON.stringify(q.choices, null, 2)}
                  onChange={(e) => handleChoiceChange(qi, e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <label className="form-label">Answer</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={JSON.stringify(q.answer, null, 2)}
                  onChange={(e) => handleAnswerChange(qi, e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className={`btn btn-block ${saved === q.id ? "btn-success" : "btn-outline-success"}`}
              onClick={() => saveQuestion(q)}
              title="Lưu JSON câu hỏi"
            >
              {saved === q.id ? "ĐÃ LƯU" : "LƯU"}
            </button>
          </div>
        </div>
      ))}

      {/* Trang riêng cho đáp án */}
      <div className="answer-sheet">
        <h3 className="mt-2">
          Answer <i>(Đáp án)</i>
        </h3>
        <h6>{dataType.toUpperCase()} - EDIT MODE</h6>
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

export default Edit;
