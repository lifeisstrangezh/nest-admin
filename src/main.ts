import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建nest应用实例
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
