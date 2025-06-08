const goBackLink = document.querySelector(".go_back");
const historyGoBack = () => {
    window.history.back();
    goBackLink.removeEventListener("click", historyGoBack);
};
goBackLink.addEventListener("click", historyGoBack);
