// Handle delete checkbox
const checkAll = document.getElementById("selectAllCheckbox");

if (checkAll) {
    checkAll.addEventListener("change", function () {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = checkAll.checked;
        });
    });
}

let deleteBtn = document.getElementById("deleteCheckedButton");
if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        let selectedIds = [];
        if (checkAll && checkAll.checked) {
            selectedIds = ["all"];
        } else {
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked && checkbox.value.startsWith("check-")) {
                    const id = checkbox.value.split("-")[1];
                    selectedIds.push(id);
                }
            });
        }
        if (selectedIds.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Chưa có sinh viên nào được chọn",
                showConfirmButton: true,
                timer: 3000,
            });
            return;
        }
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa sinh viên này không?",
            text: "Sinh viên sẽ bị xóa khỏi lớp học",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa",
        }).then((result) => {
            if (result.isConfirmed) {
                let pathName = window.location.pathname;
                let classId = pathName.split("/")[3];
                fetch(`/classroom/class/${classId}/student/delete`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedIds }),
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.status === 200) {
                            Swal.fire({
                                icon: "success",
                                title: "Đã xoá " + selectedIds.length + " sinh viên",
                                showConfirmButton: false,
                                timer: 3000,
                            });
                            loadData();
                            checkAll.checked = false;
                            // reloa
                            location.reload();
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: res.message,
                                showConfirmButton: false,
                                timer: 3000,
                            });
                        }
                    });
            }
        });
    });
}
async function loadData(sortBy = "", page = 1, sort = "asc", searchField = "") {
    let pathName = window.location.pathname;
    let classId = pathName.split("/")[3];
    await fetch(`/classroom/class/info/` + classId + `?searchField=${searchField}&page=${page}&sortBy=${sortBy}&sort=${sort}`)
        .then((res) => res.json())
        .then((res) => {
            const data = res;
            renderTable(page, data);
            if (data.classStudent.list.length !== 0) {
                renderPagination(data.page, data.limit, data.classStudent, data.lastPage, data.total);
            }
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set("page", page);
            url.searchParams.set("sortBy", sortBy);
            url.searchParams.set("sort", sort);
            url.searchParams.set("searchField", searchField);

            window.history.pushState({}, "", url);

            // kiểm tra checkbox select all
            const checkAll = document.getElementById("selectAllCheckbox");
            if (checkAll) {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach((checkbox) => {
                    checkbox.checked = checkAll.checked;
                });
            }
        });
}

let searchField = document.getElementById("searchField");
if (searchField) {
    const url = new URL(window.location);

    if (url.searchParams.get("searchField")) {
        searchField.value = url.searchParams.get("searchField");
    }
    searchField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (checkAll) {
                checkAll.checked = false;
            }
            const searchFieldDefault = searchField.value;
            const sortBy = url.searchParams.get("sortBy") ? url.searchParams.get("sortBy") : "";
            const sort = url.searchParams.get("sort") ? url.searchParams.get("sort") : "asc";
            loadData(sortBy, 1, sort, searchFieldDefault);
        }
    });
}
const url = new URL(window.location);
const searchFieldDefault = url.searchParams.get("searchField") ? url.searchParams.get("searchField") : "";
const sortBy = url.searchParams.get("sortBy") ? url.searchParams.get("sortBy") : "";
const sort = url.searchParams.get("sort") ? url.searchParams.get("sort") : "asc";
const page = url.searchParams.get("page") ? url.searchParams.get("page") : 1;
loadData(sortBy, page, sort, searchFieldDefault);

function renderTable(page, data) {
    const tbody = document.getElementById("studentTableBody");
    const users = data.classStudent.list;

    if (!users || users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Không có sinh viên nào</td>
            </tr>
        `;
        // Hide pagination if no data
        const pagination = document.getElementById("pagination");
        if (pagination) {
            pagination.innerHTML = "";
        }
        return;
    }
    tbody.innerHTML = users
        .map(
            (u, index) => `
      <tr id="stdRow-${u.id}">
        <td>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="check-${u.student.id}">
            </div>
        </td>
        <td>${index + 1 + (page - 1) * data.limit}</td>
        <td>${u.student.firstName}</td>
        <td>${u.student.lastName}</td>
        <td>${u.student.student.student_number}</td>
        <td>${u.student.email}</td>
        <td>${u.student.phoneNumber}</td>
        <td>19050201</td>

      </tr>
    `
        )
        .join("");
}

function renderPagination(page, limit, list, lastPage, total) {
    const container = document.getElementById("pagination");

    const url = new URL(window.location);

    let searchValue = "";
    if (searchField) {
        searchValue = searchField.value;
    }

    let sortBy = url.searchParams.get("sortBy") ? url.searchParams.get("sortBy") : "";
    let sort = url.searchParams.get("sort") ? url.searchParams.get("sort") : "asc";

    let totalPage = page * limit - limit;
    let totalOfPage = total;
    if (total > page * limit) {
        totalOfPage = page * limit;
    }

    let html = "";
    html += `
    <div class="bottom-of-table d-flex">
        <div class="col-md-6">
            <p class="mb-sm-0 total-pages">Showing `;
    if (list.list.length > 0) {
        html += `${totalPage + 1} - ${totalOfPage} of ${total}`;
    }
    html += `   
        </div>
        <div class="col-md-6">
        <div class="float-sm-end">
            <ul class="pagination mb-sm-0">
                <li class="page-item`;
    if (page === 1) {
        html += ` disabled`;
    }
    html += `">
                    <a class="page-link text-nowrap prev-btn" href="#" onclick="loadData('${sortBy}', ${page - 1}, '${sort}', '${searchValue}')">Previous</a>
                </li>`;
    if (page > 3) {
        html += `<button class="page-link" onclick="loadData('${sortBy}', 1, '${sort}', '${searchValue}')">1</button>`;
        html += `<button class="page-link" disabled>...</button>`;
    }
    let totalMax = page + 2;
    if (page + 3 === totalPage) {
        totalMax = totalPage - 2;
    }
    let currentPage = page - 1;
    if (page <= 3) {
        currentPage = 1;
    }

    for (let i = currentPage; i <= totalMax; i++) {
        if (i > 0 && i <= lastPage) {
            html += `<li class="page-item ${page === i ? "active" : ""}">
                <button class="page-link" onclick="loadData('${sortBy}', ${i}, '${sort}', '${searchValue}')">${i}</button>
            </li>`;
        }
    }
    if (page < lastPage - 2) {
        html += `<button class="page-link" disabled>...</button>`;
        html += `<button class="page-link" onclick="loadData('${sortBy}', ${lastPage}, '${sort}', '${searchValue}')">${lastPage}</button>`;
    }
    html += `
                <li class="page-item ${page === lastPage ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="loadData('${sortBy}', ${page + 1}, '${sort}', '${searchValue}')">Next</a>
                </li>
            </ul>
        </div>
    </div>
    </div>
    </div>`;

    container.innerHTML = html;
}

$(document).ready(function () {
    $("#addStudent").select2({
        placeholder: "Chọn sinh viên",
        dropdownParent: $("#addStudentModal"),
        closeOnSelect: false,
        ajax: {
            url: "/classroom/class/student/search",
            type: "GET",
            data: function (params) {
                return {
                    keyword: params.term,
                    departmentId: $("#addDepartment").val(),
                    classId: window.location.pathname.split("/")[3],
                };
            },
            processResults: function (data) {
                console.log(data);
                const results = data.studentList;
                if (results.length === 0) {
                    console;
                    return {
                        results: [
                            {
                                id: "no-results",
                                text: "Không tìm thấy sinh viên nào",
                            },
                        ],
                    };
                }

                const allOptions = results.map((student) => ({
                    id: student.id,
                    text: `${student.firstName} ${student.lastName} - ${student.student.student_number}`,
                }));

                if (allOptions.length > 0) {
                    allOptions.unshift({
                        id: "all",
                        text: "Tất cả",
                    });
                }
                return {
                    results: allOptions,
                };
            },
        },
    });
    $("#addStudetnBtn").click(function () {
        let classId = window.location.pathname.split("/")[3];
        $.ajax({
            url: "/classroom/class/" + classId + "/student/add",
            type: "POST",
            data: {
                studentId: $("#addStudent").val(),
            },
            success: function (response) {
                if (response.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Thêm sinh viên thành công",
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    loadData();
                    // Đóng modal
                    $("#addStudentModal").modal("hide");
                    // reload lại trang
                    location.reload();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: response.message,
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    // Đóng modal
                }
            },
            error: function (error) {
                Swal.fire({
                    icon: "error",
                    title: "Chưa có sinh viên nào được chọn",
                    showConfirmButton: false,
                    timer: 3000,
                });
                $("#addStudentModal").modal("hide");
            },
        });
    });

    $("#addDepartment").on("change", function () {
        const selectedDepartment = $(this).val();
        // Gửi yêu cầu AJAX để lấy danh sách sinh viên theo phòng ban

        $.ajax({
            url: "/classroom/class/student/department",
            type: "GET",
            data: {
                departmentId: selectedDepartment,
            },
            success: function (response) {
                const results = response.studentList;
                // Cập nhật lại danh sách sinh viên trong select2
                $("#addStudent").empty(); // Xóa các tùy chọn hiện tại
                results.forEach(function (result) {
                    $("#addStudent").append(`<option value="${result.id}">${result.firstName} ${result.lastName} - ${result.student.student_number}</option>`);
                });

                // Cập nhật lại select2
                $("#addStudent").select2({
                    placeholder: "Chọn sinh viên",
                    dropdownParent: $("#addStudentModal"),
                    closeOnSelect: false,
                });
            },
        });
    });
});

$("#addStudent").on("select2:selecting", function (e) {
    const selected = e.params.args.data;
    if (selected.id === "all") {
        const allOptions = $("#addStudent option")
            .map(function () {
                return this.value;
            })
            .get()
            .filter((value) => value !== "all");
        $("#addStudent").val(allOptions).trigger("change");

        setTimeout(() => {
            $(".select2-selection__choice").each(function () {
                if ($(this).text().includes("Tất cả")) {
                    $(this).remove(); // Ẩn tag "Tất cả"
                }
            });
        }, 0);
        $("#addStudent").select2("close");
    }
});
const addStudentModal = document.getElementById("addStudentModal");
const addStudentOriginal = $("#addStudent").html();
if (addStudentModal) {
    addStudentModal.addEventListener("hidden.bs.modal", function () {
        $("#addStudent").val(null).trigger("change");
        // Reset lại giá trị của select2
        $("#addStudent").empty(); // Xóa các tùy chọn hiện tại
        $("#addStudent").append(addStudentOriginal);
        // Cập nhật lại select2
        $("#addStudent").select2({
            placeholder: "Chọn sinh viên",
            dropdownParent: $("#addStudentModal"),
            closeOnSelect: false,
            ajax: {
                url: "/classroom/class/student/search",
                type: "GET",
                data: function (params) {
                    return {
                        keyword: params.term,
                        departmentId: $("#addDepartment").val(),
                        classId: window.location.pathname.split("/")[3],
                    };
                },
                processResults: function (data) {
                    console.log(data);
                    const results = data.studentList;
                    if (results.length === 0) {
                        console;
                        return {
                            results: [
                                {
                                    id: "no-results",
                                    text: "Không tìm thấy sinh viên nào",
                                },
                            ],
                        };
                    }

                    const allOptions = results.map((student) => ({
                        id: student.id,
                        text: `${student.firstName} ${student.lastName} - ${student.student.student_number}`,
                    }));

                    if (allOptions.length > 0) {
                        allOptions.unshift({
                            id: "all",
                            text: "Tất cả",
                        });
                    }
                    return {
                        results: allOptions,
                    };
                },
            },
        });
        let addDepartment = document.getElementById("addDepartment");
        if (addDepartment) {
            addDepartment.value = "ALL";
        }
    });
}

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

