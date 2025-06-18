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