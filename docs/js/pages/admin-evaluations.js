function renderAdminEvaluations() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">ประเมินผล</h1>
          <button onclick="openAdminEvalForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ สร้างการประเมิน</button>
        </div>
        <div id="admin-eval-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="admin-eval-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold">สร้างการประเมิน</h3>
          <button onclick="document.getElementById('admin-eval-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="admin-eval-form"></div>
      </div>
    </div>
  `;
  loadAdminEvaluations();
}

window._adminAllStudents = [];
async function loadAdminEvaluations() {
  const container = document.getElementById('admin-eval-list');
  try {
    const [evalRes, studRes, mentorRes] = await Promise.all([
      callApi('getEvaluations', {}),
      callApi('getStudents'),
      callApi('getMentors')
    ]);
    const evals = evalRes.data || evalRes || [];
    const students = studRes.data || studRes || [];
    const mentors = mentorRes.data || mentorRes || [];
    window._adminAllStudents = [...(Array.isArray(students) ? students : []), ...(Array.isArray(mentors) ? mentors : [])];

    if (!Array.isArray(evals) || evals.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มีการประเมิน</div>';
      return;
    }

    container.innerHTML = `
      <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3 font-medium text-gray-600">ประเภท</th>
              <th class="text-left p-3 font-medium text-gray-600">ผู้ถูกประเมิน</th>
              <th class="text-left p-3 font-medium text-gray-600">ช่วงเวลา</th>
              <th class="text-left p-3 font-medium text-gray-600">คะแนน</th>
              <th class="text-left p-3 font-medium text-gray-600">วันที่</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${evals.map(ev => {
              const studentMatch = window._adminAllStudents.find(s => s.id === ev.evaluateeId);
              const studentName = studentMatch ? ((studentMatch.firstName || '') + ' ' + (studentMatch.lastName || '')).trim() || studentMatch.name || ev.evaluateeId : ev.evaluateeId;
              const evaluatorMatch = window._adminAllStudents.find(s => s.id === ev.evaluatorId);
              const evaluatorName = evaluatorMatch ? ((evaluatorMatch.firstName || '') + ' ' + (evaluatorMatch.lastName || '')).trim() : '';
              return `
              <tr class="hover:bg-gray-50">
                <td class="p-3 font-medium text-gray-800">${escAttr(ev.type || '-')}</td>
                <td class="p-3 text-gray-600">${escAttr(studentName || '-')}</td>
                <td class="p-3 text-gray-600">${escAttr(ev.period || '-')}</td>
                <td class="p-3"><span class="font-bold text-blue-600">${escAttr(ev.totalScore || 0)}</span>/${escAttr(ev.maxScore || 0)}</td>
                <td class="p-3 text-gray-500">${formatDate(ev.createdAt)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function openAdminEvalForm() {
  const students = window._adminAllStudents;
  const opts = Array.isArray(students) ? students.map(s =>
    `<option value="${escAttr(s.id)}">${escAttr(s.firstName || '')} ${escAttr(s.lastName || '')} (${escAttr(s.studentId || s.email || '')})</option>`
  ).join('') : '';

  document.getElementById('admin-eval-form').innerHTML = `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">นักศึกษา</label>
        <select id="ae-student" class="w-full border rounded-lg p-2">${opts}</select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
        <select id="ae-type" class="w-full border rounded-lg p-2">
          <option>ประเมินรายเดือน</option><option>ประเมินกลางภาค</option><option>ประเมินปลายภาค</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลา</label>
        <input type="text" id="ae-period" class="w-full border rounded-lg p-2" placeholder="เช่น สัปดาห์ที่ 1-4" /></div>
      <div class="space-y-3">
        <label class="block text-sm font-medium text-gray-700">คะแนน (1-10)</label>
        ${['attitude:ทัศนคติ','skill:ทักษะ','knowledge:ความรู้','teamwork:ทีมงาน','communication:การสื่อสาร'].map(item => {
          const [k,l] = item.split(':');
          return `<div class="flex items-center gap-3"><span class="w-28 text-sm">${l}</span>
            <input type="range" id="ae-${k}" min="1" max="10" value="5" class="flex-1" oninput="document.getElementById('ae-v-${k}').textContent=this.value;calcAdminEval()" />
            <span id="ae-v-${k}" class="w-8 text-center font-medium">5</span></div>`;
        }).join('')}
        <div class="text-right font-bold text-blue-600">รวม: <span id="ae-total">25</span>/50</div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ความคิดเห็น</label>
        <textarea id="ae-comment" class="w-full border rounded-lg p-3 text-sm" rows="3"></textarea></div>
      <button onclick="saveAdminEval()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">บันทึก</button>
    </div>`;
  document.getElementById('admin-eval-modal').classList.remove('hidden');
}

function calcAdminEval() {
  let t = 0;
  ['attitude','skill','knowledge','teamwork','communication'].forEach(k => { t += parseInt(document.getElementById('ae-'+k).value)||0; });
  document.getElementById('ae-total').textContent = t;
}

async function saveAdminEval() {
  const user = getCurrentUser();
  const scores = {};
  let total = 0;
  ['attitude','skill','knowledge','teamwork','communication'].forEach(k => {
    const v = parseInt(document.getElementById('ae-'+k).value)||0;
    scores[k] = v; total += v;
  });
  showLoading();
  try {
    await callApiPost('createEvaluation', {
      type: document.getElementById('ae-type').value,
      evaluatorId: user.id,
      evaluateeId: document.getElementById('ae-student').value,
      period: document.getElementById('ae-period').value,
      scores: JSON.stringify(scores),
      totalScore: String(total), maxScore: '50',
      comment: document.getElementById('ae-comment').value
    });
    showToast('บันทึกสำเร็จ', 'success');
    document.getElementById('admin-eval-modal').classList.add('hidden');
    await loadAdminEvaluations();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}
