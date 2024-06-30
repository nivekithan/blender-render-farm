CGO_ENABLED=0 GOOS=linux go build -o ./blender-renderer

docker build --tag blender-renderer .
