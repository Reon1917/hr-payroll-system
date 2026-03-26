import { Module } from '@nestjs/common';
import { appEnv } from '../config/env';
import { APP_REPOSITORY } from './app-repository';
import { DrizzleAppRepository } from './drizzle-app-repository';
import { MemoryAppRepository } from './memory-app-repository';

@Module({
  providers: [
    DrizzleAppRepository,
    MemoryAppRepository,
    {
      provide: APP_REPOSITORY,
      useFactory: (
        drizzleRepository: DrizzleAppRepository,
        memoryRepository: MemoryAppRepository,
      ) =>
        appEnv.storageDriver === 'memory'
          ? memoryRepository
          : drizzleRepository,
      inject: [DrizzleAppRepository, MemoryAppRepository],
    },
  ],
  exports: [APP_REPOSITORY],
})
export class StorageModule {}
