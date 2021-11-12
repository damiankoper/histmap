import { Test, TestingModule } from '@nestjs/testing';
import { TileRendererService } from './tile-renderer.service';

describe('TileRendererService', () => {
  let service: TileRendererService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TileRendererService],
    }).compile();

    service = module.get<TileRendererService>(TileRendererService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
