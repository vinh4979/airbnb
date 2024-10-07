import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Location, PropertyLocationWithoutLocationId, PropertyStatus, PropertyWithExtras, UploadImage } from './property.type';
import { CloudinaryService } from 'src/config/cloundinary/cloudinary.service';
import { Prisma } from '@prisma/client';

type PropertySearchResult = {
    properties: any[];
    message?: string;
  }

@Injectable()
export class PropertyService {
    constructor(private readonly prismaService: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) {}


    // get all property 
    async getAllProperties(): Promise<any[]> {
        const properties = await this.prismaService.$queryRaw<any[]>`
            SELECT 
              p.property_id,
              p.user_id,
              p.location_id,
              p.name,
              p.description,
              p.base_price,
              p.max_guests,
              p.type,
              p.status,
              GROUP_CONCAT(DISTINCT CONCAT_WS('|', pi.image_id, pi.image_url, pi.image_type, pi.is_primary, pi.caption)) as images,
              GROUP_CONCAT(DISTINCT CONCAT_WS('|', pol.policy_id, pol.name, pol.description)) as policy,
              GROUP_CONCAT(DISTINCT CONCAT_WS('|', a.amenity_id, a.name, a.icon)) as amenities
            FROM Properties p
            LEFT JOIN PropertyImages pi ON p.property_id = pi.property_id
            LEFT JOIN Property_Policies pp ON p.property_id = pp.property_id
            LEFT JOIN Policies pol ON pp.policy_id = pol.policy_id
            LEFT JOIN Property_Amenities pa ON p.property_id = pa.property_id
            LEFT JOIN Amenities a ON pa.amenity_id = a.amenity_id
            GROUP BY p.property_id
        `;

        return properties.map(property => ({
            ...property,
            base_price: parseFloat(property.base_price),
            images: property.images ? property.images.split(',').map(img => {
                const [image_id, image_url, image_type, is_primary, caption] = img.split('|');
                return { image_id, image_url, image_type, is_primary: is_primary === 'true', caption };
            }) : [],
            policy: property.policy ? property.policy.split(',').map(pol => {
                const [policy_id, name, description] = pol.split('|');
                return { policy_id, name, description };
            }) : [],
            amenities: property.amenities ? property.amenities.split(',').map(amen => {
                const [amenity_id, name, icon] = amen.split('|');
                return { amenity_id, name, icon };
            }) : []
        }));
    }

    async createProperty(body: PropertyLocationWithoutLocationId) {

        // location
        const {country, province, city, address , ...property} = body
        const newLocation = await this.prismaService.locations.create({
        data: {
            country, 
            province, 
            city, 
            address
        }
       });
       // Kiểm tra xem newLocation có được tạo thành công không
       if (!newLocation) {
           throw new Error('Failed to create new location');
       }

       const newProperty = await this.prismaService.properties.create({
        data : {...property, location_id : newLocation.location_id}
       })

       // status image, policy, amenities 
       const propertyImage = await this.prismaService.propertyImages.findMany({
        where: {
            property_id: newProperty.property_id
        }
       })
       const propertyPolicy = await this.prismaService.property_Policies.findMany({
        where: {
            property_id: newProperty.property_id
        }
       })   
       const propertyAmenities = await this.prismaService.property_Amenities.findMany({
        where: {
            property_id: newProperty.property_id
        }
       })
       return{
        ...newProperty,
        base_price: newProperty.base_price.toNumber(),
        propertyImage : propertyImage.length > 0 ? "đã cập nhật ảnh" : "vui lòng cập nhật ảnh",
        propertyPolicy : propertyPolicy.length > 0 ? "đã cập nhật chính sách" : "vui lòng cập nhật chính sách",
        propertyAmenities : propertyAmenities.length > 0 ? "đã cập nhật tiện nghi" : "vui lòng cập nhật tiện nghi"
    } as PropertyWithExtras
        
    } 

    // test upload image 
    async uploadImages(files: Array<Express.Multer.File>, descriptions: string[]): Promise<UploadImage[]> {
        if (files.length !== descriptions.length) {
            throw new Error('Số lượng ảnh và mô tả không khớp');
        }

        const uploadPromises = files.map((file, index) => {
          const description = descriptions[index];
          return this.cloudinaryService.uploadImage(file).then(result => ({
            image: result.secure_url,
            description
          }));
        });

        const uploadResults = await Promise.all(uploadPromises);
        return uploadResults;
    }

    // update property image 
    async updatePropertyImages(
        property_id: number,
        files: Array<Express.Multer.File>,
        imageDetails: Array<{
            image_type: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other',
            is_primary: boolean,
            caption: string
        }>
    ) {
        if (files.length !== imageDetails.length) {
            throw new BadRequestException('Số lượng ảnh và thông tin chi tiết không khớp');
        }

        const property = await this.prismaService.properties.findUnique({
            where: { property_id }
        });

        if (!property) {
            throw new BadRequestException(`Không tìm thấy property với ID ${property_id}`);
        }

        const uploadPromises = files.map(async (file, index) => {
            const detail = imageDetails[index];
            const uploadResult = await this.cloudinaryService.uploadImage(file);
            
            return this.prismaService.propertyImages.create({
                data: {
                    property_id,
                    image_url: uploadResult.secure_url,
                    image_type: detail.image_type,
                    is_primary: detail.is_primary,
                    caption: detail.caption,
                    upload_date: new Date()
                }
            });
        });

        const uploadedImages = await Promise.all(uploadPromises);

        return {
            message: `Đã cập nhật thành công ${uploadedImages.length} ảnh cho property ${property_id}`,
            updatedImages: uploadedImages
        };
    }

    // add multiple image by property id 
    async addPropertyImages(
    property_id: number,
    files: Express.Multer.File[],
    imageDetails: Array<{
      image_type: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other',
      is_primary: boolean,
      caption: string
    }>
  ) {
    if (files.length !== imageDetails.length) {
      throw new BadRequestException('Số lượng ảnh và thông tin chi tiết không khớp');
    }

    const property = await this.prismaService.properties.findUnique({
      where: { property_id }
    });

    if (!property) {
      throw new BadRequestException(`Không tìm thấy property với ID ${property_id}`);
    }

    const addedImages = await Promise.all(
      files.map(async (file, index) => {
        let detail = imageDetails[index];
        if (typeof detail === 'string') {
          try {
            detail = JSON.parse(detail) as {
              image_type: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other',
              is_primary: boolean,
              caption: string
            };
          } catch (error) {
            throw new BadRequestException(`Invalid JSON for image detail at index ${index}`);
          }
        }

        const uploadResult = await this.cloudinaryService.uploadImage(file);
        
        return this.prismaService.propertyImages.create({
          data: {
            property_id,
            image_url: uploadResult.secure_url,
            image_type: detail.image_type,
            is_primary: detail.is_primary ?? false,
            caption: detail.caption ?? '',
            upload_date: new Date()
          }
        });
      })
    );

    return {
      message: `Đã thêm thành công ${addedImages.length} ảnh cho property ${property_id}`,
      addedImages: addedImages
    };
    }

    // search property by location
    async searchPropertiesByLocation(searchTerm: string): Promise<any[]> {
    const properties = await this.prismaService.$queryRaw<any[]>`
        SELECT 
            p.property_id,
            p.name AS property_name,
            p.description,
            p.base_price,
            p.max_guests,
            p.type,
            p.status,
            l.country,
            l.province,
            l.city,
            l.address,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', pi.image_id, pi.image_url, pi.image_type, pi.is_primary, pi.caption)) as images,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', a.amenity_id, a.name, a.icon)) as amenities,
            GROUP_CONCAT(DISTINCT CONCAT_WS('|', pol.policy_id, pol.name, pol.description)) as policies
        FROM Properties p
        JOIN Locations l ON p.location_id = l.location_id
        LEFT JOIN PropertyImages pi ON p.property_id = pi.property_id
        LEFT JOIN Property_Amenities pa ON p.property_id = pa.property_id
        LEFT JOIN Amenities a ON pa.amenity_id = a.amenity_id
        LEFT JOIN Property_Policies pp ON p.property_id = pp.property_id
        LEFT JOIN Policies pol ON pp.policy_id = pol.policy_id
        WHERE 
            l.country LIKE ${`%${searchTerm}%`} OR
            l.province LIKE ${`%${searchTerm}%`} OR
            l.city LIKE ${`%${searchTerm}%`} OR
            l.address LIKE ${`%${searchTerm}%`}
        GROUP BY p.property_id
    `;

    return properties.map(property => ({
        ...property,
        base_price: parseFloat(property.base_price),
        images: property.images ? property.images.split(',').map(img => {
            const [image_id, image_url, image_type, is_primary, caption] = img.split('|');
            return { image_id, image_url, image_type, is_primary: is_primary === 'true', caption };
        }) : [],
        amenities: property.amenities ? property.amenities.split(',').map(amen => {
            const [amenity_id, name, icon] = amen.split('|');
            return { amenity_id, name, icon };
        }) : [],
        policies: property.policies ? property.policies.split(',').map(pol => {
            const [policy_id, name, description] = pol.split('|');
            return { policy_id, name, description };
        }) : []
    }));
    }

    // search property by name
    async getPropertyById(propertyId: number): Promise<any> {
        const property = await this.prismaService.$queryRaw<any[]>`
            SELECT 
                p.property_id,
                p.name AS property_name,
                p.description,
                p.base_price,
                p.max_guests,
                p.type,
                p.status,
                l.country,
                l.province,
                l.city,
                l.address,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', pi.image_id, pi.image_url, pi.image_type, pi.is_primary, pi.caption)) as images,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', a.amenity_id, a.name, a.icon)) as amenities,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', pol.policy_id, pol.name, pol.description)) as policies
            FROM Properties p
            JOIN Locations l ON p.location_id = l.location_id
            LEFT JOIN PropertyImages pi ON p.property_id = pi.property_id
            LEFT JOIN Property_Amenities pa ON p.property_id = pa.property_id
            LEFT JOIN Amenities a ON pa.amenity_id = a.amenity_id
            LEFT JOIN Property_Policies pp ON p.property_id = pp.property_id
            LEFT JOIN Policies pol ON pp.policy_id = pol.policy_id
            WHERE p.property_id = ${propertyId}
            GROUP BY p.property_id
        `;

        if (property.length === 0) {
            throw new NotFoundException(`Property with ID ${propertyId} not found`);
        }

        const formattedProperty = {
            ...property[0],
            base_price: parseFloat(property[0].base_price),
            images: property[0].images ? property[0].images.split(',').map(img => {
                const [image_id, image_url, image_type, is_primary, caption] = img.split('|');
                return { image_id, image_url, image_type, is_primary: is_primary === 'true', caption };
            }) : [],
            amenities: property[0].amenities ? property[0].amenities.split(',').map(amen => {
                const [amenity_id, name, icon] = amen.split('|');
                return { amenity_id, name, icon };
            }) : [],
            policies: property[0].policies ? property[0].policies.split(',').map(pol => {
                const [policy_id, name, description] = pol.split('|');
                return { policy_id, name, description };
            }) : []
        };

        return formattedProperty;
    }

    async getPropertiesByType(type: string): Promise<any[]> {
        const properties = await this.prismaService.$queryRaw<any[]>`
            SELECT 
                p.property_id,
                p.name AS property_name,
                p.description,
                p.base_price,
                p.max_guests,
                p.type,
                p.status,
                l.country,
                l.province,
                l.city,
                l.address,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', pi.image_id, pi.image_url, pi.image_type, pi.is_primary, pi.caption)) as images,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', a.amenity_id, a.name, a.icon)) as amenities,
                GROUP_CONCAT(DISTINCT CONCAT_WS('|', pol.policy_id, pol.name, pol.description)) as policies
            FROM Properties p
            JOIN Locations l ON p.location_id = l.location_id
            LEFT JOIN PropertyImages pi ON p.property_id = pi.property_id
            LEFT JOIN Property_Amenities pa ON p.property_id = pa.property_id
            LEFT JOIN Amenities a ON pa.amenity_id = a.amenity_id
            LEFT JOIN Property_Policies pp ON p.property_id = pp.property_id
            LEFT JOIN Policies pol ON pp.policy_id = pol.policy_id
            WHERE p.type = ${type}
            GROUP BY p.property_id
        `;

        return properties.map(property => ({
            ...property,
            base_price: parseFloat(property.base_price),
            images: property.images ? property.images.split(',').map(img => {
                const [image_id, image_url, image_type, is_primary, caption] = img.split('|');
                return { image_id, image_url, image_type, is_primary: is_primary === 'true', caption };
            }) : [],
            amenities: property.amenities ? property.amenities.split(',').map(amen => {
                const [amenity_id, name, icon] = amen.split('|');
                return { amenity_id, name, icon };
            }) : [],
            policies: property.policies ? property.policies.split(',').map(pol => {
                const [policy_id, name, description] = pol.split('|');
                return { policy_id, name, description };
            }) : []
        }));
    }

    // search property by amenities
    async getPropertiesByAmenities(amenities: string[]): Promise<PropertySearchResult> {
        try {
        const properties = await this.prismaService.properties.findMany({
            where: {
            Property_Amenities: {
                some: {
                Amenities: {
                    OR: [
                    { name: { in: amenities } },
                    { amenity_id: { in: amenities.filter(a => !isNaN(Number(a))).map(Number) } }
                    ]
                }
                }
            }
            },
            include: {
            Locations: true,
            PropertyImages: true,
            Property_Amenities: {
                include: {
                Amenities: true
                }
            },
            Property_Policies: {
                include: {
                Policies: true
                }
            }
            }
        });
    
        if (properties.length === 0) {
            return {
            message: 'Không tìm thấy phòng nào phù hợp với các tiện nghi đã chọn.',
            properties: []
            };
        }
    
        return {
            properties: properties.map(property => {
            const { Property_Amenities, Property_Policies, PropertyImages, ...rest } = property;
            return {
                ...rest,
                base_price: property.base_price.toNumber(),
            };
            })
        };
        } catch (error) {
        console.error('Lỗi chi tiết:', error);
        throw new InternalServerErrorException('Đã xảy ra lỗi khi tìm kiếm bất động sản');
        }
    }

    // edit location by property id 
    async updatePropertyLocation(propertyId: number, updateLocation : Location): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
        where: { property_id: propertyId },
        include: { Locations: true }
        });
    
        if (!property) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
        }
    
        const updatedLocation = await this.prismaService.locations.update({
        where: { location_id: property.location_id },
        data: {
            country: updateLocation.country || property.Locations.country,
            province: updateLocation.province || property.Locations.province,
            city: updateLocation.city || property.Locations.city,
            address: updateLocation.address || property.Locations.address,
        },
        });
    
        return {
        message: 'Location updated successfully',
        updatedLocation,
        };
    }


    // add property policies
    async updatePropertyPolicies(propertyId: number, policies: Array<{ name: string; description?: string; valid_until?: string }>): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
        where: { property_id: propertyId },
        });
    
        if (!property) {
        throw new NotFoundException(`Property with ID ${propertyId} not found`);
        }
    
        const createdPolicies = await Promise.all(
        policies.map(async (policy) => {
            const newPolicy = await this.prismaService.policies.create({
            data: {
                name: policy.name,
                description: policy.description,
                valid_until: policy.valid_until ? new Date(policy.valid_until) : null,
            },
            });
    
            await this.prismaService.property_Policies.create({
            data: {
                property_id: propertyId,
                policy_id: newPolicy.policy_id,
            },
            });
    
            return newPolicy;
        })
        );
    
        return {
        message: 'Chính sách đã được cập nhật thành công',
        updatedPolicies: createdPolicies,
        };
    }

    // delete property policies
    async removePropertyPolicy(propertyId: number, policyId: number): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
        where: { property_id: propertyId },
        });
    
        if (!property) {
        throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
        }
    
        const propertyPolicy = await this.prismaService.property_Policies.findFirst({
        where: {
            property_id: propertyId,
            policy_id: policyId,
        },
        });
    
        if (!propertyPolicy) {
        throw new NotFoundException(`Không tìm thấy chính sách với ID ${policyId} cho property này`);
        }
    
        await this.prismaService.$transaction([
        this.prismaService.property_Policies.delete({
            where: {
            property_id_policy_id: {
                property_id: propertyId,
                policy_id: policyId,
            },
            },
        }),
        this.prismaService.policies.delete({
            where: { policy_id: policyId },
        }),
        ]);
    
        return {
        message: `Đã xóa chính sách với ID ${policyId} khỏi property ${propertyId} và bảng Policies`,
        };
    }

    // add property amenities
    async updatePropertyAmenities(propertyId: number, amenities: string[]): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
        where: { property_id: propertyId },
        });
    
        if (!property) {
        throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
        }
    
        const updatedAmenities = await Promise.all(
        amenities.map(async (amenityName) => {
            let amenity = await this.prismaService.amenities.findFirst({
            where: { name: amenityName },
            });
    
            if (!amenity) {
            amenity = await this.prismaService.amenities.create({
                data: { name: amenityName },
            });
            }
    
            const existingPropertyAmenity = await this.prismaService.property_Amenities.findFirst({
            where: {
                property_id: propertyId,
                amenity_id: amenity.amenity_id,
            },
            });
    
            if (!existingPropertyAmenity) {
            await this.prismaService.property_Amenities.create({
                data: {
                property_id: propertyId,
                amenity_id: amenity.amenity_id,
                },
            });
            }
    
            return amenity;
        })
        );
    
        return {
        message: 'Amenities đã được cập nhật thành công',
        updatedAmenities,
        };
    }

    // delete property amenities
    async removePropertyAmenity(propertyId: number, amenityId: number): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
        where: { property_id: propertyId },
        });
    
        if (!property) {
        throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
        }
    
        const propertyAmenity = await this.prismaService.property_Amenities.findFirst({
        where: {
            property_id: propertyId,
            amenity_id: amenityId,
        },
        });
    
        if (!propertyAmenity) {
        throw new NotFoundException(`Không tìm thấy tiện nghi với ID ${amenityId} cho property này`);
        }
    
        await this.prismaService.property_Amenities.delete({
        where: {
            property_id_amenity_id: {
            property_id: propertyId,
            amenity_id: amenityId,
            },
        },
        });
    
        return {
        message: `Đã xóa tiện nghi với ID ${amenityId} khỏi property ${propertyId}`,
        };
    }

    // update property image by id 

    // async updatePropertyImage(
    //     propertyId: number,
    //     imageId: number,
    //     updateData: {
    //       image_type?: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other';
    //       is_primary?: boolean;
    //       caption?: string;
    //     }
    //   ): Promise<any> {
    //     const property = await this.prismaService.properties.findUnique({
    //       where: { property_id: propertyId },
    //       include: { PropertyImages: true }
    //     });
      
    //     if (!property) {
    //       throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
    //     }
      
    //     const image = property.PropertyImages.find(img => img.image_id === imageId);
      
    //     if (!image) {
    //       throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId} cho property này`);
    //     }
      
    //     const updatedImage = await this.prismaService.propertyImages.update({
    //       where: { image_id: imageId },
    //       data: updateData
    //     });
      
    //     return {
    //       message: 'Thông tin ảnh đã được cập nhật thành công',
    //       updatedImage
    //     };
    //   }

      // update and delete property image 
      async updatePropertyImage(
        propertyId: number,
        imageId: number,
        updateData: {
          image_type?: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'view' | 'dining_area' | 'other';
          is_primary?: boolean | string;
          caption?: string;
          file?: Express.Multer.File;
        }
      ): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
          where: { property_id: propertyId },
          include: { PropertyImages: true }
        });
      
        if (!property) {
          throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
        }
      
        const image = property.PropertyImages.find(img => img.image_id === imageId);
      
        if (!image) {
          throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId} cho property này`);
        }
      
        let imageUrl = image.image_url;
        console.log('Update data:', updateData);
      
        if (updateData.file) {
          try {
            // Xóa ảnh cũ trên Cloudinary
            const oldPublicId = this.getPublicIdFromUrl(image.image_url);
            console.log('Old public ID:', oldPublicId);
            const deleteResult = await this.cloudinaryService.deleteImage(oldPublicId);
            console.log('Delete result:', deleteResult);
      
            // Tải lên ảnh mới
            const uploadResult = await this.cloudinaryService.uploadImage(updateData.file);
            imageUrl = uploadResult.secure_url;
            console.log('New image URL:', imageUrl);
          } catch (error) {
            console.error('Error updating image:', error);
            throw new BadRequestException('Không thể cập nhật ảnh. Vui lòng thử lại.');
          }
        }
      
        const updatedImage = await this.prismaService.propertyImages.update({
          where: { image_id: imageId },
          data: {
            image_type: updateData.image_type || image.image_type,
            is_primary: updateData.is_primary !== undefined 
              ? updateData.is_primary === 'true' || updateData.is_primary === true 
              : image.is_primary,
            caption: updateData.caption || image.caption,
            image_url: imageUrl
          }
        });
      
        console.log('Updated image:', updatedImage);
      
        return {
          message: 'Thông tin ảnh đã được cập nhật thành công',
          updatedImage
        };
      }
      
      async deletePropertyImage(propertyId: number, imageId: number): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
          where: { property_id: propertyId },
          include: { PropertyImages: true }
        });
      
        if (!property) {
          throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
        }
      
        const image = property.PropertyImages.find(img => img.image_id === imageId);
      
        if (!image) {
          throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId} cho property này`);
        }
      
        // Xóa ảnh trên Cloudinary
        const publicId = this.getPublicIdFromUrl(image.image_url);
        await this.cloudinaryService.deleteImage(publicId);
      
        // Xóa bản ghi trong cơ sở dữ liệu
        await this.prismaService.propertyImages.delete({
          where: { image_id: imageId }
        });
      
        return {
          message: `Đã xóa ảnh với ID ${imageId} khỏi property ${propertyId}`
        };
      }
      
      private getPublicIdFromUrl(url: string): string {
        const parts = url.split('/');
        const filenameWithExtension = parts[parts.length - 1];
        const publicId = filenameWithExtension.split('.')[0];
        return `uploads/${publicId}`;
      }


      async updatePropertyStatus(propertyId: number, status: PropertyStatus): Promise<any> {
        const property = await this.prismaService.properties.findUnique({
          where: { property_id: propertyId },
        });
      
        if (!property) {
          throw new NotFoundException(`Không tìm thấy property với ID ${propertyId}`);
        }
      
        const updatedProperty = await this.prismaService.properties.update({
          where: { property_id: propertyId },
          data: { status },
        });
      
        return {
          message: 'Trạng thái đã được cập nhật thành công',
          updatedProperty,
        };
      }
      
}




  
