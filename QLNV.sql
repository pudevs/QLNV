-- Tạo bảng login
CREATE TABLE [dbo].[login] (
[username] NVARCHAR (256) NOT NULL,
[password] NVARCHAR (256) NOT NULL,
[role] NVARCHAR(50) NOT NULL DEFAULT N'user'
);

-- Tạo bảng phongban
CREATE TABLE [dbo].[phongban] (
[phongbanId] INT IDENTITY (1, 1) NOT NULL,
[tenPb] NVARCHAR (255) NOT NULL,
[motaPb] NVARCHAR (255) NULL,
CONSTRAINT [PK_phongban] PRIMARY KEY CLUSTERED ([phongbanId] ASC)
);

-- Tạo bảng chucvu
CREATE TABLE [dbo].[chucvu] (
[chucvuId] INT IDENTITY (1, 1) NOT NULL,
[tenCV] NVARCHAR (255) NOT NULL,
[motaCV] NVARCHAR (255) NULL,
CONSTRAINT [PK_chucvu] PRIMARY KEY CLUSTERED ([chucvuId] ASC)
);

-- Tạo bảng nhanvien
CREATE TABLE [dbo].[nhanvien] (
[nhanvienId] INT IDENTITY (1, 1) NOT NULL,
[tenNV] NVARCHAR (256) NOT NULL,
[sdtNV] VARCHAR (20) NOT NULL,
[emailNV] NVARCHAR (256) NOT NULL,
[diachiNV] NVARCHAR (256) NULL,
[trangthaiNV] BIT NOT NULL,
[phongbanId] INT NOT NULL,
[chucvuId] INT NOT NULL,
CONSTRAINT [PK_nhanvien] PRIMARY KEY CLUSTERED ([nhanvienId] ASC),
CONSTRAINT [FK_nhanvien_phongban] FOREIGN KEY ([phongbanId]) REFERENCES [dbo].phongban,
CONSTRAINT [FK_nhanvien_chucvu] FOREIGN KEY ([chucvuId]) REFERENCES [dbo].chucvu
);

-- Tạo bảng luong
CREATE TABLE [dbo].[luong] (
[luongId] INT IDENTITY (1, 1) NOT NULL,
[nhanvienId] INT NOT NULL,
[Luongcoban] DECIMAL (18, 2) NOT NULL,
[Phucap] DECIMAL (18, 2) NULL,
[Thuong] DECIMAL (18, 2) NULL,
CONSTRAINT [PK_luong] PRIMARY KEY CLUSTERED ([luongId] ASC),
CONSTRAINT [FK_luong_nhanvien] FOREIGN KEY ([nhanvienId]) REFERENCES [dbo].nhanvien
);

-- Thêm dữ liệu mẫu vào bảng login
INSERT INTO [dbo].[login] ([username], [password])
VALUES
(N'pubada', N'pubada'),
(N'pupu', N'pupu');

-- Thêm dữ liệu mẫu vào bảng phongban
INSERT INTO [dbo].[phongban] ([tenPb], [motaPb])
VALUES
(N'Phòng Kinh Doanh', N'Phòng Kinh Doanh'),
(N'Phòng Kế Toán', N'Phòng Kế Toán'),
(N'Phòng Nhân Sự', N'Phòng Nhân Sự');

-- Thêm dữ liệu mẫu vào bảng chucvu
INSERT INTO [dbo].[chucvu] ([tenCV], [motaCV])
VALUES
(N'Công nghệ thông tin', N'Lập trình viên'),
(N'Thiết kế đồ hoạ', N'Designer'),
(N'Công nghệ thông tin', N'UX/UI');

-- Thêm dữ liệu mẫu vào bảng nhanvien
INSERT INTO [dbo].[nhanvien] ([tenNV], [sdtNV], [emailNV], [diachiNV], [trangthaiNV], [phongbanId], [chucvuId])
VALUES
(N'Nguyễn Văn A', '0123456789', 'vanthanh3045@gmail.com', N'Đà Nẵng', 1, 1, 1),
(N'Nguyễn Văn B', '0987654321', 'nguyenvanb@gmail.com', N'Hà Nội', 0, 2, 2),
(N'Nguyễn Văn C', '0912345678', 'nguyenvanc@gmail.com', N'Hồ Chí Minh', 1, 3, 3);

-- Thêm dữ liệu mẫu vào bảng luong
INSERT INTO [dbo].[luong] ([nhanvienId], [Luongcoban], [Phucap], [Thuong])
VALUES
(1, 10000000, 2000000, 500000),
(2, 12000000, 2500000, 700000),
(3, 15000000, 3000000, 800000);

