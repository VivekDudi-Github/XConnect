import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";

configDotenv();


const supabase = createClient((process.env.SUPABASE_URL, process.env.SUPABASE_KEY)) ;


// MIME helper
function getMimeType(filePath) {
  if (filePath.endsWith(".m3u8"))
    return "application/vnd.apple.mpegurl";

  if (filePath.endsWith(".ts"))
    return "video/mp2t";

  return "application/octet-stream";
}

function walkDir(dirPath) {
  let fileList = [];

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      fileList = fileList.concat(walkDir(fullPath));
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

// Upload full HLS folder
export async function uploadHLSFolder(fileId) {
  const bucketName = "hsl";

  // local folder where HLS is stored
  const localRoot = path.join("storage", fileId);

  // collect all files recursively
  const allFiles = walkDir(localRoot);

  console.log("Total files:", allFiles.length);

  // upload one by one
  for (const filePath of allFiles) {
    const relativePath = path.relative(localRoot, filePath);

    const storageKey = `${fileId}/${relativePath}`;

    console.log("Uploading:", storageKey);

    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(storageKey, fileBuffer, {
        upsert: true,
        contentType: getMimeType(filePath),
      });

    if (error) {
      console.error("Upload failed:", error.message);
      throw error;
    }
  }

  console.log("HLS Upload Complete");

  // return master playlist URL
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileId}/master.m3u8`;
}






export async function deleteHLSVideo(fileId) {
  const bucket = "hls";

  // This is the folder/prefix where all segments exist
  const prefix = `${fileId}/hsl`;

  console.log("Deleting video folder:", prefix);

  // Step 1: List files inside prefix
  const { data: files, error: listError } =
    await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset: 0,
    });

  if (listError) {
    throw new Error("List failed: " + listError.message);
  }

  if (!files || files.length === 0) {
    console.log("No files found");
    return;
  }

  // Step 2: Build full paths for removal
  const pathsToDelete = files.map((file) => {
    return `${prefix}/${file.name}`;
  });

  console.log("Deleting files:", pathsToDelete.length);

  // Step 3: Remove all
  const { error: deleteError } =
    await supabase.storage.from(bucket).remove(pathsToDelete);

  if (deleteError) {
    throw new Error("Delete failed: " + deleteError.message);
  }

  console.log("✅ Video deleted successfully");
}