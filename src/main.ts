import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function startServer(port = 3000) {
  const app = await NestFactory.create(AppModule);

  await app.listen(port);
}

startServer();
