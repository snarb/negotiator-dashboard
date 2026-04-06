import Database from 'better-sqlite3';

declare global {
  var _sqliteDb: ReturnType<typeof Database> | undefined;
}

export function getDb() {
  if (globalThis._sqliteDb) return globalThis._sqliteDb;

  const dbPath = process.env.DB_PATH;
  
  if (!dbPath) {
    throw new Error('DB_PATH environment variable is perfectly required to run this dashboard.');
  }

  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  

  if (process.env.NODE_ENV !== 'production') {
    globalThis._sqliteDb = db;
  }

  return db;
}
