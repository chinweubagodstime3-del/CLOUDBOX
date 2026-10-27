
const DB_NAME = "CloudBoxDatabase";
const DB_VERSION = 2;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runStoreRequest(storeName, mode, action) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let request;

    try {
      request = action(store);
    } catch (error) {
      db.close();
      reject(error);
      return;
    }

    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    }

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export function getSavedFiles() {
  return runStoreRequest("files", "readonly", (store) =>
    store.getAll()
  );
}

export function saveFile(file) {
  return runStoreRequest("files", "readwrite", (store) =>
    store.put(file)
  );
}

export function deleteSavedFile(id) {
  return runStoreRequest("files", "readwrite", (store) =>
    store.delete(id)
  );
}

export function getSavedFolders() {
  return runStoreRequest("folders", "readonly", (store) =>
    store.getAll()
  );
}

export function saveFolder(folder) {
  return runStoreRequest("folders", "readwrite", (store) =>
    store.put(folder)
  );
}

// Delete a folder and move its files to Unfiled.
export async function deleteFolderAndUnfileFiles(folderId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["files", "folders"],
      "readwrite"
    );

    const filesStore = transaction.objectStore("files");
    const foldersStore = transaction.objectStore("folders");

    let failed = false;

    const fail = (error) => {
      if (failed) return;
      failed = true;

      try {
        transaction.abort();
      } catch {
        // The transaction may already have finished.
      }

      reject(error || new Error("Could not delete the folder."));
    };

    const filesRequest = filesStore.getAll();
    const folderRequest = foldersStore.get(folderId);

    filesRequest.onerror = () => fail(filesRequest.error);
    folderRequest.onerror = () => fail(folderRequest.error);

    filesRequest.onsuccess = () => {
      if (failed) return;

      filesRequest.result.forEach((file) => {
        if (file.folderId === folderId) {
          const updateRequest = filesStore.put({
            ...file,
            folderId: "",
          });

          updateRequest.onerror = () => fail(updateRequest.error);
        }
      });
    };

    folderRequest.onsuccess = () => {
      if (failed) return;

      if (!folderRequest.result) {
        fail(new Error("This folder no longer exists."));
        return;
      }

      const deleteRequest = foldersStore.delete(folderId);
      deleteRequest.onerror = () => fail(deleteRequest.error);
    };

    transaction.oncomplete = () => {
      db.close();

      if (!failed) {
        resolve();
      }
    };

    transaction.onerror = () => {
      db.close();

      if (!failed) {
        failed = true;
        reject(
          transaction.error ||
            new Error("Storage update failed.")
        );
      }
    };

    transaction.onabort = () => {
      db.close();

      if (!failed) {
        failed = true;
        reject(
          transaction.error ||
            new Error("Storage update was cancelled.")
        );
      }
    };
  });
}
