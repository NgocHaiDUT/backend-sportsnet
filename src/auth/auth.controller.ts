import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService,
        private readonly mailerService: MailerService
    ) {}
    @Post('login')
    async login(@Body() loginDto: { username: string; password: string }) {
        if (loginDto.username) {
            return this.authService.login(loginDto.username, loginDto.password);
        } else {
        return { success: false, message: 'Username is required' };
        }
    }
    @Post('register')
    async register(@Body() registerDto: { username: string; email: string;role:string; password: string }) {
        if (registerDto.username && registerDto.email && registerDto.password ) {
            return this.authService.register(
                registerDto.username,
                registerDto.email,
                registerDto.password,
                registerDto.role
            );  
        } else {
            return { success: false, message: 'All fields are required' };
        }
    }
    @Post('forgot-password')
    async sendemail(@Body() emailDto:{email:string}){
        const user = await this.prisma.account.findFirst({
            where: { Email: emailDto.email },
        });
        if (!user) {
        return { success: false, message: 'Email not found' };
        }
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        await this.prisma.account.update({
            where: { Id: user.Id },
            data: { Password: hashedPassword },
        });
        try {
            await this.mailerService
                        .sendMail({
                            to: `${emailDto.email}`, 
                            subject: 'Đặt lại mật khẩu',
                                text: `Mật khẩu tạm thời của bạn là: ${tempPassword}`,  
                                html: `Mật khẩu tạm thời của bạn là: ${tempPassword}`, 
                            });
                            } catch (error) {
                            console.error('Lỗi khi gửi email đặt lại mật khẩu:', error);
                            throw new Error('Thất bại khi gửi email đặt lại mật khẩu');
                            }

        return { success: true, message: 'Mật khẩu tạm thời đã được gửi đến email của bạn' };

    }
}
