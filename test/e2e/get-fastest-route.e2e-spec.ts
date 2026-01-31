import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RestApiModule } from '../../src/presentation/rest-api/rest-api.module';

describe('POST /get-fastest-route (e2e)', () => {
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
        expect(res.body).toHaveProperty('estimatedTime');
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
        expect(res.body.estimatedTime).toBeGreaterThan(0);
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
          expect(step.speed).toBeGreaterThanOrEqual(100);
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
