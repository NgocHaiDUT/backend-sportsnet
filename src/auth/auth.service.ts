import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuthService {
    constructor(private readonly PrismaService: PrismaService) {}

    async login(username: string, password: string) {
        
        const user = await this.PrismaService.account.findUnique({
            where: { User_name: username },
        });
    
        if (!user || !(await bcrypt.compare(password, user.Password))) {
        return { success: false, message: 'Invalid username or password' };
        }

        console.log('Login successful for user:', {
            id: user.Id,
            username: user.User_name,
            email: user.Email,
            fullname: user.Fullname
        });
        
        return {
        success: true,
        username: user.User_name,
        message: 'Login successful',
        email: user.Email ?? undefined,
        userid: user.Id ?? undefined,
        fullname: user.Fullname ?? undefined,
        role: user.Role ?? undefined,
        avatar: user.Avatar ?? undefined, 
        story: user.Story ?? undefined,
        phone: user.phone ?? undefined,
        qr_payment: user.QR_Payment ?? undefined,
        firstLogin: user.FirstLogin ?? undefined,
        };
    }
    async register(username: string, email: string,role: string, password: string,phone : string): Promise<{ success: boolean; message: string }> {

        const existingUser = await this.PrismaService.account.findFirst({
            where: {
                OR: [{ User_name: username }, { Email: email }],
            },
        });

        if (existingUser) {
        return { success: false, message: 'Username hoặc email đã tồn tại' };
        }
        const newUser = await this.PrismaService.account.create({
            data: {
                User_name: username,
                Password: password,
                Email: email,
                Fullname: username, 
                Role: role, 
                Story: '',
                Avatar: 'uploads/avatars/1757497375801-850801964.jpg', 
                phone: phone,
                QR_Payment: '',
                FirstLogin: true,
            },
        });
        return { success: true, message: 'Đăng ký thành công,mật khâu đã được gửi về email'};
    }
    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        const user = await this.PrismaService.account.findUnique({
            where: { Id: userId },
        });
        if (!user) {
        return { success: false, message: 'Không tìm thấy người dùng' };
        }
        if (!(await bcrypt.compare(oldPassword, user.Password))) {
        return { success: false, message: 'Mật khẩu cũ không đúng' };
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.PrismaService.account.update({
            where: { Id: userId },
            data: { Password: hashedNewPassword, FirstLogin: false },
        });
        return { success: true, message: 'Thay đổi mật khẩu thành công' };
    }
}
