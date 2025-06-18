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

const nhanvienSelect = document.getElementById('salaryNhanvienId');
nhanvienSelect.onchange = function() {
    const tenNV = this.options[this.selectedIndex].text;
    // Hiển thị tên nhân viên ở đâu đó
    document.getElementById('tenNhanVienHienThi').textContent = tenNV;
};
