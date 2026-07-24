import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { WorkOrdersService } from './work-orders.service';

@Controller('work-orders')
@UseGuards(AuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrders: WorkOrdersService) {}

  @Get()
  findAll(@Query('buildingId') buildingId?: string) {
    return this.workOrders.findAll(buildingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrders.findOne(id);
  }

  // NOTE: status transitions are implemented by the candidate (see SPEC.md).
}
