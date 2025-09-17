import React, {useEffect, useState} from "react";
import {loadAllQuestions} from "./utils";

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
}

function Exam({name, mode, onFinish}) {
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(mode === 'heat' ? 90 * 60 : 60 * 60);

    useEffect(() => {
        loadAllQuestions().then(setQuestions);
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
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

    const handleAnswer = val => {
        const updated = [...questions];
        updated[index].userAnswer = val;
        setQuestions(updated);
    };

    const handleSubmit = () => {
        const correct = questions.filter(q => q.answer === q.userAnswer).length;
        const history = JSON.parse(localStorage.getItem('timo-history') || '[]');
        history.unshift({
            name,
            mode,
            score: correct * 5,
            duration: (mode === 'heat' ? 90 : 60) * 60 - secondsLeft,
            timestamp: Date.now()
        });
        localStorage.setItem('timo-history', JSON.stringify(history.slice(0, 20)));
        onFinish();
    };

    const q = questions[index];

    return questions.length === 0 ? <p>Đang tải đề...</p> : (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0">🧠 Đề thi {mode}</h4>
                <div>
                    <span className="badge bg-warning text-dark me-2">⏰ {formatTime(secondsLeft)}</span>
                    <button className="btn btn-danger" onClick={handleSubmit}>Nộp bài</button>
                </div>
            </div>

            <div className="mb-2"><strong>Câu {index + 1}:</strong></div>
            <div className="border rounded p-3 bg-light mb-3" dangerouslySetInnerHTML={{__html: q.question}}/>

            <div className="mb-4">
                {q.choices ? q.choices.map((c, i) => (
                    <div className="form-check" key={i}>
                        <input
                            type="radio"
                            name={`q${q.id}`}
                            className="form-check-input"
                            checked={q.userAnswer === c}
                            onChange={() => handleAnswer(c)}
                            id={`q${q.id}-c${i}`}
                        />
                        <label className="form-check-label" htmlFor={`q${q.id}-c${i}`}>{c}</label>
                    </div>
                )) : (
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập đáp án"
                        value={q.userAnswer}
                        onChange={e => handleAnswer(e.target.value)}
                    />
                )}
            </div>

            <div className="d-flex justify-content-between">
                <button className="btn btn-secondary" disabled={index === 0} onClick={() => setIndex(i => i - 1)}>◀
                    Trước
                </button>
                <button className="btn btn-primary" disabled={index === questions.length - 1}
                        onClick={() => setIndex(i => i + 1)}>Tiếp ▶
                </button>
            </div>
        </div>
    );
}


export default Exam;