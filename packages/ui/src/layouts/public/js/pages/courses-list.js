// Hiển thị tên tệp khi người dùng chọn tệp
document.getElementById("csv-file").addEventListener("change", function (event) {
    const fileName = event.target.files[0]?.name;
    if (fileName) {
        document.getElementById("file-name").textContent = `Selected file: ${fileName}`;
    }
});

let openModal = document.getElementsByClassName("open-modal");
if (openModal.length > 0) {
    openModal[0].click();
}

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
        url: "/classroom/course-upload-csv",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            // alert("File uploaded successfully!");
            // Reload the page to see the updated user list
            location.reload();
        },
        error: function (xhr, status, error) {
            alert("Error uploading file: " + error);
        },
    });
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

document.querySelectorAll(".course-link").forEach((link) => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const courseId = this.getAttribute("data-id");
        $.ajax({
            url: "/classroom/course/info/" + courseId,
            type: "GET",
            success: function (response) {
                document.getElementById("courseId").textContent = response.id;
                document.getElementById("courseName").textContent = response.courseName;
                document.getElementById("courseCode").textContent = response.courseCode;
                document.getElementById("credit").textContent = response.credit;
                document.getElementById("courseDepartment").textContent = response.department.departmentName;
                document.getElementById("courseDescription").textContent = response.courseDescription;
            },
            error: function (xhr, status, error) {
                console.error("Error fetching course info:", error);
            },
        });
    });
});

document.querySelectorAll(".edit-course-link").forEach((link) => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const courseId = this.getAttribute("data-edit-id");
        console.log(courseId);
        $.ajax({
            url: "/classroom/course/info/" + courseId,
            type: "GET",
            success: function (response) {
                document.getElementById("editCourseId").value = response.id;
                document.getElementById("editCourseName").value = response.courseName;
                document.getElementById("editCourseCode").value = response.courseCode;
                document.getElementById("editCredit").value = response.credit;
                document.getElementById("editCourseDepartment").value = response.department.id;
                document.getElementById("editCourseDescription").value = response.courseDescription;
            },
            error: function (xhr, status, error) {
                console.error("Error fetching course info:", error);
            },
        });
    });
});
$(document).ready(function () {
    $("#createCourseBtn").click(function () {
        $.ajax({
            url: "/classroom/course/create",
            type: "POST",
            data: {
                courseName: $("#create-courseName").val(),
                courseCode: $("#create-courseCode").val(),
                credit: $("#create-credit").val(),
                departmentId: $("#create-departmentId").val(),
                url: window.location.href,
            },
            dataType: "json",
            success: function (response) {
                if (response.errors) {
                    if ($(".invalid-feedback")) {
                        $(".invalid-feedback").remove();

                        if (response.errors.courseName) {
                            $("#create-courseName").addClass("form-error");
                            $("#create-courseName").after(`<div class="invalid-feedback d-block">${response.errors.courseName}</div>`);
                        }
                        if (response.errors.courseCode) {
                            $("#create-courseCode").addClass("form-error");
                            $("#create-courseCode").after(`<div class="invalid-feedback d-block">${response.errors.courseCode}</div>`);
                        }
                        if (response.errors.credit) {
                            $("#create-credit").addClass("form-error");
                            $("#create-credit").after(`<div class="invalid-feedback d-block">${response.errors.credit}</div>`);
                        }
                    }
                } else {
                    let url = response.url;
                    window.location.href = url;
                }
            },
        });
    });
    let courseList = document.querySelectorAll(".edit-course");
    if (courseList) {
        courseList.forEach((course) => {
            $(`#${course.id}`).click(function () {
                let id = course.id.split("-")[2];
                let editBtn = document.getElementById(`edit-course-${id}`);
                editBtn.classList.add("modal-openning");

                let name = document.getElementById(`editCourseName`);
                let code = document.getElementById(`editCourseCode`);
                let credit = document.getElementById(`editCredit`);
                let department = document.getElementById(`editCourseDepartment`);
                let description = document.getElementById(`editCourseDescription`);
                let oldData = document.getElementById(`coursrRow-${id}`).children;
                Array.from(oldData).forEach((data) => {
                    if (data.className === "course-name") {
                        name.value = data.innerText;
                    }
                    if (data.className === "course-code") {
                        code.value = data.innerText;
                    }
                    if (data.className === "credit") {
                        credit.value = data.innerText;
                    }
                    if (data.className === "department") {
                        let departmentId = data.getAttribute("data-department-id");
                        department.value = departmentId;
                    }
                    if (data.className === "description") {
                        description.value = data.innerText;
                    }
                });
                $("#saveCourseBtn").attr("data-id", id);
            });
        });

        $("#saveCourseBtn").click(function () {
            let id = $(this).attr("data-id");
            $.ajax({
                url: "/classroom/course/" + id + "/edit",
                type: "POST",
                data: {
                    id: id,
                    courseName: $("#editCourseName").val(),
                    courseCode: $("#editCourseCode").val(),
                    credit: $("#editCredit").val(),
                    departmentId: $("#editCourseDepartment").val(),
                    url: window.location.href,
                },
                success: function (response) {
                    if (response.errors) {
                        if ($(".invalid-feedback")) {
                            $(".invalid-feedback").remove();
                            if (response.errors.courseName) {
                                $("#editCourseName").addClass("form-error");
                                $("#editCourseName").after(`<div class="invalid-feedback d-block">${response.errors.courseName}</div>`);
                            }
                            if (response.errors.courseCode) {
                                $("#editCourseCode").addClass("form-error");
                                $("#editCourseCode").after(`<div class="invalid-feedback d-block">${response.errors.courseCode}</div>`);
                            }
                            if (response.errors.credit) {
                                $("#editCredit").addClass("form-error");
                                $("#editCredit").after(`<div class="invalid-feedback d-block">${response.errors.credit}</div>`);
                            }
                        }
                    } else {
                        let url = response.url;
                        window.location.href = url;
                    }
                },
            });
        });
    }
});

let createModal = document.getElementById("createCourseModal");
// Close create modal
createModal.addEventListener("hidden.bs.modal", function () {
    let error = document.getElementsByClassName("invalid-feedback");
    let courseName = document.getElementById("create-courseName");
    let courseCode = document.getElementById("create-courseCode");
    let credit = document.getElementById("create-credit");

    courseName.value = "";
    courseCode.value = "";
    credit.value = "";
    courseName.classList.remove("form-error");
    courseCode.classList.remove("form-error");
    credit.classList.remove("form-error");

    if (error.length > 0) {
        Array.from(error).forEach((err) => {
            err.remove();
        });
    }
});
// Handle button delete
let courses = document.getElementById("courses");

function getHrefInput(form) {
    let input = document.createElement("input");
    input.type = "hidden";
    input.id = "href";
    input.name = "href";
    let value = document.location.search;
    if (JSON.parse(courses.dataset.test).length == 1 && form.action.indexOf(`delete`) > -1 && Number(currentPage.value) !== 1) {
        let getPageIndex = new URLSearchParams(value.substring(value.indexOf("?")));
        let getPage = getPageIndex.get("page");
        value = value.replace(getPage, getPage - 1);
    }
    input.value = String(value);
    form.appendChild(input);
}
let courseRow;
let params;
if (courses) {
    JSON.parse(courses.dataset.test).forEach((id) => {
        params = document.getElementById(`sa-params-${id}`);
        forms = document.getElementById(`form-delete`);
        if (!forms) {
            forms = document.createElement("form");
            forms.id = "form-delete";
            forms.style.display = "none";
            document.getElementById(`delete-course-${id}`).appendChild(forms);
        }
        courseRow = document.getElementById(`coursrRow-${id}`);
        if (params && courseRow) {
            params.addEventListener("click", function () {
                Swal.fire({
                    title: "Delete course",
                    text: "Are you sure you want to delete this course?",
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
                        forms.action = "/classroom/course/" + id + "/delete";
                        getHrefInput(forms);
                        forms.submit();
                    }
                });
            });
            let modal = document.getElementById("editCourseModal");
            modal.addEventListener("hidden.bs.modal", function () {
                let error = document.getElementsByClassName("invalid-feedback");
                let courseName = document.getElementById("editCourseName");
                let courseCode = document.getElementById("editCourseCode");
                let credit = document.getElementById("editCredit");

                courseName.value = "";
                courseCode.value = "";
                credit.value = "";
                courseName.classList.remove("form-error");
                courseCode.classList.remove("form-error");
                credit.classList.remove("form-error");
                if (error.length > 0) {
                    Array.from(error).forEach((err) => {
                        err.remove();
                    });
                }
            });
        }
    });
}
