import {
  StallRepository,
  type CreateStallInput,
  type FindAllParams,
} from '../repositories/stallRepository.ts';
import type { StallResponseDto } from '../dtos/stallDto.ts';
import { NotFoundError } from '../errors/AppError.ts';

type StallRow = NonNullable<Awaited<ReturnType<StallRepository['findById']>>>;

export class StallService {
  constructor(private stallRepository: StallRepository = new StallRepository()) {}

  private toDto(row: StallRow): StallResponseDto {
    const avgRating = Number(row.avgRating);
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      location: row.location,
      description: row.description,
      avgRating,
      reviewCount: row.reviewCount,
      isPopular: avgRating >= 4.7,
    };
  }

  async getAllStalls(params: FindAllParams) {
    const { rows, total } = await this.stallRepository.findAll(params);
    return { data: rows.map((row) => this.toDto(row)), total };
  }

  async getStallById(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async createStall(input: CreateStallInput): Promise<StallResponseDto> {
    const row = await this.stallRepository.create(input);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async updateStall(id: number, input: Partial<CreateStallInput>): Promise<StallResponseDto> {
    const row = await this.stallRepository.update(id, input);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async deleteStall(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.remove(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }
}
