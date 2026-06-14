const KM_TOPICS = [
  { number: 1, name: 'การจัดการทรัพยากรบุคคล', nameEn: 'Human Resource Management', icon: '👥', color: 'blue' },
  { number: 2, name: 'การบริการลูกค้า', nameEn: 'Customer Service', icon: '🤝', color: 'green' },
  { number: 3, name: 'การจัดการสินค้า', nameEn: 'Merchandising', icon: '📦', color: 'purple' },
  { number: 4, name: 'การจัดการผลกำไรขาดทุน', nameEn: 'Profit & Loss', icon: '📊', color: 'orange' },
  { number: 5, name: 'ความปลอดภัยอาหาร', nameEn: 'Food Safety', icon: '🍴', color: 'red' },
  { number: 6, name: 'ความปลอดภัยการปฏิบัติงาน', nameEn: 'Work Safety', icon: '⛑️', color: 'yellow' },
];

function renderKnowledgeManagement() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Knowledge Management</h1>
            <p class="text-gray-500">บันทึกการเรียนรู้ 6 หัวข้อ (25% ของการประเมิน)</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-blue-600" id="km-progress">0/6</div>
            <div class="text-sm text-gray-500">หัวข้อที่บันทึกแล้ว</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-200 rounded-full h-3 mb-8">
          <div id="km-progress-bar" class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all" style="width:0%"></div>
        </div>

        <!-- Presentation Schedule -->
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-indigo-800">📅 กำหนดการนำเสนอ Report-Out</h3>
            ${user.role === 'ADMIN' ? '<button onclick="openScheduleModal()" class="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700">ตั้งค่ากำหนดการ</button>' : ''}
          </div>
          <div id="km-schedule" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="text-center text-sm text-gray-400 col-span-full">กำลังโหลด...</div>
          </div>
        </div>

        <!-- Instruction Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 class="font-semibold text-blue-800 mb-2">📋 คำแนะนำ</h3>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• บันทึกเนื้อหาการเรียนรู้ให้ครบทั้ง 6 หัวข้อ</li>
            <li>• เลือก 1 หัวข้อ ที่สนใจเพื่อใช้เป็นหัวข้อนำเสนอผลการฝึกงาน</li>
            <li>• การนำเสนอจะมีการประเมิน 5 ด้าน คะแนนเต็ม 100</li>
          </ul>
        </div>

        <!-- Topic Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="topics-grid">
          <div class="col-span-full text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>

        <!-- Presentation Score -->
        <div id="presentation-score" class="hidden mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <h3 class="text-lg font-bold text-purple-800 mb-3">🎯 คะแนนการนำเสนอ</h3>
          <div id="score-content"></div>
        </div>
      </div>
    </div>

    <!-- KM Entry Modal -->
    <div id="km-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 class="text-lg font-bold" id="km-modal-title"></h3>
          <button onclick="closeKmModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="km-modal-content"></div>
      </div>
    </div>

    <!-- Schedule Modal (Admin) -->
    <div id="km-schedule-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold">ตั้งค่ากำหนดการนำเสนอ</h3>
          <button onclick="document.getElementById('km-schedule-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="km-schedule-form"></div>
      </div>
    </div>
  `;

  loadKnowledgeEntries();
  loadKmSchedule();
}

async function loadKmSchedule() {
  const scheduleDiv = document.getElementById('km-schedule');
  try {
    const res = await callApi('getResources', { category: 'km-schedule' });
    const resources = Array.isArray(res.data || res) ? (res.data || res) : [];
    const schedules = resources.filter(r => r.category === 'km-schedule');

    if (schedules.length === 0) {
      scheduleDiv.innerHTML = '<div class="text-center text-sm text-gray-400 col-span-full">ยังไม่ได้กำหนดวันนำเสนอ</div>';
      return;
    }

    const roundLabels = ['รอบที่ 1', 'รอบที่ 2', 'รอบที่ 3'];
    const roundColors = ['bg-indigo-100 border-indigo-300 text-indigo-800', 'bg-purple-100 border-purple-300 text-purple-800', 'bg-pink-100 border-pink-300 text-pink-800'];

    scheduleDiv.innerHTML = schedules.slice(0, 3).map((s, i) => `
      <div class="rounded-lg border p-3 ${roundColors[i] || roundColors[0]}">
        <div class="font-semibold text-sm">${roundLabels[i] || 'รอบที่ ' + (i+1)}</div>
        <div class="text-lg font-bold mt-1">${s.title ? formatDate(s.title) : '-'}</div>
        ${s.description ? '<div class="text-xs mt-1 opacity-80">' + escAttr(s.description) + '</div>' : ''}
      </div>
    `).join('');
  } catch (e) {
    scheduleDiv.innerHTML = '<div class="text-center text-sm text-gray-400 col-span-full">ไม่สามารถโหลดกำหนดการ</div>';
  }
}

function openScheduleModal() {
  document.getElementById('km-schedule-form').innerHTML = `
    <div class="space-y-4">
      <p class="text-sm text-gray-500 mb-4">กำหนดวันนำเสนอ Report-Out (สูงสุด 3 รอบ)</p>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">รอบที่ 1</label>
        <input type="date" id="sched-date-1" class="w-full border rounded-lg p-2 text-sm">
        <input type="text" id="sched-note-1" class="w-full border rounded-lg p-2 text-sm mt-2" placeholder="หมายเหตุ (ไม่บังคับ)">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">รอบที่ 2</label>
        <input type="date" id="sched-date-2" class="w-full border rounded-lg p-2 text-sm">
        <input type="text" id="sched-note-2" class="w-full border rounded-lg p-2 text-sm mt-2" placeholder="หมายเหตุ (ไม่บังคับ)">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">รอบที่ 3</label>
        <input type="date" id="sched-date-3" class="w-full border rounded-lg p-2 text-sm">
        <input type="text" id="sched-note-3" class="w-full border rounded-lg p-2 text-sm mt-2" placeholder="หมายเหตุ (ไม่บังคับ)">
      </div>
      <button onclick="saveKmSchedule()" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">บันทึกกำหนดการ</button>
    </div>`;
  document.getElementById('km-schedule-modal').classList.remove('hidden');
}

async function saveKmSchedule() {
  const user = getCurrentUser();
  showLoading();
  try {
    for (let i = 1; i <= 3; i++) {
      const date = document.getElementById('sched-date-' + i).value;
      if (date) {
        await callApiPost('createResource', {
          title: date,
          description: document.getElementById('sched-note-' + i).value || '',
          category: 'km-schedule',
          type: 'document',
          createdBy: user.id
        });
      }
    }
    showToast('บันทึกกำหนดการสำเร็จ', 'success');
    document.getElementById('km-schedule-modal').classList.add('hidden');
    await loadKmSchedule();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}

async function loadKnowledgeEntries() {
  const user = getCurrentUser();
  try {
    const res = await callApi('getKnowledgeEntries', { userId: user.id });
    const entries = res.success !== false ? (res.data || res) : [];

    const entriesMap = {};
    if (Array.isArray(entries)) {
      entries.forEach(e => { entriesMap[e.topicNumber] = e; });
    }

    let completedCount = 0;
    let selectedTopic = null;

    const grid = document.getElementById('topics-grid');
    let html = '';

    KM_TOPICS.forEach(topic => {
      const entry = entriesMap[topic.number] || entriesMap[String(topic.number)] || {};
      const hasContent = entry.keyTakeaways || entry.challenges || entry.knowledgeApply || entry.feedback;
      if (hasContent) completedCount++;
      const isSelected = entry.isSelectedForPresentation === 'true' || entry.isSelectedForPresentation === true;
      if (isSelected) selectedTopic = topic.number;

      const colorMap = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-400' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', ring: 'ring-green-400' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', ring: 'ring-purple-400' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: 'ring-orange-400' },
        red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', ring: 'ring-red-400' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', ring: 'ring-yellow-400' },
      };
      const c = colorMap[topic.color];

      html += `
        <div class="bg-white rounded-xl border-2 ${hasContent ? c.border : 'border-gray-200'} ${isSelected ? 'ring-2 ' + c.ring : ''} hover:shadow-lg transition-all cursor-pointer" onclick="openKmEntry(${topic.number})">
          <div class="p-5">
            <div class="flex items-start justify-between mb-3">
              <span class="text-3xl">${topic.icon}</span>
              <div class="flex gap-2">
                ${isSelected ? '<span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">🎤 หัวข้อนำเสนอ</span>' : ''}
                ${hasContent
                  ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ บันทึกแล้ว</span>'
                  : '<span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">ยังไม่ได้บันทึก</span>'}
              </div>
            </div>
            <h3 class="font-bold text-gray-800 mb-1">${topic.number}. ${topic.name}</h3>
            <p class="text-sm text-gray-500">${topic.nameEn}</p>
            ${hasContent ? `
              <div class="mt-3 text-xs text-gray-400 space-y-1">
                <div>${entry.keyTakeaways ? '✓' : '○'} สิ่งที่ได้เรียนรู้</div>
                <div>${entry.challenges ? '✓' : '○'} ปัญหาและแนวทางแก้ไข</div>
                <div>${entry.knowledgeApply ? '✓' : '○'} การนำไปประยุกต์ใช้</div>
                <div>${entry.feedback ? '✓' : '○'} ฟีดแบคและข้อเสนอแนะ</div>
                ${entry.fileUrl ? '<div class="mt-2"><a href="' + safeUrl(entry.fileUrl) + '" target="_blank" onclick="event.stopPropagation()" class="inline-flex items-center gap-1 text-blue-600 hover:underline">📎 ' + escAttr(entry.fileName || 'ไฟล์แนบ') + '</a></div>' : ''}
              </div>
            ` : ''}
          </div>
        </div>`;
    });

    grid.innerHTML = html;

    document.getElementById('km-progress').textContent = completedCount + '/6';
    document.getElementById('km-progress-bar').style.width = Math.round((completedCount/6)*100) + '%';

    // Show presentation score if exists
    const selectedEntry = Object.values(entriesMap).find(e => e.isSelectedForPresentation === 'true' || e.isSelectedForPresentation === true);
    if (selectedEntry && selectedEntry.presentationScore != null) {
      const scoreDiv = document.getElementById('presentation-score');
      scoreDiv.classList.remove('hidden');

      let scoreDetail = {};
      try { scoreDetail = JSON.parse(selectedEntry.presentationScoreDetail || '{}'); } catch(e) {}

      document.getElementById('score-content').innerHTML = `
        <div class="flex items-center gap-6">
          <div class="text-4xl font-bold text-purple-700">${parseFloat(selectedEntry.presentationScore).toFixed(1)}<span class="text-lg text-purple-400">/100</span></div>
          <div class="flex-1 grid grid-cols-5 gap-3 text-center text-sm">
            <div><div class="font-medium">${escAttr(scoreDetail.format || '-')}</div><div class="text-xs text-gray-500">รูปแบบ (15%)</div></div>
            <div><div class="font-medium">${escAttr(scoreDetail.content || '-')}</div><div class="text-xs text-gray-500">เนื้อหา (40%)</div></div>
            <div><div class="font-medium">${escAttr(scoreDetail.timeManagement || '-')}</div><div class="text-xs text-gray-500">เวลา (15%)</div></div>
            <div><div class="font-medium">${escAttr(scoreDetail.presentationSkill || '-')}</div><div class="text-xs text-gray-500">ทักษะ (15%)</div></div>
            <div><div class="font-medium">${escAttr(scoreDetail.qaSkill || '-')}</div><div class="text-xs text-gray-500">ตอบคำถาม (15%)</div></div>
          </div>
        </div>`;
    }

    window._kmEntries = entriesMap;
  } catch (err) {
    document.getElementById('topics-grid').innerHTML = '<div class="col-span-full text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function openKmEntry(topicNumber) {
  const topic = KM_TOPICS.find(t => t.number === topicNumber);
  const entry = window._kmEntries?.[topicNumber] || window._kmEntries?.[String(topicNumber)] || {};
  const user = getCurrentUser();
  const isSelected = entry.isSelectedForPresentation === 'true' || entry.isSelectedForPresentation === true;

  document.getElementById('km-modal-title').textContent = topic.icon + ' ' + topic.number + '. ' + topic.name;

  document.getElementById('km-modal-content').innerHTML = `
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">สิ่งที่ได้เรียนรู้ (Key Takeaways)</label>
        <textarea id="km-takeaways" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" rows="4" placeholder="บันทึกสิ่งที่ได้เรียนรู้จากหัวข้อนี้...">${escAttr(entry.keyTakeaways || '')}</textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ปัญหาหรืออุปสรรคที่พบ และแนวทางแก้ไข (Challenges and Solutions)</label>
        <textarea id="km-challenges" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" rows="4" placeholder="ปัญหาที่พบและวิธีแก้ไข...">${escAttr(entry.challenges || '')}</textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">การนำไปประยุกต์ใช้ในงานจริง (Knowledge Apply)</label>
        <textarea id="km-apply" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" rows="4" placeholder="นำความรู้ไปใช้อย่างไร...">${escAttr(entry.knowledgeApply || '')}</textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ฟีดแบค และข้อเสนอแนะอื่นๆ (Feedback and Suggestion)</label>
        <textarea id="km-feedback" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" rows="4" placeholder="ข้อเสนอแนะเพิ่มเติม...">${escAttr(entry.feedback || '')}</textarea>
      </div>

      <!-- File Attachment -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">แนบไฟล์ประกอบ</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
          <label for="km-file-input" class="cursor-pointer block">
            <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            <p class="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์ (PDF, รูปภาพ, เอกสาร สูงสุด 10MB)</p>
            <input type="file" id="km-file-input" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" class="hidden" onchange="handleKmFileSelect(this)">
          </label>
        </div>
        <div id="km-file-status" class="mt-2 text-xs">
          ${entry.fileUrl ? '<a href="' + safeUrl(entry.fileUrl) + '" target="_blank" class="text-blue-600 hover:underline">📎 ' + escAttr(entry.fileName || 'ดูไฟล์ที่แนบ') + '</a>' : ''}
        </div>
      </div>

      <!-- Select for presentation -->
      <div class="border-t pt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" id="km-select-present" ${isSelected ? 'checked' : ''} class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500">
          <span class="text-sm font-medium text-gray-700">🎤 เลือกหัวข้อนี้สำหรับการนำเสนอผลการฝึกงาน</span>
        </label>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button onclick="saveKmEntry(${topicNumber})" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          บันทึก
        </button>
        <button onclick="closeKmModal()" class="px-6 py-3 rounded-lg border text-gray-600 hover:bg-gray-50">
          ยกเลิก
        </button>
      </div>
    </div>
  `;

  document.getElementById('km-modal').classList.remove('hidden');
}

function closeKmModal() {
  document.getElementById('km-modal').classList.add('hidden');
}

window._kmSelectedFile = null;

function handleKmFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showToast('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)', 'error');
    input.value = '';
    return;
  }
  window._kmSelectedFile = file;
  document.getElementById('km-file-status').innerHTML = '<span class="text-blue-600">' + file.name + '</span>';
}

async function saveKmEntry(topicNumber) {
  const user = getCurrentUser();
  const isSelected = document.getElementById('km-select-present').checked;

  const data = {
    userId: user.id,
    topicNumber: String(topicNumber),
    keyTakeaways: document.getElementById('km-takeaways').value,
    challenges: document.getElementById('km-challenges').value,
    knowledgeApply: document.getElementById('km-apply').value,
    feedback: document.getElementById('km-feedback').value,
  };

  showLoading();
  try {
    if (window._kmSelectedFile) {
      const base64 = await fileToBase64(window._kmSelectedFile);
      const uploadResult = await callApiPost('uploadFile', {
        fileName: window._kmSelectedFile.name,
        fileData: base64,
        mimeType: window._kmSelectedFile.type,
        subfolder: 'knowledge'
      });
      if (uploadResult.success !== false && uploadResult.data) {
        data.fileUrl = uploadResult.data.fileUrl;
        data.fileName = uploadResult.data.fileName;
      }
    }

    await callApiPost('saveKnowledgeEntry', data);

    if (isSelected) {
      await callApiPost('selectPresentationTopic', { userId: user.id, topicNumber: String(topicNumber) });
    }

    window._kmSelectedFile = null;
    showToast('บันทึกสำเร็จ', 'success');
    closeKmModal();
    await loadKnowledgeEntries();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}
