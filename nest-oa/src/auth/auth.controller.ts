import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '@/decorator/customizeGuard';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) { }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }


  @Post('register')
  @Public()
  handleRegister(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }

  @Get('mail')
  @Public()
  async testMail() {
    await this.mailerService.sendMail({
      to: "phanhuynh23223@gmail.com",
      subject: 'Test Mail',
      text: 'Test Mail',
      template: "register",
      context: {
        name: "Huynh Phan",
        activationCode: "a35g47hssx"
      }
    });
    return "ok";
  }

}
