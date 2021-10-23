import { Test, TestingModule } from '@nestjs/testing';
import { TilesController } from './tiles.controller';
import { TilesService } from './tiles.service';

describe('TilesController', () => {
  let controller: TilesController;
  const tilesServiceMock = {
    dupa: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TilesController],
      providers: [{ provide: TilesService, useValue: tilesServiceMock }],
    }).compile();

    controller = module.get<TilesController>(TilesController);
  });

  it('should be defined', () => {
    tilesServiceMock.dupa.mockReturnValue(22);
    expect(controller).toBeDefined();
  });

  it('ssss'); //it to alias dla test
});
