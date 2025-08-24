variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "secret_names" {
  description = "List of Secret Manager secret IDs to ensure exist"
  type        = list(string)
}

variable "accessor_service_accounts" {
  description = "Service account emails to grant secret accessor on all secrets"
  type        = list(string)
  default     = []
}


