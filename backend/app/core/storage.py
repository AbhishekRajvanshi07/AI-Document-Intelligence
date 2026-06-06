"""
Cloudflare R2 storage client (S3-compatible).
Handles upload, download URL generation, and deletion.
"""
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_file_to_r2(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    """Upload bytes to R2 and return the object key."""
    client = get_r2_client()
    try:
        client.put_object(
            Bucket=settings.R2_BUCKET,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
        logger.info(f"Uploaded to R2: {key}")
        return key
    except ClientError as e:
        logger.error(f"R2 upload failed: {e}")
        raise


def get_presigned_url(key: str, expiry_seconds: int = 3600) -> str:
    """Generate a presigned download URL valid for expiry_seconds."""
    client = get_r2_client()
    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.R2_BUCKET, "Key": key},
            ExpiresIn=expiry_seconds,
        )
        return url
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        return ""


def delete_from_r2(key: str) -> bool:
    client = get_r2_client()
    try:
        client.delete_object(Bucket=settings.R2_BUCKET, Key=key)
        logger.info(f"Deleted from R2: {key}")
        return True
    except ClientError as e:
        logger.error(f"R2 delete failed: {e}")
        return False
