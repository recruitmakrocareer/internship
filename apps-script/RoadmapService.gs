/**
 * RoadmapService.gs - Roadmap management functions
 * Handles roadmaps, steps, and student progress tracking.
 */

/**
 * Gets all active roadmaps with their steps.
 * @return {Object} Result with roadmaps array (each with steps)
 */
function getRoadmaps() {
  try {
    var roadmaps = getRows(CONFIG.SHEETS.ROADMAPS, { isActive: 'true' });
    var allSteps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { isActive: 'true' });

    // Attach steps to each roadmap
    for (var i = 0; i < roadmaps.length; i++) {
      roadmaps[i].steps = allSteps.filter(function(step) {
        return String(step.roadmapId) === String(roadmaps[i].id);
      }).sort(function(a, b) {
        return Number(a.stepNumber) - Number(b.stepNumber);
      });
    }

    return { success: true, data: roadmaps };
  } catch (err) {
    Logger.log('Error in getRoadmaps: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Roadmap ได้: ' + err.message };
  }
}

/**
 * Gets a single roadmap with its steps.
 * @param {string} id - Roadmap ID
 * @return {Object} Result with roadmap data and steps
 */
function getRoadmap(id) {
  try {
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, id);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    var steps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: id, isActive: 'true' });
    steps.sort(function(a, b) {
      return Number(a.stepNumber) - Number(b.stepNumber);
    });

    roadmap.steps = steps;

    return { success: true, data: roadmap };
  } catch (err) {
    Logger.log('Error in getRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Roadmap ได้: ' + err.message };
  }
}

/**
 * Creates a new roadmap (admin only).
 * @param {Object} data - Roadmap data (title, description, department)
 * @return {Object} Result with created roadmap data
 */
function createRoadmap(data) {
  try {
    var user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return { success: false, message: 'คุณไม่มีสิทธิ์สร้าง Roadmap' };
    }

    if (!data.title) {
      return { success: false, message: 'กรุณากรอกชื่อ Roadmap' };
    }

    var roadmapData = {
      title: data.title.trim(),
      description: data.description || '',
      department: data.department || '',
      isActive: 'true',
      createdBy: user.id
    };

    var newRoadmap = appendRow(CONFIG.SHEETS.ROADMAPS, roadmapData);

    return { success: true, data: newRoadmap, message: 'สร้าง Roadmap สำเร็จ' };
  } catch (err) {
    Logger.log('Error in createRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้าง Roadmap ได้: ' + err.message };
  }
}

/**
 * Updates an existing roadmap.
 * @param {string} id - Roadmap ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated roadmap data
 */
function updateRoadmap(id, data) {
  try {
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, id);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    delete data.id;
    delete data.createdBy;
    delete data.createdAt;

    var updated = updateRow(CONFIG.SHEETS.ROADMAPS, id, data);

    return { success: true, data: updated, message: 'อัปเดต Roadmap สำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดต Roadmap ได้: ' + err.message };
  }
}

/**
 * Deletes a roadmap (soft delete by setting isActive to false).
 * @param {string} id - Roadmap ID
 * @return {Object} Result with success status
 */
function deleteRoadmap(id) {
  try {
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, id);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    updateRow(CONFIG.SHEETS.ROADMAPS, id, { isActive: 'false' });

    // Also deactivate all steps
    var steps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: id });
    for (var i = 0; i < steps.length; i++) {
      updateRow(CONFIG.SHEETS.ROADMAP_STEPS, steps[i].id, { isActive: 'false' });
    }

    return { success: true, message: 'ลบ Roadmap สำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบ Roadmap ได้: ' + err.message };
  }
}

/**
 * Creates a new step in a roadmap.
 * @param {Object} data - Step data (roadmapId, stepNumber, title, description, dueDate)
 * @return {Object} Result with created step data
 */
function createRoadmapStep(data) {
  try {
    if (!data.roadmapId || !data.title) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็น' };
    }

    // Verify roadmap exists
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, data.roadmapId);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    // Auto-assign step number if not provided
    if (!data.stepNumber) {
      var existingSteps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: data.roadmapId, isActive: 'true' });
      data.stepNumber = existingSteps.length + 1;
    }

    var stepData = {
      roadmapId: data.roadmapId,
      stepNumber: data.stepNumber,
      title: data.title.trim(),
      description: data.description || '',
      dueDate: data.dueDate || '',
      isActive: 'true',
      durationDays: data.durationDays || '',
      resources: data.resources || '',
      fileUrl: data.fileUrl || '',
      fileName: data.fileName || ''
    };

    var newStep = appendRow(CONFIG.SHEETS.ROADMAP_STEPS, stepData);

    return { success: true, data: newStep, message: 'เพิ่มขั้นตอนสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createRoadmapStep: ' + err.message);
    return { success: false, message: 'ไม่สามารถเพิ่มขั้นตอนได้: ' + err.message };
  }
}

/**
 * Updates a roadmap step.
 * @param {string} id - Step ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated step data
 */
function updateRoadmapStep(id, data) {
  try {
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, id);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    delete data.id;
    delete data.createdAt;

    var updated = updateRow(CONFIG.SHEETS.ROADMAP_STEPS, id, data);

    return { success: true, data: updated, message: 'อัปเดตขั้นตอนสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateRoadmapStep: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตขั้นตอนได้: ' + err.message };
  }
}

/**
 * Deletes a roadmap step (soft delete).
 * @param {string} id - Step ID
 * @return {Object} Result with success status
 */
function deleteRoadmapStep(id) {
  try {
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, id);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    updateRow(CONFIG.SHEETS.ROADMAP_STEPS, id, { isActive: 'false' });

    return { success: true, message: 'ลบขั้นตอนสำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteRoadmapStep: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบขั้นตอนได้: ' + err.message };
  }
}

/**
 * Gets a user's progress across all roadmaps.
 * @param {string} userId - User ID
 * @return {Object} Result with progress data grouped by roadmap
 */
function getRoadmapProgress(userId) {
  try {
    var progress = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { userId: userId });
    var roadmaps = getRows(CONFIG.SHEETS.ROADMAPS, { isActive: 'true' });
    var allSteps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { isActive: 'true' });

    var result = [];

    for (var i = 0; i < roadmaps.length; i++) {
      var roadmap = roadmaps[i];
      var steps = allSteps.filter(function(s) {
        return String(s.roadmapId) === String(roadmap.id);
      }).sort(function(a, b) {
        return Number(a.stepNumber) - Number(b.stepNumber);
      });

      var totalSteps = steps.length;
      var completedSteps = 0;

      // Attach progress to each step
      for (var j = 0; j < steps.length; j++) {
        var stepProgress = progress.filter(function(p) {
          return String(p.stepId) === String(steps[j].id);
        });

        if (stepProgress.length > 0) {
          steps[j].progress = stepProgress[0];
          if (stepProgress[0].status === 'completed') {
            completedSteps++;
          }
        } else {
          steps[j].progress = { status: 'not_started', note: '' };
        }
      }

      result.push({
        roadmap: roadmap,
        steps: steps,
        totalSteps: totalSteps,
        completedSteps: completedSteps,
        progressPercent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
      });
    }

    return { success: true, data: result };
  } catch (err) {
    Logger.log('Error in getRoadmapProgress: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลความคืบหน้าได้: ' + err.message };
  }
}

/**
 * Updates a user's progress on a roadmap step (upsert).
 * @param {string} userId - User ID
 * @param {string} stepId - Step ID
 * @param {string} status - Status (not_started, in_progress, completed)
 * @param {string} note - Optional note
 * @return {Object} Result with updated progress data
 */
function updateRoadmapProgress(userId, stepId, status, note) {
  try {
    // Get step to find roadmapId
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, stepId);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    // Check for existing progress record
    var existingProgress = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: userId,
      stepId: stepId
    });

    var result;
    var now = new Date().toISOString();

    if (existingProgress.length > 0) {
      // Update existing
      var updateData = {
        status: status,
        note: note || existingProgress[0].note,
        updatedAt: now
      };

      if (status === 'completed' && existingProgress[0].status !== 'completed') {
        updateData.completedAt = now;
      }

      result = updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existingProgress[0].id, updateData);
    } else {
      // Create new progress record
      var progressData = {
        userId: userId,
        roadmapId: step.roadmapId,
        stepId: stepId,
        status: status,
        note: note || '',
        completedAt: status === 'completed' ? now : '',
        updatedAt: now
      };

      result = appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, progressData);
    }

    return { success: true, data: result, message: 'อัปเดตความคืบหน้าสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateRoadmapProgress: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตความคืบหน้าได้: ' + err.message };
  }
}
