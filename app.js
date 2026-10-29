const quickButton = document.getElementById("Quick-button");
const startButton = document.getElementById("start-button");
const bar = document.getElementById("num-questions");
const select = document.getElementById("mySelect");
const questionsDisplay = document.getElementById("questions");
const difficulty = document.getElementById("Difficulty");
const typeQuestions = document.getElementById("Type-questions");
const questionBlock = document.querySelector(".question-block");
const selector = document.querySelector(".container");

let data;
let dataInfo;
let moveOn = false;
let allowNext = false;
let totalRight = 0;

async function fetchStartData() {
  try {
    const url = decodeURIComponent("https://opentdb.com/api.php");
    const searchParams = new URLSearchParams();

    searchParams.append("amount", bar.value || 10);
    searchParams.append("encode", "url3986");

    if (select.value !== "") {
      searchParams.append("category", select.value);
    }
    if (difficulty.value !== "") {
      searchParams.append("difficulty", difficulty.value);
    }
    if (typeQuestions.value !== "") {
      searchParams.append("type", typeQuestions.value);
    }
    const response = await fetch(url + "?" + searchParams.toString());

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    const data = await response.json();
    dataInfo = data.results;
    render(dataInfo);
    console.log(dataInfo);
    return dataInfo;
  } catch (error) {
    console.log(error.message);
  }
}
function render(info, currentPage = 0) {
  questionBlock.textContent = "";
  let eachData = info[currentPage];
  const ul = document.createElement("ul");
  const pQuestion = document.createElement("p");
  pQuestion.textContent = decodeURIComponent(eachData.question);
  questionBlock.appendChild(pQuestion);
  questionBlock.appendChild(ul);
  const nextBtn = document.createElement("button");
  nextBtn.className = "nextBtn";
  nextBtn.textContent = "Next Question";
  questionBlock.appendChild(nextBtn);
  nextBtn.disabled = true;

  nextBtn.addEventListener("click", function () {
    if (allowNext === true) {
      currentPage++;

      if (currentPage < info.length) {
        allowNext = false;
        render(info, currentPage);
      }
    }
  });
  console.log(nextBtn);
  let answers = [eachData.correct_answer];
  for (let j = 0; j < eachData.incorrect_answers.length; j++) {
    answers.push(eachData.incorrect_answers[j]);
  }

  answers = shuffle(answers);

  for (let k = 0; k < answers.length; k++) {
    const li = document.createElement("li");
    const spanLi = document.createElement("span");
    const checkBtn = document.createElement("i");
    const eachAnswerBtn = document.createElement("button");

    eachAnswerBtn.className = "eachAnswerBtn";
    checkBtn.className = "material-icons radio";
    checkBtn.textContent = "radio_button_unchecked";

    ul.appendChild(li);
    li.appendChild(eachAnswerBtn);

    eachAnswerBtn.appendChild(spanLi);
    spanLi.textContent = decodeURIComponent(answers[k]);
    eachAnswerBtn.appendChild(checkBtn);
  }
  if (moveOn === false) {
    selectAnswers(eachData);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

function selectAnswers(info) {
  const answersBtn = questionBlock.querySelectorAll(".eachAnswerBtn");

  answersBtn.forEach(function (eachAnswerBtn) {
    eachAnswerBtn.addEventListener("click", function () {
      if (allowNext) return;

      const answerText = eachAnswerBtn.querySelector("span");

      if (answerText.textContent === info.correct_answer) {
        eachAnswerBtn.classList.add("correct");
        totalRight++;
      } else {
        eachAnswerBtn.classList.add("wrong");

        answersBtn.forEach(function (btn) {
          const text = btn.querySelector("span");

          if (text.textContent === info.correct_answer) {
            btn.classList.add("correct");
          }
        });
      }

      eachAnswerBtn.querySelector("i").textContent = "radio_button_checked";

      renderState();
      allowNext = true;
      questionBlock.querySelector(".nextBtn").disabled = false;
    });
  });
}

function renderState() {
  const answersBtn = questionBlock.querySelectorAll(".eachAnswerBtn");

  answersBtn.forEach(function (btn) {
    btn.disabled = true;
  });
}

///////
async function fetchQuickData() {
  try {
    const url = decodeURIComponent("https://opentdb.com/api.php");
    const searchParams = new URLSearchParams();

    searchParams.append("amount", bar.value || 10);
    searchParams.append("encode", "url3986");
    const response = await fetch(url + "?" + searchParams.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
}

startButton.addEventListener("click", fetchStartData);
quickButton.addEventListener("click", () => {
  fetchQuickData();
});
