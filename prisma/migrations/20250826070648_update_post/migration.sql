/*
  Warnings:

  - You are about to drop the column `Image` on the `post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."post" DROP COLUMN "Image";

-- CreateTable
CREATE TABLE "public"."image" (
    "Id" SERIAL NOT NULL,
    "Post_id" INTEGER NOT NULL,
    "Url" TEXT NOT NULL,
    "Order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "image_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."comment_like" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Comment_id" INTEGER NOT NULL,

    CONSTRAINT "comment_like_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_like_User_id_Comment_id_key" ON "public"."comment_like"("User_id", "Comment_id");

-- AddForeignKey
ALTER TABLE "public"."image" ADD CONSTRAINT "image_Post_id_fkey" FOREIGN KEY ("Post_id") REFERENCES "public"."post"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment_like" ADD CONSTRAINT "comment_like_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment_like" ADD CONSTRAINT "comment_like_Comment_id_fkey" FOREIGN KEY ("Comment_id") REFERENCES "public"."comment"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
