export interface SavedJob {
  id: string
  fileName: string
  fileType: string
  status: string
  progress: number
  agents: string[]
  results: Record<string, any>
  timestamp: number
}

const DB_NAME = "ai_multimedia_vault"
const DB_VERSION = 1
const STORE_NAME = "jobs"

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

export async function saveJobToVault(job: SavedJob): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({ ...job, timestamp: Date.now() })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getJobsFromVault(): Promise<SavedJob[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const results = request.result as SavedJob[]
      resolve(results.sort((a, b) => b.timestamp - a.timestamp))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteJobFromVault(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
