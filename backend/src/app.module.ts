import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { AcademicEventsModule } from './academic-events/academic-events.module';
import { ProvenanceModule } from './provenance/provenance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    StudentsModule,
    AcademicEventsModule,
    ProvenanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
