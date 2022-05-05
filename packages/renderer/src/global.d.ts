// import { sqlite3 } from "sqlite3";

export { }

declare global {
  interface Window {
    removeLoading: () => void,
    // sqlite: sqlite3,
    dbPath: string,
    dicomParser: any
  }
}
