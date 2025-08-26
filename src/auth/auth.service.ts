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
        };
    }
    async register(username: string, email: string,role: string, password: string): Promise<{ success: boolean; message: string }> {

        const existingUser = await this.PrismaService.account.findFirst({
            where: {
                OR: [{ User_name: username }, { Email: email }],
            },
        });

        if (existingUser) {
        return { success: false, message: 'Username or email already exists' };
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.PrismaService.account.create({
            data: {
                User_name: username,
                Password: hashedPassword,
                Email: email,
                Fullname: username, 
                Role: role, 
                Story: '',
                Avatar: '', 
            },
        });
        return { success: true, message: 'User registered successfully'};
    }
    
}
