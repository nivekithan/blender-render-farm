import * as aws from "@pulumi/aws";
import { computeEnvironment } from "./computeEnvironment";

export const blenderFramJobQueue = new aws.batch.JobQueue(
  "BlenderFramJobQueue",
  {
    state: "ENABLED",
    priority: 1,
    computeEnvironmentOrders: [
      {
        order: 1,
        computeEnvironment: computeEnvironment.arn,
      },
    ],
  },
);
