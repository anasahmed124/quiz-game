// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const quickStartButton = document.getElementById("Quick-button");
const startQuizButton = document.getElementById("start-button");
const questionCountInput = document.getElementById("num-questions");

const categorySelect = document.getElementById("mySelect");
const difficultySelect = document.getElementById("Difficulty");
const questionTypeSelect = document.getElementById("Type-questions");

const questionBlock = document.querySelector(".question-block");
const feedbackText = document.getElementById("quiz-feedback");
const feedbackBox = document.querySelector(".feedback-box");
const feedbackIcon = document.getElementById("feedback-icon");

const categoryLabel = document.getElementById("selected-category");
const difficultyLabel = document.getElementById("selected-difficulty");

const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score-value");
const correctAnswersDisplay = document.getElementById("correct-answers-count");
const wrongAnswersDisplay = document.getElementById("wrong-answers-count");
const finalFeedback = document.getElementById("final-feedback");
const personalBestDisplay = document.getElementById("personal-best-number");

const homeContainer = document.querySelector(".home-container");
const quizPageContainer = document.querySelector(".questions-container");
const resultsPageContainer = document.querySelector(".container-final");

const nextButton = document.getElementById("next-button");
const playAgainButton = document.getElementById("play-again-button");
const homeButton = document.getElementById("home-button");

const dialog = document.getElementById("my-dialog");
const openDialogButton = document.getElementById("open-button");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");

const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");

const hiddenContainer1 = document.querySelector(".hidden-container");
const hiddenContainer2 = document.querySelector(".hidden-container2");

const timerRow = document.querySelector(".time-row");
const timerContainer = document.querySelector(".myTimer");
const timerSelect = document.getElementById("timer-container");
const timerDisplay = document.getElementById("time-counter");

const themeToggleButton = document.getElementById("toggle-button");
const themeLogo = document.getElementById("theme-logo");

const soundToggleButton = document.getElementById("toggle-sound-button");
const soundLogo = document.getElementById("sound-logo");

// ==========================================
// 2. GLOBAL VARIABLES
// ==========================================

let questionsData = [];

let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;

let timerInterval;
let remainingTime;
let selectedTimerDuration;

let canGoToNextQuestion = false;

let quizStatus = "idle";
let answerButtons = [];

let soundEnabled = false;

// ==========================================
// 3. AUDIO OBJECTS
// ==========================================

const correctSound = new Audio("image/sounds/correct.mp3");
const wrongSound = new Audio("image/sounds/wrong-buzzer.mp3");
const clickSound = new Audio("image/sounds/button-press.mp3");
const timeUpSound = new Audio("image/sounds/the-end-sound.mp3");
const quizCompletedSound = new Audio("image/sounds/the-end-sound.mp3");

function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0;
    sound.play().catch(function (error) {
      console.error("Could not play sound:", error);
    });
  }
}

// ==========================================
// 4. LOCAL STORAGE
// ==========================================

function createSavedQuizState(
  questions,
  correctCount,
  wrongCount,
  category,
  difficulty,
  questionType,
  timerDuration,
  questionIndex,
  timeLeft,
) {
  let savedStatus;

  if (questionIndex >= questions.length) {
    savedStatus = "completedPlaying";
  } else {
    savedStatus = "stillPlaying";
  }

  return {
    allQuestionData: questions,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    categoryPlaying: category,
    difficultyPlaying: difficulty,
    typePlaying: questionType,
    timerChoosed: timerDuration,
    currentQuestionPlaying: questionIndex,
    timeLeft: timeLeft,
    savedAt: Date.now(),
    statePlaying: savedStatus,
  };
}

function saveQuizProgress(questions, questionIndex, timeLeft) {
  try {
    const savedQuiz = createSavedQuizState(
      questions,
      correctAnswersCount,
      wrongAnswersCount,
      categorySelect.value,
      difficultySelect.value,
      questionTypeSelect.value,
      selectedTimerDuration,
      questionIndex,
      timeLeft,
    );

    localStorage.setItem("quizQuestions", JSON.stringify(savedQuiz));
  } catch (error) {
    console.error("Could not save quiz:", error);
  }
}

function loadSavedQuiz() {
  try {
    const savedQuiz = localStorage.getItem("quizQuestions");

    if (savedQuiz) {
      return JSON.parse(savedQuiz);
    }
  } catch (error) {
    console.error("Could not load quiz:", error);
  }

  return null;
}

// ==========================================
// 5. FETCH QUESTIONS FROM API
// ==========================================

async function fetchQuestions(settings) {
  try {
    const apiUrl = "https://opentdb.com/api.php";
    const queryParams = new URLSearchParams();

    queryParams.append("amount", settings.amount || 10);
    queryParams.append("encode", "url3986");

    if (settings.category !== "") {
      queryParams.append("category", settings.category);
    }

    if (settings.difficulty !== "") {
      queryParams.append("difficulty", settings.difficulty);
    }

    if (settings.type !== "") {
      queryParams.append("type", settings.type);
    }

    const apiResponse = await fetch(apiUrl + "?" + queryParams.toString());

    if (!apiResponse.ok) {
      throw new Error("Failed to fetch questions");
    }

    const responseData = await apiResponse.json();

    if (responseData.response_code !== 0) {
      throw new Error("No questions available with these settings");
    }

    questionsData = responseData.results;

    // Remove duplicate questions
    questionsData = Array.from(
      new Set(questionsData.map((question) => question.question)),
    ).map((questionText) => {
      return questionsData.find(
        (question) => question.question === questionText,
      );
    });

    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    currentQuestionIndex = 0;
    canGoToNextQuestion = false;

    quizStatus = "success";

    questionBlock.hidden = false;

    renderQuestion(questionsData);

    hiddenContainer1.hidden = false;
    hiddenContainer2.hidden = false;
  } catch (error) {
    quizStatus = "error";
    questionBlock.textContent = "Error loading questions. Please try again.";

    console.error(error.message);
  }
}

// ==========================================
// 6. QUIZ RENDERING
// ==========================================

function renderQuestion(questions, questionIndex = 0, savedTime) {
  currentQuestionIndex = questionIndex;

  questionBlock.textContent = "";

  feedbackIcon.hidden = true;
  feedbackText.textContent = "";
  feedbackText.style.color = "";

  feedbackBox.classList.remove("correct", "wrong");

  const currentQuestion = questions[questionIndex];

  categoryLabel.textContent =
    "Category: " + decodeURIComponent(currentQuestion.category);

  difficultyLabel.textContent = "Difficulty: " + currentQuestion.difficulty;

  const answersList = document.createElement("ul");
  const questionTextElement = document.createElement("div");

  questionTextElement.textContent = decodeURIComponent(
    currentQuestion.question,
  );

  questionTextElement.classList.add("question-text");

  questionBlock.appendChild(questionTextElement);
  questionBlock.appendChild(answersList);

  let answerOptions = [currentQuestion.correct_answer];

  for (let i = 0; i < currentQuestion.incorrect_answers.length; i++) {
    answerOptions.push(currentQuestion.incorrect_answers[i]);
  }

  if (currentQuestion.type === "boolean") {
    answerOptions = ["True", "False"];
  } else if (currentQuestion.type === "multiple") {
    answerOptions = shuffle(answerOptions);
  }

  for (let i = 0; i < answerOptions.length; i++) {
    const answerListItem = document.createElement("li");
    const answerText = document.createElement("span");
    const answerIcon = document.createElement("i");
    const answerButton = document.createElement("button");

    answerButton.className = "answerButton";

    answerIcon.className = "material-icons radio";
    answerIcon.textContent = "radio_button_unchecked";

    answerText.textContent = decodeURIComponent(answerOptions[i]);

    answerButton.appendChild(answerText);
    answerButton.appendChild(answerIcon);

    answerListItem.appendChild(answerButton);
    answersList.appendChild(answerListItem);
  }

  answerButtons = questionBlock.querySelectorAll(".answerButton");

  const questionCounter = document.querySelector(".counter");

  questionCounter.textContent =
    "Question: " + `${questionIndex + 1} of ${questions.length}`;

  canGoToNextQuestion = false;
  nextButton.disabled = true;

  attachAnswerEvents(currentQuestion, questions.length);

  timerControl(currentQuestion, savedTime);

  updateProgressBar();

  hiddenContainer1.hidden = false;
  hiddenContainer2.hidden = false;
}

// ==========================================
// 7. HELPER FUNCTIONS
// ==========================================

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    const temp = array[i];
    array[i] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
}

function updateProgressBar() {
  const completedPercentage = Math.round(
    (currentQuestionIndex / questionsData.length) * 100,
  );

  progressBar.style.width = completedPercentage + "%";

  progressPercent.textContent = completedPercentage + "% Complete";
}

function showCorrectAnswer(currentQuestion) {
  answerButtons.forEach(function (answerButton) {
    const answerText = answerButton.querySelector("span");

    if (
      answerText.textContent ===
      decodeURIComponent(currentQuestion.correct_answer)
    ) {
      answerButton.classList.add("correct");

      answerButton.querySelector("i").textContent = "radio_button_checked";
    }
  });
}

function unlockNextQuestion() {
  canGoToNextQuestion = true;
  nextButton.disabled = false;
}

// ==========================================
// 8. ANSWER HANDLING
// ==========================================

function attachAnswerEvents(currentQuestion, totalQuestions) {
  answerButtons.forEach(function (answerButton) {
    answerButton.addEventListener("click", function () {
      if (canGoToNextQuestion) return;

      clearInterval(timerInterval);

      const selectedAnswer = answerButton.querySelector("span");

      if (
        selectedAnswer.textContent ===
        decodeURIComponent(currentQuestion.correct_answer)
      ) {
        playSound(correctSound);

        answerButton.classList.add("correct");
        feedbackBox.classList.add("correct");

        feedbackIcon.hidden = false;

        feedbackIcon.src =
          "image/check_circle_24dp_04AA6D_FILL0_wght400_GRAD0_opsz24.svg";

        feedbackIcon.alt = "check circle";
        feedbackIcon.className = "icon";

        correctAnswersCount++;
      } else {
        answerButton.classList.add("wrong");
        feedbackBox.classList.add("wrong");

        feedbackIcon.src =
          "image/x_circle_24dp_EA3323_FILL0_wght400_GRAD0_opsz24.svg";

        feedbackIcon.hidden = false;

        playSound(wrongSound);

        wrongAnswersCount++;

        feedbackText.style.color = "red";

        feedbackText.textContent =
          "Wrong! , The correct answer is: ( " +
          decodeURIComponent(currentQuestion.correct_answer) +
          " )";

        showCorrectAnswer(currentQuestion);
      }

      scoreDisplay.textContent =
        "Score: (" + correctAnswersCount + " / " + totalQuestions + ")";

      answerButton.querySelector("i").textContent = "radio_button_checked";

      saveQuizProgress(questionsData, currentQuestionIndex, remainingTime);

      unlockNextQuestion();
    });
  });
}

// ==========================================
// 9. TIMER
// ==========================================

function updateTimerBar(timeLeft, initialTime) {
  const timerBarElement = document.getElementById("timer-bar");

  if (initialTime <= 0 || !Number.isFinite(initialTime)) {
    return;
  }

  const percentage = Math.max(0, Math.round((timeLeft / initialTime) * 100));

  timerBarElement.style.width = percentage + "%";

  if (timeLeft <= 3) {
    timerBarElement.style.backgroundColor = "#f44336";
  } else if (timeLeft <= 5) {
    timerBarElement.style.backgroundColor = "#ff9800";
  } else {
    timerBarElement.style.backgroundColor = "#4caf50";
  }
}

function updateTimerDisplay(text) {
  timerDisplay.textContent = text;

  if (text === "Time's up!") {
    timerDisplay.style.color = "red";
  } else {
    timerDisplay.style.color = "";
  }
}

function timerControl(currentQuestion, savedTime) {
  try {
    clearInterval(timerInterval);

    selectedTimerDuration = parseInt(timerSelect.value);

    if (isNaN(selectedTimerDuration)) {
      timerRow.hidden = true;
      timerContainer.hidden = true;

      remainingTime = undefined;

      return;
    }

    timerRow.hidden = false;
    timerContainer.hidden = false;

    const initialTime = selectedTimerDuration;

    remainingTime = savedTime ?? initialTime;

    updateTimerDisplay(remainingTime);
    updateTimerBar(remainingTime, initialTime);

    if (remainingTime <= 0) {
      playSound(timeUpSound);

      wrongAnswersCount++;

      feedbackText.style.color = "red";

      feedbackText.textContent =
        "Time's up!, Be fast next time! The correct answer is: (" +
        decodeURIComponent(currentQuestion.correct_answer) +
        " )";

      feedbackIcon.src =
        "image/x_circle_24dp_EA3323_FILL0_wght400_GRAD0_opsz24.svg";

      feedbackIcon.hidden = false;

      showCorrectAnswer(currentQuestion);
      unlockNextQuestion();

      updateTimerDisplay("Time's up!");

      return;
    }

    timerInterval = setInterval(function () {
      remainingTime--;

      updateTimerDisplay(remainingTime);
      updateTimerBar(remainingTime, initialTime);

      saveQuizProgress(questionsData, currentQuestionIndex, remainingTime);

      if (remainingTime <= 0) {
        clearInterval(timerInterval);

        playSound(timeUpSound);

        wrongAnswersCount++;

        feedbackText.style.color = "red";

        feedbackText.textContent =
          "Time's up!, Be fast next time! The correct answer is: (" +
          decodeURIComponent(currentQuestion.correct_answer) +
          " )";

        feedbackIcon.src =
          "image/x_circle_24dp_EA3323_FILL0_wght400_GRAD0_opsz24.svg";

        feedbackIcon.hidden = false;

        showCorrectAnswer(currentQuestion);
        unlockNextQuestion();

        saveQuizProgress(questionsData, currentQuestionIndex, remainingTime);

        updateTimerDisplay("Time's up!");
      }
    }, 1000);
  } catch (error) {
    console.error("Error in timerControl:", error);
  }
}

// ==========================================
// 10. PAGE NAVIGATION
// ==========================================

function showHomePage() {
  homeContainer.hidden = false;
  quizPageContainer.hidden = true;
  resultsPageContainer.hidden = true;
}

function showQuizPage() {
  homeContainer.hidden = true;
  quizPageContainer.hidden = false;
  resultsPageContainer.hidden = true;

  hiddenContainer1.hidden = false;
  hiddenContainer2.hidden = false;
}

function showResultsPage() {
  try {
    clearInterval(timerInterval);

    localStorage.removeItem("quizQuestions");

    homeContainer.hidden = true;
    quizPageContainer.hidden = true;
    resultsPageContainer.hidden = false;

    const totalQuestions = questionsData.length;

    const percentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    finalScoreDisplay.textContent =
      correctAnswersCount + " / " + totalQuestions;

    correctAnswersDisplay.textContent = correctAnswersCount;
    wrongAnswersDisplay.textContent = wrongAnswersCount;

    let bestScore = Number(localStorage.getItem("personalBest")) || 0;

    if (percentage > bestScore) {
      bestScore = percentage;
      localStorage.setItem("personalBest", bestScore);
    }

    personalBestDisplay.textContent = bestScore + "%";

    if (percentage < 50) {
      finalFeedback.textContent = "Keep practising!";
    } else if (percentage < 80) {
      finalFeedback.textContent = "Nice work!";
    } else {
      finalFeedback.textContent = "Trivia Master!";
    }

    playSound(quizCompletedSound);
  } catch (error) {
    console.error("Error showing results:", error);
  }
}

// ==========================================
// 11. LOADING AND RESUMING QUIZ
// ==========================================

function showLoadingState() {
  if (quizStatus === "loading") {
    answerButtons.forEach(function (answerButton) {
      answerButton.disabled = true;
    });

    questionBlock.textContent = "Loading questions...";

    hiddenContainer1.hidden = true;
    hiddenContainer2.hidden = true;

    timerRow.hidden = true;
    timerContainer.hidden = true;
  }
}

function resumeSavedQuiz() {
  const savedQuiz = loadSavedQuiz();

  if (savedQuiz && savedQuiz.statePlaying === "stillPlaying") {
    questionsData = savedQuiz.allQuestionData;

    correctAnswersCount = savedQuiz.correctAnswers || 0;
    wrongAnswersCount = savedQuiz.wrongAnswers || 0;

    currentQuestionIndex = savedQuiz.currentQuestionPlaying;

    categorySelect.value = savedQuiz.categoryPlaying;
    difficultySelect.value = savedQuiz.difficultyPlaying;
    questionTypeSelect.value = savedQuiz.typePlaying;

    selectedTimerDuration = savedQuiz.timerChoosed;

    const elapsedTime = Math.floor((Date.now() - savedQuiz.savedAt) / 1000);

    const savedRemainingTime = Math.max(0, savedQuiz.timeLeft - elapsedTime);

    quizStatus = "success";

    showQuizPage();

    renderQuestion(questionsData, currentQuestionIndex, savedRemainingTime);
  } else {
    showHomePage();
  }
}

// ==========================================
// 12. KEYBOARD CONTROLS
// ==========================================

function enableKeyboardAnswers() {
  document.addEventListener("keydown", function (event) {
    if (quizStatus !== "success" || canGoToNextQuestion) {
      return;
    }

    const keyNumber = Number(event.key);

    if (keyNumber >= 1 && keyNumber <= answerButtons.length) {
      answerButtons[keyNumber - 1].click();
    }
  });
}

// ==========================================
// 13. DIALOG EVENTS
// ==========================================

openDialogButton.addEventListener("click", function () {
  dialog.showModal();
});

yesButton.addEventListener("click", function () {
  dialog.close("yes");
});

noButton.addEventListener("click", function () {
  dialog.close("no");
});

dialog.addEventListener("close", function () {
  if (dialog.returnValue === "yes") {
    clearInterval(timerInterval);

    quizStatus = "idle";

    showHomePage();

    localStorage.removeItem("quizQuestions");
  }
});

// ==========================================
// 14. HOME PAGE BUTTONS
// ==========================================

playAgainButton.addEventListener("click", function () {
  startQuizButton.click();
});

homeButton.addEventListener("click", function () {
  clearInterval(timerInterval);

  quizStatus = "idle";

  showHomePage();

  localStorage.removeItem("quizQuestions");
});

// ==========================================
// 15. START QUIZ EVENTS
// ==========================================

startQuizButton.addEventListener("click", function () {
  quizStatus = "loading";

  playSound(clickSound);

  showQuizPage();
  showLoadingState();

  fetchQuestions({
    category: categorySelect.value,
    difficulty: difficultySelect.value,
    type: questionTypeSelect.value,
    amount: questionCountInput.value || 10,
  });
});

quickStartButton.addEventListener("click", function () {
  quizStatus = "loading";

  playSound(clickSound);

  showQuizPage();
  showLoadingState();

  fetchQuestions({
    category: "",
    difficulty: "",
    type: "",
    amount: 10,
  });
});

// ==========================================
// 16. NEXT QUESTION
// ==========================================

nextButton.addEventListener("click", function () {
  if (!canGoToNextQuestion) return;

  playSound(clickSound);

  const nextQuestionIndex = currentQuestionIndex + 1;

  feedbackText.textContent = "";

  if (nextQuestionIndex < questionsData.length) {
    renderQuestion(questionsData, nextQuestionIndex);

    saveQuizProgress(questionsData, currentQuestionIndex, remainingTime);
  } else {
    showResultsPage();
  }
});

// ==========================================
// 17. THEME TOGGLE
// ==========================================

themeToggleButton.addEventListener("click", function () {
  playSound(clickSound);

  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeLogo.src =
      "image/light_mode_24dp_3524D0_FILL0_wght400_GRAD0_opsz24.svg";
  } else {
    themeLogo.src =
      "image/dark_mode_24dp_8B7CFF_FILL0_wght400_GRAD0_opsz24.svg";
  }
});

// ==========================================
// 18. SOUND TOGGLE
// ==========================================

soundToggleButton.addEventListener("click", function () {
  soundEnabled = !soundEnabled;

  soundLogo.src = soundEnabled
    ? "image/volume_up_24dp_8B7CFF_FILL0_wght400_GRAD0_opsz24.svg"
    : "image/no_sound_24dp_8B7CFF_FILL0_wght400_GRAD0_opsz24.svg";
});

// ==========================================
// 19. INITIALIZE
// ==========================================

enableKeyboardAnswers();

resumeSavedQuiz();
