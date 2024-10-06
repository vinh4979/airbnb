import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFiles, UseGuards, UseInterceptors, Query, Put, Delete, UploadedFile } from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ImageDescriptionDto, Location, Property, PropertyLocationWithoutLocationId, PropertyWithLocation, UpdatePropertyStatusDto, UploadImageDto } from './property.type';
import { CloudinaryService } from 'src/cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer-config';
import { ParseArrayPipe } from '@nestjs/common';

@ApiTags('Property')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService,
    private readonly cloudinaryService: CloudinaryService
   ) {}

    


  // get all property   
  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all properties.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAllProperties() {
    return this.propertyService.getAllProperties();
  }
   // search property by amenities
   @Get('amenities')
@ApiOperation({ summary: 'Tìm phòng theo tiện nghi' })
@ApiQuery({ name: 'amenities', type: [String], isArray: true, description: 'Danh sách các tiện nghi cần tìm' })
@ApiResponse({ status: 200, description: 'Danh sách các phòng có tiện nghi phù hợp.' })
@ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ.' })
async getPropertiesByAmenities(@Query('amenities', new ParseArrayPipe({ items: String, separator: ',' })) amenities: string[]) {
  if (!amenities || amenities.length === 0) {
    throw new BadRequestException('Cần cung cấp ít nhất một tiện nghi');
  }
  console.log("Amenities: ", amenities);
  return this.propertyService.getPropertiesByAmenities(amenities);
}

  // search property by location @Get('search')
  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm phòng theo vị trí' })
  @ApiQuery({ name: 'location', description: 'Từ khóa tìm kiếm vị trí' })
  @ApiResponse({ status: 200, description: 'Danh sách các phòng phù hợp với vị trí tìm kiếm.' })
  async searchPropertiesByLocation(@Query('location') location: string) {
    return this.propertyService.searchPropertiesByLocation(location);
  }

    // get property by id 
    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin chi tiết của một phòng theo ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'ID của phòng' })
    @ApiResponse({ status: 200, description: 'Thông tin chi tiết của phòng.' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phòng với ID đã cho.' })
    async getPropertyById(@Param('id', ParseIntPipe) id: number) {
      return this.propertyService.getPropertyById(id);
    }

  // get properties by type
  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy danh sách phòng theo loại' })
  @ApiParam({ name: 'type', enum: ['apartment', 'house', 'villa', 'condo', 'other'], description: 'Loại phòng' })
  @ApiResponse({ status: 200, description: 'Danh sách các phòng theo loại.' })
  @ApiResponse({ status: 400, description: 'Loại phòng không hợp lệ.' })
  async getPropertiesByType(@Param('type') type: string) {
    const validTypes = ['apartment', 'house', 'villa', 'condo', 'other'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Loại phòng không hợp lệ');
    }
    return this.propertyService.getPropertiesByType(type);
  }
  

 
  //create property 
  @Post()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'The property has been successfully created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createProperty(@Body() body: PropertyLocationWithoutLocationId){
    return this.propertyService.createProperty(body);
  }
// update property status
  @Put(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái của một property' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID của property' })
  @ApiBody({ type: UpdatePropertyStatusDto })
  @ApiResponse({ status: 200, description: 'Trạng thái đã được cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy property với ID đã cho.' })
  async updatePropertyStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdatePropertyStatusDto
  ) {
    return this.propertyService.updatePropertyStatus(id, updateStatusDto.status);
  }



  // test upload image 
  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions)) // Cho phép tối đa 10 ảnh
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        descriptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload nhiều ảnh với mô tả' })
  @ApiResponse({ status: 201, description: 'Các ảnh đã được tải lên thành công.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { descriptions: string | string[] }
  ): Promise<any> {
    let descriptions: { description: string }[] = [];
    console.log("body test: ", body);
    
    if (typeof body.descriptions === 'string') {
      try {
        const parsedDescriptions = JSON.parse(body.descriptions);
        if (Array.isArray(parsedDescriptions)) {
          descriptions = parsedDescriptions.map(item => {
            if (typeof item === 'string') {
              return JSON.parse(item);
            }
            return item;
          });
        } else {
          descriptions = [parsedDescriptions];
        }
      } catch (error) {
        descriptions = [{ description: body.descriptions }];
      }
    } else if (Array.isArray(body.descriptions)) {
      descriptions = body.descriptions.map(item => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch {
            return { description: item };
          }
        }
        return item;
      });
    }

    console.log("Số lượng ảnh: ", files.length);
    console.log("Số lượng mô tả: ", descriptions.length);
    console.log("Mô tả: ", descriptions);

    if (files.length !== descriptions.length) {
      throw new Error('Số lượng ảnh và mô tả không khớp');
    }
    return this.propertyService.uploadImages(files, descriptions.map(d => d.description));
  }

  // edit location by property id 
@Put(':id/location')
@ApiOperation({ summary: 'Cập nhật thông tin địa điểm của một property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID của property' })
@ApiBody({ type: Location })
@ApiResponse({ status: 200, description: 'Thông tin địa điểm đã được cập nhật.' })
@ApiResponse({ status: 404, description: 'Không tìm thấy property với ID đã cho.' })
async updatePropertyLocation(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateLocation: Location
) {
  return this.propertyService.updatePropertyLocation(id, updateLocation);
}

// update property policies
@Put(':id/policies')
@ApiOperation({ summary: 'Cập nhật chính sách cho một property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID của property' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      policies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            valid_until: { type: 'string', format: 'date' }
          }
        }
      }
    }
  }
})
@ApiResponse({ status: 200, description: 'Chính sách đã được cập nhật thành công' })
@ApiResponse({ status: 404, description: 'Không tìm thấy property' })
async updatePropertyPolicies(
  @Param('id', ParseIntPipe) propertyId: number,
  @Body('policies') policies: Array<{ name: string; description?: string; valid_until?: string }>
) {
  return this.propertyService.updatePropertyPolicies(propertyId, policies);
}

// delete property policies
@Delete(':id/policies/:policyId')
@ApiOperation({ summary: 'Xóa một chính sách cụ thể khỏi property và bảng Policies' })
@ApiParam({ name: 'id', type: 'number', description: 'ID của property' })
@ApiParam({ name: 'policyId', type: 'number', description: 'ID của chính sách cần xóa' })
@ApiResponse({ status: 200, description: 'Chính sách đã được xóa thành công' })
@ApiResponse({ status: 404, description: 'Không tìm thấy property hoặc chính sách' })
async removePropertyPolicy(
  @Param('id', ParseIntPipe) propertyId: number,
  @Param('policyId', ParseIntPipe) policyId: number
) {
  return this.propertyService.removePropertyPolicy(propertyId, policyId);
}

// update property amenities
@Put(':id/amenities')
@ApiOperation({ summary: 'Cập nhật tiện nghi cho một property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID của property' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      amenities: {
        type: 'array',
        items: { type: 'string' },
        description: 'Danh sách tên các tiện nghi',
      },
    },
  },
})
@ApiResponse({ status: 200, description: 'Tiện nghi đã được cập nhật thành công' })
@ApiResponse({ status: 404, description: 'Không tìm thấy property' })
async updatePropertyAmenities(
  @Param('id', ParseIntPipe) propertyId: number,
  @Body('amenities', new ParseArrayPipe({ items: String, separator: ',' })) amenities: string[]
) {
  return this.propertyService.updatePropertyAmenities(propertyId, amenities);
}

// delete property amenities
@Delete(':id/amenities/:amenityId')
@ApiOperation({ summary: 'Xóa một tiện nghi cụ thể khỏi property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID của property' })
@ApiParam({ name: 'amenityId', type: 'number', description: 'ID của tiện nghi cần xóa' })
@ApiResponse({ status: 200, description: 'Tiện nghi đã được xóa thành công' })
@ApiResponse({ status: 404, description: 'Không tìm thấy property hoặc tiện nghi' })
async removePropertyAmenity(
  @Param('id', ParseIntPipe) propertyId: number,
  @Param('amenityId', ParseIntPipe) amenityId: number
) {
  return this.propertyService.removePropertyAmenity(propertyId, amenityId);
}

  // update property image 
    @Post(':id/update-images')
    @UseInterceptors(FilesInterceptor('images'))
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', type: 'number' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                imageDetails: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            image_type: {
                                type: 'string',
                                enum: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'view', 'dining_area', 'other'],
                            },
                            is_primary: { type: 'boolean' },
                            caption: { type: 'string' },
                        },
                    },
                },
            },
        },
    })
    async updatePropertyImages(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: Express.Multer.File[],
        @Body('imageDetails') imageDetails: string
    ) {
        const parsedImageDetails = JSON.parse(imageDetails);
        return this.propertyService.updatePropertyImages(id, files, parsedImageDetails);
    }

    // update property image by id 
//     @Put(':propertyId/images/:imageId')
// @ApiOperation({ summary: 'Cập nhật thông tin của một ảnh cụ thể của một property' })
// @ApiParam({ name: 'propertyId', type: 'number' })
// @ApiParam({ name: 'imageId', type: 'number' })
// @ApiBody({
//   schema: {
//     type: 'object',
//     properties: {
//       image_type: {
//         type: 'string',
//         enum: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'view', 'dining_area', 'other'],
//       },
//       is_primary: { type: 'boolean' },
//       caption: { type: 'string' },
//     },
//   },
// })
// async updatePropertyImagedemo(
//   @Param('propertyId', ParseIntPipe) propertyId: number,
//   @Param('imageId', ParseIntPipe) imageId: number,
//   @Body() updateData: {
//     image_type?: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other';
//     is_primary?: boolean;
//     caption?: string;
//   }
// ) {
//   return this.propertyService.updatePropertyImage(propertyId, imageId, updateData);
// }

// update and delete property image 
@Put(':propertyId/images/:imageId')
@UseInterceptors(FileInterceptor('image', multerOptions))
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Cập nhật thông tin của một ảnh cụ thể của một property' })
@ApiParam({ name: 'propertyId', type: 'number' })
@ApiParam({ name: 'imageId', type: 'number' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      image_type: {
        type: 'string',
        enum: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'view', 'dining_area', 'other'],
      },
      is_primary: { type: 'boolean' },
      caption: { type: 'string' },
      image: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
async updatePropertyImage(
  @Param('propertyId', ParseIntPipe) propertyId: number,
  @Param('imageId', ParseIntPipe) imageId: number,
  @Body() updateData: {
    image_type?: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other';
    is_primary?: boolean | string;
    caption?: string;
  },
  @UploadedFile() file: Express.Multer.File
) {
  console.log('Received image:', file);
  return this.propertyService.updatePropertyImage(propertyId, imageId, { ...updateData, file });
}

@Delete(':propertyId/images/:imageId')
@ApiOperation({ summary: 'Xóa một ảnh cụ thể của một property' })
@ApiParam({ name: 'propertyId', type: 'number' })
@ApiParam({ name: 'imageId', type: 'number' })
@ApiResponse({ status: 200, description: 'Ảnh đã được xóa thành công' })
@ApiResponse({ status: 404, description: 'Không tìm thấy property hoặc ảnh' })
async deletePropertyImage(
  @Param('propertyId', ParseIntPipe) propertyId: number,
  @Param('imageId', ParseIntPipe) imageId: number
) {
  return this.propertyService.deletePropertyImage(propertyId, imageId);
}

   
  // add multiple image by property id 
  @Post(':id/add-images')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOperation({ summary: 'Thêm nhiều ảnh cho một property' })
  @ApiResponse({ status: 201, description: 'Các ảnh đã được thêm thành công.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        imageDetails: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              image_type: {
                type: 'string',
                enum: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'view', 'dining_area', 'other'],
              },
              is_primary: { type: 'boolean' },
              caption: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async addPropertyImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('imageDetails') imageDetails: string
  ) {
    let parsedImageDetails: Array<{
      image_type: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other';
      is_primary: boolean;
      caption: string;
    }>;
    try {
      parsedImageDetails = JSON.parse(imageDetails);
      if (!Array.isArray(parsedImageDetails)) {
        throw new BadRequestException('imageDetails phải là một mảng');
      }
    } catch (error) {
      console.error('Error parsing imageDetails:', error);
      console.log('Received imageDetails:', imageDetails);
      throw new BadRequestException('Invalid imageDetails format');
    }

    console.log("Số lượng ảnh: ", files.length);
    console.log("Số lượng thông tin chi tiết: ", parsedImageDetails.length);
    console.log("Chi tiết ảnh: ", parsedImageDetails);

    if (files.length !== parsedImageDetails.length) {
      throw new BadRequestException('Số lượng ảnh và thông tin chi tiết không khớp');
    }

    return this.propertyService.addPropertyImages(id, files, parsedImageDetails);
  }


 

  

}

  






