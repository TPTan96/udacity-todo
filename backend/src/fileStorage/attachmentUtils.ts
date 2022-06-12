import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {
    
    constructor(
        private readonly s3: AWS.S3 = createS3Client(),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    async getUploadUrl(todoId: string): Promise<string> {
        const url =this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration)
        })
        return url;
    }

    getAttachmentUrl(todoId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
    }
}

function createS3Client() : AWS.S3 {
    
    const s3 = new XAWS.S3({
        signatureVersion: 'v4'
    });
    return s3;
}