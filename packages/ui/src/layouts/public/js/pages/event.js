// Filter by role
let statusFilter = document.getElementById("statusSelect");

if (statusFilter) {
    statusFilter.addEventListener("change", function () {
        // openModalSpinner.click();
        document.getElementById("search-form").submit();
    });
}

let userFilter = document.getElementById("userSelect");
if (userFilter) {
    userFilter.addEventListener("change", function () {
        // openModalSpinner.click();
        document.getElementById("search-form").submit();
    });
}

let sortBy = document.getElementById("sortBy");

function sortTypeSwitch() {
    let sort = document.getElementById("sort");
    if (sort.value === "ASC") sort.value = "DESC";
    else sort.value = "ASC";
}

// Sort by activityName
let sortActivityName = document.getElementById("sort-by-activityName");
if (sortActivityName)
    sortActivityName.addEventListener("click", function () {
        if (sortBy.value === "activityName") sortTypeSwitch();
        sortBy.value = "activityName";
        document.getElementById("search-form").submit();
    });
// Sort by activityDate
let sortActivityDate = document.getElementById("sort-by-activityDate");
if (sortActivityDate)
    sortActivityDate.addEventListener("click", function () {
        if (sortBy.value === "activityDate") sortTypeSwitch();
        sortBy.value = "activityDate";
        document.getElementById("search-form").submit();
    });

//Sort by active
let sortActive = document.getElementById("sort-by-active");
if (sortActive)
    sortActive.addEventListener("click", function () {
        if (sortBy.value === "active") sortTypeSwitch();
        sortBy.value = "active";
        document.getElementById("search-form").submit();
    });

// Sort by user
let sortUser = document.getElementById("sort-by-user");
if (sortUser)
    sortUser.addEventListener("click", function () {
        if (sortBy.value === "user") sortTypeSwitch();
        sortBy.value = "user";
        document.getElementById("search-form").submit();
    });

function changeStatus(eventId, active) {
    $.ajax({
        url: "/events/" + eventId + "/changeStatus",
        type: "POST",
        data: { active: active },
        success: function (response) {
            if (response.status === 200) {
                let statusButton = document.getElementById("status-button-" + eventId);
                if (statusButton) {
                    let element = `<span class="text-success">Đang diễn ra</span>`;
                    if (!active) {
                        element = `<span class="text-danger">Đã kết thúc</span>`;
                    }
                    statusButton.innerHTML = element;
                    statusButton.classList.remove("btn-success", "btn-danger");
                }
            } else {
                alert("Error changing status: " + response.message);
            }
        },
    });
}

// Handle button delete
let eventList = document.getElementById("events").dataset.test;
let eventRow;
let params;
if (eventList)
    JSON.parse(eventList).forEach((id) => {
        params = document.getElementById(`sa-params-${id}`);
        forms = document.getElementById(`form-delete`);
        eventRow = document.getElementsByClassName(`event-${id}`);
        if (params && eventRow) {
            params.addEventListener("click", function () {
                Swal.fire({
                    title: "Xoá sự kiện",
                    text: "Bạn có chắc chắn muốn xoá sự kiện này không?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Xoá",
                    cancelButtonText: "Huỷ",
                    confirmButtonClass: "btn btn-success mt-2",
                    cancelButtonClass: "btn btn-danger ms-2 mt-2",
                    buttonsStyling: false,
                    focusCancel: true,
                }).then(function (result) {
                    if (result.value) {
                        getHrefInput(forms, JSON.parse(eventList));
                        forms.method = "POST";
                        forms.action = `/events/${id}/delete`;
                        forms.submit();
                    }
                });
            });
        }
    });

function getHrefInput(form, list) {
    let input = document.createElement("input");
    input.type = "hidden";
    input.id = "href";
    input.name = "href";
    let value = document.location.search;
    if (list && list.length === 1 && Number(currentPage.value) !== 1) {
        let getPageIndex = new URLSearchParams(value.substring(value.indexOf("?")));
        let getPage = getPageIndex.get("page");
        value = value.replace(getPage, Number(currentPage.value) - 1);
    }
    input.value = String(value);
    if (form.children.length === 0) {
        form.appendChild(input);
    }
}


