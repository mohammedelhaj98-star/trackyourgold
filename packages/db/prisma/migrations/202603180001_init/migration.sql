CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "ItemCategory" AS ENUM ('JEWELRY', 'COIN', 'BAR', 'SCRAP', 'OTHER');
CREATE TYPE "SourceType" AS ENUM ('api', 'retail_html');
CREATE TYPE "FetchMethod" AS ENUM ('api_json', 'html_static', 'html_headless');
CREATE TYPE "ScrapingRisk" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "Confidence" AS ENUM ('high', 'medium', 'low');
CREATE TYPE "IngestStatus" AS ENUM ('ok', 'partial', 'failed');
CREATE TYPE "ValuationMode" AS ENUM ('intrinsic', 'retail', 'sell_est');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en',
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "last_used_at" TIMESTAMPTZ NULL
);
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

CREATE TABLE "markets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "name_en" TEXT NOT NULL,
  "name_ar" TEXT NOT NULL,
  "default_currency" TEXT NOT NULL DEFAULT 'QAR',
  "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "vaults" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "default_currency" TEXT NOT NULL DEFAULT 'QAR',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "vaults_owner_id_idx" ON "vaults"("owner_id");

CREATE TABLE "vault_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vault_id" UUID NOT NULL REFERENCES "vaults"("id") ON DELETE CASCADE,
  "item_name" TEXT NOT NULL,
  "category" "ItemCategory" NOT NULL,
  "purity_karat" INTEGER NOT NULL CHECK ("purity_karat" IN (24, 23, 22, 21, 18, 14, 12, 10, 9, 8)),
  "gross_weight_g" NUMERIC(12,4) NOT NULL,
  "stone_weight_g" NUMERIC(12,4) NOT NULL DEFAULT 0,
  "net_gold_weight_g" NUMERIC(12,4) NOT NULL DEFAULT 0,
  "purchase_date" DATE NOT NULL,
  "purchase_total_price_qar" NUMERIC(14,2) NOT NULL,
  "making_charges_qar" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "vat_qar" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "purchase_store_name" TEXT NULL,
  "purchase_location" TEXT NULL,
  "purchase_notes" TEXT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "vault_items_vault_id_idx" ON "vault_items"("vault_id");

CREATE TABLE "price_sources" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "source_type" "SourceType" NOT NULL,
  "host" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "fetch_method" "FetchMethod" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "scraping_risk" "ScrapingRisk" NOT NULL,
  "confidence" "Confidence" NOT NULL,
  "update_hint_minutes" INTEGER NOT NULL DEFAULT 10,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "source_robots_cache" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_id" UUID NOT NULL REFERENCES "price_sources"("id") ON DELETE CASCADE,
  "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMPTZ NOT NULL,
  "robots_txt" TEXT NOT NULL,
  "allow_all" BOOLEAN NOT NULL DEFAULT FALSE,
  "parsed_ok" BOOLEAN NOT NULL DEFAULT FALSE,
  "notes" TEXT NULL
);
CREATE INDEX "source_robots_cache_source_id_expires_at_idx" ON "source_robots_cache"("source_id", "expires_at");

CREATE TABLE "raw_snapshot_blobs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "encoding" TEXT NOT NULL,
  "content_type" TEXT NULL,
  "payload" BYTEA NOT NULL,
  "sha256" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "price_snapshots_raw" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_id" UUID NOT NULL REFERENCES "price_sources"("id") ON DELETE CASCADE,
  "blob_id" UUID NOT NULL REFERENCES "raw_snapshot_blobs"("id") ON DELETE CASCADE,
  "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "http_status" INTEGER NOT NULL,
  "content_type" TEXT NULL,
  "parse_ok" BOOLEAN NOT NULL DEFAULT FALSE,
  "parse_error" TEXT NULL
);
CREATE INDEX "price_snapshots_raw_source_id_fetched_at_idx" ON "price_snapshots_raw"("source_id", "fetched_at" DESC);

CREATE TABLE "prices_normalized" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_id" UUID NOT NULL REFERENCES "price_sources"("id") ON DELETE CASCADE,
  "as_of" TIMESTAMPTZ NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'QAR',
  "unit" TEXT NOT NULL DEFAULT 'per_gram',
  "price_24k_per_gram" NUMERIC(14,4) NOT NULL,
  "price_23k_per_gram" NUMERIC(14,4) NULL,
  "price_22k_per_gram" NUMERIC(14,4) NOT NULL,
  "price_21k_per_gram" NUMERIC(14,4) NULL,
  "price_18k_per_gram" NUMERIC(14,4) NULL,
  "price_14k_per_gram" NUMERIC(14,4) NULL,
  "price_12k_per_gram" NUMERIC(14,4) NULL,
  "price_10k_per_gram" NUMERIC(14,4) NULL,
  "price_9k_per_gram" NUMERIC(14,4) NULL,
  "price_8k_per_gram" NUMERIC(14,4) NULL,
  "meta" JSONB NOT NULL DEFAULT '{}'::JSONB
);
CREATE INDEX "prices_normalized_source_id_as_of_idx" ON "prices_normalized"("source_id", "as_of" DESC);

CREATE TABLE "ingest_runs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "run_finished_at" TIMESTAMPTZ NULL,
  "status" "IngestStatus" NOT NULL,
  "summary" JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE TABLE "source_health" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_id" UUID NOT NULL UNIQUE REFERENCES "price_sources"("id") ON DELETE CASCADE,
  "last_success_at" TIMESTAMPTZ NULL,
  "last_failure_at" TIMESTAMPTZ NULL,
  "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT NULL,
  "last_http_status" INTEGER NULL,
  "last_parsed_as_of" TIMESTAMPTZ NULL,
  "stale_after_minutes" INTEGER NOT NULL DEFAULT 60
);

CREATE TABLE "valuation_cache" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vault_id" UUID NOT NULL REFERENCES "vaults"("id") ON DELETE CASCADE,
  "mode" "ValuationMode" NOT NULL,
  "computed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMPTZ NOT NULL,
  "as_of" TIMESTAMPTZ NOT NULL,
  "payload" JSONB NOT NULL,
  UNIQUE ("vault_id", "mode")
);

CREATE TABLE "seo_metadata" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "canonical" TEXT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "content_pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "template_key" TEXT NOT NULL,
  "body" JSONB NOT NULL DEFAULT '{}'::JSONB,
  "seo_metadata_id" UUID NULL REFERENCES "seo_metadata"("id") ON DELETE SET NULL,
  "published" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "blog_articles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NULL,
  "body" JSONB NOT NULL DEFAULT '{}'::JSONB,
  "seo_metadata_id" UUID NULL REFERENCES "seo_metadata"("id") ON DELETE SET NULL,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "faqs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "question_en" TEXT NOT NULL,
  "question_ar" TEXT NOT NULL,
  "answer_en" TEXT NOT NULL,
  "answer_ar" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
