const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');
const clearBtn = document.getElementById('clear');
const primeBtn = document.getElementById('prime');
const sqrtBtn = document.getElementById('sqrt');
const toggleBtn = document.getElementById('toggleCalc');
const calcContainer = document.querySelector('.calculator-container');
const themeSwitcher = document.getElementById('themeSwitcher');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

let currentInput = "";

// Prime check
function isPrime(num) {
  if (num <= 1 || !Number.isInteger(num)) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Save to history
function saveToHistory(entry) {
  let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
  history.push(entry);
  localStorage.setItem('calcHistory', JSON.stringify(history));
  renderHistory();
}

// Render history
function renderHistory() {
  historyList.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('calcHistory')) || [];
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    historyList.appendChild(li);
  });
}

// Clear history
clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('calcHistory');
  renderHistory();
});

// Toggle calculator
toggleBtn.addEventListener('click', () => {
  calcContainer.classList.toggle('hidden');
});

// Theme switcher
themeSwitcher.addEventListener('change', () => {
  document.body.className = themeSwitcher.value;
});

// Button logic
buttons.forEach(button => {
  const value = button.textContent;
  if (value === 'C' || value === 'Prime?' || value === '√') return;

  button.addEventListener('click', () => {
    if (value === '=') {
      try {
        if (/\/0(?!\d)/.test(currentInput)) {
          display.value = "Oops! Dividing by zero opens a portal 🚀";
          currentInput = "";
          return;
        }

        const result = eval(currentInput);
        display.value = result;
        saveToHistory(`${currentInput} = ${result}`);
        currentInput = result.toString();

        if (isPrime(result)) {
          setTimeout(() => {
            alert(`${result} is a prime number! 🧠✨`);
          }, 100);
        }
      } catch {
        display.value = "Something went wrong 🤯";
        currentInput = "";
      }
    } else {
      currentInput += value;
      display.value = currentInput;
    }
  });
});

// Clear
clearBtn.addEventListener('click', () => {
  currentInput = "";
  display.value = "";
});

// Prime check
primeBtn.addEventListener('click', () => {
  const num = parseFloat(display.value);
  if (isNaN(num)) {
    display.value = "Enter a number first!";
    return;
  }

  if (!Number.isInteger(num)) {
    display.value = "Only whole numbers can be prime!";
    return;
  }

  display.value = isPrime(num)
    ? `${num} is prime! 🧠✨`
    : `${num} is not prime 😬`;
});

// Square root
sqrtBtn.addEventListener('click', () => {
  const num = parseFloat(display.value);
});