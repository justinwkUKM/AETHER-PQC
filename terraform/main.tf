provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "storage.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = var.service_name
  description   = "AETHER-PQC container images"
  format        = "DOCKER"
  depends_on    = [google_project_service.services]
}

resource "google_storage_bucket" "artifacts" {
  name                        = "${var.project_id}-${var.service_name}-artifacts"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false
  depends_on                  = [google_project_service.services]
}

resource "google_sql_database_instance" "postgres" {
  name             = "${var.service_name}-postgres"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = var.database_tier
  }

  deletion_protection = true
  depends_on          = [google_project_service.services]
}

resource "google_sql_database" "app" {
  name     = "aether_pqc"
  instance = google_sql_database_instance.postgres.name
}

resource "google_service_account" "cloud_run" {
  account_id   = "${var.service_name}-run"
  display_name = "AETHER-PQC Cloud Run service account"
}

resource "google_secret_manager_secret" "secrets" {
  for_each = toset([
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
    "GEMINI_API_KEY"
  ])

  secret_id = "${var.service_name}-${lower(replace(each.value, "_", "-"))}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_cloud_run_v2_service" "app" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run.email

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}/${var.service_name}:latest"

      env {
        name  = "STORAGE_DRIVER"
        value = "gcs"
      }

      env {
        name  = "GCS_BUCKET_NAME"
        value = google_storage_bucket.artifacts.name
      }

      env {
        name  = "GEMINI_MODEL"
        value = "gemini-3.5-flash"
      }
    }
  }

  depends_on = [google_project_service.services]
}
