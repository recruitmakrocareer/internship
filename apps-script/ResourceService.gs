/**
 * ResourceService.gs - Resource/knowledge base management functions
 * Handles educational resources, documents, and links.
 */

/**
 * Gets resources with optional category and type filters.
 * @param {string} category - Optional category filter
 * @param {string} type - Optional type filter (document, video, link, etc.)
 * @return {Object} Result with resources array
 */
function getResources(category, type) {
  try {
    var resources = getRows(CONFIG.SHEETS.RESOURCES, { isActive: 'true' });

    // Apply category filter
    if (category && category.trim() !== '') {
      resources = resources.filter(function(r) {
        return String(r.category).toLowerCase() === category.toLowerCase();
      });
    }

    // Apply type filter
    if (type && type.trim() !== '') {
      resources = resources.filter(function(r) {
        return String(r.type).toLowerCase() === type.toLowerCase();
      });
    }

    // Enrich with creator info
    for (var i = 0; i < resources.length; i++) {
      if (resources[i].createdBy) {
        var creator = getRowById(CONFIG.SHEETS.USERS, resources[i].createdBy);
        if (creator) {
          resources[i].creatorName = creator.firstName + ' ' + creator.lastName;
        }
      }

      // Parse tags if it's a string
      if (typeof resources[i].tags === 'string' && resources[i].tags) {
        resources[i].tagsArray = resources[i].tags.split(',').map(function(t) {
          return t.trim();
        });
      } else {
        resources[i].tagsArray = [];
      }
    }

    // Sort by creation date descending
    resources.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: resources };
  } catch (err) {
    Logger.log('Error in getResources: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลทรัพยากรได้: ' + err.message };
  }
}

/**
 * Gets a single resource by ID.
 * @param {string} id - Resource ID
 * @return {Object} Result with resource data
 */
function getResource(id) {
  try {
    var resource = getRowById(CONFIG.SHEETS.RESOURCES, id);
    if (!resource) {
      return { success: false, message: 'ไม่พบข้อมูลทรัพยากร' };
    }

    // Get creator info
    if (resource.createdBy) {
      var creator = getRowById(CONFIG.SHEETS.USERS, resource.createdBy);
      if (creator) {
        resource.creatorName = creator.firstName + ' ' + creator.lastName;
      }
    }

    // Parse tags
    if (typeof resource.tags === 'string' && resource.tags) {
      resource.tagsArray = resource.tags.split(',').map(function(t) {
        return t.trim();
      });
    } else {
      resource.tagsArray = [];
    }

    return { success: true, data: resource };
  } catch (err) {
    Logger.log('Error in getResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลทรัพยากรได้: ' + err.message };
  }
}

/**
 * Creates a new resource.
 * @param {Object} data - Resource data (title, description, category, type, url, fileUrl, content, tags)
 * @return {Object} Result with created resource data
 */
function createResource(data) {
  try {
    var user = resolveActingUser(data.createdBy);
    if (!user) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
    }

    if (!data.title) {
      return { success: false, message: 'กรุณากรอกชื่อทรัพยากร' };
    }

    // Convert tags array to comma-separated string if needed
    var tagsStr = data.tags;
    if (Array.isArray(data.tags)) {
      tagsStr = data.tags.join(', ');
    }

    var resourceData = {
      title: data.title.trim(),
      description: data.description || '',
      category: data.category || '',
      type: data.type || 'document',
      url: data.url || '',
      fileUrl: data.fileUrl || '',
      content: data.content || '',
      tags: tagsStr || '',
      createdBy: user.id,
      isActive: 'true'
    };

    var newResource = appendRow(CONFIG.SHEETS.RESOURCES, resourceData);

    return { success: true, data: newResource, message: 'สร้างทรัพยากรสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างทรัพยากรได้: ' + err.message };
  }
}

/**
 * Updates an existing resource.
 * @param {string} id - Resource ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated resource data
 */
function updateResource(id, data) {
  try {
    var resource = getRowById(CONFIG.SHEETS.RESOURCES, id);
    if (!resource) {
      return { success: false, message: 'ไม่พบข้อมูลทรัพยากร' };
    }

    delete data.id;
    delete data.createdBy;
    delete data.createdAt;

    // Convert tags array to comma-separated string if needed
    if (Array.isArray(data.tags)) {
      data.tags = data.tags.join(', ');
    }

    var updated = updateRow(CONFIG.SHEETS.RESOURCES, id, data);

    return { success: true, data: updated, message: 'อัปเดตทรัพยากรสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตทรัพยากรได้: ' + err.message };
  }
}

/**
 * Deletes a resource (soft delete).
 * @param {string} id - Resource ID
 * @return {Object} Result with success status
 */
function deleteResource(id) {
  try {
    var resource = getRowById(CONFIG.SHEETS.RESOURCES, id);
    if (!resource) {
      return { success: false, message: 'ไม่พบข้อมูลทรัพยากร' };
    }

    updateRow(CONFIG.SHEETS.RESOURCES, id, { isActive: 'false' });

    return { success: true, message: 'ลบทรัพยากรสำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบทรัพยากรได้: ' + err.message };
  }
}
