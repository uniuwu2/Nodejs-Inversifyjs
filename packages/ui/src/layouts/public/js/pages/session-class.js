const startDate = new Date("2025-05-19T00:00:00");

const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const sessionClasses = []; // sẽ chứa các event hiển thị trên calendar
const teacherColorMap = {};

function getRandomColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, "0")}`;
}
function getColorForTeacher(teacherId) {
    if (!teacherColorMap[teacherId]) {
        teacherColorMap[teacherId] = getRandomColor();
    }
    return teacherColorMap[teacherId];
}

function sortClassSchedule(schedule) {
    return Object.entries(schedule)
        .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
        .map(([day, times]) => ({ day, times }));
}
function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function padTime(t) {
    return t
        .split(":")
        .map((s) => s.padStart(2, "0"))
        .join(":");
}
// console.log(courseClasses)
function generateSessionClasses(course) {
    const sessions = [];
    course.forEach((sessionClass) => {
        let teacherColor = getColorForTeacher(sessionClass.teacherId);
        if (sessionClass.status == 0) {
            teacherColor = "#000"; // Màu đen cho các lớp đã hủy
        }
        sessions.push({
            title: "",
            start: `${sessionClass.sessionDate}T${sessionClass.sessionStartTime}`,
            end: `${sessionClass.sessionDate}T${sessionClass.sessionEndTime}`,
            display: "block",
            backgroundColor: teacherColor,
            borderColor: teacherColor,
            extendedProps: {
                sessionId: sessionClass.id,
                courseId: sessionClass.courseClass.course.id,
                teacherId: sessionClass.teacherId,
                teacher: `${sessionClass.teacher.firstName} ${sessionClass.teacher.lastName}`,
                courseName: sessionClass.courseClass.course.courseName,
                courseCode: sessionClass.courseClass.course.courseCode,
                day: sessionClass.sessionDate,
                startTime: sessionClass.sessionStartTime,
                endTime: sessionClass.sessionEndTime,
                room: sessionClass.room,
                courseClassId: sessionClass.courseClass.id,
                status: sessionClass.status, // 0: đã hủy, 1: bình thường, 2: bù
                reason: sessionClass.reason || "",
            },
        });
    });
    // const schedule = course.classSchedule;
    // const sortedSchedule = sortClassSchedule(schedule);
    // const classDays = sortedSchedule.map((item) => item.day);

    // while (sessionCount < course.sessionNumber) {
    //     const dayName = dayOrder[currentDate.getDay()];
    //     if (classDays.includes(dayName)) {
    //         const timeSlots = schedule[dayName];
    //         for (const time of timeSlots) {
    //             if (sessionCount >= course.sessionNumber) break;

    //             const [startTime, endTime] = time.split("-").map((t) => padTime(t));
    //             const dateStr = toLocalDateString(currentDate);
    //             const teacherColor = getColorForTeacher(course.teacherId);
    //             sessions.push({
    //                 title: "",
    //                 start: `${dateStr}T${startTime}`,
    //                 end: `${dateStr}T${endTime}`,
    //                 display: "block",
    //                 backgroundColor: teacherColor,
    //                 borderColor: teacherColor,
    //                 extendedProps: {
    //                     sessionId: course.id,
    //                     courseId: course.course.id,
    //                     teacherId: course.teacherId,
    //                     teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
    //                     courseName: course.course.courseName,
    //                     courseCode: course.course.courseCode,
    //                     sessionNumber: sessionCount + 1,
    //                     day: dateStr,
    //                     startTime: startTime,
    //                     endTime: endTime,
    //                     room: "",
    //                 },
    //             });

    //             sessionCount++;
    //         }
    //     }
    //     currentDate.setDate(currentDate.getDate() + 1);
    // }

    return sessions;
}

function initializeSessions() {
    if (!Array.isArray(courseClasses)) {
        console.error("courseClasses không hợp lệ");
        return;
    }

    // for (const course of courseClasses) {
    //     const sessions = generateSessionClasses(course);
    //     sessionClasses.push(...sessions);
    // }
    let test = generateSessionClasses(courseClasses);
    sessionClasses.push(...test);
}
document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
        console.error("Không tìm thấy phần tử #calendar.");
        return;
    }

    if (typeof FullCalendar === "undefined") {
        console.error("FullCalendar chưa được tải.");
        return;
    }
    initializeSessions();
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "vi",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
        },
        events: sessionClasses,
        height: "auto",
        eventDidMount: function (info) {
            const { extendedProps } = info.event;
            const { courseName, courseCode, sessionNumber, teacher } = extendedProps;

            info.el.innerHTML = `
                <div class="event-content">
                    <strong>${courseName} (${courseCode})</strong><br>
                    <span>${teacher}</span><br>
                    <span>${extendedProps.startTime} - ${extendedProps.endTime}</span><br>
                    <span>Phòng: ${extendedProps.room}</span><br>
                </div>
            `;
        },
        eventClick: function (info) {
            const { extendedProps } = info.event;
            const { sessionId, courseId, teacherId, courseName, courseCode, sessionNumber, teacher } = extendedProps;
            const props = info.event.extendedProps;
            document.getElementById("eventId").value = props.sessionId;
            document.getElementById("courseId").value = props.courseId;
            document.getElementById("teacherId").value = props.teacherId;
            document.getElementById("courseClassId").value = props.courseClassId;
            document.getElementById("teacher").value = `${props.teacher}`;
            document.getElementById("subject").value = props.courseName;
            document.getElementById("room").value = props.room;
            document.getElementById("startTime").value = props.startTime;
            document.getElementById("endTime").value = props.endTime;
            document.getElementById("reason").value = props.reason || "";
            if (props.status === 2) {
                document.getElementById("isMakeup").checked = true;
                document.getElementById("isCancelled").disabled = true;
            } else if (props.status === 0) {
                document.getElementById("isCancelled").checked = true;
                document.getElementById("isMakeup").disabled = true;
            }

            let detailButton = document.getElementById("viewDetails");
            if (detailButton) {
                detailButton.href = `/session-class/schedule/detail/${props.sessionId}`;
            }

            new bootstrap.Modal(document.getElementById("editEventModal")).show();
        },
    });

    calendar.render();

    $("#saveChanges").click(function (e) {
        let eventId = document.getElementById("eventId").value;
        let makeUpCheckbox = document.getElementById("isMakeup");
        let syncRoomCheckbox = document.getElementById("syncRoom");
        let isCancelledCheckbox = document.getElementById("isCancelled");
        let isMakeup = makeUpCheckbox.checked ? 1 : 0;
        let syncRoom = syncRoomCheckbox.checked ? 1 : 0;
        let isCancelled = isCancelledCheckbox.checked ? 1 : 0;
        let room = document.getElementById("room").value;
        let startTime = document.getElementById("startTime").value;
        let endTime = document.getElementById("endTime").value;
        let teacherId = document.getElementById("teacherId").value;
        let courseId = document.getElementById("courseId").value;
        let courseClassId = document.getElementById("courseClassId").value;
        let reason = document.getElementById("reason").value;
        $.ajax({
            url: "/session-class/schedule/" + eventId + "/edit",
            type: "POST",
            data: {
                eventId: eventId,
                room: room,
                startTime: startTime,
                endTime: endTime,
                isMakeup: isMakeup,
                syncRoom: syncRoom,
                isCancelled: isCancelled,
                teacherId: teacherId,
                courseId: courseId,
                courseClassId: courseClassId,
                reason: reason,
            },
            success: function (response) {
                if (response.code === 200) {
                    location.reload();
                }
            },
            error: function (error) {
                console.error("Lỗi khi cập nhật:", error);
            },
        });
    });

    $("#isMakeup").change(function () {
        if ($(this).is(":checked")) {
            $("#isCancelled").prop("disabled", true);
        } else {
            $("#isCancelled").prop("disabled", false);
        }
    });

    $("#isCancelled").change(function () {
        if ($(this).is(":checked")) {
            $("#isMakeup").prop("disabled", true);
        } else {
            $("#isMakeup").prop("disabled", false);
        }
    });

    // Xử lý môn học theo giáo viên đã chọn
    const subjectWrapper = document.getElementById("subjectSelectWrapper");
    const subjectSelect = document.getElementById("createsubject");
    const teacherSelect = document.getElementById("createTeacher");


    async function loadSubjects(teacherId) {
        if (!teacherId) {
            subjectWrapper.style.display = "none";
            return;
        }

        try {
            const res = await fetch(`/classroom/teacher/${teacherId}/classes`);
            const subjects = await res.json();

            // 1. Reset lại select
            if ($(subjectSelect).hasClass("select2-hidden-accessible")) {
                $(subjectSelect).select2("destroy");
            }

            subjectSelect.innerHTML = '<option value="">Chọn môn học</option>';

            // 2. Gắn dữ liệu mới
            subjects.forEach((sub) => {
                const opt = document.createElement("option");
                opt.value = sub.course?.id || "";
                opt.textContent = sub.course?.courseName || "Không rõ tên";
                subjectSelect.appendChild(opt);
            });

            // 3. Hiển thị nếu có môn học
            if (subjects.length > 0) {
                subjectWrapper.style.display = "block";
            } else {
                subjectWrapper.style.display = "none";
            }

        } catch (err) {
            console.error("Lỗi khi lấy môn học:", err);
            subjectWrapper.style.display = "none";
        }
    }

    // Nếu là Admin → chọn giáo viên mới load môn học
    if (teacherSelect) {
        teacherSelect.addEventListener("change", function () {
            const teacherId = this.value;
            loadSubjects(teacherId);
        });

        // Nếu admin mở modal và có sẵn giáo viên đầu tiên → tự load luôn
        if (teacherSelect.value) {
            loadSubjects(teacherSelect.value);
        }
    }

    // Nếu là giáo viên → tự động load môn học theo `user.id`
    if (!teacherSelect && window.currentTeacherId) {
        loadSubjects(window.currentTeacherId);
    }
});
