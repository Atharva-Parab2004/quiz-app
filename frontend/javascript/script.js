// frontend/javascript/script.js
document.addEventListener("DOMContentLoaded", () => {
  // ---------------- DOM element selectors (safe) ----------------
  const configPopup = document.querySelector(".config-popup");
  const configContainer = document.querySelector(".config-container");
  const quizPopup = document.querySelector(".quiz-popup");
  const quizContainer = document.querySelector(".quiz-container");
  const answerOptions = quizContainer ? quizContainer.querySelector(".answer-options") : null;
  const nextQuestionBtn = quizContainer ? quizContainer.querySelector(".next-question-btn") : null;
  const questionStatus = quizContainer ? quizContainer.querySelector(".question-status") : null;
  const timerDisplay = quizContainer ? quizContainer.querySelector(".timer-duration") : null;
  const resultPopup = document.querySelector(".result-popup");
  const resultContainer = resultPopup ? resultPopup.querySelector(".result-container") : document.querySelector(".result-container");

  // Quick sanity check: stop if required elements are missing
  if (!configContainer || !quizContainer || !answerOptions || !nextQuestionBtn || !timerDisplay || !resultContainer) {
    console.error("script.js: required DOM elements are missing. Check your quiz.html structure.", {
      configContainer,
      quizContainer,
      answerOptions,
      nextQuestionBtn,
      timerDisplay,
      resultContainer,
    });
    return;
  }

  // ---------------- Quiz state ----------------
  const QUIZ_TIME_LIMIT = 15;
  let currentTime = QUIZ_TIME_LIMIT;
  let timer = null;
  let quizCategory = "programming";
  let numberOfQuestions = 10;
  let currentQuestion = null;
  const questionsIndexHistory = [];
  let correctAnswersCount = 0;
  let disableSelection = false;

  // `questions` should be defined in questions.js (global)
  if (typeof questions === "undefined") {
    console.warn("script.js: 'questions' is not defined. Make sure questions.js is loaded before script.js.");
  }

  // ---------------- Helper functions ----------------
  const showQuizResult = () => {
    clearInterval(timer);
    quizPopup.classList.remove("active");
    resultPopup.classList.add("active");
    const resultText = `You answered <b>${correctAnswersCount}</b> out of <b>${numberOfQuestions}</b> questions correctly. Great effort!`;
    const msgEl = resultContainer.querySelector(".result-message");
    if (msgEl) msgEl.innerHTML = resultText;
  };

  const resetTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    if (timerDisplay) timerDisplay.textContent = `${currentTime}s`;
  };

  const startTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    if (timerDisplay) timerDisplay.textContent = `${currentTime}s`;
    timer = setInterval(() => {
      currentTime--;
      if (timerDisplay) timerDisplay.textContent = `${currentTime}s`;
      if (currentTime <= 0) {
        clearInterval(timer);
        disableSelection = true;
        if (nextQuestionBtn) nextQuestionBtn.style.visibility = "visible";
        const timerBox = quizContainer.querySelector(".quiz-timer");
        if (timerBox) timerBox.style.background = "#c31402";
        highlightCorrectAnswer();
        answerOptions.querySelectorAll(".answer-option").forEach((option) => (option.style.pointerEvents = "none"));
      }
    }, 1000);
  };

  const getRandomQuestion = () => {
    const categoryQuestions =
      (Array.isArray(questions) &&
        questions.find((cat) => cat.category.toLowerCase() === quizCategory.toLowerCase())?.questions) ||
      [];

    // If we've shown as many questions as asked OR no questions available -> show result
    if (questionsIndexHistory.length >= Math.min(numberOfQuestions, categoryQuestions.length) || categoryQuestions.length === 0) {
      showQuizResult();
      return null;
    }

    const availableIndices = categoryQuestions.map((_, i) => i).filter((i) => !questionsIndexHistory.includes(i));
    if (availableIndices.length === 0) {
      showQuizResult();
      return null;
    }

    const randIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    questionsIndexHistory.push(randIndex);
    return categoryQuestions[randIndex];
  };

  const highlightCorrectAnswer = () => {
    if (!currentQuestion) return;
    const opts = answerOptions.querySelectorAll(".answer-option");
    const idx = currentQuestion.correctAnswer;
    if (typeof idx !== "number" || idx < 0 || idx >= opts.length) return;
    const correctOption = opts[idx];
    correctOption.classList.add("correct");
    correctOption.insertAdjacentHTML("beforeend", `<span class="material-symbols-rounded">check_circle</span>`);
  };

  const handleAnswer = (optionEl, answerIndex) => {
    if (disableSelection || !currentQuestion) return;
    clearInterval(timer);
    disableSelection = true;

    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    optionEl.classList.add(isCorrect ? "correct" : "incorrect");
    if (!isCorrect) highlightCorrectAnswer();
    else correctAnswersCount++;

    optionEl.insertAdjacentHTML("beforeend", `<span class="material-symbols-rounded">${isCorrect ? "check_circle" : "cancel"}</span>`);
    answerOptions.querySelectorAll(".answer-option").forEach((o) => (o.style.pointerEvents = "none"));
    if (nextQuestionBtn) nextQuestionBtn.style.visibility = "visible";
  };

  const renderQuestion = () => {
    currentQuestion = getRandomQuestion();
    if (!currentQuestion) return;

    disableSelection = false;
    resetTimer();
    startTimer();

    if (nextQuestionBtn) nextQuestionBtn.style.visibility = "hidden";
    const timerBox = quizContainer.querySelector(".quiz-timer");
    if (timerBox) timerBox.style.background = "#32313C";

    const qTextEl = quizContainer.querySelector(".question-text");
    if (qTextEl) qTextEl.textContent = currentQuestion.question;
    if (questionStatus) questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberOfQuestions}</b> Questions`;

    answerOptions.innerHTML = "";
    currentQuestion.options.forEach((opt, i) => {
      const li = document.createElement("li");
      li.className = "answer-option";
      li.textContent = opt;
      li.addEventListener("click", () => handleAnswer(li, i));
      answerOptions.appendChild(li);
    });
  };

  const startQuiz = () => {
    // Hide config and show quiz popup
    configPopup.classList.remove("active");
    quizPopup.classList.add("active");

    // Read selected category and number
    const catEl = configContainer.querySelector(".category-option.active");
    const numEl = configContainer.querySelector(".question-option.active");
    if (catEl) quizCategory = catEl.textContent.trim().toLowerCase();
    if (numEl) numberOfQuestions = parseInt(numEl.textContent.trim(), 10) || numberOfQuestions;

    // reset counters in case of restart
    correctAnswersCount = 0;
    questionsIndexHistory.length = 0;

    // render first question
    renderQuestion();
  };

  const resetQuiz = () => {
    resetTimer();
    correctAnswersCount = 0;
    questionsIndexHistory.length = 0;
    configPopup.classList.add("active");
    resultPopup.classList.remove("active");
  };

  // ---------------- Event listeners ----------------
  // category / question option toggles
  configContainer.querySelectorAll(".category-option, .question-option").forEach((option) => {
    option.addEventListener("click", () => {
      const parent = option.parentNode;
      const active = parent.querySelector(".active");
      if (active) active.classList.remove("active");
      option.classList.add("active");
    });
  });

  // Next, Try again and Start
  if (nextQuestionBtn) nextQuestionBtn.addEventListener("click", renderQuestion);
  const tryAgainBtn = resultContainer.querySelector(".try-again-btn");
  if (tryAgainBtn) tryAgainBtn.addEventListener("click", resetQuiz);

  const startBtn = document.querySelector(".start-quiz-btn");
  if (startBtn) {
    startBtn.addEventListener("click", startQuiz);
  } else {
    console.warn("script.js: .start-quiz-btn not found.");
  }

  console.log("script.js loaded — ready");
});
