# Blender Render Farm

A serverless distributed rendering system for Blender animations using AWS Batch, S3, and Lambda. This project enables parallel frame rendering of Blender projects in the cloud using AWS Fargate containers.

## Architecture

The system consists of four main components:

### 1. **blender-renderer**
A Go application that runs in a Docker container to render individual Blender frames.

- Downloads `.blend` files from S3
- Renders specified frames using Blender's Cycles engine
- Uploads rendered frames back to S3
- Built on `accetto/ubuntu-vnc-xfce-opengl-g3` base image with Blender 4.1.1

### 2. **zip-frames**
A Go application that consolidates rendered frames into a ZIP archive.

- Runs after all frames are rendered
- Downloads frames from S3 folder
- Creates ZIP archive and uploads to S3
- Lightweight Ubuntu-based container

### 3. **initateAwsBatch**
An AWS Lambda function that orchestrates the rendering pipeline.

- Triggered by S3 upload events (`.blend` file uploads)
- Reads frame count from S3 object tags
- Submits AWS Batch array job for parallel frame rendering
- Submits dependent ZIP job to run after rendering completes

### 4. **infra**
Pulumi-based infrastructure as code that provisions all AWS resources.

- S3 bucket for storing blend files and rendered frames
- ECR repository for Docker images
- AWS Batch compute environment (Fargate)
- Job queue and job definitions
- Lambda function with S3 event triggers
- IAM roles and policies

## How It Works

1. Upload a `.blend` file to the S3 bucket with a `frame` tag indicating the number of frames
2. Lambda function is triggered automatically
3. Lambda creates an AWS Batch array job with one task per frame
4. Each Batch task renders a single frame in parallel using Fargate
5. After all frames complete, a ZIP job consolidates the output
6. Rendered frames and ZIP file are available in S3

## Prerequisites

- Go 1.x
- Node.js and pnpm
- Docker
- AWS CLI configured
- Pulumi CLI
- Amber (for build scripts)

## Project Structure

```
.
├── blender-renderer/      # Frame rendering container
│   ├── src/
│   ├── Dockerfile
│   └── scripts/
├── zip-frames/            # Frame zipping container
│   ├── src/
│   ├── Dockerfile
│   └── scripts/
├── initateAwsBatch/       # Lambda function
│   └── src/
├── infra/                 # Pulumi infrastructure
│   └── src/
└── decisionDocs/          # Architecture decision records
```

## Deployment

### 1. Clone Repository

```bash
git clone <repository-url>
cd blender-render-farm
```

### 2. Install Dependencies

```bash
cd infra
pnpm install

cd ../initateAwsBatch
pnpm install
```

### 3. Deploy Infrastructure

```bash
cd infra
pulumi up
```

Note the outputs from Pulumi, including:
- S3 bucket name
- ECR repository URL
- Lambda function ARN

### 4. Build and Push Docker Images

For blender-renderer:
```bash
cd blender-renderer
npm run docker:build
# Tag and push to ECR repository
docker tag blender-renderer:latest <ecr-repo-url>/blender-renderer:latest
docker push <ecr-repo-url>/blender-renderer:latest
```

For zip-frames:
```bash
cd zip-frames
npm run docker:build
# Tag and push to ECR repository
docker tag zip-frames:latest <ecr-repo-url>/zip-frames:latest
docker push <ecr-repo-url>/zip-frames:latest
```

## Usage

### Upload a Blender File

Upload your `.blend` file to the S3 bucket with a `frame` tag indicating the total number of frames to render:

```bash
aws s3 cp animation.blend s3://<bucket-name>/animation.blend \
  --tagging "frame=120"
```

### Monitor Progress

Check AWS Batch console to monitor rendering jobs:
- Each frame renders as a separate array task
- Jobs run in parallel based on available compute capacity

### Download Results

All rendered frames will be stored in S3 at:
```
s3://<bucket-name>/animation.blend/<frame-files>
```

A ZIP file containing all frames will also be created:
```
s3://<bucket-name>/animation.blend/frames.zip
```

Download the ZIP file:
```bash
aws s3 cp s3://<bucket-name>/animation.blend/frames.zip ./rendered-frames.zip
```

## Configuration

### Environment Variables

**blender-renderer:**
- Set via AWS Batch job command overrides
- `-blend`: S3 key of the blend file
- `-bucket`: S3 bucket name
- Frame number: Automatically set by AWS Batch array index

**zip-frames:**
- `-bucket`: S3 bucket name
- `-folder`: S3 folder path containing frames

**initateAwsBatch Lambda:**
- `BUCKET_NAME`: S3 bucket for storage
- `JOB_DEFINITION_ARN`: Blender renderer job definition
- `JOB_QUEUE_ARN`: AWS Batch job queue
- `ZIP_JOB_DEFINITION_ARN`: ZIP job definition

### Resource Specifications

- **Compute:** 4 vCPUs, 8GB RAM per rendering task (Fargate)
- **Timeout:** 15 minutes per frame
- **Platform:** x86_64 Linux
- **Blender Version:** 4.1.1
- **Render Engine:** Cycles

## Decision Documentation

See `decisionDocs/` for architecture decision records, including:
- Why the Docker entrypoint was changed from `/usr/bin/tini` to `/start` (prevents Fargate tasks from hanging)

## Cost Considerations

- Fargate costs based on vCPU and memory per second
- S3 storage and data transfer costs
- Lambda invocations (minimal)
- Consider using Spot instances for cost savings (requires modification)

## Troubleshooting

### Jobs Not Starting
- Check AWS Batch compute environment status
- Verify ECR images are pushed and accessible
- Review IAM permissions for ECS task execution role

### Rendering Failures
- Check CloudWatch logs for the specific array task
- Verify `.blend` file is accessible in S3
- Ensure frame tag is correctly set

### ZIP Job Not Running
- Verify all rendering jobs completed successfully
- Check job dependencies in AWS Batch console

## License

ISC 
