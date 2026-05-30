variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "region" {
  description = "Primary GCP region."
  type        = string
  default     = "asia-southeast1"
}

variable "service_name" {
  description = "Cloud Run service name."
  type        = string
  default     = "aether-pqc"
}

variable "database_tier" {
  description = "Cheapest MVP Cloud SQL tier. Shared-core tiers have limited production guarantees."
  type        = string
  default     = "db-f1-micro"
}
