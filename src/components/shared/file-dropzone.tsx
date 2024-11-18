import React, { useCallback, useState, useRef } from "react";

interface FileDropzoneProps {
  children: React.ReactNode;
  acceptedFileTypes: string[];
  dropText: string;
  setCurrentFiles: (files: File[]) => Promise<void>;
  multiple?: boolean;
}

export function FileDropzone({
  children,
  acceptedFileTypes,
  dropText,
  setCurrentFiles,
  multiple = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer?.files ?? [];
      if (files && files.length > 0) {
        const droppedFiles = multiple ? Array.from(files) : [files[0]];

        if (droppedFiles.length === 0 || droppedFiles === undefined) {
          alert("No files were dropped");
          throw new Error("No files dropped");
        }

        const invalidFiles = droppedFiles.filter(
          (file) =>
            !file || 
            !acceptedFileTypes.includes(file.type) &&
            !acceptedFileTypes.some((type) =>
              file.name.toLowerCase().endsWith(type.replace("*", "")),
            ),
        );

        if (invalidFiles.length > 0) {
          alert(
            `Invalid file type(s): ${invalidFiles.map((f) => f?.name).join(", ")}. Please upload supported file types.`,
          );
          throw new Error("Invalid file(s)");
        }

        setCurrentFiles(droppedFiles.filter((file) => file !== undefined))
          .then(() => {
            console.log("Files uploaded:", droppedFiles);
          })
          .catch((error) => {
            console.log("Error uploading files:", error);
          });
      }
    },
    [acceptedFileTypes, setCurrentFiles, multiple],
  );

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="h-full w-full"
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="animate-in fade-in zoom-in relative flex h-[90%] w-[90%] transform items-center justify-center rounded-xl border-2 border-dashed border-white/30 transition-all duration-200 ease-out">
            <p className="text-2xl font-semibold text-white">{dropText}</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
