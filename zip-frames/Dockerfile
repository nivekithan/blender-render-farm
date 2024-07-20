FROM ubuntu:22.04

USER root 

RUN apt-get update
RUN apt-get install -y ca-certificates

COPY ./dist/zip-frames /start 

ENTRYPOINT ["/start"]
