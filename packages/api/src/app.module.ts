import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BuildingsModule } from './buildings/buildings.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';

@Module({
  imports: [PrismaModule, BuildingsModule, WorkOrdersModule],
})
export class AppModule {}
