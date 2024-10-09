import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFiles, UseInterceptors, Query, Put, Delete, UploadedFile, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Location, PropertyLocationWithoutLocationId, UpdatePropertyStatusDto, PropertyStatus  } from './property.type';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ParseArrayPipe } from '@nestjs/common';
import { CloudinaryService } from 'src/config/cloundinary/cloudinary.service';
import { multerOptions } from 'src/util/multer-config';
import { JwtAuthGuard } from 'src/auth/ jwt-auth.guard.ts';

@ApiTags('Property')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService,
    private readonly cloudinaryService: CloudinaryService
   ) {}
  // get all property   
  @Get("get-all-property")
  @ApiOperation({ summary: 'Get all properties' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all properties.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAllProperties() {
    return this.propertyService.getAllProperties();
  }
   // search property by amenities
  @Get('search-property-by-amenity')
  @ApiOperation({ summary: 'Search for properties by amenities' })
  @ApiQuery({ name: 'amenities', type: [String], isArray: true, description: 'List of amenities to search for' })
  @ApiResponse({ status: 200, description: 'List of properties with matching amenities.' })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  async getPropertiesByAmenities(@Query('amenities', new ParseArrayPipe({ items: String, separator: ',' })) amenities: string[]) {
    if (!amenities || amenities.length === 0) {
      throw new BadRequestException('At least one amenity must be provided');
    }
    console.log("Amenities: ", amenities);
    return this.propertyService.getPropertiesByAmenities(amenities);
  }

  // search property by location 
  @Get('search-property-by-location')
  @ApiOperation({ summary: 'Search for properties by location' })
  @ApiQuery({ name: 'location', description: 'Location search keyword' })
  @ApiResponse({ status: 200, description: 'List of properties matching the search location.' })
  async searchPropertiesByLocation(@Query('location') location: string) {
    return this.propertyService.searchPropertiesByLocation(location);
  }

    // get property by id 
    @Get('get-porperty-by-id/:id')
    @ApiOperation({ summary: 'Get detailed information of a property by ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'Property ID' })
    @ApiResponse({ status: 200, description: 'Detailed information of the property.' })
    @ApiResponse({ status: 404, description: 'Property not found with the given ID.' })
    async getPropertyById(@Param('id', ParseIntPipe) id: number) {
      return this.propertyService.getPropertyById(id);
    }

  // get properties by type
  @Get('get-porperty-by-type/:type')
  @ApiOperation({ summary: 'Get list of properties by type' })
  @ApiParam({ name: 'type', enum: ['apartment', 'house', 'villa', 'condo', 'other'], description: 'Property type' })
  @ApiResponse({ status: 200, description: 'List of properties by type.' })
  @ApiResponse({ status: 400, description: 'Invalid property type.' })
  async getPropertiesByType(@Param('type') type: string) {
    const validTypes = ['apartment', 'house', 'villa', 'condo', 'other'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Invalid property type');
    }
    return this.propertyService.getPropertiesByType(type);
  }
  

 
  //create property 
  @Post("create-new-property")
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'The property has been successfully created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createProperty(@Body() body: PropertyLocationWithoutLocationId){
    return this.propertyService.createProperty(body);
  }
// update property status
@Put('update-property-status/:id')
@ApiOperation({ summary: 'Update the status of a property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID of the property' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: Object.values(PropertyStatus),
        description: 'New status of the property'
      }
    }
  }
})
@ApiResponse({ status: 200, description: 'Status updated successfully.' })
@ApiResponse({ status: 404, description: 'Property not found with the given ID.' })
async updatePropertyStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateStatusDto: UpdatePropertyStatusDto
) {
  return this.propertyService.updatePropertyStatus(id, updateStatusDto.status);
}



  // test upload image 
  // @Post('upload-images')
  // @UseInterceptors(FilesInterceptor('images', 10, multerOptions)) // Cho phép tối đa 10 ảnh
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       images: {
  //         type: 'array',
  //         items: {
  //           type: 'string',
  //           format: 'binary',
  //         },
  //       },
  //       descriptions: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             description: { type: 'string' },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // @ApiOperation({ summary: 'Upload multiple images with descriptions' })
  // @ApiResponse({ status: 201, description: 'Images uploaded successfully.' })
  // @ApiResponse({ status: 400, description: 'Bad Request.' })
  // async uploadImages(
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body() body: { descriptions: string | string[] }
  // ): Promise<any> {
  //   let descriptions: { description: string }[] = [];
  //   console.log("body test: ", body);
    
  //   if (typeof body.descriptions === 'string') {
  //     try {
  //       const parsedDescriptions = JSON.parse(body.descriptions);
  //       if (Array.isArray(parsedDescriptions)) {
  //         descriptions = parsedDescriptions.map(item => {
  //           if (typeof item === 'string') {
  //             return JSON.parse(item);
  //           }
  //           return item;
  //         });
  //       } else {
  //         descriptions = [parsedDescriptions];
  //       }
  //     } catch (error) {
  //       descriptions = [{ description: body.descriptions }];
  //     }
  //   } else if (Array.isArray(body.descriptions)) {
  //     descriptions = body.descriptions.map(item => {
  //       if (typeof item === 'string') {
  //         try {
  //           return JSON.parse(item);
  //         } catch {
  //           return { description: item };
  //         }
  //       }
  //       return item;
  //     });
  //   }

  //   console.log("Number of images: ", files.length);
  //   console.log("Number of descriptions: ", descriptions.length);
  //   console.log("Descriptions: ", descriptions);

  //   if (files.length !== descriptions.length) {
  //     throw new Error('Number of images and descriptions do not match');
  //   }
  //   return this.propertyService.uploadImages(files, descriptions.map(d => d.description));
  // }

  // edit location by property id 
@Put('update-location/:id')
@ApiOperation({ summary: 'Update the location information of a property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID of the property' })
@ApiBody({ type: Location })
@ApiResponse({ status: 200, description: 'Location information updated.' })
@ApiResponse({ status: 404, description: 'Property not found with the given ID.' })
async updatePropertyLocation(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateLocation: Location
) {
  return this.propertyService.updatePropertyLocation(id, updateLocation);
}

// update property policies
@Put('update-policy/:id')
@ApiOperation({ summary: 'Update policies for a property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID of the property' })
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
@ApiResponse({ status: 200, description: 'Policies updated successfully' })
@ApiResponse({ status: 404, description: 'Property not found' })
async updatePropertyPolicies(
  @Param('id', ParseIntPipe) propertyId: number,
  @Body('policies') policies: Array<{ name: string; description?: string; valid_until?: string }>
) {
  return this.propertyService.updatePropertyPolicies(propertyId, policies);
}

// delete property policies
@Delete(':id/policies/:policyId')
@ApiOperation({ summary: 'Delete a specific policy from a property and the Policies table' })
@ApiParam({ name: 'id', type: 'number', description: 'ID of the property' })
@ApiParam({ name: 'policyId', type: 'number', description: 'ID of the policy to delete' })
@ApiResponse({ status: 200, description: 'Policy deleted successfully' })
@ApiResponse({ status: 404, description: 'Property or policy not found' })
async removePropertyPolicy(
  @Param('id', ParseIntPipe) propertyId: number,
  @Param('policyId', ParseIntPipe) policyId: number
) {
  return this.propertyService.removePropertyPolicy(propertyId, policyId);
}

// update property amenities
@Put('update-amenity/:id')
@ApiOperation({ summary: 'Update amenities for a property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID of the property' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      amenities: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of amenity names',
      },
    },
  },
})
@ApiResponse({ status: 200, description: 'Amenities updated successfully' })
@ApiResponse({ status: 404, description: 'Property not found' })
async updatePropertyAmenities(
  @Param('id', ParseIntPipe) propertyId: number,
  @Body('amenities', new ParseArrayPipe({ items: String, separator: ',' })) amenities: string[]
) {
  return this.propertyService.updatePropertyAmenities(propertyId, amenities);
}

// delete property amenities
@Delete(':id/amenities/:amenityId')
@ApiOperation({ summary: 'Delete a specific amenity from a property' })
@ApiParam({ name: 'id', type: 'number', description: 'ID of the property' })
@ApiParam({ name: 'amenityId', type: 'number', description: 'ID of the amenity to delete' })
@ApiResponse({ status: 200, description: 'Amenity deleted successfully' })
@ApiResponse({ status: 404, description: 'Property or amenity not found' })
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


@Delete(':propertyId/images/:imageId')
@ApiOperation({ summary: 'Delete a specific image of a property' })
@ApiParam({ name: 'propertyId', type: 'number' })
@ApiParam({ name: 'imageId', type: 'number' })
@ApiResponse({ status: 200, description: 'Image deleted successfully' })
@ApiResponse({ status: 404, description: 'Property or image not found' })
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
  @ApiOperation({ summary: 'Add multiple images to a property' })
  @ApiResponse({ status: 201, description: 'Images added successfully.' })
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
        throw new BadRequestException('imageDetails must be an array');
      }
    } catch (error) {
      console.error('Error parsing imageDetails:', error);
      console.log('Received imageDetails:', imageDetails);
      throw new BadRequestException('Invalid imageDetails format');
    }

    console.log("Number of images: ", files.length);
    console.log("Number of details: ", parsedImageDetails.length);
    console.log("Image details: ", parsedImageDetails);

    if (files.length !== parsedImageDetails.length) {
      throw new BadRequestException('Number of images and details do not match');
    }

    return this.propertyService.addPropertyImages(id, files, parsedImageDetails);
  }

}

  






