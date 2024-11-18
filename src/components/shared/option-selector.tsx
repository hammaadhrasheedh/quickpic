"use client";

import { useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import ColorButtonGroup from "./ColorButtonGroup";
interface OptionSelectorProps<T extends string | number> {
  title: string;
  selected: string;
  onChange: (value: string) => void;
}

export function OptionSelector<T extends string | number>({
  title,
  selected,
  onChange,
}: OptionSelectorProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [colorShow, setColorShow] = useState(false);

  useEffect(() => {
    if (selectedRef.current && highlightRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;
      const highlight = highlightRef.current;

      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      highlight.style.left = `${selectedRect.left - containerRect.left}px`;
      highlight.style.width = `${selectedRect.width}px`;
    }
  }, [selected]);

  return (
    <>
      {colorShow ? (
        <SketchPicker
          color={selected || "#000000"}
          onChangeComplete={(color: { hex: string }) => {
            onChange(color.hex);
          }}
        />
      ) : null}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-white/60">{title}</span>
        <div className="flex flex-col items-center gap-2">
          <div
            ref={containerRef}
            className="relative inline-flex rounded-lg bg-white/5 p-1"
          >
            <div
              ref={highlightRef}
              className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-blue-600 transition-all duration-200"
            />
            <ColorButtonGroup
              selectedColor={selected}
              onColorChange={onChange}
              setColorShow={() => {
                setColorShow(!colorShow);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
