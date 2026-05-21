import { Controller, Post, Body, Get, Put, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') pass: string,
    @Body('name') name: string,
  ) {
    return await this.authService.register(username, pass, name);
  }

  @Post('register-driver')
  async registerDriver(
    @Body('nombre') nombre: string,
    @Body('apellido') apellido: string,
    @Body('unidad') unidad: string,
    @Body('password') pass: string,
  ) {
    return await this.authService.registerDriver(nombre, apellido, unidad, pass);
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') pass: string,
  ) {
    return await this.authService.login(username, pass);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending-drivers')
  async getPendingDrivers() {
    return await this.authService.getPendingDrivers();
  }

  @UseGuards(JwtAuthGuard)
  @Put('approve-driver/:id')
  async approveDriver(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.authService.updateDriverStatus(id, status);
  }
}
