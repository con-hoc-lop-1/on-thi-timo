export function getRandomFromArray(arr, count, exclude = []) {
  const filtered = arr.filter((q) => !exclude.includes(q.id));
  // Nếu loại bỏ nhiều quá thì fallback lấy tất cả
  const source = filtered.length >= count ? filtered : arr;
  return source.sort(() => 0.5 - Math.random()).slice(0, count);
}

export function loadAllQuestions(
  tests = [
    "arithmetic",
    "combinatorics",
    "geometry",
    "logic-thinking",
    "number-theory",
  ],
  maxQuestionPerTest = 5,
  isRandom = true,
  dataType = "preliminary"
) {
  const basePath = `/on-thi-timo/database/${dataType}`;
  const data = tests.map((test) => {
    return fetch(`${basePath}/${test}.json`).then((res) => res.json());
  });

  return Promise.all(data).then((results) => {
    // Đọc lịch sử id đã dùng trong 10 lần gần nhất
    const history = JSON.parse(
      localStorage.getItem("timo-question-history") || "[]"
    );
    const excludeIds = history.flat(); // gộp hết id các lần trước

    const selected = results.flatMap((questions) => {
      if (isRandom) {
        return getRandomFromArray(questions, maxQuestionPerTest, excludeIds);
      } else {
        // Debug mode: sắp xếp theo thứ tự ID tăng dần trong từng danh mục
        const sortedById = [...questions].sort((a, b) =>
          (a.id || "").localeCompare(b.id || "", undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
        return sortedById.slice(0, maxQuestionPerTest);
      }
    });

    // Lưu id của lần này vào history
    const newHistory = [selected.map((q) => q.id), ...history].slice(0, 10);
    localStorage.setItem("timo-question-history", JSON.stringify(newHistory));

    // Trả về danh sách câu hỏi
    // - Nếu random: xáo trộn toàn bộ
    // - Nếu không random (debug): giữ nguyên thứ tự theo từng danh mục
    const finalized = isRandom
      ? selected.sort(() => 0.5 - Math.random())
      : selected;

    return finalized.map((q) => ({ ...q, userAnswer: "" }));
  });
}

export function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + String(sec).padStart(2, "0");
}
