import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import path from "path";
import { blenderFarmBucket } from "./blenderFarmStorage";

const assumeRole = aws.iam.getPolicyDocument({
  statements: [
    {
      effect: "Allow",
      principals: [
        {
          type: "Service",
          identifiers: ["lambda.amazonaws.com"],
        },
      ],
      actions: ["sts:AssumeRole"],
    },
  ],
});

const iam = new aws.iam.Role("lambdaRoleForInitalteAwsBatchBlenderFarm", {
  assumeRolePolicy: assumeRole.then((role) => role.json),
});

const iamPolicy = new aws.iam.Policy(
  "lambdaPolicyForInitalteAwsBatchBlenderFarm",
  {
    policy: blenderFarmBucket.arn.apply((blenderFarmBucketArn) => {
      return aws.iam
        .getPolicyDocument({
          statements: [
            {
              effect: "Allow",
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              resources: [`*`],
            },
            {
              effect: "Allow",
              actions: ["s3:GetObjectTagging"],
              resources: [`${blenderFarmBucketArn}/*`],
            },
          ],
        })
        .then((policy) => policy.json);
    }),
  },
);

const policyAttachment = new aws.iam.RolePolicyAttachment(
  "lambdaRolePolicyAttachmentForInitalteAwsBatchBlenderFarm",
  {
    role: iam.name,
    policyArn: iamPolicy.arn,
  },
);

const pathToZippedLambdaCode = path.resolve(
  process.cwd(),
  "..",
  "initateAwsBatch",
  "dist",
  "code.zip",
);

export const initateAwsBatchLambda = new aws.lambda.Function(
  "InitateAwsBatchBlenderFarm",
  {
    runtime: "nodejs20.x",
    memorySize: 1028,
    timeout: 60,
    role: iam.arn,
    handler: "index.handler",
    code: new pulumi.asset.FileArchive(pathToZippedLambdaCode),
  },
);

const allowLambdaToBeInvokedByS3Notification = new aws.lambda.Permission(
  "allowInitiateAwsBatchLambdaToBeInvokedByS3Notification",
  {
    action: "lambda:InvokeFunction",
    function: initateAwsBatchLambda.arn,
    principal: "s3.amazonaws.com",
    sourceArn: blenderFarmBucket.arn,
  },
);

const blenderFarmBucketNotification = new aws.s3.BucketNotification(
  "BlenderFarmBucketNotification",
  {
    bucket: blenderFarmBucket.id,
    lambdaFunctions: [
      {
        lambdaFunctionArn: initateAwsBatchLambda.arn,
        events: ["s3:ObjectCreated:*"],
        filterSuffix: ".blend",
      },
    ],
  },
  {
    dependsOn: [allowLambdaToBeInvokedByS3Notification],
  },
);
