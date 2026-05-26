function renderMentorEvaluations() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">ประเมินผลนักศึกษา</h1>
          <button onclick="openEvalForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ สร้างการประเมิน</button>
        </div>
        <div id="mentor-eval-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="eval-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold">สร้างการประเมิน</h3>
          <button onclick="document.getElementById('eval-form-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="eval-form-content"></div>
      </div>
    </div>
  `;
  loadMentorEvaluations();
}

window._mentorStudentsList = [];
async function loadMentorEvaluations() {
  const user = getCurrentUser();
  const container = document.getElementById('mentor-eval-list');
  try {
    const [evalRes, studRes] = await Promise.all([
      callApi('getEvaluationsByUser', { userId: user.id, asEvaluator: 'true' }),
      callApi('getStudentsByMentor', { mentorId: user.id })
    ]);
    const evals = evalRes.data || evalRes || [];
    window._mentorStudentsList = studRes.data || studRes || [];

    if (!Array.isArray(evals) || evals.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มีการประเมิน</div>';
      return;
    }

    const studentMap = {};
    if (Array.isArray(window._mentorStudentsList)) {
      window._mentorStudentsList.forEach(s => { studentMap[s.id] = ((s.firstName || '') + ' ' + (s.lastName || '')).trim() || s.name || s.email || s.id; });
    }

    container.innerHTML = evals.map(ev => {
      const studentName = studentMap[ev.evaluateeId] || ev.evaluateeId || '-';
      return `
        <div class="bg-white rounded-xl border p-5">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-gray-800">${ev.type || 'การประเมิน'}</h3>
              <p class="text-sm text-gray-500">นักศึกษา: ${studentName} | ${ev.period || ''}</p>
              <p class="text-xs text-gray-400">${formatDate(ev.createdAt)}</p>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-blue-600">${ev.totalScore || 0}<span class="text-sm text-gray-400">/${ev.maxScore || 50}</span></div>
            </div>
          </div>
          ${ev.comment ? `<p class="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">${ev.comment}</p>` : ''}
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function openEvalForm() {
  const students = window._mentorStudentsList;
  const studentOptions = Array.isArray(students) ? students.map(s =>
    `<option value="${s.id}">${s.firstName || ''} ${s.lastName || ''} (${s.studentId || ''})</option>`
  ).join('') : '';

  document.getElementById('eval-form-content').innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">นักศึกษา</label>
        <select id="eval-student" class="w-full border rounded-lg p-2">${studentOptions}</select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
        <select id="eval-type" class="w-full border rounded-lg p-2">
          <option>ประเมินรายเดือน</option>
          <option>ประเมินกลางภาค</option>
          <option>ประเมินปลายภาค</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลา</label>
        <input type="text" id="eval-period" class="w-full border rounded-lg p-2" placeholder="เช่น สัปดาห์ที่ 1-4" />
      </div>
      <div class="space-y-3">
        <label class="block text-sm font-medium text-gray-700">คะแนนรายหัวข้อ (1-10)</label>
        ${['responsibility:ความรับผิดชอบ','knowledge:ความรู้และทักษะ','teamwork:การทำงานเป็นทีม','initiative:ความคิดริเริ่ม','communication:การสื่อสาร'].map(item => {
          const [key, label] = item.split(':');
          return `
            <div class="flex items-center gap-3">
              <span class="w-36 text-sm text-gray-600">${label}</span>
              <input type="range" id="eval-score-${key}" min="1" max="10" value="5" class="flex-1" oninput="document.getElementById('eval-val-${key}').textContent=this.value;calcEvalTotal()" />
              <span id="eval-val-${key}" class="w-8 text-center font-medium">5</span>
            </div>`;
        }).join('')}
        <div class="text-right font-bold text-blue-600">รวม: <span id="eval-total">25</span>/50</div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ความคิดเห็น</label>
        <textarea id="eval-comment" class="w-full border rounded-lg p-3 text-sm" rows="3" placeholder="ความคิดเห็นเพิ่มเติม..."></textarea>
      </div>
      <button onclick="saveEvaluation()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">บันทึกการประเมิน</button>
    </div>
  `;
  document.getElementById('eval-form-modal').classList.remove('hidden');
}

function calcEvalTotal() {
  const keys = ['responsibility','knowledge','teamwork','initiative','communication'];
  let total = 0;
  keys.forEach(k => { total += parseInt(document.getElementById('eval-score-'+k).value) || 0; });
  document.getElementById('eval-total').textContent = total;
}

async function saveEvaluation() {
  const user = getCurrentUser();
  const keys = ['responsibility','knowledge','teamwork','initiative','communication'];
  const scores = {};
  let total = 0;
  keys.forEach(k => { const v = parseInt(document.getElementById('eval-score-'+k).value) || 0; scores[k] = v; total += v; });

  showLoading();
  try {
    await callApiPost('createEvaluation', {
      type: document.getElementById('eval-type').value,
      evaluatorId: user.id,
      evaluateeId: document.getElementById('eval-student').value,
      period: document.getElementById('eval-period').value,
      scores: JSON.stringify(scores),
      totalScore: String(total),
      maxScore: '50',
      comment: document.getElementById('eval-comment').value
    });
    showToast('บันทึกการประเมินสำเร็จ', 'success');
    document.getElementById('eval-form-modal').classList.add('hidden');
    await loadMentorEvaluations();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}
