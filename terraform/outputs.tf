output "cloud_run_url" {
  value = google_cloud_run_v2_service.app.uri
}

output "artifact_bucket" {
  value = google_storage_bucket.artifacts.name
}

output "artifact_registry_repository" {
  value = google_artifact_registry_repository.app.name
}

output "cloud_sql_instance" {
  value = google_sql_database_instance.postgres.connection_name
}

output "cloud_run_service_account" {
  value = google_service_account.cloud_run.email
}
