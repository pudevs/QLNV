const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));

// Config kết nối SQL Server
const config = {
  user: 'pubada',
  password: '123456',
  server: 'localhost',
  database: 'QLNV',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// ===== ĐĂNG NHẬP/ĐĂNG KÝ =====
// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Thiếu tên đăng nhập hoặc mật khẩu!' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT username, role
      FROM login
      WHERE username = ${username} AND password = ${password}
    `;
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.json({ message: 'Đăng nhập thành công!', user });
    } else {
      res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server lỗi');
  }
});

// Đăng ký
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Thiếu tên đăng nhập hoặc mật khẩu!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO login (username, password)
      VALUES (${username}, ${password})
    `;
    res.status(201).json({ message: 'Tạo tài khoản thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tạo tài khoản.', error: err.message });
  }
});

// API xoá toàn bộ dữ liệu và reset IDENTITY
app.delete('/api/reset-all', async (req, res) => {
  try {
    await sql.connect(config);
    // Xoá dữ liệu bảng con trước (luong, nhanvien), sau đó bảng cha (phongban)
    await sql.query`DELETE FROM luong`;
    await sql.query`DELETE FROM nhanvien`;
    await sql.query`DELETE FROM phongban`;
    // Reset lại IDENTITY về 0
    await sql.query`DBCC CHECKIDENT ('luong', RESEED, 0)`;
    await sql.query`DBCC CHECKIDENT ('nhanvien', RESEED, 0)`;
    await sql.query`DBCC CHECKIDENT ('phongban', RESEED, 0)`;
    res.json({ message: 'Đã xoá toàn bộ dữ liệu và reset IDENTITY!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi reset dữ liệu.', error: err.message });
  }
});

// Lấy danh sách nhân viên
app.get('/api/employees', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT nv.*, pb.tenPb, cv.tenCV
      FROM nhanvien nv
      LEFT JOIN phongban pb ON nv.phongbanId = pb.phongbanId
      LEFT JOIN chucvu cv ON nv.chucvuId = cv.chucvuId
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server lỗi');
  }
});

// ===== NHÂN VIÊN: HIỂN THỊ, THÊM, SỬA, XOÁ =====
// Thêm nhân viên
app.post('/api/employees', async (req, res) => {
  const { tenNV, emailNV, sdtNV, diachiNV, phongbanId, chucvuId, trangthaiNV } = req.body;
  if (!tenNV || !emailNV || !sdtNV) {
    return res.status(400).json({ message: 'Thiếu thông tin nhân viên!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO nhanvien (tenNV, emailNV, sdtNV, diachiNV, phongbanId, chucvuId, trangthaiNV)
      VALUES (${tenNV}, ${emailNV}, ${sdtNV}, ${diachiNV}, ${phongbanId}, ${chucvuId}, ${trangthaiNV})
    `;
    res.status(201).json({ message: 'Thêm nhân viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi thêm nhân viên.', error: err.message });
  }
});

// Sửa nhân viên
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { tenNV, emailNV, sdtNV, diachiNV, phongbanId, chucvuId, trangthaiNV } = req.body;
  if (!tenNV || !emailNV || !sdtNV) {
    return res.status(400).json({ message: 'Thiếu thông tin nhân viên!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      UPDATE nhanvien
      SET tenNV = ${tenNV},
          emailNV = ${emailNV},
          sdtNV = ${sdtNV},
          diachiNV = ${diachiNV},
          phongbanId = ${phongbanId},
          chucvuId = ${chucvuId},
          trangthaiNV = ${trangthaiNV}
      WHERE nhanvienId = ${id}
    `;
    res.json({ message: 'Cập nhật nhân viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật nhân viên.', error: err.message });
  }
});

// (Tùy chọn) Xoá nhân viên
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(config);
    // Xoá lương trước
    await sql.query`DELETE FROM luong WHERE nhanvienId = ${id}`;
    // Sau đó xoá nhân viên
    await sql.query`DELETE FROM nhanvien WHERE nhanvienId = ${id}`;
    res.json({ message: 'Xoá nhân viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xoá nhân viên.', error: err.message });
  }
});

// ===== PHÒNG BAN: HIỂN THỊ, THÊM, SỬA, XOÁ =====
// Lấy danh sách phòng ban
app.get('/api/departments', async (req, res) => {
  try {
    await sql.connect(config);
    // Chỉ định rõ tên trường, không dùng SELECT *
    const result = await sql.query`
      SELECT phongbanId AS phongbanId, tenPb, motaPb FROM phongban
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy phòng ban.', error: err.message });
  }
});


// Thêm phòng ban 
app.post('/api/departments', async (req, res) => {
  const { tenPb, motaPb } = req.body;
  if (!tenPb) {
    return res.status(400).json({ message: 'Thiếu tên phòng ban!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO phongban (tenPb, motaPb)
      VALUES (${tenPb}, ${motaPb})
    `;
    res.status(201).json({ message: 'Thêm phòng ban thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi thêm phòng ban.', error: err.message });
  }
});

// Sửa phòng ban
app.put('/api/departments/:id', async (req, res) => {
  const { id } = req.params;
  const { tenPb, motaPb } = req.body;
  if (!tenPb) {
    return res.status(400).json({ message: 'Thiếu tên phòng ban!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      UPDATE phongban
      SET tenPb = ${tenPb}, motaPb = ${motaPb}
      WHERE phongbanId = ${id}
    `;
    res.json({ message: 'Cập nhật phòng ban thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật phòng ban.', error: err.message });
  }
});

// Xoá phòng ban
app.delete('/api/departments/:id', async (req, res) => {
  let id = req.params.id;
  // Ép kiểu về số và kiểm tra hợp lệ
  id = Number(id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID phòng ban không hợp lệ!' });
  }
  try {
    await sql.connect(config);
    await sql.query`DELETE FROM phongban WHERE phongbanId = ${id}`;
    res.json({ message: 'Xoá phòng ban thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xoá phòng ban.', error: err.message });
  }
});

// ===== CHỨC VỤ: HIỂN THỊ, THÊM, SỬA, XOÁ =====
// Lấy danh sách chức vụ
app.get('/api/positions', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT chucvuId, tenCV, motaCV FROM chucvu`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy chức vụ.' });
  }
});

// Thêm chức vụ
app.post('/api/positions', async (req, res) => {
  const { tenCV, motaCV } = req.body;
  if (!tenCV) {
    return res.status(400).json({ message: 'Thiếu tên chức vụ!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO chucvu (tenCV, motaCV)
      VALUES (${tenCV}, ${motaCV})
    `;
    res.status(201).json({ message: 'Thêm chức vụ thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thêm chức vụ.', error: err.message });
  }
});

// Sửa chức vụ
app.put('/api/positions/:id', async (req, res) => {
  const { id } = req.params;
  const { tenCV, motaCV } = req.body;
  if (!tenCV) {
    return res.status(400).json({ message: 'Thiếu tên chức vụ!' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      UPDATE chucvu
      SET tenCV = ${tenCV}, motaCV = ${motaCV}
      WHERE chucvuId = ${id}
    `;
    res.json({ message: 'Cập nhật chức vụ thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật chức vụ.', error: err.message });
  }
});

// Xoá chức vụ
app.delete('/api/positions/:id', async (req, res) => {
  let id = req.params.id;
  id = Number(id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID chức vụ không hợp lệ!' });
  }
  try {
    await sql.connect(config);
    await sql.query`DELETE FROM chucvu WHERE chucvuId = ${id}`;
    res.json({ message: 'Xoá chức vụ thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá chức vụ.', error: err.message });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server chạy ở http://localhost:${port}`);
});
