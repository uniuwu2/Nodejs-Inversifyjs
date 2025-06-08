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
    socket.emit("register", currentUserId); // Đăng ký socket theo userId

    // Hứng thông báo gửi đến
    socket.on("noti", (data) => {
        Swal.fire({
            icon: "info",
            title: "Thông báo mới",
            text: data.message,
            timer: 3000,
        });
    });

    // Ví dụ: Hàm gửi noti từ admin đến userId = 2
    window.sendNotificationToUser2 = function () {
        socket.emit("sendNoti", {
            toUserId: 2,
            message: "Chào bạn, bạn vừa được thêm vào buổi học!",
        });
    };

//     const socket = io(); // Tự động kết nối socket.io

// const currentUserId = "2"; // Đây là user 2
socket.emit("register", currentUserId);

socket.on("noti", (data) => {
    console.log("Nhận được noti:", data);
    Swal.fire({
        icon: "info",
        title: "Thông báo mới",
        text: data.message,
        timer: 3000,
    });
});

});
