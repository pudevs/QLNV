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