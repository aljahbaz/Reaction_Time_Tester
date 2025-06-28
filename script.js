// script.js - Ultimate Reaction Time Tester with Levels, Timers, and Game Over Mode + Color Distraction

const container = document.getElementById("container");
const reactionTimeEl = document.getElementById("reaction-time");
const bestTimeEl = document.getElementById("best-time");
const resetBtn = document.getElementById("reset");
const startBtn = document.getElementById("startBtn");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("level-timer");

let bestTime = localStorage.getItem("bestTime") || null;
if (bestTime) bestTimeEl.textContent = bestTime;

let startTime, activeBox, timeoutId, level = 1, totalLevels = 5, fails = 0, levelTimerId;
let playing = false;
const boxCount = 16;
const levelTimes = [5000, 4500, 4000, 3500, 3000];
const distractionColors = ["blue", "orange", "purple", "pink"];

function createBoxes() {
  container.innerHTML = "";
  for (let i = 0; i < boxCount; i++) {
    const box = document.createElement("div");
    box.classList.add("box");
    box.dataset.index = i;
    box.addEventListener("click", handleBoxClick);
    container.appendChild(box);
  }
}

function startGame() {
  createBoxes();
  level = 1;
  fails = 0;
  playing = true;
  levelEl.textContent = `Level: ${level}`;
  nextLevel();
}

function nextLevel() {
  clearTimeout(timeoutId);
  clearTimeout(levelTimerId);
  reactionTimeEl.textContent = "--";
  timerEl.textContent = `${levelTimes[level - 1] / 1000}s`;

  let delay = Math.max(300, 2500 - level * 400);
  timeoutId = setTimeout(() => {
    const boxes = document.querySelectorAll(".box");
    const randomIndex = Math.floor(Math.random() * boxes.length);
    activeBox = boxes[randomIndex];
    activeBox.classList.add("active");
    activeBox.style.backgroundColor = "limegreen";

    // Add distractions to other boxes
    boxes.forEach((box, index) => {
      if (index !== randomIndex && Math.random() < 0.3) {
        const color = distractionColors[Math.floor(Math.random() * distractionColors.length)];
        box.style.backgroundColor = color;
        box.dataset.fake = "true";
      } else {
        box.dataset.fake = "false";
      }
    });

    startTime = new Date().getTime();
    startLevelTimer();
  }, delay);
}

function startLevelTimer() {
  const timeLimit = levelTimes[level - 1];
  levelTimerId = setTimeout(() => {
    if (activeBox) {
      activeBox.classList.remove("active");
      activeBox.style.backgroundColor = "";
      activeBox = null;
      fails++;
      if (fails >= 3) gameOver();
      else nextLevel();
    }
  }, timeLimit);
}

function handleBoxClick(e) {
  if (!playing || !activeBox) return;
  if (e.currentTarget === activeBox) {
    const endTime = new Date().getTime();
    const reaction = endTime - startTime;
    reactionTimeEl.textContent = reaction;
    if (!bestTime || reaction < bestTime) {
      bestTime = reaction;
      bestTimeEl.textContent = bestTime;
      localStorage.setItem("bestTime", bestTime);
    }
    clearTimeout(levelTimerId);
    activeBox.classList.remove("active");
    activeBox.style.backgroundColor = "";
    activeBox = null;

    document.querySelectorAll(".box").forEach(box => {
      box.style.backgroundColor = "";
    });

    if (level < totalLevels) {
      level++;
      levelEl.textContent = `Level: ${level}`;
      nextLevel();
    } else {
      endGame();
    }
  } else {
    e.currentTarget.classList.add("wrong");
    setTimeout(() => e.currentTarget.classList.remove("wrong"), 400);
    fails++;
    if (fails >= 3) {
      gameOver();
    }
  }
}

function endGame() {
  playing = false;
  alert(`🎉 You've completed all levels! Best Reaction: ${bestTime}ms`);
}

function gameOver() {
  playing = false;
  alert("💀 Game Over: 3 Wrong Clicks or Timeout! Try Again");
  document.querySelectorAll(".box").forEach(box => box.style.backgroundColor = "");
}

startBtn.addEventListener("click", () => {
  startGame();
});

resetBtn.addEventListener("click", () => {
  bestTime = null;
  bestTimeEl.textContent = "--";
  localStorage.removeItem("bestTime");
});
