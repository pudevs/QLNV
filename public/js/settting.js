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

// public/js/theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggleButton');
    // const themeToggleCheckbox = document.getElementById('themeToggleCheckbox'); // Nếu dùng checkbox

    const htmlElement = document.documentElement; // Thẻ <html>

    // Hàm để đặt theme
    function setTheme(themeName) {
        localStorage.setItem('theme', themeName);
        htmlElement.setAttribute('data-theme', themeName);

        // Cập nhật nội dung nút (hoặc trạng thái checkbox)
        if (themeToggleButton) {
            if (themeName === 'dark') {
                themeToggleButton.textContent = 'Chuyển sang Chế độ Sáng';
            } else {
                themeToggleButton.textContent = 'Chuyển sang Chế độ Tối';
            }
        }
        /*
        if (themeToggleCheckbox) {
            themeToggleCheckbox.checked = themeName === 'dark';
        }
        */
    }

    // Hàm để chuyển đổi theme
    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // Kiểm tra và áp dụng theme đã lưu khi trang tải lần đầu
    // (Phần này cũng được xử lý bởi script inline trong <head> để tránh FOUC,
    // nhưng ở đây chúng ta cập nhật lại trạng thái của nút/checkbox)
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        setTheme(currentTheme); // Áp dụng theme và cập nhật nút
    } else {
        setTheme('light'); // Mặc định là light nếu chưa có gì trong localStorage
    }
    

    // Gán sự kiện cho nút
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
    /*
    if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', () => {
            setTheme(themeToggleCheckbox.checked ? 'dark' : 'light');
        });
    }
    */
});