// ==================== หน้าแบบประเมินหลังฝึกงาน ====================

function renderSurvey() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const surveyKey = `survey_submitted_${user.id}`;
  const alreadySubmitted = localStorage.getItem(surveyKey) === 'true';

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">แบบประเมินหลังฝึกงาน</h1>

        ${alreadySubmitted ? buildSurveyThankYou() : buildSurveyForm()}
      </div>
    </div>
  `;

  if (!alreadySubmitted) {
    initSurveyForm(user);
  }
}

function buildSurveyThankYou() {
  return `
    <div class="bg-white rounded-2xl shadow-sm border p-8 max-w-2xl mx-auto text-center fade-in">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">ขอบคุณที่ทำแบบประเมิน!</h2>
      <p class="text-gray-500 text-sm">คุณได้ส่งแบบประเมินหลังฝึกงานเรียบร้อยแล้ว ข้อมูลของคุณจะถูกนำไปใช้ในการปรับปรุงโปรแกรมต่อไป</p>
    </div>
  `;
}

function buildSurveyForm() {
  return `
    <div class="bg-white rounded-2xl shadow-sm border p-8 max-w-3xl mx-auto fade-in">
      <div class="text-center mb-6">
        <p class="text-gray-500 text-sm">กรุณาตอบแบบประเมินเพื่อช่วยปรับปรุงโปรแกรมฝึกงาน Makro</p>
      </div>

      <div id="survey-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>

      <form id="survey-form" class="space-y-6">

        <!-- ==================== Section 1: ภาพรวมการฝึกงาน ==================== -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">1</span>
            <h2 class="text-lg font-semibold text-gray-800">ภาพรวมการฝึกงาน</h2>
          </div>
          <div class="space-y-4 pl-9">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ความพึงพอใจโดยรวม <span class="text-red-500">*</span></label>
              <div class="flex items-center gap-1" id="star-rating">
                ${[1,2,3,4,5].map(n => `
                  <label class="cursor-pointer">
                    <input type="radio" name="satisfaction" value="${n}" class="hidden" required>
                    <svg class="w-8 h-8 star-icon text-gray-300 hover:text-yellow-400 transition-colors" data-star="${n}" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  </label>
                `).join('')}
                <span id="star-label" class="ml-2 text-sm text-gray-500"></span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">แนะนำโปรแกรมนี้ให้เพื่อนหรือไม่ <span class="text-red-500">*</span></label>
              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recommend" value="yes" required class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">ใช่</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recommend" value="no" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">ไม่</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- ==================== Section 2: ประเมินผู้สอนในหัวข้อต่างๆ ==================== -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">2</span>
            <h2 class="text-lg font-semibold text-gray-800">ประเมินผู้สอนในหัวข้อต่างๆ</h2>
          </div>
          <div class="space-y-3 pl-9">
            <p class="text-sm text-gray-500 mb-2">ให้คะแนนผู้สอนในแต่ละหัวข้อ (1 = น้อยที่สุด, 5 = มากที่สุด)</p>
            ${[
              { id: 'orientation', label: 'Orientation / ปฐมนิเทศ' },
              { id: 'fresh-food', label: 'Fresh Food Department Study' },
              { id: 'food-safety', label: 'Food Safety & GMP/HACCP' },
              { id: 'ordering', label: 'OPL Ordering / การสั่งซื้อสินค้า' },
              { id: 'receiving', label: 'Receiving & Storage Management' },
              { id: 'merchandising', label: 'Display & Merchandising' },
              { id: 'sale-analysis', label: 'Sale Analysis & Price Management' },
              { id: 'stock-mgmt', label: 'Stock & Inventory Management' },
              { id: 'shrinkage', label: 'Shrinkage Management' },
              { id: 'customer-dev', label: 'Customer Development' },
              { id: 'soft-skill', label: 'Soft Skill Management' },
              { id: 'supervisor', label: 'Supervisor Function Job' }
            ].map(topic => `
              <div class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <span class="text-sm text-gray-700 flex-1">${topic.label}</span>
                <div class="flex gap-1">
                  ${[1,2,3,4,5].map(n => `
                    <label class="cursor-pointer">
                      <input type="radio" name="trainer_${topic.id}" value="${n}" class="hidden">
                      <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors trainer-rating border border-gray-200 hover:bg-primary-100 hover:border-primary-400" data-group="trainer_${topic.id}" data-value="${n}">${n}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- ==================== Section 3: ทักษะที่ได้รับ ==================== -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">3</span>
            <h2 class="text-lg font-semibold text-gray-800">ทักษะที่ได้รับ</h2>
          </div>
          <div class="space-y-3 pl-9">
            <label class="block text-sm font-medium text-gray-700 mb-2">เลือกทักษะที่ได้รับจากการฝึกงาน</label>
            ${[
              { value: 'fresh-food-management', label: 'การจัดการ Fresh Food' },
              { value: 'food-safety', label: 'Food Safety/GMP/HACCP' },
              { value: 'data-analysis', label: 'การวิเคราะห์ข้อมูล' },
              { value: 'customer-service', label: 'การบริการลูกค้า' },
              { value: 'teamwork', label: 'การทำงานเป็นทีม' },
              { value: 'leadership', label: 'ทักษะผู้นำ' },
              { value: 'communication', label: 'การสื่อสาร' }
            ].map(skill => `
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="skills" value="${skill.value}" class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300">
                <span class="text-sm text-gray-700">${skill.label}</span>
              </label>
            `).join('')}
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" id="skill-other-check" value="other" class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300">
                <span class="text-sm text-gray-700">อื่นๆ</span>
              </label>
              <input type="text" id="skill-other-text" placeholder="ระบุทักษะอื่นๆ" disabled
                class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm disabled:bg-gray-100 disabled:text-gray-400">
            </div>
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- ==================== Section 4: ข้อเสนอแนะ ==================== -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">4</span>
            <h2 class="text-lg font-semibold text-gray-800">ข้อเสนอแนะ</h2>
          </div>
          <div class="space-y-4 pl-9">
            <div>
              <label for="survey-liked" class="block text-sm font-medium text-gray-700 mb-1">สิ่งที่ชอบมากที่สุดเกี่ยวกับโปรแกรม</label>
              <textarea id="survey-liked" rows="3" placeholder="บอกเราว่าคุณชอบอะไรมากที่สุด..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
            </div>
            <div>
              <label for="survey-improve" class="block text-sm font-medium text-gray-700 mb-1">สิ่งที่ต้องปรับปรุง</label>
              <textarea id="survey-improve" rows="3" placeholder="มีอะไรที่ควรปรับปรุงบ้าง..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
            </div>
            <div>
              <label for="survey-suggestions" class="block text-sm font-medium text-gray-700 mb-1">ข้อเสนอแนะเพิ่มเติม</label>
              <textarea id="survey-suggestions" rows="3" placeholder="ข้อเสนอแนะอื่นๆ..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
            </div>
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- ==================== Section 5: อนาคต ==================== -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">5</span>
            <h2 class="text-lg font-semibold text-gray-800">อนาคต</h2>
          </div>
          <div class="space-y-4 pl-9">
            <div>
              <label for="survey-future-plan" class="block text-sm font-medium text-gray-700 mb-1">แผนหลังจบการฝึกงาน <span class="text-red-500">*</span></label>
              <select id="survey-future-plan" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                <option value="">-- เลือกแผนของคุณ --</option>
                <option value="work-at-makro">ทำงานต่อที่ Makro</option>
                <option value="apply-elsewhere">สมัครงานที่อื่น</option>
                <option value="continue-study">กลับไปเรียนต่อ</option>
                <option value="undecided">ยังไม่แน่ใจ</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สนใจทำงานกับ Makro หลังจบการศึกษาหรือไม่ <span class="text-red-500">*</span></label>
              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="interest_makro" value="yes" required class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">ใช่</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="interest_makro" value="no" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">ไม่</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="interest_makro" value="maybe" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">อาจจะ</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สนใจเข้าร่วมโครงการ Operation Trainees หรือไม่</label>
              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="interest_ot" value="yes" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">สนใจ</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="interest_ot" value="no" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">ไม่สนใจ</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="interest_ot" value="need-info" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                  <span class="text-sm text-gray-700">ต้องการข้อมูลเพิ่มเติม</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" id="survey-submit-btn"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
          ส่งแบบประเมิน
        </button>
      </form>
    </div>
  `;
}

function initSurveyForm(user) {
  // Star rating interactivity
  const starContainer = document.getElementById('star-rating');
  if (starContainer) {
    const stars = starContainer.querySelectorAll('.star-icon');
    const starLabels = { 1: 'แย่มาก', 2: 'แย่', 3: 'ปานกลาง', 4: 'ดี', 5: 'ดีมาก' };
    const labelEl = document.getElementById('star-label');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.star);
        // Check the hidden radio
        const radio = starContainer.querySelector(`input[value="${value}"]`);
        if (radio) radio.checked = true;
        // Update star colors
        stars.forEach(s => {
          const sv = parseInt(s.dataset.star);
          if (sv <= value) {
            s.classList.remove('text-gray-300');
            s.classList.add('text-yellow-400');
          } else {
            s.classList.remove('text-yellow-400');
            s.classList.add('text-gray-300');
          }
        });
        if (labelEl) labelEl.textContent = starLabels[value] || '';
      });

      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.star);
        stars.forEach(s => {
          const sv = parseInt(s.dataset.star);
          if (sv <= value) {
            s.classList.remove('text-gray-300');
            s.classList.add('text-yellow-400');
          } else {
            s.classList.remove('text-yellow-400');
            s.classList.add('text-gray-300');
          }
        });
        if (labelEl) labelEl.textContent = starLabels[value] || '';
      });
    });

    starContainer.addEventListener('mouseleave', () => {
      const checked = starContainer.querySelector('input[name="satisfaction"]:checked');
      const selectedValue = checked ? parseInt(checked.value) : 0;
      stars.forEach(s => {
        const sv = parseInt(s.dataset.star);
        if (sv <= selectedValue) {
          s.classList.remove('text-gray-300');
          s.classList.add('text-yellow-400');
        } else {
          s.classList.remove('text-yellow-400');
          s.classList.add('text-gray-300');
        }
      });
      if (labelEl) labelEl.textContent = selectedValue ? (starLabels[selectedValue] || '') : '';
    });
  }

  // Trainer rating number circles
  document.querySelectorAll('.trainer-rating').forEach(span => {
    span.addEventListener('click', () => {
      const group = span.dataset.group;
      const value = span.dataset.value;
      const radio = document.querySelector(`input[name="${group}"][value="${value}"]`);
      if (radio) radio.checked = true;
      document.querySelectorAll(`.trainer-rating[data-group="${group}"]`).forEach(s => {
        if (parseInt(s.dataset.value) <= parseInt(value)) {
          s.classList.remove('border-gray-200', 'bg-white');
          s.classList.add('bg-primary-500', 'text-white', 'border-primary-500');
        } else {
          s.classList.remove('bg-primary-500', 'text-white', 'border-primary-500');
          s.classList.add('border-gray-200', 'bg-white');
        }
      });
    });
  });

  // "Other" skill checkbox toggle
  const otherCheck = document.getElementById('skill-other-check');
  const otherText = document.getElementById('skill-other-text');
  if (otherCheck && otherText) {
    otherCheck.addEventListener('change', () => {
      otherText.disabled = !otherCheck.checked;
      if (!otherCheck.checked) otherText.value = '';
      if (otherCheck.checked) otherText.focus();
    });
  }

  // Form submission
  const form = document.getElementById('survey-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('survey-error');
      const btn = document.getElementById('survey-submit-btn');

      // Gather values
      const satisfactionEl = form.querySelector('input[name="satisfaction"]:checked');
      const recommendEl = form.querySelector('input[name="recommend"]:checked');
      const interestMakroEl = form.querySelector('input[name="interest_makro"]:checked');
      const futurePlan = document.getElementById('survey-future-plan').value;

      // Validate required fields
      if (!satisfactionEl) {
        errorDiv.textContent = 'กรุณาให้คะแนนความพึงพอใจโดยรวม';
        errorDiv.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!recommendEl) {
        errorDiv.textContent = 'กรุณาระบุว่าแนะนำโปรแกรมนี้หรือไม่';
        errorDiv.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!futurePlan) {
        errorDiv.textContent = 'กรุณาเลือกแผนหลังจบการฝึกงาน';
        errorDiv.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!interestMakroEl) {
        errorDiv.textContent = 'กรุณาระบุความสนใจทำงานกับ Makro';
        errorDiv.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Collect skills
      const skillCheckboxes = form.querySelectorAll('input[name="skills"]:checked');
      const skills = Array.from(skillCheckboxes).map(cb => cb.value);
      if (otherCheck && otherCheck.checked && otherText.value.trim()) {
        skills.push('other:' + otherText.value.trim());
      }

      // Collect trainer ratings
      const trainerRatings = {};
      ['orientation','fresh-food','food-safety','ordering','receiving','merchandising','sale-analysis','stock-mgmt','shrinkage','customer-dev','soft-skill','supervisor'].forEach(id => {
        const radio = form.querySelector(`input[name="trainer_${id}"]:checked`);
        if (radio) trainerRatings[id] = parseInt(radio.value);
      });

      const surveyData = {
        satisfaction: parseInt(satisfactionEl.value),
        recommend: recommendEl.value,
        trainerRatings: trainerRatings,
        skills: skills,
        liked: document.getElementById('survey-liked').value.trim(),
        improve: document.getElementById('survey-improve').value.trim(),
        suggestions: document.getElementById('survey-suggestions').value.trim(),
        futurePlan: futurePlan,
        interestMakro: interestMakroEl.value,
        interestOT: form.querySelector('input[name="interest_ot"]:checked')?.value || ''
      };

      errorDiv.classList.add('hidden');
      btn.disabled = true;
      btn.textContent = 'กำลังส่งแบบประเมิน...';
      showLoading();

      try {
        const result = await callApiPost('createEvaluation', {
          type: 'post-internship-survey',
          evaluatorId: user.id,
          evaluateeId: user.id,
          scores: JSON.stringify(surveyData)
        });

        if (result.success || result.id) {
          const surveyKey = `survey_submitted_${user.id}`;
          localStorage.setItem(surveyKey, 'true');
          showToast('ส่งแบบประเมินสำเร็จ', 'success');
          renderSurvey();
        } else {
          errorDiv.textContent = result.message || 'เกิดข้อผิดพลาดในการส่งแบบประเมิน';
          errorDiv.classList.remove('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        errorDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
        errorDiv.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        btn.disabled = false;
        btn.textContent = 'ส่งแบบประเมิน';
        hideLoading();
      }
    });
  }
}
