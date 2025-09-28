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
  isRandom = true
) {
  const data = tests.map((test) => {
    return fetch(
      `/react-on-thi-timo-lop-1/database/preliminary/${test}.json`
    ).then((res) => res.json());
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
        return questions.slice(0, maxQuestionPerTest);
      }
    });

    // Lưu id của lần này vào history
    const newHistory = [selected.map((q) => q.id), ...history].slice(0, 10);
    localStorage.setItem("timo-question-history", JSON.stringify(newHistory));

    // Shuffle questions randomly before returning
    return selected
      .sort(() => 0.5 - Math.random())
      .map((q) => ({ ...q, userAnswer: "" }));
  });
}

export function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + String(sec).padStart(2, "0");
}
