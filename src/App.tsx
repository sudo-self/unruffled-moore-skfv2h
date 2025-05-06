import React, { useState, useRef, useEffect } from "react";

type Point = {
  x: number;
  y: number;
};

const defaultColorPalette = [
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "black",
  "white",
];

const ColoringCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("black");
  const [brushSize, setBrushSize] = useState(5);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 400;

    // Load previously drawn data if available
    if (drawingData) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0);
      };
      image.src = drawingData;
    }

    // Load uploaded image if available
    if (uploadedImage) {
      const image = new Image();
      image.onload = () => {
        const aspectRatio = image.width / image.height;
        let width = canvas.width;
        let height = canvas.height;

        if (aspectRatio > 1) {
          height = canvas.width / aspectRatio;
        } else {
          width = canvas.height * aspectRatio;
        }

        context.drawImage(
          image,
          (canvas.width - width) / 2,
          (canvas.height - height) / 2,
          width,
          height
        );
      };
      image.src = uploadedImage;
    }
  }, [uploadedImage, drawingData]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.strokeStyle = brushColor;
    context.lineTo(x, y);
    context.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDrawingData(canvas.toDataURL());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setUploadedImage(null);
    setDrawingData(null);
  };
  const getTouchPos = (touch: Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const pos = getTouchPos(e.touches[0]);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const pos = getTouchPos(e.touches[0]);
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.strokeStyle = brushColor;
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Kids Coloring Canvas</h1>

      <div className="flex space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          id="imageUpload"
          className="hidden"
        />
        <label
          htmlFor="imageUpload"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          Upload Image
        </label>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={clearCanvas}
        >
          Clear Canvas
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="border-2 border-gray-400 rounded-xl shadow-md cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endDrawing}
      />

      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          {defaultColorPalette.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 border-gray-300 focus:outline-none ${
                brushColor === color ? "border-4 border-gray-500" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setBrushColor(color)}
            />
          ))}
        </div>
        <div>
          <label htmlFor="brushSize" className="mr-2 text-gray-700">
            Brush Size:
          </label>
          <input
            type="number"
            id="brushSize"
            className="w-16 border border-gray-300 rounded-md px-2 py-1"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            min="1"
            max="20"
          />
        </div>
      </div>
    </div>
  );
};

export default ColoringCanvas;
