console.log("gg");

populateDropdown();
async function populateDropdown() {
  const response = await fetch("https://opentdb.com/api_category.php");
  const data = await response.json();
  const select = document.getElementById("mySelect");
  console.log(data.trivia_categories);

  data.trivia_categories.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}
