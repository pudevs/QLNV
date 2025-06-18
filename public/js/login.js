// ===== KIỂM TRA ĐĂNG NHẬP (trừ trang login, signup) =====
const publicPages = ['login.html', 'signup.html'];
const currentPage = window.location.pathname.split('/').pop();
if (!publicPages.includes(currentPage) && !localStorage.getItem('user')) {
    window.location.href = 'login.html';
}
// Xử lý trường hợp quay lại trang bằng nút Back (cache)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        if (!localStorage.getItem('user') && !publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
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
            window.location.href = data.user.role === 'admin' ? 'danhsach.html' : 'portfolio.html';
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
        window.location.href = 'login.html';
    };
}