
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import {
  getSavedFiles,
  saveFile,
  deleteSavedFile,
  getSavedFolders,
  saveFolder,
  deleteFolderAndUnfileFiles,
} from "../fileStorage";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [activeSection, setActiveSection] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);

  // Generate a unique ID for each file and folder.
  const createId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Log out of Firebase.
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      window.alert("Could not log out. Please try again.");
    }
  };

  // Load saved files and folders.
  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        const [savedFiles, savedFolders] = await Promise.all([
          getSavedFiles(),
          getSavedFolders(),
        ]);

        if (!cancelled) {
          setFiles(
            savedFiles.map((item) => ({
              ...item,
              uploadedAt: new Date(item.uploadedAt),
            }))
          );
          setFolders(savedFolders);
        }
      } catch (error) {
        console.error("Could not load dashboard data:", error);
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Upload files.
  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    try {
      const folderId =
        selectedFolder === "all" ? "" : selectedFolder;

      const newFiles = selectedFiles.map((file) => ({
        id: createId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type || "",
        uploadedAt: new Date(),
        folderId,
      }));

      for (const item of newFiles) {
        await saveFile(item);
      }

      setFiles((currentFiles) => [...currentFiles, ...newFiles]);
    } catch (error) {
      console.error("Could not save uploaded files:", error);
      window.alert(
        "The selected files could not be saved. Please try again."
      );
    } finally {
      event.target.value = "";
    }
  };

  // Create a folder.
  const createFolder = async (event) => {
    event.preventDefault();

    const name = newFolderName.trim();

    if (!name) {
      window.alert("Please enter a folder name.");
      return;
    }

    if (
      folders.some(
        (folder) => folder.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      window.alert("A folder with that name already exists.");
      return;
    }

    const folder = {
      id: `folder-${createId()}`,
      name,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveFolder(folder);
      setFolders((currentFolders) => [...currentFolders, folder]);
      setNewFolderName("");
      setSelectedFolder(folder.id);
      setSearchTerm("");
    } catch (error) {
      console.error("Could not create folder:", error);
      window.alert("Could not create the folder. Please try again.");
    }
  };

  const openFolder = (folderId) => {
    setSelectedFolder(folderId);
    setSearchTerm("");
  };

  const backToFolders = () => {
    setSelectedFolder("all");
    setSearchTerm("");
  };

  // Delete a folder without deleting its files.
  const handleDeleteFolder = async (folder) => {
    const confirmed = window.confirm(
      `Delete the folder "${folder.name}"?\n\n` +
        "The files inside it will be moved to Unfiled. " +
        "Your files will not be deleted."
    );

    if (!confirmed) return;

    try {
      await deleteFolderAndUnfileFiles(folder.id);

      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.folderId === folder.id
            ? { ...file, folderId: "" }
            : file
        )
      );

      setFolders((currentFolders) =>
        currentFolders.filter((item) => item.id !== folder.id)
      );

      if (selectedFolder === folder.id) {
        setSelectedFolder("all");
        setSearchTerm("");
      }

      window.alert(`Folder "${folder.name}" deleted. Your files are safe.`);
    } catch (error) {
      console.error("Could not delete folder:", error);
      window.alert("Could not delete the folder. Please try again.");
    }
  };

  // Move a file to another folder.
  const moveFileToFolder = async (fileId, folderId) => {
    const existingFile = files.find((file) => file.id === fileId);

    if (!existingFile) {
      window.alert("File not found. Please refresh and try again.");
      return;
    }

    if ((existingFile.folderId || "") === folderId) return;

    const updatedFile = {
      ...existingFile,
      folderId: folderId || "",
    };

    try {
      await saveFile(updatedFile);

      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.id === fileId ? updatedFile : file
        )
      );
    } catch (error) {
      console.error("Could not move file:", error);
      window.alert("Could not move the file. Please try again.");
    }
  };

  // Rename a file.
  const renameFile = async (file) => {
    const newName = window.prompt(
      "Enter a new name for this file:",
      file.name
    );

    if (newName === null) return;

    const trimmedName = newName.trim();

    if (!trimmedName) {
      window.alert("The file name cannot be empty.");
      return;
    }

    if (trimmedName === file.name) return;

    const updatedFile = {
      ...file,
      name: trimmedName,
    };

    try {
      await saveFile(updatedFile);

      setFiles((currentFiles) =>
        currentFiles.map((item) =>
          item.id === file.id ? updatedFile : item
        )
      );
    } catch (error) {
      console.error("Could not rename file:", error);
      window.alert("Could not rename the file. Please try again.");
    }
  };

  // Remove a file.
  const removeFile = async (id) => {
    try {
      await deleteSavedFile(id);

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== id)
      );

      setFavorites((currentFavorites) =>
        currentFavorites.filter((fileId) => fileId !== id)
      );
    } catch (error) {
      console.error("Could not remove saved file:", error);
      window.alert("The file could not be removed. Please try again.");
    }
  };

  // Toggle favorites.
  const toggleFavorite = (id) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(id)
        ? currentFavorites.filter((fileId) => fileId !== id)
        : [...currentFavorites, id]
    );
  };

  // Format file sizes.
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(bytes / 1024 ** index).toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;
  };

  // Calculate storage usage.
  const totalBytes = files.reduce(
    (total, file) => total + file.size,
    0
  );

  const storageLimit = 15 * 1024 ** 3;
  const storagePercentage = Math.min(
    (totalBytes / storageLimit) * 100,
    100
  );

  // Search and filter files.
  const searchedFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles =
    selectedFolder === "all"
      ? searchedFiles
      : searchedFiles.filter(
          (file) => (file.folderId || "") === selectedFolder
        );

  const displayedFiles =
    activeSection === "Favorites"
      ? filteredFiles.filter((file) => favorites.includes(file.id))
      : activeSection === "Recent Files"
        ? [...filteredFiles].reverse()
        : filteredFiles;

  // Download a file.
  const downloadFile = (file) => {
    if (!file.file) {
      window.alert("This file is unavailable. Please upload it again.");
      return;
    }

    const url = URL.createObjectURL(file.file);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Sidebar navigation.
  const handleNavigation = (section) => {
    setActiveSection(section);
    setSearchTerm("");
    setSelectedFolder("all");

    if (section === "Settings") return;

    const target =
      section === "Overview" ? "overview" : "files";

    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const navigationItems = [
    { label: "Overview", icon: "▦" },
    { label: "My Files", icon: "▣" },
    { label: "Recent Files", icon: "◷" },
    { label: "Favorites", icon: "♡" },
    { label: "Settings", icon: "⚙" },
  ];

  const currentFolder = folders.find(
    (folder) => folder.id === selectedFolder
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a href="/" className="dashboard-logo">
          ☁ CloudBox
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                activeSection === item.label ? "selected" : ""
              }
              onClick={() => handleNavigation(item.label)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="storage-label">
            <span>Storage</span>
            <span>{storagePercentage.toFixed(1)}%</span>
          </div>

          <div className="dashboard-storage-bar">
            <div style={{ width: `${storagePercentage}%` }} />
          </div>

          <p>{formatSize(totalBytes)} of 15 GB used</p>

          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">YOUR WORKSPACE</p>
            <h1>
              {activeSection === "Settings"
                ? "Settings"
                : activeSection}
            </h1>
          </div>

          <div className="dashboard-user">
            <div className="user-avatar">G</div>
            <span>My Account</span>
          </div>
        </header>

        {activeSection === "Settings" ? (
          <section className="files-section" id="files">
            <div className="files-heading">
              <div>
                <h2>Workspace settings</h2>
                <p>Manage your current workspace.</p>
              </div>
            </div>

            <div className="empty-files">
              <div className="empty-files-icon">⚙</div>
              <h3>CloudBox settings</h3>
              <p>
                Your account and cloud-storage settings will be
                available when account services are connected.
              </p>

              <button
                className="upload-button"
                onClick={() => handleNavigation("Overview")}
              >
                Back to overview
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="dashboard-welcome" id="overview">
              <div>
                <p>YOUR FILES, YOUR SPACE</p>
                <h2>Welcome to your workspace 👋</h2>
                <span>
                  Everything you need, organized in one place.
                </span>
              </div>

              <div className="welcome-icon">☁</div>
            </section>

            <section className="dashboard-stats">
              <article className="stat-card">
                <div className="stat-icon purple">▣</div>
                <p>Total files</p>
                <h2>{files.length}</h2>
                <span>Saved in this browser</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon blue">☁</div>
                <p>Storage used</p>
                <h2>{formatSize(totalBytes)}</h2>
                <span>Of 15 GB available</span>
              </article>

              <article className="stat-card">
                <div className="stat-icon green">♡</div>
                <p>Favorites</p>
                <h2>
                  {
                    favorites.filter((id) =>
                      files.some((file) => file.id === id)
                    ).length
                  }
                </h2>
                <span>Your favorite files</span>
              </article>
            </section>

            <section className="files-section" id="files">
              <div className="files-heading">
                <div>
                  <h2>
                    {currentFolder
                      ? currentFolder.name
                      : selectedFolder === ""
                        ? "Unfiled Files"
                        : activeSection === "Overview"
                          ? "My Files"
                          : activeSection}
                  </h2>

                  <p>
                    {currentFolder
                      ? `Files inside ${currentFolder.name}.`
                      : activeSection === "Favorites"
                        ? "Your favorite files."
                        : activeSection === "Recent Files"
                          ? "Your recently added files."
                          : "Manage the files selected from your computer."}
                  </p>
                </div>

                {selectedFolder !== "all" && (
                  <button
                    type="button"
                    className="folder-open-button"
                    onClick={backToFolders}
                  >
                    ← Back to folders
                  </button>
                )}

                <button
                  type="button"
                  className="upload-button"
                  onClick={openFilePicker}
                >
                  + Upload files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleUpload}
                />
              </div>

              <div className="folder-tools">
                <form
                  className="create-folder-form"
                  onSubmit={createFolder}
                >
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(event) =>
                      setNewFolderName(event.target.value)
                    }
                    placeholder="New folder name"
                    aria-label="New folder name"
                  />

                  <button type="submit">+ Create folder</button>
                </form>

                <label className="folder-filter">
                  <span>Show folder:</span>

                  <select
                    value={selectedFolder}
                    onChange={(event) =>
                      setSelectedFolder(event.target.value)
                    }
                  >
                    <option value="all">All files</option>
                    <option value="">Unfiled</option>

                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedFolder === "all" && folders.length > 0 && (
                <div className="folder-grid">
                  {folders.map((folder) => {
                    const folderFileCount = files.filter(
                      (file) => file.folderId === folder.id
                    ).length;

                    return (
                      <article
                        className="folder-card"
                        key={folder.id}
                      >
                        <div className="folder-card-icon">📁</div>

                        <div className="folder-card-info">
                          <strong>{folder.name}</strong>
                          <p>
                            {folderFileCount}{" "}
                            {folderFileCount === 1 ? "file" : "files"}
                          </p>
                        </div>

                        <div className="folder-card-actions">
                          <button
                            type="button"
                            className="folder-open-button"
                            onClick={() => openFolder(folder.id)}
                          >
                            Open
                          </button>

                          <button
                            type="button"
                            className="folder-delete-button"
                            onClick={() => handleDeleteFolder(folder)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="file-search">
                <input
                  type="search"
                  placeholder="Search your files..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  aria-label="Search files"
                />
              </div>

              {displayedFiles.length === 0 ? (
                <div className="empty-files">
                  <div className="empty-files-icon">☁</div>

                  <h3>
                    {searchTerm
                      ? "No matching files"
                      : activeSection === "Favorites"
                        ? "No favorites yet"
                        : selectedFolder !== "all"
                          ? "This folder is empty"
                          : "No files yet"}
                  </h3>

                  <p>
                    {searchTerm
                      ? "Try searching with a different file name."
                      : activeSection === "Favorites"
                        ? "Mark a file as a favorite to find it here."
                        : currentFolder
                          ? `Upload files to add them to ${currentFolder.name}.`
                          : selectedFolder !== "all"
                            ? "Upload a file or assign an existing file to this folder."
                            : "Select Upload files to add files from your computer."}
                  </p>

                  {!searchTerm &&
                    activeSection !== "Favorites" && (
                      <button
                        type="button"
                        className="upload-button"
                        onClick={openFilePicker}
                      >
                        Choose files
                      </button>
                    )}
                </div>
              ) : (
                <div className="uploaded-files">
                  {displayedFiles.map((file) => (
                    <article
                      className="uploaded-file"
                      key={file.id}
                    >
                      <div className="uploaded-file-icon">
                        {file.type.startsWith("image/")
                          ? "IMG"
                          : file.type.includes("pdf")
                            ? "PDF"
                            : "FILE"}
                      </div>

                      <div className="uploaded-file-info">
                        <strong>{file.name}</strong>
                        <p>
                          {formatSize(file.size)} ·{" "}
                          {new Date(file.uploadedAt).toLocaleString()}
                        </p>
                      </div>

                      <select
                        className="file-folder-select"
                        value={file.folderId || ""}
                        onChange={(event) =>
                          moveFileToFolder(
                            file.id,
                            event.target.value
                          )
                        }
                        aria-label={`Choose folder for ${file.name}`}
                      >
                        <option value="">Unfiled</option>

                        {folders.map((folder) => (
                          <option
                            key={folder.id}
                            value={folder.id}
                          >
                            {folder.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="file-action"
                        aria-label={
                          favorites.includes(file.id)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        onClick={() => toggleFavorite(file.id)}
                      >
                        {favorites.includes(file.id) ? "♥" : "♡"}
                      </button>

                      <button
                        type="button"
                        className="file-action"
                        onClick={() => downloadFile(file)}
                      >
                        Download
                      </button>

                      <button
                        type="button"
                        className="file-action"
                        onClick={() => renameFile(file)}
                      >
                        Rename
                      </button>

                      <button
                        type="button"
                        className="file-action"
                        onClick={() => removeFile(file.id)}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
