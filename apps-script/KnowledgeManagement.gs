/**
 * KnowledgeManagement.gs - Knowledge Management service
 * Handles 6 KM topics, entries, presentation selection, and scoring.
 */

/**
 * Knowledge Management topic definitions.
 */
var KM_TOPICS = [
  { number: 1, name: 'การจัดการทรัพยากรบุคคล (Human Resource Management)' },
  { number: 2, name: 'การบริการลูกค้า (Customer Service)' },
  { number: 3, name: 'การจัดการสินค้า (Merchandising)' },
  { number: 4, name: 'การจัดการผลกำไรขาดทุน (Profit & Loss)' },
  { number: 5, name: 'ความปลอดภัยอาหาร (Food Safety)' },
  { number: 6, name: 'ความปลอดภัยการปฏิบัติงาน (Work Safety)' }
];

/**
 * Gets all 6 KM entries for a student.
 * Returns entries for all 6 topics, creating empty placeholders for missing ones.
 * @param {string} userId - Student user ID
 * @return {Object} Result with entries array
 */
function getKnowledgeEntries(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'กรุณาระบุ userId' };
    }

    var existingEntries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });

    var entries = [];
    for (var i = 0; i < KM_TOPICS.length; i++) {
      var topic = KM_TOPICS[i];
      var found = null;

      for (var j = 0; j < existingEntries.length; j++) {
        if (Number(existingEntries[j].topicNumber) === topic.number) {
          found = existingEntries[j];
          break;
        }
      }

      if (found) {
        // Parse presentation score detail if it's a string
        var scoreDetail = found.presentationScoreDetail;
        if (scoreDetail && typeof scoreDetail === 'string') {
          try {
            scoreDetail = JSON.parse(scoreDetail);
          } catch (e) {
            scoreDetail = null;
          }
        }

        entries.push({
          id: found.id,
          userId: found.userId,
          topicNumber: Number(found.topicNumber),
          topicName: found.topicName || topic.name,
          keyTakeaways: found.keyTakeaways || '',
          challenges: found.challenges || '',
          knowledgeApply: found.knowledgeApply || '',
          feedback: found.feedback || '',
          isSelectedForPresentation: String(found.isSelectedForPresentation) === 'true',
          presentationScore: found.presentationScore || '',
          presentationScoreDetail: scoreDetail,
          evaluatorId: found.evaluatorId || '',
          hasContent: !!(found.keyTakeaways || found.challenges || found.knowledgeApply || found.feedback),
          createdAt: found.createdAt || '',
          updatedAt: found.updatedAt || ''
        });
      } else {
        entries.push({
          id: null,
          userId: userId,
          topicNumber: topic.number,
          topicName: topic.name,
          keyTakeaways: '',
          challenges: '',
          knowledgeApply: '',
          feedback: '',
          isSelectedForPresentation: false,
          presentationScore: '',
          presentationScoreDetail: null,
          evaluatorId: '',
          hasContent: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    }

    return { success: true, data: entries };
  } catch (err) {
    Logger.log('Error in getKnowledgeEntries: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Knowledge Management ได้: ' + err.message };
  }
}

/**
 * Saves or updates a KM entry for a specific topic.
 * @param {string} userId - Student user ID
 * @param {number} topicNumber - Topic number (1-6)
 * @param {Object} data - Entry data: keyTakeaways, challenges, knowledgeApply, feedback
 * @return {Object} Result with saved entry
 */
function saveKnowledgeEntry(userId, topicNumber, data) {
  try {
    if (!userId || !topicNumber) {
      return { success: false, message: 'กรุณาระบุ userId และ topicNumber' };
    }

    topicNumber = Number(topicNumber);
    if (topicNumber < 1 || topicNumber > 6) {
      return { success: false, message: 'topicNumber ต้องอยู่ระหว่าง 1-6' };
    }

    // Find topic name
    var topicName = '';
    for (var i = 0; i < KM_TOPICS.length; i++) {
      if (KM_TOPICS[i].number === topicNumber) {
        topicName = KM_TOPICS[i].name;
        break;
      }
    }

    // Check for existing entry
    var existingEntries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });
    var existing = null;
    for (var j = 0; j < existingEntries.length; j++) {
      if (Number(existingEntries[j].topicNumber) === topicNumber) {
        existing = existingEntries[j];
        break;
      }
    }

    var result;
    if (existing) {
      // Update existing entry
      result = updateRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, existing.id, {
        keyTakeaways: data.keyTakeaways || '',
        challenges: data.challenges || '',
        knowledgeApply: data.knowledgeApply || '',
        feedback: data.feedback || ''
      });
    } else {
      // Create new entry
      result = appendRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, {
        userId: userId,
        topicNumber: topicNumber,
        topicName: topicName,
        keyTakeaways: data.keyTakeaways || '',
        challenges: data.challenges || '',
        knowledgeApply: data.knowledgeApply || '',
        feedback: data.feedback || '',
        isSelectedForPresentation: 'false',
        presentationScore: '',
        presentationScoreDetail: '',
        evaluatorId: ''
      });
    }

    return { success: true, data: result, message: 'บันทึกข้อมูลสำเร็จ' };
  } catch (err) {
    Logger.log('Error in saveKnowledgeEntry: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกข้อมูลได้: ' + err.message };
  }
}

/**
 * Selects a topic for final presentation.
 * Only one topic can be selected at a time.
 * @param {string} userId - Student user ID
 * @param {number} topicNumber - Topic number (1-6) to select
 * @return {Object} Result with success status
 */
function selectPresentationTopic(userId, topicNumber) {
  try {
    if (!userId || !topicNumber) {
      return { success: false, message: 'กรุณาระบุ userId และ topicNumber' };
    }

    topicNumber = Number(topicNumber);

    // Get all entries for user
    var entries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });

    // Clear existing selections and set the new one
    for (var i = 0; i < entries.length; i++) {
      var isSelected = Number(entries[i].topicNumber) === topicNumber;
      if (String(entries[i].isSelectedForPresentation) === 'true' || isSelected) {
        updateRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, entries[i].id, {
          isSelectedForPresentation: isSelected ? 'true' : 'false'
        });
      }
    }

    // If the topic entry doesn't exist yet, create it with selection
    var topicExists = false;
    for (var j = 0; j < entries.length; j++) {
      if (Number(entries[j].topicNumber) === topicNumber) {
        topicExists = true;
        break;
      }
    }

    if (!topicExists) {
      var topicName = '';
      for (var k = 0; k < KM_TOPICS.length; k++) {
        if (KM_TOPICS[k].number === topicNumber) {
          topicName = KM_TOPICS[k].name;
          break;
        }
      }

      appendRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, {
        userId: userId,
        topicNumber: topicNumber,
        topicName: topicName,
        keyTakeaways: '',
        challenges: '',
        knowledgeApply: '',
        feedback: '',
        isSelectedForPresentation: 'true',
        presentationScore: '',
        presentationScoreDetail: '',
        evaluatorId: ''
      });
    }

    return { success: true, message: 'เลือกหัวข้อนำเสนอสำเร็จ' };
  } catch (err) {
    Logger.log('Error in selectPresentationTopic: ' + err.message);
    return { success: false, message: 'ไม่สามารถเลือกหัวข้อได้: ' + err.message };
  }
}

/**
 * Scores a student's KM presentation.
 * @param {string} userId - Student user ID
 * @param {string} evaluatorId - Evaluator user ID
 * @param {Object} scores - Scoring object: { format, content, timeManagement, presentationSkill, qaSkill } (each 1-10)
 * @return {Object} Result with calculated score
 */
function scorePresentationKM(userId, evaluatorId, scores) {
  try {
    if (!userId || !evaluatorId || !scores) {
      return { success: false, message: 'กรุณาระบุข้อมูลที่จำเป็น' };
    }

    var format = Number(scores.format) || 0;
    var content = Number(scores.content) || 0;
    var timeManagement = Number(scores.timeManagement) || 0;
    var presentationSkill = Number(scores.presentationSkill) || 0;
    var qaSkill = Number(scores.qaSkill) || 0;

    // Validate range 1-10
    var allScores = [format, content, timeManagement, presentationSkill, qaSkill];
    for (var v = 0; v < allScores.length; v++) {
      if (allScores[v] < 1 || allScores[v] > 10) {
        return { success: false, message: 'คะแนนแต่ละด้านต้องอยู่ระหว่าง 1-10' };
      }
    }

    // Calculate weighted total: format*0.15 + content*0.40 + time*0.15 + skill*0.15 + qa*0.15
    var weightedScore = (format * 0.15) + (content * 0.40) + (timeManagement * 0.15) +
                        (presentationSkill * 0.15) + (qaSkill * 0.15);
    // Convert to out of 100
    var totalScore = Math.round(weightedScore * 10);

    // Find the selected presentation entry
    var entries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });
    var selectedEntry = null;
    for (var i = 0; i < entries.length; i++) {
      if (String(entries[i].isSelectedForPresentation) === 'true') {
        selectedEntry = entries[i];
        break;
      }
    }

    if (!selectedEntry) {
      return { success: false, message: 'นักศึกษายังไม่ได้เลือกหัวข้อนำเสนอ' };
    }

    var scoreDetail = JSON.stringify({
      format: format,
      content: content,
      timeManagement: timeManagement,
      presentationSkill: presentationSkill,
      qaSkill: qaSkill,
      weightedScore: weightedScore,
      totalScore: totalScore
    });

    updateRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, selectedEntry.id, {
      presentationScore: totalScore,
      presentationScoreDetail: scoreDetail,
      evaluatorId: evaluatorId
    });

    return {
      success: true,
      message: 'บันทึกคะแนนสำเร็จ',
      data: {
        format: format,
        content: content,
        timeManagement: timeManagement,
        presentationSkill: presentationSkill,
        qaSkill: qaSkill,
        weightedScore: weightedScore,
        totalScore: totalScore
      }
    };
  } catch (err) {
    Logger.log('Error in scorePresentationKM: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกคะแนนได้: ' + err.message };
  }
}

/**
 * Gets KM summary for a student.
 * @param {string} userId - Student user ID
 * @return {Object} Summary: topics completed, selected topic, presentation score
 */
function getKnowledgeSummary(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'กรุณาระบุ userId' };
    }

    var entriesResult = getKnowledgeEntries(userId);
    if (!entriesResult.success) {
      return entriesResult;
    }

    var entries = entriesResult.data;
    var completedTopics = 0;
    var selectedTopic = null;
    var presentationScore = null;

    for (var i = 0; i < entries.length; i++) {
      if (entries[i].hasContent) {
        completedTopics++;
      }
      if (entries[i].isSelectedForPresentation) {
        selectedTopic = {
          topicNumber: entries[i].topicNumber,
          topicName: entries[i].topicName
        };
        if (entries[i].presentationScore) {
          presentationScore = Number(entries[i].presentationScore);
        }
      }
    }

    return {
      success: true,
      data: {
        totalTopics: 6,
        completedTopics: completedTopics,
        selectedTopic: selectedTopic,
        presentationScore: presentationScore,
        progressPercent: Math.round((completedTopics / 6) * 100)
      }
    };
  } catch (err) {
    Logger.log('Error in getKnowledgeSummary: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงสรุปได้: ' + err.message };
  }
}

/**
 * Admin: gets all students' KM status.
 * @return {Object} Result with array of student KM summaries
 */
function getAllKnowledgeSummaries() {
  try {
    var students = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT });

    var results = [];
    for (var i = 0; i < students.length; i++) {
      var student = students[i];
      if (String(student.isActive) === 'false') continue;

      var summary = getKnowledgeSummary(student.id);

      results.push({
        userId: student.id,
        name: (student.firstName || '') + ' ' + (student.lastName || ''),
        studentId: student.studentId || '',
        department: student.department || '',
        km: summary.success ? summary.data : null
      });
    }

    return { success: true, data: results };
  } catch (err) {
    Logger.log('Error in getAllKnowledgeSummaries: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลภาพรวมได้: ' + err.message };
  }
}
