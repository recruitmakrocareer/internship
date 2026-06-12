// ==================== หน้าสมัครสมาชิก ====================

var _regStoreList = [];
var _regDeptList = [];

// ==================== ข้อมูลจังหวัดและรหัสไปรษณีย์ ====================
var THAI_PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา',
  'ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก',
  'นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน',
  'บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา',
  'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต',
  'มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี',
  'ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ',
  'สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี',
  'สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี',
  'อุบลราชธานี'
];

var THAI_PROVINCE_POSTCODE = {
  'กรุงเทพมหานคร':'10100','กระบี่':'81000','กาญจนบุรี':'71000','กาฬสินธุ์':'46000','กำแพงเพชร':'62000',
  'ขอนแก่น':'40000','จันทบุรี':'22000','ฉะเชิงเทรา':'24000','ชลบุรี':'20000','ชัยนาท':'17000',
  'ชัยภูมิ':'36000','ชุมพร':'86000','เชียงราย':'57000','เชียงใหม่':'50000','ตรัง':'92000','ตราด':'23000',
  'ตาก':'63000','นครนายก':'26000','นครปฐม':'73000','นครพนม':'48000','นครราชสีมา':'30000',
  'นครศรีธรรมราช':'80000','นครสวรรค์':'60000','นนทบุรี':'11000','นราธิวาส':'96000','น่าน':'55000',
  'บึงกาฬ':'38000','บุรีรัมย์':'31000','ปทุมธานี':'12000','ประจวบคีรีขันธ์':'77000','ปราจีนบุรี':'25000',
  'ปัตตานี':'94000','พระนครศรีอยุธยา':'13000','พะเยา':'56000','พังงา':'82000','พัทลุง':'93000',
  'พิจิตร':'66000','พิษณุโลก':'65000','เพชรบุรี':'76000','เพชรบูรณ์':'67000','แพร่':'54000',
  'ภูเก็ต':'83000','มหาสารคาม':'44000','มุกดาหาร':'49000','แม่ฮ่องสอน':'58000','ยโสธร':'35000',
  'ยะลา':'95000','ร้อยเอ็ด':'45000','ระนอง':'85000','ระยอง':'21000','ราชบุรี':'70000','ลพบุรี':'15000',
  'ลำปาง':'52000','ลำพูน':'51000','เลย':'42000','ศรีสะเกษ':'33000','สกลนคร':'47000','สงขลา':'90000',
  'สตูล':'91000','สมุทรปราการ':'10270','สมุทรสงคราม':'75000','สมุทรสาคร':'74000','สระแก้ว':'27000',
  'สระบุรี':'18000','สิงห์บุรี':'16000','สุโขทัย':'64000','สุพรรณบุรี':'72000','สุราษฎร์ธานี':'84000',
  'สุรินทร์':'32000','หนองคาย':'43000','หนองบัวลำภู':'39000','อ่างทอง':'14000','อำนาจเจริญ':'37000',
  'อุดรธานี':'41000','อุตรดิตถ์':'53000','อุทัยธานี':'61000','อุบลราชธานี':'34000'
};

var SKILLS_CHECKBOXES = ['Excel', 'การเขียนโปรแกรม', 'Graphic Designer', 'Automation', 'ทักษะการขาย', 'การบริการลูกค้า'];

function buildProvinceOptions(selectedValue) {
  var opts = '<option value="">-- เลือกจังหวัด --</option>';
  for (var i = 0; i < THAI_PROVINCES.length; i++) {
    var p = THAI_PROVINCES[i];
    opts += '<option value="' + p + '"' + (p === selectedValue ? ' selected' : '') + '>' + p + '</option>';
  }
  return opts;
}

async function loadRegDropdownData() {
  try {
    var storeRes = await callApi('getStoreList');
    if (storeRes && storeRes.success && storeRes.data) _regStoreList = storeRes.data;
  } catch (e) { console.error('Load store list error:', e); }
  try {
    var deptRes = await callApi('getDepartmentList');
    if (deptRes && deptRes.success && deptRes.data) _regDeptList = deptRes.data;
  } catch (e) { console.error('Load dept list error:', e); }
}

function buildStoreOptions() {
  var opts = '<option value="">-- เลือกสาขา --</option>';
  for (var i = 0; i < _regStoreList.length; i++) {
    var s = _regStoreList[i];
    opts += '<option value="' + s.storeNo + ' - ' + s.storeName + '">' + s.storeNo + ' - ' + s.storeName + '</option>';
  }
  return opts;
}

function buildDeptOptions() {
  var opts = '<option value="">-- เลือกแผนก --</option>';
  var lastDiv = '';
  for (var i = 0; i < _regDeptList.length; i++) {
    var d = _regDeptList[i];
    if (d.division !== lastDiv) {
      if (lastDiv !== '') opts += '</optgroup>';
      opts += '<optgroup label="' + d.division + '">';
      lastDiv = d.division;
    }
    opts += '<option value="' + d.department + '">' + d.department + '</option>';
  }
  if (lastDiv !== '') opts += '</optgroup>';
  return opts;
}

function buildSkillsCheckboxesHtml() {
  var html = '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">';
  for (var i = 0; i < SKILLS_CHECKBOXES.length; i++) {
    var sk = SKILLS_CHECKBOXES[i];
    html += '<label class="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" class="reg-skill-cb w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" value="' + sk + '"> ' + sk + '</label>';
  }
  html += '</div>';
  html += '<div><label class="flex items-center gap-2 text-sm text-gray-700 mb-1"><input type="checkbox" id="reg-skill-other-cb" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"> อื่นๆ</label>';
  html += '<input type="text" id="reg-skill-other-text" placeholder="ระบุทักษะอื่นๆ" disabled class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm mt-1"></div>';
  return html;
}

function collectSkillsValue() {
  var skills = [];
  var cbs = document.querySelectorAll('.reg-skill-cb');
  for (var i = 0; i < cbs.length; i++) {
    if (cbs[i].checked) skills.push(cbs[i].value);
  }
  var otherCb = document.getElementById('reg-skill-other-cb');
  var otherText = document.getElementById('reg-skill-other-text');
  if (otherCb && otherCb.checked && otherText && otherText.value.trim()) {
    skills.push(otherText.value.trim());
  }
  return skills.join(', ');
}

function renderRegister() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 fade-in my-8">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">สมัครสมาชิก</h1>
          <p class="text-gray-500 mt-1 text-sm">ระบบจัดการฝึกงาน Makro - กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งาน</p>
        </div>

        <div id="register-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>
        <div id="register-success" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>

        <div id="reg-loading" class="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
        <form id="register-form" class="space-y-6 hidden"></form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            มีบัญชีอยู่แล้ว?
            <a href="#login" class="text-primary-600 hover:text-primary-700 font-medium">เข้าสู่ระบบ</a>
          </p>
        </div>
      </div>
    </div>
  `;

  loadRegDropdownData().then(function() {
    document.getElementById('reg-loading').classList.add('hidden');
    var form = document.getElementById('register-form');
    form.classList.remove('hidden');
    var storeOpts = buildStoreOptions();
    var deptOpts = buildDeptOptions();
    var provinceOpts = buildProvinceOptions('');

    form.innerHTML = `
      <!-- Section 1: ข้อมูลบัญชี -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">1</span>
          <h2 class="text-lg font-semibold text-gray-800">ข้อมูลบัญชี</h2>
        </div>
        <div class="space-y-4 pl-9">
          <div>
            <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">อีเมล <span class="text-red-500">*</span></label>
            <input type="email" id="reg-email" placeholder="example@email.com" required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน <span class="text-red-500">*</span></label>
              <input type="password" id="reg-password" placeholder="อย่างน้อย 6 ตัวอักษร" required minlength="6"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน <span class="text-red-500">*</span></label>
              <input type="password" id="reg-confirm-password" placeholder="กรอกรหัสผ่านอีกครั้ง" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
        </div>
      </div>

      <hr class="border-gray-200">

      <!-- Section 2: ข้อมูลส่วนตัว -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">2</span>
          <h2 class="text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
        </div>
        <div class="space-y-4 pl-9">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="reg-prefix" class="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า <span class="text-red-500">*</span></label>
              <select id="reg-prefix" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                <option value="">-- เลือก --</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div>
              <label for="reg-first-name" class="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง <span class="text-red-500">*</span></label>
              <input type="text" id="reg-first-name" placeholder="ชื่อจริง" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-last-name" class="block text-sm font-medium text-gray-700 mb-1">นามสกุล <span class="text-red-500">*</span></label>
              <input type="text" id="reg-last-name" placeholder="นามสกุล" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="reg-nickname" class="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น</label>
              <input type="text" id="reg-nickname" placeholder="ชื่อเล่น"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-birth-date" class="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
              <input type="date" id="reg-birth-date"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-phone" class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input type="tel" id="reg-phone" placeholder="0xx-xxx-xxxx"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-id-card" class="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน <span class="text-red-500">*</span></label>
              <input type="text" id="reg-id-card" placeholder="เลข 13 หลัก" maxlength="13" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-military" class="block text-sm font-medium text-gray-700 mb-1">สถานะทางทหาร</label>
              <select id="reg-military"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                <option value="">-- เลือก --</option>
                <option value="ผ่านการเกณฑ์ทหารแล้ว">ผ่านการเกณฑ์ทหารแล้ว</option>
                <option value="ได้รับการยกเว้น">ได้รับการยกเว้น</option>
                <option value="ผ่านการศึกษาวิชาทหาร (รด.)">ผ่านการศึกษาวิชาทหาร (รด.)</option>
              </select>
            </div>
          </div>
          <div>
            <label for="reg-medical" class="block text-sm font-medium text-gray-700 mb-1">โรคประจำตัว</label>
            <input type="text" id="reg-medical" placeholder="ระบุโรคประจำตัว (ถ้ามี)"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
        </div>
      </div>

      <hr class="border-gray-200">

      <!-- Section 3: ที่อยู่ -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">3</span>
          <h2 class="text-lg font-semibold text-gray-800">ที่อยู่</h2>
        </div>
        <div class="space-y-4 pl-9">
          <h3 class="text-sm font-semibold text-gray-600">ที่อยู่ปัจจุบัน</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-current-house-no" class="block text-sm font-medium text-gray-700 mb-1">บ้านเลขที่</label>
              <input type="text" id="reg-current-house-no" placeholder="เช่น 123/4"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-current-village" class="block text-sm font-medium text-gray-700 mb-1">หมู่บ้าน/อาคาร</label>
              <input type="text" id="reg-current-village" placeholder="หมู่บ้าน/อาคาร"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-current-soi" class="block text-sm font-medium text-gray-700 mb-1">ซอย</label>
              <input type="text" id="reg-current-soi" placeholder="ซอย"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-current-road" class="block text-sm font-medium text-gray-700 mb-1">ถนน</label>
              <input type="text" id="reg-current-road" placeholder="ถนน"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-current-subdistrict" class="block text-sm font-medium text-gray-700 mb-1">แขวง/ตำบล</label>
              <input type="text" id="reg-current-subdistrict" placeholder="แขวง/ตำบล"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-current-district" class="block text-sm font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
              <input type="text" id="reg-current-district" placeholder="เขต/อำเภอ"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-current-province" class="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
              <select id="reg-current-province"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${provinceOpts}
              </select>
            </div>
            <div>
              <label for="reg-current-postcode" class="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
              <input type="text" id="reg-current-postcode" placeholder="รหัสไปรษณีย์" maxlength="5"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4 mb-2">
            <input type="checkbox" id="reg-same-address" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
            <label for="reg-same-address" class="text-sm text-gray-700">ที่อยู่ตามบัตรประชาชนเหมือนที่อยู่ปัจจุบัน</label>
          </div>

          <div id="reg-idcard-address-section">
            <h3 class="text-sm font-semibold text-gray-600 mb-3">ที่อยู่ตามบัตรประชาชน</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="reg-idcard-house-no" class="block text-sm font-medium text-gray-700 mb-1">บ้านเลขที่</label>
                <input type="text" id="reg-idcard-house-no" placeholder="เช่น 123/4"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
              <div>
                <label for="reg-idcard-village" class="block text-sm font-medium text-gray-700 mb-1">หมู่บ้าน/อาคาร</label>
                <input type="text" id="reg-idcard-village" placeholder="หมู่บ้าน/อาคาร"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label for="reg-idcard-soi" class="block text-sm font-medium text-gray-700 mb-1">ซอย</label>
                <input type="text" id="reg-idcard-soi" placeholder="ซอย"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
              <div>
                <label for="reg-idcard-road" class="block text-sm font-medium text-gray-700 mb-1">ถนน</label>
                <input type="text" id="reg-idcard-road" placeholder="ถนน"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label for="reg-idcard-subdistrict" class="block text-sm font-medium text-gray-700 mb-1">แขวง/ตำบล</label>
                <input type="text" id="reg-idcard-subdistrict" placeholder="แขวง/ตำบล"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
              <div>
                <label for="reg-idcard-district" class="block text-sm font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
                <input type="text" id="reg-idcard-district" placeholder="เขต/อำเภอ"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label for="reg-idcard-province" class="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                <select id="reg-idcard-province"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
                  ${provinceOpts}
                </select>
              </div>
              <div>
                <label for="reg-idcard-postcode" class="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                <input type="text" id="reg-idcard-postcode" placeholder="รหัสไปรษณีย์" maxlength="5"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm reg-idcard-field">
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr class="border-gray-200">

      <!-- Section 4: ข้อมูลการศึกษา -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">4</span>
          <h2 class="text-lg font-semibold text-gray-800">ข้อมูลการศึกษา</h2>
        </div>
        <div class="space-y-4 pl-9">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-student-id" class="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา <span class="text-red-500">*</span></label>
              <input type="text" id="reg-student-id" placeholder="เช่น 6401234567" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-university" class="block text-sm font-medium text-gray-700 mb-1">มหาวิทยาลัย <span class="text-red-500">*</span></label>
              <input type="text" id="reg-university" placeholder="ชื่อมหาวิทยาลัย" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-faculty" class="block text-sm font-medium text-gray-700 mb-1">คณะ <span class="text-red-500">*</span></label>
              <input type="text" id="reg-faculty" placeholder="ชื่อคณะ" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-major" class="block text-sm font-medium text-gray-700 mb-1">สาขา <span class="text-red-500">*</span></label>
              <input type="text" id="reg-major" placeholder="ชื่อสาขาวิชา" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-year" class="block text-sm font-medium text-gray-700 mb-1">ชั้นปี <span class="text-red-500">*</span></label>
              <select id="reg-year" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                <option value="">-- เลือกชั้นปี --</option>
                <option value="1">ปี 1</option>
                <option value="2">ปี 2</option>
                <option value="3">ปี 3</option>
                <option value="4">ปี 4</option>
                <option value="5">ปี 5</option>
              </select>
            </div>
            <div>
              <label for="reg-gpa" class="block text-sm font-medium text-gray-700 mb-1">GPA</label>
              <input type="number" id="reg-gpa" placeholder="เช่น 3.25" step="0.01" min="0" max="4"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-advisor" class="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา</label>
              <input type="text" id="reg-advisor" placeholder="ชื่ออาจารย์ที่ปรึกษา"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-advisor-phone" class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร/อีเมลอาจารย์</label>
              <input type="text" id="reg-advisor-phone" placeholder="เบอร์โทรหรืออีเมล"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>
          <div>
            <label for="reg-uni-address" class="block text-sm font-medium text-gray-700 mb-1">ที่อยู่มหาวิทยาลัย</label>
            <textarea id="reg-uni-address" rows="2" placeholder="ที่อยู่ของมหาวิทยาลัย"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
          </div>
        </div>
      </div>

      <hr class="border-gray-200">

      <!-- Section 5: ข้อมูลการฝึกงาน -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">5</span>
          <h2 class="text-lg font-semibold text-gray-800">ข้อมูลการฝึกงาน</h2>
        </div>
        <div class="space-y-4 pl-9">
          <div>
            <label for="reg-internship-type" class="block text-sm font-medium text-gray-700 mb-1">ประเภทการฝึกงาน</label>
            <select id="reg-internship-type"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              <option value="">-- เลือกประเภท --</option>
              <option value="สหกิจศึกษา">สหกิจศึกษา</option>
              <option value="ฝึกงานทั่วไป">ฝึกงานทั่วไป</option>
            </select>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-start-date" class="block text-sm font-medium text-gray-700 mb-1">วันเริ่มฝึกงาน</label>
              <input type="date" id="reg-start-date"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-end-date" class="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุดฝึกงาน</label>
              <input type="date" id="reg-end-date"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>

          <h3 class="text-sm font-semibold text-gray-600 pt-2">สาขาและแผนกที่ต้องการฝึกงาน (เลือก 3 ลำดับ)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-branch1" class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ต้องการ ลำดับ 1</label>
              <select id="reg-branch1" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${storeOpts}
              </select>
            </div>
            <div>
              <label for="reg-dept1" class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ต้องการ ลำดับ 1</label>
              <select id="reg-dept1" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${deptOpts}
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-branch2" class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ต้องการ ลำดับ 2</label>
              <select id="reg-branch2" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${storeOpts}
              </select>
            </div>
            <div>
              <label for="reg-dept2" class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ต้องการ ลำดับ 2</label>
              <select id="reg-dept2" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${deptOpts}
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-branch3" class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ต้องการ ลำดับ 3</label>
              <select id="reg-branch3" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${storeOpts}
              </select>
            </div>
            <div>
              <label for="reg-dept3" class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ต้องการ ลำดับ 3</label>
              <select id="reg-dept3" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                ${deptOpts}
              </select>
            </div>
          </div>
        </div>
      </div>

      <hr class="border-gray-200">

      <!-- Section 6: ข้อมูลเพิ่มเติม -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">6</span>
          <h2 class="text-lg font-semibold text-gray-800">ข้อมูลเพิ่มเติมและเอกสาร</h2>
        </div>
        <div class="space-y-4 pl-9">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ทักษะ/ความสามารถ</label>
            ${buildSkillsCheckboxesHtml()}
          </div>
          <div>
            <label for="reg-interests" class="block text-sm font-medium text-gray-700 mb-1">ความสนใจ</label>
            <textarea id="reg-interests" rows="2" placeholder="สิ่งที่สนใจหรืออยากเรียนรู้"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <label for="reg-cv-file" class="cursor-pointer block">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p class="text-sm font-medium text-gray-700">อัปโหลด CV / Resume</p>
                <p class="text-xs text-gray-400 mt-1">PDF, DOC (สูงสุด 10MB)</p>
                <input type="file" id="reg-cv-file" accept=".pdf,.doc,.docx" class="hidden">
              </label>
              <div id="reg-cv-status" class="mt-2 text-xs text-gray-400"></div>
            </div>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <label for="reg-photo-file" class="cursor-pointer block">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="text-sm font-medium text-gray-700">อัปโหลดรูปถ่าย</p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG (สูงสุด 5MB)</p>
                <input type="file" id="reg-photo-file" accept=".jpg,.jpeg,.png" class="hidden">
              </label>
              <div id="reg-photo-status" class="mt-2 text-xs text-gray-400"></div>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" id="register-btn"
        class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
        สมัครสมาชิก
      </button>
    `;

    // Same address checkbox handler - copy all subfields and disable idCard fields
    document.getElementById('reg-same-address').addEventListener('change', function() {
      var section = document.getElementById('reg-idcard-address-section');
      var idcardFields = document.querySelectorAll('.reg-idcard-field');
      if (this.checked) {
        // Copy current values to idCard fields
        document.getElementById('reg-idcard-house-no').value = document.getElementById('reg-current-house-no').value;
        document.getElementById('reg-idcard-village').value = document.getElementById('reg-current-village').value;
        document.getElementById('reg-idcard-soi').value = document.getElementById('reg-current-soi').value;
        document.getElementById('reg-idcard-road').value = document.getElementById('reg-current-road').value;
        document.getElementById('reg-idcard-subdistrict').value = document.getElementById('reg-current-subdistrict').value;
        document.getElementById('reg-idcard-district').value = document.getElementById('reg-current-district').value;
        document.getElementById('reg-idcard-province').value = document.getElementById('reg-current-province').value;
        document.getElementById('reg-idcard-postcode').value = document.getElementById('reg-current-postcode').value;
        for (var i = 0; i < idcardFields.length; i++) {
          idcardFields[i].disabled = true;
          idcardFields[i].classList.add('bg-gray-50', 'text-gray-500');
        }
      } else {
        for (var j = 0; j < idcardFields.length; j++) {
          idcardFields[j].disabled = false;
          idcardFields[j].classList.remove('bg-gray-50', 'text-gray-500');
        }
      }
    });

    // Province change -> auto-fill postcode (current)
    document.getElementById('reg-current-province').addEventListener('change', function() {
      var postcode = THAI_PROVINCE_POSTCODE[this.value] || '';
      document.getElementById('reg-current-postcode').value = postcode;
      // If same address is checked, also update idCard
      if (document.getElementById('reg-same-address').checked) {
        document.getElementById('reg-idcard-province').value = this.value;
        document.getElementById('reg-idcard-postcode').value = postcode;
      }
    });

    // Province change -> auto-fill postcode (idCard)
    document.getElementById('reg-idcard-province').addEventListener('change', function() {
      var postcode = THAI_PROVINCE_POSTCODE[this.value] || '';
      document.getElementById('reg-idcard-postcode').value = postcode;
    });

    // Skills "อื่นๆ" checkbox toggle
    document.getElementById('reg-skill-other-cb').addEventListener('change', function() {
      var otherInput = document.getElementById('reg-skill-other-text');
      otherInput.disabled = !this.checked;
      if (!this.checked) otherInput.value = '';
    });

    // Form submit
    form.addEventListener('submit', handleRegisterSubmit);

    // File select handlers
    document.getElementById('reg-cv-file').addEventListener('change', function() {
      var file = this.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { showToast('ไฟล์ CV มีขนาดใหญ่เกินไป (สูงสุด 10MB)', 'error'); this.value = ''; return; }
        document.getElementById('reg-cv-status').innerHTML = '<span class="text-blue-600">' + file.name + '</span>';
      }
    });
    document.getElementById('reg-photo-file').addEventListener('change', function() {
      var file = this.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { showToast('รูปถ่ายมีขนาดใหญ่เกินไป (สูงสุด 5MB)', 'error'); this.value = ''; return; }
        document.getElementById('reg-photo-status').innerHTML = '<span class="text-blue-600">' + file.name + '</span>';
      }
    });
  });
}

function composeAddressString(houseNo, village, soi, road, subdistrict, district, province, postcode) {
  var parts = [];
  if (houseNo) parts.push(houseNo);
  if (village) parts.push(village);
  if (soi) parts.push('ซ.' + soi);
  if (road) parts.push('ถ.' + road);
  if (subdistrict) parts.push('แขวง/ตำบล ' + subdistrict);
  if (district) parts.push('เขต/อำเภอ ' + district);
  if (province) parts.push('จังหวัด ' + province);
  if (postcode) parts.push(postcode);
  return parts.join(' ');
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  var errorDiv = document.getElementById('register-error');
  var successDiv = document.getElementById('register-success');
  var btn = document.getElementById('register-btn');

  var password = document.getElementById('reg-password').value;
  var confirmPassword = document.getElementById('reg-confirm-password').value;

  if (password !== confirmPassword) {
    errorDiv.textContent = 'รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่';
    errorDiv.classList.remove('hidden');
    successDiv.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Validate idCardNumber: exactly 13 digits
  var idCardVal = document.getElementById('reg-id-card').value.trim();
  if (!idCardVal || !/^\d{13}$/.test(idCardVal)) {
    showToast('กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง', 'error');
    document.getElementById('reg-id-card').focus();
    return;
  }

  var firstName = document.getElementById('reg-first-name').value.trim();
  var lastName = document.getElementById('reg-last-name').value.trim();
  var sameAddress = document.getElementById('reg-same-address').checked;

  // Current address subfields
  var cHouseNo = document.getElementById('reg-current-house-no').value.trim();
  var cVillage = document.getElementById('reg-current-village').value.trim();
  var cSoi = document.getElementById('reg-current-soi').value.trim();
  var cRoad = document.getElementById('reg-current-road').value.trim();
  var cSubdistrict = document.getElementById('reg-current-subdistrict').value.trim();
  var cDistrict = document.getElementById('reg-current-district').value.trim();
  var cProvince = document.getElementById('reg-current-province').value;
  var cPostcode = document.getElementById('reg-current-postcode').value.trim();

  // IdCard address subfields
  var iHouseNo, iVillage, iSoi, iRoad, iSubdistrict, iDistrict, iProvince, iPostcode;
  if (sameAddress) {
    iHouseNo = cHouseNo; iVillage = cVillage; iSoi = cSoi; iRoad = cRoad;
    iSubdistrict = cSubdistrict; iDistrict = cDistrict; iProvince = cProvince; iPostcode = cPostcode;
  } else {
    iHouseNo = document.getElementById('reg-idcard-house-no').value.trim();
    iVillage = document.getElementById('reg-idcard-village').value.trim();
    iSoi = document.getElementById('reg-idcard-soi').value.trim();
    iRoad = document.getElementById('reg-idcard-road').value.trim();
    iSubdistrict = document.getElementById('reg-idcard-subdistrict').value.trim();
    iDistrict = document.getElementById('reg-idcard-district').value.trim();
    iProvince = document.getElementById('reg-idcard-province').value;
    iPostcode = document.getElementById('reg-idcard-postcode').value.trim();
  }

  var currentAddressStr = composeAddressString(cHouseNo, cVillage, cSoi, cRoad, cSubdistrict, cDistrict, cProvince, cPostcode);
  var idCardAddressStr = composeAddressString(iHouseNo, iVillage, iSoi, iRoad, iSubdistrict, iDistrict, iProvince, iPostcode);

  var data = {
    email: document.getElementById('reg-email').value.trim(),
    password: password,
    prefix: document.getElementById('reg-prefix').value,
    firstName: firstName,
    lastName: lastName,
    name: firstName + ' ' + lastName,
    nickname: document.getElementById('reg-nickname').value.trim(),
    birthDate: document.getElementById('reg-birth-date').value,
    phone: document.getElementById('reg-phone').value.trim(),
    idCardNumber: idCardVal,
    militaryStatus: document.getElementById('reg-military').value,
    medicalCondition: document.getElementById('reg-medical').value.trim(),
    // Split address fields (current)
    currentHouseNo: cHouseNo,
    currentVillage: cVillage,
    currentSoi: cSoi,
    currentRoad: cRoad,
    currentSubdistrict: cSubdistrict,
    currentDistrict: cDistrict,
    currentProvince: cProvince,
    currentPostcode: cPostcode,
    // Split address fields (idCard)
    idCardHouseNo: iHouseNo,
    idCardVillage: iVillage,
    idCardSoi: iSoi,
    idCardRoad: iRoad,
    idCardSubdistrict: iSubdistrict,
    idCardDistrict: iDistrict,
    idCardProvince: iProvince,
    idCardPostcode: iPostcode,
    // Legacy composed fields
    currentAddress: currentAddressStr,
    idCardAddress: idCardAddressStr,
    address: currentAddressStr,
    studentId: document.getElementById('reg-student-id').value.trim(),
    university: document.getElementById('reg-university').value.trim(),
    faculty: document.getElementById('reg-faculty').value.trim(),
    major: document.getElementById('reg-major').value.trim(),
    year: document.getElementById('reg-year').value,
    gpa: document.getElementById('reg-gpa').value || '',
    advisorName: document.getElementById('reg-advisor').value.trim(),
    advisorContact: document.getElementById('reg-advisor-phone').value.trim(),
    universityAddress: document.getElementById('reg-uni-address').value.trim(),
    internshipType: document.getElementById('reg-internship-type').value,
    startDate: document.getElementById('reg-start-date').value,
    endDate: document.getElementById('reg-end-date').value,
    preferredBranch1: document.getElementById('reg-branch1').value,
    preferredBranch2: document.getElementById('reg-branch2').value,
    preferredBranch3: document.getElementById('reg-branch3').value,
    preferredDept1: document.getElementById('reg-dept1').value,
    preferredDept2: document.getElementById('reg-dept2').value,
    preferredDept3: document.getElementById('reg-dept3').value,
    skills: collectSkillsValue(),
    interests: document.getElementById('reg-interests').value.trim()
  };

  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'กำลังสมัครสมาชิก...';

  // Upload CV
  var cvFileEl = document.getElementById('reg-cv-file');
  if (cvFileEl && cvFileEl.files[0]) {
    try {
      var cvBase64 = await fileToBase64(cvFileEl.files[0]);
      var cvUpload = await callApiPost('uploadFile', { fileName: cvFileEl.files[0].name, fileData: cvBase64, mimeType: cvFileEl.files[0].type, subfolder: 'profiles' });
      if (cvUpload.success !== false && cvUpload.data) {
        data.cvFileUrl = cvUpload.data.fileUrl;
        data.cvFileName = cvUpload.data.fileName;
      }
    } catch (err) { console.error('CV upload error:', err); }
  }

  // Upload photo
  var photoFileEl = document.getElementById('reg-photo-file');
  if (photoFileEl && photoFileEl.files[0]) {
    try {
      var photoBase64 = await fileToBase64(photoFileEl.files[0]);
      var photoUpload = await callApiPost('uploadFile', { fileName: photoFileEl.files[0].name, fileData: photoBase64, mimeType: photoFileEl.files[0].type, subfolder: 'profiles' });
      if (photoUpload.success !== false && photoUpload.data) {
        data.photoFileUrl = photoUpload.data.fileUrl;
        data.photoFileName = photoUpload.data.fileName;
      }
    } catch (err) { console.error('Photo upload error:', err); }
  }

  try {
    var result = await callApiPost('register', data);
    if (result.success) {
      successDiv.textContent = 'สมัครสมาชิกสำเร็จ! กำลังนำไปหน้าเข้าสู่ระบบ...';
      successDiv.classList.remove('hidden');
      showToast('สมัครสมาชิกสำเร็จ', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(function() { navigateTo('login'); }, 2000);
    } else {
      errorDiv.textContent = result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      errorDiv.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Register error:', error);
    errorDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
    errorDiv.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    btn.disabled = false;
    btn.textContent = 'สมัครสมาชิก';
  }
}
