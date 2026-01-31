import { Booking, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


type CreateBookingPayload = {
  tutorProfileId: string;

  startAt: string;
  endAt: string;
  timezone?: string;
  durationMinutes: number;

  topic?: string;
  meetingLink?: string;
};

export const createBooking = async (studentUserId: string, payload: CreateBookingPayload) => {
  // 1) Find tutor profile (because payload gives tutorProfileId)
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: payload.tutorProfileId },
    select: {
      id: true,
      userId: true,
      hourlyRate: true,
      currency: true,
      status: true,
      isActive: true,
    },
  });

  if (!tutorProfile || !tutorProfile.isActive || tutorProfile.status !== "active") {
    throw new Error("Tutor profile not found or not active");
  }


  const hourly = new Prisma.Decimal(tutorProfile.hourlyRate);
  const minutes = new Prisma.Decimal(payload.durationMinutes);
  const total = hourly.mul(minutes).div(60).toDecimalPlaces(2);

  const data: Prisma.BookingCreateInput = {
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

const getBookings = async (id: string) => {
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
}


const getBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId
    },
    include: {
      tutorProfile: {
        include: {
          subjects: true,
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

  return booking
}



export const bookingService = {
  createBooking,
  getBookings,
  getBooking,
}