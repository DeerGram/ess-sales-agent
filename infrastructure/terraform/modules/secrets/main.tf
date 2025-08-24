resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(var.secret_names)
  secret_id = each.key
  replication {
    automatic = true
  }
  project = var.project_id
}

resource "google_secret_manager_secret_iam_member" "access" {
  for_each = { for sa in var.accessor_service_accounts : sa => sa }
  project  = var.project_id
  secret_id = google_secret_manager_secret.secrets[values(google_secret_manager_secret.secrets)[0].secret_id].secret_id
  role     = "roles/secretmanager.secretAccessor"
  member   = "serviceAccount:${each.key}"
}

resource "google_secret_manager_secret_iam_member" "access_all" {
  for_each = { for pair in setproduct(var.secret_names, var.accessor_service_accounts) : join("|", pair) => { secret = pair[0], sa = pair[1] } }
  project  = var.project_id
  secret_id = google_secret_manager_secret.secrets[each.value.secret].secret_id
  role     = "roles/secretmanager.secretAccessor"
  member   = "serviceAccount:${each.value.sa}"
}


