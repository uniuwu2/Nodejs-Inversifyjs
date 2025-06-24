let sortBy = document.getElementById("sortBy");

function sortTypeSwitch() {
    let sort = document.getElementById("sort");
    if (sort.value === "ASC") sort.value = "DESC";
    else sort.value = "ASC";
}

// Sort by date
let sortDate = document.getElementById("sort-by-date");
if (sortDate) {
    sortDate.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "date";
        document.getElementById("search-form").submit();
    });
}

// Sỏt by totalSessions
let sortTotalSessions = document.getElementById("sort-by-total-totalSessions");
if (sortTotalSessions) {
    sortTotalSessions.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "totalSessions";
        document.getElementById("search-form").submit();
    });
}

// Sort by totalStudents
let sortTotalStudents = document.getElementById("sort-by-total-totalStudents");
if (sortTotalStudents) {
    sortTotalStudents.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "totalStudents";
        document.getElementById("search-form").submit();
    });
}

// Sort by attended
let sortAttended = document.getElementById("sort-by-attended");
if (sortAttended) {
    sortAttended.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "attended";
        document.getElementById("search-form").submit();
    });
}

// Sort by absent
let sortAbsent = document.getElementById("sort-by-absent");
if (sortAbsent) {
    sortAbsent.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "absent";
        document.getElementById("search-form").submit();
    });
}

// Sort by attendance rate
let sortAttendanceRate = document.getElementById("sort-by-attendanceRate");
if (sortAttendanceRate) {
    sortAttendanceRate.addEventListener("click", function () {
        sortTypeSwitch();
        sortBy.value = "attendanceRate";
        document.getElementById("search-form").submit();
    });
}

