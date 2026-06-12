/**
 * TrainingPlanService.gs - Training plan per topic/step
 * แผนการฝึกรายหัวข้อ: ผู้ฝึกสอน, ระยะเวลา, ผลประเมิน ผ่าน/ไม่ผ่าน,
 * และการประเมินผ่าน QR Code โดยผู้สอนภายนอก (ไม่ต้องมีบัญชี)
 */

/**
 * Upserts plan details for a student's roadmap step.
 * Editable by the student themselves or an Admin.
 * Accepts: userId, stepId, actorId, trainerName, trainerPosition,
 *          trainerContact, startDate, endDate, trainingDays, status, note
 */
function updateStepPlan(params) {
  try {
    if (!params.userId || !params.stepId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน (userId, stepId)' };
    }

    var actor = resolveActingUser(params.actorId);
    if (!actor) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' };
    }
    if (actor.role !== CONFIG.ROLES.ADMIN && String(actor.id) !== String(params.userId)) {
      return { success: false, message: 'คุณไม่มีสิทธิ์แก้ไขแผนการฝึกนี้' };
    }

    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, params.stepId);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    var planFields = ['trainerName', 'trainerPosition', 'trainerContact',
                      'startDate', 'endDate', 'trainingDays', 'note'];
    var data = {};
    for (var i = 0; i < planFields.length; i++) {
      if (params[planFields[i]] !== undefined) {
        data[planFields[i]] = params[planFields[i]];
      }
    }

    var now = new Date().toISOString();
    var existing = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: params.userId,
      stepId: params.stepId
    });

    var result;
    if (existing.length > 0) {
      if (params.status !== undefined && params.status !== '') {
        data.status = params.status;
        if (String(params.status).toUpperCase() === 'COMPLETED' &&
            String(existing[0].status).toUpperCase() !== 'COMPLETED') {
          data.completedAt = now;
        }
      }
      if (!existing[0].evalToken) {
        data.evalToken = generateId() + generateId();
      }
      result = updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existing[0].id, data);
    } else {
      data.userId = params.userId;
      data.roadmapId = step.roadmapId;
      data.stepId = params.stepId;
      data.status = params.status || 'NOT_STARTED';
      data.completedAt = String(data.status).toUpperCase() === 'COMPLETED' ? now : '';
      data.evalToken = generateId() + generateId();
      data.attemptCount = 0;
      result = appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, data);
    }

    return { success: true, data: result, message: 'บันทึกแผนการฝึกสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateStepPlan: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกแผนการฝึกได้: ' + err.message };
  }
}

/**
 * Returns (and creates if needed) the QR evaluation token for a step.
 */
function getEvalToken(userId, stepId) {
  try {
    if (!userId || !stepId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    }

    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, stepId);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    var existing = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: userId,
      stepId: stepId
    });

    var token;
    if (existing.length > 0) {
      token = existing[0].evalToken;
      if (!token) {
        token = generateId() + generateId();
        updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existing[0].id, { evalToken: token });
      }
    } else {
      token = generateId() + generateId();
      appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, {
        userId: userId,
        roadmapId: step.roadmapId,
        stepId: stepId,
        status: 'NOT_STARTED',
        note: '',
        completedAt: '',
        evalToken: token,
        attemptCount: 0
      });
    }

    return { success: true, data: { token: token } };
  } catch (err) {
    Logger.log('Error in getEvalToken: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างลิงก์ประเมินได้: ' + err.message };
  }
}

/**
 * Public: gets evaluation context by token (for the QR evaluation form).
 * No login required — the token itself is the authorization.
 */
function getEvalByToken(token) {
  try {
    if (!token) {
      return { success: false, message: 'ไม่พบรหัสประเมิน' };
    }

    var rows = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { evalToken: token });
    if (rows.length === 0) {
      return { success: false, message: 'ลิงก์ประเมินไม่ถูกต้องหรือหมดอายุ' };
    }

    var p = rows[0];
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, p.stepId);
    var student = getRowById(CONFIG.SHEETS.USERS, p.userId);
    var roadmap = step ? getRowById(CONFIG.SHEETS.ROADMAPS, step.roadmapId) : null;

    return {
      success: true,
      data: {
        studentName: student ? ((student.prefix || '') + (student.firstName || '') + ' ' + (student.lastName || '')).trim() : '',
        studentCode: student ? (student.studentId || '') : '',
        stepTitle: step ? step.title : '',
        stepDescription: step ? step.description : '',
        roadmapTitle: roadmap ? roadmap.title : '',
        trainerName: p.trainerName || '',
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        evalResult: p.evalResult || '',
        evalBy: p.evalBy || '',
        evalAt: p.evalAt || '',
        attemptCount: Number(p.attemptCount) || 0
      }
    };
  } catch (err) {
    Logger.log('Error in getEvalByToken: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลประเมินได้: ' + err.message };
  }
}

/**
 * Public: submits an evaluation result via token (from the QR form).
 * PASS  → step COMPLETED
 * FAIL  → step back to IN_PROGRESS (ต้องฝึกซ้ำ), attemptCount + 1
 */
function submitEvalByToken(token, result, comment, evaluatorName) {
  try {
    if (!token) {
      return { success: false, message: 'ไม่พบรหัสประเมิน' };
    }

    var upper = String(result || '').toUpperCase();
    if (upper !== 'PASS' && upper !== 'FAIL') {
      return { success: false, message: 'กรุณาเลือกผลการประเมิน (ผ่าน/ไม่ผ่าน)' };
    }
    if (!evaluatorName || !String(evaluatorName).trim()) {
      return { success: false, message: 'กรุณากรอกชื่อผู้ประเมิน' };
    }

    var rows = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { evalToken: token });
    if (rows.length === 0) {
      return { success: false, message: 'ลิงก์ประเมินไม่ถูกต้องหรือหมดอายุ' };
    }

    var p = rows[0];
    var now = new Date().toISOString();

    var updateData = {
      evalResult: upper,
      evalComment: comment || '',
      evalBy: String(evaluatorName).trim(),
      evalAt: now
    };

    if (upper === 'PASS') {
      updateData.status = 'COMPLETED';
      updateData.completedAt = now;
    } else {
      updateData.status = 'IN_PROGRESS';
      updateData.attemptCount = (Number(p.attemptCount) || 0) + 1;
    }

    updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, p.id, updateData);

    // Notify the student
    try {
      var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, p.stepId);
      var stepTitle = step ? step.title : 'หัวข้อการฝึก';
      var msg = upper === 'PASS'
        ? 'คุณผ่านการประเมินหัวข้อ "' + stepTitle + '" โดย ' + evaluatorName
        : 'คุณไม่ผ่านการประเมินหัวข้อ "' + stepTitle + '" กรุณาฝึกเพิ่มเติมและประเมินใหม่อีกครั้ง';
      createNotification(p.userId, 'ผลการประเมินการฝึก', msg, upper === 'PASS' ? 'success' : 'warning');
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return {
      success: true,
      message: upper === 'PASS' ? 'บันทึกผลประเมิน: ผ่าน' : 'บันทึกผลประเมิน: ไม่ผ่าน (ต้องฝึกซ้ำ)'
    };
  } catch (err) {
    Logger.log('Error in submitEvalByToken: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกผลประเมินได้: ' + err.message };
  }
}
