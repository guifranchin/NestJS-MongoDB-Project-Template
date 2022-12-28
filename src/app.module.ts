import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://guifranchin:guifranchin@cluster0.kifk2ro.mongodb.net/?retryWrites=true&w=majority',
    ),
    PlayersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
