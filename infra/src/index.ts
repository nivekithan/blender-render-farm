import { initateAwsBatchLambda } from "./initateAwsBatchFromLambda";
import { blenderFarmBucket } from "./blenderFarmStorage";

export const initateAwsBatchLambdaArn = initateAwsBatchLambda.arn;
export const bucketName = blenderFarmBucket.id;
