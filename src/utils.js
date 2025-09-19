export function getRandomFromArray(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

export function loadAllQuestions(
  tests = [
    "arithmetic",
    "combinatorics",
    "geometry",
    "logic-thinking",
    "number-theory",
  ],
  maxQuestionPerTest = 5
) {
  const data = tests.map((test) => {
    return fetch(`database/preliminary/${test}.json`).then((res) => res.json());
  });
  return Promise.all(data).then((results) => {
    return results
      .flatMap((questions) => getRandomFromArray(questions, maxQuestionPerTest))
      .map((q, idx) => ({ ...q, id: "q" + (idx + 1), userAnswer: "" }));
  });
}

export function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + String(sec).padStart(2, "0");
}
