package iaws

import (
	"archive/zip"
	"context"
	"io"
	"log"
	"os"
	"path"
	"strings"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Client struct {
	client *s3.Client
	bucket string
}

func NewS3Client(config aws.Config, bucket string) S3Client {
	client := s3.NewFromConfig(config)

	return S3Client{
		client: client,
		bucket: bucket,
	}
}

func (s *S3Client) ZipFolder(folder string) {

	listFileInput := s3.ListObjectsV2Input{
		Bucket:    aws.String(s.bucket),
		Prefix:    aws.String(folder),
		Delimiter: aws.String("/"),
	}

	log.Println("Listing files in bucket")
	listOfFiles, err := s.client.ListObjectsV2(context.Background(), &listFileInput)

	if err != nil {
		log.Fatal(err)
	}

	writer, err := os.Create("zipped.zip")

	if err != nil {
		log.Fatal(err)
	}

	defer writer.Close()

	zipFileWrtier := zip.NewWriter(writer)

	var wg sync.WaitGroup

	for _, fileMetadata := range listOfFiles.Contents {
		fileKey := *&fileMetadata.Key

		wg.Add(1)
		go func() {
			defer wg.Done()

			log.Printf("zipping file %s", *fileKey)

			getObjectInput := s3.GetObjectInput{
				Bucket: aws.String(s.bucket),
				Key:    aws.String(*fileKey),
			}

			s3FileObj, err := s.client.GetObject(context.Background(), &getObjectInput)

			if err != nil {
				log.Fatal(err)
			}

			fileName := getFileName(folder, *fileKey)

			indivialZipFileWriter, err := zipFileWrtier.Create(fileName)

			if err != nil {
				log.Fatal(err)
			}

			_, err = io.Copy(indivialZipFileWriter, s3FileObj.Body)

			if err != nil {
				log.Fatal(err)
			}

		}()

	}

	wg.Wait()

	zipFileWrtier.Close()

	log.Println("Zip file created")

	file, err := os.Open("zipped.zip")

	if err != nil {
		log.Fatal(err)
	}

	key := path.Join(folder, "file.zip")

	log.Printf("Zipped file s3Key %s", key)
	putObjectInput := s3.PutObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		Body:   file,
	}

	_, err = s.client.PutObject(context.Background(), &putObjectInput)

	if err != nil {
		log.Fatal(err)
	}

	log.Println("File uploaded to S3")

}

func getFileName(prefix string, fileKey string) string {
	return strings.Replace(fileKey, prefix, "", 1)
}
