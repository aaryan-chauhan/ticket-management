import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly customersService: CustomersService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    // Ensure the referenced customer actually exists (throws NotFoundException otherwise)
    await this.customersService.findOne(createTicketDto.customerId);

    const ticket = this.ticketsRepository.create(createTicketDto);
    const saved = await this.ticketsRepository.save(ticket);
    return this.findOne(saved.id);
  }

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      relations: { customer: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { customer: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (
      updateTicketDto.customerId !== undefined &&
      updateTicketDto.customerId !== ticket.customerId
    ) {
      await this.customersService.findOne(updateTicketDto.customerId);
    }

    Object.assign(ticket, updateTicketDto);
    await this.ticketsRepository.save(ticket);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }
}
