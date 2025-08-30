"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "svg_files_storage";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [storedFiles, setStoredFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [blob, setBlob] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Load files from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedFiles = JSON.parse(stored);
        setStoredFiles(parsedFiles);

        // If there's a previously selected file, restore it
        const lastSelected = localStorage.getItem(STORAGE_KEY + "_selected");
        if (lastSelected && parsedFiles.some((f) => f.id === lastSelected)) {
          setSelectedFileId(lastSelected);
          const selectedFile = parsedFiles.find((f) => f.id === lastSelected);
          setFileName(selectedFile?.name || null);
        }
      }
    } catch (error) {
      console.error("Error loading files from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + "_selected");
    }
  }, []);

  // Save files to localStorage whenever storedFiles changes
  useEffect(() => {
    try {
      if (storedFiles.length > 0) {
        // Don't save blob URLs to localStorage (they're temporary)
        const filesToSave = storedFiles.map((file) => ({
          ...file,
          blobUrl: undefined,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFiles));
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY + "_selected");
      }
    } catch (error) {
      console.error("Error saving files to localStorage:", error);
      // Handle storage quota exceeded
      if (error.name === "QuotaExceededError") {
        alert("Storage quota exceeded. Please delete some files.");
      }
    }
  }, [storedFiles]);

  // Save selected file ID to localStorage
  useEffect(() => {
    try {
      if (selectedFileId) {
        localStorage.setItem(STORAGE_KEY + "_selected", selectedFileId);
      } else {
        localStorage.removeItem(STORAGE_KEY + "_selected");
      }
    } catch (error) {
      console.error("Error saving selected file to localStorage:", error);
    }
  }, [selectedFileId]);

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFiles(files);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files.length) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = async (files) => {
    const file = files[0];

    if ((file && file.type === "image/svg+xml") || file.type === "image/png") {
      try {
        // Check if file already exists (by name and size)
        const existingFile = storedFiles.find(
          (f) => f.name === file.name && f.size === file.size
        );

        if (existingFile) {
          // File already exists, just select it
          setSelectedFileId(existingFile.id);
          setFileName(existingFile.name);
          return;
        }

        // Read file content
        const fileContent = await readFileAsText(file);

        // If you have access to the original file object
        const mimeType = file.type; // This will be either 'image/svg+xml' or 'image/png'

        // Create Blob URL for texture usage
        const blob = new Blob([fileContent], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        setBlob(blob);

        // Create file object for storage
        const fileData = {
          id:
            Date.now().toString() +
            "_" +
            Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: fileContent,
          blobUrl: blobUrl,
          size: file.size,
          lastModified: file.lastModified,
          uploadDate: new Date().toISOString(),
        };

        // Check localStorage quota before adding
        const estimatedSize = JSON.stringify(fileData).length * 2; // rough estimate
        const currentSize = JSON.stringify(storedFiles).length * 2;

        // localStorage typically has 5-10MB limit
        if (currentSize + estimatedSize > 5 * 1024 * 1024) {
          alert(
            "Storage limit would be exceeded. Please delete some files first."
          );
          return;
        }

        // Add to stored files
        const updatedFiles = [...storedFiles, fileData];
        setStoredFiles(updatedFiles);
        setFileName(file.name);
        setSelectedFileId(fileData.id);

        console.log("File stored to localStorage:", fileData.name);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing file: " + error.message);
      }
    } else {
      setFileName(null);
      alert("Please upload an SVG file");
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // Function to retrieve stored file by ID
  const getStoredFile = (fileId) => {
    return storedFiles.find((file) => file.id === fileId);
  };

  // Function to delete stored file
  const deleteStoredFile = (fileId) => {
    // Find the file to delete first (for revoking URL)
    const fileToDelete = storedFiles.find((file) => file.id === fileId);

    // Revoke blob URL to free memory
    if (fileToDelete?.blobUrl) {
      URL.revokeObjectURL(fileToDelete.blobUrl);
    }

    // Filter out the file to delete (use !== for strict comparison)
    const updatedFiles = storedFiles.filter((file) => file.id !== fileId);

    setStoredFiles(updatedFiles);

    if (selectedFileId === fileId) {
      setSelectedFileId(null);
      setFileName(null);
    }

    console.log("File deleted from localStorage");
  };

  // Function to clear all stored files
  const clearAllFiles = () => {
    // Revoke all blob URLs to free memory
    storedFiles.forEach((file) => {
      if (file.blobUrl) {
        URL.revokeObjectURL(file.blobUrl);
      }
    });

    setStoredFiles([]);
    setSelectedFileId(null);
    setFileName(null);

    // Clear from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + "_selected");
      console.log("All files cleared from localStorage");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // Function to export all files as JSON (backup)
  const exportFiles = () => {
    try {
      const dataStr = JSON.stringify(storedFiles, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "svg_files_backup.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting files:", error);
    }
  };

  // Function to import files from JSON backup
  const importFiles = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const importedFiles = JSON.parse(text);

      if (Array.isArray(importedFiles)) {
        // Merge with existing files, avoiding duplicates
        const existingIds = new Set(storedFiles.map((f) => f.id));
        const newFiles = importedFiles.filter((f) => !existingIds.has(f.id));

        setStoredFiles((prev) => [...prev, ...newFiles]);
        console.log(`Imported ${newFiles.length} files`);
      }
    } catch (error) {
      console.error("Error importing files:", error);
      alert("Error importing files: Invalid file format");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Function to get texture URL for the selected file
  const getTextureUrl = () => {
    if (!selectedFile?.blobUrl) return null;
    return selectedFile.blobUrl;
  };

  // Function to get texture URL for any file by ID
  const getTextureUrlById = (fileId) => {
    const file = getStoredFile(fileId);
    return file?.blobUrl || null;
  };

  const selectedFile = selectedFileId ? getStoredFile(selectedFileId) : null;

  // Calculate storage usage
  const storageUsage = JSON.stringify(storedFiles).length;
  const storageUsageMB = (storageUsage / (1024 * 1024)).toFixed(2);

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col h-screen">
        <div className="logoPreviewContainer h-screen flex flex-col">
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              preserveDrawingBuffer: false,
            }}
            camera={{ fov: 45 }}
          >
            <color attach="background" args={["#000000"]} />
            <OrbitControls
              enablePan={false}
              enableRotate={false}
              enableZoom={false}
              enableDamping={true}
            />
            <Scene blob={blob} />
          </Canvas>

          <div className="logoUploadContainer absolute bottom-0 w-screen flex justify-center">
            <div
              ref={dropZoneRef}
              className={`dragRegion w-1/3 backdrop-blur-sm bg-white/5 p-16 m-24 flex flex-col items-center rounded-lg transition-colors duration-200 ${
                isDragging ? "border-blue-500 bg-blue-50/30" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <div className="filePreviewContainer text-center mb-4">
                <div className="text-white bg-black/30 px-4 py-2 rounded-md">
                  {fileName || "No file selected"}
                </div>
                
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".svg,.png"
                onChange={handleFileInput}
              />

              <div className="flex flex-col items-center">
                <div className="text-white mb-4 text-center">
                  {fileName ? (
                    ""
                  ) : isDragging ? (
                    "Drop your SVG file here"
                  ) : (
                    "Drag & drop an SVG file here, or click to select"
                  )}
                </div>
              </div>

              <div className="disclaimer text-gray-500 text-xs text-center">
                For best results, use a transparent PNG or SVG
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
