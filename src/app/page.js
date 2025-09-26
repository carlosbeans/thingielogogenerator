"use client";

import "./globals.css";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useCallback, useEffect } from "react";

//motion library
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";

//import components
import Footer from "./Footer";

const STORAGE_KEY = "svg_files_storage";

export default function Home() {
     /* ---- CREATE CONTENT STATES ---- */

     //drag and drop states
     const [isDragging, setIsDragging] = useState(false);
     const [fileName, setFileName] = useState(null);
     const [storedFiles, setStoredFiles] = useState([]);
     const [selectedFileId, setSelectedFileId] = useState(null);
     const [blob, setBlob] = useState(null);
     const fileInputRef = useRef(null);
     const dropZoneRef = useRef(null);
     const [uploadStatus, setUploadStatus] = useState("preUpload"); // 'preUpload', 'uploading', 'postUpload', 'uploadError'
     const [showCTAs, setShowCTAs] = useState(false);

     const triggerFileInput = () => {
          fileInputRef.current?.click();
     };

     const handleFileInput = (e) => {
          const files = e.target.files;
          if (files.length) {
               handleFiles(files);
          }
     };

     //post-upload CTA hover states
     const replayVariants = {
          hover: {
               rotate: "-180deg",
               transition: { duration: 0.3, ease: "easeOut" },
          },
          initial: {
               rotate: "0deg",
               transition: { duration: 0.5, ease: "easeIn" },
          },
     };

     const uploadIconVariants = {
          hover: {
               y: -4,
               transition: { duration: 0.3, ease: "easeOut" },
          },
          initial: {
               y: 0,
               transition: { duration: 0.5, ease: "easeIn" },
          },
     };

     //upload content states
     const uploadStates = {
          preUpload: (
               <motion.div
                    ref={dropZoneRef}
                    className="dragRegion text-center w-1/3  hover:backdrop-blur-sm hover:bg-white/2 p-16 m-24 flex flex-col items-center gap-4 rounded-lg transition-colors duration-200"
                    onClick={triggerFileInput}
                    initial="initial"
                    whileHover="hover"
               >
                    <input
                         ref={fileInputRef}
                         type="file"
                         className="hidden"
                         accept=".png"
                         onChange={handleFileInput}
                    />

                    <motion.div className="arrowContainer rounded-full border-1 border-accentColor w-10 h-10 flex items-center justify-center">
                         <motion.img
                              variants={uploadIconVariants}
                              src="/icon-uploadArrow.svg"
                              alt="Upload a PNG"
                              className="arrowUp w-10 h-10"
                         />
                    </motion.div>
                    <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         duration={1}
                         exit={{ opacity: 0 }}
                         className="text-3xl uppercase stretch mt-1"
                    >
                         Thingify your shit
                    </motion.div>
                    <div className="disclaimer text-gray-500 text-xs uppercase tracking-wider">
                         Upload a hi-res transparent PNG
                    </div>
               </motion.div>
          ),
          animationComplete: (
               <motion.div>
                    <div className="flex row justify-between gap-21 place-items-center text-3xl uppercase">
                         <motion.div
                              className="replay flex row gap-8 place-items-center p-2"
                              initial="initial"
                              whileHover="hover"
                         >
                              <motion.div className="border-1 border-accentColor rounded-full">
                                   <motion.img
                                        src="/icon-replay.svg"
                                        alt="Replay"
                                        className="replayIcon w-10 h-10"
                                        variants={replayVariants}
                                   />
                              </motion.div>
                              <motion.div className="replayText translate-y-1 stretch">
                                   Replay
                              </motion.div>
                         </motion.div>
                         <motion.div
                              className="newFile flex row gap-8 place-items-center p-2 cursor-pointer"
                              initial="initial"
                              whileHover="hover"
                         >
                              <motion.div className="border-1 border-accentColor rounded-full">
                                   <motion.img
                                        src="/icon-uploadArrow.svg"
                                        alt="Upload a new file"
                                        className="uploadIcon w-10 h-10"
                                        variants={uploadIconVariants}
                                   />
                              </motion.div>
                              <motion.div className="newFileText translate-y-1 stretch">
                                   New File
                              </motion.div>
                         </motion.div>
                    </div>
               </motion.div>
          ),
          uploading: (
               <motion.div className="uploading text-center text-3xl uppercase">
                    Why don’t we just... wait here for a little while... see what happens?
               </motion.div>
          ),
          uploadError: (
               <motion.div className="uploadError text-center text-3xl uppercase">
                    Something went wrong
               </motion.div>
          ),
     };

     // Function to convert stored content to File object with guaranteed type detection
     function getStoredFileAsFile(fileData) {
          if (!fileData || !fileData.content) return null;

          // Determine MIME type based on file extension
          let mimeType = "image/svg+xml"; // default
          if (fileData.name.toLowerCase().endsWith(".png")) {
               mimeType = "image/png";
          }

          // For SVG files, ensure the content is properly formatted
          let content = fileData.content;
          if (mimeType === "image/svg+xml" && !content.includes("<?xml")) {
               // Ensure SVG has proper XML declaration if missing
               content = '<?xml version="1.0" encoding="UTF-8"?>' + content;
          }

          // Create Blob with explicit type
          const blob = new Blob([content], { type: mimeType });

          // Create File object - some browsers need this specific approach
          const file = new File([blob], fileData.name, {
               type: mimeType,
               lastModified: fileData.lastModified || Date.now(),
          });

          // Double-check and force the type property if needed
          if (!file.type) {
               Object.defineProperty(file, "type", { value: mimeType });
          }

          return file;
     }

     // useEffect to setUpladStatus to "animationComplete" when showCTAs is true
     useEffect(() => {
          if (showCTAs) {
               setUploadStatus("animationComplete");
          }
     }, [showCTAs]);

     // Load files from localStorage on component mount
     useEffect(() => {
          try {
               const stored = localStorage.getItem(STORAGE_KEY);
               if (stored) {
                    const parsedFiles = JSON.parse(stored);
                    setStoredFiles(parsedFiles);

                    const lastSelected = localStorage.getItem(STORAGE_KEY + "_selected");
                    if (lastSelected) {
                         const selectedFile = parsedFiles.find((f) => f.id === lastSelected);
                         if (selectedFile) {
                              setSelectedFileId(lastSelected);
                              setFileName(selectedFile.name);

                              // Create data URL directly from stored base64 content
                              const dataUrl = `data:${selectedFile.type};base64,${selectedFile.content}`;
                              setBlob(dataUrl);
                         }
                    }
               }
          } catch (error) {
               console.error("Error loading files from localStorage:", error);
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

     const handleFiles = async (files) => {
          const file = files[0];

          if (file?.type === "image/svg+xml" || file?.type === "image/png") {
               try {
                    // Set to uploading state
                    setUploadStatus("uploading");

                    // Check if file already exists (by name and size)
                    const existingFile = storedFiles.find(
                         (f) => f.name === file.name && f.size === file.size
                    );

                    if (existingFile) {
                         // File already exists, just select it
                         setSelectedFileId(existingFile.id);
                         setFileName(existingFile.name);

                         // Create data URL from stored base64 content for immediate use
                         const dataUrl = `data:${existingFile.type};base64,${existingFile.content}`;
                         setBlob(dataUrl);

                         // Wait for 3 seconds before finishing
                         await new Promise((resolve) => setTimeout(resolve, 3000));

                         // Set to post-upload state
                         setUploadStatus("postUpload");
                         return;
                    }

                    // Read file as array buffer for proper base64 conversion
                    const arrayBuffer = await file.arrayBuffer();

                    // Convert to base64
                    const base64 = btoa(
                         new Uint8Array(arrayBuffer).reduce(
                              (data, byte) => data + String.fromCharCode(byte),
                              ""
                         )
                    );

                    // Create data URL for immediate texture usage
                    const dataUrl = `data:${file.type};base64,${base64}`;
                    setBlob(dataUrl);

                    // Create file object for storage with base64 content
                    const fileData = {
                         id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9),
                         name: file.name,
                         content: base64, // Store as base64 string
                         size: file.size,
                         type: file.type,
                         uploadDate: new Date().toISOString(),
                         isBase64: true, // Flag to indicate base64 encoding
                    };

                    // Check localStorage quota before adding
                    const estimatedSize = fileData.content.length; // Base64 is about 1.37x original size
                    const currentSize = storedFiles.reduce(
                         (total, file) => total + file.content.length,
                         0
                    );

                    // localStorage typically has 5-10MB limit
                    if (currentSize + estimatedSize > 5 * 1024 * 1024) {
                         alert("Storage limit would be exceeded. Please delete some files first.");
                         URL.revokeObjectURL(dataUrl);
                         setUploadStatus("uploadError");
                         return;
                    }

                    // Add to stored files
                    setStoredFiles((prev) => [...prev, fileData]);
                    setFileName(file.name);
                    setSelectedFileId(fileData.id);

                    // Set to post-upload state
                    setUploadStatus("postUpload");
               } catch (error) {
                    console.error("Error processing file:", error);
                    alert("Error processing file: " + error.message);
                    setUploadStatus("uploadError");
               }
          } else {
               setFileName(null);
               alert("Please upload an SVG or PNG file");
               setUploadStatus("uploadError");
          }
     };

     // Replace with arrayBuffer reading for images
     const readFileAsArrayBuffer = (file) => {
          return new Promise((resolve, reject) => {
               const reader = new FileReader();
               reader.onload = (e) => resolve(e.target.result);
               reader.onerror = (e) => reject(new Error("Failed to read file"));
               reader.readAsArrayBuffer(file);
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
                              <Scene
                                   blob={blob}
                                   uploadStatus={uploadStatus}
                                   setShowCTAs={setShowCTAs}
                              />
                         </Canvas>

                         <AnimatePresence mode="wait">
                              <motion.div
                                   key={uploadStatus}
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   className="logoUploadContainer absolute h-screen items-center w-screen flex justify-center"
                              >
                                   {uploadStates[uploadStatus]}
                              </motion.div>
                         </AnimatePresence>
                    </div>
                    <Footer />
               </div>
          </main>
     );
}
