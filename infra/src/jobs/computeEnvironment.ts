import * as aws from "@pulumi/aws";

const vpc = new aws.ec2.Vpc("BlenderFarmVpc", {
  cidrBlock: "10.2.0.0/16",
});

const firstSubnet = new aws.ec2.Subnet("BlenderFarmSubnet", {
  vpcId: vpc.id,
  cidrBlock: "10.2.0.0/24",
});

const secondSubnet = new aws.ec2.Subnet("BlenderFarmSubnet2", {
  vpcId: vpc.id,
  cidrBlock: "10.2.1.0/24",
});

const securityGroup = new aws.ec2.SecurityGroup(
  "ComputeEnvironmentSecurityGroup",
  {
    vpcId: vpc.id,
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
  },
);

const batchAssumeRole = aws.iam.getPolicyDocument({
  statements: [
    {
      effect: "Allow",
      principals: [
        {
          type: "Service",
          identifiers: ["batch.amazonaws.com"],
        },
      ],
      actions: ["sts:AssumeRole"],
    },
  ],
});

const awsBatchServiceRole = new aws.iam.Role("BlenderFramBatchServiceRole", {
  assumeRolePolicy: batchAssumeRole.then(
    (batchAssumeRole) => batchAssumeRole.json,
  ),
});

const awsBatchServiceRoleRolePolicyAttachment =
  new aws.iam.RolePolicyAttachment("aws_batch_service_role", {
    role: awsBatchServiceRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole",
  });

export const computeEnvironment = new aws.batch.ComputeEnvironment(
  "BlenderFarmComputeEnvironment",
  {
    computeEnvironmentNamePrefix: "blenderFarm-",
    type: "MANAGED",

    computeResources: {
      type: "FARGATE",
      maxVcpus: 500,
      subnets: [firstSubnet.id, secondSubnet.id],
      securityGroupIds: [securityGroup.id],
    },

    serviceRole: awsBatchServiceRole.arn,
  },

  {
    dependsOn: [awsBatchServiceRoleRolePolicyAttachment],
  },
);
