variable "env" {}
variable "buckets" { type = list(string) }

resource "aws_s3_bucket" "nexabiz" {
  for_each = toset(var.buckets)
  bucket   = "${each.key}-${var.env}"
  tags     = { Name = each.key, Env = var.env }
}

resource "aws_s3_bucket_versioning" "nexabiz" {
  for_each = aws_s3_bucket.nexabiz
  bucket   = each.value.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "nexabiz" {
  for_each = aws_s3_bucket.nexabiz
  bucket   = each.value.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "nexabiz" {
  for_each                = aws_s3_bucket.nexabiz
  bucket                  = each.value.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_names" { value = { for k, v in aws_s3_bucket.nexabiz : k => v.id } }
