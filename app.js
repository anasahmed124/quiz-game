const quickQuizButton = document.getElementById("Quick-button");
const startQuizButton = document.getElementById("start-button");
const questionCountInput = document.getElementById("num-questions");
const categorySelect = document.getElementById("mySelect");
const difficultySelect = document.getElementById("Difficulty");
const questionTypeSelect = document.getElementById("Type-questions");
const quizContainer = document.querySelector(".question-block");
const feedbackEl = document.getElementById("quiz-feedback");
let questionsData;
let canGoToNextQuestion = false;
let correctAnswersCount = 0;
let state = "idle";
const answerButtons = quizContainer.querySelectorAll(".answerButton");

function loadingState() {
  if (state === "loading") {
    answerButtons.forEach(function (answerButton) {
      answerButton.disabled = true;
    });
    quizContainer.textContent = "Loading questions...";
  }
}

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

    if (state === "success") {
      state = "success";
      quizContainer.hidden = false;
    }

    questionsData = responseData.results;
    correctAnswersCount = 0;
    canGoToNextQuestion = false;

    render(questionsData);
    console.log(questionsData);

    return questionsData;
  } catch (error) {
    state = "error";
    quizContainer.textContent = "Error loading questions. Please try again.";
    console.log(error.message);
  }
}

function render(questions, currentQuestionIndex = 0) {
  quizContainer.textContent = "";

  const currentQuestion = questions[currentQuestionIndex];
  const answersList = document.createElement("ul");
  const questionTextElement = document.createElement("p");

  questionTextElement.textContent = decodeURIComponent(
    currentQuestion.question,
  );

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

      if (currentQuestionIndex < questions.length) {
        canGoToNextQuestion = false;
        render(questions, currentQuestionIndex);
      }
    }
  });

  let answerOptions = [currentQuestion.correct_answer];

  for (let i = 0; i < currentQuestion.incorrect_answers.length; i++) {
    answerOptions.push(currentQuestion.incorrect_answers[i]);
  }

  answerOptions = shuffle(answerOptions);

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
  const counter = document.querySelector(".counter");

  selectAnswers(currentQuestion);
  counter.textContent =
    "Question " + `${currentQuestionIndex + 1} / ${questions.length}`;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    const temp = array[i];
    array[i] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
}

function selectAnswers(currentQuestion) {
  const answerButtons = quizContainer.querySelectorAll(".answerButton");

  answerButtons.forEach(function (answerButton) {
    answerButton.addEventListener("click", function () {
      if (canGoToNextQuestion) return;

      const selectedAnswerText = answerButton.querySelector("span");
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
        score.textContent = "Correct Answers: " + correctAnswersCount;
      } else {
        answerButton.classList.add("wrong");
        feedbackEl.textContent =
          "Wrong! , The correct answer is   " +
          decodeURIComponent(currentQuestion.correct_answer);
        score.textContent = "Correct Answers Still: " + correctAnswersCount;
        selectedAnswerText.style.color = "white";
        selectedAnswerText.style.backgroundColor = "red";
        answerButtons.forEach(function (correctAnswerButton) {
          const correctAnswerText = correctAnswerButton.querySelector("span");

          if (
            correctAnswerText.textContent ===
            decodeURIComponent(currentQuestion.correct_answer)
          ) {
            correctAnswerButton.classList.add("correct");
          }
        });
      }

      answerButton.querySelector("i").textContent = "radio_button_checked";

      canGoToNextQuestion = true;

      quizContainer.querySelector(".nextBtn").disabled = false;
    });
  });
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
  loadingState();
  fetchStartData();
});

quickQuizButton.addEventListener("click", function () {
  fetchQuickData();
});
