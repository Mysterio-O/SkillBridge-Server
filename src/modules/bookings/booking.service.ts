import { Booking, BookingStatus, Prisma } from "../../../generated/prisma/client";
import { BookingWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { CancelPayload } from "./booking.types";


type CreateBookingPayload = {
  tutorProfileId: string;

  startAt: string;
  endAt: string;
  timezone?: string;
  durationMinutes: number;

  topic?: string;
  meetingLink?: string;
};


type GetBookingsInput = {
  page: number;
  page_size: number;
  search?: string | undefined;
  role: string;
};

export const createBooking = async (studentUserId: string, payload: CreateBookingPayload) => {
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

    status:'confirmed',

    student: { connect: { id: studentUserId } },
    tutorProfile: { connect: { id: payload.tutorProfileId } }
  };


  if (payload.timezone) data.timezone = payload.timezone;
  if (payload.topic) data.topic = payload.topic;
  if (payload.meetingLink) data.meetingLink = payload.meetingLink;

  const result = await prisma.booking.create({ data });

  return result;
};

const getBookings = async (id: string, { page, page_size, search, role }: GetBookingsInput) => {
  const skip = (page - 1) * page_size;


  const where: BookingWhereInput = {};

  if (role !== "admin") {
    where.studentId = id;
  }


  if (search) {
    where.OR = [
      // student fields
      { student: { name: { contains: search, mode: "insensitive" } } },
      { student: { email: { contains: search, mode: "insensitive" } } },
      { student: { phone: { contains: search, mode: "insensitive" } } },

      // tutor user fields
      {
        tutorProfile: {
          user: { name: { contains: search, mode: "insensitive" } },
        },
      },
      {
        tutorProfile: {
          user: { email: { contains: search, mode: "insensitive" } },
        },
      },
      {
        tutorProfile: {
          user: { phone: { contains: search, mode: "insensitive" } },
        },
      },
    ];
  }




  const [total, bookings] = await prisma.$transaction([
    prisma.booking.count({
      where,
    }),
    prisma.booking.findMany({
      where,
      include: {
        tutorProfile: {
          include: {
            subjects: true,
            user: {
              select: {
                id:true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        review: true,
      },
      skip,
      take: page_size,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      page_size,
      total,
      totalPages: Math.ceil(total / page_size),
      hasNext: page * page_size < total,
      hasPrev: page > 1,
    },
  };
};

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
};


const updateBookingStatus = async (bookingId: string, status: BookingStatus, cancelPayload?: CancelPayload) => {

  let data = {};

  if (status === 'cancelled') {
    data = {
      status,
      cancelledBy: cancelPayload?.cancelledBy,
      cancelReason: cancelPayload?.cancelReason || null
    }
  }

  if (status === 'completed') {
    data = {
      status,
      completedAt: new Date().toISOString()
    }
  }

  if (status === 'in_progress') {
    data = { status }
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId
    },
    data
  });

  return result;

}



export const bookingService = {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
}