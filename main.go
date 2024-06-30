package main

import (
	"log"
	"os"
	"os/exec"
)

func main() {
	log.Println("Starting blender renderer...")
	blender, err := exec.LookPath("blender")

	if err != nil {
		log.Println("Failed on looking for blender")
		log.Fatal(err)
	}

	cmd := exec.Command(blender, "-b", "/box_apps.blend", "-o", "/rendered/frame_####", "-E", "CYCLES", "-f", "+1")

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
