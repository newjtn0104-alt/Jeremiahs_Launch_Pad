import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const DESKTOP_PATH = join(homedir(), "Desktop");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("file");
    
    if (!filename) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 });
    }
    
    // Security: only allow files from Desktop/Whatsup_weekly
    const filePath = join(DESKTOP_PATH, "Whatsup_weekly", filename);
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    const ext = filename.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
