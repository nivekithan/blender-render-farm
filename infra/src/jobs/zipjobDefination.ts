import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { zipFramesImage } from "../ecrRepo";
import { blenderFarmBucket } from "../blenderFarmStorage";

const FIFTEEN_MINUTES = 15 * 60;

const assumeRolePolicy = aws.iam.getPolicyDocument({
  statements: [
    {
      actions: ["sts:AssumeRole"],
      principals: [
        {
          type: "Service",
          identifiers: ["ecs-tasks.amazonaws.com"],
        },
      ],
    },
  ],
});

const ecsTaskExecutionRole = new aws.iam.Role(
  "BlenderFarmECSTaskExecutionRoleZip",
  {
    assumeRolePolicy: assumeRolePolicy.then(
      (assumeRolePolicy) => assumeRolePolicy.json,
    ),
  },
);

const ecsTaskExecutionRolePolicyAttachement = new aws.iam.RolePolicyAttachment(
  "AttachRolePolicyToEcsTaskExecutionRoleZip",
  {
    role: ecsTaskExecutionRole.name,
    policyArn:
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
  },
);

const jobRolePolicyDocument = blenderFarmBucket.arn.apply((arn) => {
  return aws.iam
    .getPolicyDocument({
      statements: [
        {
          effect: "Allow",
          actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
          resources: [arn, `${arn}/*`],
        },
      ],
    })
    .then((policyDocument) => policyDocument.json);
});

const jobRolePolicy = new aws.iam.Policy("BlenderRendererJobPolicyZip", {
  policy: jobRolePolicyDocument,
});

const jobRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  "AttachJobRolePolicyToECSTaskExecutionRoleZip",
  {
    role: ecsTaskExecutionRole.name,
    policyArn: jobRolePolicy.arn,
  },
);

export const zipJobDefinition = new aws.batch.JobDefinition(
  "BlenderFarmJobDefinationZip",
  {
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
      executionRoleArn: ecsTaskExecutionRole.arn,
      jobRoleArn: ecsTaskExecutionRole.arn,
      image: zipFramesImage.imageUri,
      resourceRequirements: [
        {
          type: "VCPU",
          value: "1.0",
        },
        {
          type: "MEMORY",
          value: "2048",
        },
      ],
    }),
  },
  {
    dependsOn: [ecsTaskExecutionRolePolicyAttachement, jobRolePolicyAttachment],
  },
);
