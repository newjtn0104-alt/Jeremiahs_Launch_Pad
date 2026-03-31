import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const DESKTOP_PATH = join(homedir(), "Desktop");
const WHATSUP_FOLDER = join(DESKTOP_PATH, "Whatsup_weekly");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, PNG, JPG allowed" },
        { status: 400 }
      );
    }
    
    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save to Desktop/Whatsup_weekly
    const filePath = join(WHATSUP_FOLDER, file.name);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({
      success: true,
      filename: file.name,
      path: filePath,
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
