export function getRandomFromArray(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

export function loadAllQuestions() {
  return Promise.all([
    fetch("database/preliminary/arithmetic.json").then((res) => res.json()),
    fetch("database/preliminary/combinatorics.json").then((res) => res.json()),
    fetch("database/preliminary/geometry.json").then((res) => res.json()),
    fetch("database/preliminary/logic-thinking.json").then((res) => res.json()),
    fetch("database/preliminary/number-theory.json").then((res) => res.json()),
  ]).then(([a, c, g, l, n]) => {
    return [
      ...getRandomFromArray(a, 5),
      ...getRandomFromArray(c, 5),
      ...getRandomFromArray(g, 5),
      ...getRandomFromArray(l, 5),
      ...getRandomFromArray(n, 5),
    ].map((q, idx) => ({ ...q, id: "q" + (idx + 1), userAnswer: "" }));
  });
}
export function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + String(sec).padStart(2, "0");
}
