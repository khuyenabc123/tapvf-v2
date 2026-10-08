import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  private client!: MongoClient;

  private db!: Db;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.configService.getOrThrow<string>('MONGO_DB_URI');

    try {
      this.client = new MongoClient(uri);

      await this.client.connect();

      this.db = this.client.db();

      await this.db.command({ ping: 1 });

      this.logger.log('Successfully connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB during startup: ', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();

      this.logger.log('MongoDB connection close');
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.db) return false;

      const res = await this.db.command({ ping: 1 });

      return res?.ok === 1;
    } catch (error) {
      this.logger.warn('Database ping failed: ', error);

      return false;
    }
  }

  getDb(): Db {
    return this.db;
  }
}
