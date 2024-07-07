import { initateAwsBatchLambda } from "./initateAwsBatchFromLambda";
import { blenderFarmBucket } from "./blenderFarmStorage";
import { computeEnvironment } from "./jobs/computeEnvironment";

export const initateAwsBatchLambdaArn = initateAwsBatchLambda.arn;
export const bucketName = blenderFarmBucket.id;

export const computeEnvironmentName = computeEnvironment.id;
