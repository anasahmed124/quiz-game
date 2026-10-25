const quickButton = document.getElementById("Quick-button");
const startButton = document.getElementById("start-button");
const bar = document.getElementById("num-questions");
const select = document.getElementById("mySelect");
const difficulty = document.getElementById("Difficulty");
const typeQuestions = document.getElementById("Type-questions");
document.getElementById("num-questions").textContent = bar;

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

    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
}
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
  fetchStartData();
});
quickButton.addEventListener("click", () => {
  fetchQuickData();
});
