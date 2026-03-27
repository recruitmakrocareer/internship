/**
 * NotificationService.gs - Notification management functions
 * Handles in-app notifications and LINE messaging integration.
 */

/**
 * Gets notifications for a specific user.
 * @param {string} userId - User ID
 * @return {Object} Result with notifications array
 */
function getNotifications(userId) {
  try {
    var notifications = getRows(CONFIG.SHEETS.NOTIFICATIONS, { userId: userId });

    // Sort by creation date descending (newest first)
    notifications.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: notifications };
  } catch (err) {
    Logger.log('Error in getNotifications: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Gets count of unread notifications for a user.
 * @param {string} userId - User ID
 * @return {Object} Result with unread count
 */
function getUnreadCount(userId) {
  try {
    var unread = getRows(CONFIG.SHEETS.NOTIFICATIONS, {
      userId: userId,
      isRead: 'false'
    });

    return { success: true, data: { count: unread.length } };
  } catch (err) {
    Logger.log('Error in getUnreadCount: ' + err.message);
    return { success: false, message: 'ไม่สามารถนับการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Creates a new notification.
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, assignment, submission, review, evaluation, warning)
 * @return {Object} The created notification
 */
function createNotification(userId, title, message, type) {
  try {
    var notificationData = {
      userId: userId,
      title: title || '',
      message: message || '',
      type: type || 'info',
      isRead: 'false',
      relatedId: ''
    };

    var notification = appendRow(CONFIG.SHEETS.NOTIFICATIONS, notificationData);

    return notification;
  } catch (err) {
    Logger.log('Error in createNotification: ' + err.message);
    throw new Error('ไม่สามารถสร้างการแจ้งเตือนได้: ' + err.message);
  }
}

/**
 * Marks a single notification as read.
 * @param {string} notificationId - Notification ID
 * @return {Object} Result with success status
 */
function markAsRead(notificationId) {
  try {
    var notification = getRowById(CONFIG.SHEETS.NOTIFICATIONS, notificationId);
    if (!notification) {
      return { success: false, message: 'ไม่พบข้อมูลการแจ้งเตือน' };
    }

    updateRow(CONFIG.SHEETS.NOTIFICATIONS, notificationId, { isRead: 'true' });

    return { success: true, message: 'อ่านการแจ้งเตือนแล้ว' };
  } catch (err) {
    Logger.log('Error in markAsRead: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Marks all notifications as read for a user.
 * @param {string} userId - User ID
 * @return {Object} Result with success status and count of updated notifications
 */
function markAllAsRead(userId) {
  try {
    var unreadNotifications = getRows(CONFIG.SHEETS.NOTIFICATIONS, {
      userId: userId,
      isRead: 'false'
    });

    var count = 0;
    for (var i = 0; i < unreadNotifications.length; i++) {
      try {
        updateRow(CONFIG.SHEETS.NOTIFICATIONS, unreadNotifications[i].id, { isRead: 'true' });
        count++;
      } catch (updateErr) {
        Logger.log('Warning: Could not mark notification ' + unreadNotifications[i].id + ' as read');
      }
    }

    return { success: true, message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว', data: { updatedCount: count } };
  } catch (err) {
    Logger.log('Error in markAllAsRead: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Sends a broadcast notification to multiple users.
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string[]} recipientIds - Array of user IDs to notify
 * @param {boolean} sendLine - If true, also send via LINE messaging
 * @return {Object} Result with success status and counts
 */
function sendBroadcast(title, message, recipientIds, sendLine) {
  try {
    var user = getCurrentUser();
    if (!user || (user.role !== CONFIG.ROLES.ADMIN && user.role !== CONFIG.ROLES.MENTOR)) {
      return { success: false, message: 'คุณไม่มีสิทธิ์ส่งการแจ้งเตือน' };
    }

    if (!title || !message) {
      return { success: false, message: 'กรุณากรอกหัวข้อและข้อความ' };
    }

    var targets = recipientIds;

    // If no specific recipients, send to all active students
    if (!targets || targets.length === 0) {
      var students = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT, isActive: 'true' });
      targets = students.map(function(s) { return s.id; });
    }

    var successCount = 0;
    var lineSuccessCount = 0;

    for (var i = 0; i < targets.length; i++) {
      try {
        createNotification(targets[i], title, message, 'broadcast');
        successCount++;

        // Send LINE message if requested
        if (sendLine) {
          var targetUser = getRowById(CONFIG.SHEETS.USERS, targets[i]);
          if (targetUser && targetUser.lineUserId) {
            try {
              sendLineMessage(targetUser.lineUserId, title + '\n\n' + message);
              lineSuccessCount++;
            } catch (lineErr) {
              Logger.log('Warning: Could not send LINE message to ' + targets[i] + ': ' + lineErr.message);
            }
          }
        }
      } catch (notifErr) {
        Logger.log('Warning: Could not send notification to ' + targets[i] + ': ' + notifErr.message);
      }
    }

    var resultMessage = 'ส่งการแจ้งเตือนสำเร็จ ' + successCount + '/' + targets.length + ' คน';
    if (sendLine) {
      resultMessage += ' (LINE: ' + lineSuccessCount + ' คน)';
    }

    return {
      success: true,
      message: resultMessage,
      data: {
        totalRecipients: targets.length,
        notificationsSent: successCount,
        lineMessagesSent: lineSuccessCount
      }
    };
  } catch (err) {
    Logger.log('Error in sendBroadcast: ' + err.message);
    return { success: false, message: 'ไม่สามารถส่งการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Sends a LINE message via LINE Messaging API using UrlFetchApp.
 * Requires LINE Channel Access Token to be set in Script Properties.
 * @param {string} lineUserId - LINE user ID
 * @param {string} message - Message text to send
 * @return {boolean} True if sent successfully
 */
function sendLineMessage(lineUserId, message) {
  try {
    var lineToken = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

    if (!lineToken) {
      Logger.log('LINE_CHANNEL_ACCESS_TOKEN not set in Script Properties');
      throw new Error('ยังไม่ได้ตั้งค่า LINE Channel Access Token');
    }

    var url = 'https://api.line.me/v2/bot/message/push';
    var payload = {
      to: lineUserId,
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + lineToken
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      Logger.log('LINE API error: ' + response.getContentText());
      throw new Error('LINE API ตอบกลับ: ' + responseCode);
    }

    return true;
  } catch (err) {
    Logger.log('Error in sendLineMessage: ' + err.message);
    throw new Error('ไม่สามารถส่งข้อความ LINE ได้: ' + err.message);
  }
}
