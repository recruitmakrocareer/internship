# ระบบจัดการนักศึกษาฝึกงาน

ระบบเว็บสำหรับบริหารจัดการนักศึกษาฝึกงาน รองรับ 3 บทบาท: นักศึกษา, พี่เลี้ยง, ผู้ดูแลระบบ

## โมดูลหลัก

1. **ระบบนักศึกษา** - จัดการโปรไฟล์, ลงทะเบียน
2. **ระบบ Admin** - จัดการนักศึกษา, พี่เลี้ยง, งาน
3. **ระบบ Tracking** - ติดตามการเรียนรู้ตาม Roadmap + Training Passport
4. **ระบบส่งงาน** - ส่งงาน, ตรวจงาน, ให้คะแนน
5. **แจ้งเตือนไลน์** - ส่งข้อความผ่าน LINE Messaging API
6. **ระบบประเมิน** - ประเมินทั้งผู้ฝึกและผู้เรียน (รวมประเมินรายหัวข้อผ่าน QR Code)
7. **แหล่งความรู้** - รวมไฟล์, บทเรียน, เอกสาร
8. **Knowledge Management** - นักศึกษาบันทึกการเรียนรู้ 6 หัวข้อ เลือก 1 หัวข้อไปนำเสนอ
   พี่เลี้ยง/แอดมินติดตามความคืบหน้าและให้คะแนนการนำเสนอ 5 ด้าน (เต็ม 100)

## สถาปัตยกรรม

ระบบมี 2 ชั้น ไม่ต้องติดตั้งอะไรบนเครื่อง ใช้งานผ่าน browser ได้ทั้งหมด

| ชั้น | เทคโนโลยี | หน้าที่ |
|------|-----------|---------|
| `docs/` | HTML + Tailwind (CDN) + vanilla JS, hash router | หน้าเว็บทั้งหมด host บน GitHub Pages |
| `apps-script/` | Google Apps Script | REST API + Google Sheets เป็นฐานข้อมูล + Google Drive เก็บไฟล์ |

หน้าเว็บเรียก API ผ่าน `callApi()` / `callApiPost()` (`docs/js/api.js`) ไปยัง Web App URL
ของ Apps Script ทุก request ต้องผ่านการตรวจสิทธิ์ที่ `authorizeRequest_()` ใน
`apps-script/Session.gs` ก่อนเข้าถึง handler

## วิธี Deploy

### ขั้นตอนที่ 1: ตั้งค่า Google Sheets
สร้าง Google Spreadsheet ใหม่ 1 ไฟล์ (ระบบจะสร้างชีทและหัวตารางให้เองในขั้นตอนที่ 4)

### ขั้นตอนที่ 2: ตั้งค่า Google Apps Script
1. ที่ Spreadsheet เลือก **Extensions → Apps Script** (ต้องเป็นสคริปต์ที่ผูกกับ Sheet
   เพราะ `Config.gs` อ่าน ID จาก `SpreadsheetApp.getActiveSpreadsheet()`)
2. คัดลอกไฟล์ `.gs` **ทุกไฟล์** จากโฟลเดอร์ `apps-script/` ไปวางใน Apps Script Editor
   โดย**ไม่ต้องเอา `ALL_IN_ONE.gs`** — ไฟล์นั้นเป็นทางเลือกสำหรับคนที่อยากวางไฟล์เดียว
   (ถ้าเลือกใช้ `ALL_IN_ONE.gs` ต้องไม่มีไฟล์โมดูลอื่นในโปรเจกต์ ห้ามวางทั้งสองแบบพร้อมกัน
   เพราะฟังก์ชันชื่อซ้ำกันจะทับกันเงียบ ๆ)
3. แก้ `CONFIG.FRONTEND_URL` ใน `Config.gs` ให้เป็น URL ของ GitHub Pages ของคุณ
4. ถ้าใช้แจ้งเตือน LINE: **Project Settings → Script Properties** เพิ่ม
   `LINE_CHANNEL_ACCESS_TOKEN`
5. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy URL ที่ได้

> ทุกครั้งที่แก้โค้ดต้อง **Deploy → Manage deployments → Edit → New version** ไม่ใช่แค่ Save

### ขั้นตอนที่ 3: ตั้งค่า GitHub Pages
1. แก้ `docs/js/config.js` ใส่ URL ของ Apps Script Web App
2. Push code ขึ้น GitHub
3. Settings → Pages → Source: Deploy from branch → Branch: `main`, Folder: `/docs`
4. เว็บจะพร้อมใช้ที่ `https://<username>.github.io/internship/`

### ขั้นตอนที่ 4: Setup ระบบ
เปิด `YOUR_WEB_APP_URL?action=setupSystem` ครั้งเดียว ระบบจะสร้างชีททั้งหมด
พร้อมข้อมูลตัวอย่างและบัญชีทดสอบ

> `setupSystem` เรียกได้โดยไม่ต้องล็อกอิน **เฉพาะตอนที่ยังไม่มีบัญชี ADMIN ในระบบ**
> หลังจากนั้นต้องเป็น ADMIN เท่านั้น

คู่มือฉบับละเอียดพร้อมภาพ: `docs/SETUP-GUIDE.html`

## การตรวจสิทธิ์ (สำคัญ)

Web App ถูก deploy เป็น "Anyone" เพราะ GitHub Pages เรียกข้ามโดเมน ดังนั้นการป้องกัน
ทั้งหมดอยู่ที่ชั้น API:

- **Session token** — ล็อกอินสำเร็จจะได้โทเคนที่เซ็นด้วย HMAC-SHA256 (secret สร้าง
  อัตโนมัติเก็บใน Script Properties ชื่อ `SESSION_SECRET`) frontend เก็บไว้ใน
  localStorage และแนบไปกับทุก request เป็นพารามิเตอร์ `authToken`
- **ตารางสิทธิ์ต่อ action** — `ACTION_POLICY_` ใน `Session.gs` กำหนดว่า action ไหน
  เปิดสาธารณะ / ต้องล็อกอิน / ต้องเป็น ADMIN หรือ MENTOR
- **บังคับตัวตน** — พารามิเตอร์อย่าง `userId`, `studentId`, `evaluatorId`, `reviewerId`
  ถูกเขียนทับด้วยผู้ใช้ในโทเคน ทำให้ปลอมเป็นคนอื่นไม่ได้ (นักศึกษาอ่าน/แก้ได้แค่ข้อมูลตัวเอง)
- **ขอบเขตพี่เลี้ยง** — พี่เลี้ยงเข้าถึงข้อมูลได้เฉพาะนักศึกษาที่มีแถว active ในชีท
  `MentorStudents` (ทั้งที่แอดมินมอบหมายและที่นักศึกษาเพิ่มเอง) นอกนั้นตอบ `FORBIDDEN`
  ส่วนรายการรวม เช่น งานที่ส่งและภาพรวม KM ถูกกรองให้เหลือนักศึกษาในความดูแลฝั่ง server
- **อายุโทเคน** 12 ชั่วโมง ปรับได้ที่ `CONFIG.AUTH.SESSION_TTL_HOURS`
- **เพิกถอนทุกเซสชันทันที** — ลบ `SESSION_SECRET` ใน Project Settings (ทุกคนต้องล็อกอินใหม่)
- `CONFIG.AUTH.ENFORCE = false` ปิดการตรวจสิทธิ์ทั้งหมด — มีไว้เพื่อ debug ชั่วคราวเท่านั้น
  **ห้ามใช้บนระบบจริง**

**หลัง deploy เวอร์ชันนี้ ผู้ใช้ทุกคนต้องล็อกอินใหม่ 1 ครั้ง** เพราะเซสชันเดิมไม่มีโทเคน

ข้อจำกัดที่ทราบ: โทเคนเป็น stateless จึงเพิกถอนรายใบไม่ได้ — การระงับบัญชีหรือเปลี่ยน role
จะมีผลเต็มที่หลังโทเคนเดิมหมดอายุ (ลบ `SESSION_SECRET` เพื่อตัดทุกใบทันที)

## บัญชีทดสอบ (หลัง Setup)

| บทบาท | อีเมล | รหัสผ่าน |
|-------|-------|---------|
| Admin | admin@internship.com | admin123 |
| พี่เลี้ยง | mentor@internship.com | mentor123 |
| นักศึกษา 1 | student1@internship.com | student123 |
| นักศึกษา 2 | student2@internship.com | student123 |

> เปลี่ยนรหัสผ่านทันทีหลังใช้งานจริง

## คำสั่งสำหรับผู้พัฒนา

ต้องมี Node.js เฉพาะเวลารันสคริปต์เหล่านี้ (ไม่มี dependency ให้ติดตั้ง)

```bash
npm run build:gs   # รวมไฟล์โมดูล .gs ทั้งหมดเป็น apps-script/ALL_IN_ONE.gs
npm run check:gs   # ตรวจว่า ALL_IN_ONE.gs ตรงกับไฟล์โมดูล (ใช้ใน CI ได้)
npm test           # ทดสอบ backend: สิทธิ์, การกรองข้อมูล, ชีทข้อมูลอ้างอิง
npm run test:ui    # ทดสอบหน้า KM ฝั่งพี่เลี้ยง/แอดมินด้วยเบราว์เซอร์จริง (ต้องมี playwright)
```

`npm test` ไม่ต้องติดตั้งอะไรเลย ส่วน `npm run test:ui` ต้องติดตั้งก่อน:

```bash
npm i -D playwright && npx playwright install chromium
```

`ALL_IN_ONE.gs` เป็นไฟล์ที่ถูก generate — **ห้ามแก้โดยตรง** ให้แก้ไฟล์โมดูลแล้วรัน
`npm run build:gs` (สคริปต์จะเตือนด้วยถ้ามี action ที่ยังไม่มีนโยบายสิทธิ์
หรือเรียกฟังก์ชันที่ไม่มีอยู่)

## โครงสร้างโปรเจค

```
├── apps-script/                # Backend (Google Apps Script)
│   ├── Code.gs                 # doGet/doPost + ตาราง routing ของ action
│   ├── Config.gs               # ชื่อชีท, หัวตาราง, role, ค่า session
│   ├── Session.gs              # session token + ตารางสิทธิ์ต่อ action
│   ├── Database.gs             # CRUD บน Google Sheets (มี LockService)
│   ├── Auth.gs                 # login/register/reset/change password
│   ├── *Service.gs             # ตรรกะแต่ละโมดูล
│   ├── TrainingPassport.gs     # Training Passport 16 สัปดาห์
│   ├── KnowledgeManagement.gs  # Knowledge Management
│   ├── FileUpload.gs           # อัปโหลดไฟล์ลง Google Drive
│   └── ALL_IN_ONE.gs           # ไฟล์รวม (generated — ห้ามแก้)
├── docs/                       # Frontend (GitHub Pages)
│   ├── index.html              # SPA entry point
│   ├── SETUP-GUIDE.html        # คู่มือติดตั้งฉบับละเอียด
│   └── js/
│       ├── config.js           # URL ของ Apps Script Web App
│       ├── api.js              # ตัวเรียก API + จัดการ session token
│       ├── app.js              # helper และ layout ที่ใช้ร่วมกัน
│       ├── router.js           # hash-based router
│       ├── thai-address-data.js
│       └── pages/              # ฟังก์ชัน render ของแต่ละหน้า (25 ไฟล์)
└── tools/                      # สคริปต์ผู้พัฒนา (Node.js)
    ├── build-all-in-one.js     # generate ALL_IN_ONE.gs + ตรวจความสอดคล้อง
    ├── test-auth.js            # ทดสอบสิทธิ์ทุก action
    ├── test-filters.js         # ทดสอบการกรองข้อมูลและขอบเขตพี่เลี้ยง
    ├── test-reference-data.js  # ทดสอบการอ่านชีท StoreList/DepartmentList
    └── test-km-ui.js           # ทดสอบหน้า KM ด้วยเบราว์เซอร์จริง (ต้องมี playwright)
```
