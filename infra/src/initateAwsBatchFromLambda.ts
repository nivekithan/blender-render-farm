import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import path from "path";

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
    policy: aws.iam
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
        ],
      })
      .then((policy) => policy.json),
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
