import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private get shouldConnectOnBoot() {
    return process.env.PRISMA_CONNECT_ON_BOOT === "true";
  }

  async onModuleInit() {
    if (!this.shouldConnectOnBoot) {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    if (!this.shouldConnectOnBoot) {
      return;
    }
    await this.$disconnect();
  }
}
