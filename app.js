const quickQuizButton = document.getElementById("Quick-button");
const startQuizButton = document.getElementById("start-button");
const questionCountInput = document.getElementById("num-questions");
const categorySelect = document.getElementById("mySelect");
const difficultySelect = document.getElementById("Difficulty");
const questionTypeSelect = document.getElementById("Type-questions");
const quizContainer = document.querySelector(".question-block");
const feedbackEl = document.getElementById("quiz-feedback");
const selectedCategory = document.getElementById("selected-category");
const finalScore = document.getElementById("final-score-value");
const correctAnswersDisplay = document.getElementById("correct-anwers-count");
const wrongAnswersDisplay = document.getElementById("wrong-answers-count");
const finalFeedback = document.getElementById("final-feedback");
const personalBestNumber = document.getElementById("personal-best-number");
const homeContainer = document.querySelector(".home-container");
const questionContainer = document.querySelector(".questions-container");
const finalContainer = document.querySelector(".container-final");
let wrongAnswersCount = 0;
let questionsData;
let timer;
let canGoToNextQuestion = false;
let correctAnswersCount = 0;
let state = "idle";
let stateOfPlaying = "idle";
let answerButtons = [];
let selectedAnswerText = "";
const playAgainBtn = document.getElementById("play-again-button");
const homeBtn = document.getElementById("home-button");
playAgainBtn.addEventListener("click", function () {
  startQuizButton.click();
});
homeBtn.addEventListener("click", function () {
  clearInterval(timer);
  state = "idle";
  homePage();
});

finalContainer.hidden = true;
function loadingState() {
  if (state === "loading") {
    answerButtons.forEach(function (answerButton) {
      answerButton.disabled = true;
    });
    quizContainer.textContent = "Loading questions...";
  }
} /*

function quizState(
  questionsData,
  score,
  categorySelect,
  difficultySelect,
  questionTypeSelect,
  timer,
  currentQuestionIndex,
) {
  let stateOfPlaying;

  if (currentQuestionIndex >= questionsData.length) {
    stateOfPlaying = "completedPlaying";
  } else {
    stateOfPlaying = "stillPlaying";
  }
  let stateStored = {
    allQuestionData: questionsData,
    scorePlaying: score,
    categoryPlaying: categorySelect,
    difficultyPlaying: difficultySelect,
    typePlaying: questionTypeSelect,
    timerChoosed: timer,
    currentQuestionPlaying: currentQuestionIndex,
    statePlaying: stateOfPlaying,
  };
  return stateStored;
}

function localStorageSave(
  questionsData,
  score,
  categorySelect,
  difficultySelect,
  questionTypeSelect,
  timer,
  currentQuestionIndex,
) {
  try {
    const stateStored = quizState(
      questionsData,
      score,
      categorySelect,
      difficultySelect,
      questionTypeSelect,
      timer,
      currentQuestionIndex,
    );

    localStorage.setItem("quizQuestions", JSON.stringify(stateStored));
  } catch (error) {
    console.error("Could not save questions:", error);
  }
}
function localStorageLoad() {
  try {
    const savedQuestions = localStorage.getItem("quizQuestions");

    if (savedQuestions) {
      return JSON.parse(savedQuestions);
    }
  } catch (error) {
    console.error("Could not load questions:", error);
  }
  return null;
}
*/
async function fetchStartData() {
  try {
    const apiUrl = "https://opentdb.com/api.php";
    const queryParams = new URLSearchParams();

    queryParams.append("amount", questionCountInput.value || 10);
    queryParams.append("encode", "url3986");

    if (categorySelect.value !== "") {
      queryParams.append("category", categorySelect.value);
    }
    if (difficultySelect.value !== "") {
      queryParams.append("difficulty", difficultySelect.value);
    }
    if (questionTypeSelect.value !== "") {
      queryParams.append("type", questionTypeSelect.value);
    }

    const apiResponse = await fetch(apiUrl + "?" + queryParams.toString());

    if (!apiResponse.ok) {
      throw new Error("Failed to fetch questions");
    }

    const responseData = await apiResponse.json();

    state = "success";
    quizContainer.hidden = false;

    questionsData = responseData.results;

    const uniqueData = Array.from(
      new Set(questionsData.map((a) => a.question)),
    ).map((question) => {
      return questionsData.find((a) => a.question === question);
    });

    questionsData = uniqueData;
    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    canGoToNextQuestion = false;
    console.log(questionsData);
    render(uniqueData);
    return uniqueData;
  } catch (error) {
    state = "error";
    quizContainer.textContent = "Error loading questions. Please try again.";
    console.log(error.message);
  }
}

/*function loadSavedQuestions() {
  const savedQuestions = localStorageLoad();

  if (savedQuestions && savedQuestions.statePlaying === "stillPlaying") {
    questionsData = savedQuestions.allQuestionData;

    correctAnswersCount = savedQuestions.scorePlaying;
    currentQuestionIndex = savedQuestions.currentQuestionPlaying;

    categorySelect.value = savedQuestions.categoryPlaying;
    difficultySelect.value = savedQuestions.difficultyPlaying;
    questionTypeSelect.value = savedQuestions.typePlaying;
    timerDuration = savedQuestions.timerChoosed;

    searchQuestions(questionsData, currentQuestionIndex);
    startTimer(timerDuration);
  } else {
    fetchStartData();
  }
}*/

function searchQuestions(questions, index = 0) {
  if (!questions || index >= questions.length) return;

  const currentQuestion = questions[index];

  displayQuestion(currentQuestion);
}

function render(questions, currentQuestionIndex = 0) {
  quizContainer.textContent = "";
  const currentQuestion = questions[currentQuestionIndex];
  const selectedCategory = document.getElementById("selected-category");
  const selectedDifficulty = document.getElementById("selected-difficulty");
  const answersList = document.createElement("ul");
  const questionTextElement = document.createElement("p");
  selectedCategory.textContent = currentQuestion.category;
  selectedDifficulty.textContent = currentQuestion.difficulty;
  questionTextElement.textContent = decodeURIComponent(
    currentQuestion.question,
  );
  function ProgressBar() {
    const progressBarElem = document.getElementById("progress-bar");

    let completedPercentage = Math.round(
      (currentQuestionIndex / questionsData.length) * 100,
    );

    progressBarElem.style.width = completedPercentage + "%";
    progressBarElem.textContent = completedPercentage + "%";
  }

  selectedCategory.textContent =
    "Category: " + decodeURIComponent(currentQuestion.category);
  selectedDifficulty.textContent = "Difficulty: " + currentQuestion.difficulty;

  quizContainer.appendChild(questionTextElement);
  quizContainer.appendChild(answersList);

  const nextQuestionButton = document.createElement("button");

  nextQuestionButton.className = "nextBtn";
  nextQuestionButton.textContent = "Next Question";

  quizContainer.appendChild(nextQuestionButton);
  nextQuestionButton.disabled = true;

  nextQuestionButton.addEventListener("click", function () {
    if (canGoToNextQuestion === true) {
      currentQuestionIndex++;
      feedbackEl.textContent = "";
      ProgressBar();
      if (currentQuestionIndex < questions.length) {
        canGoToNextQuestion = false;
        render(questions, currentQuestionIndex);
      }
    }
    if (currentQuestionIndex === questions.length) {
      finalPage();
    }
  });

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
    const answerTextElement = document.createElement("span");
    const answerIcon = document.createElement("i");
    const answerButton = document.createElement("button");

    answerButton.className = "answerButton";
    answerIcon.className = "material-icons radio";
    answerIcon.textContent = "radio_button_unchecked";

    answersList.appendChild(answerListItem);
    answerListItem.appendChild(answerButton);

    answerButton.appendChild(answerTextElement);
    answerTextElement.textContent = decodeURIComponent(answerOptions[i]);

    answerButton.appendChild(answerIcon);
  }
  answerButtons = quizContainer.querySelectorAll(".answerButton");
  const counter = document.querySelector(".counter");

  counter.textContent =
    "Question: " + `${currentQuestionIndex + 1} of ${questions.length}`;
  selectAnswers(currentQuestion, questions.length);
  timerControl(currentQuestion);
}
function keyBoardPlay() {
  document.addEventListener("keydown", (event) => {
    if (state !== "success" || canGoToNextQuestion) return;

    const keyNumber = Number(event.key);

    if (keyNumber >= 1 && keyNumber <= answerButtons.length) {
      answerButtons[keyNumber - 1].click();
    }
  });
}
keyBoardPlay();
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    const temp = array[i];
    array[i] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
}
function showCorrectAnswer(currentQuestion) {
  answerButtons.forEach(function (correctAnswerButton) {
    const correctAnswerText = correctAnswerButton.querySelector("span");

    if (
      correctAnswerText.textContent ===
      decodeURIComponent(currentQuestion.correct_answer)
    ) {
      correctAnswerText.style.color = "white";
      correctAnswerText.style.backgroundColor = "seagreen";
    }
  });
  //local storeg
  //CSS
}
function timerBar(timeLeft, initialTime) {
  let timerBarElem = document.getElementById("timer-bar");

  if (initialTime <= 0 || !Number.isFinite(initialTime)) {
    timerBarElem.hidden = true;
    return;
  }

  let percentage = Math.max(0, Math.round((timeLeft / initialTime) * 100));

  timerBarElem.style.width = percentage + "%";
  timerBarElem.textContent = percentage + "%";

  if (timeLeft <= 3) {
    timerBarElem.style.backgroundColor = "#f44336";
  } else if (timeLeft <= 5) {
    timerBarElem.style.backgroundColor = "#ff9800";
  } else {
    timerBarElem.style.backgroundColor = "#4caf50";
  }
}

function selectAnswers(
  currentQuestion,
  totalQuestions,
  currentQuestionIndex,
  timerDuration,
) {
  answerButtons.forEach(function (answerButton) {
    answerButton.addEventListener("click", function () {
      if (canGoToNextQuestion) return;

      clearInterval(timer);

      selectedAnswerText = answerButton.querySelector("span");
      const score = document.getElementById("score");

      if (
        selectedAnswerText.textContent ===
        decodeURIComponent(currentQuestion.correct_answer)
      ) {
        answerButton.classList.add("correct");
        feedbackEl.textContent = "Correct! ✓";

        selectedAnswerText.style.color = "white";
        selectedAnswerText.style.backgroundColor = "seagreen";

        correctAnswersCount++;
      } else {
        answerButton.classList.add("wrong");
        wrongAnswersCount++;
        feedbackEl.textContent =
          "Wrong! , The correct answer is: ( " +
          decodeURIComponent(currentQuestion.correct_answer) +
          " )";

        selectedAnswerText.style.color = "white";
        selectedAnswerText.style.backgroundColor = "red";

        showCorrectAnswer(currentQuestion);
      }

      score.textContent =
        "Score: (" + correctAnswersCount + " /" + totalQuestions + ")";

      answerButton.querySelector("i").textContent = "radio_button_checked";
      /*    localStorageSave(
        questionsData,
        correctAnswersCount,
        categorySelect.value,
        difficultySelect.value,
        questionTypeSelect.value,
        timerDuration,
        currentQuestionIndex,
      );*/

      endQuestion();
    });
  });
}

function endQuestion() {
  try {
    canGoToNextQuestion = true;
    quizContainer.querySelector(".nextBtn").disabled = false;
  } catch (error) {
    console.error("Error in endQuestion:", error);
  }
}

function timerControl(currentQuestion) {
  try {
    clearInterval(timer);

    let timerValue = parseInt(document.getElementById("timer-container").value);

    const initialTime = timerValue;

    timerDisplayes(timerValue);
    timerBar(timerValue, initialTime);

    timer = setInterval(function () {
      timerValue--;
      timerDisplayes(timerValue);

      timerBar(timerValue, initialTime);
      if (initialTime <= 0 || !Number.isFinite(initialTime)) {
        timerValue.hidden = true;
      }

      if (timerValue === 0) {
        clearInterval(timer);
        wrongAnswersCount++;
        feedbackEl.textContent =
          "Time's up!, Be fast next time! The correct answer is :(" +
          decodeURIComponent(currentQuestion.correct_answer) +
          " )";

        showCorrectAnswer(currentQuestion);

        endQuestion();
        timerDisplayes("Time's up!");
      }
    }, 1000);
  } catch (error) {
    console.error("Error in timerControl:", error);
  }
}

function homePage() {
  homeContainer.hidden = false;
  questionContainer.hidden = true;
  finalContainer.hidden = true;
}

function questionsPage() {
  homeContainer.hidden = true;
  questionContainer.hidden = false;
  finalContainer.hidden = true;
}

function finalPage() {
  clearInterval(timer);

  homeContainer.hidden = true;
  questionContainer.hidden = true;
  finalContainer.hidden = false;

  const totalQuestions = questionsData.length;

  const percentage = Math.round((correctAnswersCount / totalQuestions) * 100);

  finalScore.textContent = correctAnswersCount + " / " + totalQuestions;

  correctAnswersDisplay.textContent = correctAnswersCount;
  wrongAnswersDisplay.textContent = wrongAnswersCount;

  /*let bestScore = Number(localStorage.getItem("personalBest")) || 0;*/

  if (percentage > bestScore) {
    bestScore = percentage;
    /* localStorage.setItem("personalBest", bestScore);*/
  }

  personalBestNumber.textContent = bestScore + "%";

  if (percentage < 50) {
    finalFeedback.textContent = "Keep practising!";
  } else if (percentage < 80) {
    finalFeedback.textContent = "Nice work!";
  } else {
    finalFeedback.textContent = "Trivia Master!";
  }
}
homePage();
function timerDisplayes(text) {
  try {
    let timeCounter = document.getElementById("time-counter");
    timeCounter.textContent = text;
  } catch (error) {
    console.error("Error in timerDisplayes:", error);
  }
}

async function fetchQuickData() {
  try {
    const apiUrl = "https://opentdb.com/api.php";
    const queryParams = new URLSearchParams();

    queryParams.append("amount", questionCountInput.value || 10);
    queryParams.append("encode", "url3986");

    const apiResponse = await fetch(apiUrl + "?" + queryParams.toString());

    if (!apiResponse.ok) {
      throw new Error("Failed to fetch questions");
    }

    const responseData = await apiResponse.json();

    console.log(responseData);
  } catch (error) {
    console.log(error.message);
  }
}

startQuizButton.addEventListener("click", function () {
  state = "loading";
  questionsPage();
  loadingState();
  fetchStartData();
});

quickQuizButton.addEventListener("click", function () {
  fetchQuickData();
});
