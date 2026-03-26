import { google, sheets_v4 } from "googleapis";

let sheetsInstance: sheets_v4.Sheets | null = null;

function getSheets(): sheets_v4.Sheets {
  if (sheetsInstance) return sheetsInstance;

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsInstance = google.sheets({ version: "v4", auth });
  return sheetsInstance;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// Sheet names mapping to our data models
export const SHEETS = {
  Users: "Users",
  MentorStudents: "MentorStudents",
  Roadmaps: "Roadmaps",
  RoadmapSteps: "RoadmapSteps",
  RoadmapProgress: "RoadmapProgress",
  Assignments: "Assignments",
  Submissions: "Submissions",
  Evaluations: "Evaluations",
  Resources: "Resources",
  Notifications: "Notifications",
  ActivityLogs: "ActivityLogs",
} as const;

// Column headers for each sheet
export const HEADERS: Record<string, string[]> = {
  Users: [
    "id", "email", "password", "name", "role", "avatar", "phone", "lineUserId",
    "isActive", "createdAt", "updatedAt", "studentId", "university", "faculty",
    "major", "year", "startDate", "endDate", "company", "department", "position", "expertise",
  ],
  MentorStudents: ["id", "mentorId", "studentId", "assignedAt"],
  Roadmaps: ["id", "title", "description", "category", "isActive", "order", "createdAt", "updatedAt"],
  RoadmapSteps: [
    "id", "roadmapId", "title", "description", "content", "order", "durationDays",
    "resources", "createdAt", "updatedAt",
  ],
  RoadmapProgress: ["id", "userId", "stepId", "status", "note", "completedAt", "createdAt", "updatedAt"],
  Assignments: ["id", "title", "description", "dueDate", "maxScore", "isActive", "createdAt", "updatedAt"],
  Submissions: [
    "id", "assignmentId", "userId", "content", "fileUrl", "fileName", "status",
    "score", "feedback", "submittedAt", "reviewedAt", "updatedAt",
  ],
  Evaluations: [
    "id", "evaluatorId", "evaluateeId", "type", "period", "scores", "comment",
    "overallScore", "createdAt", "updatedAt",
  ],
  Resources: [
    "id", "title", "description", "category", "type", "url", "fileUrl", "fileName",
    "fileSize", "uploadedById", "isPublic", "createdAt", "updatedAt",
  ],
  Notifications: ["id", "userId", "title", "message", "type", "isRead", "sentViaLine", "createdAt"],
  ActivityLogs: ["id", "userId", "action", "detail", "createdAt"],
};

// Generate a cuid-like ID
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${random}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// Convert a row array to an object using headers
function rowToObject(headers: string[], row: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((header, i) => {
    obj[header] = row[i] || "";
  });
  return obj;
}

// Get all rows from a sheet as objects
export async function getAllRows(sheetName: string): Promise<Record<string, string>[]> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:ZZ`,
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => rowToObject(headers, row));
}

// Get rows with a simple filter
export async function getRows(
  sheetName: string,
  filter?: Record<string, string | undefined>
): Promise<Record<string, string>[]> {
  const allRows = await getAllRows(sheetName);
  if (!filter) return allRows;

  return allRows.filter((row) => {
    return Object.entries(filter).every(([key, value]) => {
      if (value === undefined) return true;
      return row[key] === value;
    });
  });
}

// Get a single row by ID
export async function getRowById(
  sheetName: string,
  id: string
): Promise<Record<string, string> | null> {
  const rows = await getRows(sheetName, { id });
  return rows[0] || null;
}

// Find the row index (1-based, including header) for a given ID
async function findRowIndex(sheetName: string, id: string): Promise<number> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
  });

  const rows = response.data.values;
  if (!rows) return -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) return i + 1; // 1-based for Sheets API
  }
  return -1;
}

// Append a new row
export async function appendRow(
  sheetName: string,
  data: Record<string, string | number | boolean | null | undefined>
): Promise<Record<string, string>> {
  const sheets = getSheets();
  const headers = HEADERS[sheetName];
  if (!headers) throw new Error(`Unknown sheet: ${sheetName}`);

  const id = data.id?.toString() || generateId();
  const now = nowISO();

  const fullData: Record<string, string> = {};
  headers.forEach((header) => {
    if (header === "id") {
      fullData[header] = id;
    } else if (header === "createdAt" && !data.createdAt) {
      fullData[header] = now;
    } else if (header === "updatedAt" && !data.updatedAt) {
      fullData[header] = now;
    } else if (data[header] !== undefined && data[header] !== null) {
      fullData[header] = String(data[header]);
    } else {
      fullData[header] = "";
    }
  });

  const row = headers.map((h) => fullData[h] || "");

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return fullData;
}

// Update a row by ID
export async function updateRow(
  sheetName: string,
  id: string,
  data: Record<string, string | number | boolean | null | undefined>
): Promise<Record<string, string> | null> {
  const sheets = getSheets();
  const headers = HEADERS[sheetName];
  if (!headers) throw new Error(`Unknown sheet: ${sheetName}`);

  const rowIndex = await findRowIndex(sheetName, id);
  if (rowIndex === -1) return null;

  // Get current row
  const current = await getRowById(sheetName, id);
  if (!current) return null;

  // Merge with updates
  const updated: Record<string, string> = { ...current };
  Object.entries(data).forEach(([key, value]) => {
    if (headers.includes(key) && value !== undefined) {
      updated[key] = value === null ? "" : String(value);
    }
  });
  updated.updatedAt = nowISO();

  const row = headers.map((h) => updated[h] || "");

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex}:${String.fromCharCode(64 + headers.length)}${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return updated;
}

// Delete a row by ID (actually removes the row)
export async function deleteRow(sheetName: string, id: string): Promise<boolean> {
  const sheets = getSheets();

  // Get sheet ID (gid)
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) return false;

  const rowIndex = await findRowIndex(sheetName, id);
  if (rowIndex === -1) return false;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-based
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });

  return true;
}

// Initialize all sheets with headers
export async function initializeSheets(): Promise<void> {
  const sheets = getSheets();

  // Get existing sheets
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const existingSheets = spreadsheet.data.sheets?.map(
    (s) => s.properties?.title
  ) || [];

  // Create missing sheets
  const sheetsToCreate = Object.values(SHEETS).filter(
    (name) => !existingSheets.includes(name)
  );

  if (sheetsToCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: sheetsToCreate.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
  }

  // Add headers to sheets that need them
  for (const [sheetName, headers] of Object.entries(HEADERS)) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }
  }

  // Remove default Sheet1 if it exists and is not needed
  if (existingSheets.includes("Sheet1") && !Object.values(SHEETS).includes("Sheet1" as never)) {
    const sheet1 = spreadsheet.data.sheets?.find(s => s.properties?.title === "Sheet1");
    if (sheet1?.properties?.sheetId !== undefined) {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{ deleteSheet: { sheetId: sheet1.properties.sheetId } }],
          },
        });
      } catch {
        // Ignore if can't delete (might be the only sheet initially)
      }
    }
  }
}

// Utility: count rows matching filter
export async function countRows(
  sheetName: string,
  filter?: Record<string, string | undefined>
): Promise<number> {
  const rows = await getRows(sheetName, filter);
  return rows.length;
}

// Utility: search rows by partial text match in a field
export async function searchRows(
  sheetName: string,
  field: string,
  query: string
): Promise<Record<string, string>[]> {
  const allRows = await getAllRows(sheetName);
  const lowerQuery = query.toLowerCase();
  return allRows.filter((row) => row[field]?.toLowerCase().includes(lowerQuery));
}
