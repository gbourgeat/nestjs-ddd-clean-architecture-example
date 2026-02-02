import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { RestApiModule } from '../../src/presentation/rest-api/rest-api.module';

describe('PATCH /road-segments/:id (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestApiModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      logger: false, // Disable NestJS logs in tests
    });
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    // Create a road segment for testing updates
    await request(app.getHttpServer()).post('/road-segments').send({
      cityA: 'Paris',
      cityB: 'Lyon',
      distance: 465,
      speedLimit: 110,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should update speed limit successfully', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/lyon__paris')
      .send({
        newSpeedLimit: 130,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('roadSegmentId');
        expect(res.body).toHaveProperty('cityA');
        expect(res.body).toHaveProperty('cityB');
        expect(res.body).toHaveProperty('distance');
        expect(res.body).toHaveProperty('speedLimit');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.speedLimit).toBe(130);
      });
  });

  it('should return correct road segment ID', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/lyon__paris')
      .send({
        newSpeedLimit: 90,
      })
      .expect(200)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.speedLimit).toBe(90);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.roadSegmentId).toBe('lyon__paris');
      });
  });

  it('should return 404 for non-existent road segment', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/paris__unknowncity')
      .send({
        newSpeedLimit: 130,
      })
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('not found');
      });
  });

  it('should return 400 for negative speed', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/lyon__paris')
      .send({
        newSpeedLimit: -10,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain(
          'newSpeedLimit must not be less than 1',
        );
      });
  });

  it('should return 400 for invalid request (missing newSpeedLimit)', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/lyon__paris')
      .send({})
      .expect(400);
  });

  it('should return 400 for invalid ID format', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/invalid-format')
      .send({
        newSpeedLimit: 130,
      })
      .expect(400);
  });

  it('should validate that newSpeedLimit is a number', () => {
    return request(app.getHttpServer())
      .patch('/road-segments/lyon__paris')
      .send({
        newSpeedLimit: 'not-a-number',
      })
      .expect(400);
  });
});
