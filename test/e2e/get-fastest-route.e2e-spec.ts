import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RestApiModule } from '../../src/presentation/rest-api/rest-api.module';
import { WeatherConditionProvider } from '@/infrastructure/pathfinding/weather-condition-provider';
import { FakeWeatherConditionProvider } from '@test/fixtures/services';

describe('POST /get-fastest-route (e2e)', () => {
  let app: INestApplication<App>;
  let fakeWeatherProvider: FakeWeatherConditionProvider;

  beforeAll(async () => {
    fakeWeatherProvider = new FakeWeatherConditionProvider();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestApiModule],
    })
      .overrideProvider(WeatherConditionProvider)
      .useValue(fakeWeatherProvider)
      .compile();

    app = moduleFixture.createNestApplication({
      logger: false, // Disable NestJS logs in tests
    });
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    // Create necessary road segments for tests
    await request(app.getHttpServer()).post('/road-segments').send({
      cityA: 'Paris',
      cityB: 'Lyon',
      distance: 465,
      speedLimit: 130,
    });

    await request(app.getHttpServer()).post('/road-segments').send({
      cityA: 'Lyon',
      cityB: 'Marseille',
      distance: 310,
      speedLimit: 130,
    });

    await request(app.getHttpServer()).post('/road-segments').send({
      cityA: 'Paris',
      cityB: 'Nice',
      distance: 930,
      speedLimit: 130,
    });

    await request(app.getHttpServer()).post('/road-segments').send({
      cityA: 'Lyon',
      cityB: 'Nice',
      distance: 470,
      speedLimit: 120,
    });

    // Wait a bit to ensure all data is properly written
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return a valid route between two cities', async () => {
    const res = await request(app.getHttpServer())
      .post('/get-fastest-route')
      .send({
        startCity: 'Paris',
        endCity: 'Lyon',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('path');
    expect(res.body).toHaveProperty('totalDistance');
    expect(res.body).toHaveProperty('estimatedTime');
    expect(res.body).toHaveProperty('steps');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(Array.isArray(res.body.path)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(Array.isArray(res.body.steps)).toBe(true);
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
