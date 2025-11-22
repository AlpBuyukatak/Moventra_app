-- CreateTable
CREATE TABLE "UserAvatar" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gender" TEXT,
    "bodyType" TEXT,
    "skinTone" TEXT,
    "hairColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "modelUrl" TEXT,
    "textureUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAvatarItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "avatarItemId" INTEGER NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAvatarItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatar_userId_key" ON "UserAvatar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatarItem_userId_avatarItemId_key" ON "UserAvatarItem"("userId", "avatarItemId");

-- AddForeignKey
ALTER TABLE "UserAvatar" ADD CONSTRAINT "UserAvatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAvatarItem" ADD CONSTRAINT "UserAvatarItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAvatarItem" ADD CONSTRAINT "UserAvatarItem_avatarItemId_fkey" FOREIGN KEY ("avatarItemId") REFERENCES "AvatarItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
