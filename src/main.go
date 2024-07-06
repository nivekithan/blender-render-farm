package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/nivekithan/blender-render-farm/src/iaws"
)

const BLEND_FILE_PATH = "/file.blend"

func main() {

	flags := NewFlagFromCmdLine()

	awsConfig := iaws.LoadAwsConfig()
	s3Client := iaws.NewS3Client(awsConfig, flags.bucketName)

	log.Println("Starting blender renderer...")

	blender := GetBlenderPath()

	err := s3Client.StoreS3FileLocally(context.Background(), flags.s3FileKey, BLEND_FILE_PATH)

	if err != nil {
		log.Println("Failed on storing file in s3")
		log.Fatal(err)
	}

	cmd := exec.Command(
		blender,
		"-b",
		BLEND_FILE_PATH,
		"-o",
		"/rendered/frame_####",
		"-E",
		"CYCLES",
		"-f",
		fmt.Sprintf("+%d", flags.frameToRender-1),
	)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()

	if err != nil {
		log.Println("Failed on running blender")
		log.Fatal(err)
	}

	log.Println("Done!")
	os.Exit(0)
}
