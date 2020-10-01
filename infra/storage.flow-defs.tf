resource "aws_s3_bucket" "flow_defs" {
  bucket = "flow-editor--flow-defs"

   cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  # lifecycle_rule: https://www.terraform.io/docs/providers/aws/r/s3_bucket.html#using-object-lifecycle
  # TODO add IAM role and allow access only from this app

  tags = {
    "service:name"        = "flow-editor"
    "service:component"   = "flow-editor.flow-defs"
    "service:environment" = "prod"
    "role"                = "business"
  }
}
