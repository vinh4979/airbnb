import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Booking, Booking_payment, Booking_status } from './booking.type';
import { Prisma } from '@prisma/client';
import { Bookings_status } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}

  private calculateNumberOfDays(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
   // create booking
  async createBooking(booking: Booking) {
    booking.check_in = new Date(booking.check_in);
    booking.check_out = new Date(booking.check_out);
  
    const property = await this.prismaService.properties.findUnique({
      where: { property_id: booking.property_id }
    });
  
    if (!property) {
      throw new NotFoundException(`Property with ID ${booking.property_id} not found`);
    }
  
    if (booking.check_in >= booking.check_out) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    if (property.status !== 'active') {
        throw new BadRequestException(`Property with ID ${booking.property_id} is not available for booking`);
    }
  
    const conflictingBookings = await this.prismaService.bookings.findMany({
      where: {
        property_id: booking.property_id,
        status: { in: ['confirmed', 'pending'] },
        OR: [
          {
            check_in: { lt: booking.check_out },
            check_out: { gt: booking.check_in }
          }
        ]
      }
    });
  
    if (conflictingBookings.length > 0) {
      throw new BadRequestException('Property is not available for the selected dates');
    }
  
    const numberOfDays = this.calculateNumberOfDays(booking.check_in, booking.check_out);
    const totalPrice = numberOfDays * Number(property.base_price);
  
    const newBooking = await this.prismaService.bookings.create({
      data: {
        property_id: booking.property_id,
        user_id: booking.user_id,
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests: booking.guests,
        status: Booking_status.confirmed,
        payment_status: Booking_payment.pending,
        total_price: totalPrice,
        created_at: new Date()
      }
    });
  
    return {
      message: "Booking created successfully",
      data: newBooking
    };
  }

// get booking by id
  async getBookingById(bookingId: number) {
    const booking = await this.prismaService.bookings.findUnique({
      where: { booking_id: bookingId },
      include: {
        Properties: true,
        User: true
      }
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return booking;
  }

// update booking status
async updateBookingStatus(bookingId: number, status: Bookings_status): Promise<any> {
    const booking = await this.prismaService.bookings.findUnique({
      where: { booking_id: bookingId },
    });
  
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy booking với ID ${bookingId}`);
    }
  
    const updatedBooking = await this.prismaService.bookings.update({
      where: { booking_id: bookingId },
      data: { status },
    });
  
    return {
      message: 'Trạng thái đặt phòng đã được cập nhật thành công',
      updatedBooking,
    };
  }
  async getUserBookings(userId: number) {
    const bookings = await this.prismaService.bookings.findMany({
      where: { user_id: userId },
      include: {
        Properties: true
      }
    });

    return bookings;
  }


  async cancelBooking(bookingId: number, userId: number, reason: string): Promise<any> {
    const booking = await this.prismaService.bookings.findUnique({
      where: { booking_id: bookingId },
    });
  
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đặt phòng với ID ${bookingId}`);
    }
  
    if (booking.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy đặt phòng này');
    }
  
    const updatedBooking = await this.prismaService.bookings.update({
      where: { booking_id: bookingId },
      data: { status: 'cancelled' as Bookings_status },
    });
  
    const cancellation = await this.prismaService.cancellations.create({
      data: {
        booking_id: bookingId,
        user_id: userId,
        reason: reason,
        cancellation_date: new Date(),
        status: 'pending',
      },
    });
  
    return {
      message: 'Đặt phòng đã được hủy thành công',
      updatedBooking,
      cancellation,
    };
  }
}
