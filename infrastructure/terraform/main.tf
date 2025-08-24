terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  secret_names = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_MESSAGING_SID",
    "TWILIO_VOICE_CALLER_ID",
    "AIRTABLE_API_KEY",
    "AIRTABLE_BASE_ID",
    "AIRTABLE_LEADS_TABLE",
    "AIRTABLE_INTERACTIONS_TABLE",
    "CONVERTKIT_API_KEY",
    "CONVERTKIT_API_SECRET",
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID",
    "GCP_PROJECT_ID",
    "GCP_LOCATION",
    "GEMINI_MODEL",
  ]
}

data "google_secret_manager_secret_version" "secrets" {
  for_each = toset(local.secret_names)
  secret   = each.key
  project  = var.project_id
}

module "secrets" {
  source                   = "./modules/secrets"
  project_id               = var.project_id
  secret_names             = local.secret_names
  accessor_service_accounts = var.accessor_service_accounts
}



