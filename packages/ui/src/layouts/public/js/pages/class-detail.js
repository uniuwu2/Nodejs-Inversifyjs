let timeout;
let currentPage = 1;
let totalPages = 1; // Tổng số trang (cần phải tính toán)

async function loadData(sortBy = '', page = 1) {
    let pathName = window.location.pathname;
    let classId = pathName.split('/')[3];
     const pageSize = 5;
    currentPage = page;
    totalPages = Math.ceil(10 / pageSize); // Dữ liệu API trả về tổng số sinh viên

    // const q = document.getElementById('searchBox').value;
    const res = await fetch(`/classroom/class/info/` + classId);
    const data = await res.json();
    const users = data.classStudent;
    const tbody = document.getElementById('studentTableBody');

    tbody.innerHTML = users.map((u, index) => `
      <tr id="stdRow-${u.id}">
        <td>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${u.id}" id="flexCheckDefault">
            </div>
        </td>
        <td>${(page - 1) * pageSize + index + 1}</td>
        <td>${u.firstName}</td>
        <td>${u.lastName}</td>
        <td>${u.email}</td>
        <td>${u.phoneNumber}</td>
        <td>19050201</td>

      </tr>
    `).join('');

    renderPagination();
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    let paginationHTML = '';

    // Nút "Trước"
    if (currentPage > 1) {
        paginationHTML += `<button class="btn btn-secondary" onclick="loadData('', ${currentPage - 1})">Trước</button>`;
    }

    // Các trang
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}" onclick="loadData('', ${i})">${i}</button>
        `;
    }

    // Nút "Sau"
    if (currentPage < totalPages) {
        paginationHTML += `<button class="btn btn-secondary" onclick="loadData('', ${currentPage + 1})">Sau</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

document.getElementById('searchField').addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        loadData();
    }, 3000);
});
loadData();
