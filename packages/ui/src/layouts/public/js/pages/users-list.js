function getHrefInput(form, list) {
    let input = document.createElement("input");
    input.type = "hidden";
    input.id = "href";
    input.name = "href";
    let value = document.location.search;
    if (list && list.length === 1 && Number(currentPage.value) !== 1) {
        let getPageIndex = new URLSearchParams(value.substring(value.indexOf("?")));
        let getPage = getPageIndex.get("page");
        value = value.replace(getPage, Number(currentPage.value) - 1);
    }
    input.value = String(value);
    if (form.children.length === 0) {
        form.appendChild(input);
    }
}

// Hiển thị tên tệp khi người dùng chọn tệp
document.getElementById("csv-file").addEventListener("change", function (event) {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
        document.getElementById("file-name").textContent = `Selected file: ${fileName}`;
    }
});

// // Hàm upload CSV khi người dùng nhấn nút Upload
function uploadCSV() {
    const fileInput = document.getElementById("csv-file");
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire({
            title: "Chưa chọn tệp",
            text: "Vui lòng chọn tệp CSV để tải lên.",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonClass: "btn btn-success mt-2",
            buttonsStyling: false,
        });
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Gửi tệp đến API backend
    $.ajax({
        url: "/users/import_csv",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            Swal.fire({
                title: "Tải lên thành công",
                text: "Tệp CSV đã được tải lên thành công.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonClass: "btn btn-success mt-2",
                buttonsStyling: false,
            });
            // Reload the page to see the updated user list
            location.reload();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: "Lỗi tải lên",
                text: "Đã xảy ra lỗi khi tải lên tệp CSV. Vui lòng thử lại.",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonClass: "btn btn-danger mt-2",
                buttonsStyling: false,
            });
        },
    });
}

// Filter by role
let role = document.getElementById("roleSelect");
// let openModalSpinner = document.getElementById("openModal");
if (role)
    role.addEventListener("change", function () {
        // openModalSpinner.click();
        if (currentPage) {
            currentPage.value = 1;
        }
        document.getElementById("search-form").submit();
    });

// Filter by valid
let valid = document.getElementById("validSelect");
if (valid)
    valid.addEventListener("change", function () {
        // openModalSpinner.click();
        if (currentPage) {
            currentPage.value = 1;
        }
        document.getElementById("search-form").submit();
    });

let sortBy = document.getElementById("sortBy");

function sortTypeSwitch() {
    let sort = document.getElementById("sort");
    if (sort.value === "ASC") sort.value = "DESC";
    else sort.value = "ASC";
}

// Sort by firstName
let sortFirstName = document.getElementById("sort-by-firstName");
if (sortFirstName)
    sortFirstName.addEventListener("click", function () {
        if (sortBy.value === "firstName") sortTypeSwitch();
        sortBy.value = "firstName";
        document.getElementById("search-form").submit();
    });
// Sort by firstName
let sortId = document.getElementById("sort-by-id");
if (sortId)
    sortId.addEventListener("click", function () {
        if (sortBy.value === "id") sortTypeSwitch();
        sortBy.value = "id";
        document.getElementById("search-form").submit();
    });

// Sort by lastName
let sortLastName = document.getElementById("sort-by-lastName");
if (sortLastName)
    sortLastName.addEventListener("click", function () {
        if (sortBy.value === "lastName") sortTypeSwitch();
        sortBy.value = "lastName";
        document.getElementById("search-form").submit();
    });

// Sort by email
let sortEmail = document.getElementById("sort-by-email");
if (sortEmail)
    sortEmail.addEventListener("click", function () {
        if (sortBy.value === "email") sortTypeSwitch();
        sortBy.value = "email";
        document.getElementById("search-form").submit();
    });

// Handle button delete
let userList = document.getElementById("users").dataset.test;
let userRow;
let params;
if (userList) {
    JSON.parse(userList).forEach((id) => {
        params = document.getElementById(`sa-params-${id}`);
        updateParams = document.getElementById(`btn-update-${id}`);
        forms = document.getElementById(`form-delete`);
        formActive = document.getElementById("form-active");
        userRow = document.getElementsByClassName(`user-${id}`);
        if (params && userRow) {
            params.addEventListener("click", function () {
                Swal.fire({
                    title: "Vô hiệu hoá người dùng",
                    text: "Bạn có chắc chắn muốn vô hiệu hoá người dùng này không?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Vô hiệu hoá",
                    cancelButtonText: "Huỷ bỏ",
                    confirmButtonClass: "btn btn-success mt-2",
                    cancelButtonClass: "btn btn-danger ms-2 mt-2",
                    buttonsStyling: false,
                    focusCancel: true,
                }).then(function (result) {
                    if (result.value) {
                        getHrefInput(forms, JSON.parse(userList));
                        forms.method = "POST";
                        forms.action = `/users/${id}/delete`;
                        console.log(forms);
                        forms.submit();
                    }
                });
            });
        }
    });
}

$("body").on("change", ".onoffswitch input", function (event, state) {
    var switch_url = $(this).data("switch-url");
    if (!switch_url) {
        return;
    }
    var userId = $(this).data("user-id");
    if ($(this).is(":checked") === true) {
        var isChecked = 1;
    } else {
        var isChecked = 0;
    }
    $.ajax({
        url: switch_url,
        type: "POST",
        data: {
            isChecked: isChecked,
        },
        success: function (response) {
            console.log(response);
            if (response.code == 200) {
                Swal.fire({
                    title: "Cập nhật thành công",
                    text: response.message || "Trạng thái người dùng đã được cập nhật.",
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonClass: "btn btn-success mt-2",
                    buttonsStyling: false,
                });
            } else {
                Swal.fire({
                    title: "Cập nhật thất bại",
                    text: response.message || "Không thể cập nhật trạng thái người dùng.",
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonClass: "btn btn-danger mt-2",
                    buttonsStyling: false,
                });
            }
        }
    });
});
