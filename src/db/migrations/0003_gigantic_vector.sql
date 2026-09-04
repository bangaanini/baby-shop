ALTER TABLE "products" ADD COLUMN "weight_gram" integer DEFAULT 500 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "dimension_length" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "dimension_width" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "dimension_height" integer DEFAULT 10 NOT NULL;