# Gửi email và nhắc nhở tự động

## Hệ thống làm được gì

| Việc | Ở đâu |
|---|---|
| Gửi nhắc nhở thủ công cho nhiều sinh viên của nhiều hoạt động (thông báo trong hệ thống và/hoặc email) | Cán bộ → **Gửi nhắc nhở** (hoặc nút "Gửi nhắc nhở" trong chi tiết hoạt động) |
| Tự nhắc sinh viên đã đăng ký trước giờ hoạt động diễn ra (nội dung tự chọn) | Cán bộ → Hoạt động → Thêm/Sửa → mục "Tự động nhắc sinh viên đã đăng ký" |
| Tự nhắc hằng ngày sinh viên thiếu tiêu chí / có nguy cơ không đạt (mỗi người 7 ngày mới nhắc lại) | Cán bộ → Cần chú ý → ô "Tự động nhắc hằng ngày" |

Biến tự điền trong nội dung: `{ten}` `{hoatdong}` `{thoigian}` `{diadiem}`.

## 1. Cấu hình gửi email (chọn một cách)

### Cách A: Gmail SMTP (tài khoản Gmail của bạn)
1. Bật **Xác minh 2 bước** cho tài khoản Gmail (myaccount.google.com → Bảo mật).
2. Tạo **Mật khẩu ứng dụng**: myaccount.google.com/apppasswords → đặt tên bất kỳ → copy chuỗi 16 ký tự.
3. Đặt biến môi trường: `SMTP_USER` = địa chỉ Gmail, `SMTP_PASS` = mật khẩu ứng dụng vừa tạo (không phải mật khẩu Gmail).

Lưu ý: **Render gói miễn phí chặn cổng SMTP**, nên cách này chạy được ở máy local hoặc khi Render nâng gói trả phí. Gmail giới hạn khoảng 500 thư/ngày.

### Cách B: Brevo qua HTTPS (chạy được trên Render miễn phí, 300 thư/ngày)
1. Tạo tài khoản tại brevo.com → Senders → thêm và **xác minh** địa chỉ Gmail của bạn làm người gửi.
2. SMTP & API → API Keys → tạo khóa.
3. Đặt biến môi trường: `BREVO_API_KEY` = khóa vừa tạo, `MAIL_FROM` = địa chỉ Gmail đã xác minh.

Thư gửi qua Brevo có thể vào hộp thư rác nhiều hơn so với gửi trực tiếp từ Gmail.

Ở đâu đặt biến: Render → service → **Environment** (rồi deploy lại); chạy local thì ghi vào `backend/.env`.
Kiểm tra: vào trang **Gửi nhắc nhở**, dòng dưới ô "Gửi email" ghi đã cấu hình hay chưa.
`MAIL_DRY_RUN=true` để thử mà không gửi thật.

## 2. Bật chạy tự động

Render gói miễn phí tự ngủ khi lâu không có người dùng nên không tự hẹn giờ được. Hệ thống dùng GitHub Actions gọi API mỗi giờ (file `.github/workflows/auto-reminders.yml`).

1. Tạo một chuỗi ngẫu nhiên dài: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Render → Environment → thêm `CRON_SECRET` = chuỗi đó → deploy lại.
3. GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
   - `CRON_SECRET` = cùng chuỗi trên
   - `API_URL` = địa chỉ backend, ví dụ `https://student-activity-api-xxxx.onrender.com` (không có `/api`, không có dấu `/` cuối)
4. Tab **Actions** → "Nhắc nhở tự động" → **Run workflow** để chạy thử. Kết quả trả về dạng JSON, ví dụ `{"activities":[...],"criteria":null}`.

Không đặt `CRON_SECRET` thì endpoint `/api/jobs/run` bị tắt (trả 503). Sai khóa trả 401 và được ghi vào Audit Log.

## Cách hệ thống tránh spam
- Nhắc theo hoạt động: mỗi hoạt động nhắc **một lần**, đổi giờ bắt đầu thì nhắc lại.
- Nhắc tiêu chí: mỗi sinh viên không bị nhắc lại trong **7 ngày**.
- Thông báo trong hệ thống cùng loại chưa đọc thì được cập nhật tại chỗ thay vì tạo thêm.
- Chỉ gửi cho sinh viên thật sự thuộc hoạt động đã chọn, tối đa 500 sinh viên và 30 hoạt động mỗi lần.
