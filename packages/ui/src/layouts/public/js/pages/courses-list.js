
// Hiển thị tên tệp khi người dùng chọn tệp
document.getElementById('csv-file').addEventListener('change', function (event) {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
        document.getElementById('file-name').textContent = `Selected file: ${fileName}`;
    }
});

// Hàm upload CSV khi người dùng nhấn nút Upload
function uploadCSV() {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file before uploading!');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);

    // Gửi tệp đến API backend
    $.ajax({
        url: '/classroom/course-upload-csv',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            alert('File uploaded successfully!');
            // Reload the page to see the updated user list
            location.reload();
        },
        error: function (xhr, status, error) {
            alert('Error uploading file: ' + error);
        }
    });
}



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

// Filter by role
let department = document.getElementById("departmentSelect");
// let openModalSpinner = document.getElementById("openModal");
if (department)
    department.addEventListener("change", function () {
        // openModalSpinner.click();
        document.getElementById("search-form").submit();
    });

let sortBy = document.getElementById("sortBy");

function sortTypeSwitch() {
    let sort = document.getElementById("sort");
    if (sort.value === "ASC") sort.value = "DESC";
    else sort.value = "ASC";
}

// Sort by id  
let sortId = document.getElementById("sort-by-id");
if (sortId) {
    sortId.addEventListener("click", function () {
        if (sortBy.value === "id") sortTypeSwitch();
        sortBy.value = "id";
        document.getElementById("search-form").submit();
    });
}

// Sort by course name
let sortCourseName = document.getElementById("sort-by-courseName");
if (sortCourseName) {
    sortCourseName.addEventListener("click", function () {
        if (sortBy.value === "courseName") sortTypeSwitch();
        sortBy.value = "courseName";
        document.getElementById("search-form").submit();
    });

}

// Sort by department
let sortDepartment = document.getElementById("sort-by-department");
if (sortDepartment) {
    sortDepartment.addEventListener("click", function () {
        if (sortBy.value === "department") sortTypeSwitch();
        sortBy.value = "department";
        document.getElementById("search-form").submit();
    });
}

// Sort by credit
let sortCredit = document.getElementById("sort-by-credit");
if (sortCredit) {
    sortCredit.addEventListener("click", function () {
        if (sortBy.value === "credit") sortTypeSwitch();
        sortBy.value = "credit";
        document.getElementById("search-form").submit();
    });
}


// Sort by course code
let sortCourseCode = document.getElementById("sort-by-courseCode");
if (sortCourseCode) {
    sortCourseCode.addEventListener("click", function () {
        if (sortBy.value === "courseCode") sortTypeSwitch();
        sortBy.value = "courseCode";
        document.getElementById("search-form").submit();
    });
}

// Handle button delete
// let userList = document.getElementById("userList").dataset.test;
// let userRow;
// let params;
// if (userList)
//     JSON.parse(userList).forEach((id) => {
//         params = document.getElementById(`sa-params-${id}`);
//         updateParams = document.getElementById(`btn-update-${id}`);
//         forms = document.getElementById(`form-delete`);
//         formActive = document.getElementById("form-active");
//         userRow = document.getElementsByClassName(`user-${id}`);
//         if (params && userRow) {
//             params.addEventListener("click", function () {
//                 Swal.fire({
//                     title: "本当に削除しますか？",
//                     text: "元に戻すことはできません！",
//                     icon: "warning",
//                     showCancelButton: true,
//                     confirmButtonText: "削除する",
//                     cancelButtonText: "キャンセル",
//                     confirmButtonClass: "btn btn-success mt-2",
//                     cancelButtonClass: "btn btn-danger ms-2 mt-2",
//                     buttonsStyling: false,
//                     focusCancel: true,
//                 }).then(function (result) {
//                     if (result.value) {
//                         getHrefInput(forms, JSON.parse(userList));
//                         forms.method = "POST";
//                         forms.action = `/users-list/${id}/delete`;
//                         forms.submit();
//                     }
//                 });
//             });
//         }

//         if (updateParams) {
//             if (!formActive) {
//                 formActive = document.createElement("form");
//                 formActive.id = "form-active";
//                 formActive.style.display = "none";
//                 updateParams.appendChild(formActive);
//             }
//             updateParams.addEventListener("click", function () {
//                 getHrefInput(formActive);
//                 formActive.method = "POST";
//                 formActive.action = `/users-list/${id}/active`;
//                 formActive.submit();
//             });
//         }
//     });
