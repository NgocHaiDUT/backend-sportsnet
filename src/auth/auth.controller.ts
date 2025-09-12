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
    async register(@Body() registerDto: { username: string; email: string;role:string ;phone : string}) {
        
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            await this.mailerService
                        .sendMail({
                            to: `${registerDto.email}`, 
                            subject: 'Đăng ký tài khoản',
                                text: `Mật khẩu tạm thời của bạn là: ${password}`,  
                                html: `Mật khẩu tạm thời của bạn là: ${password}`, 
                            });
                            } catch (error) {
                            return { success: false, message: 'Email không tồn tại' };
                            }
        if (registerDto.username && registerDto.email  ) {
            return this.authService.register(
                registerDto.username,
                registerDto.email,
                registerDto.role,
                hashedPassword,
                registerDto.phone
            );  
        } else {
            return { success: false, message: 'Thiếu trường dữ liệu' };
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
    @Post('change-password')
    async changePassword(@Body() changePasswordDto: { userId: number; oldPassword: string; newPassword: string }) {
        if (changePasswordDto.userId && changePasswordDto.oldPassword && changePasswordDto.newPassword) {
            return this.authService.changePassword(changePasswordDto.userId, changePasswordDto.oldPassword, changePasswordDto.newPassword);
        } else {
            return { success: false, message: 'Thiếu trường dữ liệu' };
        }
    }

}
