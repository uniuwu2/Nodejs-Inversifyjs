let errorMessage = document.getElementById("errorMessage");
if (errorMessage) alertify.error(errorMessage.dataset.test);

let successMessage = document.getElementById("successMessage");
if (successMessage) alertify.success(successMessage.dataset.test);
