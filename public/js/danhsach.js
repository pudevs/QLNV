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