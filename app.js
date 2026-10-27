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
function render(info) {
  questionBlock.textContent = "";
  let currentPage = 0;
  let eachData = info[currentPage];
  const ul = document.createElement("ul");
  const pQuestion = document.createElement("p");
  pQuestion.textContent = decodeURIComponent(eachData.question);
  questionBlock.appendChild(pQuestion);
  questionBlock.appendChild(ul);

  let answers = [eachData.correct_answer];
  for (let j = 0; j < eachData.incorrect_answers.length; j++) {
    answers.push(eachData.incorrect_answers[j]);
  }

  answers = shuffle(answers);

  for (let k = 0; k < answers.length; k++) {
    const li = document.createElement("li");
    const spanLi = document.createElement("span");
    const checkBtn = document.createElement("i");
    checkBtn.className = "material-icons radio";
    checkBtn.textContent = "radio_button_unchecked";
    ul.appendChild(li);
    li.appendChild(spanLi);
    spanLi.innerHTML = answers[k];
    li.appendChild(checkBtn);
  }
  if (moveOn === false) {
    selectAnswers();
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
}

function selectAnswers() {
  let answersLi = document.querySelectorAll("li");
  let answersLiIcon = document.querySelectorAll("i");
  console.log(answersLi);

  for (let j = 0; j < answersLi.length; j++) {
    let eachAnswerBtn = answersLi[j];
    let eachAnswerIcon = answersLiIcon[j];

    eachAnswerBtn.addEventListener("click", function () {
      for (let k = 0; k < answersLi.length; k++) {
        let eachAnswerBtn = answersLi[k];
        let eachAnswerIcon = answersLiIcon[k];
        eachAnswerIcon.textContent = "radio_button_unchecked";
        eachAnswerIcon.style.color = "rgb(128, 97, 57)";
        eachAnswerBtn.className = "";
      }
      eachAnswerIcon.textContent = "radio_button_checked";
      eachAnswerBtn.className = "active";
      eachAnswerIcon.style.color = "rgb(128, 97, 57)";
      allowNext = true;
    });
  }
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

startButton.addEventListener("click", () => {
  fetchStartData().then(render(dataInfo));
});
quickButton.addEventListener("click", () => {
  fetchQuickData();
});
