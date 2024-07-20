package main

import (
	"flag"
	"log"
)

type Flag struct {
	bucket string
	folder string
}

func NewFlag() Flag {
	bucket := flag.String("bucket", "", "Bucket to store rendered files in")
	folder := flag.String("folder", "", "Folder to store rendered files in")

	flag.Parse()

	if *bucket == "" || *folder == "" {
		log.Fatal("Usage: zip-frames -bucket <bucket name> -folder <folder name>")
	}

	return Flag{
		bucket: *bucket,
		folder: *folder,
	}
}
