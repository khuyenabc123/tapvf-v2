import { Injectable, OnModuleInit } from '@nestjs/common';
import { Collection } from 'mongodb';
import { UserDocument, UserRole } from './users.types';
import { DatabaseService } from 'src/db/database.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'node_modules/bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private users!: Collection<UserDocument>;

  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.users = this.database.collection<UserDocument>('users');

    await this.users.createIndex({ username: 1 }, { unique: true });

    await this.seedDevUsers();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.users.findOne({ username });
  }

  async seedDevUsers(): Promise<void> {
    const count = await this.users.countDocuments({});

    if (count !== 0) {
      return;
    }

    const users: Array<{
      username: string;
      password: string;
      role: UserRole;
      email: string;
    }> = [
      {
        username: 'superadmin',
        password:
          this.configService.get<string>('SUPERADMIN_PASSWORD') ?? 'super123',
        role: 'SUPER_ADMIN',
        email: 'superadmin@tapvf.local',
      },
      {
        username: 'admin',
        password:
          this.configService.get<string>('ADMIN_PASSWORD') ?? 'admin123',
        role: 'ADMIN',
        email: 'admin@tapvf.local',
      },
      {
        username: 'president',
        password:
          this.configService.get<string>('PRESIDENT_PASSWORD') ??
          'president123',
        role: 'PRESIDENT',
        email: 'president@tapvf.local',
      },
      {
        username: 'teacher',
        password:
          this.configService.get<string>('TEACHER_PASSWORD') ?? 'teacher123',
        role: 'TEACHER',
        email: 'teacher@tapvf.local',
      },
      {
        username: 'student',
        password:
          this.configService.get<string>('STUDENT_PASSWORD') ?? 'student123',
        role: 'STUDENT',
        email: 'student@tapvf.local',
      },
    ];

    const hashesUsers = await Promise.all(
      users.map(async (user) => ({
        username: user.username,
        passwordHash: await bcrypt.hash(user.password, 12),
        role: user.role,
        email: user.email,
        createdAt: new Date(),
      })),
    );

    await this.users.insertMany(hashesUsers);

    console.warn(
      '⚠️ DEV USERS SEEDED WITH DEFAULT PASSWORDS. ' +
        'These passwords MUST be changed before any real deployment.',
    );
  }
}
