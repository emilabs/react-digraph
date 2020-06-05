variable "aws_region" {
  default = "us-east-1"
}
variable "aws_profile" {
  default = "emi_aws"
}
variable "vpc_id" {
  default = "vpc-2729c35d"
}
variable "private_hosted_zone_id" {
  default     = "Z03808732K99FGUUTPDL"
  description = "The default value is emilab.io., most probably you don't need to change this."
}