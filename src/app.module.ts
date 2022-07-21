import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './ormconfig';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env'}),
    TypeOrmModule.forRoot(AppDataSource.options),
    TagModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
