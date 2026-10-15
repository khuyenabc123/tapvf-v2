import { Module } from '@nestjs/common';
import { ProvenanceService } from './provenance.service';
import { ProvenanceController } from './provenance.controller';

@Module({
  providers: [ProvenanceService],
  controllers: [ProvenanceController]
})
export class ProvenanceModule {}                                    