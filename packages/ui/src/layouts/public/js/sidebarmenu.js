/*
Template Name: Admin Template
Author: Wrappixel

File: js
*/
// ==============================================================
// Auto select left navbar
// ==============================================================
$(function () {
    "use strict";
    var url = window.location + "";
    var path = url.replace(window.location.protocol + "//" + window.location.host + "/", "");
    var element = $("ul#sidebarnav a").filter(function () {
        return this.href === url || this.href === path; // || url.href.indexOf(this.href) === 0;
    });
    element.parentsUntil(".sidebar-nav").each(function (index) {
        if ($(this).is("li") && $(this).children("a").length !== 0) {
            $(this).children("a").addClass("active");
            $(this).parent("ul#sidebarnav").length === 0 ? $(this).addClass("active") : $(this).addClass("selected");
        } else if (!$(this).is("ul") && $(this).children("a").length === 0) {
            $(this).addClass("selected");
        } else if ($(this).is("ul")) {
            $(this).addClass("in");
        }
    });

    element.addClass("active");
    $("#sidebarnav a").on("click", function (e) {
        if (!$(this).hasClass("active")) {
            // hide any open menus and remove all other classes
            $("ul", $(this).parents("ul:first")).removeClass("in");
            $("a", $(this).parents("ul:first")).removeClass("active");

            // open our new menu and add the open class
            $(this).next("ul").addClass("in");
            $(this).addClass("active");
        }
    });
    $("#sidebarnav >li >a.has-arrow").on("click", function (e) {
        e.preventDefault();
    });

    // Kiểm tra trang hiện tại và thêm class "active" vào menu tương ứng
    var currentPage = window.location.pathname.split("/").pop();

    var url = new URL(window.location);
    let chooseMenu = document.querySelectorAll(".sidebar-item.sidebar-" + currentPage);
    if (chooseMenu.length > 0) {
        chooseMenu.forEach((item) => {
            item.classList.add("selected");
        });
    }
    var currentUrl = url.pathname.split("/");
    let chooseMenuActive = document.querySelectorAll(".sidebar-item.sidebar-" + currentUrl[1]);

    if (chooseMenuActive.length > 0) {
        chooseMenuActive.forEach((item) => {
            item.classList.add("selected");
        });
    }
    if (currentUrl[1] == "profile" || currentUrl[1] == "signup") {
        let chooseMenuProfile = document.querySelectorAll(".sidebar-item.sidebar-users");
        if (chooseMenuProfile.length > 0) {
            chooseMenuProfile.forEach((item) => {
                item.classList.add("selected");
            });
        }
    }

    let chooseMenuActive2 = document.querySelectorAll(`.sidebar-item.sidebar-` + currentUrl[1]+`\\/`+ currentUrl[2]);
    if (chooseMenuActive2.length > 0) {
        chooseMenuActive2.forEach((item) => {
            item.classList.add("selected");
        });
    }
});
