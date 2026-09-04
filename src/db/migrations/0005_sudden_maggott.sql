ALTER TABLE "store_settings" ALTER COLUMN "store_name" SET DEFAULT 'NBusiness';--> statement-breakpoint
ALTER TABLE "store_settings" ALTER COLUMN "store_tagline" SET DEFAULT 'Marketplace & Toko Kebutuhan Anak Terpercaya';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "store_description" text DEFAULT 'Pusat belanja perlengkapan bayi, pakaian anak, dan mainan edukasi terstandar SNI di NBusiness.';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "seo_meta_title" varchar(255) DEFAULT 'NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "seo_meta_description" text DEFAULT 'Beli perlengkapan bayi, baju anak modis, dan mainan edukatif terpercaya dengan pengiriman cepat ke seluruh Indonesia di NBusiness.';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "seo_keywords" text DEFAULT 'nbusiness, toko anak, perlengkapan bayi, baju anak, mainan edukasi, belanja anak online';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "seo_google_verification" varchar(255);--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "seo_og_image" text;