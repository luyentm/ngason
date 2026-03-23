# Project State: ngason.com

## Tổng quan

ngason.com hiện là một website tĩnh thuần HTML, CSS và JavaScript để lưu giữ ký ức địa danh Nga Sơn: các xã cũ, các lớp đơn vị trung gian, 6 xã mới sau sắp xếp năm 2025, lịch sử biến động hành chính, bài viết, nhân vật và ảnh tư liệu.

Dự án đã vượt qua giai đoạn scaffold. Phần xã và timeline hiện đã dùng dữ liệu lịch sử thật ở mức nền tảng, có thể tra cứu và điều hướng qua các trang detail. Các module people, posts và gallery vẫn còn chủ yếu ở trạng thái seed hoặc mới chỉ có khung nội dung.

## Current status

- Repo đã có website tĩnh hoàn chỉnh, chạy được bằng static server local.
- Đã có đủ các trang chính: trang chủ, danh sách xã, trang chi tiết xã, timeline, people, person, posts, post, gallery, about và 404.
- Đã có dữ liệu lịch sử thật cho phần xã và timeline.
- Đã có lớp dữ liệu quan hệ hành chính tại `data/commune-relations.json` để nối xã cũ, đơn vị trung gian và 6 xã mới sau 2025.
- Trang `pages/communes.html` đã hiển thị danh mục xã, card xã có thể click toàn thẻ, có search theo xã cũ, xã mới và từ khóa lịch sử.
- Tag tên xã trong timeline đã là link thật tới trang detail.
- Trang `pages/commune.html` hiện là trang detail động dùng chung cho xã lịch sử, đơn vị trung gian và cả 6 xã mới sau 2025.
- Trang detail xã đã có breadcrumb, chuỗi chuyển đổi hành chính, timeline liên quan, xã liên hệ, điều hướng trước sau và liên kết chéo giữa các xã.
- Card xã trên trang danh sách đã không còn dùng chung một ảnh placeholder đơn điệu; hiện dùng thumbnail động sinh theo từng xã.
- Cơ chế `reveal` đã được chỉnh lại để không làm ẩn các section dữ liệu lớn.

## Product goal

- Lưu giữ ký ức địa danh và tư liệu Nga Sơn theo cách bền vững, dễ mở rộng.
- Cho phép người dùng tra lại tên xã cũ, mốc sáp nhập, đơn vị kế thừa và xã hiện nay.
- Tạo nền dữ liệu đủ chắc để sau này mở rộng sang tìm kiếm mạnh hơn, bản đồ hoặc đóng góp tư liệu.

## Audience

- Người dân Nga Sơn đang sống xa quê.
- Người trẻ muốn tìm hiểu lịch sử địa phương.
- Người sưu tầm tư liệu, ảnh cũ hoặc người muốn đóng góp nội dung.

## MVP scope

1. Trang chủ theo hướng biên tập.
2. Danh sách toàn bộ xã cũ và đơn vị liên quan.
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
- Tìm kiếm nâng cao nhiều bộ lọc phức tạp.

## Information architecture

### 1. Trang chủ

- Giới thiệu mục đích dự án.
- Dẫn nhanh tới xã cũ, timeline, danh nhân, bài viết, ảnh tư liệu.
- Hiển thị một số nội dung nổi bật.

### 2. Xã cũ và đơn vị hành chính liên quan

- Trang danh sách xã dạng lưới.
- Có danh mục link nhanh theo tên xã.
- Có khu vực hiển thị 6 xã mới sau năm 2025.
- Có search theo tên xã cũ, xã mới và từ khóa lịch sử.

### 3. Trang chi tiết xã

- Tổng quan hồ sơ.
- Chuỗi chuyển đổi hành chính.
- Timeline liên quan.
- Xã liên quan và xã kế thừa.
- Breadcrumb và điều hướng tuần tự giữa các hồ sơ.

### 4. Timeline lịch sử sáp nhập

- Các mốc hành chính theo trục thời gian.
- Tag tên xã có thể click sang hồ sơ chi tiết.
- Có search theo năm, tên xã hoặc sự kiện.

### 5. Danh nhân

- Đã có khung trang danh sách và chi tiết.
- Nội dung vẫn chủ yếu là dữ liệu seed.

### 6. Bài viết lịch sử

- Đã có khung trang danh sách và chi tiết.
- Nội dung vẫn chủ yếu là dữ liệu seed.

### 7. Thư viện ảnh

- Đã có lưới ảnh và lightbox bằng JavaScript thuần.
- Nội dung ảnh vẫn đang ở mức placeholder hoặc seed.

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
- data/commune-relations.json
- data/timeline.json
- data/people.json
- data/posts.json
- data/gallery.json

### Research and docs

- docs/nga-son-communes-research.md
- docs/nga-son-communes-mapping.md
- project state.md

## Historical data status

### communes.json

- Đã thay seed bằng bộ dữ liệu lịch sử thực cho xã và đơn vị trung gian của Nga Sơn.
- Hiện có các xã nền, thị trấn Nga Sơn, Nga Phượng, Nga Hiệp và các mô tả ngắn theo từng hồ sơ.

### commune-relations.json

- Đã mô hình hóa các quan hệ hành chính:
	- đơn vị lịch sử
	- đơn vị trung gian
	- 6 xã mới sau 2025
	- tiền thân
	- kế thừa
	- mốc timeline liên quan
	- searchTerms

### timeline.json

- Đã thay seed bằng các mốc thật:
	- 1966
	- 1982
	- 1988
	- 2019
	- 2024/01-01-2025
	- 2025

### people/posts/gallery

- Vẫn phần lớn là dữ liệu seed.
- Cấu trúc trang và renderer đã sẵn sàng nhưng nội dung thực còn thiếu.

## Features completed

### Phase 1. Planning and architecture

- Chốt hướng đi static HTML/CSS/JS, không dùng framework.
- Chốt schema dữ liệu cho site, communes, timeline, people, posts, gallery.
- Tạo file state và kế hoạch triển khai.

### Phase 2. Static scaffold

- Tạo toàn bộ cấu trúc thư mục, HTML, CSS, JS.
- Tạo layout chung, responsive, header/footer, các page shell.
- Tạo lightbox cho gallery.

### Phase 3. Historical base implementation

- Nghiên cứu danh sách xã Nga Sơn theo các mốc 1966, 1982, 1988, 2019, 2024, 2025.
- Tạo tài liệu research và mapping.
- Đưa dữ liệu xã thật vào `data/communes.json`.
- Đưa timeline thật vào `data/timeline.json`.

### Phase 4. Commune UX and navigation

- Thêm search theo xã cũ, xã mới và từ khóa lịch sử.
- Thêm tag click từ timeline sang trang xã.
- Làm giàu trang detail xã với profile cards, breadcrumb, transition chain, cluster liên quan và điều hướng trước sau.
- Hỗ trợ trang detail cho 6 xã mới sau 2025 bằng profile động.
- Thêm danh mục link nhanh trên trang danh sách xã.
- Làm card xã click toàn bộ thẻ.
- Thay thumbnail placeholder bằng thumbnail động theo từng xã.
- Sửa lỗi `reveal` khiến section dữ liệu lớn có lúc không hiện.

## Remaining work

### Nội dung dữ liệu

1. Thay dữ liệu seed trong `data/people.json` bằng hồ sơ nhân vật thật.
2. Thay dữ liệu seed trong `data/posts.json` bằng bài viết thật.
3. Thay dữ liệu seed trong `data/gallery.json` bằng ảnh và caption có nguồn.
4. Bổ sung nội dung sâu hơn cho từng xã trong `data/communes.json`.

### Chất lượng dữ liệu và nghiên cứu

5. Nâng độ chắc chắn nguồn của một số mốc 2019 đang mới ở mức nguồn tổng hợp.
6. Tiếp tục chuẩn hóa liên kết chéo giữa xã, bài viết, nhân vật và ảnh.
7. Bổ sung các slug hoặc từ khóa phụ nếu phát hiện cách gọi quen thuộc khác từ người dùng địa phương.

### UX / product

8. Bổ sung bộ lọc theo nhóm xã hoặc theo giai đoạn ngoài search text hiện tại.
9. Cân nhắc làm trang sâu hơn riêng cho 6 xã mới năm 2025 nếu muốn nhấn mạnh tra cứu ngược từ tên mới.
10. Hoàn thiện SEO, favicon, social metadata và kiểm thử trên mobile/desktop.

## Current todo

### Done

- Scaffold toàn site.
- Dữ liệu xã thật.
- Dữ liệu timeline thật.
- Quan hệ xã cũ, xã trung gian, xã mới.
- Search phần xã.
- Detail page sâu cho xã.
- Breadcrumb và điều hướng chéo.
- Tag tên xã clickable.
- Danh mục xã clickable trong `communes.html`.
- Thumbnail động cho card xã.
- Fix lỗi reveal ẩn dữ liệu.

### In progress

- Chuyển các module nội dung còn lại từ seed sang dữ liệu thật.

### Next

1. People: nhập nhân vật thật và gắn với xã tương ứng.
2. Posts: viết bộ bài nền đầu tiên về lịch sử và ký ức Nga Sơn.
3. Gallery: nhập ảnh tư liệu đầu tiên có nguồn rõ ràng.
4. SEO/polish: hoàn thiện metadata và soát hiển thị mobile.

## Dependencies

- Chất lượng trang detail phụ thuộc trực tiếp vào chất lượng dữ liệu xác minh.
- Timeline chỉ có giá trị đầy đủ khi tiếp tục được gắn ngược sang people, posts, gallery.
- Gallery phụ thuộc vào việc chuẩn hóa nguồn ảnh và caption.
- Nếu mở bản đồ sau này, cần chuẩn hóa thêm dữ liệu địa danh và tọa độ.

## Key risks

- Một số mốc lịch sử vẫn cần nguồn cấp một rõ hơn, đặc biệt lớp thay đổi năm 2019.
- Nếu tiếp tục giữ people/posts/gallery ở trạng thái seed quá lâu, tổng thể site sẽ mạnh ở phần xã nhưng yếu ở chiều sâu nội dung.
- Nếu thêm nhiều tính năng trước khi hoàn thiện dữ liệu thật, khối bảo trì sẽ tăng nhanh.

## Verification status

- JavaScript đã được kiểm tra cú pháp nhiều lần bằng Node sau mỗi đợt sửa lớn.
- JSON dữ liệu chính đã parse thành công.
- Static server local đã trả HTTP 200 cho các trang trọng yếu.
- Đã kiểm tra trực tiếp các route đại diện:
	- `pages/communes.html`
	- `pages/commune.html?slug=nga-bach`
	- `pages/commune.html?slug=nga-phuong`
	- `pages/commune.html?slug=thi-tran-nga-son`
	- `pages/commune.html?slug=xa-nga-son-2025`
	- `pages/timeline.html`

## Immediate next steps

1. Bắt đầu thay seed ở people/posts/gallery bằng dữ liệu thật.
2. Viết bộ bài nền đầu tiên liên kết trực tiếp với một số xã tiêu biểu.
3. Bổ sung ảnh tư liệu và caption thật cho gallery.
4. Hoàn thiện SEO và polish để sẵn sàng cho bản public demo.