# Change entry point in Dockerfile

We override the default entrypoint in the dockerfile to `/start` instead of `/usr/bin/tini`.

## Rationale

`/usr/bin/tini` is the default entrypoint for the docker image which is used to reap the zombie processes once the main process exits. Atleast that's what mentioned in the documentation.

https://github.com/krallin/tini

However, we found that this process is not working as expected with our base image which contains display server and other dependencies required to run blender.

This cauased the container to not exit immediately once the main process exits and instead waits indefinitely.

Which means the fargate task is stuck in `RUNNING` state forever.

To solve this, we override the default entrypoint to `/start`.
