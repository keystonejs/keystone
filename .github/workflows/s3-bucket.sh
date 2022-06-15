docker run -d -p 9000:9000 --name minio \
            -e "MINIO_ACCESS_KEY=keystone" \
            -e "MINIO_SECRET_KEY=keystone" \
            -v /tmp/data:/data \
            -v /tmp/config:/root/.minio \
            minio/minio server /data

export AWS_ACCESS_KEY_ID=keystone
export AWS_SECRET_ACCESS_KEY=keystone
export AWS_EC2_METADATA_DISABLED=true

aws --endpoint-url http://127.0.0.1:9000/ s3 mb s3://keystone-test
aws --endpoint-url http://127.0.0.1:9000/ s3api put-bucket-policy --bucket keystone-test --policy file://tests/api-tests/s3-public-read-policy.json
