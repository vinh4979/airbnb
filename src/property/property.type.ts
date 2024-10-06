import { ApiExtraModels, ApiProperty , OmitType} from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

enum PropertyType {
  apartment = 'apartment',
  house = 'house',
  villa = 'villa',
  condo = 'condo',
  other = 'other'
}

export enum PropertyStatus {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending',
  maintenance = 'maintenance'
}

export class UpdatePropertyStatusDto {
  @ApiProperty({ enum: PropertyStatus, description: 'Trạng thái mới của property' })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}


export class Property {
  @ApiProperty({ example: 1, description: 'User ID of the property owner' })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ example: 1, description: 'Location ID of the property' })
  @IsNumber()
  @IsNotEmpty()
  location_id: number;

  @ApiProperty({ example: 'Cozy Apartment', description: 'Name of the property' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A beautiful apartment with a view', description: 'Description of the property' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 100.50, description: 'Base price per night' })
  @IsNumber()
  @IsNotEmpty()
  base_price: number;

  @ApiProperty({ example: 4, description: 'Maximum number of guests' })
  @IsNumber()
  @IsNotEmpty()
  max_guests: number;

  @ApiProperty({ enum: PropertyType, description: 'Type of the property' })
  @IsEnum(PropertyType)
  @IsNotEmpty()
  type: PropertyType;

  @ApiProperty({ enum: PropertyStatus, description: 'Status of the property', default: 'pending' })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus = PropertyStatus.pending;
}

export class Location {
  @ApiProperty({ example: 'USA', description: 'Country of the location' })
  @IsString()
  @IsNotEmpty()
  country?: string;

  @ApiProperty({ example: 'California', description: 'Province of the location' })
  @IsString()
  @IsNotEmpty()
  province?: string;

  @ApiProperty({ example: 'Los Angeles', description: 'City of the location' })
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiProperty({ example: '123 Main St', description: 'Address of the location' })
  @IsString()
  @IsNotEmpty()
  address?: string;
}

export class PropertyWithLocation extends Property {
  @ApiProperty({ example: 'USA', description: 'Country of the location' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'California', description: 'Province of the location' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ example: 'Los Angeles', description: 'City of the location' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '123 Main St', description: 'Address of the location' })
  @IsString()
  @IsNotEmpty()
  address: string;
}


// ... existing code ...

// ... existing code ...

export class PropertyLocationWithoutLocationId extends OmitType(PropertyWithLocation, ['location_id'] as const) {}

export class PropertyWithExtras extends Property {
  @ApiProperty({ description: 'vui long cap nhat anh', type: 'string' }) 
  @IsString()
  @IsOptional()
  propertyImage?: string;

  @ApiProperty({ description: 'vui long cap nhat tien nghi', type: 'string' })
  @IsString()
  @IsOptional()
  propertyAmenity?: string;

  @ApiProperty({ description: 'vui long cap nhat chính sách', type: 'string' })
  @IsString()
  @IsOptional()
  propertyPolicy?: string;
}

// ... existing code ...
// ... existing code ...

export class ImageDescriptionDto {
  @ApiProperty({ type: 'string', description: 'Mô tả ảnh' })
  @IsString()
  description: string;
}

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File ảnh' })
  image: any;

  @ApiProperty({ type: [ImageDescriptionDto], description: 'Mảng mô tả ảnh' })
  descriptions: ImageDescriptionDto[];
}
export class UploadImage {
  @ApiProperty({ type: 'string', description: 'URL của ảnh đã upload' })
  image: string;
}

export type PropertySearchResult = {
  properties: any[];
  message?: string;
}



