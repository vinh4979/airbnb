import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber } from "class-validator";
import { IsString, IsNotEmpty } from 'class-validator';

export enum Booking_status {
    pending = 'pending',
    confirmed = 'confirmed',
    canceled = 'canceled',
}

export class UpdateBookingStatusDto {
    @ApiProperty({ enum: Booking_status, description: 'Trạng thái mới của đặt phòng' })
    @IsEnum(Booking_status)
    status: Booking_status;
  }

// export class Booking_status_enum {  
//     @ApiProperty({ enum: Booking_status, description: 'Booking status' })
//     @IsEnum(Booking_status)
//     status : Booking_status;
// }

export enum Booking_payment {
  pending = 'pending',  
  paid = 'paid',
  refunded = 'refunded',
}

export class Booking {
 

    @ApiProperty({ example: 1, description: 'Property ID' })
    property_id: number;

    @ApiProperty({ example: 1, description: 'User ID' })
    user_id: number;

    @ApiProperty({ example: '2024-01-01', description: 'Check-in date' })
    check_in: Date;

    @ApiProperty({ example: '2024-01-02', description: 'Check-out date' })
    check_out: Date;

    @ApiProperty({ example: 1, description: 'Number of guests' })
    guests: number;
}

export class Booking_detail extends Booking {
   status : Booking_status; 
   payment_status : Booking_payment;
   total_price : number;
   created_at : Date;
}   

export type response = {
    message?: string;
    data: Booking;
}

export class CancelBookingDto {
    @ApiProperty({ description: 'ID của người dùng' })
    @IsNumber()
    @IsNotEmpty()
    user_id: number;
  
    @ApiProperty({ description: 'ID của đặt phòng' })
    @IsNumber()
    @IsNotEmpty()
    booking_id: number;
  
    @ApiProperty({ description: 'Lý do hủy đặt phòng' })
    @IsString()
    @IsNotEmpty()
    reason: string;
  }

