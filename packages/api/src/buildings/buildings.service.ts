import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';

@Injectable()
export class BuildingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.building.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: { assets: true },
    });
    if (!building) {
      throw new NotFoundException(`Building ${id} not found`);
    }
    return building;
  }

  create(dto: CreateBuildingDto) {
    return this.prisma.building.create({ data: dto });
  }
}
