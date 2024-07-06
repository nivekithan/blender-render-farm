package iaws

import (
	"context"
	"io"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Client struct {
	client     *s3.Client
	bucketName string
}

func NewS3Client(config aws.Config, bucketName string) S3Client {
	client := s3.NewFromConfig(config)

	return S3Client{
		client:     client,
		bucketName: bucketName,
	}
}

func (s *S3Client) StoreS3FileLocally(ctx context.Context, s3FileKey string, localFilePath string) error {

	res, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Key:    &s3FileKey,
		Bucket: &s.bucketName,
	})

	if err != nil {
		return (err)
	}

	body := res.Body

	defer body.Close()

	out, err := os.Create(localFilePath)

	if err != nil {
		return (err)
	}

	_, err = io.Copy(out, body)

	if err != nil {
		return (err)
	}

	return nil
}
