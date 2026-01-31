import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RestApiModule } from '../../src/presentation/rest-api/rest-api.module';

describe('PATCH /road-segments/speed (e2e)', () => {
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
        expect(res.body.message).toContain('newSpeedLimit must not be less than 1');
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
