$(document).ready(function () {
    let studentList = document.querySelectorAll(".edit-student-status");
    if (studentList) {
        studentList.forEach((student) => {
            $(`#${student.id}`).click(function () {
                let id = student.id.split("-")[2];
                let editBtn = document.getElementById(`edit-student-${id}`);
                editBtn.classList.add("modal-openning");
                let studentStatusSelect = document.getElementById("studentStatusSelect");
                let studentNote = document.getElementById("studentNote");
                let oldData = document.getElementById(`studentRow-${id}`).children;
                Array.from(oldData).forEach((data) => {
                    if (data.className.includes("student-status")) {
                        let status = data.getAttribute("data-status");
                        studentStatusSelect.value = status;
                    }
                    if (data.className.includes("student-note")) {
                        studentNote.value = data.innerText;
                    }
                });
                $("#editStudentStatus").attr("data-id", id);
            });
        });

        $("#editStudentStatus").click(function () {
            let id = $(this).attr("data-id");
            $.ajax({
                url: "/events/event/editStudentStatus",
                type: "POST",
                data: {
                    id: id,
                    eventId: eventId,
                    status: $("#studentStatusSelect").val(),
                    note: $("#studentNote").val(),
                    url: window.location.href,
                },
                success: function (response) {
                    if (response.code === 200) {
                        Swal.fire({
                            icon: "success",
                            title: "Cập nhật trạng thái thành công",
                            showConfirmButton: false,
                            timer: 1000,
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: response.message,
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    }
                },
            });
        });
    }
});

let sortBy = document.getElementById("sortBy");

function sortTypeSwitch() {
    let sort = document.getElementById("sort");
    if (sort.value === "ASC") sort.value = "DESC";
    else sort.value = "ASC";
}

let sortFirstName = document.getElementById("sort-by-firstName");
if (sortFirstName) {
    sortFirstName.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "firstName";
        document.getElementById("search-form").submit();
    });
}

let sortLastName = document.getElementById("sort-by-lastName");
if (sortLastName) {
    sortLastName.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "lastName";
        document.getElementById("search-form").submit();
    });
}

let sortEmail = document.getElementById("sort-by-email");
if (sortEmail) {
    sortEmail.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "email";
        document.getElementById("search-form").submit();
    });
}

let sortStudentNumber = document.getElementById("sort-by-studentNumber");
if (sortStudentNumber) {
    sortStudentNumber.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "studentNumber";
        document.getElementById("search-form").submit();
    });
}

let sortStudentClass = document.getElementById("sort-by-class");
if (sortStudentClass) {
    sortStudentClass.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "class";
        document.getElementById("search-form").submit();
    });
}

let sortPhoneNumber = document.getElementById("sort-by-phoneNumber");
if (sortPhoneNumber) {
    sortPhoneNumber.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "phoneNumber";
        document.getElementById("search-form").submit();
    });
}


let sortattendanceCheck = document.getElementById("sort-by-attendanceCheck");
if (sortattendanceCheck) {
    sortattendanceCheck.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "attendanceCheck";
        document.getElementById("search-form").submit();
    });
}



// QR Code
let qrInterval = null;
let countdown = 30;
let timer;

const updateQr = async () => {
    try {
        const res = await fetch(`/events/event/qr/${eventId}`);
        const data = await res.json();

        const qrContainer = document.getElementById("qrCodeContainer");
        qrContainer.innerHTML = ""; // Xóa QR cũ

        const canvas = document.createElement("canvas");
        await QRCode.toCanvas(canvas, data.url);
        qrContainer.appendChild(canvas);

        // Reset đồng hồ đếm ngược
        countdown = 30;
        document.getElementById("qrCountdown").innerText = `Còn: ${countdown} giây`;

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            countdown--;
            document.getElementById("qrCountdown").innerText = `Còn: ${countdown} giây`;
        }, 1000);
    } catch (err) {
        console.error("Lỗi tạo QR:", err);
    }
};

const qrModal = document.getElementById("qrEventCodeModal");
qrModal.addEventListener("show.bs.modal", async () => {
    await updateQr(); // lần đầu
    qrInterval = setInterval(updateQr, 30000); // lặp 30s
});

// Khi đóng modal
function closeQr() {
    clearInterval(qrInterval);
    clearInterval(timer);
    document.getElementById("qrCodeContainer").innerHTML = "";
    document.getElementById("qrCountdown").innerText = "";
}

qrModal.addEventListener("hidden.bs.modal", closeQr);


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
function deleteCheckedStudents() {
    let deleteBtn = document.getElementById("deleteCheckedButtonSession");
    if (deleteBtn) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        let selectedIds = [];
        if (checkAll && checkAll.checked) {
            selectedIds = ["all"];
        } else {
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked && checkbox.id.startsWith("studentCheckbox-")) {
                    const id = checkbox.value;
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
                fetch(`/events/event/deleteCheckedStudents`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ids: selectedIds,
                        eventId: eventId,
                    }),
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.code === 200) {
                            checkAll.checked = false;
                            Swal.fire({
                                icon: "success",
                                title: "Đã xoá " + selectedIds.length + " sinh viên",
                                showConfirmButton: false,
                                timer: 3000,
                            }).then(() => {
                                window.location.reload();
                            });
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
    }
}


// Handle add student modal
const studentSelect = document.getElementById("student-select");
const studentDropdownMenu = document.getElementById("studentDropdownMenu");
const selectedStudentsContainer = document.getElementById("selectedStudentsContainer");
const selectedStudentIdsInput = document.getElementById("selected_student_ids");
const selectedStudents = [];

// Hàm hiển thị danh sách sinh viên đã chọn
function renderSelectedStudents() {
    selectedStudentsContainer.innerHTML = "";
    selectedStudents.forEach((student) => {
        const badge = document.createElement("span");
        badge.className = "badge bg-primary rounded-pill";
        badge.innerHTML = `${student.name} <span style="cursor:pointer;" onclick="removeStudent(${student.id})">&times;</span>`;
        selectedStudentsContainer.appendChild(badge);
    });
    selectedStudentIdsInput.value = selectedStudents.map((s) => s.id).join(",");
}

// Xóa sinh viên đã chọn
function removeStudent(id) {
    const index = selectedStudents.findIndex((s) => s.id === id);
    if (index !== -1) {
        selectedStudents.splice(index, 1);
        renderSelectedStudents();
        renderDropdown(studentSelect.value); // cập nhật lại dropdown
    }
}

// Hiển thị dropdown dựa vào từ khóa tìm kiếm
function renderDropdown(keyword = "") {
    studentDropdownMenu.innerHTML = "";
    const keywordNormalized = normalizeString(keyword);

    const filtered = studentsNotInEvent.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`;

        const studentNumber = s.student.student_number;

        const fullNameNormalized = normalizeString(fullName);
        const numberNormalized = normalizeString(studentNumber);

        return (fullNameNormalized.includes(keywordNormalized) || numberNormalized.includes(keywordNormalized)) && !selectedStudents.some((sel) => sel.id === s.id);
    });

    if (filtered.length === 0) {
        const item = document.createElement("div");
        item.className = "dropdown-item text-muted";
        item.textContent = "Không tìm thấy sinh viên";
        studentDropdownMenu.appendChild(item);
    } else {
        filtered.forEach((student) => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = `${student.firstName} ${student.lastName} - ${student.student.student_number}`;
            item.onclick = () => {
                selectedStudents.push({
                    id: student.id,
                    name: `${student.firstName} ${student.lastName}`,
                });
                renderSelectedStudents();
                studentSelect.value = "";
                renderDropdown("");
            };
            studentDropdownMenu.appendChild(item);
        });
    }

    studentDropdownMenu.classList.add("show");
}

// Sự kiện khi gõ để lọc sinh viên
studentSelect.addEventListener("input", () => {
    renderDropdown(studentSelect.value);
});

// Khi focus vào input, hiển thị dropdown
studentSelect.addEventListener("focus", () => {
    renderDropdown("");
});

// Ẩn dropdown khi click ngoài
document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
        studentDropdownMenu.classList.remove("show");
    }
});

function normalizeString(str) {
    return str
        .normalize("NFD") // tách dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, "") // xoá dấu
        .toLowerCase()
        .replace(/\s+/g, " ") // thay nhiều khoảng trắng bằng 1
        .trim();
}

const socket = io();
socket.emit("register", currentUser);
// Xử lý submit form thêm sinh viên
let addStudentBtn = document.getElementById("addStudetnBtn");
if (addStudentBtn) {
    addStudentBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Chưa chọn sinh viên nào",
                showConfirmButton: true,
                timer: 3000,
            });
            return;
        }

        Swal.fire({
            title: "Thêm " + selectedStudents.length + " sinh viên vào buổi học?",
            text: "Các sinh viên này sẽ được thêm vào buổi học hiện tại.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Thêm",
        }).then((result) => {
            if (result.isConfirmed) {
                let studentIds = selectedStudents.map((s) => s.id);
                const data = {
                    students: studentIds,
                    eventId: eventId,
                };
                socket.emit("add-students-to-event", {
                    students: studentIds,
                    eventId: eventId,
                });
                // Gửi thông báo đến từng sinh viên được thêm vào buổi học
                studentIds.forEach((studentId) => {
                    console.log("[event-detail.js] Gửi noti tới userId:", String(studentId));
                    (window.socket || socket).emit("sendNoti", {
                        toUserId: String(studentId),
                        message: "Bạn vừa được thêm vào buổi học!",
                    });
                });
                // fetch(`/events/event/addStudents`, {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify(data),
                // })
                //     .then((res) => res.json())
                //     .then((res) => {
                //         if (res.code === 200) {
                //             Swal.fire({
                //                 icon: "success",
                //                 title: `Đã thêm ${selectedStudents.length} sinh viên`,
                //                 showConfirmButton: false,
                //                 timer: 3000,
                //             }).then(() => {
                //                 window.location.reload();
                //             });
                //         } else {
                //             Swal.fire({
                //                 icon: "error",
                //                 title: res.message,
                //                 showConfirmButton: false,
                //                 timer: 3000,
                //             });
                //         }
                //     });
            }
        });
    });
}


// socket.on("notification", ({ message }) => {
//     Swal.fire({
//         icon: "info",
//         title: "Thông báo",
//         text: message,
//         timer: 4000,
//     });
// });

// Lắng nghe thông báo realtime nếu trang này được mở bởi sinh viên
if (window.socket) {
    window.socket.on("noti", function(data) {
        console.log("[event-detail.js] Nhận thông báo:", data);
        Swal.fire({
            icon: "info",
            title: "Thông báo mới",
            text: data.message,
            timer: 3000,
        });
    });
}