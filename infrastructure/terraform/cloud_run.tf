resource "google_cloud_run_service" "router_api" {
  name     = "router-api"
  location = var.region

  template {
    spec {
      containers {
        image = var.router_image
        env = [
          for k in local.secret_names : {
            name = k
            value_from {
              secret_key_ref {
                name = k
                key  = "latest"
              }
            }
          }
        ]
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "router_invoker" {
  location = google_cloud_run_service.router_api.location
  project  = var.project_id
  service  = google_cloud_run_service.router_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}


