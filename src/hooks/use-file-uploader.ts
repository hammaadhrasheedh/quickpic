import { useCallback } from "react";
import { type ChangeEvent, useState } from "react";
import { useClipboardPaste } from "./use-clipboard-paste";

const parseSvgFile = (content: string, fileName: string) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(content, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

  // Convert SVG content to a data URL
  const svgBlob = new Blob([content], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  return {
    content: svgUrl,
    metadata: {
      width,
      height,
      name: fileName,
    },
  };
};

const parseImageFile = (
  content: string,
  fileName: string,
): Promise<{
  content: string;
  metadata: { width: number; height: number; name: string };
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        content,
        metadata: {
          width: img.width,
          height: img.height,
          name: fileName,
        },
      });
    };
    img.src = content;
  });
};

export type FileUploaderResult = {
  /** The processed image contents as data URLs (for regular images) or object URLs (for SVGs) */
  imageContents: string[];
  /** The raw file contents as strings */
  rawContents: string[];
  /** Metadata about the uploaded images including dimensions and filenames */
  imageMetadatas: {
    width: number;
    height: number;
    name: string;
  }[];
  /** Handler for file input change events */
  handleFileUpload: (files: File[]) => Promise<void>;
  handleFileUploadEvent: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  /** Resets the upload state */
  cancel: () => void;
};

/**
 * A hook for handling multiple file uploads, particularly images and SVGs
 * @returns {FileUploaderResult} An object containing:
 * - imageContents: Use these as the src for img tags
 * - rawContents: The raw file contents as strings (useful for SVG tags)
 * - imageMetadatas: Width, height, and name of the images
 * - handleFileUpload: Function to handle file input change events
 * - cancel: Function to reset the upload state
 */
export const useFileUploader = (): FileUploaderResult => {
  const [imageContents, setImageContents] = useState<string[]>([]);
  const [rawContents, setRawContents] = useState<string[]>([]);
  const [imageMetadatas, setImageMetadatas] = useState<{
    width: number;
    height: number;
    name: string;
  }[]>([]);

  const processFiles = async (files: File[]) => {
    const newImageContents: string[] = [];
    const newRawContents: string[] = [];
    const newImageMetadatas: { width: number; height: number; name: string }[] = [];

    for (const file of files) {
      const reader = new FileReader();
      const content = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        console.log('file', file);
        if (file.type === "image/svg+xml") {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });

      newRawContents.push(content);

      if (file.type === "image/svg+xml") {
        const { content: svgContent, metadata } = parseSvgFile(content, file.name);
        newImageContents.push(svgContent);
        newImageMetadatas.push(metadata);
      } else {
        const { content: imgContent, metadata } = await parseImageFile(content, file.name);
        newImageContents.push(imgContent);
        newImageMetadatas.push(metadata);
      }
    }

    setImageContents((prev) => [...prev, ...newImageContents]);
    setRawContents((prev) => [...prev, ...newRawContents]);
    setImageMetadatas((prev) => [...prev, ...newImageMetadatas]);
  };

  const handleFileUploadEvent = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFilePaste = useCallback(async (file: File[]) => {
    await processFiles([...file]);
  }, []);

  useClipboardPaste({
    onPaste: handleFilePaste,
    acceptedFileTypes: ["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"],
  });

  const cancel = () => {
    setImageContents([]);
    setRawContents([]);
    setImageMetadatas([]);
  };

  return {
    imageContents,
    rawContents,
    imageMetadatas,
    handleFileUpload: processFiles,
    handleFileUploadEvent,
    cancel,
  };
};
