/**
 * Database.gs - Core database functions using SpreadsheetApp
 * Provides CRUD operations on Google Sheets as a database layer.
 */

/**
 * Gets the spreadsheet instance.
 * @return {Spreadsheet} The spreadsheet object
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
}

/**
 * Gets a sheet by name, creates it with headers if it doesn't exist.
 * @param {string} sheetName - The name of the sheet
 * @return {Sheet} The sheet object
 */
function getSheet(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  var expectedHeaders = CONFIG.HEADERS[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (expectedHeaders && expectedHeaders.length > 0) {
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  } else if (expectedHeaders && expectedHeaders.length > 0) {
    reconcileHeaders(sheet, expectedHeaders);
  }

  return sheet;
}

/**
 * Safely reconciles a sheet's header row against the expected headers.
 *
 * The project convention is that new columns are ALWAYS appended to the end of
 * the CONFIG.HEADERS arrays. This helper enforces that: it only ever extends the
 * header row with genuinely-missing trailing columns and never overwrites an
 * existing header cell. If an existing header differs from the expected header at
 * the same position (a rename/reorder), it refuses to rewrite — overwriting would
 * silently remap every data row to the wrong column — and reports the mismatch
 * instead, leaving the data intact.
 *
 * @param {Sheet} sheet - The sheet to reconcile
 * @param {string[]} expected - The expected header array from CONFIG.HEADERS
 * @return {string} A status string: 'ok', 'extended ...', or 'MISMATCH ...'
 */
function reconcileHeaders(sheet, expected) {
  var lastCol = sheet.getLastColumn();
  var current = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  // Trim trailing empty cells from the current header row.
  var currentLen = current.length;
  while (currentLen > 0 && current[currentLen - 1] === '') currentLen--;

  // Detect a true reorder/rename: any populated existing header that does not
  // match the expected header at the same position.
  for (var i = 0; i < currentLen; i++) {
    if (current[i] !== '' && current[i] !== expected[i]) {
      var msg = 'MISMATCH at col ' + (i + 1) + ': sheet has "' + current[i] +
        '" but CONFIG expects "' + expected[i] + '" — NOT rewriting to avoid data corruption';
      Logger.log('reconcileHeaders(' + sheet.getName() + '): ' + msg);
      return msg;
    }
  }

  // Existing headers are a valid prefix of expected. Append any missing columns.
  if (currentLen < expected.length) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    sheet.getRange(1, 1, 1, expected.length).setFontWeight('bold');
    if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
    return 'extended ' + currentLen + ' -> ' + expected.length + ' cols';
  }

  return 'ok (' + currentLen + ' cols)';
}

/**
 * Gets all rows from a sheet as an array of objects.
 * @param {string} sheetName - The name of the sheet
 * @return {Object[]} Array of row objects with header keys
 */
function getAllRows(sheetName) {
  try {
    var sheet = getSheet(sheetName);
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    var headers = data[0];
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        if (val instanceof Date) {
          val = val.toISOString();
        }
        row[headers[j]] = val;
      }
      rows.push(row);
    }

    return rows;
  } catch (err) {
    Logger.log('Error in getAllRows(' + sheetName + '): ' + err.message);
    return [];
  }
}

/**
 * Gets rows matching a filter object.
 * @param {string} sheetName - The name of the sheet
 * @param {Object} filter - Key-value pairs to filter by (all must match)
 * @return {Object[]} Array of matching row objects
 */
function getRows(sheetName, filter) {
  try {
    var allRows = getAllRows(sheetName);

    if (!filter || Object.keys(filter).length === 0) {
      return allRows;
    }

    return allRows.filter(function(row) {
      var keys = Object.keys(filter);
      for (var i = 0; i < keys.length; i++) {
        if (String(row[keys[i]]) !== String(filter[keys[i]])) {
          return false;
        }
      }
      return true;
    });
  } catch (err) {
    Logger.log('Error in getRows(' + sheetName + '): ' + err.message);
    return [];
  }
}

/**
 * Gets a single row by its ID.
 * @param {string} sheetName - The name of the sheet
 * @param {string} id - The ID to search for
 * @return {Object|null} The matching row object or null
 */
function getRowById(sheetName, id) {
  try {
    var allRows = getAllRows(sheetName);

    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i].id) === String(id)) {
        return allRows[i];
      }
    }

    return null;
  } catch (err) {
    Logger.log('Error in getRowById(' + sheetName + ', ' + id + '): ' + err.message);
    return null;
  }
}

/**
 * Appends a new row to a sheet with auto-generated ID and timestamps.
 * @param {string} sheetName - The name of the sheet
 * @param {Object} data - Key-value pairs of data to insert
 * @return {Object} The inserted row object with generated ID
 */
function appendRow(sheetName, data) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var sheet = getSheet(sheetName);
    var headers = CONFIG.HEADERS[sheetName];

    if (!headers) {
      throw new Error('ไม่พบ headers สำหรับชีท: ' + sheetName);
    }

    // Auto-generate ID if not provided
    if (!data.id) {
      data.id = generateId();
    }

    // Add timestamps
    var now = new Date().toISOString();
    if (headers.indexOf('createdAt') !== -1 && !data.createdAt) {
      data.createdAt = now;
    }
    if (headers.indexOf('updatedAt') !== -1 && !data.updatedAt) {
      data.updatedAt = now;
    }
    if (headers.indexOf('submittedAt') !== -1 && !data.submittedAt) {
      data.submittedAt = now;
    }
    if (headers.indexOf('assignedAt') !== -1 && !data.assignedAt) {
      data.assignedAt = now;
    }

    // Build row array matching headers
    var rowArray = headers.map(function(header) {
      return data[header] !== undefined ? data[header] : '';
    });

    sheet.appendRow(rowArray);

    // Build return object
    var result = {};
    for (var i = 0; i < headers.length; i++) {
      result[headers[i]] = rowArray[i];
    }

    return result;
  } catch (err) {
    Logger.log('Error in appendRow(' + sheetName + '): ' + err.message);
    throw new Error('ไม่สามารถเพิ่มข้อมูลได้: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Updates an existing row by ID.
 * @param {string} sheetName - The name of the sheet
 * @param {string} id - The ID of the row to update
 * @param {Object} data - Key-value pairs of data to update
 * @return {Object} The updated row object
 */
function updateRow(sheetName, id, data) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var sheet = getSheet(sheetName);
    var allData = sheet.getDataRange().getValues();
    var headers = allData[0];
    var idColIndex = headers.indexOf('id');

    if (idColIndex === -1) {
      throw new Error('ไม่พบคอลัมน์ id ในชีท: ' + sheetName);
    }

    // Find the row
    var rowIndex = -1;
    for (var i = 1; i < allData.length; i++) {
      if (String(allData[i][idColIndex]) === String(id)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('ไม่พบข้อมูล ID: ' + id);
    }

    // Update updatedAt timestamp
    if (headers.indexOf('updatedAt') !== -1) {
      data.updatedAt = new Date().toISOString();
    }

    // Update matching columns
    var currentRow = allData[rowIndex];
    for (var j = 0; j < headers.length; j++) {
      if (data[headers[j]] !== undefined) {
        currentRow[j] = data[headers[j]];
      }
    }

    // Write back (rowIndex + 1 because sheet is 1-indexed)
    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([currentRow]);

    // Build return object
    var result = {};
    for (var k = 0; k < headers.length; k++) {
      result[headers[k]] = currentRow[k];
    }

    return result;
  } catch (err) {
    Logger.log('Error in updateRow(' + sheetName + ', ' + id + '): ' + err.message);
    throw new Error('ไม่สามารถอัปเดตข้อมูลได้: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Deletes a row by ID.
 * @param {string} sheetName - The name of the sheet
 * @param {string} id - The ID of the row to delete
 * @return {boolean} True if deleted successfully
 */
function deleteRow(sheetName, id) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var sheet = getSheet(sheetName);
    var allData = sheet.getDataRange().getValues();
    var headers = allData[0];
    var idColIndex = headers.indexOf('id');

    if (idColIndex === -1) {
      throw new Error('ไม่พบคอลัมน์ id ในชีท: ' + sheetName);
    }

    for (var i = 1; i < allData.length; i++) {
      if (String(allData[i][idColIndex]) === String(id)) {
        sheet.deleteRow(i + 1); // +1 because sheet is 1-indexed
        return true;
      }
    }

    throw new Error('ไม่พบข้อมูล ID: ' + id);
  } catch (err) {
    Logger.log('Error in deleteRow(' + sheetName + ', ' + id + '): ' + err.message);
    throw new Error('ไม่สามารถลบข้อมูลได้: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Searches rows by partial text match on a specific field.
 * @param {string} sheetName - The name of the sheet
 * @param {string} field - The field/column to search in
 * @param {string} query - The search query (partial match)
 * @return {Object[]} Array of matching row objects
 */
function searchRows(sheetName, field, query) {
  try {
    var allRows = getAllRows(sheetName);

    if (!query || query.trim() === '') {
      return allRows;
    }

    var lowerQuery = String(query).toLowerCase();

    return allRows.filter(function(row) {
      var value = String(row[field] || '').toLowerCase();
      return value.indexOf(lowerQuery) !== -1;
    });
  } catch (err) {
    Logger.log('Error in searchRows(' + sheetName + '): ' + err.message);
    return [];
  }
}

/**
 * Generates a unique ID using timestamp and random characters.
 * @return {string} A unique ID string
 */
function generateId() {
  var timestamp = new Date().getTime().toString(36);
  var random = Math.random().toString(36).substring(2, 8);
  return timestamp + random;
}

function syncAllHeaders() {
  try {
    var ss = getSpreadsheet();
    var sheetNames = Object.keys(CONFIG.HEADERS);
    var results = [];
    for (var i = 0; i < sheetNames.length; i++) {
      var name = sheetNames[i];
      var expected = CONFIG.HEADERS[name];
      if (!expected || expected.length === 0) continue;
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        sheet = ss.insertSheet(name);
        sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
        sheet.getRange(1, 1, 1, expected.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
        results.push(name + ': created (' + expected.length + ' cols)');
      } else {
        results.push(name + ': ' + reconcileHeaders(sheet, expected));
      }
    }
    return { success: true, data: results };
  } catch (err) {
    Logger.log('Error in syncAllHeaders: ' + err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Counts rows matching a filter.
 * @param {string} sheetName - The name of the sheet
 * @param {Object} filter - Key-value pairs to filter by (optional)
 * @return {number} Count of matching rows
 */
function countRows(sheetName, filter) {
  try {
    if (!filter || Object.keys(filter).length === 0) {
      var sheet = getSheet(sheetName);
      var lastRow = sheet.getLastRow();
      return Math.max(0, lastRow - 1); // Subtract header row
    }

    return getRows(sheetName, filter).length;
  } catch (err) {
    Logger.log('Error in countRows(' + sheetName + '): ' + err.message);
    return 0;
  }
}
