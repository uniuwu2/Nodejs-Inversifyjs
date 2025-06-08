$(function () {
    // Admin Panel settings

    //****************************
    /* This is for the mini-sidebar if width is less then 1170*/
    //****************************
    var setsidebartype = function () {
        var width = window.innerWidth > 0 ? window.innerWidth : this.screen.width;
        if (width < 1199) {
            $("#main-wrapper").attr("data-sidebartype", "mini-sidebar");
            $("#main-wrapper").addClass("mini-sidebar");
        } else {
            $("#main-wrapper").attr("data-sidebartype", "full");
            $("#main-wrapper").removeClass("mini-sidebar");
        }
    };
    $(window).ready(setsidebartype);
    $(window).on("resize", setsidebartype);
    //****************************
    /* This is for sidebartoggler*/
    //****************************
    $(".sidebartoggler").on("click", function () {
        $("#main-wrapper").toggleClass("mini-sidebar");
        if ($("#main-wrapper").hasClass("mini-sidebar")) {
            $(".sidebartoggler").prop("checked", !0);
            $("#main-wrapper").attr("data-sidebartype", "mini-sidebar");
        } else {
            $(".sidebartoggler").prop("checked", !1);
            $("#main-wrapper").attr("data-sidebartype", "full");
        }
    });
    $(".sidebartoggler").on("click", function () {
        $("#main-wrapper").toggleClass("show-sidebar");
    });
    // const socket = io();
    // window.socket = socket;
    // // lấy user hiện tại từ cookie
    // console.log("User hiện tại:", window.currentUser);
});

$(function () {
    // Sidebar xử lý ở trên bạn giữ nguyên...

    // Khởi tạo socket
    const socket = io(); // Nếu dùng cùng domain
    window.socket = socket;

    // Lấy user hiện tại từ cookie hoặc biến JS được inject server-side
    const currentUserId = window.currentUserId || 1; // fallback là admin (1)
    console.log("[app.js] Đăng ký socket với userId:", currentUserId, "(kiểu:", typeof currentUserId, ")");
    socket.emit("register", String(currentUserId)); // Đăng ký socket theo userId (string)

    // Hứng thông báo gửi đến
    /** @param {Message} data */
    socket.on("noti", (data) => {
        console.log("[app.js] Received notification:", data);
        // Thêm thông báo vào vùng notification-list trên header
        const notiList = document.getElementById("notification-list");
        if (notiList) {
            const notiItem = document.createElement("div");
            notiItem.className = "dropdown-item";
            notiItem.textContent = data.message || "Có thông báo mới!";
            notiList.prepend(notiItem);
        }
        // Phát âm thanh thông báo
        if (userInteracted) {
            const audio = new Audio("../../sounds/notification.mp3");
            audio.play();
        }
        // Có thể thêm hiệu ứng, badge, v.v. nếu muốn
    });

    // Ví dụ: Hàm gửi // noti từ admin đến userId =//  2
    window.sendNotificationToUser2 = function () {
        socket.emit("sendNoti", {
            toUserId: 2,
            message: "Chào bạn, bạn vừa được thêm vào buổi học!",
        });
    };

});

/**
 * @typedef {Object} Message
 * @property {string} message - The notification message
 * @property {number} [toUserId] - Optional user ID to send to
 */

let userInteracted = false;
window.addEventListener('click', function onceUserInteracts() {
    userInteracted = true;
    // Sau lần đầu click, có thể bỏ listener nếu muốn
    window.removeEventListener('click', onceUserInteracts);
});
