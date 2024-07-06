package iaws

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
)

func LoadAwsConfig() aws.Config {
	config, err := config.LoadDefaultConfig(context.Background(), config.WithRegion("ap-south-1"))

	if err != nil {
		log.Println("Failed on loading AWS config")
		log.Fatal(err)
	}

	return config
}
