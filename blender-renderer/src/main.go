package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/nivekithan/blender-render-farm/src/iaws"
)

func main() {

	flags := NewFlag()

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
		RENDERED_PATH,
		"-E",
		"CYCLES",
		"-f",
		fmt.Sprintf("+%d", flags.frameToRender-1),
	)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	err = cmd.Run()

	if err != nil {
		log.Println("Failed on running blender")
		log.Fatal(err)
	}

	renderedFileName, renderedFilePath := GetBlenderRenderedFile()

	log.Println("Rendered file: ", renderedFileName)

	err = s3Client.WriteLocalFileToS3(
		context.Background(),
		fmt.Sprintf("%v/%v", flags.s3FileKey, renderedFileName),
		renderedFilePath,
	)

	if err != nil {
		log.Println("Failed on writing rendered file to s3")
		log.Fatal(err)
	}

	log.Println("Done!")

	return

}
