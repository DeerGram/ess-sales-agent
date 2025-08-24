variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "router_image" {
  description = "Container image for router-api"
  type        = string
}

variable "accessor_service_accounts" {
  description = "Service account emails to grant secret accessor"
  type        = list(string)
  default     = []
}


