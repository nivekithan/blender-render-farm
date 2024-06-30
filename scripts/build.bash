CGO_ENABLED=0 GOOS=linux go build -o ./dist/blender-renderer ./src

docker build --tag blender-renderer .
