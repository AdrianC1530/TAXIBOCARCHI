import { Controller, Get, Put, UseGuards, Query, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('detecciones')
  async getDetecciones() {
    return await this.appService.getDetecciones();
  }

  @Get('detecciones/latest')
  async getDeteccionLatest() {
    return await this.appService.getDeteccionLatest();
  }

  @Get('detecciones/filtradas')
  async getDeteccionesFiltradas(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return await this.appService.getDeteccionesFiltradas(startDate, endDate, limit, page);
  }

  @Get('settings')
  async getSettings() {
    return await this.appService.getSettings();
  }

  @Put('settings')
  async updateSettings(
    @Body('umbral_preventivo') prev: number,
    @Body('umbral_definitivo') def: number,
    @Body('tiempo_espera_segundos') cooldown: number,
  ) {
    return await this.appService.updateSettings(prev, def, cooldown);
  }

  @Get('stats/hourly')
  async getStatsHourly() {
    return await this.appService.getStatsHourly();
  }

  @Get('stats/weekly')
  async getStatsWeekly() {
    return await this.appService.getStatsWeekly();
  }
}
