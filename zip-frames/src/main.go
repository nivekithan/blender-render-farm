package main

import (
	"github.com/nivekithan/blender-render-farm/s3-zip/src/iaws"
)

func main() {
	flag := NewFlag()

	awsConfig := iaws.LoadAwsConfig()

	s3Client := iaws.NewS3Client(awsConfig, flag.bucket)

	s3Client.ZipFolder(flag.folder)
}
