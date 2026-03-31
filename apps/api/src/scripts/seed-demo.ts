import 'dotenv/config';
import { AuthService } from '../auth/auth.service';
import { appEnv } from '../config/env';
import { PayrollService } from '../payroll/payroll.service';
import { SeedsService } from '../seeds/seeds.service';
import { DrizzleAppRepository } from '../storage/drizzle-app-repository';
import { MemoryAppRepository } from '../storage/memory-app-repository';

async function main(): Promise<void> {
  const repository =
    appEnv.storageDriver === 'memory'
      ? new MemoryAppRepository()
      : new DrizzleAppRepository();

  const authService = new AuthService();
  const payrollService = new PayrollService(repository);
  const seedsService = new SeedsService(
    authService,
    payrollService,
    repository,
  );

  const result = await seedsService.resetAndSeed();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
