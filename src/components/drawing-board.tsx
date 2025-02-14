"use client";

import React, { useEffect, useRef, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { X } from "lucide-react";

interface Point {
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface DrawingBoardProps {
  supabase: SupabaseClient;
  onSave: () => void;
  onClose: () => void;
}

export default function DrawingBoard({
  supabase,
  onSave,
  onClose,
}: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 400;
    canvas.height = 300;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    // Make background transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    contextRef.current = context;
  }, []);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    lastPointRef.current = { x, y, color: currentColor, timestamp: Date.now() };

    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !lastPointRef.current) return;

    const { x, y } = getCoordinates(e);
    const context = contextRef.current;

    context.strokeStyle = currentColor;
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(x, y);
    context.stroke();

    lastPointRef.current = { x, y, color: currentColor, timestamp: Date.now() };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Save with transparent background
      const imageData = canvas.toDataURL("image/png");
      const { error } = await supabase.from("signatures").insert([
        {
          image_data: imageData,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      onSave();
    } catch (err) {
      console.error("Error saving signature:", err);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear to transparent
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-8 h-8 cursor-pointer rounded-full border-2 border-gray-200"
            />
            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="bg-[url('/grid.png')] bg-repeat">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair"
          />
        </div>
        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add to Wall
          </button>
        </div>
      </div>
    </div>
  );
}
