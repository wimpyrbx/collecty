BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "product_groups" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL CHECK(length("name") > 0) UNIQUE,
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "product_types" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL CHECK(length("name") > 0) UNIQUE,
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "regions" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL CHECK(length("name") > 0) UNIQUE,
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "rating_groups" (
	"id"	INTEGER,
	"region_id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL CHECK(length("name") > 0),
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT,
	UNIQUE("region_id","name")
);
CREATE TABLE IF NOT EXISTS "ratings" (
	"id"	INTEGER,
	"rating_group_id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL CHECK(length("name") > 0),
	"minimum_age"	INTEGER,
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("rating_group_id") REFERENCES "rating_groups"("id") ON DELETE RESTRICT,
	UNIQUE("rating_group_id","name")
);
CREATE TABLE IF NOT EXISTS "products" (
	"id"	INTEGER,
	"product_group_id"	INTEGER NOT NULL,
	"product_type_id"	INTEGER NOT NULL,
	"region_id"	INTEGER NOT NULL,
	"rating_id"	INTEGER,
	"pricecharting_id"	INTEGER,
	"title"	TEXT NOT NULL CHECK(length("title") > 0),
	"image_url"	TEXT CHECK("image_url" IS NULL OR (length("image_url") > 0 AND "image_url" LIKE 'http%://%')),
	"release_year"	INTEGER CHECK("release_year" BETWEEN 1950 AND 2050),
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("rating_id") REFERENCES "ratings"("id") ON DELETE RESTRICT,
	FOREIGN KEY("product_type_id") REFERENCES "product_types"("id") ON DELETE RESTRICT,
	FOREIGN KEY("product_group_id") REFERENCES "product_groups"("id") ON DELETE RESTRICT,
	FOREIGN KEY("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT,
	UNIQUE("title","product_group_id","region_id")
);
CREATE TABLE IF NOT EXISTS "inventory" (
	"id"	INTEGER,
	"product_id"	INTEGER NOT NULL,
	"barcode"	TEXT CHECK("barcode" IS NULL OR length("barcode") > 0),
	"price_override"	REAL CHECK("price_override" IS NULL OR "price_override" >= 0),
	"comment"	TEXT CHECK("comment" IS NULL OR length("comment") > 0),
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
	UNIQUE("barcode")
);
CREATE TABLE IF NOT EXISTS "product_attribute_values" (
	"id"	INTEGER,
	"product_id"	INTEGER NOT NULL,
	"attribute_id"	INTEGER NOT NULL,
	"value"	TEXT NOT NULL,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT,
	FOREIGN KEY("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
	UNIQUE("product_id","attribute_id")
);
CREATE TABLE IF NOT EXISTS "inventory_attribute_values" (
	"id"	INTEGER,
	"inventory_id"	INTEGER NOT NULL,
	"attribute_id"	INTEGER NOT NULL,
	"value"	TEXT NOT NULL,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT,
	FOREIGN KEY("inventory_id") REFERENCES "inventory"("id") ON DELETE RESTRICT,
	UNIQUE("inventory_id","attribute_id")
);
CREATE TABLE IF NOT EXISTS "pricecharting_prices" (
	"id"	INTEGER,
	"product_id"	INTEGER NOT NULL,
	"loose_usd"	REAL CHECK("loose_usd" IS NULL OR "loose_usd" >= 0),
	"cib_usd"	REAL CHECK("cib_usd" IS NULL OR "cib_usd" >= 0),
	"new_usd"	REAL CHECK("new_usd" IS NULL OR "new_usd" >= 0),
	"manual_only_usd"	REAL CHECK("manual_only_usd" IS NULL OR "manual_only_usd" >= 0),
	"box_only_usd"	REAL CHECK("box_only_usd" IS NULL OR "box_only_usd" >= 0),
	"loose_nok"	REAL CHECK("loose_nok" IS NULL OR "loose_nok" >= 0),
	"cib_nok"	REAL CHECK("cib_nok" IS NULL OR "cib_nok" >= 0),
	"new_nok"	REAL CHECK("new_nok" IS NULL OR "new_nok" >= 0),
	"manual_only_nok"	REAL CHECK("manual_only_nok" IS NULL OR "manual_only_nok" >= 0),
	"box_only_nok"	REAL CHECK("box_only_nok" IS NULL OR "box_only_nok" >= 0),
	"loose_nok_fixed"	REAL CHECK("loose_nok_fixed" IS NULL OR "loose_nok_fixed" >= 0),
	"cib_nok_fixed"	REAL CHECK("cib_nok_fixed" IS NULL OR "cib_nok_fixed" >= 0),
	"new_nok_fixed"	REAL CHECK("new_nok_fixed" IS NULL OR "new_nok_fixed" >= 0),
	"manual_only_nok_fixed"	REAL CHECK("manual_only_nok_fixed" IS NULL OR "manual_only_nok_fixed" >= 0),
	"box_only_nok_fixed"	REAL CHECK("box_only_nok_fixed" IS NULL OR "box_only_nok_fixed" >= 0),
	"usd_nok_rate"	REAL NOT NULL CHECK("usd_nok_rate" > 0),
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "product_sites" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL CHECK(length("name") > 0) UNIQUE,
	"base_url"	TEXT NOT NULL CHECK(length("base_url") > 0 AND "base_url" LIKE 'http%://%'),
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "product_site_links" (
	"id"	INTEGER,
	"product_id"	INTEGER NOT NULL,
	"site_id"	INTEGER NOT NULL,
	"url_path"	TEXT NOT NULL CHECK(length("url_path") > 0),
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY("site_id") REFERENCES "product_sites"("id") ON DELETE RESTRICT,
	FOREIGN KEY("product_id") REFERENCES "products"("id") ON DELETE RESTRICT,
	PRIMARY KEY("id" AUTOINCREMENT),
	UNIQUE("product_id","site_id")
);
CREATE TABLE IF NOT EXISTS "attributes" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL CHECK(length("name") > 0) UNIQUE,
	"ui_name"	TEXT NOT NULL CHECK(length("ui_name") > 0),
	"type"	TEXT NOT NULL CHECK("type" IN ('boolean', 'string', 'number', 'set')),
	"scope"	TEXT NOT NULL CHECK("scope" IN ('product', 'inventory')),
	"allowed_values"	TEXT,
	"product_type_ids"	TEXT,
	"product_group_ids"	TEXT,
	"is_required"	BOOLEAN NOT NULL DEFAULT 0,
	"default_value"	TEXT,
	"description"	TEXT,
	"is_active"	BOOLEAN NOT NULL DEFAULT 1,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"show_in_ui"	BOOLEAN NOT NULL DEFAULT 1,
	"show_if_empty"	BOOLEAN NOT NULL DEFAULT 0,
	"use_image"	BOOLEAN NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "product_groups" VALUES (1,'Xbox 360','Microsoft Xbox 360 gaming console and related items',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_groups" VALUES (2,'PlayStation 3','Sony PlayStation 3 gaming console and related items',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_groups" VALUES (3,'PlayStation 4','Sony PlayStation 4 gaming console and related items',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_groups" VALUES (4,'Nintendo Wii','Nintendo Wii gaming console and related items',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_groups" VALUES (5,'Nintendo Wii U','Nintendo Wii U gaming console and related items',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_types" VALUES (1,'Game',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_types" VALUES (2,'Peripherals',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_types" VALUES (3,'Console',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "regions" VALUES (1,'PAL',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "regions" VALUES (2,'NTSC',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "regions" VALUES (3,'NTSC-J',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "rating_groups" VALUES (1,1,'PEGI',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "rating_groups" VALUES (2,2,'ESRB',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "rating_groups" VALUES (3,1,'USK',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "rating_groups" VALUES (4,1,'ACB',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "rating_groups" VALUES (5,1,'BBFC',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "rating_groups" VALUES (6,3,'CERO',NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (1,1,'PEGI 3',3,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (2,1,'PEGI 7',7,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (3,1,'PEGI 12',12,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (4,1,'PEGI 16',16,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (5,1,'PEGI 18',18,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (6,6,'CERO A',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (7,6,'CERO B',12,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (8,6,'CERO C',15,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (9,6,'CERO D',17,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (10,6,'CERO Z',18,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (11,4,'ACB G',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (12,4,'ACB M',15,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (13,4,'ACB M15',15,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (14,4,'ACB PG',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (15,4,'ACB R18',18,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (16,5,'BBFC 12',12,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (17,5,'BBFC 15',15,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (18,5,'BBFC 18',18,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (19,5,'BBFC PG',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (20,5,'BBFC U',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (21,2,'ESRB E',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (22,2,'ESRB EC',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (23,2,'ESRB E10',10,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (24,2,'ESRB T',13,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (25,2,'ESRB M',17,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (26,3,'USK 0',0,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (27,3,'USK 6',6,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (28,3,'USK 12',12,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (29,3,'USK 16',16,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "ratings" VALUES (30,3,'USK 18',18,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (1,1,1,1,4,NULL,'Halo 3',NULL,2007,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (2,1,1,2,25,NULL,'Halo 3',NULL,2007,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (3,2,2,1,NULL,NULL,'DualShock 3 Controller',NULL,2006,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (4,4,1,1,1,NULL,'Wii Sports',NULL,2006,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (5,4,1,2,21,NULL,'Wii Sports',NULL,2006,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (6,4,1,3,6,NULL,'Wii Sports',NULL,2006,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (7,1,3,1,NULL,NULL,'Xbox 360 Elite Console',NULL,2007,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "products" VALUES (8,2,3,1,NULL,NULL,'PlayStation 3 Slim Console',NULL,2009,NULL,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "attributes" VALUES (10,'isKinect','Kinect Support','boolean','product',NULL,'[1]','[1]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-24 15:08:09',1,0,1);
INSERT INTO "attributes" VALUES (11,'hasHDD','Hard Drive','boolean','product',NULL,'[1,3]','[1]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (12,'hasXboxLive','Xbox Live','boolean','product',NULL,'[1]','[1]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (13,'hasMove','PlayStation Move','boolean','product',NULL,'[1]','[2]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (14,'hasPlus','PlayStation Plus','boolean','product',NULL,'[1]','[2]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (15,'installSize','Install Size','set','product','["1GB", "2GB", "4GB", "8GB"]','[1]','[2]',1,'1GB',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (16,'hasMotionPlus','Motion Plus','boolean','product',NULL,'[1,2]','[4]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (17,'hasGamecube','Gamecube Support','boolean','product',NULL,'[1,3]','[4]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (18,'hasWifi','Built-in WiFi','boolean','product',NULL,'[3]','[1,2,4]',1,'0',NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "attributes" VALUES (19,'modelNumber','Model Number','string','product',NULL,'[3]',NULL,1,NULL,NULL,1,'2024-11-23 13:34:08','2024-11-23 13:34:08',1,0,0);
INSERT INTO "product_attribute_values" VALUES (1,1,12,'1','2024-11-23 23:32:14','2024-11-23 23:32:14');
INSERT INTO "product_attribute_values" VALUES (2,1,10,'0','2024-11-23 23:32:14','2024-11-23 23:32:14');
INSERT INTO "product_attribute_values" VALUES (3,1,11,'1','2024-11-23 23:32:14','2024-11-23 23:32:14');
INSERT INTO "product_attribute_values" VALUES (4,2,12,'1','2024-11-23 23:32:48','2024-11-23 23:32:48');
INSERT INTO "product_attribute_values" VALUES (5,2,10,'0','2024-11-23 23:32:48','2024-11-23 23:32:48');
INSERT INTO "product_attribute_values" VALUES (6,2,11,'1','2024-11-23 23:32:48','2024-11-23 23:32:48');
INSERT INTO "product_attribute_values" VALUES (7,4,16,'1','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "product_attribute_values" VALUES (8,4,17,'0','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "product_attribute_values" VALUES (9,7,18,'1','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "product_attribute_values" VALUES (10,7,19,'1439','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "product_attribute_values" VALUES (11,7,11,'1','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "product_attribute_values" VALUES (12,8,18,'1','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "product_attribute_values" VALUES (13,8,19,'CECH-2000','2024-11-23 23:32:53','2024-11-23 23:32:53');
INSERT INTO "pricecharting_prices" VALUES (1,1,10.0,20.0,100.0,5.0,5.0,100.0,200.0,1000.0,50.0,50.0,99.0,199.0,999.0,49.0,49.0,10.0,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "pricecharting_prices" VALUES (2,2,10.0,20.0,100.0,5.0,5.0,100.0,200.0,1000.0,50.0,50.0,99.0,199.0,999.0,49.0,49.0,10.0,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "pricecharting_prices" VALUES (3,3,20.0,30.0,60.0,NULL,5.0,200.0,300.0,600.0,NULL,50.0,199.0,299.0,599.0,NULL,49.0,10.0,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "pricecharting_prices" VALUES (4,4,15.0,25.0,80.0,5.0,5.0,150.0,250.0,800.0,50.0,50.0,149.0,249.0,799.0,49.0,49.0,10.0,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "pricecharting_prices" VALUES (5,7,50.0,100.0,200.0,10.0,20.0,500.0,1000.0,2000.0,100.0,200.0,499.0,999.0,1999.0,99.0,199.0,10.0,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "pricecharting_prices" VALUES (6,8,60.0,120.0,250.0,10.0,20.0,600.0,1200.0,2500.0,100.0,200.0,599.0,1199.0,2499.0,99.0,199.0,10.0,1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_sites" VALUES (1,'PriceCharting','https://www.pricecharting.com','Video game price tracking website',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_sites" VALUES (2,'MobyGames','https://www.mobygames.com','Video game database',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_sites" VALUES (3,'GameFAQs','https://gamefaqs.gamespot.com','Video game guides and community',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (1,1,1,'/xbox-360/halo-3-pal',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (2,1,2,'/game/4923/halo-3',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (3,2,1,'/xbox-360/halo-3-ntsc',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (4,2,2,'/game/4923/halo-3',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (5,4,1,'/wii/wii-sports-pal',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (6,4,2,'/game/3847/wii-sports',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (7,7,1,'/xbox-360/elite-console',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
INSERT INTO "product_site_links" VALUES (8,8,1,'/playstation-3/slim-console',1,'2024-11-23 13:26:58','2024-11-23 13:26:58');
CREATE INDEX IF NOT EXISTS "idx_product_groups_active" ON "product_groups" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_product_types_active" ON "product_types" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_regions_active" ON "regions" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_rating_groups_region" ON "rating_groups" (
	"region_id"
);
CREATE INDEX IF NOT EXISTS "idx_rating_groups_active" ON "rating_groups" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_ratings_group" ON "ratings" (
	"rating_group_id"
);
CREATE INDEX IF NOT EXISTS "idx_ratings_active" ON "ratings" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_products_group" ON "products" (
	"product_group_id"
);
CREATE INDEX IF NOT EXISTS "idx_products_type" ON "products" (
	"product_type_id"
);
CREATE INDEX IF NOT EXISTS "idx_products_region" ON "products" (
	"region_id"
);
CREATE INDEX IF NOT EXISTS "idx_products_rating" ON "products" (
	"rating_id"
);
CREATE INDEX IF NOT EXISTS "idx_products_pricecharting" ON "products" (
	"pricecharting_id"
);
CREATE INDEX IF NOT EXISTS "idx_products_active" ON "products" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_products_title" ON "products" (
	"title"
);
CREATE INDEX IF NOT EXISTS "idx_products_release_year" ON "products" (
	"release_year"
);
CREATE INDEX IF NOT EXISTS "idx_inventory_product" ON "inventory" (
	"product_id"
);
CREATE INDEX IF NOT EXISTS "idx_inventory_active" ON "inventory" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_inventory_barcode" ON "inventory" (
	"barcode"
);
CREATE INDEX IF NOT EXISTS "idx_product_attribute_values_product" ON "product_attribute_values" (
	"product_id"
);
CREATE INDEX IF NOT EXISTS "idx_product_attribute_values_attribute" ON "product_attribute_values" (
	"attribute_id"
);
CREATE INDEX IF NOT EXISTS "idx_inventory_attribute_values_inventory" ON "inventory_attribute_values" (
	"inventory_id"
);
CREATE INDEX IF NOT EXISTS "idx_inventory_attribute_values_attribute" ON "inventory_attribute_values" (
	"attribute_id"
);
CREATE INDEX IF NOT EXISTS "idx_pricecharting_prices_product" ON "pricecharting_prices" (
	"product_id"
);
CREATE INDEX IF NOT EXISTS "idx_pricecharting_prices_active" ON "pricecharting_prices" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_product_sites_active" ON "product_sites" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_product_site_links_product" ON "product_site_links" (
	"product_id"
);
CREATE INDEX IF NOT EXISTS "idx_product_site_links_site" ON "product_site_links" (
	"site_id"
);
CREATE INDEX IF NOT EXISTS "idx_product_site_links_active" ON "product_site_links" (
	"is_active"
);
CREATE INDEX IF NOT EXISTS "idx_attributes_type" ON "attributes" (
	"type"
);
CREATE INDEX IF NOT EXISTS "idx_attributes_scope" ON "attributes" (
	"scope"
);
CREATE INDEX IF NOT EXISTS "idx_attributes_active" ON "attributes" (
	"is_active"
);
CREATE TRIGGER update_product_groups_timestamp 
   AFTER UPDATE ON product_groups
BEGIN
   UPDATE product_groups SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_product_types_timestamp 
   AFTER UPDATE ON product_types
BEGIN
   UPDATE product_types SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_regions_timestamp 
   AFTER UPDATE ON regions
BEGIN
   UPDATE regions SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_rating_groups_timestamp 
   AFTER UPDATE ON rating_groups
BEGIN
   UPDATE rating_groups SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_ratings_timestamp 
   AFTER UPDATE ON ratings
BEGIN
   UPDATE ratings SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_products_timestamp 
   AFTER UPDATE ON products
BEGIN
   UPDATE products SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_inventory_timestamp 
   AFTER UPDATE ON inventory
BEGIN
   UPDATE inventory SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_product_attribute_values_timestamp 
   AFTER UPDATE ON product_attribute_values
BEGIN
   UPDATE product_attribute_values SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_inventory_attribute_values_timestamp 
   AFTER UPDATE ON inventory_attribute_values
BEGIN
   UPDATE inventory_attribute_values SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_pricecharting_prices_timestamp 
   AFTER UPDATE ON pricecharting_prices
BEGIN
   UPDATE pricecharting_prices SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_product_sites_timestamp 
   AFTER UPDATE ON product_sites
BEGIN
   UPDATE product_sites SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER update_product_site_links_timestamp 
   AFTER UPDATE ON product_site_links
BEGIN
   UPDATE product_site_links SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
CREATE TRIGGER validate_product_rating_region
   BEFORE INSERT ON products
   WHEN NEW.rating_id IS NOT NULL
BEGIN
   SELECT CASE 
       WHEN NOT EXISTS (
           SELECT 1 FROM ratings r
           JOIN rating_groups rg ON r.rating_group_id = rg.id
           WHERE r.id = NEW.rating_id 
           AND rg.region_id = NEW.region_id
       )
       THEN RAISE(ABORT, 'Rating must belong to the specified region')
   END;
END;
CREATE TRIGGER validate_product_rating_region_update
   BEFORE UPDATE ON products
   WHEN NEW.rating_id IS NOT NULL
BEGIN
   SELECT CASE 
       WHEN NOT EXISTS (
           SELECT 1 FROM ratings r
           JOIN rating_groups rg ON r.rating_group_id = rg.id
           WHERE r.id = NEW.rating_id 
           AND rg.region_id = NEW.region_id
       )
       THEN RAISE(ABORT, 'Rating must belong to the specified region')
   END;
END;
CREATE TRIGGER validate_attribute_value_insert
   BEFORE INSERT ON product_attribute_values
BEGIN
   SELECT CASE
       WHEN (SELECT type FROM attributes WHERE id = NEW.attribute_id) = 'boolean'
           AND NEW.value NOT IN ('0', '1')
           THEN RAISE(ABORT, 'Boolean attribute must be 0 or 1')
           
       WHEN (SELECT type FROM attributes WHERE id = NEW.attribute_id) = 'number'
           AND NOT NEW.value GLOB '[0-9]*[.][0-9]*' 
           AND NOT NEW.value GLOB '[0-9]*'
           THEN RAISE(ABORT, 'Number attribute must be numeric')
           
       WHEN (SELECT type FROM attributes WHERE id = NEW.attribute_id) = 'set'
           AND NOT EXISTS (
               SELECT 1 FROM json_each(
                   (SELECT allowed_values FROM attributes WHERE id = NEW.attribute_id)
               ) 
               WHERE value = NEW.value
           )
           THEN RAISE(ABORT, 'Set attribute value must be one of the allowed values')
   END;
END;
CREATE TRIGGER validate_inventory_attribute_value_insert
   BEFORE INSERT ON inventory_attribute_values
BEGIN
   SELECT CASE
       WHEN (SELECT type FROM attributes WHERE id = NEW.attribute_id) = 'boolean'
           AND NEW.value NOT IN ('0', '1')
           THEN RAISE(ABORT, 'Boolean attribute must be 0 or 1')
           
       WHEN (SELECT type FROM attributes WHERE id = NEW.attribute_id) = 'number'
           AND NOT NEW.value GLOB '[0-9]*[.][0-9]*' 
           AND NOT NEW.value GLOB '[0-9]*'
           THEN RAISE(ABORT, 'Number attribute must be numeric')
           
       WHEN (SELECT type FROM attributes WHERE id = NEW.attribute_id) = 'set'
           AND NOT EXISTS (
               SELECT 1 FROM json_each(
                   (SELECT allowed_values FROM attributes WHERE id = NEW.attribute_id)
               ) 
               WHERE value = NEW.value
           )
           THEN RAISE(ABORT, 'Set attribute value must be one of the allowed values')
   END;
END;
CREATE TRIGGER validate_attribute_scope_product
   BEFORE INSERT ON product_attribute_values
BEGIN
   SELECT CASE
       WHEN (SELECT scope FROM attributes WHERE id = NEW.attribute_id) != 'product'
       THEN RAISE(ABORT, 'This attribute cannot be used for products')
   END;
END;
CREATE TRIGGER validate_attribute_scope_inventory
   BEFORE INSERT ON inventory_attribute_values
BEGIN
   SELECT CASE
       WHEN (SELECT scope FROM attributes WHERE id = NEW.attribute_id) != 'inventory'
       THEN RAISE(ABORT, 'This attribute cannot be used for inventory items')
   END;
END;
CREATE TRIGGER validate_product_attribute_constraints
   BEFORE INSERT ON product_attribute_values
   WHEN (SELECT product_type_ids FROM attributes WHERE id = NEW.attribute_id) IS NOT NULL 
   OR (SELECT product_group_ids FROM attributes WHERE id = NEW.attribute_id) IS NOT NULL
BEGIN
   SELECT CASE
       WHEN (SELECT product_type_ids FROM attributes WHERE id = NEW.attribute_id) IS NOT NULL
       AND NOT EXISTS (
           SELECT 1 FROM products p
           WHERE p.id = NEW.product_id
           AND p.product_type_id IN (
               SELECT value FROM json_each(
                   (SELECT product_type_ids FROM attributes WHERE id = NEW.attribute_id)
               )
           )
       )
       THEN RAISE(ABORT, 'This attribute is not allowed for this product type')
       
       WHEN (SELECT product_group_ids FROM attributes WHERE id = NEW.attribute_id) IS NOT NULL
       AND NOT EXISTS (
           SELECT 1 FROM products p
           WHERE p.id = NEW.product_id
           AND p.product_group_id IN (
               SELECT value FROM json_each(
                   (SELECT product_group_ids FROM attributes WHERE id = NEW.attribute_id)
               )
           )
       )
       THEN RAISE(ABORT, 'This attribute is not allowed for this product group')
   END;
END;
CREATE TRIGGER update_attributes_timestamp 
   AFTER UPDATE ON attributes
BEGIN
   UPDATE attributes SET updated_at = CURRENT_TIMESTAMP
   WHERE id = NEW.id;
END;
COMMIT;
