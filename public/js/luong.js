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