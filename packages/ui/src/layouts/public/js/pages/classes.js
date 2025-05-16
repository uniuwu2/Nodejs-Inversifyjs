// Hiển thị tên tệp khi người dùng chọn tệp
document.getElementById("csv-file").addEventListener("change", function (event) {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
        document.getElementById("file-name").textContent = `Selected file: ${fileName}`;
    }
});

// Hàm upload CSV khi người dùng nhấn nút Upload
function uploadCSV() {
    const fileInput = document.getElementById("csv-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file before uploading!");
        return;
    }
    const formData = new FormData();
    formData.append("file", file);

    // Gửi tệp đến API backend
    $.ajax({
        url: "/classroom/course-class-upload-csv",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            alert("File uploaded successfully!");
            location.reload();
        },
        error: function (xhr, status, error) {
            alert("Error uploading file: " + error);
        },
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

let sortBy = document.getElementById("sortBy");
function sortTypeSwitch() {
    let sort = document.getElementById("sort");
    if (sort.value === "ASC") sort.value = "DESC";
    else sort.value = "ASC";
}

$(document).ready(function () {
    $("#teacherSelect").select2({
        placeholder: "Chọn giáo viên",
    });

    $("#courseSelect").select2({
        placeholder: "Chọn khóa học",
    });
});

$('#teacherSelect').on('change', function (e) {
  const selectedValue = $(this).val();
  document.getElementById("search-form").submit();
});

$('#courseSelect').on('change', function (e) {
  const selectedValue = $(this).val();
  document.getElementById("search-form").submit();
});

// Filter by Semester
let semester = document.getElementById("semesterSelect");
if (semester) {
    semester.addEventListener("change", function () {
        document.getElementById("search-form").submit();
    });
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
let sortCourseName = document.getElementById("sort-by-course");
if (sortCourseName) {
    sortCourseName.addEventListener("click", function () {
        if (sortBy.value === "courseName") sortTypeSwitch();
        sortBy.value = "courseName";
        document.getElementById("search-form").submit();
    });
}

// Sort by group name
let sortGroupName = document.getElementById("sort-by-group");
if (sortGroupName) {
    sortGroupName.addEventListener("click", function () {
        if (sortBy.value === "group") sortTypeSwitch();
        sortBy.value = "group";
        document.getElementById("search-form").submit();
    });
}

// Sort by teacher
let sortTeacher = document.getElementById("sort-by-teacher");
if (sortTeacher) {
    sortTeacher.addEventListener("click", function () {
        if (sortBy.value === "teacherName") sortTypeSwitch();
        sortBy.value = "teacherName";
        document.getElementById("search-form").submit();
    });
}

// Sort by semester
let sortSemester = document.getElementById("sort-by-semester");
if (sortSemester) {
    sortSemester.addEventListener("click", function () {
        if (sortBy.value === "semester") sortTypeSwitch();
        sortBy.value = "semester";
        document.getElementById("search-form").submit();
    });
}
let classRow;
let params;
let classes = document.getElementById("courseClasses");

if (classes) {
    JSON.parse(classes.dataset.test).forEach((id) => {
        params = document.getElementById(`sa-params-${id}`);
        forms = document.getElementById(`form-delete`);
        if (!forms) {
            forms = document.createElement("form");
            forms.id = "form-delete";
            form.style.display = "none";
            document.getElementById("delete-class-${id}").appendChild(forms);
        }
        classRow = document.getElementById(`classRow-${id}`);
        if (params && classRow) {
            params.addEventListener("click", function () {
                Swal.fire({
                    title: "Delete class",
                    text: "Are you sure you want to delete this class?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes",
                    cancelButtonText: "Cancel",
                    confirmButtonClass: "btn btn-success mt-2",
                    cancelButtonClass: "btn btn-danger ms-2 mt-2",
                    buttonsStyling: false,
                    focusCancel: true,
                }).then((result) => {
                    if (result.value) {
                        forms.method = "POST";
                        forms.action = "/classroom/class/" + id + "/delete";
                        getHrefInput(forms);
                        forms.submit();
                    }
                });
            });
        }
    });
}