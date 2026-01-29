import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RestApiModule } from '../../src/presentation/rest-api/rest-api.module';

describe('RouteController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/get-fastest-route (POST)', () => {
    it('should return a valid route between two cities', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          startCity: 'Paris',
          endCity: 'Lyon',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('path');
          expect(res.body).toHaveProperty('totalDistance');
          expect(res.body).toHaveProperty('estimatedDuration');
          expect(res.body).toHaveProperty('steps');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(Array.isArray(res.body.path)).toBe(true);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(Array.isArray(res.body.steps)).toBe(true);
        });
    });

    it('should return a direct route when available', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          startCity: 'Paris',
          endCity: 'Lyon',
        })
        .expect(201)
        .expect((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.path).toContain('Paris');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.path).toContain('Lyon');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.totalDistance).toBeGreaterThan(0);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.estimatedDuration).toBeGreaterThan(0);
        });
    });

    it('should handle constraints properly', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          startCity: 'Paris',
          endCity: 'Nice',
          constraints: {
            maxDistance: 500,
            minSpeed: 100,
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('path');
          expect(res.body).toHaveProperty('steps');
          // Verify all steps respect constraints
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          res.body.steps.forEach((step: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(step.distance).toBeLessThanOrEqual(500);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(step.speedLimit).toBeGreaterThanOrEqual(100);
          });
        });
    });

    it('should return 400 when startCity is missing', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          endCity: 'Lyon',
        })
        .expect(400);
    });

    it('should return 400 when endCity is missing', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          startCity: 'Paris',
        })
        .expect(400);
    });

    it('should return 404 when city does not exist', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          startCity: 'Paris',
          endCity: 'UnknownCity',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.message).toContain('not found');
        });
    });

    it('should return 400 when start and end cities are the same', () => {
      return request(app.getHttpServer())
        .post('/get-fastest-route')
        .send({
          startCity: 'Paris',
          endCity: 'Paris',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.message).toContain('cannot be the same');
        });
    });
  });

  describe('/road-segments/speed (PATCH)', () => {
    it('should update speed limit successfully', () => {
      return request(app.getHttpServer())
        .patch('/road-segments/speed')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
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

    it('should work with cities in reverse order', () => {
      return request(app.getHttpServer())
        .patch('/road-segments/speed')
        .send({
          cityA: 'Lyon',
          cityB: 'Paris',
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
        .patch('/road-segments/speed')
        .send({
          cityA: 'Paris',
          cityB: 'UnknownCity',
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
        .patch('/road-segments/speed')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          newSpeedLimit: -10,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.message).toContain('negative');
        });
    });

    it('should return 400 for invalid request (missing fields)', () => {
      return request(app.getHttpServer())
        .patch('/road-segments/speed')
        .send({
          cityA: 'Paris',
          // Missing cityB and newSpeedLimit
        })
        .expect(400);
    });

    it('should return 400 for empty city name', () => {
      return request(app.getHttpServer())
        .patch('/road-segments/speed')
        .send({
          cityA: '',
          cityB: 'Lyon',
          newSpeedLimit: 130,
        })
        .expect(400);
    });

    it('should validate that newSpeedLimit is a number', () => {
      return request(app.getHttpServer())
        .patch('/road-segments/speed')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          newSpeedLimit: 'not-a-number',
        })
        .expect(400);
    });
  });
});
