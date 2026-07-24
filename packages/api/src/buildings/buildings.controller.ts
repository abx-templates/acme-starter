import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';

@Controller('buildings')
@UseGuards(AuthGuard)
export class BuildingsController {
  constructor(private readonly buildings: BuildingsService) {}

  @Get()
  findAll() {
    return this.buildings.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buildings.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBuildingDto, @CurrentUser() user: User) {
    // Role check pattern: only ADMINs may create buildings.
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create buildings');
    }
    return this.buildings.create(dto);
  }
}
