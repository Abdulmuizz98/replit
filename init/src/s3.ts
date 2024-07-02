import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

export async function copyS3ToS3(prefix: string, destinationPrefix: string) {
  const params: S3.ListObjectsV2Request = {
    Bucket: "replx",
    Prefix: prefix,
    // Prefix: "base/nodejs/",
  };

  const res = await s3.listObjectsV2(params).promise();
  const contents = res.Contents;
  console.log(contents);
  contents?.forEach(async (file) => {
    const sourceKey = file.Key!;
    const destinationKey = `${destinationPrefix}${sourceKey.replace(
      prefix,
      ""
    )}`;

    const copyParams: S3.CopyObjectRequest = {
      Bucket: "replx",
      Key: destinationKey,
      CopySource: `replx/${sourceKey}`,
    };
    await s3.copyObject(copyParams).promise();
    console.log(`Copied ${sourceKey} to ${destinationKey} successfully`);
  });
}
