function renderStudentEvaluations() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">ผลการประเมิน</h1>
        <div id="eval-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
  `;
  loadStudentEvals();
}

async function loadStudentEvals() {
  const user = getCurrentUser();
  const container = document.getElementById('eval-list');
  try {
    const res = await callApi('getEvaluationsByUser', { userId: user.id });
    const evals = res.data || res || [];

    if (!Array.isArray(evals) || evals.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มีผลการประเมิน</div>';
      return;
    }

    const scoreLabels = {
      attitude: 'ทัศนคติ', responsibility: 'ความรับผิดชอบ', skill: 'ทักษะ',
      knowledge: 'ความรู้', teamwork: 'การทำงานเป็นทีม', communication: 'การสื่อสาร',
      initiative: 'ความคิดริเริ่ม'
    };

    container.innerHTML = evals.map(ev => {
      let scores = {};
      try { scores = typeof ev.scores === 'string' ? JSON.parse(ev.scores) : (ev.scores || {}); } catch(e) {}
      const pct = ev.maxScore > 0 ? Math.round((ev.totalScore / ev.maxScore) * 100) : 0;

      return `
        <div class="bg-white rounded-xl border p-5">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-bold text-gray-800">${ev.type || 'การประเมิน'}</h3>
              <p class="text-sm text-gray-500">${ev.period || ''} | ${formatDate(ev.createdAt)}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">${ev.totalScore || 0}<span class="text-sm text-gray-400">/${ev.maxScore || 0}</span></div>
              <div class="text-xs text-gray-500">${pct}%</div>
            </div>
          </div>
          <div class="bg-gray-200 rounded-full h-2 mb-4">
            <div class="bg-blue-500 h-2 rounded-full" style="width:${pct}%"></div>
          </div>
          ${Object.keys(scores).length > 0 ? `
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              ${Object.entries(scores).map(([k, v]) => `
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <div class="text-lg font-semibold text-gray-700">${v}</div>
                  <div class="text-xs text-gray-500">${scoreLabels[k] || k}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${ev.comment ? `<div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">${ev.comment}</div>` : ''}
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}
