import { Readable } from 'stream';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { ImageMetadata } from '@keystone-next/types';

/**
 * This function and request to the cloud API will not be necessary if we can
 * encode the project's image subdomain in the apiKey.
 */
const getImagesSubdomain = async ({
  apiKey,
  graphqlApiEndpoint,
}: {
  apiKey: string;
  graphqlApiEndpoint: string;
}): Promise<string> => {
  const response = await fetch(graphqlApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query($apiKey:String) {
          allImgixSources(where: { project: { apiKeys: { apiKey: $apiKey } } }) {
            domain
          }
        }
      `,
      variables: {
        apiKey,
      },
    }),
  });
  const json = await response.json();
  const { data } = json;
  const { allImgixSources } = data;

  return allImgixSources[0].domain;
};

/**
 * This function and request to the cloud API will not be necessary if we can
 * encode the project's S3 prefix into the apiKey.
 */
const getS3Bucket = async ({
  apiKey,
  graphqlApiEndpoint,
}: {
  apiKey: string;
  graphqlApiEndpoint: string;
}): Promise<{ bucketName: string; prefix: string; region: string }> => {
  const response = await fetch(graphqlApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query($apiKey:String) {
          allAmazonS3Buckets(where: { project: { apiKeys: { apiKey: $apiKey } } }) {
            bucketName,
            prefix,
            region
          }
        }
      `,
      variables: {
        apiKey,
      },
    }),
  });
  const json = await response.json();
  const { data } = json;
  const { allAmazonS3Buckets } = data;

  return allAmazonS3Buckets[0];
};

const uploadAsset = async ({
  apiKey,
  filename,
  inputFieldName,
  stream,
  apiRoute,
  restApiEndpoint,
}: {
  apiKey: string;
  filename: string;
  inputFieldName: string;
  stream: Readable;
  apiRoute: string;
  restApiEndpoint: string;
}): Promise<any> => {
  const form = new FormData();

  form.append(inputFieldName, stream, filename);

  const response = await fetch(`${restApiEndpoint}/${apiRoute}`, {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

export const buildKeystoneCloudImageSrc = async ({
  apiKey,
  graphqlApiEndpoint,
  filename,
  imagesDomain,
}: {
  apiKey: string;
  graphqlApiEndpoint: string;
  filename: string;
  imagesDomain: string;
}) => {
  const imagesSubdomain = await getImagesSubdomain({ apiKey, graphqlApiEndpoint });

  return `http://${imagesSubdomain}.${imagesDomain}/${filename}`;
};

export const buildKeystoneCloudFileSrc = async ({
  apiKey,
  graphqlApiEndpoint,
  filename,
}: {
  apiKey: string;
  graphqlApiEndpoint: string;
  filename: string;
}) => {
  const { bucketName, prefix, region } = await getS3Bucket({ apiKey, graphqlApiEndpoint });

  return `https://${bucketName}.s3.${region}.amazonaws.com/${prefix}/${filename}`;
};

export const getImageMetadataFromKeystoneCloud = async ({
  apiKey,
  filename,
  restApiEndpoint,
}: {
  apiKey: string;
  filename: string;
  restApiEndpoint: string;
}): Promise<ImageMetadata> => {
  const response = await fetch(`${restApiEndpoint}/images/${filename}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

export const getFileSizeFromKeystoneCloud = async ({
  apiKey,
  filename,
  graphqlApiEndpoint,
  restApiEndpoint,
}: {
  apiKey: string;
  filename: string;
  graphqlApiEndpoint: string;
  restApiEndpoint: string;
}): Promise<number> => {
  const { bucketName, prefix } = await getS3Bucket({ apiKey, graphqlApiEndpoint });
  const response = await fetch(`${restApiEndpoint}/files/${bucketName}/${prefix}/${filename}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return await response.json();
};

export const uploadImageToKeystoneCloud = async ({
  apiKey,
  stream,
  filename,
  restApiEndpoint,
}: {
  apiKey: string;
  stream: Readable;
  filename: string;
  restApiEndpoint: string;
}): Promise<ImageMetadata> =>
  uploadAsset({
    apiKey,
    stream,
    filename,
    restApiEndpoint,
    inputFieldName: 'image',
    apiRoute: 'images',
  });

export const uploadFileToKeystoneCloud = async ({
  apiKey,
  stream,
  filename,
  restApiEndpoint,
}: {
  apiKey: string;
  stream: Readable;
  filename: string;
  restApiEndpoint: string;
}) =>
  uploadAsset({
    apiKey,
    stream,
    filename,
    restApiEndpoint,
    inputFieldName: 'file',
    apiRoute: 'files',
  });
