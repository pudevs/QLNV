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