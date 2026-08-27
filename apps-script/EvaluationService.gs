/**
 * EvaluationService.gs - Evaluation management functions
 * Handles performance evaluations between mentors/admins and students.
 */

/**
 * Gets evaluations with optional filters.
 * @param {Object} filter - Optional filter (type, evaluatorId, evaluateeId)
 * @return {Object} Result with evaluations array
 */
function getEvaluations(params) {
  try {
    // คัดเฉพาะคอลัมน์ที่ใช้กรองได้ — params ที่ router ส่งมามี action/authToken ปนอยู่
    var filter = sheetFilter_(CONFIG.SHEETS.EVALUATIONS, params,
      ['type', 'evaluatorId', 'evaluateeId', 'period']);

    var evaluations;
    if (Object.keys(filter).length > 0) {
      evaluations = getRows(CONFIG.SHEETS.EVALUATIONS, filter);
    } else {
      evaluations = getAllRows(CONFIG.SHEETS.EVALUATIONS);
    }

    // Enrich with user info
    for (var i = 0; i < evaluations.length; i++) {
      var evaluator = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluatorId);
      if (evaluator) {
        evaluations[i].evaluatorName = evaluator.firstName + ' ' + evaluator.lastName;
        evaluations[i].evaluatorRole = evaluator.role;
      }

      var evaluatee = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluateeId);
      if (evaluatee) {
        evaluations[i].evaluateeName = evaluatee.firstName + ' ' + evaluatee.lastName;
        evaluations[i].evaluateeStudentId = evaluatee.studentId;
      }

      // Parse scores JSON if it's a string
      if (typeof evaluations[i].scores === 'string' && evaluations[i].scores) {
        try {
          evaluations[i].scoresData = JSON.parse(evaluations[i].scores);
        } catch (parseErr) {
          evaluations[i].scoresData = {};
        }
      }
    }

    // Sort by creation date descending
    evaluations.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: evaluations };
  } catch (err) {
    Logger.log('Error in getEvaluations: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลการประเมินได้: ' + err.message };
  }
}

/**
 * Creates a new evaluation.
 * @param {Object} data - Evaluation data (type, evaluateeId, period, scores, totalScore, maxScore, comment)
 * @return {Object} Result with created evaluation data
 */
function createEvaluation(data) {
  try {
    var user = resolveActingUser(data.evaluatorId);
    if (!user) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
    }

    if (!data.evaluateeId || !data.type) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // Verify evaluatee exists
    var evaluatee = getRowById(CONFIG.SHEETS.USERS, data.evaluateeId);
    if (!evaluatee) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ถูกประเมิน' };
    }

    // Convert scores to JSON string if it's an object
    var scoresStr = data.scores;
    if (typeof data.scores === 'object') {
      scoresStr = JSON.stringify(data.scores);
    }

    var evaluationData = {
      type: data.type,
      evaluatorId: user.id,
      evaluateeId: data.evaluateeId,
      period: data.period || '',
      scores: scoresStr || '{}',
      totalScore: data.totalScore || '0',
      maxScore: data.maxScore || '100',
      comment: data.comment || ''
    };

    var newEvaluation = appendRow(CONFIG.SHEETS.EVALUATIONS, evaluationData);

    // Notify evaluatee
    try {
      createNotification(
        data.evaluateeId,
        'การประเมินใหม่',
        'คุณได้รับการประเมิน (' + data.type + ') จาก ' + user.firstName + ' ' + user.lastName,
        'evaluation'
      );
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return { success: true, data: newEvaluation, message: 'สร้างการประเมินสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createEvaluation: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างการประเมินได้: ' + err.message };
  }
}

/**
 * Gets evaluations by user (as evaluator or evaluatee).
 * @param {string} userId - User ID
 * @param {boolean} asEvaluator - If true, get evaluations given by user; if false, get evaluations received
 * @return {Object} Result with evaluations array
 */
function getEvaluationsByUser(userId, asEvaluator) {
  try {
    var filter = {};
    if (asEvaluator) {
      filter.evaluatorId = userId;
    } else {
      filter.evaluateeId = userId;
    }

    var evaluations = getRows(CONFIG.SHEETS.EVALUATIONS, filter);

    // Enrich with user info
    for (var i = 0; i < evaluations.length; i++) {
      var evaluator = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluatorId);
      if (evaluator) {
        evaluations[i].evaluatorName = evaluator.firstName + ' ' + evaluator.lastName;
        evaluations[i].evaluatorRole = evaluator.role;
      }

      var evaluatee = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluateeId);
      if (evaluatee) {
        evaluations[i].evaluateeName = evaluatee.firstName + ' ' + evaluatee.lastName;
        evaluations[i].evaluateeStudentId = evaluatee.studentId;
      }

      // Parse scores JSON
      if (typeof evaluations[i].scores === 'string' && evaluations[i].scores) {
        try {
          evaluations[i].scoresData = JSON.parse(evaluations[i].scores);
        } catch (parseErr) {
          evaluations[i].scoresData = {};
        }
      }
    }

    // Sort by creation date descending
    evaluations.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: evaluations };
  } catch (err) {
    Logger.log('Error in getEvaluationsByUser: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลการประเมินได้: ' + err.message };
  }
}
