import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExcepetionsFilters } from './common/filters/http.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExcepetionsFilters());
  await app.listen(3000);
}
bootstrap();
