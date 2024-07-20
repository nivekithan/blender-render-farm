package main

import (
	"flag"
	"log"
	"os"
	"strconv"
)

type Flag struct {
	s3FileKey     string
	frameToRender int
	bucketName    string
}

func NewFlag() Flag {
	blendFileKey := flag.String("blend", "", "Path to the blend file to render")
	bucketName := flag.String("bucket", "", "Bucket to store rendered files in")

	flag.Parse()

	frameToRender := os.Getenv("AWS_BATCH_JOB_ARRAY_INDEX")

	if frameToRender == "" {
		log.Fatal("AWS_BATCH_JOB_ARRAY_INDEX environment variable not set")
	}

	frameToRenderInt, err := strconv.Atoi(frameToRender)

	if err != nil {
		log.Fatal(err)
	}

	if *blendFileKey == "" || *bucketName == "" {
		log.Println("Usage: blender-renderer -blend <path to blend file> -frame <frame to render> -bucket <bucket name>")
		os.Exit(1)
	}

	return Flag{
		s3FileKey:     *blendFileKey,
		frameToRender: frameToRenderInt,
		bucketName:    *bucketName,
	}
}
