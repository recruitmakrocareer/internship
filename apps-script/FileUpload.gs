/**
 * FileUpload.gs - Google Drive file upload and management functions
 * Handles file uploads from the frontend via base64 encoding,
 * file deletion, and file listing for the Internship Management System.
 */

/** @const {string} Root folder name in Google Drive */
var ROOT_FOLDER_NAME = 'InternshipSystem';

/** @const {number} Maximum file size in bytes (50MB) */
var MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** @const {Object} Valid subfolder names */
var SUBFOLDERS = {
  SUBMISSIONS: 'submissions',
  RESOURCES: 'resources',
  PROFILES: 'profiles',
  KNOWLEDGE: 'knowledge',
  VIDEOS: 'videos'
};

/**
 * Gets or creates a subfolder inside the root "InternshipSystem" folder.
 * If the root folder does not exist, it is created first.
 * @param {string} folderName - Name of the subfolder to get or create
 * @return {Folder} Google Drive Folder object
 */
function getOrCreateFolder(folderName) {
  var rootFolder;
  var rootFolders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);

  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
    Logger.log('Created root folder: ' + ROOT_FOLDER_NAME);
  }

  // Look for existing subfolder inside root
  var subFolders = rootFolder.getFoldersByName(folderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }

  // Create the subfolder
  var newFolder = rootFolder.createFolder(folderName);
  Logger.log('Created subfolder: ' + folderName);
  return newFolder;
}

/**
 * Uploads a file to Google Drive from base64-encoded data.
 * Files are stored in a subfolder under the root "InternshipSystem" folder.
 * @param {Object} params - Upload parameters
 * @param {string} params.fileName - Name of the file to save
 * @param {string} params.fileData - Base64-encoded file content
 * @param {string} params.mimeType - MIME type of the file (e.g. 'application/pdf')
 * @param {string} params.subfolder - Subfolder name ('submissions', 'resources', or 'profiles')
 * @return {Object} Result with file metadata or error message
 */
function uploadFile(params) {
  try {
    // Validate required parameters
    if (!params || !params.fileName || !params.fileData || !params.mimeType || !params.subfolder) {
      return { success: false, message: 'กรุณาระบุข้อมูลไฟล์ให้ครบถ้วน (fileName, fileData, mimeType, subfolder)' };
    }

    var fileName = params.fileName;
    var fileData = params.fileData;
    var mimeType = params.mimeType;
    var subfolder = params.subfolder;

    // Validate subfolder name
    var validSubfolders = [SUBFOLDERS.SUBMISSIONS, SUBFOLDERS.RESOURCES, SUBFOLDERS.PROFILES, SUBFOLDERS.KNOWLEDGE, SUBFOLDERS.VIDEOS];
    if (validSubfolders.indexOf(subfolder) === -1) {
      return {
        success: false,
        message: 'โฟลเดอร์ย่อยไม่ถูกต้อง กรุณาระบุ: submissions, resources, profiles, knowledge หรือ videos'
      };
    }

    // Strip data URL prefix if present (e.g. "data:application/pdf;base64,...")
    var base64Data = fileData;
    if (base64Data.indexOf(',') !== -1) {
      base64Data = base64Data.split(',')[1];
    }

    // Decode base64 to blob and check file size
    var decodedBytes = Utilities.base64Decode(base64Data);
    if (decodedBytes.length > MAX_FILE_SIZE_BYTES) {
      var sizeMB = (decodedBytes.length / (1024 * 1024)).toFixed(2);
      return {
        success: false,
        message: 'ขนาดไฟล์เกินขีดจำกัด (' + sizeMB + ' MB) ขนาดสูงสุดที่อนุญาตคือ 50 MB — สำหรับไฟล์ขนาดใหญ่กว่านี้ ให้อัปโหลดไฟล์ไปยัง Google Drive โดยตรง แล้ววาง URL ที่ช่อง "URL / ลิงก์" แทน'
      };
    }

    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // Get or create the target folder
    var folder = getOrCreateFolder(subfolder);

    // Create the file in Drive
    var file = folder.createFile(blob);

    // Set sharing to anyone with the link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();

    return {
      success: true,
      data: {
        fileId: fileId,
        fileUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
        fileName: fileName,
        mimeType: mimeType
      },
      message: 'อัปโหลดไฟล์สำเร็จ'
    };
  } catch (err) {
    Logger.log('Error in uploadFile: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปโหลดไฟล์ได้: ' + err.message };
  }
}

/**
 * Deletes a file from Google Drive by its file ID.
 * @param {string} fileId - Google Drive file ID
 * @return {Object} Result with success status
 */
function deleteFile(fileId) {
  try {
    if (!fileId) {
      return { success: false, message: 'กรุณาระบุรหัสไฟล์' };
    }

    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    return { success: true, message: 'ลบไฟล์สำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteFile: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบไฟล์ได้: ' + err.message };
  }
}

/**
 * Gets the view URL for a file stored in Google Drive.
 * @param {string} fileId - Google Drive file ID
 * @return {Object} Result with file URL
 */
function getFileUrl(fileId) {
  try {
    if (!fileId) {
      return { success: false, message: 'กรุณาระบุรหัสไฟล์' };
    }

    var file = DriveApp.getFileById(fileId);
    var url = 'https://drive.google.com/file/d/' + fileId + '/view';

    return {
      success: true,
      data: {
        fileId: fileId,
        fileUrl: url,
        fileName: file.getName(),
        mimeType: file.getMimeType()
      }
    };
  } catch (err) {
    Logger.log('Error in getFileUrl: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลไฟล์ได้: ' + err.message };
  }
}

/**
 * Lists all files in a subfolder under the root "InternshipSystem" folder.
 * @param {string} subfolder - Subfolder name ('submissions', 'resources', or 'profiles')
 * @return {Object} Result with array of file metadata
 */
function listFiles(subfolder) {
  try {
    if (!subfolder) {
      return { success: false, message: 'กรุณาระบุชื่อโฟลเดอร์ย่อย' };
    }

    var validSubfolders = [SUBFOLDERS.SUBMISSIONS, SUBFOLDERS.RESOURCES, SUBFOLDERS.PROFILES, SUBFOLDERS.KNOWLEDGE, SUBFOLDERS.VIDEOS];
    if (validSubfolders.indexOf(subfolder) === -1) {
      return {
        success: false,
        message: 'โฟลเดอร์ย่อยไม่ถูกต้อง กรุณาระบุ: submissions, resources, profiles, knowledge หรือ videos'
      };
    }

    var folder = getOrCreateFolder(subfolder);
    var files = folder.getFiles();
    var fileList = [];

    while (files.hasNext()) {
      var file = files.next();
      var fileId = file.getId();
      fileList.push({
        fileId: fileId,
        fileName: file.getName(),
        mimeType: file.getMimeType(),
        fileUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
        size: file.getSize(),
        createdAt: file.getDateCreated().toISOString(),
        updatedAt: file.getLastUpdated().toISOString()
      });
    }

    // Sort by creation date descending (newest first)
    fileList.sort(function(a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return { success: true, data: fileList };
  } catch (err) {
    Logger.log('Error in listFiles: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงรายการไฟล์ได้: ' + err.message };
  }
}
