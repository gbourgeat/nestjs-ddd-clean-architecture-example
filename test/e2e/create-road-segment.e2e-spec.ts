import { RestApiModule } from '@/presentation/rest-api/rest-api.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

describe('POST /road-segments (E2E)', () => {
  let app: INestApplication;

  // UUID regex for validation
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestApiModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      logger: false, // Disable NestJS logs in tests
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Success cases', () => {
    it('should create a new road segment successfully', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        })
        .expect(HttpStatus.CREATED);

      // Assert
      expect(response.body.roadSegmentId).toMatch(UUID_REGEX);
      expect(response.body.cityA).toBe('Lyon'); // Sorted alphabetically
      expect(response.body.cityB).toBe('Paris');
      expect(response.body.distance).toBe(465);
      expect(response.body.speedLimit).toBe(130);
    });

    it('should create a road segment with minimum valid values', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Marseille',
          distance: 0.1,
          speedLimit: 1,
        })
        .expect(HttpStatus.CREATED);

      // Assert
      expect(response.body.distance).toBe(0.1);
      expect(response.body.speedLimit).toBe(1);
    });

    it('should accept cities in any order and normalize them', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Toulouse',
          cityB: 'Bordeaux',
          distance: 245,
          speedLimit: 110,
        })
        .expect(HttpStatus.CREATED);

      // Assert - Cities should be sorted: Bordeaux before Toulouse
      expect(response.body.cityA).toBe('Bordeaux');
      expect(response.body.cityB).toBe('Toulouse');
      expect(response.body.roadSegmentId).toMatch(UUID_REGEX);
    });
  });

  describe('Validation errors', () => {
    it('should return 404 when cityA does not exist', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'UnknownCity',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        })
        .expect(HttpStatus.NOT_FOUND);

      // Assert
      expect(response.body.error).toBe('City Not Found');
      expect(response.body.message).toContain('UnknownCity');
    });

    it('should return 404 when cityB does not exist', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'UnknownCity',
          distance: 465,
          speedLimit: 130,
        })
        .expect(HttpStatus.NOT_FOUND);

      // Assert
      expect(response.body.error).toBe('City Not Found');
      expect(response.body.message).toContain('UnknownCity');
    });

    it('should return 400 when cityA is empty', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: '',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        })
        .expect(HttpStatus.BAD_REQUEST);

      // Assert - Can be either validation error or domain error
      expect([400]).toContain(response.status);
    });

    it('should allow zero distance', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 0,
          speedLimit: 130,
        })
        .expect(HttpStatus.CREATED);

      // Assert - Zero distance is allowed (domain rule)
      expect(response.body.distance).toBe(0);
    });

    it('should return 400 when distance is negative', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: -100,
          speedLimit: 130,
        })
        .expect(HttpStatus.BAD_REQUEST);

      // Assert - Validation error message can be string or array
      const message = response.body.message;
      const messageStr = Array.isArray(message) ? message.join(' ') : message;
      expect(messageStr.toLowerCase()).toContain('distance');
    });

    it('should allow zero speed limit', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 0,
        })
        .expect(HttpStatus.CREATED);

      // Assert - Zero speed is allowed (domain rule)
      expect(response.body.speedLimit).toBe(0);
    });

    it('should return 400 when speedLimit is negative', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: -50,
        })
        .expect(HttpStatus.BAD_REQUEST);

      // Assert - Validation error message can be string or array
      const message = response.body.message;
      const messageStr = Array.isArray(message) ? message.join(' ') : message;
      expect(messageStr.toLowerCase()).toContain('speedlimit');
    });

    it('should return 400 when cityA is missing', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when cityB is missing', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          distance: 465,
          speedLimit: 130,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when distance is missing', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          speedLimit: 130,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when speedLimit is missing', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when both cities are the same', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/road-segments')
        .send({
          cityA: 'Paris',
          cityB: 'Paris',
          distance: 100,
          speedLimit: 130,
        })
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.error).toBe('Invalid Road Segment');
    });
  });
});
