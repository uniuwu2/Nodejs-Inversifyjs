
//   const calendarEl = document.getElementById("calendar");

//   const calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: "dayGridMonth",
//     locale: "vi", // Tiếng Việt
//     headerToolbar: {
//       left: "prev,next today",
//       center: "title",
//       right: "dayGridMonth,timeGridWeek,timeGridDay"
//     },
//     events: [
//       {
//         id: "1",
//         title: "Toán - Tiết 1",
//         start: "2025-05-19T08:00:00",
//         url: "/session/1",
//         color: "#28a745"
//       },
//       {
//         id: "2",
//         title: "Lý - Tiết 2",
//         start: "2025-05-20T10:00:00",
//         url: "/session/2",
//         color: "#dc3545"
//       }
//     ]
//   });

//   calendar.render();
// });

// console.log(courseClasses);


const startDate = new Date("2025-05-19T00:00:00");
// const dayMap = {
//   "monday": 1,
//   "tuesday": 2,
//   "wednesday": 3,
//   "thursday": 4,
//   "friday": 5,
//   "saturday": 6,
//   "sunday": 0
// };


const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayMap = {
  monday: "Thứ 2",
  tuesday: "Thứ 3",
  wednesday: "Thứ 4",
  thursday: "Thứ 5",
  friday: "Thứ 6",
  saturday: "Thứ 7",
  sunday: "Chủ nhật",
};
function sortClassSchedule(schedule) {
  return Object.entries(schedule)
    .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    .map(([day, times]) => ({
      day,
      label: dayMap[day],
      times,
    }));
}

// Hàm phân tích class_schedule và tạo session_class
function generateSessionClasses(course) {
  let sessionCount = 0;
  let currentDate = new Date(startDate);
  const sessions = [];

  while (sessionCount < course.sessionNumber) {
    const schedule = course.classSchedule;
    const sortedSchedule = sortClassSchedule(schedule);
    const session = sortedSchedule.map((daySchedule) => {
      const day = daySchedule.day;
      const times = daySchedule.times;

      const dayIndex = dayOrder.indexOf(day);
      const dayOffset = (dayIndex + 7) % 7;
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(currentDate.getDate() + dayOffset);
      // set start time
      const startTime = times.split("-")[0];
      const [startHour, startMinute] = startTime.split(":").map(Number);
      sessionDate.setHours(startHour, startMinute, 0, 0);
      // set end time
      const endTime = times.split("-")[1];
      const [endHour, endMinute] = endTime.split(":").map(Number);

      
      
      console.log(sessionDate);
    });

    // console.log(session);
    sessionCount++;
  }
}
generateSessionClasses(courseClasses[0]);

// Tạo session_class cho tất cả course_class
// function initializeSessions() {
//   if (!courseClasses || !Array.isArray(courseClasses)) {
//     console.error("Dữ liệu courseClasses không hợp lệ hoặc không được truyền từ server:", courseClasses);
//     courseClasses = []; // Gán giá trị mặc định để tránh lỗi
//   }

//   sessionClasses = [];
//   for (const course of courseClasses) {
//     const sessions = generateSessionClasses(course);
//     sessionClasses.push(...sessions);
//   }
// }
// // Khởi tạo FullCalendar
// document.addEventListener("DOMContentLoaded", function () {
//   const calendarEl = document.getElementById("calendar");
//   if (!calendarEl) {
//     console.error("Không tìm thấy phần tử #calendar trong DOM.");
//     return;
//   }

//   if (typeof FullCalendar === "undefined") {
//     console.error("FullCalendar không được tải. Vui lòng kiểm tra kết nối CDN hoặc tệp script.");
//     return;
//   }

//   initializeSessions();

//   calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: "dayGridMonth",
//     locale: "vi",
//     headerToolbar: {
//       left: "prev,next today",
//       center: "title",
//       right: "dayGridMonth,timeGridWeek,timeGridDay"
//     },
//     eventContent: function (arg) {
//       const event = arg.event;
//       let status = "";
//       if (event.extendedProps.isMakeup) status += " (Học bù)";
//       if (event.extendedProps.isCancelled) status += " (Hủy)";
//       return {
//         html: `
//           <div>
//             <b>${event.title}</b><br>
//             <small>${event.extendedProps.teacher} - Phòng: ${event.extendedProps.room || "Chưa xác định"}${status}</small>
//           </div>
//         `
//       };
//     },
//     eventClick: function (info) {
//       const options = [
//         "Đánh dấu học bù",
//         "Hủy buổi học",
//         "Thoát"
//       ];
//       const choice = prompt(`Chọn hành động cho ${info.event.title}:\n${options.join("\n")}\nNhập số (0, 1, 2):`);
//       const index = parseInt(choice || "2");

//       if (index === 0) {
//         info.event.setExtendedProp("isMakeup", true);
//         info.event.setExtendedProp("isCancelled", false);
//         info.event.setProp("color", "#28a745");
//       } else if (index === 1) {
//         info.event.setExtendedProp("isCancelled", true);
//         info.event.setExtendedProp("isMakeup", false);
//         info.event.setProp("color", "#6c757d");
//       }
//       calendar.refetchEvents();
//     },
//     events: function (fetchInfo, successCallback) {
//       successCallback(sessionClasses);
//     },
//     height: "auto",
//     slotMinTime: "07:00:00",
//     slotMaxTime: "18:00:00"
//   });

//   calendar.render();

// });