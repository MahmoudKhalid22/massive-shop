// avatarGenerator.ts
import { createCanvas, Canvas } from "canvas";
import * as fs from "fs";
import * as path from "path";

export interface AvatarOptions {
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export async function generateAvatar(
  name: string,
  options: AvatarOptions = {},
): Promise<string> {
  // Default options
  const size: number = options.size || 200;
  const textColor: string = options.textColor || "#FFFFFF";
  const backgroundColor: string = options.backgroundColor || getRandomColor();

  // Create images directory
  const imagesDir: string = path.join(__dirname, "images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  // Create canvas
  const canvas: Canvas = createCanvas(size, size);
  const context = canvas.getContext("2d");

  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, size, size);

  // Draw text
  const initial: string = name.charAt(0).toUpperCase();
  context.fillStyle = textColor;
  context.font = `bold ${size / 2}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(initial, size / 2, size / 2);

  // Save image
  const filename: string = `${name.toLowerCase()}-${Date.now()}.png`;
  const filePath: string = path.join(imagesDir, filename);
  const buffer: Buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);

  return filePath;
}

function getRandomColor(): string {
  const colors: string[] = [
    "#1abc9c",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
    "#34495e",
    "#16a085",
    "#27ae60",
    "#2980b9",
    "#8e44ad",
    "#2c3e50",
    "#f1c40f",
    "#e67e22",
    "#e74c3c",
    "#95a5a6",
    "#f39c12",
    "#d35400",
    "#c0392b",
    "#bdc3c7",
    "#7f8c8d",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
