// Ключ для LocalStorage
const STORAGE_KEY = "exam_completed_questions";

// Стан додатку
let completedQuestions = new Set();
let completedQuestionsOrder = [];

// DOM елементи
const getQuestionsBtn = document.getElementById("get-questions-btn");
const resetBtn = document.getElementById("reset-btn");
const questionsContainer = document.getElementById("questions-container");
const completedMessage = document.getElementById("completed-message");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const totalQuestionsEl = document.getElementById("total-questions");
const completedCountEl = document.getElementById("completed-count");
const remainingCountEl = document.getElementById("remaining-count");
const completedQuestionsList = document.getElementById("completed-questions-list");
const completedQuestionsEmpty = document.getElementById(
  "completed-questions-empty"
);

// Завантаження збережених даних з LocalStorage
function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const uniqueOrder = [];
      const seen = new Set();

      parsed.forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id);
          uniqueOrder.push(id);
        }
      });

      completedQuestionsOrder = uniqueOrder;
      completedQuestions = new Set(uniqueOrder);
    } catch (e) {
      completedQuestions = new Set();
      completedQuestionsOrder = [];
    }
  }
}

// Збереження прогресу в LocalStorage
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completedQuestionsOrder));
}

// Оновлення UI
function updateUI() {
  const total = TOTAL_QUESTIONS;
  const completed = completedQuestions.size;
  const remaining = total - completed;
  const percentage = (completed / total) * 100;

  // Оновлення прогрес-бару
  progressText.textContent = `${completed} / ${total}`;
  progressFill.style.width = `${percentage}%`;

  // Оновлення статистики
  totalQuestionsEl.textContent = total;
  completedCountEl.textContent = completed;
  remainingCountEl.textContent = remaining;

  // Перевірка чи всі питання пройдені
  if (remaining === 0) {
    getQuestionsBtn.disabled = true;
    completedMessage.classList.remove("hidden");
    questionsContainer.innerHTML = "";
  } else {
    getQuestionsBtn.disabled = false;
    completedMessage.classList.add("hidden");
  }

  renderCompletedQuestions();
}

// Отримання випадкових питань
function getRandomQuestions() {
  // Отримуємо доступні питання (ті, що ще не пройдені)
  const allIds = Object.keys(QUESTIONS).map(Number);
  const availableIds = allIds.filter((id) => !completedQuestions.has(id));

  if (availableIds.length === 0) {
    updateUI();
    return;
  }

  // Вибираємо до 3 випадкових питань
  const countToPick = Math.min(3, availableIds.length);
  const selectedIds = [];
  const tempAvailable = [...availableIds];

  for (let i = 0; i < countToPick; i++) {
    const randomIndex = Math.floor(Math.random() * tempAvailable.length);
    selectedIds.push(tempAvailable[randomIndex]);
    tempAvailable.splice(randomIndex, 1);
  }

  // Додаємо вибрані питання до пройдених
  selectedIds.forEach((id) => {
    if (!completedQuestions.has(id)) {
      completedQuestions.add(id);
      completedQuestionsOrder.push(id);
    }
  });
  saveProgress();

  // Відображаємо питання
  displayQuestions(selectedIds);
  updateUI();
}

// Відображення питань
function displayQuestions(questionIds) {
  questionsContainer.innerHTML = "";

  questionIds.forEach((id, index) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
            <span class="question-number">Питання №${id}</span>
            <p class="question-text">${QUESTIONS[id]}</p>
        `;

    questionsContainer.appendChild(card);
  });
}

// Відображення пройдених питань
function renderCompletedQuestions() {
  completedQuestionsList.innerHTML = "";

  if (completedQuestionsOrder.length === 0) {
    completedQuestionsEmpty.classList.remove("hidden");
    return;
  }

  completedQuestionsEmpty.classList.add("hidden");

  completedQuestionsOrder.forEach((id) => {
    const item = document.createElement("div");
    item.className = "completed-question-card";
    item.innerHTML = `
        <span class="completed-question-number">Питання №${id}</span>
        <p class="completed-question-text">${QUESTIONS[id]}</p>
      `;

    completedQuestionsList.appendChild(item);
  });
}

// Скидання прогресу
function resetProgress() {
  // Створюємо модальне вікно підтвердження
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal">
            <h3>⚠️ Скинути прогрес?</h3>
            <p>Ви впевнені, що хочете скинути весь прогрес? Цю дію неможливо скасувати.</p>
            <div class="modal-buttons">
                <button class="btn btn-secondary" id="cancel-reset">Скасувати</button>
                <button class="btn btn-primary" id="confirm-reset">Скинути</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Обробники кнопок
  document.getElementById("cancel-reset").addEventListener("click", () => {
    modal.remove();
  });

  document.getElementById("confirm-reset").addEventListener("click", () => {
    completedQuestions = new Set();
    completedQuestionsOrder = [];
    saveProgress();
    questionsContainer.innerHTML = `
            <div class="placeholder">
                <p>Натисніть кнопку вище, щоб отримати питання</p>
            </div>
        `;
    updateUI();
    modal.remove();
  });

  // Закриття по кліку на overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Ініціалізація
function init() {
  loadProgress();
  updateUI();

  // Обробники подій
  getQuestionsBtn.addEventListener("click", getRandomQuestions);
  resetBtn.addEventListener("click", resetProgress);
}

// Запуск при завантаженні сторінки
document.addEventListener("DOMContentLoaded", init);
