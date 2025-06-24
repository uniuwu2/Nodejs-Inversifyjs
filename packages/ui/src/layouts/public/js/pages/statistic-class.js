// Hàm để tạo dropdown menu cho lớp học
function createClassDropdown() {
    const dropdownMenu = document.getElementById("classDropdownMenu");
    courses.forEach((coureItem) => {
        const classItem = document.createElement("a");
        classItem.className = "dropdown-item";
        classItem.href = "#";
        classItem.textContent = coureItem.courseName;
        classItem.addEventListener("click", function () {
            selectClass(coureItem.id, coureItem.courseName);
        });
        dropdownMenu.appendChild(classItem);
    });
}
// Hàm để xử lý khi người dùng chọn lớp học
function selectClass(classId, className) {
    // Cập nhật giá trị của input ẩn
    document.getElementById("class-id").value = classId;
    document.getElementById("class-select").value = className;
    document.getElementById("semester-select-container").classList.remove("d-none");
    document.getElementById("group-select-container").classList.remove("d-none");
    document.getElementById("searchBtnContainer").classList.remove("d-none");
}
function normalizeString(str) {
    return str
        .normalize("NFD") // tách dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, "") // xoá dấu
        .toLowerCase()
        .replace(/\s+/g, " ") // thay nhiều khoảng trắng bằng 1
        .trim();
}

// Sự kiện nhập liệu vào ô tìm kiếm
document.getElementById("class-select").addEventListener("input", function () {
    const input = this.value.toLowerCase();
    const dropdownItems = document.querySelectorAll("#classDropdownMenu .dropdown-item");
    dropdownItems.forEach((item) => {
        const itemText = item.textContent.toLowerCase();
        if (normalizeString(itemText).includes(normalizeString(input))) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
});

// gọi hàm để tạo dropdown khi trang được tải
document.addEventListener("DOMContentLoaded", createClassDropdown);
let totalSessions = 0;
let sessionDate = [];
let attended = [];
let absent = [];

// Xử lý sự kiện khi người dùng nhấn nút tìm kiếm
document.getElementById("searchBtn").addEventListener("click", function () {
    const courseId = document.getElementById("class-id").value;
    const semester = document.getElementById("semester-select").value;
    const group = document.getElementById("group-select").value;
    // Gửi yêu cầu AJAX đến server để lấy dữ liệu thống kê

    fetchData();
});
function fetchData(sortBy = null, sort = "ASC", page = 1) {
    const courseId = document.getElementById("class-id").value;
    const semester = document.getElementById("semester-select").value;
    const group = document.getElementById("group-select").value;
    // Gửi yêu cầu AJAX đến server để lấy dữ liệu thống kê
    fetch(`/statistic/class/table?courseId=${courseId}&semester=${semester}&group=${group}` + (sortBy ? `&sortBy=${sortBy}&sort=${sort}` : "") + `&page=${page}`)
        .then((response) => response.json())
        .then((data) => {
            // Xử lý dữ liệu và cập nhật bảng thống kê
            console.log(data);
            if (data.code === 200) {
                const courseInfoContainer = document.getElementById("course-info-container");
                courseInfoContainer.innerHTML = `
                            <h3>Thông tin lớp học</h3>
                            <div class="row mb-3">
                                <div class="col-md-6"><strong>Mã môn học:</strong> ${data.data.courseClass.course.courseCode}</div>
                                <div class="col-md-6"><strong>Tên môn học:</strong> ${data.data.courseClass.course.courseName}</div>
                                <div class="col-md-6"><strong>Học kì:</strong> ${data.data.courseClass.semester}</div>
                                <div class="col-md-6"><strong>Nhóm:</strong> ${data.data.courseClass.group}</div>
                                <div class="col-md-6"><strong>Số lượng sinh viên:</strong> ${data.data.studentList.length}/${data.data.courseClass.maxStudent}</div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6"><strong>Giảng viên:</strong> ${data.data.courseClass.teacher.firstName} ${data.data.courseClass.teacher.lastName}</div>
                                <div class="col-md-6"><strong>Email:</strong> ${data.data.courseClass.teacher.email}</div>
                                <div class="col-md-6"><strong>Điện thoại:</strong> ${data.data.courseClass.teacher.phoneNumber}</div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6"><strong>Tổng số học sinh:</strong> ${data.data.totalStudents}</div>
                                <div class="col-md-6"><strong>Tổng số buổi học:</strong> ${data.data.totalSessions}</div>
                                <div class="col-md-6"><strong>Tổng số buổi có mặt:</strong> ${data.data.totalAttendance}</div>
                                <div class="col-md-6"><strong>Tổng số buổi vắng:</strong> ${data.data.totalAbsent}</div>
                                <div class="col-md-6"><strong>Tỷ lệ có mặt:</strong> ${data.data.totalAttendanceRate}%</div>
                            </div>
                        `;
                // Cập nhật bảng thống kê sinh viên
                const studentStatisticsContainer = document.getElementById("student-statistics-container");
                const tbody = studentStatisticsContainer.querySelector("tbody");
                tbody.innerHTML = ""; // Xóa nội dung cũ
                // Thêm
                data.data.studentList.forEach((student) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                            <td>${student.firstName}</td>
                            <td>${student.lastName}</td>
                            <td>${student.studentNumber}</td>
                            <td>${student.studentClass}</td>
                            <td>${student.attendance}</td>
                            <td>${student.absent}</td>
                            <td>${student.attendanceRate}%</td>
                        `;
                    tbody.appendChild(tr);
                });

                // Cập nhật phân trang
                const paginationContainer = document.getElementById("pagination-container");
                paginationContainer.innerHTML = ""; // Xóa nội dung cũ
                let paginationHTML = `
                    <div class="bottom-of-table d-flex">
                        <div class="col-md-6">
                            <div>
                                <p class="mb-sm-0 total-pages">Hiển thị ${data.data.total > 0 ? (page - 1) * data.data.limit + 1 : 0} - ${Math.min(page * data.data.limit, data.data.total)} của ${data.data.total} kết quả</p>
                            </div>
                        </div>
                    `;
                paginationHTML += `
                        <div class="col-md-6">
                            <div class="float-sm-end">
                                <ul class="pagination mb-sm-0">
                                    <input hidden id="page" name="page" type="text" value="${page}" />
                                    <li class="page-item ${page === 1 ? "disabled" : ""}">
                                        <button class="page-link text-nowrap prev-btn" id="page-link" value="${page - 1}" onclick="fetchData('${sortBy}', '${sort}', ${page - 1})"><< Previous</button>
                                    </li>
                    `;
                if (page > 3) {
                    paginationHTML += `
                            <button class="page-link" id="page-link" value="1" onclick="fetchData('${sortBy}', '${sort}', 1)">1</button>
                            <button class="page-link" disabled>...</button>
                        `;
                }
                const totalMax = page + 3 === data.data.lastPage ? data.data.lastPage - 2 : page + 2;
                const currentPage = page <= 3 ? 1 : page - 1;
                for (let i = currentPage; i <= totalMax; i++) {
                    if (i > 0 && i <= data.data.lastPage) {
                        paginationHTML += `
                                <li class="page-item ${page === i ? "active" : ""}">
                                    <button class="page-link" id="page-link" value="${i}" onclick="fetchData('${sortBy}', '${sort}', ${i})">${i}</button>
                                </li>
                            `;
                    }
                }
                if (page < data.data.lastPage - 2) {
                    paginationHTML += `
                            <button class="page-link" disabled>...</button>
                            <button class="page-link" id="page-link" value="${data.data.lastPage}" onclick="fetchData('${sortBy}', '${sort}', ${data.data.lastPage})">${data.data.lastPage}</button>
                        `;
                }
                paginationHTML += `
                                    <li class="page-item ${page === data.data.lastPage ? "disabled" : ""}">
                                        <button class="page-link text-nowrap" id="page-link" value="${page + 1}" onclick="fetchData('${sortBy}', '${sort}', ${page + 1})">Next >></button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    `;
                paginationContainer.innerHTML = paginationHTML;

                totalSessions = data.data.totalSessions;
                data.data.dataForChart.length > 0 ? (sessionDate = data.data.dataForChart.map((item) => item.sessionDate)) : (sessionDate = []);
                data.data.dataForChart.length > 0 ? (attended = data.data.dataForChart.map((item) => item.totalAttendance)) : (totalAttendance = []);
                data.data.dataForChart.length > 0 ? (absent = data.data.dataForChart.map((item) => item.totalAbsent)) : (totalAbsent = []);
                // Xoá biểu đồ cũ nếu có
                const existingChart = Chart.getChart("attendanceChart");
                if (existingChart) {
                    existingChart.destroy();
                }
                // Cập nhật biểu đồ
                const ctx = document.getElementById("attendanceChart").getContext("2d");
                const attendanceChart = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: sessionDate,
                        datasets: [
                            {
                                label: "Có mặt",
                                data: attended,
                                backgroundColor: "rgba(54, 162, 235, 0.7)",
                            },
                            {
                                label: "Vắng",
                                data: absent,
                                backgroundColor: "rgba(255, 99, 132, 0.7)",
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 5,
                                },
                            },
                        },
                    },
                });
            } else {
                const courseInfoContainer = document.getElementById("course-info-container");
                courseInfoContainer.innerHTML = `<div class="alert alert-danger">Không tìm thấy dữ liệu cho lớp học này.</div>`;
                const studentStatisticsContainer = document.getElementById("student-statistics-container");
                studentStatisticsContainer.querySelector("tbody").innerHTML = '<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>';
                // Xoá phân trang
                const paginationContainer = document.getElementById("pagination-container");
                paginationContainer.innerHTML = "";
                // Xoá biểu đồ nếu không có dữ liệu
                const existingChart = Chart.getChart("attendanceChart");
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        })
        .catch((error) => console.error("Error fetching data:", error));
}

// Thêm sự kiện click cho các tiêu đề bảng để sắp xếp
document.querySelectorAll('th[role="button"]').forEach((th) => {
    th.addEventListener("click", function () {
        // Nếu như bảng không có dữ liệu thì không làm gì cả
        if (document.getElementById("no-data-here")) {
            return;
        }
        const sortBy = this.id.replace("sort-by-", "");
        const currentSort = this.dataset.sort || "ASC";
        const newSort = currentSort === "ASC" ? "DESC" : "ASC";
        // Nếu sort là 'ASC', thì chuyển sang 'DESC' và ngược lại
        // Cập nhật tiêu đề bảng để hiển thị hướng sắp xếp
        if (newSort === "ASC") {
            this.innerHTML = `${this.textContent} <i class="ti ti-arrow-narrow-up"></i>`;
        } else {
            this.innerHTML = `${this.textContent} <i class="ti ti-arrow-narrow-down"></i>`;
        }
        // Một cái bấm thì các  cái còn lại sẽ trở về mặc định
        document.querySelectorAll('th[role="button"]').forEach((otherTh) => {
            if (otherTh !== this) {
                otherTh.innerHTML = `${otherTh.textContent} <i class="ti ti-arrows-sort"></i>`;
                otherTh.dataset.sort = "ASC"; // Đặt lại sort của các tiêu đề khác về ASC
            }
        });
        this.dataset.sort = newSort; // Cập nhật thuộc tính data-sort
        fetchData(sortBy, newSort);
    });
});
