import { Handler, S3Event, S3EventRecord } from "aws-lambda";
import { S3Client, GetObjectTaggingCommand } from "@aws-sdk/client-s3";

export const handler: Handler = async (event: S3Event) => {
  const records = event.Records;

  await Promise.all(records.map(initateAwsBatch));
};

async function initateAwsBatch(record: S3EventRecord) {
  const bucketName = record.s3.bucket.name;
  const objectKey = record.s3.object.key;

  const s3Client = new S3Client();

  const command = new GetObjectTaggingCommand({
    Key: objectKey,
    Bucket: bucketName,
  });

  const response = await s3Client.send(command);

  const frameTag = response.TagSet?.find((tag) => tag.Key === "frame");

  if (!frameTag || !frameTag.Value) {
    console.log("Created object does not have a frame tag");
    return;
  }

  const frame = parseInt(frameTag.Value);

  console.log(
    `Initiating AWS Batch job to render ${frame} frames of ${bucketName}/${objectKey}`,
  );
}
