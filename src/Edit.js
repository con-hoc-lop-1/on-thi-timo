import React, { useEffect, useState } from "react";
import { loadAllQuestions } from "./utils";
import { renderFigure } from "./figure";

function Edit({ dataType = "preliminary" }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadAllQuestions(
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
    ).then(setQuestions);
  }, [dataType]);
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
      const basePath = `/on-thi-timo/database/${dataType}`;
      const res = await fetch(`${basePath}/${fileName}`);
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
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
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
            // alert(`Đã ghi đè trực tiếp file ${fileName} (vòng ${dataType}).`);
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

  // 📄 Chế độ giấy trắc nghiệm
  return (
    <div className="container-fluid mt-4 paper-mode">
      <h3 className="m-3">{dataType.toUpperCase()} - EDIT MODE</h3>
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
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => copyQuestion(q)}
                  title="Chép JSON câu hỏi"
                >
                  CHÉP
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => saveQuestion(q)}
                  title="Lưu và ghi đè tệp JSON của danh mục"
                >
                  LƯU
                </button>
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">stem.en</label>
              <textarea
                className="form-control"
                rows={3}
                value={(q.stem && q.stem.en) || ""}
                onChange={(e) => handleStemChange(qi, e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">stem.vi</label>
              <textarea
                className="form-control"
                rows={3}
                value={(q.stem && q.stem.vi) || ""}
                onChange={(e) => handleStemViChange(qi, e.target.value)}
              />
            </div>
            <div className="figure-container">{renderFigure(q)}</div>
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
