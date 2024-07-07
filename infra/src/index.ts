import { initateAwsBatchLambda } from "./initateAwsBatchFromLambda";
import { blenderFarmBucket } from "./blenderFarmStorage";
import { computeEnvironment } from "./jobs/computeEnvironment";
import { blenderFramJobQueue } from "./jobs/queue";
import { blenderFarmImageRepo } from "./ecrRepo";
import { blenderRendererJobDefinition } from "./jobs/jobDefination";

export const initateAwsBatchLambdaArn = initateAwsBatchLambda.arn;
export const bucketName = blenderFarmBucket.id;

export const awsBatch = {
  computeEnvironmentName: computeEnvironment.id,
  jobQueueName: blenderFramJobQueue.id,
  jobDefinitionName: blenderRendererJobDefinition.name,
};

export const imageRepoName = blenderFarmImageRepo.name;
