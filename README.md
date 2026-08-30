# Hệ thống Quản lý Hoạt động Sinh viên — full-stack

## Công nghệ
- Frontend: React.js + TypeScript + Vite, Ant Design, ECharts
- Backend: Node.js + NestJS + TypeScript, RESTful API, OAuth 2.0 / OpenID Connect (Google) + HttpOnly Session Cookie, RBAC
- Database: PostgreSQL + Prisma ORM
- Tích hợp: REST/JSON/HTTPS, OpenAPI/Swagger, API Key cho mock partner
- Phân tích: PostgreSQL aggregation + business metrics tại backend + ECharts
- Triển khai: Docker, Docker Compose, Nginx; sẵn sàng cho VPS/Cloud

## OAuth 2.0 / OpenID Connect
Ứng dụng không còn phát hành JWT access token/refresh token cho frontend. Luồng đăng nhập là:
1. Frontend chuyển người dùng tới `GET /api/auth/oauth/google`.
2. NestJS/Passport chuyển hướng sang Google OAuth 2.0.
3. Google gọi callback `GET /api/auth/oauth/google/callback`.
4. Backend kiểm tra email đã được cấp quyền trong PostgreSQL, lấy role RBAC và tạo HttpOnly session cookie.
5. API dùng `SessionAuthGuard`; frontend không lưu token trong localStorage.

### Cấu hình Google Cloud
Tạo OAuth 2.0 Client ID loại Web application và thêm Authorized redirect URI:
```text
http://localhost:3000/api/auth/oauth/google/callback
```

Sau đó tạo `backend/.env` từ `.env.example` và điền:
```env
OAUTH_GOOGLE_CLIENT_ID="..."
OAUTH_GOOGLE_CLIENT_SECRET="..."
OAUTH_GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/oauth/google/callback"
OAUTH_SESSION_SECRET="một-chuỗi-ngẫu-nhiên-dài"
FRONTEND_URL="http://localhost:5173"
```

Email Google phải trùng với email của user đã được seed/cấp quyền. Seed không còn tạo mật khẩu demo vì authentication đã chuyển hoàn toàn sang OAuth.

## Chạy local
Frontend:
```bash
npm install
npm run dev
```

Backend:
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```

Frontend mặc định gọi `/api`; khi chạy Vite riêng, đặt `VITE_API_URL=http://localhost:3000/api`.

Swagger: `http://localhost:3000/docs`

## Docker
```bash
docker compose up --build
```
- Web: `http://localhost`
- Swagger: `http://localhost/docs`

Khi chạy Docker, đặt OAuth secrets và `FRONTEND_URL` trong environment của service `api`. Production nên dùng HTTPS để cookie session được đánh dấu Secure.

## RBAC
Role được lấy từ user nội bộ sau OAuth và không phụ thuộc role do Google gửi. Các role hiện có:
- `STUDENT`
- `STAFF`
- `ADMIN`

## Mock partner API
```bash
curl -H "x-api-key: mock-partner-key" http://localhost:3000/api/mock/partner/students
```

## Kiến trúc
OAuth 2.0 / OpenID Connect xử lý danh tính; session cookie HttpOnly duy trì phiên ứng dụng. `SessionAuthGuard` xác thực phiên và `RolesGuard` kiểm soát RBAC. Analytics không tách microservice: aggregation nằm trong `AnalyticsService`.

Nginx phục vụ SPA và reverse proxy `/api` sang NestJS.

UI nghiệp vụ hiện tại được giữ lại để tránh mất màn hình; các form tương tác mới dùng Ant Design và trang thống kê đã chuyển sang ECharts.
