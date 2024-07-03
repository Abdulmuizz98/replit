// import { createReadStream } from "node:fs";
import { writeFile, readdir, readFile, mkdir, unlink } from "node:fs/promises";

export async function fetchContent(filePath: string) {
  const data = await readFile(filePath);
  return data;
}

// export function fetchContent(filePath: string) {
//   const readStream = createReadStream(filePath);
//   return readStream;
// }

export async function fetchDir(dirPath: string, recursive: boolean = false) {
  const res = await readdir(dirPath, { withFileTypes: true, recursive });
  const files = res.map((file) => ({
    name: file.name,
    path: file.path + file.name,
    type: file.isDirectory() ? "directory" : "file",
  }));

  return files;
}

export async function writeToFile(
  destinationDir: string,
  fileName: string,
  data: Buffer | string
) {
  try {
    await mkdir(destinationDir, { recursive: true });
    console.log(`Created ${destinationDir} directory`);
    await writeFile(destinationDir + fileName, data);
    console.log(`Created ${destinationDir + fileName} file`);
  } catch (err) {
    console.error(err);
  }
}

export async function removeFile(filePath: string) {
  await unlink(filePath);
}
