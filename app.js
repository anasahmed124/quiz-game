const api = "https://opentdb.com/api.php?amount=10&encode=url3986";
const quickButton = document.getElementById("Quick-button");
const startButton = document.getElementById("start-button");
const statusElement = document.getElementById("status");
const bar = document.getElementById("num-questions");

async function fetchQuestions() {
  try {
    const questions = document.getElementById("questions");
    const categoryElement = document.getElementById("category");
    const difficultyElement = document.getElementById("difficulty");
    const typeElement = document.getElementById("type");
    const select = document.getElementById("mySelect");

    const respone = await fetch(
      `https://opentdb.com/api.php?amount=${bar.value}&category=${select.value}` /* &difficulty=${}&type=${typeElement.value}*/,
    );
    console.log("data fetches");
    console.log(respone);
    document.getElementById("num-questions").textContent = bar;
    if (!respone.ok) {
      throw new Error("erorr");
    }
    const data = await respone.json();
    console.log(data);
  } catch (error) {
    /*
      const statusElement = document.getElementById("timer");*/
    console.log(error);
  }
}
quickButton.addEventListener("click", () => {
  fetchQuestions();
});
