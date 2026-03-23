# Project State: ngason.com

## Tổng quan

ngason.com là một website tĩnh thuần HTML, CSS và JavaScript với mục tiêu lưu trữ ký ức địa danh Nga Sơn: tên các xã cũ trước sáp nhập, lịch sử biến động hành chính, bài viết về danh nhân và lịch sử địa phương, cùng thư viện ảnh tư liệu để người dân xa quê có thể tra cứu và hoài niệm.

Hiện dự án đã đi qua giai đoạn planning và đã có scaffold frontend chạy được. Nội dung lịch sử thật vẫn đang ở giai đoạn seed và cần được bổ sung từ nguồn kiểm chứng.

## Current status

- Repo đã có scaffold website tĩnh hoàn chỉnh.
- Đã có các trang chính: trang chủ, danh sách xã cũ, trang chi tiết xã, timeline, danh nhân, bài viết, gallery, giới thiệu và 404.
- Đã có CSS nền tảng, component chung, layout responsive và giao diện đủ để demo.
- Đã có JavaScript để đọc dữ liệu JSON và render nội dung phía client.
- Đã có dữ liệu seed mẫu cho xã, timeline, danh nhân, bài viết và gallery.
- Đã có ảnh SVG placeholder để website hiển thị ổn định trước khi có tư liệu thật.
- Đã kiểm tra cú pháp JavaScript và kiểm tra chạy local bằng static server.

## Product goal

- Lưu giữ ký ức địa danh và tư liệu Nga Sơn theo cách bền vững, dễ mở rộng.
- Cho phép người dùng xem lại tên xã cũ, các mốc sáp nhập, bài viết lịch sử và ảnh tư liệu.
- Xây một nền dữ liệu đủ tốt để sau này có thể thêm tìm kiếm, bộ lọc hoặc bản đồ mà không cần đổi kiến trúc nền.

## Audience

- Người dân Nga Sơn đang sống xa quê.
- Người trẻ muốn tìm hiểu lịch sử địa phương.
- Người sưu tầm tư liệu, ảnh cũ hoặc người muốn đóng góp nội dung.

## MVP scope

1. Trang chủ theo hướng biên tập.
2. Danh sách toàn bộ xã cũ trước sáp nhập.
3. Trang chi tiết từng xã.
4. Trang timeline lịch sử sáp nhập.
5. Chuyên mục bài viết lịch sử.
6. Chuyên mục danh nhân.
7. Thư viện ảnh tư liệu.
8. Trang giới thiệu dự án.
9. Trang 404.

## Out of scope for MVP

- Trang quản trị.
- Backend hoặc database.
- Đăng nhập, tài khoản, bình luận.
- Bản đồ tương tác hoàn chỉnh.
- Tìm kiếm nâng cao nhiều bộ lọc.

## Information architecture

### 1. Trang chủ

- Giới thiệu mục đích dự án.
- Dẫn nhanh tới xã cũ, timeline, danh nhân, bài viết, ảnh tư liệu.
- Hiển thị một số nội dung nổi bật.

### 2. Xã cũ trước sáp nhập

- Trang danh sách xã dạng lưới.
- Mỗi xã có tên, mô tả ngắn, ảnh đại diện nếu có.
- Mỗi card dẫn tới trang chi tiết riêng.

### 3. Trang chi tiết xã

- Tổng quan.
- Lịch sử hành chính.
- Ghi chú biên tập hoặc địa danh nổi bật.
- Liên kết tới nhân vật và bài viết liên quan.

### 4. Timeline lịch sử sáp nhập

- Các mốc hành chính theo trục thời gian.
- Mỗi mốc có mô tả ngắn và danh sách xã liên hệ.

### 5. Danh nhân

- Danh sách nhân vật tiêu biểu.
- Trang chi tiết nhân vật với phần thân bài và metadata liên quan.

### 6. Bài viết lịch sử

- Danh sách bài theo chuyên mục.
- Trang chi tiết bài viết với liên kết chéo sang xã hoặc nhân vật.

### 7. Thư viện ảnh

- Lưới ảnh tư liệu.
- Có lightbox bằng JavaScript thuần.
- Mỗi ảnh có caption và nhãn trạng thái.

## Recommended technical approach

- HTML dùng làm khung trang.
- CSS thuần quản lý token giao diện, layout, component và responsive.
- JavaScript thuần nạp dữ liệu JSON và render các khu vực động.
- Nội dung được tách khỏi giao diện để giảm hardcode và giúp mở rộng lâu dài.

## Implemented structure

### Pages

- index.html
- 404.html
- pages/communes.html
- pages/commune.html
- pages/timeline.html
- pages/people.html
- pages/person.html
- pages/posts.html
- pages/post.html
- pages/gallery.html
- pages/about.html

### Styles

- assets/css/main.css
- assets/css/pages.css

### Scripts

- assets/js/data.js
- assets/js/renderers.js
- assets/js/lightbox.js
- assets/js/app.js

### Data

- data/site.json
- data/communes.json
- data/timeline.json
- data/people.json
- data/posts.json
- data/gallery.json

### Placeholder images

- assets/images/hero-archival.svg
- assets/images/commune-placeholder.svg
- assets/images/portrait-placeholder.svg
- assets/images/gallery-placeholder-1.svg
- assets/images/gallery-placeholder-2.svg
- assets/images/gallery-placeholder-3.svg

## Content schema priorities

### 1. communes.json

- id
- slug
- name
- alternateNames
- summary
- periodLabel
- status
- statusLabel
- sourceStatus
- featuredImage
- relatedPosts
- relatedPeople
- tags
- sections

### 2. timeline.json

- id
- period
- title
- summary
- statusLabel
- relatedCommunes

### 3. people.json

- id
- slug
- name
- role
- summary
- statusLabel
- sourceStatus
- featuredImage
- relatedCommunes
- tags
- sections

### 4. posts.json

- id
- slug
- title
- category
- summary
- statusLabel
- sourceStatus
- featuredImage
- relatedCommunes
- relatedPeople
- sections

### 5. gallery.json

- id
- title
- image
- caption
- period
- statusLabel
- alt
- source

## Implementation phases

### Phase 1. Planning and schema

- Chốt kiến trúc nội dung.
- Chốt schema dữ liệu cho từng nhóm.
- Xác định phạm vi MVP.

### Phase 2. Static scaffold

- Tạo cấu trúc thư mục.
- Tạo layout chung.
- Tạo CSS nền tảng và responsive.
- Tạo bộ JS đọc dữ liệu và render giao diện.

### Phase 3. Seed integration

- Tạo dữ liệu seed cho từng module nội dung.
- Kết nối JSON với các trang thực tế.
- Kiểm tra điều hướng và trạng thái trống.

### Phase 4. Historical data entry

- Thay dữ liệu seed bằng danh sách xã cũ thật.
- Nhập các mốc timeline đã xác minh.
- Nhập bài viết, nhân vật và ảnh tư liệu thật.

### Phase 5. Launch polish

- Bổ sung SEO đầy đủ.
- Thêm favicon, metadata chia sẻ, alt text hoàn chỉnh.
- Tối ưu ảnh và hiệu năng.
- Kiểm tra trên mobile và desktop.

## Execution backlog

1. Chốt danh sách tất cả xã cũ trước sáp nhập.
2. Chuẩn hóa slug và tên gọi cho từng xã.
3. Nhập timeline các mốc hành chính chính.
4. Thay dữ liệu seed trong communes.json bằng dữ liệu thật.
5. Chọn 5 đến 10 nhân vật hoặc danh nhân tiêu biểu cho bộ đầu tiên.
6. Chọn 10 đến 20 ảnh tư liệu đầu tiên có nguồn rõ ràng.
7. Viết bài giới thiệu tổng quan về lịch sử và ký ức Nga Sơn.
8. Gắn liên kết chéo giữa xã, bài viết, nhân vật và ảnh.
9. Bổ sung tìm kiếm client-side ở pha kế tiếp.
10. Chuẩn bị static hosting cho bản public đầu tiên.

## Dependencies

- Chất lượng trang chi tiết phụ thuộc vào chất lượng dữ liệu xác minh.
- Timeline chỉ có giá trị khi được gắn ngược vào các hồ sơ xã.
- Gallery phụ thuộc vào việc chuẩn hóa ảnh, caption và nguồn.
- Nếu thêm bản đồ sau này, cần chuẩn hóa dữ liệu địa danh và tọa độ trước.

## Key risks

- Dữ liệu lịch sử có thể không đồng nhất hoặc thiếu nguồn.
- Ảnh tư liệu có thể thiếu thông tin nguồn hoặc chất lượng thấp.
- Nếu nhập nội dung không theo schema chung, chi phí bảo trì sẽ tăng nhanh.
- Nếu mở rộng tính năng quá sớm, đặc biệt là bản đồ hoặc tìm kiếm nâng cao, tiến độ sẽ bị chậm.

## Verification status

- JavaScript đã được kiểm tra cú pháp bằng Node.
- Site đã chạy được bằng static server local.
- Các file HTML, CSS, JS, JSON và SVG chính đã được tải thành công trong kiểm tra local.
- Hiện chưa có dữ liệu lịch sử thật để kiểm tra tính chính xác nội dung.

## Immediate next steps

1. Nhập danh sách xã cũ thật vào data/communes.json.
2. Thay timeline seed bằng các mốc lịch sử đã xác minh.
3. Viết bộ bài nền đầu tiên cho Nga Sơn.
4. Nâng giao diện từ scaffold sang bản public demo hoàn chỉnh.