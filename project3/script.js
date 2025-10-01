let questions = [];
let currentIndex = 0;
let score = 0;
let playerName = "";
let timer;
let timeLeft = 12;
let results = [];

const startBtn = document.getElementById("start-btn");
const playerInput = document.getElementById("player-name");
const categorySelect = document.getElementById("category-select");
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("question-text");
const choicesBox = document.getElementById("choices");
const progressText = document.getElementById("progress-text");
const timerText = document.getElementById("timer-text");
const hintBtn = document.getElementById("hint-btn");

const finalScore = document.getElementById("final-score");
const scoreList = document.getElementById("score-list");
const resetBtn = document.getElementById("reset-btn");
const answerBreakdown = document.getElementById("answer-breakdown");

startBtn.onclick = () => {
    playerName = playerInput.value.trim() || "Anonymous";
    startScreen.style.display = "none";
    quizScreen.style.display = "block";
    loadQuestions();
};

resetBtn.onclick = () => {
    localStorage.removeItem("quizScores");
    location.reload();
};

async function loadQuestions() {
    const selectedCategory = categorySelect.value;
    const response = await fetch("question.json");
    let allQuestions = await response.json();

    questions = selectedCategory === "all"
        ? allQuestions
        : allQuestions.filter(q => q.category === selectedCategory);

    shuffle(questions);
    loadQuestion();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
    clearInterval(timer);
    if (currentIndex >= questions.length) return endGame();

    const current = questions[currentIndex];
    questionText.textContent = current.question;
    choicesBox.innerHTML = "";
    progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    startTimer();

    current.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice;
        btn.onclick = () => checkAnswer(choice, current.answer);
        choicesBox.appendChild(btn);
    });

    hintBtn.onclick = () => showHint(current.answer, current.choices);
}

function checkAnswer(selected, correct) {
    clearInterval(timer);
    const current = questions[currentIndex];

    results.push({
        question: current.question,
        correctAnswer: correct,
        playerAnswer: selected,
        isCorrect: selected === correct
    });

    if (selected === correct) score++;
    currentIndex++;
    loadQuestion();
}

function startTimer() {
    timeLeft = 12;
    timerText.textContent = `Time left: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerText.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            results.push({
                question: questions[currentIndex].question,
                correctAnswer: questions[currentIndex].answer,
                playerAnswer: "No answer",
                isCorrect: false
            });
            currentIndex++;
            loadQuestion();
        }
    }, 1000);
}

function showHint(correct, choices) {
    const wrongChoices = choices.filter(c => c !== correct);
    const toRemove = wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
    [...choicesBox.children].forEach(btn => {
        if (btn.textContent === toRemove) btn.style.display = "none";
    });
}

function endGame() {
    quizScreen.style.display = "none";
    resultScreen.style.display = "block";
    finalScore.textContent = `${playerName}, you scored ${score}/${questions.length}!`;
    saveScore();
    showLeaderboard();
    showAnswerBreakdown();
    logJournalEntry();
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem("quizScores")) || [];
    scores.push({ name: playerName, score });
    localStorage.setItem("quizScores", JSON.stringify(scores));
}

function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem("quizScores")) || [];
    scores.sort((a, b) => b.score - a.score);
    scoreList.innerHTML = scores.map(s => `<li>${s.name}: ${s.score}</li>`).join("");
}

function showAnswerBreakdown() {
    answerBreakdown.innerHTML = "<h3>Answer Review:</h3>";
    results.forEach((entry, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
      <p><strong>Q${index + 1}:</strong> ${entry.question}</p>
      <p>Your answer: <span style="color:${entry.isCorrect ? 'lightgreen' : 'salmon'}">${entry.playerAnswer}</span> ${entry.isCorrect ? '✅' : '❌'}</p>
      <p>Correct answer: <strong>${entry.correctAnswer}</strong></p>
      <hr>
    `;
        answerBreakdown.appendChild(div);
    });
}

function logJournalEntry() {
    const rank = score >= questions.length * 0.8
        ? "Legend"
        : score >= questions.length * 0.5
            ? "Thinker"
            : "Novice";

    console.log(`📝 AI Journal: ${playerName} scored ${score}/${questions.length}. Rank: ${rank}. Category: ${categorySelect.value}`);
}