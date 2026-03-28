# ระบบจัดการนักศึกษาฝึกงาน

ระบบเว็บสำหรับบริหารจัดการนักศึกษาฝึกงาน รองรับ 3 บทบาท: นักศึกษา, พี่เลี้ยง, ผู้ดูแลระบบ

## 7 โมดูลหลัก

1. **ระบบนักศึกษา** - จัดการโปรไฟล์, ลงทะเบียน
2. **ระบบ Admin** - จัดการนักศึกษา, พี่เลี้ยง, งาน
3. **ระบบ Tracking** - ติดตามการเรียนรู้ตาม Roadmap
4. **ระบบส่งงาน** - ส่งงาน, ตรวจงาน, ให้คะแนน
5. **แจ้งเตือนไลน์** - ส่งข้อความผ่าน LINE Messaging API
6. **ระบบประเมิน** - ประเมินทั้งผู้ฝึกและผู้เรียน
7. **แหล่งความรู้** - รวมไฟล์, บทเรียน, เอกสาร

## วิธี Deploy

### แบบที่ 1: GitHub Pages + Google Apps Script (แนะนำ)

ไม่ต้องติดตั้งอะไรบนเครื่อง ใช้ได้ผ่าน browser เท่านั้น

#### ขั้นตอนที่ 1: ตั้งค่า Google Sheets
1. สร้าง Google Spreadsheet ใหม่

#### ขั้นตอนที่ 2: ตั้งค่า Google Apps Script
1. ไปที่ [script.google.com](https://script.google.com) -> สร้างโปรเจคใหม่
2. Copy ไฟล์ `.gs` ทั้งหมดจากโฟลเดอร์ `apps-script/` ไปวางใน Apps Script Editor
3. Copy ไฟล์ `.html` ทั้งหมดจากโฟลเดอร์ `apps-script/` ไปวางเช่นกัน
4. ที่ `Config.gs` แก้ `SPREADSHEET_ID` เป็น ID ของ Google Sheet ที่สร้าง
5. Deploy -> New Deployment -> Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy URL ที่ได้

#### ขั้นตอนที่ 3: ตั้งค่า GitHub Pages
1. แก้ไฟล์ `docs/js/config.js` ใส่ URL ของ Apps Script Web App
2. Push code ขึ้น GitHub
3. Settings -> Pages -> Source: Deploy from branch -> Branch: main, Folder: /docs
4. เว็บจะพร้อมใช้ที่ `https://username.github.io/internship/`

#### ขั้นตอนที่ 4: Setup ระบบ
1. เปิดเว็บ -> เข้าหน้า Login
2. กด "Setup ระบบ" หรือเรียก API: `?action=setupSystem`
3. ระบบจะสร้าง Sheet + ข้อมูลตัวอย่างให้อัตโนมัติ

### แบบที่ 2: Google Apps Script อย่างเดียว

1. สร้าง Google Sheet + Apps Script (เหมือนขั้นตอนที่ 1-2 ด้านบน)
2. Deploy -> Web App
3. เปิด URL ที่ได้ -> ใช้งานได้เลย

## บัญชีทดสอบ (หลัง Setup)

| บทบาท | อีเมล | รหัสผ่าน |
|-------|-------|---------|
| Admin | admin@example.com | admin123 |
| พี่เลี้ยง | mentor@example.com | mentor123 |
| นักศึกษา 1 | student1@example.com | student123 |
| นักศึกษา 2 | student2@example.com | student123 |

## โครงสร้างโปรเจค

```
├── apps-script/        # Google Apps Script (backend + standalone web app)
│   ├── *.gs            # Server-side code (11 files)
│   ├── *.html          # HTML pages for standalone mode (18 files)
│   └── appsscript.json # Apps Script config
├── docs/               # GitHub Pages (static frontend)
│   ├── index.html      # Main SPA entry point
│   ├── js/             # JavaScript files
│   │   ├── config.js   # API URL configuration
│   │   ├── api.js      # API helper functions
│   │   ├── app.js      # Shared app logic
│   │   ├── router.js   # Hash-based router
│   │   └── pages/      # Page render functions (17 files)
│   └── css/            # Stylesheets
└── src/                # Next.js version (alternative)
```
