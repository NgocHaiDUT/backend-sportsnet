-- CreateTable
CREATE TABLE "public"."account" (
    "Id" SERIAL NOT NULL,
    "Fullname" TEXT NOT NULL,
    "User_name" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Story" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Time" TIMESTAMP(3) NOT NULL,
    "Title" TEXT NOT NULL,
    "Image" TEXT NOT NULL,
    "Video" TEXT NOT NULL,
    "Mode" TEXT NOT NULL,
    "Content" TEXT NOT NULL,
    "Heart_count" INTEGER NOT NULL,
    "Address" TEXT NOT NULL,
    "Sports" TEXT NOT NULL,
    "Topic" TEXT NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("Id")
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

    CONSTRAINT "messages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Is_read" BOOLEAN NOT NULL,
    "CreateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."schedule" (
    "Id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "Sports_field" INTEGER NOT NULL,
    "Status" BOOLEAN NOT NULL,
    "Total_hours" INTEGER NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."bill" (
    "Id" SERIAL NOT NULL,
    "Schedule_id" INTEGER NOT NULL,
    "Total_hours" INTEGER NOT NULL,
    "Discount" INTEGER NOT NULL,
    "Total_bill" INTEGER NOT NULL,
    "Deposit" INTEGER NOT NULL,
    "Status" BOOLEAN NOT NULL,

    CONSTRAINT "bill_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."detail_schedule" (
    "Id" SERIAL NOT NULL,
    "Id_schedule" INTEGER NOT NULL,
    "Id_sport_field" INTEGER NOT NULL,
    "Time_start" TIMESTAMP(3) NOT NULL,
    "Time_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detail_schedule_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_User_name_key" ON "public"."account"("User_name");

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "public"."schedule" ADD CONSTRAINT "schedule_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bill" ADD CONSTRAINT "bill_Schedule_id_fkey" FOREIGN KEY ("Schedule_id") REFERENCES "public"."schedule"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detail_schedule" ADD CONSTRAINT "detail_schedule_Id_schedule_fkey" FOREIGN KEY ("Id_schedule") REFERENCES "public"."schedule"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
