import * as aws from "@pulumi/aws";

export const blenderFarmBucket = new aws.s3.Bucket("BlenderFarmFiles");

// Export the name of the bucket
