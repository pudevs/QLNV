// ===== KIỂM TRA ĐĂNG NHẬP (trừ trang login, signup) =====
const publicPages = ['1-login.html', '1-signup.html'];
const currentPage = window.location.pathname.split('/').pop();
if (!publicPages.includes(currentPage) && !localStorage.getItem('user')) {
    window.location.href = '1-login.html';
}
// Xử lý trường hợp quay lại trang bằng nút Back (cache)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        if (!localStorage.getItem('user') && !publicPages.includes(currentPage)) {
            window.location.href = '1-login.html';
        }
    }
});

// ===== ĐĂNG NHẬP/ĐĂNG KÝ/ĐĂNG XUẤT =====
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const loginForm = document.getElementById('loginForm');
const signUpForm = document.querySelector('.sign-up form');

if (registerBtn && container) {
    registerBtn.onclick = () => container.classList.add("active");
}
if (loginBtn && container) {
    loginBtn.onclick = () => container.classList.remove("active");
}
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            // Xóa sạch thông tin đăng nhập cũ trước khi đăng nhập mới
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) return alert(data.message || 'Đăng nhập thất bại!');
            alert(data.message);
            // Lưu trạng thái đăng nhập mới
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = data.user.role === 'admin' ? '/1-danhsach.html' : '/1-portfolio.html';
        } catch (error) {
            alert('Đã xảy ra lỗi khi đăng nhập.');
        }
    };
}
if (signUpForm) {
    signUpForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) return alert(data.message || 'Đăng ký thất bại!');
            alert(data.message);
        } catch (error) {
            alert('Đã xảy ra lỗi khi đăng ký.');
        }
    };
}
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
    logoutBtn.onclick = function () {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = '1-login.html';
    };
}

// ===== HÀM CHUNG =====
const isValidId = id => id && id !== 'undefined' && !isNaN(Number(id));

// Hàm showForm tối ưu: tự động điền lại dữ liệu cho input/select khi sửa
function showForm(table, form, edit = false, data = {}, idField = 'data-edit-id') {
    if (!table || !form) return;
    table.style.display = edit ? 'none' : '';
    form.style.display = edit ? 'block' : 'none';
    if (!edit) form.reset(); // chỉ reset khi thêm mới
    if (edit && data && data.id !== undefined) {
        form.setAttribute(idField, data.id);
        Object.keys(data).forEach(k => {
            // Ưu tiên theo name, nếu không có thì theo id
            const field = form.querySelector(`[name="${k}"], [id="${k}"]`);
            if (field) {
                if (field.tagName === 'SELECT') {
                    field.value = String(data[k]);
                } else if (field.type === 'radio' || field.type === 'checkbox') {
                    field.checked = !!data[k];
                } else {
                    field.value = data[k] || '';
                }
            }
        });
    } else {
        form.removeAttribute(idField);
    }
}

// ===== SIDEBAR & MENU =====
const sidebarItems = document.querySelectorAll('.sidebar .item');
sidebarItems.forEach(item => {
    item.addEventListener('click', function () {
        sidebarItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            document.querySelectorAll('.main .content').forEach(sec => sec.style.display = 'none');
            const section = document.getElementById(sectionId + '-section');
            if (section) section.style.display = 'block';
        }
    });
});
const menuToggle = document.getElementById('menuToggle');
const leftSection = document.getElementById('leftSection');
if (menuToggle && leftSection) {
    menuToggle.onclick = function () {
        leftSection.classList.toggle('collapsed');
    };
}

// ===== DASHBOARD: DANH SÁCH NHÂN VIÊN (CHỈ XEM) =====
async function loadDashboardEmployees() {
    const tbody = document.getElementById('dashboardEmployeeList');
    if (!tbody) return;
    try {
        const res = await fetch('/api/employees');
        if (!res.ok) return;
        const data = await res.json();
        tbody.innerHTML = data.map((nv, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${nv.tenNV}</td>
              <td>${nv.emailNV}</td>
              <td>${nv.sdtNV}</td>
              <td>${nv.diachiNV}</td>
              <td>${nv.tenPb || ''}</td>
              <td>${nv.tenCV || ''}</td>
              <td>${nv.trangthaiNV ? 'Đang làm' : 'Nghỉ'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}
loadDashboardEmployees();

// ===== HÀM LOAD PHÒNG BAN & CHỨC VỤ VÀO SELECT =====
async function loadPhongbanSelect() {
    const select = document.getElementById('phongbanSelect');
    if (!select) return;
    const res = await fetch('/api/departments');
    if (!res.ok) return;
    const data = await res.json();
    select.innerHTML = data.map(pb =>
        `<option value="${pb.phongbanId}">${pb.tenPb}</option>`
    ).join('');
}

async function loadChucvuSelect() {
    const select = document.getElementById('chucvuSelect');
    if (!select) return;
    const res = await fetch('/api/positions');
    if (!res.ok) return;
    const data = await res.json();
    select.innerHTML = data.map(cv =>
        `<option value="${cv.chucvuId}">${cv.tenCV}</option>`
    ).join('');
}

// ===== NHÂN VIÊN: HIỂN THỊ, THÊM, SỬA, XOÁ =====
const addBtn = document.getElementById('addEmployeeBtn');
const cancelBtn = document.getElementById('cancelAdd');
const employeeTable = document.getElementById('employeeTable');
const addEmployeeForm = document.getElementById('addEmployeeForm');
const employeeForm = document.getElementById('employeeForm');

async function showEmployeeForm(edit = false, nv = {}) {
    await loadPhongbanSelect();
    await loadChucvuSelect();
    showForm(employeeTable, addEmployeeForm, edit, {
        id: nv.nhanvienId,
        tenNV: nv.tenNV,
        emailNV: nv.emailNV,
        sdtNV: nv.sdtNV,
        diachiNV: nv.diachiNV,
        phongbanId: nv.phongbanId,
        chucvuId: nv.chucvuId,
        trangthaiNV: nv.trangthaiNV ? '1' : '0'
    });
    if (edit && nv.nhanvienId !== undefined) {
        employeeForm.setAttribute('data-edit-id', nv.nhanvienId);
    } else {
        employeeForm.removeAttribute('data-edit-id');
    }
}

async function loadEmployees() {
    const tbody = document.getElementById('employeeList');
    if (!tbody) return;
    try {
        const res = await fetch('/api/employees');
        if (!res.ok) return;
        const data = await res.json();
        tbody.innerHTML = data.map((nv, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${nv.tenNV}</td>
              <td>${nv.emailNV}</td>
              <td>${nv.sdtNV}</td>
              <td>${nv.diachiNV}</td>
              <td>${nv.tenPb || ''}</td>
              <td>${nv.tenCV || ''}</td>
              <td>${nv.trangthaiNV ? 'Đang làm' : 'Nghỉ'}</td>
              <td>
                <button class="action-btn edit" data-id="${nv.nhanvienId}">Sửa</button>
                <button class="action-btn delete" data-id="${nv.nhanvienId}">Xoá</button>
              </td>
            </tr>
        `).join('');
        const total = document.getElementById('totalEmployees');
        if (total) total.textContent = data.length;

        // Sửa nhân viên
        tbody.querySelectorAll('.edit').forEach(btn => {
            btn.onclick = async function () {
                const id = this.getAttribute('data-id');
                const nv = data.find(n => String(n.nhanvienId) === String(id));
                if (!nv) return;
                await showEmployeeForm(true, nv);
            };
        });

        // Xoá nhân viên
        tbody.querySelectorAll('.delete').forEach(btn => {
            btn.onclick = async function () {
                const id = this.getAttribute('data-id');
                if (!isValidId(id)) return;
                if (confirm('Bạn có chắc muốn xoá nhân viên này?')) {
                    const res = await fetch('/api/employees/' + id, { method: 'DELETE' });
                    const result = await res.json();
                    if (res.ok) {
                        alert('Xoá thành công!');
                        loadEmployees();
                    } else {
                        alert(result.message || 'Có lỗi xảy ra khi xoá!');
                    }
                }
            };
        });
    } catch (e) {
        console.error(e);
    }
}
loadEmployees();
const searchEmployeeId = document.getElementById('searchEmployeeId');
if (searchEmployeeId) {
    searchEmployeeId.addEventListener('input', function () {
        const searchValue = this.value.trim();
        const rows = document.querySelectorAll('#employeeList tr');
        rows.forEach(row => {
            const idCell = row.querySelector('td:nth-child(1)');
            if (!searchValue || (idCell && idCell.textContent.includes(searchValue))) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


if (addBtn) addBtn.onclick = () => showEmployeeForm(true);
if (cancelBtn) cancelBtn.onclick = () => showForm(employeeTable, addEmployeeForm, false);

if (employeeForm) {
    employeeForm.onsubmit = async function (e) {
        e.preventDefault();
        const tenNV = employeeForm.tenNV.value;
        const emailNV = employeeForm.emailNV.value;
        const sdtNV = employeeForm.sdtNV.value;
        const diachiNV = employeeForm.diachiNV.value;
        const phongbanId = employeeForm.phongbanId.value;
        const chucvuId = employeeForm.chucvuId.value;
        const trangthaiNV = employeeForm.trangthaiNV.value;
        const editId = employeeForm.getAttribute('data-edit-id');
        let url = '/api/employees';
        let method = 'POST';
        let body = { tenNV, emailNV, sdtNV, diachiNV, phongbanId, chucvuId, trangthaiNV };
        if (isValidId(editId)) {
            url += '/' + editId;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await res.json();
        if (res.ok) {
            alert(editId ? 'Cập nhật thành công!' : 'Thêm nhân viên thành công!');
            showForm(employeeTable, addEmployeeForm, false);
            loadEmployees();
        } else {
            alert(result.message || 'Có lỗi xảy ra!');
        }
    };
}

// ===== PHÒNG BAN: HIỂN THỊ, THÊM, SỬA, XOÁ =====
const departmentTable = document.getElementById('departmentTable');
const departmentList = document.getElementById('departmentList');
const addDepartmentBtn = document.getElementById('addDepartmentBtn');
const addDepartmentForm = document.getElementById('addDepartmentForm');
const departmentForm = document.getElementById('departmentForm');
const cancelDepartment = document.getElementById('cancelDepartment');

function showDepartmentForm(edit = false, pb = {}) {
    showForm(departmentTable, addDepartmentForm, edit, {
        id: pb.phongbanId,
        tenPb: pb.tenPb,
        motaPb: pb.motaPb
    });
    if (edit && pb.phongbanId !== undefined) {
        departmentForm.setAttribute('data-edit-id', pb.phongbanId);
    } else {
        departmentForm.removeAttribute('data-edit-id');
    }
}

async function loadDepartments() {
    if (!departmentList) return;
    try {
        const res = await fetch('/api/departments');
        if (!res.ok) return;
        const data = await res.json();
        departmentList.innerHTML = data.map((pb, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${pb.tenPb}</td>
                <td>${pb.motaPb || ''}</td>
                <td>
                  <button class="action-btn edit" data-id="${pb.phongbanId ?? ''}">Sửa</button>
                  <button class="action-btn delete" data-id="${pb.phongbanId ?? ''}">Xoá</button>
                </td>
            </tr>
        `).join('');

        // Sửa phòng ban
        departmentList.querySelectorAll('.edit').forEach(btn => {
            btn.onclick = function () {
                const id = this.getAttribute('data-id');
                if (!isValidId(id)) return alert('Không tìm thấy ID phòng ban!');
                const pb = data.find(p => String(p.phongbanId) === String(id));
                if (!pb) return alert('Không tìm thấy phòng ban!');
                showDepartmentForm(true, pb);
            };
        });

        // Xoá phòng ban
        departmentList.querySelectorAll('.delete').forEach(btn => {
            btn.onclick = async function () {
                const id = this.getAttribute('data-id');
                if (!isValidId(id)) return alert('Không tìm thấy ID phòng ban!');
                if (confirm('Bạn có chắc muốn xoá phòng ban này?')) {
                    const res = await fetch('/api/departments/' + id, { method: 'DELETE' });
                    const result = await res.json();
                    if (res.ok) {
                        alert('Xoá thành công!');
                        loadDepartments();
                        await loadPhongbanSelect(); // Cập nhật lại select phòng ban cho nhân viên
                    } else {
                        alert(result.message || 'Có lỗi xảy ra khi xoá!');
                    }
                }
            };
        });
    } catch (e) {
        console.error(e);
    }
}
loadDepartments();
const searchDepartmentId = document.getElementById('searchDepartmentId');
if (searchDepartmentId) {
    searchDepartmentId.addEventListener('input', function () {
        const searchValue = this.value.trim();
        const rows = document.querySelectorAll('#departmentList tr');
        rows.forEach(row => {
            const idCell = row.querySelector('td:nth-child(1)');
            if (!searchValue || (idCell && idCell.textContent.includes(searchValue))) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

if (addDepartmentBtn) addDepartmentBtn.onclick = () => showDepartmentForm(true);
if (cancelDepartment) cancelDepartment.onclick = () => showDepartmentForm(false);

if (departmentForm) {
    departmentForm.onsubmit = async function (e) {
        e.preventDefault();
        const tenPb = departmentForm.tenPb.value;
        const motaPb = departmentForm.motaPb.value;
        const editId = departmentForm.getAttribute('data-edit-id');
        let url = '/api/departments';
        let method = 'POST';
        let body = { tenPb, motaPb };
        if (isValidId(editId)) {
            url += '/' + editId;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await res.json();
        if (res.ok) {
            alert(editId ? 'Cập nhật phòng ban thành công!' : 'Thêm phòng ban thành công!');
            showDepartmentForm(false);
            loadDepartments();
            await loadPhongbanSelect(); // Cập nhật lại select phòng ban cho nhân viên
        } else {
            alert(result.message || 'Có lỗi xảy ra!');
        }
    };
}

// ===== CHỨC VỤ: HIỂN THỊ, THÊM, SỬA, XOÁ =====
const positionTable = document.getElementById('positionTable');
const positionList = document.getElementById('positionList');
const addPositionBtn = document.getElementById('addPositionBtn');
const addPositionForm = document.getElementById('addPositionForm');
const positionForm = document.getElementById('positionForm');
const cancelPosition = document.getElementById('cancelPosition');

function showPositionForm(edit = false, cv = {}) {
    showForm(positionTable, addPositionForm, edit, {
        id: cv.chucvuId,
        tenCV: cv.tenCV,
        motaCV: cv.motaCV
    });
    if (edit && cv.chucvuId !== undefined) {
        positionForm.setAttribute('data-edit-id', cv.chucvuId);
    } else {
        positionForm.removeAttribute('data-edit-id');
    }
}

async function loadPositions() {
    if (!positionList) return;
    try {
        const res = await fetch('/api/positions');
        if (!res.ok) return;
        const data = await res.json();
        positionList.innerHTML = data.map((cv, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${cv.tenCV}</td>
                <td>${cv.motaCV || ''}</td>
                <td>
                  <button class="action-btn edit" data-id="${cv.chucvuId ?? ''}">Sửa</button>
                  <button class="action-btn delete" data-id="${cv.chucvuId ?? ''}">Xoá</button>
                </td>
            </tr>
        `).join('');

        // Sửa chức vụ
        positionList.querySelectorAll('.edit').forEach(btn => {
            btn.onclick = function () {
                const id = this.getAttribute('data-id');
                if (!isValidId(id)) return alert('Không tìm thấy ID chức vụ!');
                const cv = data.find(c => String(c.chucvuId) === String(id));
                if (!cv) return alert('Không tìm thấy chức vụ!');
                showPositionForm(true, cv);
            };
        });

        // Xoá chức vụ
        positionList.querySelectorAll('.delete').forEach(btn => {
            btn.onclick = async function () {
                const id = this.getAttribute('data-id');
                if (!isValidId(id)) return alert('Không tìm thấy ID chức vụ!');
                if (confirm('Bạn có chắc muốn xoá chức vụ này?')) {
                    const res = await fetch('/api/positions/' + id, { method: 'DELETE' });
                    const result = await res.json();
                    if (res.ok) {
                        alert('Xoá thành công!');
                        loadPositions();
                        await loadChucvuSelect && loadChucvuSelect();
                    } else {
                        alert(result.message || 'Có lỗi xảy ra khi xoá!');
                    }
                }
            };
        });
    } catch (e) {
        console.error(e);
    }
}
loadPositions();
const searchPositionId = document.getElementById('searchPositionId');
if (searchPositionId) {
    searchPositionId.addEventListener('input', function () {
        const searchValue = this.value.trim();
        const rows = document.querySelectorAll('#positionList tr');
        rows.forEach(row => {
            const idCell = row.querySelector('td:nth-child(1)');
            if (!searchValue || (idCell && idCell.textContent.includes(searchValue))) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

if (addPositionBtn) addPositionBtn.onclick = () => showPositionForm(true);
if (cancelPosition) cancelPosition.onclick = () => showPositionForm(false);

if (positionForm) {
    positionForm.onsubmit = async function (e) {
        e.preventDefault();
        const tenCV = positionForm.tenCV.value;
        const motaCV = positionForm.motaCV.value;
        const editId = positionForm.getAttribute('data-edit-id');
        let url = '/api/positions';
        let method = 'POST';
        let body = { tenCV, motaCV };
        if (isValidId(editId)) {
            url += '/' + editId;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await res.json();
        if (res.ok) {
            alert(editId ? 'Cập nhật chức vụ thành công!' : 'Thêm chức vụ thành công!');
            showPositionForm(false);
            loadPositions();
            await loadChucvuSelect && loadChucvuSelect();
        } else {
            alert(result.message || 'Có lỗi xảy ra!');
        }
    };
}

// ===== LƯƠNG: HIỂN THỊ, THÊM, SỬA, XOÁ =====
const salaryTable = document.getElementById('salaryTable');
const salaryList = document.getElementById('salaryList');
const addSalaryBtn = document.getElementById('addSalaryBtn');
const addSalaryForm = document.getElementById('addSalaryForm');
const salaryForm = document.getElementById('salaryForm');
const cancelSalary = document.getElementById('cancelSalary');
const salaryNhanvienId = document.getElementById('salaryNhanvienId');

// Load danh sách nhân viên vào select
async function loadSalaryNhanvienSelect() {
    if (!salaryNhanvienId) return;
    const res = await fetch('/api/employees');
    if (!res.ok) return;
    const data = await res.json();
    salaryNhanvienId.innerHTML = data.map(nv =>
        `<option value="${nv.nhanvienId}">${nv.tenNV}</option>`
    ).join('');
}

function showSalaryForm(edit = false, luong = {}) {
    loadSalaryNhanvienSelect().then(() => {
        showForm(salaryTable, addSalaryForm, edit, {
            id: luong.luongId,
            nhanvienId: luong.nhanvienId,
            Luongcoban: luong.Luongcoban,
            Phucap: luong.Phucap,
            Thuong: luong.Thuong
        });
        if (edit && luong.luongId !== undefined) {
            salaryForm.setAttribute('data-edit-id', luong.luongId);
        } else {
            salaryForm.removeAttribute('data-edit-id');
        }
    });
}

async function loadSalaries() {
    if (!salaryList) return;
    try {
        const res = await fetch('/api/salaries');
        if (!res.ok) return;
        const data = await res.json();
        salaryList.innerHTML = data.map((luong, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${luong.tenNV || ''}</td>
                <td>${luong.Luongcoban}</td>
                <td>${luong.Phucap}</td>
                <td>${luong.Thuong}</td>
                <td>
                  <button class="action-btn edit" data-id="${luong.luongId ?? ''}">Sửa</button>
                  <button class="action-btn delete" data-id="${luong.luongId ?? ''}">Xoá</button>
                </td>
            </tr>
        `).join('');

        // Sửa lương
        salaryList.querySelectorAll('.edit').forEach(btn => {
            btn.onclick = function () {
                const id = this.getAttribute('data-id');
                const luong = data.find(l => String(l.luongId) === String(id));
                if (!luong) return alert('Không tìm thấy bản ghi lương!');
                showSalaryForm(true, luong);
            };
        });

        // Xoá lương
        salaryList.querySelectorAll('.delete').forEach(btn => {
            btn.onclick = async function () {
                const id = this.getAttribute('data-id');
                if (!isValidId(id)) return alert('Không tìm thấy ID lương!');
                if (confirm('Bạn có chắc muốn xoá bản ghi lương này?')) {
                    const res = await fetch('/api/salaries/' + id, { method: 'DELETE' });
                    const result = await res.json();
                    if (res.ok) {
                        alert('Xoá thành công!');
                        loadSalaries();
                    } else {
                        alert(result.message || 'Có lỗi xảy ra khi xoá!');
                    }
                }
            };
        });
    } catch (e) {
        console.error(e);
    }
}
loadSalaries();

const searchSalaryId = document.getElementById('searchSalaryId');
if (searchSalaryId) {
    searchSalaryId.addEventListener('input', function () {
        const searchValue = this.value.trim();
        const rows = document.querySelectorAll('#salaryList tr');
        rows.forEach(row => {
            const idCell = row.querySelector('td:nth-child(1)');
            if (!searchValue || (idCell && idCell.textContent.includes(searchValue))) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

if (addSalaryBtn) addSalaryBtn.onclick = () => showSalaryForm(true);
if (cancelSalary) cancelSalary.onclick = () => showSalaryForm(false);

if (salaryForm) {
    salaryForm.onsubmit = async function (e) {
        e.preventDefault();
        const nhanvienId = salaryForm.nhanvienId.value;
        const Luongcoban = salaryForm.Luongcoban.value;
        const Phucap = salaryForm.Phucap.value;
        const Thuong = salaryForm.Thuong.value;
        const editId = salaryForm.getAttribute('data-edit-id');
        let url = '/api/salaries';
        let method = 'POST';
        let body = { nhanvienId, Luongcoban, Phucap, Thuong };
        if (isValidId(editId)) {
            url += '/' + editId;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await res.json();
        if (res.ok) {
            alert(editId ? 'Cập nhật lương thành công!' : 'Thêm lương thành công!');
            showSalaryForm(false);
            loadSalaries();
        } else {
            alert(result.message || 'Có lỗi xảy ra!');
        }
    };
}

// ===== Reset all SQL ======
document.getElementById('resetAllBtn').onclick = async function () {
    const password = prompt('Nhập mật khẩu quản trị để xác nhận xoá toàn bộ dữ liệu:');
    if (password !== 'Pubada123@') {
        alert('Mật khẩu không đúng!');
        return;
    }
    if (confirm('Bạn có chắc muốn xoá toàn bộ dữ liệu và reset ID?')) {
        const res = await fetch('/api/reset-all', { method: 'DELETE' });
        const result = await res.json();
        alert(result.message);
        loadDepartments && loadDepartments();
        loadEmployees && loadEmployees();
        loadPositions && loadPositions();
    }
};

const nhanvienSelect = document.getElementById('salaryNhanvienId');
nhanvienSelect.onchange = function() {
    const tenNV = this.options[this.selectedIndex].text;
    // Hiển thị tên nhân viên ở đâu đó
    document.getElementById('tenNhanVienHienThi').textContent = tenNV;
};
