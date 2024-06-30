FROM accetto/ubuntu-vnc-xfce-opengl-g3

USER root

RUN apt-get update
RUN apt-get install -y curl build-essential

WORKDIR /download_blender 

RUN curl -o blender.tar.xz https://download.blender.org/release/Blender4.1/blender-4.1.1-linux-x64.tar.xz
RUN tar -xf blender.tar.xz  --strip-components=1
RUN ln -s /download_blender/blender /usr/local/bin/blender

COPY ./dist/blender-renderer /start
COPY ./box_apps.blend /box_apps.blend

RUN mkdir /rendered

