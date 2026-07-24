import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(buildingId?: string) {
    return this.prisma.workOrder.findMany({
      where: buildingId ? { buildingId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { asset: true, assignee: true },
    });
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: { asset: true, assignee: true, building: true },
    });
    if (!workOrder) {
      throw new NotFoundException(`Work order ${id} not found`);
    }
    return workOrder;
  }
}
