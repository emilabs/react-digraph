locals {
  domain    = "flow-editor.emilabs.io" # TODO `module.service.domain` will be emilabs.io by default, check if you want another one (must be the same domain as the used in `aws_acm_certificate`)
  origin_id = "s3-${aws_s3_bucket.website.bucket_domain_name}" # could be any unique id
}

resource "aws_s3_bucket" "website" {
  bucket = local.domain

  website { # https://www.terraform.io/docs/providers/aws/r/s3_bucket.html#website
    index_document = "index.html"
  }
  # cors_rule: https://www.terraform.io/docs/providers/aws/r/s3_bucket.html#cors_rule

  acl = "public-read" # TODO change to "private" once we start using cognito users pool and single sign on.
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${local.domain}/*"
        }
    ]
}
POLICY

  tags = {
    "service:name"        = "flow-editor"
    "service:component"   = "flow-editor.website"
    "service:environment" = "prod"
    "role"                = "business"
  }
}

data "aws_canonical_user_id" "current_user" {}

resource "aws_cloudfront_distribution" "website" {
  aliases = [
    local.domain,
  ]
  comment             = "Flow editor" # TODO
  default_root_object = "index.html"
  enabled             = true
  http_version        = "http2"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_All"
  retain_on_delete    = false
  wait_for_deployment = true

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = local.origin_id
  }

  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
    ]
    cached_methods = [
      "GET",
      "HEAD",
    ]
    compress               = false
    default_ttl            = 86400
    max_ttl                = 31536000
    min_ttl                = 0
    smooth_streaming       = false
    target_origin_id       = local.origin_id
    trusted_signers        = []
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      headers                 = []
      query_string            = false
      query_string_cache_keys = []

      cookies {
        forward           = "none"
        whitelisted_names = []
      }
    }
  }

  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = data.aws_acm_certificate.website.arn
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.1_2016"
    ssl_support_method             = "sni-only"
  }


  tags = {
    "service:name"        = "flow-editor"
    "service:component"   = "flow-editor.website"
    "service:environment" = "prod"
    "role" = "business" 
  }
}

data "aws_acm_certificate" "website" {
  domain      = "*.emilabs.io" # TODO check this is what you want
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

resource "aws_route53_record" "website" {
  zone_id = var.private_hosted_zone_id
  name    = local.domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = true
  }
}
