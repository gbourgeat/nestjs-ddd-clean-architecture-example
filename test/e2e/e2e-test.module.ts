import { WeatherConditionProvider } from '@/infrastructure/pathfinding/weather-condition-provider';
import { RestApiModule } from '@/presentation/rest-api/rest-api.module';
import { Module } from '@nestjs/common';
import { FakeWeatherConditionProvider } from '@test/fixtures/services';

@Module({
  imports: [RestApiModule],
  providers: [
    {
      provide: WeatherConditionProvider,
      useClass: FakeWeatherConditionProvider,
    },
  ],
  exports: [WeatherConditionProvider],
})
export class E2ETestModule {}
