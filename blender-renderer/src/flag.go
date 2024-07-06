package main

import (
	"flag"
	"log"
	"os"
)

type Flag struct {
	s3FileKey     string
	frameToRender int
	bucketName    string
}

func NewFlagFromCmdLine() Flag {
	blendFileKey := flag.String("blend", "", "Path to the blend file to render")
	frameToRender := flag.Int("frame", -1, "Frame to render")
	bucketName := flag.String("bucket", "", "Bucket to store rendered files in")

	flag.Parse()

	if *blendFileKey == "" || *frameToRender == -1 || *bucketName == "" {
		log.Println("Usage: blender-renderer -blend <path to blend file> -frame <frame to render> -bucket <bucket name>")
		os.Exit(1)
	}

	return Flag{
		s3FileKey:     *blendFileKey,
		frameToRender: *frameToRender,
		bucketName:    *bucketName,
	}
}
