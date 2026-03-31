import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const DESKTOP_PATH = join(homedir(), "Desktop");

export async function GET() {
  try {
    // Scan Desktop for WhatsUp files
    let files: { name: string; path: string; date: Date }[] = [];
    
    try {
      const entries = await readdir(DESKTOP_PATH);
      
      for (const entry of entries) {
        const lowerName = entry.toLowerCase();
        // Look for files with "whatsup", "what's up", or "weekly" in the name
        if ((lowerName.includes("whatsup") || 
             lowerName.includes("what's up") ||
             lowerName.includes("weekly")) &&
            (lowerName.endsWith(".pdf") ||
             lowerName.endsWith(".png") ||
             lowerName.endsWith(".jpg") ||
             lowerName.endsWith(".jpeg"))) {
          
          const filePath = join(DESKTOP_PATH, entry);
          const stats = await stat(filePath);
          
          files.push({
            name: entry,
            path: filePath,
            date: stats.mtime
          });
        }
      }
    } catch (e) {
      console.log("Desktop scan error:", e);
    }
    
    // Also check for a whatsup_weekly folder on Desktop
    const whatsUpFolder = join(DESKTOP_PATH, "whatsup_weekly");
    try {
      const entries = await readdir(whatsUpFolder);
      
      for (const entry of entries) {
        const lowerName = entry.toLowerCase();
        if (lowerName.endsWith(".pdf") ||
            lowerName.endsWith(".png") ||
            lowerName.endsWith(".jpg") ||
            lowerName.endsWith(".jpeg")) {
          
          const filePath = join(whatsUpFolder, entry);
          const stats = await stat(filePath);
          
          files.push({
            name: entry,
            path: filePath,
            date: stats.mtime
          });
        }
      }
    } catch (e) {
      // Folder doesn't exist, that's ok
    }
    
    // Sort by date (newest first)
    files.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const latestFile = files.length > 0 ? {
      name: files[0].name,
      path: files[0].path,
      date: files[0].date.toISOString()
    } : null;
    
    return NextResponse.json({
      latestFile,
      totalFiles: files.length,
      scannedPath: DESKTOP_PATH
    });
    
  } catch (error) {
    console.error("Error scanning WhatsUp files:", error);
    return NextResponse.json(
      { error: "Failed to scan files", latestFile: null },
      { status: 500 }
    );
  }
}
