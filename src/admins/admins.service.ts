import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin) private adminsRepository: Repository<Admin>,
  ) {}

  async findAdmin(name: string): Promise<Admin | undefined> {
    return this.adminsRepository.findOne({ name });
  }
}
