import { S3 } from "aws-sdk";
import { fetchContent, fetchDir, writeToFile } from "./fs";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

export async function getS3Folder(prefix: string, destinationDir: string) {
  const params: S3.ListObjectsV2Request = {
    Bucket: bucketName ?? "",
    Prefix: prefix,
    // Prefix: "base/nodejs/",
  };

  const res = await s3.listObjectsV2(params).promise();
  const contents = res.Contents;
  // console.log(contents);

  for (const file of contents!) {
    const objParams: S3.GetObjectRequest = {
      Bucket: bucketName ?? "",
      Key: file.Key!,
    };
    const data = await s3.getObject(objParams).promise();
    const fileName = file.Key!.replace(prefix, "");
    await writeToFile(destinationDir, fileName, data.Body! as Buffer | string);
  }
  console.log("Finished from getS3Folder");
}

export async function uploadDirToS3(prefix: string, dirPath: string) {
  const files = (await fetchDir(dirPath, true)).filter(
    (fileOrDir) => fileOrDir.type === "file"
  );

  console.log("files to upload: ", files);
  const uploads = files.map(async (file) => {
    const s3Key = `${prefix}${file.path.replace(dirPath, "")}`;
    console.log("s3Key: ", s3Key);
    console.log("bucketName: ", bucketName);
    const uploadParams: S3.PutObjectRequest = {
      Bucket: bucketName ?? "",
      Key: s3Key,
      Body: await fetchContent(file.path),
    };
    return s3.upload(uploadParams).promise();
  });

  await Promise.all(uploads);
  console.log("Finished uploading to S3 within function");
}
