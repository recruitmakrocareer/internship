// ==================== หน้าประเมินผลการฝึก (สาธารณะ ผ่าน QR Code) ====================
// ผู้สอนสแกน QR → เปิดหน้านี้ → ประเมิน ผ่าน/ไม่ผ่าน โดยไม่ต้องเข้าสู่ระบบ

async function renderEvaluate() {
  const app = document.getElementById('app');
  const query = window.location.hash.split('?')[1] || '';
  const token = new URLSearchParams(query).get('token');

  app.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold text-gray-800">ระบบจัดการฝึกงาน Makro</h1>
          <p class="text-sm text-gray-500">แบบประเมินผลการฝึกอบรม</p>
        </div>
        <div id="eval-card" class="bg-white rounded-xl shadow-lg p-6">
          <div class="text-center py-8 text-gray-400">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    </div>
  `;

  if (!token) {
    document.getElementById('eval-card').innerHTML = `
      <div class="text-center py-8">
        <p class="text-red-500 font-medium">ไม่พบรหัสประเมิน</p>
        <p class="text-sm text-gray-400 mt-1">กรุณาสแกน QR Code จากระบบอีกครั้ง</p>
      </div>`;
    return;
  }

  try {
    const res = await callApi('getEvalByToken', { token: token });
    if (res.success === false || !res.data) {
      document.getElementById('eval-card').innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500 font-medium">${res.message || 'ลิงก์ประเมินไม่ถูกต้อง'}</p>
        </div>`;
      return;
    }

    const d = res.data;
    const alreadyPassed = String(d.evalResult).toUpperCase() === 'PASS';

    document.getElementById('eval-card').innerHTML = `
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4 space-y-1">
          <p class="text-sm"><span class="text-gray-500">นักศึกษา:</span> <span class="font-medium text-gray-800">${d.studentName}</span>${d.studentCode ? ` <span class="text-gray-400">(${d.studentCode})</span>` : ''}</p>
          <p class="text-sm"><span class="text-gray-500">หัวข้อการฝึก:</span> <span class="font-medium text-gray-800">${d.stepTitle}</span></p>
          ${d.roadmapTitle ? `<p class="text-sm"><span class="text-gray-500">แผนการฝึก:</span> ${d.roadmapTitle}</p>` : ''}
          ${d.attemptCount > 0 ? `<p class="text-xs text-orange-500">เคยไม่ผ่านการประเมิน ${d.attemptCount} ครั้ง</p>` : ''}
        </div>

        ${alreadyPassed ? `
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p class="text-green-700 font-medium">✓ หัวข้อนี้ผ่านการประเมินแล้ว</p>
            <p class="text-xs text-gray-400 mt-1">โดย ${d.evalBy} เมื่อ ${formatDate(d.evalAt)}</p>
          </div>
        ` : `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ผลการประเมิน <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 gap-3">
              <button onclick="selectEvalResult('PASS')" id="eval-btn-PASS"
                class="py-3 rounded-lg text-sm font-semibold border-2 border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                ✓ ผ่าน
              </button>
              <button onclick="selectEvalResult('FAIL')" id="eval-btn-FAIL"
                class="py-3 rounded-lg text-sm font-semibold border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                ✗ ไม่ผ่าน (ต้องฝึกซ้ำ)
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ความคิดเห็น / ข้อเสนอแนะ</label>
            <textarea id="eval-comment" rows="3" placeholder="จุดเด่น สิ่งที่ควรปรับปรุง..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ประเมิน <span class="text-red-500">*</span></label>
            <input type="text" id="eval-name" value="${d.trainerName || ''}" placeholder="ชื่อ-นามสกุล ผู้สอน/ผู้ประเมิน"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>

          <button onclick="submitExternalEval('${token}')"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg text-sm transition-colors">
            ส่งผลการประเมิน
          </button>
        `}
      </div>
    `;
  } catch (e) {
    console.error('Error loading evaluation:', e);
    document.getElementById('eval-card').innerHTML = `
      <div class="text-center py-8 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่</div>`;
  }
}

function selectEvalResult(result) {
  window._evalResult = result;
  const pass = document.getElementById('eval-btn-PASS');
  const fail = document.getElementById('eval-btn-FAIL');
  pass.className = 'py-3 rounded-lg text-sm font-semibold border-2 transition-colors ' +
    (result === 'PASS' ? 'border-green-600 bg-green-600 text-white' : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100');
  fail.className = 'py-3 rounded-lg text-sm font-semibold border-2 transition-colors ' +
    (result === 'FAIL' ? 'border-red-600 bg-red-600 text-white' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100');
}

async function submitExternalEval(token) {
  const result = window._evalResult;
  const comment = document.getElementById('eval-comment').value.trim();
  const name = document.getElementById('eval-name').value.trim();

  if (!result) { showToast('กรุณาเลือกผลการประเมิน', 'error'); return; }
  if (!name) { showToast('กรุณากรอกชื่อผู้ประเมิน', 'error'); return; }

  showLoading();
  try {
    const res = await callApiPost('submitEvalByToken', {
      token: token,
      result: result,
      comment: comment,
      evaluatorName: name
    });
    hideLoading();

    if (res.success === false) {
      showToast(res.message || 'เกิดข้อผิดพลาด', 'error');
      return;
    }

    window._evalResult = null;
    document.getElementById('eval-card').innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 ${result === 'PASS' ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">${result === 'PASS' ? '✓' : '↻'}</span>
        </div>
        <p class="font-semibold text-gray-800">${result === 'PASS' ? 'บันทึกผลประเมิน: ผ่าน' : 'บันทึกผลประเมิน: ไม่ผ่าน'}</p>
        <p class="text-sm text-gray-500 mt-1">${result === 'PASS' ? 'ขอบคุณสำหรับการประเมิน' : 'นักศึกษาจะได้รับแจ้งให้ฝึกเพิ่มเติมและประเมินใหม่'}</p>
      </div>`;
  } catch (e) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการส่งผลประเมิน', 'error');
  }
}
