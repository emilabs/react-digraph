resource "aws_s3_bucket" "flow_defs" {
  bucket = "flow-editor--flow-defs"

  versioning {
    enabled = true
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
