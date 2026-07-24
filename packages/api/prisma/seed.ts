import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Idempotent seed: fixed IDs + upsert, so re-running never throws P2002.
async function main() {
  const users = [
    { id: 'user_admin', email: 'admin@acme.test', name: 'Ada Admin', role: 'ADMIN' as const, active: true },
    { id: 'user_tech', email: 'tex@acme.test', name: 'Tex Technician', role: 'TECHNICIAN' as const, active: true },
    { id: 'user_inactive', email: 'gone@acme.test', name: 'Ivy Inactive', role: 'TECHNICIAN' as const, active: false },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, create: u, update: u });
  }

  const buildings = [
    { id: 'bldg_hq', name: 'Headquarters', address: '100 Main St' },
    { id: 'bldg_annex', name: 'North Annex', address: '250 Oak Ave' },
  ];
  for (const b of buildings) {
    await prisma.building.upsert({ where: { id: b.id }, create: b, update: b });
  }

  const assets = [
    { id: 'asset_hvac1', name: 'Rooftop HVAC Unit 1', category: 'HVAC', buildingId: 'bldg_hq' },
    { id: 'asset_boiler', name: 'Boiler A', category: 'Plumbing', buildingId: 'bldg_hq' },
    { id: 'asset_gen', name: 'Backup Generator', category: 'Electrical', buildingId: 'bldg_annex' },
  ];
  for (const a of assets) {
    await prisma.asset.upsert({ where: { id: a.id }, create: a, update: a });
  }

  const workOrders = [
    { id: 'wo_1', title: 'HVAC not cooling on 3rd floor', status: 'OPEN' as const, buildingId: 'bldg_hq', assetId: 'asset_hvac1', assigneeId: 'user_tech' },
    { id: 'wo_2', title: 'Boiler quarterly inspection', status: 'IN_PROGRESS' as const, buildingId: 'bldg_hq', assetId: 'asset_boiler', assigneeId: 'user_tech' },
    { id: 'wo_3', title: 'Generator failed to start', status: 'ON_HOLD' as const, buildingId: 'bldg_annex', assetId: 'asset_gen', assigneeId: null },
    { id: 'wo_4', title: 'Replace lobby air filter', status: 'DONE' as const, buildingId: 'bldg_hq', assetId: 'asset_hvac1', assigneeId: 'user_tech' },
  ];
  for (const w of workOrders) {
    await prisma.workOrder.upsert({ where: { id: w.id }, create: w, update: w });
  }

  const pmSchedules = [
    { id: 'pm_1', title: 'Monthly HVAC filter change', assetId: 'asset_hvac1', recurrence: 'FREQ=MONTHLY;BYMONTHDAY=1' },
    { id: 'pm_2', title: 'Quarterly boiler service', assetId: 'asset_boiler', recurrence: 'FREQ=MONTHLY;INTERVAL=3' },
  ];
  for (const p of pmSchedules) {
    await prisma.pmSchedule.upsert({ where: { id: p.id }, create: p, update: p });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete: 3 users, 2 buildings, 3 assets, 4 work orders, 2 PM schedules.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
