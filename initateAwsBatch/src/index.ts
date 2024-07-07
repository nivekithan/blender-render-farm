import { Handler, S3Event, S3EventRecord } from "aws-lambda";
import { S3Client, GetObjectTaggingCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { BatchClient, SubmitJobCommand } from "@aws-sdk/client-batch";

const env = z
  .object({
    BUCKET_NAME: z.string(),
    JOB_DEFINITION_ARN: z.string(),
    JOB_QUEUE_ARN: z.string(),
  })
  .parse(process.env);

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

  const batchClient = new BatchClient();

  const allPromises = [];

  for (let i = 1; i <= frame; i++) {
    const command = new SubmitJobCommand({
      jobName: `blender_farm_${crypto.randomUUID().slice(0, 5)}_${i}`,
      jobQueue: env.JOB_QUEUE_ARN,
      jobDefinition: env.JOB_DEFINITION_ARN,
      containerOverrides: {
        command: ["-blend", objectKey, "-frame", `${i}`, "-bucket", bucketName],
      },
    });

    console.log(
      `Initiating AWS Batch job to render ${i} frames of ${bucketName}/${objectKey}`,
    );

    allPromises.push(
      batchClient.send(command).then(() => {
        console.log(
          `Submitted AWS Batch job to render ${i} frames of ${bucketName}/${objectKey}`,
        );
      }),
    );
  }

  await Promise.all(allPromises);

  console.log("Finished initiating AWS Batch jobs");
}
