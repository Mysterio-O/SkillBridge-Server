var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import * as dotenv from "dotenv";
import express5 from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime? @default(now())\n  updatedAt     DateTime? @updatedAt\n  role          String?   @default("student")\n  phone         String?\n  status        String?   @default("active")\n  bio           String?\n  lastLoginAt   DateTime?\n  bannedAt      DateTime?\n  banReason     String?\n\n  sessions               Session[]\n  accounts               Account[]\n  tutorProfile           TutorProfile?\n  studentBookings        Booking[]      @relation("BookingStudent")\n  studentReviews         Review[]       @relation("ReviewStudent")\n  tutorReviews           Review[]       @relation("ReviewTutor")\n  cancelledTutorProfiles TutorProfile[] @relation("TutorProfileCancelledBy")\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Booking {\n  id String @id @default(cuid())\n\n  studentId      String\n  tutorProfileId String\n\n  startAt         DateTime\n  endAt           DateTime\n  timezone        String?\n  durationMinutes Int\n\n  hourlyRateSnapshot Decimal @db.Decimal(10, 2)\n  totalPrice         Decimal @db.Decimal(10, 2)\n  currency           String\n\n  status       BookingStatus @default(pending)\n  cancelledBy  CancelledBy?\n  cancelReason String?\n  completedAt  DateTime?\n\n  topic       String?\n  meetingLink String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  student User @relation("BookingStudent", fields: [studentId], references: [id], onDelete: Restrict)\n\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Restrict)\n  review       Review?\n\n  @@index([studentId])\n  @@index([tutorProfileId])\n  @@index([status, startAt])\n  @@map("bookings")\n}\n\nmodel Categories {\n  id          String   @id @default(cuid())\n  name        String   @unique\n  description String?\n  icon        String?\n  isActive    Boolean  @default(true)\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  tutorSubjects TutorSubjects[]\n\n  @@map("categories")\n}\n\nenum TutorSessionMode {\n  online\n  in_person\n  hybrid\n}\n\nenum MeetingPlatform {\n  zoom\n  google_meet\n  others\n}\n\nenum BookingStatus {\n  pending\n  confirmed\n  in_progress\n  completed\n  cancelled\n}\n\nenum CancelledBy {\n  student\n  tutor\n  admin\n}\n\nenum TutorProfileStatus {\n  pending\n  active\n  cancelled\n}\n\nenum TutorAvailability {\n  available\n  not_available\n}\n\nmodel Review {\n  id String @id @default(cuid())\n\n  bookingId String @unique\n  studentId String\n  tutorId   String\n\n  rating       Int\n  comment      String?\n  isHidden     Boolean @default(false)\n  hiddenReason String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n  student User    @relation("ReviewStudent", fields: [studentId], references: [id], onDelete: Restrict)\n  tutor   User    @relation("ReviewTutor", fields: [tutorId], references: [id], onDelete: Restrict)\n\n  @@index([tutorId])\n  @@map("reviews")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel TutorSubjects {\n  id         String @id @default(cuid())\n  tutorId    String\n  categoryId String\n\n  tutor    TutorProfile @relation(fields: [tutorId], references: [id], onDelete: Cascade)\n  category Categories   @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n\n  @@unique([tutorId, categoryId])\n  @@index([tutorId])\n  @@index([categoryId])\n  @@map("tutor_subjects")\n}\n\nmodel TutorProfile {\n  id     String @id @default(cuid())\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  headline   String?\n  about      String?\n  hourlyRate Decimal @db.Decimal(10, 2)\n  currency   String\n\n  avgRating   Decimal? @db.Decimal(3, 2)\n  reviewCount Int      @default(0)\n\n  yearsOfExperience Int?\n  languages         String[]\n  education         String?\n  certification     String?\n\n  sessionMode     TutorSessionMode\n  meetingPlatform MeetingPlatform\n  timezone        String?\n\n  isProfileComplete Boolean @default(false)\n  isActive          Boolean @default(true)\n\n  availability TutorAvailability @default(available)\n\n  status        TutorProfileStatus @default(pending)\n  cancelledById String?\n  cancelledBy   User?              @relation("TutorProfileCancelledBy", fields: [cancelledById], references: [id], onDelete: SetNull)\n\n  bookings Booking[]\n\n  cancelReason String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  subjects TutorSubjects[]\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"lastLoginAt","kind":"scalar","type":"DateTime"},{"name":"bannedAt","kind":"scalar","type":"DateTime"},{"name":"banReason","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"studentBookings","kind":"object","type":"Booking","relationName":"BookingStudent"},{"name":"studentReviews","kind":"object","type":"Review","relationName":"ReviewStudent"},{"name":"tutorReviews","kind":"object","type":"Review","relationName":"ReviewTutor"},{"name":"cancelledTutorProfiles","kind":"object","type":"TutorProfile","relationName":"TutorProfileCancelledBy"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"startAt","kind":"scalar","type":"DateTime"},{"name":"endAt","kind":"scalar","type":"DateTime"},{"name":"timezone","kind":"scalar","type":"String"},{"name":"durationMinutes","kind":"scalar","type":"Int"},{"name":"hourlyRateSnapshot","kind":"scalar","type":"Decimal"},{"name":"totalPrice","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"cancelledBy","kind":"enum","type":"CancelledBy"},{"name":"cancelReason","kind":"scalar","type":"String"},{"name":"completedAt","kind":"scalar","type":"DateTime"},{"name":"topic","kind":"scalar","type":"String"},{"name":"meetingLink","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"BookingStudent"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"BookingToTutorProfile"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":"bookings"},"Categories":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutorSubjects","kind":"object","type":"TutorSubjects","relationName":"CategoriesToTutorSubjects"}],"dbName":"categories"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isHidden","kind":"scalar","type":"Boolean"},{"name":"hiddenReason","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"student","kind":"object","type":"User","relationName":"ReviewStudent"},{"name":"tutor","kind":"object","type":"User","relationName":"ReviewTutor"}],"dbName":"reviews"},"TutorSubjects":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorSubjects"},{"name":"category","kind":"object","type":"Categories","relationName":"CategoriesToTutorSubjects"}],"dbName":"tutor_subjects"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"headline","kind":"scalar","type":"String"},{"name":"about","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"avgRating","kind":"scalar","type":"Decimal"},{"name":"reviewCount","kind":"scalar","type":"Int"},{"name":"yearsOfExperience","kind":"scalar","type":"Int"},{"name":"languages","kind":"scalar","type":"String"},{"name":"education","kind":"scalar","type":"String"},{"name":"certification","kind":"scalar","type":"String"},{"name":"sessionMode","kind":"enum","type":"TutorSessionMode"},{"name":"meetingPlatform","kind":"enum","type":"MeetingPlatform"},{"name":"timezone","kind":"scalar","type":"String"},{"name":"isProfileComplete","kind":"scalar","type":"Boolean"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"availability","kind":"enum","type":"TutorAvailability"},{"name":"status","kind":"enum","type":"TutorProfileStatus"},{"name":"cancelledById","kind":"scalar","type":"String"},{"name":"cancelledBy","kind":"object","type":"User","relationName":"TutorProfileCancelledBy"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfile"},{"name":"cancelReason","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subjects","kind":"object","type":"TutorSubjects","relationName":"TutorProfileToTutorSubjects"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CategoriesScalarFieldEnum: () => CategoriesScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  TutorSubjectsScalarFieldEnum: () => TutorSubjectsScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Booking: "Booking",
  Categories: "Categories",
  Review: "Review",
  TutorSubjects: "TutorSubjects",
  TutorProfile: "TutorProfile"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  phone: "phone",
  status: "status",
  bio: "bio",
  lastLoginAt: "lastLoginAt",
  bannedAt: "bannedAt",
  banReason: "banReason"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  startAt: "startAt",
  endAt: "endAt",
  timezone: "timezone",
  durationMinutes: "durationMinutes",
  hourlyRateSnapshot: "hourlyRateSnapshot",
  totalPrice: "totalPrice",
  currency: "currency",
  status: "status",
  cancelledBy: "cancelledBy",
  cancelReason: "cancelReason",
  completedAt: "completedAt",
  topic: "topic",
  meetingLink: "meetingLink",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoriesScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  icon: "icon",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorId: "tutorId",
  rating: "rating",
  comment: "comment",
  isHidden: "isHidden",
  hiddenReason: "hiddenReason",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorSubjectsScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  categoryId: "categoryId"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  headline: "headline",
  about: "about",
  hourlyRate: "hourlyRate",
  currency: "currency",
  avgRating: "avgRating",
  reviewCount: "reviewCount",
  yearsOfExperience: "yearsOfExperience",
  languages: "languages",
  education: "education",
  certification: "certification",
  sessionMode: "sessionMode",
  meetingPlatform: "meetingPlatform",
  timezone: "timezone",
  isProfileComplete: "isProfileComplete",
  isActive: "isActive",
  availability: "availability",
  status: "status",
  cancelledById: "cancelledById",
  cancelReason: "cancelReason",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var TutorProfileStatus = {
  pending: "pending",
  active: "active",
  cancelled: "cancelled"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});
var isProd = process.env.NODE_ENV === "production";
var auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [
    process.env.FRONTEND_URL,
    "http://localhost:3000"
  ].filter(Boolean),
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: isProd ? {
      sameSite: "none",
      secure: true,
      // partitioned: true,
      path: "/"
    } : {
      sameSite: "lax",
      secure: false,
      path: "/"
    }
  },
  user: {
    additionalFields: {
      role: { type: ["student", "tutor", "admin"], required: false, defaultValue: "student", input: false },
      phone: { type: "string", required: false },
      status: { type: ["active", "banned", "inactive"], required: false, defaultValue: "active", input: false },
      bio: { type: "string", required: false },
      lastLoginAt: { type: "date", required: false, input: false },
      bannedAt: { type: "date", required: false, input: false },
      banReason: { type: "string", required: false, input: false }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
      try {
        const info = await transporter.sendMail({
          from: `"Skill Bridge" <${process.env.APP_USER}>`,
          // sender address
          to: user.email,
          // list of recipients
          subject: "Verify Your Skill Bridge Account",
          // subject line
          text: "Verification Email",
          // plain text body
          html: `
                    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:20px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;">
                Skill Bridge
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px;color:#374151;">
              <h2 style="margin-top:0;font-size:18px;color:#111827;">
                Verify your email address
              </h2>

              <p style="font-size:14px;line-height:1.6;">
                Hi ${user.name ? user.name : "there"},
              </p>

              <p style="font-size:14px;line-height:1.6;">
                Thanks for signing up! Please confirm your email address by clicking the button below.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <a href="${verificationUrl}"
                      style="
                        background:#2563eb;
                        color:#ffffff;
                        padding:12px 20px;
                        text-decoration:none;
                        border-radius:6px;
                        font-size:14px;
                        display:inline-block;
                      "
                    >
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6b7280;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="font-size:12px;word-break:break-all;color:#2563eb;">
                ${verificationUrl}
              </p>

              <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:24px;">
                If you didn\u2019t create an account, you can safely ignore this email.
              </p>

              <p style="font-size:13px;color:#6b7280;">
                \u2014 Skill Bridge Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Skill Bridge. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

                    `
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Error while sending mail", err);
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});

// src/middleware/globalErrorHandler.ts
function prismaSafeDetails(err) {
  return {
    name: err?.name,
    code: err?.code ?? err?.errorCode,
    message: err?.message,
    meta: err?.meta
  };
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let statusCode = 500;
  let errMessage = "Internal server error";
  const isDev = process.env.NODE_ENV !== "production";
  const errDetails = isDev ? prismaSafeDetails(err) : void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errMessage = "You provided incorrect field(s).";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025":
        statusCode = 404;
        errMessage = "Record not found. The operation depends on a record that does not exist.";
        break;
      case "P2002":
        statusCode = 409;
        errMessage = "Duplicate key. This value already exists.";
        break;
      case "P2003":
        statusCode = 400;
        errMessage = "Foreign key constraint failed. You referenced an ID that doesn't exist.";
        break;
      case "P2011":
        statusCode = 400;
        errMessage = "Null constraint failed. A required field is missing.";
        break;
      case "P2000":
        statusCode = 400;
        errMessage = "Value too long for a column.";
        break;
      default:
        statusCode = 400;
        errMessage = "Database request failed.";
        break;
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errMessage = "Something went wrong during query execution. Please try again.";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    switch (err.errorCode) {
      case "P1000":
        statusCode = 401;
        errMessage = "Authentication failed. Please check DB credentials.";
        break;
      case "P1001":
        statusCode = 500;
        errMessage = "Cannot reach the database server.";
        break;
      default:
        statusCode = 500;
        errMessage = "Database initialization failed.";
        break;
    }
  }
  return res.status(statusCode).json({
    success: false,
    message: errMessage,
    ...isDev ? { details: errDetails } : {}
  });
}
var globalErrorHandler_default = errorHandler;

// src/middleware/notFound.ts
function notFound(req, res) {
  const path2 = req.path;
  console.log(path2);
  res.status(404).json({
    success: false,
    message: `your requested path: "${path2}" is not available`
  });
}

// src/modules/tutors/tutors.route.ts
import express from "express";

// src/modules/tutors/tutors.service.ts
var uniq = (arr) => Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
var addTutor = async (payload, userId) => {
  const incoming = payload.subjectCategoryIds ?? payload.subjects ?? [];
  const categoryIds = uniq(incoming);
  const result = await prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.create({
      data: {
        userId,
        headline: payload.headline?.trim() || null,
        about: payload.about?.trim() || null,
        hourlyRate: new prismaNamespace_exports.Decimal(payload.hourlyRate),
        currency: payload.currency.trim().toUpperCase(),
        yearsOfExperience: payload.yearsOfExperience ?? null,
        languages: payload.languages,
        education: payload.education?.trim() || null,
        certification: payload.certification?.trim() || null,
        sessionMode: payload.sessionMode,
        meetingPlatform: payload.meetingPlatform,
        timezone: payload.timezone?.trim() || null,
        availability: payload.availability
      },
      select: { id: true }
    });
    if (categoryIds.length) {
      await tx.tutorSubjects.createMany({
        data: categoryIds.map((categoryId) => ({
          tutorId: tutor.id,
          categoryId
        })),
        skipDuplicates: true
      });
    }
    return tx.tutorProfile.findUnique({
      where: { id: tutor.id },
      include: {
        subjects: { include: { category: true } }
      }
    });
  });
  return result;
};
var updateTutorApplication = async (applicationId, status, adminId) => {
  return prisma.$transaction(async (tx) => {
    const application = await tx.tutorProfile.findUniqueOrThrow({
      where: { id: applicationId },
      select: { id: true, userId: true, status: true }
    });
    if (application.status === status) {
      return tx.tutorProfile.findUniqueOrThrow({ where: { id: applicationId } });
    }
    const profileData = {
      status,
      cancelledBy: status === "cancelled" ? { connect: { id: adminId } } : { disconnect: true }
    };
    const updatedProfile = await tx.tutorProfile.update({
      where: { id: application.id },
      data: profileData
    });
    if (status === "active") {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "tutor" }
      });
    }
    if (status === "cancelled") {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "student" }
      });
    }
    return updatedProfile;
  });
};
var getTutors = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search;
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          headline: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          about: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          subjects: {
            some: {
              category: {
                name: {
                  contains: search,
                  mode: "insensitive"
                }
              }
            }
          }
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { bio: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          }
        }
      ]
    });
  }
  const whereCondition = {
    AND: [
      { status: { notIn: ["cancelled", "pending"] } },
      ...andConditions
    ]
  };
  const { tutors, total } = await prisma.$transaction(async (tx) => {
    const tutors2 = await tx.tutorProfile.findMany({
      take: limit,
      skip,
      where: whereCondition,
      include: {
        subjects: {
          include: {
            category: true
          }
        },
        user: {
          include: {
            tutorReviews: {
              where: {
                isHidden: false
              },
              orderBy: { createdAt: "desc" },
              take: 12,
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });
    const total2 = await tx.tutorProfile.count({
      where: whereCondition
    });
    return { tutors: tutors2, total: total2 };
  });
  const totalPages = Math.ceil(total / limit);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    data: tutors
  };
};
var getTutorById = async (id) => {
  const tutor = await prisma.tutorProfile.findUniqueOrThrow({
    where: {
      id
    },
    include: {
      subjects: {
        include: {
          category: true
        }
      },
      user: {
        select: {
          tutorReviews: {
            where: {
              isHidden: false
            },
            orderBy: { createdAt: "desc" },
            take: 12,
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      }
    }
  });
  return tutor;
};
var updateTutorProfile = async (payload, userId) => {
  const result = await prisma.tutorProfile.update({
    where: {
      userId
    },
    data: payload,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });
  return result;
};
var updateAvailability = async (status, userId) => {
  const result = await prisma.tutorProfile.update({
    where: {
      userId
    },
    data: {
      availability: status
    }
  });
  return result;
};
var getPendingApplications = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = String(query.search ?? "").trim() || void 0;
  const andConditions = [
    { status: TutorProfileStatus.pending }
  ];
  if (search) {
    andConditions.push({
      OR: [
        { headline: { contains: search, mode: "insensitive" } },
        { about: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { bio: { contains: search, mode: "insensitive" } }
            ]
          }
        },
        {
          subjects: {
            some: {
              category: {
                name: { contains: search, mode: "insensitive" }
              }
            }
          }
        }
      ]
    });
  }
  const whereCondition = {
    AND: andConditions
  };
  const { applications, total } = await prisma.$transaction(async (tx) => {
    const applications2 = await tx.tutorProfile.findMany({
      where: whereCondition,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            createdAt: true
          }
        },
        subjects: {
          include: {
            category: true
          }
        }
      }
    });
    const total2 = await tx.tutorProfile.count({ where: whereCondition });
    return { applications: applications2, total: total2 };
  });
  const totalPages = Math.ceil(total / limit);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    data: applications
  };
};
var tutorService = {
  addTutor,
  updateTutorApplication,
  getTutors,
  getTutorById,
  updateTutorProfile,
  updateAvailability,
  getPendingApplications
};

// src/middleware/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "unauthorized access"
      });
    }
    ;
    if (!session.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "email verification required"
      });
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      emailVerified: session.user.emailVerified
    };
    console.log(req.user);
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "forbidden access"
      });
    }
    next();
  };
};
var auth_default = auth2;

// src/modules/tutors/tutors.controller.ts
var addTutor2 = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload?.id || !payload?.data) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Expected { id, data }"
      });
    }
    const { id, data } = payload;
    const result = await tutorService.addTutor(data, id);
    res.status(201).json({
      success: true,
      message: "tutor profile created. waiting for admin approval",
      result
    });
  } catch (e) {
    next(e);
  }
};
var updateTutorApplication2 = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { status } = req.body;
    if (!applicationId) return res.status(400).json({
      success: false,
      message: "application id is missing"
    });
    if (!status) {
      return res.status(400).json({ success: false, message: "status is missing" });
    }
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || role !== "admin" /* ADMIN */) return res.status(401).json({
      success: false,
      message: "unauthorized"
    });
    const result = await tutorService.updateTutorApplication(applicationId, status, userId);
    res.status(200).json({
      success: true,
      message: "tutor application updated",
      result
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
var getTutors2 = async (req, res, next) => {
  try {
    const result = await tutorService.getTutors(req.query);
    return res.status(200).json({
      success: true,
      message: "tutors fetched",
      data: {
        meta: result.meta,
        tutors: result.data
      }
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
var getTutorById2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await tutorService.getTutorById(id);
    return res.status(200).json({
      success: true,
      message: "tutor fetched",
      tutor: result
    });
  } catch (e) {
    next(e);
  }
};
var updateTutorProfile2 = async (req, res, next) => {
  try {
    const user = req.user;
    const data = req.body;
    if (!user) return res.status(401).json({
      success: false,
      message: "unauthorized access"
    });
    const userId = user.id;
    const result = await tutorService.updateTutorProfile(data, userId);
    res.status(200).json({
      success: true,
      message: "updated tutor profile",
      tutor: result
    });
  } catch (e) {
    next(e);
  }
};
var updateAvailability2 = async (req, res, next) => {
  try {
    const user = req.user;
    const status = req.body.status;
    if (!user || !user.id) return res.status(401).json({
      success: false,
      message: "unauthorized"
    });
    console.log(req.body);
    if (status !== "available" && status !== "not_available") return res.status(400).json({
      success: false,
      message: "Status not allowed. Use 'available' or 'not_available'."
    });
    const result = await tutorService.updateAvailability(status, user.id);
    res.status(200).json({
      success: true,
      message: `availability updated to ${status}`,
      profile: result
    });
  } catch (e) {
    next(e);
  }
};
var getPendingApplications2 = async (req, res, next) => {
  try {
    const result = await tutorService.getPendingApplications(req.query);
    return res.status(200).json({
      success: true,
      message: "pending applications fetched",
      ...result
    });
  } catch (e) {
    next(e);
  }
};
var tutorController = {
  addTutor: addTutor2,
  updateTutorApplication: updateTutorApplication2,
  getTutors: getTutors2,
  getTutorById: getTutorById2,
  updateTutorProfile: updateTutorProfile2,
  updateAvailability: updateAvailability2,
  getPendingApplications: getPendingApplications2
};

// src/modules/tutors/tutors.route.ts
var router = express.Router();
router.get("/", tutorController.getTutors);
router.get("/:id", tutorController.getTutorById);
router.get("/applications/pending", auth_default("admin" /* ADMIN */), tutorController.getPendingApplications);
router.post("/", tutorController.addTutor);
router.put("/profile", auth_default("tutor" /* TUTOR */), tutorController.updateTutorProfile);
router.put("/availability", auth_default("tutor" /* TUTOR */), tutorController.updateAvailability);
router.patch("/:id/update", auth_default("admin" /* ADMIN */), tutorController.updateTutorApplication);
var tutorRouter = router;

// src/modules/categories/categories.route.ts
import Express from "express";

// src/modules/categories/categories.service.ts
var createCategory = async (payload) => {
  const result = await prisma.categories.create({
    data: {
      ...payload
    }
  });
  return result;
};
var getCategories = async () => {
  return await prisma.categories.findMany();
};
var categoriesService = {
  createCategory,
  getCategories
};

// src/modules/categories/categories.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data) return res.status(400).json({
      success: false,
      message: "body is missing"
    });
    const result = await categoriesService.createCategory(data);
    res.status(201).json({
      success: true,
      message: "category created successfully",
      category: result
    });
  } catch (e) {
    next(e);
  }
};
var getCategories2 = async (req, res, next) => {
  try {
    const result = await categoriesService.getCategories();
    res.status(200).json({
      success: true,
      message: "Retrieved all categories",
      categories: result
    });
  } catch (e) {
    next(e);
  }
};
var categoriesController = {
  createCategory: createCategory2,
  getCategories: getCategories2
};

// src/modules/categories/categories.route.ts
var router2 = Express.Router();
router2.get("/", categoriesController.getCategories);
router2.post("/", auth_default("admin" /* ADMIN */, "tutor" /* TUTOR */), categoriesController.createCategory);
var categoriesRouter = router2;

// src/modules/bookings/bookings.route.ts
import express2 from "express";

// src/modules/bookings/booking.service.ts
var createBooking = async (studentUserId, payload) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: payload.tutorProfileId },
    select: {
      id: true,
      userId: true,
      hourlyRate: true,
      currency: true,
      status: true,
      isActive: true
    }
  });
  if (!tutorProfile || !tutorProfile.isActive || tutorProfile.status !== "active") {
    throw new Error("Tutor profile not found or not active");
  }
  const hourly = new prismaNamespace_exports.Decimal(tutorProfile.hourlyRate);
  const minutes = new prismaNamespace_exports.Decimal(payload.durationMinutes);
  const total = hourly.mul(minutes).div(60).toDecimalPlaces(2);
  const data = {
    startAt: new Date(payload.startAt),
    endAt: new Date(payload.endAt),
    durationMinutes: payload.durationMinutes,
    hourlyRateSnapshot: hourly,
    totalPrice: total,
    currency: tutorProfile.currency,
    student: { connect: { id: studentUserId } },
    tutorProfile: { connect: { id: payload.tutorProfileId } }
  };
  if (payload.timezone) data.timezone = payload.timezone;
  if (payload.topic) data.topic = payload.topic;
  if (payload.meetingLink) data.meetingLink = payload.meetingLink;
  const result = await prisma.booking.create({ data });
  return result;
};
var getBookings = async (id) => {
  const result = await prisma.booking.findMany({
    where: {
      studentId: id
    },
    include: {
      tutorProfile: {
        include: {
          subjects: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      },
      student: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      },
      review: true
    }
  });
  return result;
};
var getBooking = async (bookingId) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId
    },
    include: {
      tutorProfile: {
        include: {
          subjects: true
        }
      },
      student: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      },
      review: true
    }
  });
  return booking;
};
var bookingService = {
  createBooking,
  getBookings,
  getBooking
};

// src/modules/bookings/bookings.controller.ts
var createBooking2 = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({
      success: false,
      message: "booking data not found!"
    });
    const user = req.user;
    if (!user) return res.status(401).json({
      success: false,
      message: "unauthorized"
    });
    const studentId = user.id;
    const data = payload;
    if (!studentId) return res.status(400).json({
      success: false,
      message: "student id missing"
    });
    const result = await bookingService.createBooking(studentId, data);
    res.status(201).json({
      success: true,
      message: "booking created successfully!",
      booking: result
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
var getBookings2 = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({
      success: false,
      message: "unauthorized"
    });
    const userId = user.id;
    const result = await bookingService.getBookings(userId);
    res.status(200).json({
      success: true,
      message: result.length > 0 ? "All Bookings Retrieved!" : "No bookings created yet",
      bookings: result
    });
  } catch (e) {
    next(e);
  }
};
var getBooking2 = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    console.log(bookingId);
    if (!bookingId) return res.status(400).json({
      success: false,
      message: "booking id not found"
    });
    const user = req.user;
    if (!user) return res.status(401).json({
      success: false,
      message: "unauthorized access"
    });
    const result = await bookingService.getBooking(bookingId);
    if (result.studentId !== user.id) return res.status(401).json({
      success: false,
      message: "unauthorized access"
    });
    res.status(200).json({
      success: true,
      message: "booking retrieved successfully",
      booking: result
    });
  } catch (e) {
    next(e);
  }
};
var bookingController = {
  createBooking: createBooking2,
  getBookings: getBookings2,
  getBooking: getBooking2
};

// src/modules/bookings/bookings.route.ts
var router3 = express2.Router();
router3.get("/", auth_default("admin" /* ADMIN */, "student" /* STUDENT */), bookingController.getBookings);
router3.get("/:id", auth_default("admin" /* ADMIN */, "student" /* STUDENT */), bookingController.getBooking);
router3.post("/", auth_default("student" /* STUDENT */, "admin" /* ADMIN */), bookingController.createBooking);
var bookingRouter = router3;

// src/modules/auth/auth.route.ts
import express3 from "express";

// src/modules/auth/auth.service.ts
var getCurrentUser = async (id) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id
    }
  });
  return user;
};
var authService = {
  getCurrentUser
};

// src/modules/auth/auth.controller.ts
var getCurrentUser2 = async (req, res, next) => {
  try {
    console.log("started");
    const user = req.user;
    if (!user || !user.id) return res.status(401).json({
      success: false,
      message: "unauthorized access"
    });
    const result = await authService.getCurrentUser(user.id);
    res.status(200).json({
      success: true,
      user: result
    });
  } catch (e) {
    next(e);
  }
};
var authController = {
  getCurrentUser: getCurrentUser2
};

// src/modules/auth/auth.route.ts
var router4 = express3.Router();
router4.get("/me", auth_default("admin" /* ADMIN */, "tutor" /* TUTOR */, "student" /* STUDENT */), authController.getCurrentUser);
var authRouter = router4;

// src/modules/admin/admin.route.ts
import express4 from "express";

// src/modules/admin/admin.service.ts
var getUsers = async (filters) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;
  const search = filters.search?.trim();
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  const whereCondition = {
    AND: andConditions
  };
  const { users, total } = await prisma.$transaction(async (tx) => {
    const users2 = await tx.user.findMany({
      where: whereCondition,
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc"
      }
    });
    const total2 = await tx.user.count({
      where: whereCondition
    });
    return { users: users2, total: total2 };
  });
  const totalPages = Math.ceil(total / limit);
  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    data: users
  };
};
var updateUser = async (payload) => {
  const result = await prisma.user.update({
    where: {
      id: payload.userId
    },
    data: {
      status: payload.status,
      banReason: payload.banReason || null,
      bannedAt: payload.status === "banned" ? new Date(Date.now()) : null
    }
  });
  return result;
};
var deleteTutorApplication = async (id) => {
  const result = await prisma.tutorProfile.delete({
    where: {
      id
    }
  });
  return result;
};
var adminService = {
  getUsers,
  updateUser,
  deleteTutorApplication
};

// src/modules/admin/admin.controller.ts
var getUsers2 = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    return res.status(200).json({
      success: true,
      message: "Retrieved users.",
      data: {
        meta: result.meta,
        users: result.data
      }
    });
  } catch (e) {
    next(e);
  }
};
var updateUser2 = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({
      success: false,
      message: "user id not found"
    });
    const data = req.body;
    if (!data.status) return res.status(400).json({
      success: false,
      message: "status not found"
    });
    const result = await adminService.updateUser({ ...data, userId });
    res.status(200).json({
      success: true,
      message: data.status === "banned" ? "User has been banned" : "User has been unbanned",
      user: result
    });
  } catch (e) {
    next(e);
  }
};
var deleteTutorApplication2 = async (req, res, next) => {
  console.log("stated");
  try {
    const { id } = req.params;
    const result = await adminService.deleteTutorApplication(id);
    res.status(204).json({
      success: true,
      message: "Application deleted successfully",
      data: result
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
var adminController = {
  getUsers: getUsers2,
  updateUser: updateUser2,
  deleteTutorApplication: deleteTutorApplication2
};

// src/modules/admin/admin.route.ts
var router5 = express4.Router();
router5.get("/", auth_default("admin" /* ADMIN */), adminController.getUsers);
router5.patch("/:id", auth_default("admin" /* ADMIN */), adminController.updateUser);
router5.delete("/tutor-applications/:id", auth_default("admin" /* ADMIN */), adminController.deleteTutorApplication);
var adminRouter = router5;

// src/app.ts
dotenv.config();
var app = express5();
app.set("trust proxy", 1);
var allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000"
].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.all("/api/auth/*any", toNodeHandler(auth));
app.use(express5.json());
app.get("/", async (req, res) => {
  res.send("Hello World");
});
app.use("/api/admin/users", adminRouter);
app.use("/api/authentication", authRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/bookings", bookingRouter);
app.use(globalErrorHandler_default);
app.use(notFound);
var app_default = app;

// src/vercel.ts
function handler(req, res) {
  return app_default(req, res);
}
export {
  handler as default
};
