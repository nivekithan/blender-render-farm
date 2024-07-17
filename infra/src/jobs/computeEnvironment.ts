import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as ipNum from "ip-num";

const vpc = new aws.ec2.Vpc("BlenderFarmVpc", {
  cidrBlock: "10.3.0.0/16",
  enableDnsHostnames: true,
  assignGeneratedIpv6CidrBlock: true,
  enableDnsSupport: true,
});

const vpcIpv6CidrBlock = vpc.ipv6CidrBlock;

const ipv6Subnet = new aws.ec2.Subnet("BlenderFarmSubnetIpv6", {
  assignIpv6AddressOnCreation: true,
  enableDns64: true,
  vpcId: vpc.id,
  // mapPublicIpOnLaunch: true,

  ipv6CidrBlock: getIpv6SubnetRange(vpcIpv6CidrBlock, BigInt(64), 10),
  cidrBlock: "10.3.0.0/16",
});

const igw = new aws.ec2.InternetGateway("internet-gateway", {
  vpcId: vpc.id,
});

// Create a route table
const routeTable = new aws.ec2.RouteTable("route-table", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: igw.id,
    },
    {
      ipv6CidrBlock: "::/0",
      gatewayId: igw.id,
    },
  ],
});

const routeTableAssociation1 = new aws.ec2.RouteTableAssociation(
  "rta-public-subnet-1",
  {
    subnetId: ipv6Subnet.id,
    routeTableId: routeTable.id,
  },
);

const securityGroup = new aws.ec2.SecurityGroup(
  "ComputeEnvironmentSecurityGroup",
  {
    vpcId: vpc.id,
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
      { protocol: "-1", fromPort: 0, toPort: 0, ipv6CidrBlocks: ["::/0"] },
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
      subnets: [ipv6Subnet.id],
      securityGroupIds: [securityGroup.id],
    },

    serviceRole: awsBatchServiceRole.arn,
  },

  {
    dependsOn: [awsBatchServiceRoleRolePolicyAttachment],
  },
);

function getIpv6SubnetRange(
  vpcIPv6Range: pulumi.Output<string>,
  subnetIPv6Prefix: bigint,
  subnetNumber: number,
): pulumi.Output<string> {
  return vpcIPv6Range.apply((vpcRange) => {
    const ipv6Range = new ipNum.IPv6CidrRange(
      new ipNum.IPv6(vpcRange.split("/")[0]), // IPV6 part
      new ipNum.IPv6Prefix(BigInt(vpcRange.split("/")[1])), // Netmask part
    );

    if (ipv6Range.getPrefix().value !== BigInt(56)) {
      throw new Error("The provided CIDR block must be a /56 range.");
    }

    const subnetRanges = ipv6Range.splitInto(
      new ipNum.IPv6Prefix(subnetIPv6Prefix),
    );

    const cidrBlock = subnetRanges[subnetNumber].toCidrString();

    const properCidrBlock = cidrBlock.replace(":0:0:0:0", "::");

    return properCidrBlock;
  });
}
