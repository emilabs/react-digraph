terraform {
  backend "s3" {
    bucket = "emi-terraform-backend"
    key    = "flow-editor" # TODO put your service name
    region = "us-east-1"
  }
}

provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}
