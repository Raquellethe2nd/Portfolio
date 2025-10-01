let secretNumber;
let maxNumber = 100;
let attempts = 0;
let previousGuess = null;
let hintCount = 0;
const maxHints = 2;

// Load game state on page load
window.onload = function () {
  const savedDifficulty = localStorage.getItem("difficulty");
  if (savedDifficulty) {
    maxNumber = Number(savedDifficulty);
    document.getElementById("difficulty").value = savedDifficulty;
  }

  const wonBefore = localStorage.getItem("gameWon");
  if (wonBefore === "true") {
    document.getElementById("message").textContent = "🎉 You already won!";
    document.getElementById("guess").disabled = true;
  } else {
    generateNewNumber();
  }

  displayLeaderboard();

  const savedHighScore = localStorage.getItem("highScore");
  if (savedHighScore) {
    document.getElementById("highscore").textContent = `High Score: ${savedHighScore} attempts`;
  }
};

// Generate a new secret number
function generateNewNumber() {
  secretNumber = Math.floor(Math.random() * maxNumber) + 1;
}

// Set difficulty and restart game
function setDifficulty() {
  maxNumber = Number(document.getElementById("difficulty").value);
  localStorage.setItem("difficulty", maxNumber);
  resetGame();
}

// Check player's guess
function checkGuess() {
  const guessInput = document.getElementById("guess");
  const message = document.getElementById("message");
  const attemptsDisplay = document.getElementById("attempts");
  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > maxNumber) {
    message.textContent = `Please enter a number between 1 and ${maxNumber}.`;
    return;
  }

  attempts++;
  attemptsDisplay.textContent = `Attempts: ${attempts}`;

  if (guess === secretNumber) {
    message.textContent = `🎉 Correct! The number was ${secretNumber}.`;
    guessInput.disabled = true;
    localStorage.setItem("gameWon", "true");

    updateLeaderboard(attempts);
    updateHighScore(attempts);
  } else {
    const distance = Math.abs(secretNumber - guess);
    if (previousGuess !== null) {
      const prevDistance = Math.abs(secretNumber - previousGuess);
      if (distance < prevDistance) {
        message.textContent = "🔥 Warmer! You're getting closer.";
      } else if (distance > prevDistance) {
        message.textContent = "❄️ Colder! You're moving away.";
      } else {
        message.textContent = "😐 Same distance as before.";
      }
    } else {
      message.textContent = guess < secretNumber ? "📉 Too low!" : "📈 Too high!";
    }
    previousGuess = guess;
  }
}

// Reset the game
function resetGame() {
  generateNewNumber();
  attempts = 0;
  previousGuess = null;
  hintCount = 0;

  document.getElementById("message").textContent = "Start guessing...";
  document.getElementById("attempts").textContent = "Attempts: 0";
  document.getElementById("guess").value = "";
  document.getElementById("guess").disabled = false;
  document.getElementById("hint").textContent = "Hint: —";
  document.getElementById("highscore").classList.remove("new-record");

  localStorage.removeItem("gameWon");
}

// Show smart hint (limited to 2)
function showHint() {
  if (hintCount >= maxHints) {
    document.getElementById("hint").textContent = "🚫 No more hints available.";
    return;
  }

  document.getElementById("hint").textContent = getSmartHint(secretNumber);
  hintCount++;
}

// Generate smart hints
function getSmartHint(number) {
  const hints = [];

  if (number % 2 === 0) hints.push("It's even.");
  else hints.push("It's odd.");

  if (number % 5 === 0) hints.push("It's divisible by 5.");
  if (number % 10 === 0) hints.push("It's a multiple of 10.");
  if (isPrime(number)) hints.push("It's a prime number.");

  return "Hint: " + hints.join(" ");
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Update leaderboard
function updateLeaderboard(currentAttempts) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push(currentAttempts);
  leaderboard.sort((a, b) => a - b);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

// Display leaderboard
function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const board = document.getElementById("leaderboard");
  board.innerHTML = "<h3>🏆 Leaderboard</h3><ol>" +
    leaderboard.map(score => `<li>${score} attempts</li>`).join("") +
    "</ol>";
}

// Update high score
function updateHighScore(currentAttempts) {
  let highScore = Number(localStorage.getItem("highScore")) || Infinity;
  if (currentAttempts < highScore) {
    localStorage.setItem("highScore", currentAttempts);
    document.getElementById("highscore").textContent = `🥇 New High Score: ${currentAttempts} attempts!`;
    document.getElementById("highscore").classList.add("new-record");
  } else {
    document.getElementById("highscore").textContent = `High Score: ${highScore} attempts`;
  }
}
