import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { User } from '../src/users/user.schema.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const email = `e2e-${randomUUID()}@example.com`;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('registers users and enforces read-only inventory access', async () => {
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'test-password-123' })
      .expect(201);

    expect(registration.body.user).toMatchObject({ email, role: 'user' });
    expect(registration.body.accessToken).toEqual(expect.any(String));

    const token = registration.body.accessToken as string;
    await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([]);

    await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({
        totalProducts: 0,
        totalStock: 0,
        lowStockCount: 0,
        lowStockProducts: [],
      });

    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Notebook',
        category: 'Stationery',
        price: 50,
        quantity: 25,
        minStock: 10,
      })
      .expect(403);
  });

  afterEach(async () => {
    if (app) {
      const users = app.get<Model<User>>(getModelToken(User.name));
      await users.deleteOne({ email });
    }
    await app.close();
  });
});
