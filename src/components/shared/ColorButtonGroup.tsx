import React from "react";

interface ColorButtonProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  setColorShow: (show: boolean) => void;
}
const ColorButtonGroup = ({
  selectedColor,
  onColorChange,
  setColorShow,
}: ColorButtonProps) => {
  return (
    <div>
      <button
        className="rounded-l-lg px-4 py-2 text-sm font-medium transition-colors"
        onClick={() => onColorChange("white")}
        style={{
          backgroundColor: "white",
          color: "black",
        }}
      >
        White
      </button>
      <button
        className="px-4 py-2 text-sm font-medium transition-colors"
        onClick={() => onColorChange("black")}
        style={{
          backgroundColor: "black",
          color: "white",
        }}
      >
        Black
      </button>
      <button
        className="rounded-r-lg px-4 py-2 text-sm font-medium transition-colors"
        onClick={() => setColorShow(true)}
        style={{
          backgroundColor: selectedColor,
          color: selectedColor,
        }}
      >
        selectedColor
      </button>
    </div>
  );
};

export default ColorButtonGroup;
