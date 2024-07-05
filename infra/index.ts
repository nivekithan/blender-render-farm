import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("BlenderFarmFiles");

const localUser = new aws.iam.User("localUser", {
  name: "localUser",
  path: "/blender_farm/renderer/local_user/",
});

const localUserAccessKey = new aws.iam.AccessKey("accessKey", {
  user: localUser.name,
});

const policy = new aws.iam.Policy("localUserPolicy", {
  description: "A policy for local user to create read and write to bucket",
  policy: bucket.arn.apply((arn) => {
    return JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["s3:GetObject", "s3:PutObject"],
          Effect: "Allow",
          Resource: arn,
        },
      ],
    });
  }),
});

const userPolicyAttachment = new aws.iam.UserPolicyAttachment(
  "localUserPolicyAttachment",
  {
    user: localUser.name,
    policyArn: policy.arn,
  },
);
// Export the name of the bucket
export const bucketName = bucket.id;

export const outputs = {
  accessKey: localUserAccessKey.secret,
};
