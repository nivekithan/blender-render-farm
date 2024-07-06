package main

import (
	"log"
	"os/exec"
)

func GetBlenderPath() string {
	blender, err := exec.LookPath("blender")

	if err != nil {
		log.Println("Failed on looking for blender")
		log.Fatal(err)
	}

	return blender
}
