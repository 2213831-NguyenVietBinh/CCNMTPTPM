# TÓM TẮT BÁO CÁO DỰ ÁN: ANTIGRAVITY BLOG/CMS

Bản tóm tắt báo cáo dự án nghiên cứu và xây dựng hệ thống quản trị nội dung (CMS) và Blog cá nhân thời gian thực sử dụng kiến trúc Next.js và Supabase.

---

## 1. GIỚI THIỆU & MỤC TIÊU ĐỀ TÀI

*   **Bối cảnh:** Các hệ thống CMS truyền thống (như WordPress cũ, Monolithic) thường bộc lộ nhiều điểm yếu về tốc độ tải trang, nguy cơ bảo mật dữ liệu (SQL Injection), hạ tầng vận hành cồng kềnh, và thiếu khả năng tương tác trực tiếp theo thời gian thực.
*   **Mô tả đề tài:** Dự án tập trung phát triển **Antigravity Blog/CMS** - một hệ thống blog cá nhân và quản lý nội dung cao cấp với giao diện tối (Dark mode) hiện đại, thiết kế kính mờ (Glassmorphism), và các hiệu ứng chuyển động vi mô (Micro-animations).
*   **Mục tiêu hệ thống:**
    *   Tối ưu hóa SEO và tốc độ phản hồi trang ban đầu.
    *   Bảo mật dữ liệu tuyệt đối thông qua bộ lọc quyền truy cập từ cơ sở dữ liệu.
    *   Cập nhật bình luận trực tiếp không cần tải lại trang.
    *   Đóng gói container hóa ứng dụng để triển khai dễ dàng lên mọi nền tảng đám mây.

---

## 2. CÔNG NGHỆ SỬ DỤNG

| Công nghệ | Phân tầng | Vai trò chính trong dự án |
| :--- | :--- | :--- |
| **Next.js 14** | Presentation & API Layer | Điều hướng định tuyến (App Router), hiển thị giao diện, tối ưu SEO, xử lý Server Actions. |
| **PostgreSQL (Supabase)** | Database Layer | Lưu trữ dữ liệu quan hệ, thực thi các chính sách bảo mật RLS, tự động hóa dữ liệu qua trigger. |
| **Supabase Auth** | Security Layer | Quản lý đăng ký, đăng nhập bằng email/mật khẩu, phân quyền Router qua Middleware. |
| **Supabase Storage** | File Storage Layer | Lưu trữ tệp ảnh bìa bài viết trong bucket `post-thumbnails` công khai. |
| **Supabase Realtime** | Communication Layer | Duy trì kết nối WebSocket để đồng bộ bình luận tức thời tới người đọc. |
| **Tailwind CSS** | Styling Layer | Xây dựng giao diện Responsive, quản trị bảng màu sắc tối (Dark mode) và hiệu ứng kính mờ. |
| **TypeScript** | Quality Control Layer | Đảm bảo tính nhất quán của kiểu dữ liệu, nâng cao chất lượng code và hạn chế lỗi runtime. |

---

## 3. KIẾN TRÚC HỆ THỐNG & CƠ SỞ DỮ LIỆU

### 3.1. Sơ đồ thực thể liên kết (ERD)
*   **Profiles (Hồ sơ):** Liên kết 1:1 với bảng xác thực người dùng hệ thống (`users`).
*   **Posts (Bài viết):** Quan hệ Một-Nhiều (1:N) với tác giả (`profiles`).
*   **Comments (Bình luận):** Quan hệ Một-Nhiều (1:N) với cả bài viết (`posts`) và tác giả viết bình luận (`profiles`).
*   **Tags (Thẻ nhãn):** Quan hệ Nhiều-Nhiều (M:N) với bài viết thông qua bảng liên kết trung gian `post_tags`.

### 3.2. Bảo mật Row-Level Security (RLS)
Toàn bộ các bảng dữ liệu đều được kích hoạt RLS nhằm kiểm soát phân quyền chặt chẽ ngay tại tầng cơ sở dữ liệu:
*   `profiles`: Mọi người được phép đọc hồ sơ công khai của tác giả; chỉ chính chủ mới được sửa thông tin cá nhân.
*   `posts`: Độc giả vãng lai chỉ được xem bài viết đã xuất bản (`published`); tác giả được quyền xem/sửa/xóa bài viết của chính mình.
*   `comments`: Mọi người được xem bình luận; người dùng đăng nhập được viết bình luận; chỉ tác giả bình luận hoặc tác giả bài viết mới được quyền xóa.
*   **Admin Role:** Người dùng có quyền quản trị viên (`admin`) được cấp quyền thực thi tối cao (vượt qua mọi chính sách RLS).

### 3.3. Quy trình tự động hóa (Trigger & Functions)
*   **Đồng bộ hồ sơ tự động:** Tạo trigger tự động sao chép thông tin từ bảng xác thực hệ thống sang bảng hồ sơ cá nhân (`profiles`) ngay khi người dùng đăng ký thành công.
*   **Tự động cập nhật thời gian:** Trigger tự động điền mốc thời gian chỉnh sửa bài viết mới nhất vào trường `updated_at`.
*   **Hàm đếm lượt xem (RPC):** Xây dựng stored procedure định nghĩa quyền hạn thực thi cao hơn RLS để tăng số lượt đọc bài viết một cách an toàn mà không cần cấp quyền cập nhật bài viết cho độc giả.

---

## 4. PHÂN TÍCH CHỨC NĂNG CHÍNH

1.  **Xác thực người dùng:** Đăng ký, đăng nhập an toàn sử dụng JWT mã hóa lưu trữ trong cookie HTTP-only. Tích hợp Next.js Middleware để tự động chuyển hướng người dùng chưa đăng nhập khi cố truy cập trang dashboard.
2.  **Quản lý bài viết (CRUD):** Giao diện quản lý dành riêng cho tác giả hỗ trợ soạn thảo nội dung bằng Markdown, tự động tạo URL slug từ tiêu đề bài viết, liên kết các thẻ nhãn phân loại và tải lên ảnh bìa trực tiếp lên bộ lưu trữ đám mây Supabase Storage.
3.  **Bình luận thời gian thực:** Luồng bình luận được kết nối trực tiếp đến kênh WebSocket của Supabase. Khi có bình luận mới được ghi vào cơ sở dữ liệu, giao diện của tất cả người dùng đang đọc bài viết sẽ tự động cập nhật ngay lập tức mà không cần F5 trang.
4.  **Bảng điều khiển Admin (Admin Console):** Quản trị viên hệ thống có toàn quyền theo dõi danh sách tất cả bài viết, kiểm duyệt nội dung bình luận phản cảm, quản lý danh sách thành viên và nâng cấp/hạ quyền hạn của người dùng.

---

## 5. ỨNG DỤNG TRỢ LÝ AI TRONG PHÁT TRIỂN
*   **Thiết kế DB:** AI hỗ trợ phân tích cấu trúc chuẩn hóa, đề xuất liên kết bảng tối ưu và soạn thảo mã SQL cấu hình các quy tắc bảo mật RLS phức tạp.
*   **Xử lý Logic:** Sinh mã nguồn cho các Server Actions điều phối dữ liệu quan hệ của bài viết và tags nhãn, cấu hình kết nối WebSocket và thiết kế Middleware.
*   **Gỡ lỗi & Tối ưu:** AI tìm ra nguyên nhân và khắc phục lỗi cache trang tĩnh của Next.js (bằng cách tích hợp `revalidatePath`), gỡ lỗi phân quyền tải ảnh bìa lên Storage Bucket, và đề xuất biên dịch Markdown trực tiếp trên máy chủ để tối ưu tốc độ tải trang ban đầu.

---

## 6. CONTAINER HÓA & QUY TRÌNH TRIỂN KHAI (DEPLOYMENT)

### 6.1. Đóng gói Docker đa tầng (Multi-stage Build)
*   **Giai đoạn 1 (Dependencies):** Cài đặt các thư viện cần thiết trong container Alpine siêu nhẹ.
*   **Giai đoạn 2 (Builder):** Sao chép mã nguồn và biên dịch dự án Next.js thành dạng chạy độc lập (standalone package).
*   **Giai đoạn 3 (Runner):** Chỉ sao chép các tệp tin sản phẩm đã tối ưu từ Builder, chạy ứng dụng dưới quyền user hạn chế (Non-root user) để loại bỏ nguy cơ chiếm quyền kiểm soát máy chủ vật lý.

### 6.2. Quy trình triển khai thực tế trên VPS
1.  Đẩy mã nguồn lên kho lưu trữ bảo mật (GitHub).
2.  Kết nối vào VPS Linux, kéo mã nguồn về và cấu hình tệp tin `.env` môi trường thực tế.
3.  Dùng **Docker Compose** khởi chạy container tại cổng nội bộ `3000`.
4.  Cài đặt **Nginx làm Reverse Proxy** để đón nhận kết nối từ cổng tiêu chuẩn `80`/`443` rồi chuyển tiếp nội bộ về container Next.js.
5.  Sử dụng công cụ **Certbot (Let's Encrypt)** để xin cấp chứng chỉ bảo mật SSL miễn phí và tự động chuyển hướng truy cập từ HTTP sang HTTPS mã hóa.

---

## 7. HẠN CHẾ & ĐỊNH HƯỚNG CẢI TIẾN TƯƠNG LAI

*   **Hạn chế hiện tại:**
    *   Trình soạn thảo bài viết dạng textarea đơn giản, chưa trực quan (WYSIWYG).
    *   Luồng bình luận là danh sách phẳng, chưa hỗ trợ trả lời theo nhánh (Reply).
    *   Bộ đếm lượt xem bài viết dễ bị tăng lượt xem ảo do chưa kiểm soát IP độc giả.
*   **Định hướng phát triển:**
    *   Tích hợp thư viện soạn thảo kéo thả hình ảnh và xem trước trực quan.
    *   Cải tiến cấu trúc database tự tham chiếu để hỗ trợ bình luận đa cấp.
    *   Sử dụng cơ sở dữ liệu lưu đệm Redis để theo dõi địa chỉ IP độc giả trong 24 giờ nhằm ghi nhận lượt đọc thực tế.
    *   Kết nối trực tiếp Gemini API để hỗ trợ tác giả tự động tối ưu hóa từ khóa SEO, tóm tắt bài viết và sửa lỗi chính tả bằng trí tuệ nhân tạo.
