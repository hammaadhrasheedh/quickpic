"use client";

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";
import { default as JSZip } from "jszip";
import { saveAs } from "file-saver";

interface SquareImage {
  content: string;
  name: string;
}

function SquareToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContents, imageMetadatas, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [backgroundColor, setBackgroundColor] = useLocalStorage<string>(
    "squareTool_backgroundColor",
    "white",
  );
  const [squareImages, setSquareImages] = useState<SquareImage[]>([]);

  useEffect(() => {
    const processImages = async () => {
      if (imageContents && imageMetadatas && imageMetadatas.length > 0) {
        const newSquareImages: SquareImage[] = [];

        for (let i = 0; i < imageContents.length; i++) {
          const canvas = document.createElement("canvas");
          const size = Math.max(
            imageMetadatas[i]?.width ?? 0,
            imageMetadatas[i]?.height ?? 0,
          );
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          // Fill background
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, size, size);

          // Load and center the image
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageContents[i] ?? "";
          });

          const x = (size - (imageMetadatas[i]?.width ?? 0)) / 2;
          const y = (size - (imageMetadatas[i]?.height ?? 0)) / 2;
          ctx.drawImage(img, x, y);

          newSquareImages.push({
            content: canvas.toDataURL("image/png"),
            name: imageMetadatas[i]?.name ?? "image.png",
          });
        }
        setSquareImages(newSquareImages);
      }
    };
    processImages()
      .then((result) => {
        console.log("DONE");
      })
      .catch((error) => {
        console.log(error);
      });
  }, [imageContents, imageMetadatas, backgroundColor]);

  const handleSaveImages = async () => {
    if (squareImages.length > 0) {
      const zip = new JSZip();

      squareImages.forEach((image) => {
        const fileNameWithoutExtension =
          image.name.substring(0, image.name.lastIndexOf(".")) || image.name;
        zip.file(
          `${fileNameWithoutExtension}-squared.png`,
          image.content.split(",")[1]! ?? undefined,
          { base64: true },
        );
      });

      try {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "squared-images.zip");
      } catch (error) {
        console.error("Error saving images:", error);
      }
    }
  };

  if (!imageMetadatas || imageMetadatas.length === 0) {
    return (
      <UploadBox
        title="Create square images with custom backgrounds. Fast and free."
        subtitle="Allows pasting images from clipboard"
        description="Upload Images"
        accept="image/*"
        onChange={handleFileUploadEvent}
        multiple
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {squareImages.map((image, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={image.content}
                alt={`Preview ${index + 1}`}
                className="mb-2 max-w-full"
              />
              <p className="text-sm font-medium text-white/80">{image.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Images</span>
          <span className="font-medium text-white">
            {imageMetadatas.length}
          </span>
        </div>
      </div>

      <OptionSelector
        title="Background Color"
        selected={backgroundColor}
        onChange={setBackgroundColor}
      />

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveImages}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Save Images as ZIP
        </button>
      </div>
    </div>
  );
}

export function SquareTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFiles={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image files"
      multiple
    >
      <SquareToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
