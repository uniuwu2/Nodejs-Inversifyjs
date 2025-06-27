// Hàm để tạo dropdown menu cho lớp học
function createClassDropdown() {
    const dropdownMenu = document.getElementById("studentDropdownMenu");
    students.forEach((student) => {
        const option = document.createElement("a");
        option.className = "dropdown-item";
        option.href = "#";
        option.textContent = student.firstName + " " + student.lastName + " - " + student.student.student_number;
        option.onclick = () => selectStudent(student.id);
        dropdownMenu.appendChild(option);
    });
}
// Gọi hàm để tạo dropdown menu khi trang được tải
document.addEventListener("DOMContentLoaded", createClassDropdown);
// Hàm để xử lý khi người dùng chọn lớp học
function selectStudent(studentId) {
    const student = students.find((s) => s.id === studentId);
    if (student) {
        document.getElementById("student-id").value = student.id;
        document.getElementById("studentSelect").value = student.firstName + " " + student.lastName + " - " + student.student.student_number;
        renderData(studentId);
    }
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
document.getElementById("studentSelect").addEventListener("input", function () {
    const input = normalizeString(this.value);
    const dropdownItems = document.querySelectorAll("#studentDropdownMenu .dropdown-item");
    dropdownItems.forEach((item) => {
        const itemText = normalizeString(item.textContent);
        if (itemText.includes(input)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
});

// Hàm để render dữ liệu thống kê sinh viên
function renderData(studentId, sortBy = null, sort = "ASC", page = 1) {
    // Lấy dữ liệu thống kê cho sinh viên đã chọn
    fetch(`/statistic/class/student/table?studentId=${studentId}` + (sortBy ? `&sortBy=${sortBy}&sort=${sort}` : "") + `&page=${page}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.code == 200) {
                const tableBody = document.querySelector("#course-table-container tbody");
                tableBody.innerHTML = ""; // Xoá nội dung cũ

                if (data.data) {
                    data.data.courseList.forEach((item) => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                                <td>${item.name}</td>
                                <td>${item.code}</td>
                                <td>${item.semester}</td>
                                <td>${item.group}</td>
                                <td>${item.teacher}</td>
                                <td>${item.totalAttendance}</td>
                                <td>${item.totalAbsent}</td>
                                <td>${item.attendanceRate.toFixed(2)}%</td>
                            `;
                        tableBody.appendChild(row);
                    });
                } else {
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="7" class="text-center">Không có dữ liệu</td>`;
                    tableBody.appendChild(noDataRow);
                }
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
                                        <button class="page-link text-nowrap prev-btn" id="page-link" value="${page - 1}" onclick="renderData('${studentId}', '${sortBy}', '${sort}', ${page - 1})"><< Trước</button>
                                    </li>
                    `;
                if (page > 3) {
                    paginationHTML += `
                            <button class="page-link" id="page-link" value="1" onclick="renderData('${studentId}', '${sortBy}', '${sort}', 1)">1</button>
                            <button class="page-link" disabled>...</button>
                        `;
                }
                const totalMax = page + 3 === data.data.lastPage ? data.data.lastPage - 2 : page + 2;
                const currentPage = page <= 3 ? 1 : page - 1;
                for (let i = currentPage; i <= totalMax; i++) {
                    if (i > 0 && i <= data.data.lastPage) {
                        paginationHTML += `
                                <li class="page-item ${page === i ? "active" : ""}">
                                    <button class="page-link" id="page-link" value="${i}" onclick="renderData('${studentId}', '${sortBy}', '${sort}', ${i})">${i}</button>
                                </li>
                            `;
                    }
                }
                if (page < data.data.lastPage - 2) {
                    paginationHTML += `
                            <button class="page-link" disabled>...</button>
                            <button class="page-link" id="page-link" value="${data.data.lastPage}" onclick="renderData('${studentId}', '${sortBy}', '${sort}', ${data.data.lastPage})">${data.data.lastPage}</button>
                        `;
                }
                paginationHTML += `
                                    <li class="page-item ${page === data.data.lastPage ? "disabled" : ""}">
                                        <button class="page-link text-nowrap" id="page-link" value="${page + 1}" onclick="renderData('${studentId}', '${sortBy}', '${sort}', ${page + 1})">Sau >></button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    `;
                paginationContainer.innerHTML = paginationHTML;
            } else {
                console.error("Error fetching student statistics:", data.message);
            }
            // Xoá nội dung cũ của biểu đồ nếu có
            const existingChart = Chart.getChart("studentChart");
            if (existingChart) {
                existingChart.destroy();
            }
            // Cập nhật biểu đồ
            const ctx = document.getElementById("studentChart").getContext("2d");
            // biểu đồ cột
            data.data.dataForChart.length > 0 ? (attendance = data.data.dataForChart.map((item) => item.totalAttendance)) : (attendance = []);
            data.data.dataForChart.length > 0 ? (absent = data.data.dataForChart.map((item) => item.totalAbsent)) : (absent = []);
            const studentChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: data.data.dataForChart.map((item) => item.name),
                    datasets: [
                        {
                            label: "Có mặt",
                            data: attendance,
                            backgroundColor: "#36a2eb",
                        },
                        {
                            label: "Vắng",
                            data: absent,
                            backgroundColor: "#ff6384",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Môn học",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Số buổi",
                            },
                        },
                    },
                },
            });
        })
        .catch((error) => console.error("Error fetching student statistics:", error));
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
        renderData(document.getElementById("student-id").value, sortBy, newSort);
    });
});
