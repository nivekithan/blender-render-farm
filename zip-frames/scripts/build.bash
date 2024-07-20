CGO_ENABLED=0 GOOS=linux go build -o ./dist/zip-frames ./src

docker build --tag zip-frames .

