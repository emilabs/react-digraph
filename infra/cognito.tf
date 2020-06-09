resource "aws_iam_role" "viewer" {
  name = "google-flow-defs-viewer"
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRoleWithWebIdentity"
          Condition = {
            "ForAnyValue:StringLike" = {
              "cognito-identity.amazonaws.com:amr" = "authenticated"
            }
            StringEquals = {
              "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.flow_editor.id
            }
          }
          Effect = "Allow"
          Principal = {
            Federated = "cognito-identity.amazonaws.com"
          }
        },
      ]
      Version = "2012-10-17"
    }
  )
}

resource "aws_iam_policy" "manager" {
  name        = "google-flow-defs-manager"
  description = "Flow Editor without shipping access."
  path        = "/"
  policy = jsonencode(
    {
      Statement = [
        {
            Sid = "VisualEditor0",
            Effect = "Allow",
            Action = [
                "s3:PutAnalyticsConfiguration",
                "s3:GetObjectVersionTagging",
                "s3:CreateBucket",
                "s3:ReplicateObject",
                "s3:GetObjectAcl",
                "s3:GetBucketObjectLockConfiguration",
                "s3:PutLifecycleConfiguration",
                "s3:GetObjectVersionAcl",
                "s3:DeleteObject",
                "s3:GetBucketPolicyStatus",
                "s3:GetObjectRetention",
                "s3:GetBucketWebsite",
                "s3:PutReplicationConfiguration",
                "s3:PutObjectLegalHold",
                "s3:GetObjectLegalHold",
                "s3:GetBucketNotification",
                "s3:PutBucketCORS",
                "s3:GetReplicationConfiguration",
                "s3:ListMultipartUploadParts",
                "s3:PutObject",
                "s3:GetObject",
                "s3:PutBucketNotification",
                "s3:PutBucketLogging",
                "s3:GetAnalyticsConfiguration",
                "s3:PutBucketObjectLockConfiguration",
                "s3:GetObjectVersionForReplication",
                "s3:GetLifecycleConfiguration",
                "s3:GetInventoryConfiguration",
                "s3:GetBucketTagging",
                "s3:PutAccelerateConfiguration",
                "s3:DeleteObjectVersion",
                "s3:GetBucketLogging",
                "s3:ListBucketVersions",
                "s3:RestoreObject",
                "s3:ListBucket",
                "s3:GetAccelerateConfiguration",
                "s3:GetBucketPolicy",
                "s3:PutEncryptionConfiguration",
                "s3:GetEncryptionConfiguration",
                "s3:GetObjectVersionTorrent",
                "s3:AbortMultipartUpload",
                "s3:GetBucketRequestPayment",
                "s3:GetObjectTagging",
                "s3:GetMetricsConfiguration",
                "s3:PutBucketVersioning",
                "s3:GetBucketPublicAccessBlock",
                "s3:ListBucketMultipartUploads",
                "s3:PutMetricsConfiguration",
                "s3:GetBucketVersioning",
                "s3:GetBucketAcl",
                "s3:PutInventoryConfiguration",
                "s3:GetObjectTorrent",
                "s3:PutBucketWebsite",
                "s3:PutBucketRequestPayment",
                "s3:PutObjectRetention",
                "s3:GetBucketCORS",
                "s3:GetBucketLocation",
                "s3:ReplicateDelete",
                "s3:GetObjectVersion"
            ],
            Resource = [
                "arn:aws:s3:::flow-editor--flow-defs",
                "arn:aws:s3:::flow-editor--flow-defs/*"
            ]
        },
        {
            Sid = "VisualEditor1",
            Effect = "Allow",
            Action = [
                "s3:GetLifecycleConfiguration",
                "s3:GetBucketTagging",
                "s3:GetInventoryConfiguration",
                "s3:GetObjectVersionTagging",
                "s3:ListBucketVersions",
                "s3:GetBucketLogging",
                "s3:ListBucket",
                "s3:GetAccelerateConfiguration",
                "s3:GetBucketPolicy",
                "s3:GetObjectVersionTorrent",
                "s3:GetObjectAcl",
                "s3:GetEncryptionConfiguration",
                "s3:GetBucketObjectLockConfiguration",
                "s3:GetBucketRequestPayment",
                "s3:GetObjectVersionAcl",
                "s3:GetObjectTagging",
                "s3:GetMetricsConfiguration",
                "s3:GetBucketPublicAccessBlock",
                "s3:GetBucketPolicyStatus",
                "s3:ListBucketMultipartUploads",
                "s3:GetObjectRetention",
                "s3:GetBucketWebsite",
                "s3:GetBucketVersioning",
                "s3:GetBucketAcl",
                "s3:GetObjectLegalHold",
                "s3:GetBucketNotification",
                "s3:GetReplicationConfiguration",
                "s3:ListMultipartUploadParts",
                "s3:GetObject",
                "s3:GetObjectTorrent",
                "s3:GetBucketCORS",
                "s3:GetAnalyticsConfiguration",
                "s3:GetObjectVersionForReplication",
                "s3:GetBucketLocation",
                "s3:GetObjectVersion"
            ],
            Resource = [
                "arn:aws:s3:::flow--def-files",
                "arn:aws:s3:::flow--def-files/*"
            ]
        },
        {
            Sid = "VisualEditor2",
            Effect = "Allow",
            Action = [
                "s3:GetAccessPoint",
                "s3:GetAccountPublicAccessBlock",
                "s3:ListAccessPoints",
                "s3:ListJobs"
            ],
            Resource = "*"
        }
      ]
      Version = "2012-10-17"
    }
  )
}

resource "aws_iam_role_policy_attachment" "viewer_manager" {
  role       = aws_iam_role.viewer.name
  policy_arn = aws_iam_policy.manager.arn
}

resource "aws_iam_role" "admin" {
  name = "google-flow-defs-admin"
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRoleWithWebIdentity"
          Condition = {
            "ForAnyValue:StringLike" = {
              "cognito-identity.amazonaws.com:amr" = "authenticated"
            }
            StringEquals = {
              "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.flow_editor.id
            }
          }
          Effect = "Allow"
          Principal = {
            Federated = "cognito-identity.amazonaws.com"
          }
        },
      ]
      Version = "2012-10-17"
    }
  )
}

resource "aws_iam_policy" "admin" {
  name        = "google-flow-defs-admin"
  description = "Like a manager, but with prod access. Needed for the Flow Editor shipping features."
  path        = "/"
  policy = jsonencode(
    {
      Statement = [
        {
          Action = [
            "s3:DeleteObjectVersion",
            "s3:ListBucketVersions",
            "s3:ListBucket",
            "s3:GetBucketVersioning",
            "s3:GetBucketNotification",
            "s3:GetBucketPolicy",
            "s3:GetBucketObjectLockConfiguration",
            "s3:PutObject",
            "s3:GetObject",
            "s3:PutBucketNotification",
            "s3:PutBucketLogging",
            "s3:GetBucketCORS",
            "s3:PutBucketObjectLockConfiguration",
            "s3:DeleteObject",
            "s3:GetBucketLocation",
            "s3:GetObjectVersion",
          ]
          Effect = "Allow"
          Resource = [
            "arn:aws:s3:::flow--def-files",
            "arn:aws:s3:::flow--def-files/*",
          ]
          Sid = "VisualEditor0"
        },
        {
          Action = [
            "s3:GetAccessPoint",
            "s3:GetAccountPublicAccessBlock",
            "s3:ListAccessPoints",
            "s3:ListJobs",
          ]
          Effect   = "Allow"
          Resource = "*"
          Sid      = "VisualEditor1"
        },
      ]
      Version = "2012-10-17"
    }
  )
}

resource "aws_iam_role_policy_attachment" "admin_admin" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.admin.arn
}

resource "aws_iam_role_policy_attachment" "admin_manager" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.manager.arn
}

resource "aws_cognito_identity_pool_roles_attachment" "flow_editor" {
  identity_pool_id = aws_cognito_identity_pool.flow_editor.id
   roles = {
    "authenticated" = aws_iam_role.admin.arn
  }
  role_mapping {
    ambiguous_role_resolution = "Deny"
    identity_provider         = "accounts.google.com"
    type                      = "Rules"
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "diego@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "hernan@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "inaki@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "andy@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "nico@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "nick@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "federico@holaemi.com"
    }
    mapping_rule {
      claim      = "email"
      match_type = "Equals"
      role_arn   = aws_iam_role.admin.arn
      value      = "martin@holaemi.com"
    }
    # mapping_rule {
    #   claim      = "email"
    #   match_type = "Contains"
    #   role_arn   = "arn:aws:iam::072214094029:role/google-flow-defs-viewer"
    #   value      = "@holaemi.com"
    # }
  }
}

resource "aws_cognito_identity_pool" "flow_editor" {
  identity_pool_name               = "flow_editor"
  allow_unauthenticated_identities = false
  openid_connect_provider_arns     = []
  saml_provider_arns               = []
  # cognito_identity_providers {
  #   client_id               = aws_cognito_user_pool_client.staff.id
  #   provider_name           = aws_cognito_user_pool.staff.endpoint
  #   server_side_token_check = false
  # }
  supported_login_providers = {
    "accounts.google.com" = "324398625718-rp770umn6bcpd7p8ksug57kdu52a1per.apps.googleusercontent.com"
  }
  tags = {
    "service:environment" = "prod"
  }
}
