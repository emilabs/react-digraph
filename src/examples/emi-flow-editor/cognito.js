import AWS from 'aws-sdk';

import { STG, PROD } from './common.js';

const ID_POOL_ID = 'us-east-1:db1a5306-0cf4-4b11-802d-6b2fd43e6c6e';
const AWS_REGION = 'us-east-1';
const STG_BUCKET = 'flow-editor--flow-defs';
const PROD_BUCKET = 'flow--def-files';
const GOOGLE_CLIENT_ID =
  '324398625718-rp770umn6bcpd7p8ksug57kdu52a1per.apps.googleusercontent.com';

const ENV_BUCKETS = {
  [STG]: STG_BUCKET,
  [PROD]: PROD_BUCKET,
};

const connect = response => {
  // const myCredentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: ID_POOL_ID });
  const authResult = response.getAuthResponse();

  AWS.config.update({
    region: AWS_REGION,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: ID_POOL_ID,
      Logins: {
        'accounts.google.com': authResult.id_token,
      },
    }),
  });

  // const identityId = AWS.config.credentials.identityId;
  const promise = new Promise(function(resolve, reject) {
    AWS.config.getCredentials(function(err) {
      if (err) {
        reject(err);
      } else {
        const s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          params: { Bucket: STG_BUCKET },
        });

        resolve(s3);
      }
    });
  });

  return promise;
};

export { connect, GOOGLE_CLIENT_ID, STG_BUCKET, PROD_BUCKET, ENV_BUCKETS };
