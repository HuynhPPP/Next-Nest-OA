import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customizeGuard';
import { ChangePasswordDto, CodeAuthDto, CreateAuthDto } from './dto/create-auth.dto';
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
  @ResponseMessage("Fetch Login")
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }


  @Post('register')
  @Public()
  handleRegister(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('check-code')
  @Public()
  handleCheckCode(@Body() checkCodeDto: CodeAuthDto) {
    return this.authService.checkCode(checkCodeDto);
  }

  @Post('resend-code')
  @Public()
  handleResendCode(@Body("email") email: string) {
    return this.authService.resendCode(email);
  }

  @Post('retry-password')
  @Public()
  handleRetryPassword(@Body("email") email: string) {
    return this.authService.retryPassword(email);
  }

  @Post('change-password')
  @Public()
  handleChangePassword(@Body() data: ChangePasswordDto) {
    return this.authService.changePassword(data);
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
