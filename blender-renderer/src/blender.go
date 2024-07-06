package main

import (
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

const (
	BLEND_FILE_PATH = "/file.blend"
	RENDERED_DIR    = "/rendered"
	RENDERED_PATH   = "/rendered/frame_####"
)

func GetBlenderPath() string {
	blender, err := exec.LookPath("blender")

	if err != nil {
		log.Println("Failed on looking for blender")
		log.Fatal(err)
	}

	return blender
}

func GetBlenderRenderedFile() (name string, path string) {

	files, err := os.ReadDir(RENDERED_DIR)

	if err != nil {
		log.Println("Failed on reading rendered dir")
		log.Fatal(err)
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		fileName := file.Name()
		path := filepath.Join(RENDERED_DIR, fileName)
		return fileName, path
	}

	log.Println("No rendered file found")
	os.Exit(1)
	return "", ""
}
