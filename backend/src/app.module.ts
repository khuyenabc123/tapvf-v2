import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { AcademicEventsModule } from './academic-events/academic-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    StudentsModule,
    AcademicEventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
