// Range datepicker

let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");

let date = new Date(),
    y = date.getFullYear(),
    m = date.getMonth();
let firstDay = startDate.value ? new Date(startDate.value).setHours(0, 0, 0) : new Date(y, m, 1).setHours(0, 0, 0);
let lastDay = endDate.value ? new Date(endDate.value).setHours(23, 59, 59) : new Date(y, m + 1, 0).setHours(23, 59, 59);

let language = document.getElementById("defaultLanguage");

flatpickr("#datepicker-range", {
    mode: "range",
    locale: language.value ? language.value : "ja",
    dateFormat: "Y/m/d",
    defaultDate: [new Date(firstDay).toLocaleDateString("en-ZA"), new Date(lastDay).toLocaleDateString("en-ZA")],
    onChange: function (dates) {
        if (dates.length == 2) {
            startDate.value = new Date(dates[0]).toLocaleDateString("en-ZA");
            endDate.value = new Date(dates[1]).toLocaleDateString("en-ZA");
            document.getElementById("search-form").submit();
        }
    },
    onClose: function (dates, _, instance) {
        if (dates.length == 1) {
            instance.setDate([dates[0], dates[0]], true);
        }
    },
});
