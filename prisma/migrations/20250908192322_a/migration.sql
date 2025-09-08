-- CreateTable
CREATE TABLE "public"."account" (
    "Id" SERIAL NOT NULL,
    "Fullname" TEXT NOT NULL,
    "User_name" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Story" TEXT NOT NULL,
    "Avatar" TEXT,
    "phone" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Time" TIMESTAMP(3) NOT NULL,
    "Title" TEXT NOT NULL,
    "Video" TEXT,
    "Mode" TEXT NOT NULL,
    "Content" TEXT NOT NULL,
    "Heart_count" INTEGER NOT NULL,
    "Address" TEXT,
    "Sports" TEXT,
    "Topic" TEXT,

    CONSTRAINT "post_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."image" (
    "Id" SERIAL NOT NULL,
    "Post_id" INTEGER NOT NULL,
    "Url" TEXT NOT NULL,
    "Order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "image_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."comment" (
    "Id" SERIAL NOT NULL,
    "Id_account" INTEGER NOT NULL,
    "Post_id" INTEGER NOT NULL,
    "CreateAt" TIMESTAMP(3) NOT NULL,
    "Parent_id" INTEGER,
    "Like_count" INTEGER NOT NULL,
    "Content" TEXT NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "Id" SERIAL NOT NULL,
    "Sender_id" INTEGER NOT NULL,
    "Receiver_id" INTEGER NOT NULL,
    "Content" TEXT NOT NULL,
    "Status" BOOLEAN NOT NULL,
    "CreateAt" TIMESTAMP(3) NOT NULL,
    "shared_post_id" INTEGER,
    "shared_post_data" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Actor_id" INTEGER,
    "Title" TEXT NOT NULL,
    "Is_read" BOOLEAN NOT NULL DEFAULT false,
    "CreateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" INTEGER,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."follow" (
    "Id" SERIAL NOT NULL,
    "Follower_id" INTEGER NOT NULL,
    "Following_id" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."post_like" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Post_id" INTEGER NOT NULL,

    CONSTRAINT "post_like_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."comment_like" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Comment_id" INTEGER NOT NULL,

    CONSTRAINT "comment_like_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."block" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Blocked_id" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."SportField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "SportField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Court" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sportFieldId" INTEGER NOT NULL,
    "weekdayPrice" DOUBLE PRECISION NOT NULL,
    "weekendPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "paymentProof" TEXT,
    "note" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingSlot" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "courtId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BookingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_User_name_key" ON "public"."account"("User_name");

-- CreateIndex
CREATE UNIQUE INDEX "notification_bookingId_key" ON "public"."notification"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_like_User_id_Comment_id_key" ON "public"."comment_like"("User_id", "Comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "block_User_id_Blocked_id_key" ON "public"."block"("User_id", "Blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSlot_courtId_startTime_key" ON "public"."BookingSlot"("courtId", "startTime");

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image" ADD CONSTRAINT "image_Post_id_fkey" FOREIGN KEY ("Post_id") REFERENCES "public"."post"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_Id_account_fkey" FOREIGN KEY ("Id_account") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_Post_id_fkey" FOREIGN KEY ("Post_id") REFERENCES "public"."post"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_Sender_id_fkey" FOREIGN KEY ("Sender_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_Receiver_id_fkey" FOREIGN KEY ("Receiver_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_Actor_id_fkey" FOREIGN KEY ("Actor_id") REFERENCES "public"."account"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow" ADD CONSTRAINT "follow_Follower_id_fkey" FOREIGN KEY ("Follower_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow" ADD CONSTRAINT "follow_Following_id_fkey" FOREIGN KEY ("Following_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_like" ADD CONSTRAINT "post_like_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_like" ADD CONSTRAINT "post_like_Post_id_fkey" FOREIGN KEY ("Post_id") REFERENCES "public"."post"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment_like" ADD CONSTRAINT "comment_like_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comment_like" ADD CONSTRAINT "comment_like_Comment_id_fkey" FOREIGN KEY ("Comment_id") REFERENCES "public"."comment"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_Blocked_id_fkey" FOREIGN KEY ("Blocked_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SportField" ADD CONSTRAINT "SportField_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_sportFieldId_fkey" FOREIGN KEY ("sportFieldId") REFERENCES "public"."SportField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingSlot" ADD CONSTRAINT "BookingSlot_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingSlot" ADD CONSTRAINT "BookingSlot_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
