// Google Sheet backup for Education Support registrations (server only).
import { SHEET_TAB, columnLetter, fromSheetRow, sheetHeaders, toSheetRow, type SheetRecord } from "./sheet";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

function config() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const sheetsKey = process.env["GOOGLE_SHEETS_API_KEY"];
  const sheetId = process.env["EDUCATION_SHEET_ID"];
  if (!lovableKey || !sheetsKey || !sheetId) throw new Error("Google Sheet backup is not configured.");
  return { lovableKey, sheetsKey, sheetId };
}

async function sheets<T>(path: string, init: { method?: string; body?: unknown; query?: Record<string, string | string[]> } = {}): Promise<T> {
  const { lovableKey, sheetsKey, sheetId } = config();
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(init.query ?? {})) for (const one of Array.isArray(v) ? v : [v]) params.append(k, one);
  const qs = params.toString();
  const res = await fetch(`${GATEWAY_URL}/spreadsheets/${sheetId}${path}${qs ? `?${qs}` : ""}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": sheetsKey, "Content-Type": "application/json" },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Google Sheet request failed [${res.status}]: ${text}`);
    throw new Error(`Google Sheet request failed [${res.status}]`);
  }
  return res.json() as Promise<T>;
}

type ValueRange = { range?: string; values?: string[][] };

/** Grow the Responses tab when new columns are needed (Google rejects writes beyond the grid). */
async function ensureColumns(count: number) {
  const meta = await sheets<{ sheets?: { properties?: { sheetId?: number; title?: string; gridProperties?: { columnCount?: number } } }[] }>("", { query: { fields: "sheets.properties" } });
  const tab = meta.sheets?.find(t => t.properties?.title === SHEET_TAB)?.properties;
  const have = tab?.gridProperties?.columnCount ?? 0;
  if (tab?.sheetId === undefined || have >= count) return;
  await sheets(":batchUpdate", { method: "POST", body: { requests: [{ appendDimension: { sheetId: tab.sheetId, dimension: "COLUMNS", length: count - have } }] } });
}

async function readHeader(): Promise<string[]> {
  const r = await sheets<ValueRange>(`/values/${SHEET_TAB}!1:1`);
  const header = r.values?.[0] ?? [];
  if (header.length) {
    // Columns added in later versions go to the end of the existing header row.
    const have = new Set(header.map(h => h.trim().toLowerCase()));
    const missing = sheetHeaders().filter(h => !have.has(h.toLowerCase()));
    if (!missing.length) return header;
    const start = header.length + 1;
    await ensureColumns(start + missing.length - 1);
    await sheets(`/values/${SHEET_TAB}!${columnLetter(start)}1:${columnLetter(start + missing.length - 1)}1`, { method: "PUT", query: { valueInputOption: "RAW" }, body: { values: [missing] } });
    return [...header, ...missing];
  }
  const fresh = sheetHeaders();
  await sheets(`/values/${SHEET_TAB}!A1:${columnLetter(fresh.length)}1`, { method: "PUT", query: { valueInputOption: "RAW" }, body: { values: [fresh] } });
  return fresh;
}

/** Add one or more registrations as new rows. */
export async function appendSheetRecords(records: SheetRecord[]) {
  if (!records.length) return;
  const header = await readHeader();
  await sheets(`/values/${SHEET_TAB}!A1:append`, {
    method: "POST", query: { valueInputOption: "RAW", insertDataOption: "INSERT_ROWS" },
    body: { values: records.map(r => toSheetRow(r, header)) },
  });
}

/** Find a registration by acknowledgement number. Returns the 1-based sheet row too. */
export async function findSheetRecord(ackNumber: string): Promise<{ rowNumber: number; header: string[]; record: SheetRecord } | null> {
  const batch = await sheets<{ valueRanges?: ValueRange[] }>(`/values:batchGet`, { query: { ranges: [`${SHEET_TAB}!1:1`, `${SHEET_TAB}!A:A`] } });
  const header = batch.valueRanges?.[0]?.values?.[0] ?? [];
  const ackCol = header.findIndex(h => h.trim().toLowerCase() === "acknowledgement no");
  if (ackCol !== 0) {
    // The acknowledgement column was moved; read the whole sheet instead.
    const all = await readAllSheetRecords();
    return all.find(a => a.record.meta.ackNumber === ackNumber) ?? null;
  }
  const column = batch.valueRanges?.[1]?.values ?? [];
  let index = -1;
  for (let i = column.length - 1; i >= 1; i--) if ((column[i]?.[0] ?? "").trim() === ackNumber) { index = i; break; }
  if (index < 0) return null;
  const rowNumber = index + 1;
  const row = await sheets<ValueRange>(`/values/${SHEET_TAB}!A${rowNumber}:${columnLetter(Math.max(header.length, 1))}${rowNumber}`);
  return { rowNumber, header, record: fromSheetRow(header, row.values?.[0] ?? []) };
}

export async function readAllSheetRecords(): Promise<{ rowNumber: number; header: string[]; record: SheetRecord }[]> {
  const r = await sheets<ValueRange>(`/values/${SHEET_TAB}`);
  const [header = [], ...rows] = r.values ?? [];
  return rows.map((row, i) => ({ rowNumber: i + 2, header, record: fromSheetRow(header, row) })).filter(x => x.record.meta.ackNumber);
}

/** Overwrite rows in place (one request for all rows). */
export async function writeSheetRows(rows: { rowNumber: number; header: string[]; record: SheetRecord }[]) {
  if (!rows.length) return;
  const header = await readHeader();
  rows = rows.map(r => ({ ...r, header }));
  await sheets(`/values:batchUpdate`, {
    method: "POST",
    body: { valueInputOption: "RAW", data: rows.map(r => ({ range: `${SHEET_TAB}!A${r.rowNumber}:${columnLetter(r.header.length)}${r.rowNumber}`, values: [toSheetRow(r.record, r.header)] })) },
  });
}

/** Update the row for this acknowledgement number, or add it when missing. */
export async function upsertSheetRecord(record: SheetRecord) {
  const found = await findSheetRecord(record.meta.ackNumber);
  if (found) await writeSheetRows([{ ...found, record }]);
  else await appendSheetRecords([record]);
}
