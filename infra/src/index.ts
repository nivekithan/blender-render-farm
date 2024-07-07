import { initateAwsBatchLambda } from "./initateAwsBatchFromLambda";
import { blenderFarmBucket } from "./blenderFarmStorage";
import { computeEnvironment } from "./jobs/computeEnvironment";
import { blenderFramJobQueue } from "./jobs/queue";
import { blenderFarmImageRepo } from "./ecrRepo";

export const initateAwsBatchLambdaArn = initateAwsBatchLambda.arn;
export const bucketName = blenderFarmBucket.id;

export const awsBatch = {
  computeEnvironmentName: computeEnvironment.id,
  jobQueueName: blenderFramJobQueue.id,
};

export const imageRepoName = blenderFarmImageRepo.name;
