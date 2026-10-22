const quickButton = document.getElementById("Quick-button");
const startButton = document.getElementById("start-button");
const bar = document.getElementById("num-questions");
const select = document.getElementById("mySelect");
const difficulty = document.getElementById("Difficulty");
const typeQuestions = document.getElementById("Type-questions");
document.getElementById("num-questions").textContent = bar;

async function fetchData() {
  try {
    if (
      bar.value >= 1 &&
      select.value !== "" &&
      select.value !== "" &&
      difficulty.value !== "" &&
      typeQuestions.value !== ""
    ) {
      const respone = await fetch(
        `https://opentdb.com/api.php?amount=${bar.value}&category=${select.value}&difficulty=${difficulty.value}&type=${typeQuestions.value}}`,
      );

      console.log("data fetched1");
      console.log(respone);
      console.log(select.value);
      console.log(difficulty.value);
      console.log(typeQuestions.value);

      if (!respone.ok) {
        throw new Error("erorr");
      }

      const data = await respone.json();
      console.log(data);
    } else if (bar.value >= 1 && select.value !== "") {
      const respone = await fetch(
        `https://opentdb.com/api.php?amount=${bar.value}&category=${select.value}`,
      );

      console.log("data fetched2");
      console.log(respone);
      console.log(select.value);

      if (!respone.ok) {
        throw new Error("erorr");
      }

      const data = await respone.json();
      console.log(data);
    }
  } catch {
    error;
    console.log(error.message);
  }
}
/*
    const respone = await fetch(
      `https://opentdb.com/api.php?amount=${bar.value}&category=${select.value}`
      /* &difficulty=${}&type=${typeElement.value} */
/*
    );

    console.log("data fetches");
    console.log(respone);
    console.log(select.value);
    document.getElementById("num-questions").textContent = bar;
    */

startButton.addEventListener("click", () => {
  fetchData();
});
