let avatar = document.getElementById("image-avatar");
if (avatar)
    avatar.addEventListener("change", function () {
        document.getElementById("form-upload").submit();
    });
