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
  @ApiOperation({ summary: 'Cập nhật trạng thái của một đặt phòng' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID của đặt phòng' })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiResponse({ status: 200, description: 'Trạng thái đã được cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt phòng với ID đã cho.' })
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
@ApiOperation({ summary: 'Hủy đặt phòng' })
@ApiBody({ type: CancelBookingDto })
@ApiResponse({ status: 200, description: 'Đặt phòng đã được hủy thành công.' })
@ApiResponse({ status: 404, description: 'Không tìm thấy đặt phòng với ID đã cho.' })
async cancelBooking(@Body() cancelBookingDto: CancelBookingDto) {
  return this.bookingService.cancelBooking(
    cancelBookingDto.booking_id,
    cancelBookingDto.user_id,
    cancelBookingDto.reason
  );
}
}
