-- CreateTable
CREATE TABLE "public"."post_like" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Post_id" INTEGER NOT NULL,

    CONSTRAINT "post_like_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "public"."post_like" ADD CONSTRAINT "post_like_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_like" ADD CONSTRAINT "post_like_Post_id_fkey" FOREIGN KEY ("Post_id") REFERENCES "public"."post"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
