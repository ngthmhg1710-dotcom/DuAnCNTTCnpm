# YÊU CẦU QUAN TRỌNG – KHÔNG CHỈ TẠO DASHBOARD

Tôi đang xây dựng **Hệ thống quản lý các hoạt động sinh viên Khoa Công nghệ thông tin – Trường Đại học Tôn Đức Thắng**.

Tôi KHÔNG muốn prototype chỉ có 4 trang:

* Login
* Dashboard Sinh viên
* Dashboard Cán bộ
* Dashboard Admin

Đó chỉ là **4 trang gốc**.

Tôi cần Stitch tạo **TOÀN BỘ CÁC MÀN HÌNH CON của từng dashboard**, bao gồm danh sách, chi tiết, thêm mới, chỉnh sửa, xác minh, thống kê, báo cáo, cấu hình, modal, drawer và các trạng thái.

Hãy coi đây là một **full web application prototype**, không phải landing page hoặc dashboard showcase.

---

# 1. CẤU TRÚC ROUTE BẮT BUỘC

Hệ thống phải có các route/page riêng biệt.

## AUTH

### `/login`

Login.

### `/forgot-password`

Quên mật khẩu.

### `/reset-password`

Đặt lại mật khẩu.

---

# 2. SINH VIÊN

Sau khi đăng nhập bằng tài khoản Sinh viên:

`/student/dashboard`

Nhưng Dashboard chỉ là trang tổng quan.

Các chức năng bên trong phải có PAGE RIÊNG.

---

## 2.1. `/student/dashboard`

Dashboard sinh viên.

Phải có:

### Card thống kê

* Hoạt động đã đăng ký
* Hoạt động đã tham gia
* Hoạt động đang chờ xác minh
* Tiến độ tiêu chí

### Section "Hoạt động sắp diễn ra"

Danh sách hoạt động.

Mỗi item có:

* Tên
* Thời gian
* Địa điểm
* Loại
* Trạng thái

Có button:

`Xem chi tiết`

### Section "Tiến độ tiêu chí"

Hiển thị progress.

### Section "Cần chú ý"

Ví dụ:

* Còn thiếu tiêu chí
* Hoạt động đang chờ xác minh
* Chưa tham gia hoạt động

### Section "Hoạt động đề xuất"

Có button:

`Xem tất cả hoạt động`

---

# 3. SINH VIÊN – QUẢN LÝ HOẠT ĐỘNG

## `/student/activities`

### Activity List

Đây là trang danh sách hoạt động, KHÔNG phải dashboard.

Thiết kế đầy đủ:

Search:

`Tìm kiếm hoạt động...`

Filter:

* Học kỳ
* Loại hoạt động
* Đơn vị tổ chức
* Thời gian
* Trạng thái

Hiển thị dạng TABLE hoặc CARD.

Columns:

* Tên hoạt động
* Loại
* Đơn vị tổ chức
* Thời gian
* Địa điểm
* Số lượng
* Trạng thái
* Action

Action:

`Xem chi tiết`

---

# 4. SINH VIÊN – CHI TIẾT HOẠT ĐỘNG

## `/student/activities/:id`

Tạo một page hoàn chỉnh.

Header:

* Tên hoạt động
* Badge trạng thái
* Loại hoạt động

Thông tin:

* Đơn vị tổ chức
* Thời gian
* Địa điểm
* Số lượng
* Đối tượng
* Học kỳ
* Mô tả

### Tiêu chí liên quan

Hiển thị:

* Nhóm tiêu chí
* Tiêu chí
* Mức đóng góp / điểm nếu có cấu hình

### Action

Nếu chưa đăng ký:

`Đăng ký tham gia`

Nếu đã đăng ký:

`Đã đăng ký`

Có:

`Hủy đăng ký`

---

# 5. SINH VIÊN – HOẠT ĐỘNG ĐÃ ĐĂNG KÝ

## `/student/registered`

Table:

* Hoạt động
* Thời gian
* Địa điểm
* Ngày đăng ký
* Trạng thái

Filter:

* Học kỳ
* Trạng thái

Status:

* Đã đăng ký
* Đã tham gia
* Vắng
* Đang xác minh
* Đã xác minh

Click vào item → Activity Detail.

---

# 6. SINH VIÊN – HOẠT ĐỘNG ĐÃ THAM GIA

## `/student/participations`

Table:

* Hoạt động
* Loại
* Thời gian
* Đơn vị tổ chức
* Trạng thái
* Tiêu chí liên quan
* Kết quả

Có filter.

Có search.

---

# 7. SINH VIÊN – KHAI BÁO HOẠT ĐỘNG

## `/student/declarations`

Đây là PAGE RIÊNG.

Hiển thị:

* Mã khai báo
* Tên hoạt động
* Đơn vị tổ chức
* Ngày gửi
* Trạng thái
* Người xử lý
* Action

Status:

* Nháp
* Đã gửi
* Đang xử lý
* Cần bổ sung
* Đã xác minh
* Từ chối

Button:

`+ Khai báo hoạt động`

---

# 8. SINH VIÊN – TẠO KHAI BÁO

## `/student/declarations/create`

Form đầy đủ:

* Tên hoạt động
* Loại hoạt động
* Đơn vị tổ chức
* Thời gian
* Địa điểm
* Nội dung
* Mô tả
* Minh chứng

Upload file.

Buttons:

`Lưu nháp`

`Gửi khai báo`

Validation đầy đủ.

---

# 9. SINH VIÊN – CHI TIẾT KHAI BÁO

## `/student/declarations/:id`

Hiển thị:

### Thông tin hoạt động

### Thông tin khai báo

### Minh chứng

### Trạng thái

### Timeline xử lý

Timeline:

1. Sinh viên gửi
2. Cán bộ tiếp nhận
3. Kiểm tra
4. Xác minh
5. Chấp nhận / Từ chối

Nếu cần bổ sung:

Hiển thị:

`Cán bộ yêu cầu bổ sung`

và nội dung lý do.

Button:

`Bổ sung thông tin`

---

# 10. SINH VIÊN – TIÊU CHÍ & TIẾN ĐỘ

## `/student/criteria`

Đây là một PAGE RIÊNG.

Header:

`Tiến độ hoạt động của tôi`

Hiển thị:

### Overall Progress

Progress Circle.

### Các nhóm tiêu chí

Mỗi nhóm là một Card:

* Tên nhóm
* Mức yêu cầu
* Kết quả hiện tại
* Phần còn thiếu
* Progress

Button:

`Xem chi tiết`

---

# 11. SINH VIÊN – CHI TIẾT TIÊU CHÍ

## `/student/criteria/:id`

Hiển thị:

* Tên nhóm tiêu chí
* Mức yêu cầu
* Kết quả hiện tại
* Phần còn thiếu

### Hoạt động đã được ghi nhận

Table.

### Hoạt động còn thiếu

Table.

### Hoạt động đề xuất

Card.

Button:

`Xem hoạt động`

Lưu ý rõ:

Đây chỉ là thông tin hỗ trợ theo dõi và tham khảo, KHÔNG phải hệ thống chấm điểm rèn luyện chính thức.

---

# 12. SINH VIÊN – LỊCH SỬ

## `/student/history`

Timeline / Table toàn bộ lịch sử hoạt động.

Filter:

* Học kỳ
* Loại
* Trạng thái

---

# 13. SINH VIÊN – THÔNG BÁO

## `/student/notifications`

Notification Center.

Các loại:

* Xác minh
* Yêu cầu bổ sung
* Tiêu chí
* Nhắc nhở
* Hoạt động mới

Có:

* Đã đọc
* Chưa đọc
* Đánh dấu đã đọc

---

# 14. SINH VIÊN – HỒ SƠ

## `/student/profile`

Hiển thị:

* Avatar
* MSSV
* Họ tên
* Email
* Lớp
* Khóa
* Ngành
* Trạng thái
* Học kỳ

---

# 15. CÁN BỘ

Sau khi login bằng Cán bộ:

`/staff/dashboard`

---

# 16. CÁN BỘ – DASHBOARD

## `/staff/dashboard`

Tạo dashboard quản lý.

Statistics:

* Tổng sinh viên
* Tổng hoạt động
* Tổng lượt tham gia
* Tỷ lệ tham gia
* Chờ xác minh
* Sinh viên cần quan tâm

Charts:

1. Hoạt động theo học kỳ
2. Sinh viên tham gia theo lớp
3. Sinh viên tham gia theo khóa
4. Hoạt động theo loại
5. Trạng thái xác minh
6. Tiến độ tiêu chí

### Công việc cần xử lý

Cards:

* Khai báo chờ xác minh
* Yêu cầu bổ sung
* Đồng bộ lỗi
* Sinh viên cần quan tâm

Click mỗi card phải dẫn đến PAGE tương ứng.

---

# 17. CÁN BỘ – QUẢN LÝ SINH VIÊN

## `/staff/students`

Table:

* MSSV
* Họ tên
* Lớp
* Khóa
* Ngành
* Trạng thái
* Số hoạt động
* Mức độ tham gia
* Action

Filter:

* Lớp
* Khóa
* Ngành
* Trạng thái
* Học kỳ

Action:

`Xem chi tiết`

---

# 18. CÁN BỘ – CHI TIẾT SINH VIÊN

## `/staff/students/:id`

Header thông tin sinh viên.

Tabs:

### Tab 1 – Thông tin

Thông tin cá nhân.

### Tab 2 – Hoạt động

Danh sách hoạt động.

### Tab 3 – Lịch sử

Timeline.

### Tab 4 – Tiêu chí

Tiến độ tiêu chí.

### Tab 5 – Thống kê

Charts cá nhân.

### Tab 6 – Cảnh báo

Các vấn đề cần chú ý.

---

# 19. CÁN BỘ – QUẢN LÝ HOẠT ĐỘNG

## `/staff/activities`

Table:

* Tên
* Loại
* Đơn vị
* Học kỳ
* Thời gian
* Số lượng
* Đăng ký
* Trạng thái
* Action

Buttons:

`Tạo hoạt động`

`Xem`

`Sửa`

`Công bố`

`Đóng đăng ký`

---

# 20. CÁN BỘ – TẠO HOẠT ĐỘNG

## `/staff/activities/create`

Form:

* Tên
* Loại
* Đơn vị tổ chức
* Học kỳ
* Ngày bắt đầu
* Ngày kết thúc
* Thời gian
* Địa điểm
* Số lượng
* Đối tượng
* Mô tả
* Tiêu chí liên quan
* Trạng thái

Buttons:

`Lưu nháp`

`Công bố`

---

# 21. CÁN BỘ – CHỈNH SỬA HOẠT ĐỘNG

## `/staff/activities/:id/edit`

Dùng cùng form tạo hoạt động nhưng có dữ liệu sẵn.

---

# 22. CÁN BỘ – CHI TIẾT HOẠT ĐỘNG

## `/staff/activities/:id`

Header.

Statistics:

* Số đăng ký
* Số tham gia
* Vắng
* Tỷ lệ tham gia

Tabs:

### Tổng quan

### Người đăng ký

### Người tham gia

### Tiêu chí

### Lịch sử thay đổi

---

# 23. CÁN BỘ – QUẢN LÝ THAM GIA

## `/staff/participations`

Table:

* MSSV
* Họ tên
* Hoạt động
* Ngày đăng ký
* Trạng thái
* Xác minh
* Action

Có filter.

Có thể cập nhật trạng thái.

---

# 24. CÁN BỘ – XÁC MINH

## `/staff/verifications`

Đây là màn hình rất quan trọng.

Tabs:

* Tất cả
* Chờ xử lý
* Cần bổ sung
* Đã xác minh
* Từ chối

Table:

* Mã yêu cầu
* Sinh viên
* Hoạt động
* Đơn vị
* Ngày gửi
* Trạng thái
* Người xử lý
* Action

---

# 25. CÁN BỘ – CHI TIẾT XÁC MINH

## `/staff/verifications/:id`

Layout 2 cột.

### Cột trái

Thông tin sinh viên.

Thông tin hoạt động.

### Cột phải

Minh chứng.

### Phía dưới

Timeline.

Actions:

`Tiếp nhận`

`Yêu cầu bổ sung`

`Xác minh`

`Chấp nhận`

`Từ chối`

Nếu:

`Từ chối`

→ mở modal bắt buộc nhập lý do.

Nếu:

`Yêu cầu bổ sung`

→ mở modal nhập nội dung cần bổ sung.

---

# 26. CÁN BỘ – HỌC KỲ

## `/staff/semesters`

Table:

* Học kỳ
* Năm học
* Bắt đầu
* Kết thúc
* Trạng thái

Actions:

* Xem
* Sửa
* Đặt hiện tại

---

# 27. CÁN BỘ – TIÊU CHÍ

## `/staff/criteria`

Table:

* Nhóm
* Tiêu chí
* Mức yêu cầu
* Cách tính
* Hoạt động liên quan
* Học kỳ
* Trạng thái

Button:

`+ Thêm tiêu chí`

---

# 28. CÁN BỘ – TẠO TIÊU CHÍ

## `/staff/criteria/create`

Form:

* Học kỳ
* Nhóm tiêu chí
* Tên tiêu chí
* Mô tả
* Mức yêu cầu
* Hoạt động liên quan
* Cách tính
* Điều kiện đạt

---

# 29. CÁN BỘ – THỐNG KÊ

## `/staff/analytics`

Filter lớn phía trên:

* Học kỳ
* Khóa
* Lớp
* Loại hoạt động
* Trạng thái

Charts:

* Theo học kỳ
* Theo lớp
* Theo khóa
* Theo loại hoạt động
* Theo trạng thái
* Theo tháng

---

# 30. CÁN BỘ – BÁO CÁO

## `/staff/reports`

Danh sách:

1. Danh sách sinh viên
2. Lịch sử hoạt động
3. Hoạt động theo học kỳ
4. Sinh viên tham gia thấp
5. Báo cáo xác minh

Mỗi report có:

`Xem báo cáo`

`Xuất Excel`

`Xuất PDF`

---

# 31. CÁN BỘ – REPORT PREVIEW

## `/staff/reports/:id`

Tạo màn hình preview report.

Có filter.

Có bảng dữ liệu.

Buttons:

`Export Excel`

`Export PDF`

`Print`

---

# 32. CÁN BỘ – SINH VIÊN CẦN QUAN TÂM

## `/staff/attention-students`

Table:

* MSSV
* Họ tên
* Lớp
* Khóa
* Số hoạt động
* Tiến độ
* Tiêu chí thiếu
* Mức cảnh báo
* Đề xuất

Mức:

* Thấp
* Trung bình
* Cao

Click → Student Detail.

---

# 33. CÁN BỘ – HOẠT ĐỘNG ĐỀ XUẤT

## `/staff/recommendations`

Hiển thị:

### Sinh viên

### Tiêu chí còn thiếu

### Hoạt động phù hợp

Ví dụ:

Nguyễn Văn A

Thiếu: Hoạt động tình nguyện

Đề xuất:

"Ngày hội tình nguyện mùa hè"

Button:

`Xem hoạt động`

---

# 34. CÁN BỘ – THÔNG BÁO

## `/staff/notifications`

Danh sách notification.

Có:

* Tạo
* Xem
* Gửi
* Vô hiệu hóa

---

# 35. ADMIN

Sau login:

`/admin/dashboard`

---

# 36. ADMIN – DASHBOARD

## `/admin/dashboard`

Statistics:

* Tổng tài khoản
* Sinh viên
* Cán bộ
* Hoạt động
* Integration
* Sync success
* Sync failed
* Audit events

Charts:

* User growth
* Activity growth
* Synchronization
* Error rate
* System activity

---

# 37. ADMIN – QUẢN LÝ TÀI KHOẢN

## `/admin/accounts`

Table:

* Username
* Họ tên
* Email
* Role
* Trạng thái
* Last login
* Ngày tạo
* Action

Actions:

* Xem
* Sửa
* Khóa
* Mở khóa
* Reset password

---

# 38. ADMIN – CHI TIẾT TÀI KHOẢN

## `/admin/accounts/:id`

Hiển thị:

* User info
* Role
* Permissions
* Login history
* Status
* Created date

---

# 39. ADMIN – ROLE

## `/admin/roles`

Cards:

* Sinh viên
* Cán bộ
* Admin

Mỗi card:

* Tên
* Mô tả
* Số user
* Trạng thái

---

# 40. ADMIN – PERMISSION MATRIX

## `/admin/roles/:id/permissions`

Bảng:

Rows:

* Dashboard
* Sinh viên
* Hoạt động
* Tham gia
* Khai báo
* Xác minh
* Tiêu chí
* Báo cáo
* API
* Audit

Columns:

* View
* Create
* Update
* Delete
* Approve

Checkbox / Switch.

Button:

`Lưu thay đổi`

---

# 41. ADMIN – DANH MỤC

## `/admin/categories`

Quản lý:

* Loại hoạt động
* Đơn vị tổ chức
* Nhóm tiêu chí
* Trạng thái
* Danh mục khác

Có CRUD.

---

# 42. ADMIN – TÍCH HỢP API

## `/admin/integrations`

Table/Card:

* Tên hệ thống
* Base URL
* Authentication
* Status
* Last sync
* Action

Hệ thống:

* Phòng CTSV
* Hệ thống quản lý sinh viên
* Hệ thống hoạt động
* Mock API

Actions:

`Chi tiết`

`Cấu hình`

`Sync Now`

`Test Connection`

---

# 43. ADMIN – CẤU HÌNH API

## `/admin/integrations/:id`

Form:

* Integration name
* Base URL
* API type
* Authentication
* API Key
* OAuth
* Timeout
* Retry
* Webhook
* Sync frequency
* Enabled

Buttons:

`Test Connection`

`Save`

`Sync Now`

Secret phải được mask.

---

# 44. ADMIN – ĐỒNG BỘ DỮ LIỆU

## `/admin/synchronization`

Statistics:

* Total sync
* Success
* Failed
* Running
* Records synced

Chart:

Success / Failed theo thời gian.

Table:

* Integration
* Time
* Records
* Success
* Failed
* Duration
* Status
* Action

---

# 45. ADMIN – CHI TIẾT ĐỒNG BỘ

## `/admin/synchronization/:id`

Hiển thị:

* Integration
* Start
* End
* Duration
* Total records
* Success
* Failed

Error table:

* Record ID
* Error type
* Error message
* Status

Button:

`Retry failed`

---

# 46. ADMIN – AUDIT LOG

## `/admin/audit-logs`

Table:

* Time
* User
* Role
* Action
* Object
* Object ID
* Status

Filter:

* User
* Role
* Action
* Object
* Date

---

# 47. ADMIN – AUDIT DETAIL

## `/admin/audit-logs/:id`

Hiển thị:

* Người thực hiện
* Role
* Action
* Object
* Object ID
* Time
* Result
* Before
* After

Nếu có thay đổi:

Hiển thị dạng diff:

BEFORE | AFTER

---

# 48. ADMIN – SYSTEM SETTINGS

## `/admin/settings`

Tabs:

### General

* System name
* Logo
* Support email

### Security

* Session timeout
* Password policy

### Notification

* Email
* In-app notification

### Semester

* Current semester

### Integration

* API settings

### Audit

* Audit settings

---

# 49. CÁC MODAL BẮT BUỘC

Không được bỏ qua.

Tạo UI cho:

### Register Activity Modal

Xác nhận đăng ký.

### Cancel Registration Modal

Xác nhận hủy.

### Delete Activity Modal

Xác nhận xóa.

### Publish Activity Modal

Xác nhận công bố.

### Reject Declaration Modal

Nhập lý do từ chối.

### Request Supplement Modal

Nhập nội dung cần bổ sung.

### Approve Declaration Modal

Xác nhận duyệt.

### Lock Account Modal

Xác nhận khóa.

### Sync Now Modal

Xác nhận đồng bộ.

### Retry Sync Modal

Xác nhận retry.

---

# 50. CÁC STATE BẮT BUỘC

Mỗi module phải có:

### Loading

Skeleton.

### Empty

Ví dụ:

"Chưa có dữ liệu"

### Error

"Không thể tải dữ liệu"

Button:

`Thử lại`

### Success

Toast.

### Permission denied

"Bạn không có quyền truy cập."

### 404

"Không tìm thấy trang."

---

# 51. QUAN TRỌNG – CÁCH STITCH PHẢI TẠO

KHÔNG gom tất cả thành một dashboard.

KHÔNG chỉ tạo card tượng trưng.

KHÔNG chỉ tạo 4 màn hình.

Hãy tạo **từng PAGE riêng biệt** cho từng chức năng.

Ví dụ:

Dashboard Sinh viên
↓
Click "Hoạt động"
↓
Activity List
↓
Click một hoạt động
↓
Activity Detail
↓
Click "Đăng ký"
↓
Register Confirmation Modal
↓
Registered Activities
↓
Participation Detail

Tương tự với Cán bộ:

Staff Dashboard
↓
Verification Queue
↓
Verification Detail
↓
Approve / Reject
↓
Result

Và Admin:

Admin Dashboard
↓
Integration
↓
Integration Detail
↓
Sync
↓
Sync Detail
↓
Audit Log

---

# 52. MỤC TIÊU CUỐI CÙNG

Prototype cuối cùng phải giống một **hệ thống web thật có thể triển khai**, gồm:

### Authentication

3 role.

### Student

Khoảng 12–15 page.

### Staff

Khoảng 15–18 page.

### Admin

Khoảng 12–15 page.

Ngoài ra có:

* Modal
* Drawer
* Form
* Table
* Detail
* Filter
* Search
* Pagination
* Loading
* Empty
* Error
* Permission
* Notification

Tổng thể phải tạo thành **một hệ thống hoàn chỉnh với nhiều màn hình liên kết với nhau**, không phải 4 dashboard riêng lẻ.

Ưu tiên tạo đầy đủ **PAGE và USER FLOW trước**, sau đó mới tối ưu visual design.

Mọi text trên giao diện sử dụng **tiếng Việt**.

Không sử dụng Lorem Ipsum.

Không tạo thêm nghiệp vụ ngoài phạm vi đề tài.
