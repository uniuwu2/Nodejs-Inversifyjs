// pagination
let currentPage = document.getElementById("page");

const buttons = document.querySelectorAll("#page-link");
buttons.forEach((button) => {
    button.addEventListener("click", function () {
        currentPage.value = this.value;
        console.log(currentPage.value);
    });
});

let searchField = document.getElementById("searchField");
if (searchField) {
    searchField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            if (currentPage) {
                currentPage.value = 1;
            }
            event.preventDefault();
            document.getElementById("search-form").submit();
        }
    });
}

let clearSearchButton = document.getElementById("clear-search");
if (clearSearchButton) {
    clearSearchButton.addEventListener("click", function () {
        searchField.value = "";
        document.getElementById("search-form").submit();
    });
}
var searchInput = document.getElementById("searchField");
if (searchInput) {
    searchInput.selectionStart = searchInput.value.length;
    searchInput.selectionEnd = searchInput.value.length;
    searchInput.focus();
}
