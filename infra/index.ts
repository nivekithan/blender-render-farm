import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("BlenderFarmFiles");

// Export the name of the bucket
export const bucketName = bucket.id;
