-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "order_number" SET DEFAULT concat('ORD', to_char(now()::timestamp, 'YYYYMMDDHH24MISS'), floor(random() * 1000)::int);
