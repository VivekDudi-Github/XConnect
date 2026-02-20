import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";
import ApiError from "./ApiError.js";

configDotenv();


const supabase = createClient((process.env.SUPABASE_URL, process.env.SUPABASE_KEY)) ;

// a helper to create a supportive mime type
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
  const bucketName = [process.env.SUPABASE_VIDEO_BUCKET];
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
      throw ApiError("Upload failed: " + error.message , 500);
    }
  }

  console.log("HLS Upload Complete");

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileId}/master.m3u8`;
}






export async function deleteHLSVideo(fileId) {
  const bucket = process.env.SUPABASE_VIDEO_BUCKET;

  // This is the folder/prefix where all segments exist
  const prefix = `${fileId}/hls`;

  console.log("Deleting video folder:", prefix);

  // List files inside prefix
  const { data: files, error: listError } =
    await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset: 0,
    });

  if (listError) {
    throw new ApiError("List failed: " + listError.message , 500);
  }

  if (!files || files.length === 0) {
    console.log("No files found");
    return;
  }

  // Build full paths for removal
  const pathsToDelete = files.map((file) => {
    return `${prefix}/${file.name}`;
  });

  console.log("Deleting files:", pathsToDelete.length);

  // Remove all
  const { error: deleteError } =
    await supabase.storage.from(bucket).remove(pathsToDelete);

  if (deleteError) {
    throw new ApiError("Delete failed: " + deleteError.message , 500); 
  }

  console.log("Video deleted successfully");
}