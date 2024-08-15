### Blender render farm

Render your blender animations on aws cloud.

### Steps

1. Clone repo in local machine
2. Install all dependencies locally
3. Run `pulumi up` from `infra` directory 
4. On the s3 bucket created by the pulumi upload your blender file

All frames will be generated and stored in the same bucket in folder with same name as your file. The folder will also contain the zip of file of all generted frames. 
