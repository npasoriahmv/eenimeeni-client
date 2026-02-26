generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id             String    @id @default(cuid())
  phone          String    @unique
  email          String?   @unique
  parentName     String
  children       Child[]
  loyaltyPoints Int       @default(0)
  createdAt      DateTime  @default(now())
  bookings       Booking[]
  payments       Payment[]
}

model Child {
  id       String    @id @default(cuid())
  name     String
  dob      DateTime
  allergy  String?
  userId   String
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookings Booking[] @relation("BookingChildren")
}

// Booking Table 
model Booking {
  id                 String        @id @default(cuid())
  userId             String
  type               BookingType   @default(EENIMEENI)
  user               User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  date               DateTime
  startTime          DateTime
  endTime            DateTime
  points_earned      Int?
  points_spent       Int?
  reservation_status R_Status?     @default(PENDING)
  children           Child[]       @relation("BookingChildren")
  guestChildren      Int           @default(0)
  guardians          Int           @default(0)
  amount             Decimal       @db.Decimal(10, 2)
  status             BookingStatus @default(PENDING)

  extraDetails Json?

  createdAt DateTime
  payments  Payment[]
}

enum BookingType {
  EENIMEENI
  MINYMOE
  EENIMEENI_MINYMOE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

//Payment Model
model Payment {
  id String @id @default(cuid())

  merchantTxnNo String @unique

  bookingId String
  booking   Booking @relation(fields: [bookingId], references: [id])

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  amount Decimal @db.Decimal(10, 2)

  transaction_method String?
  invoiceNumber      String? @unique
  transactionId      String? @unique
  status             PaymentStatus @default(PENDING)
  responseCode       String?
  responseMessage    String?
  rawResponse        Json?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
}

enum R_Status {
  PENDING
  CHECKIN
  CHECKOUT
  CANCELLED
  LAPSED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

