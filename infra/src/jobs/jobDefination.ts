import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const FIFTEEN_MINUTES = 15 * 60;

const jobDefination = new aws.batch.JobDefinition("BlenderFarmJobDefination", {
  type: "container",
  timeout: { attemptDurationSeconds: FIFTEEN_MINUTES },
  platformCapabilities: ["FARGATE"],
  containerProperties: pulumi.jsonStringify({
    command: ["echo", '"Specifcy command on job"'],
    fargatePlatformConfiguration: {
      platformVersion: "LATEST",
    },
    runtimePlatform: {
      cpuArchitecture: "X86_64",
      operatingSystemFamily: "LINUX",
    },
    networkConfiguration: {
      assignPublicIp: "ENABLED",
    },
    executionRoleArn: "arn:aws:iam::100519828617:role/ecsTaskExecutionRole",
    taskRoleArn: "arn:aws:iam::100519828617:role/ecsTaskExecutionRole",
    containers: [
      {
        essential: true,
        image: "public.ecr.aws/amazonlinux/amazonlinux:latest",
        resourceRequirements: [
          {
            type: "VCPU",
            value: "8.0",
          },
          {
            type: "MEMORY",
            value: "32768",
          },
        ],
      },
    ],
  }),
});
