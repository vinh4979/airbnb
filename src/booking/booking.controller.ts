import { Controller, Post, Body, Get, Param, Put, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { Booking, Booking_status, CancelBookingDto, response, UpdateBookingStatusDto } from './booking.type';
import { Bookings_status } from '@prisma/client';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'The booking has been successfully created.' })
  async createBooking(@Body() booking : Booking ) : Promise<response>{
    return this.bookingService.createBooking(booking);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({ status: 200, description: 'Return the booking.' })
  async getBooking(@Param('id') id: string) {
    return this.bookingService.getBookingById(+id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update the status of a booking' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the booking' })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found with the given ID.' })
  async updateBookingStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateStatusDto: UpdateBookingStatusDto
) {
  return this.bookingService.updateBookingStatus(id, updateStatusDto.status as Bookings_status);
}

  @Get('user/:userId')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings for a user' })
  @ApiResponse({ status: 200, description: 'Return the list of bookings.' })
  async getUserBookings(@Param('userId') userId: string) {
    return this.bookingService.getUserBookings(+userId);
  }

  @Post('cancel')
@ApiOperation({ summary: 'Cancel a booking' })
@ApiBody({ type: CancelBookingDto })
@ApiResponse({ status: 200, description: 'Booking cancelled successfully.' })
@ApiResponse({ status: 404, description: 'Booking not found with the given ID.' })
async cancelBooking(@Body() cancelBookingDto: CancelBookingDto) {
  return this.bookingService.cancelBooking(
    cancelBookingDto.booking_id,
    cancelBookingDto.user_id,
    cancelBookingDto.reason
  );
}
}
