// File: src/data-init/data-init.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DataInitService implements OnModuleInit {
  // Tiêm PrismaService vào
  constructor(private prisma: PrismaService) { }

  // Phương thức onModuleInit() sẽ tự động được NestJS gọi
  // một lần khi module này được khởi tạo (tức là khi app bắt đầu)
  async onModuleInit() {
    console.log('🚀 [DataInitService] Bắt đầu kiểm tra và khởi tạo dữ liệu mẫu...');
    await this.seedAccounts();
    await this.seedPosts();
    await this.seedSportFields();
    console.log('✅ [DataInitService] Khởi tạo dữ liệu hoàn tất.');
  }

  private async seedAccounts() {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Dùng `upsert` để đảm bảo không tạo trùng lặp nếu đã tồn tại
    await this.prisma.account.upsert({
      where: { User_name: 'chusan1' },
      update: {},
      create: {
        Fullname: 'Chủ Sân Một', User_name: 'chusan1', Password: hashedPassword, Role: 'OWNER', Email: 'owner1@sportnet.com', Story: 'Quản lý các sân thể thao hàng đầu.', Avatar: 'https://i.pravatar.cc/150?u=owner1',
      },
    });

    await this.prisma.account.upsert({
      where: { User_name: 'chusan2' },
      update: {},
      create: {
        Fullname: 'Chủ Sân Hai', User_name: 'chusan2', Password: hashedPassword, Role: 'OWNER', Email: 'owner2@sportnet.com', Story: 'Cung cấp trải nghiệm thể thao tuyệt vời.', Avatar: 'https://i.pravatar.cc/150?u=owner2',
      },
    });

    await this.prisma.account.upsert({
        where: { User_name: 'chusan3' },
        update: {},
        create: {
          Fullname: 'Chủ Sân Ba', User_name: 'chusan3', Password: hashedPassword, Role: 'OWNER', Email: 'owner3@sportnet.com', Story: 'Hệ thống sân thể thao hiện đại tại Hà Nội.', Avatar: 'https://i.pravatar.cc/150?u=owner3',
        },
      });
  
      await this.prisma.account.upsert({
        where: { User_name: 'chusan4' },
        update: {},
        create: {
          Fullname: 'Chủ Sân Bốn', User_name: 'chusan4', Password: hashedPassword, Role: 'OWNER', Email: 'owner4@sportnet.com', Story: 'Đem thể thao đến gần hơn với người dân thủ đô.', Avatar: 'https://i.pravatar.cc/150?u=owner4',
        },
      });

      await this.prisma.account.upsert({ where: { User_name: 'chusan5' }, update: {}, create: { Fullname: 'Chủ Sân Năm', User_name: 'chusan5', Password: hashedPassword, Role: 'OWNER', Email: 'owner5@sportnet.com', Story: 'Quản lý chuỗi sân thể thao khu vực phía Nam.', Avatar: 'https://i.pravatar.cc/150?u=owner5' } });
    await this.prisma.account.upsert({ where: { User_name: 'chusan6' }, update: {}, create: { Fullname: 'Chủ Sân Sáu', User_name: 'chusan6', Password: hashedPassword, Role: 'OWNER', Email: 'owner6@sportnet.com', Story: 'Cung cấp sân chất lượng cao tại TP.HCM.', Avatar: 'https://i.pravatar.cc/150?u=owner6' } });

    await this.prisma.account.upsert({
      where: { User_name: 'cr7' },
      update: {},
      create: {
        Fullname: 'Cristiano Ronaldo', User_name: 'cr7', Password: hashedPassword, Role: 'user', Email: 'cr7@gmail.com', Story: 'The goat.', Avatar: '/uploads/avatars/ronaldo.jpg',
      },
    });

    await this.prisma.account.upsert({
      where: { User_name: 'neymar' },
      update: {},
      create: {
        Fullname: 'Neymar Jr.', User_name: 'neymar', Password: hashedPassword, Role: 'user', Email: 'neymar@gmail.com', Story: 'The magician.', Avatar: '/uploads/avatars/neymar.jpg',
      },
    });

    await this.prisma.account.upsert({
      where: { User_name: 'pogba' },
      update: {},
      create: {
        Fullname: 'Paul Pogba', User_name: 'pogba', Password: hashedPassword, Role: 'user', Email: 'pogba@gmail.com', Story: 'The midfield maestro.', Avatar: '/uploads/avatars/pogba.jpg',
      },
    });

  }

  private async seedSportFields() {
    // Lấy lại thông tin của các chủ sân vừa tạo
    const owner1 = await this.prisma.account.findUnique({ where: { User_name: 'chusan1' } });
    const owner2 = await this.prisma.account.findUnique({ where: { User_name: 'chusan2' } });
    const owner3 = await this.prisma.account.findUnique({ where: { User_name: 'chusan3' } });
    const owner4 = await this.prisma.account.findUnique({ where: { User_name: 'chusan4' } });
    const owner5 = await this.prisma.account.findUnique({ where: { User_name: 'chusan5' } });
    const owner6 = await this.prisma.account.findUnique({ where: { User_name: 'chusan6' } });

    if (!owner1 || !owner2 || !owner3 || !owner4 || !owner5 || !owner6) {
      console.error('Không tìm thấy tài khoản chủ sân để gieo dữ liệu sân.');
      return;
    }

    const sportFieldsData = [
        // ======================== QUẬN HẢI CHÂU (3 Sân/Môn) ========================
        // --- Pickleball ---
        { id: 1, ownerId: owner1.Id, name: 'Sân Pickleball Tuyên Sơn', address: 'Nại Nam, Hòa Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 150000 }, { name: 'Sân 2', weekdayPrice: 100000, weekendPrice: 150000 }] },
        { id: 2, ownerId: owner1.Id, name: 'Fit Fun Pickleball', address: '86 Duy Tân, Hòa Thuận Nam', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 140000, weekendPrice: 200000 }] },
        { id: 3, ownerId: owner2.Id, name: 'Trung tâm TDTT QP 3 Pickleball Club', address: '98 Tiểu La, Hòa Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 180000 }, { name: 'Sân 2', weekdayPrice: 120000, weekendPrice: 180000 }] },
        // --- Bóng đá ---
        { id: 4, ownerId: owner1.Id, name: 'Sân bóng đá Chuyên Việt', address: '98 Tiểu La, Hòa Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 300000, weekendPrice: 500000 }] },
        { id: 5, ownerId: owner2.Id, name: 'Sân bóng đá Lê Sát', address: '103 Lê Sát, Hoà Cường Nam', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 280000, weekendPrice: 450000 }, { name: 'Sân B', weekdayPrice: 280000, weekendPrice: 450000 }] },
        { id: 6, ownerId: owner1.Id, name: 'Sân bóng Đức Nam', address: '146 Duy Tân, Hòa Thuận Tây', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1526233139288-53c5c510c5a2?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7A', weekdayPrice: 350000, weekendPrice: 550000 }] },
        // --- Cầu lông ---
        { id: 7, ownerId: owner2.Id, name: 'Sân cầu lông Quân Khu 5', address: '07 Duy Tân, Hoà Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 60000, weekendPrice: 80000 }, { name: 'Sân 2', weekdayPrice: 60000, weekendPrice: 80000 }] },
        { id: 8, ownerId: owner1.Id, name: 'Sân cầu lông BetaEra', address: '273-275 Nguyễn Tri Phương, Hòa Thuận Đông', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 5', weekdayPrice: 70000, weekendPrice: 90000 }, { name: 'Sân 6', weekdayPrice: 70000, weekendPrice: 90000 }] },
        { id: 9, ownerId: owner2.Id, name: 'Sân cầu lông Cung Thiếu Nhi', address: '2a Phan Đăng Lưu, Hòa Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1560007236-39a8afd14d3a?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân Giao Lưu', weekdayPrice: 65000, weekendPrice: 85000 }] },
        // --- Tennis ---
        { id: 10, ownerId: owner1.Id, name: 'Sân tennis Tuyên Sơn', address: 'Đường Vũ Duy Thanh, Hoà Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 200000, weekendPrice: 300000 }] },
        { id: 11, ownerId: owner2.Id, name: 'Cụm sân tennis Làng Thể thao Tuyên Sơn', address: 'Hòa Cường Bắc', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 3', weekdayPrice: 220000, weekendPrice: 320000 }, { name: 'Sân 4', weekdayPrice: 220000, weekendPrice: 320000 }] },
        { id: 12, ownerId: owner1.Id, name: 'Sân tennis Công an thành phố', address: 'Nại Hiên Đông', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 180000, weekendPrice: 280000 }] },

        // ======================== QUẬN THANH KHÊ (3 Sân/Môn) ========================
        // --- Pickleball ---
        { id: 13, ownerId: owner2.Id, name: 'Sân Pickleball Cosevco', address: '05-07-09 Hà Đông 1, Xuân Hà', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 130000, weekendPrice: 170000 }] },
        { id: 14, ownerId: owner1.Id, name: 'KEN PICKLEBALL', address: 'Đoàn Văn Công, Hòa Khê', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 120000, weekendPrice: 160000 }, { name: 'Sân B', weekdayPrice: 120000, weekendPrice: 160000 }] },
        { id: 15, ownerId: owner2.Id, name: 'Pickleball Vĩnh Trung', address: 'Vĩnh Trung', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 110000, weekendPrice: 150000 }] },
        // --- Bóng đá ---
        { id: 16, ownerId: owner1.Id, name: 'Sân bóng đá Duy Tân', address: 'Hòa Thuận Tây', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7', weekdayPrice: 320000, weekendPrice: 520000 }] },
        { id: 17, ownerId: owner2.Id, name: 'Sân bóng đá Thảo Vân', address: 'Thanh Khê Đông', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân Cỏ Nhân Tạo', weekdayPrice: 300000, weekendPrice: 500000 }] },
        { id: 18, ownerId: owner1.Id, name: 'Sân bóng đá FPT', address: 'An Khê', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1526233139288-53c5c510c5a2?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân FPT 1', weekdayPrice: 280000, weekendPrice: 480000 }] },
        // --- Cầu lông ---
        { id: 19, ownerId: owner2.Id, name: 'Sân Cầu Lông Trọng Nghĩa', address: '107 Trường Chinh, An Khê', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 60000, weekendPrice: 80000 }, { name: 'Sân 2', weekdayPrice: 60000, weekendPrice: 80000 }] },
        { id: 20, ownerId: owner1.Id, name: 'Sân cầu lông Kỳ Đồng', address: '359Q+VCQ, phường Hòa Khê', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 50000, weekendPrice: 70000 }, { name: 'Sân B', weekdayPrice: 50000, weekendPrice: 70000 }] },
        { id: 21, ownerId: owner2.Id, name: 'Sân cầu lông Tin sport', address: 'Hòa Khê', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1560007236-39a8afd14d3a?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 3', weekdayPrice: 65000, weekendPrice: 85000 }] },
        // --- Tennis ---
        { id: 22, ownerId: owner1.Id, name: 'Sân tennis Ga Đà Nẵng', address: 'Thanh Khê', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân Giao thông 5', weekdayPrice: 180000, weekendPrice: 250000 }] },
        { id: 23, ownerId: owner2.Id, name: 'Sân tennis Thanh Khê', address: 'Xuân Hà', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 170000, weekendPrice: 240000 }] },
        { id: 24, ownerId: owner1.Id, name: 'Sân Tennis Bưu Điện', address: 'Thanh Khê Đông', city: 'Đà Nẵng', district: 'Thanh Khê', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 190000, weekendPrice: 260000 }] },

        // ======================== QUẬN SƠN TRÀ (2 Sân/Môn) ========================
        // --- Pickleball ---
        { id: 25, ownerId: owner1.Id, name: 'Sân Pickleball Mitsuba', address: '451 Ngô Quyền, An Hải Bắc', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 180000 }] },
        { id: 26, ownerId: owner2.Id, name: 'CLB Pickleball Sơn Trà', address: 'Phước Mỹ', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 130000, weekendPrice: 190000 }] },
        // --- Bóng đá ---
        { id: 27, ownerId: owner1.Id, name: 'Sân bóng đá Harmony', address: 'Lô A5 đường Phạm Văn Đồng, An Hải Bắc', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 300000, weekendPrice: 800000 }] },
        { id: 28, ownerId: owner2.Id, name: 'Sân bóng đá mini Làng cá Nại Hiên Đông', address: 'Nại Hiên Đông', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 5', weekdayPrice: 200000, weekendPrice: 350000 }] },
        // --- Cầu lông ---
        { id: 29, ownerId: owner1.Id, name: 'Trung tâm TDTT Sơn Trà', address: '34 Hồ Nghinh, Phước Mỹ', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 50000, weekendPrice: 60000 }, { name: 'Sân 2', weekdayPrice: 50000, weekendPrice: 60000 }] },
        { id: 30, ownerId: owner2.Id, name: 'Sân cầu lông An Đồn', address: 'An Hải Bắc', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 3', weekdayPrice: 60000, weekendPrice: 70000 }] },
        // --- Tennis ---
        { id: 31, ownerId: owner1.Id, name: 'Sân tennis quần vợt Sơn Trà', address: 'Thọ Quang', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 300000 }] },
        { id: 32, ownerId: owner2.Id, name: 'Sân tennis khách sạn Fusion Suites', address: 'Võ Nguyên Giáp, Phước Mỹ', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân thượng', weekdayPrice: 250000, weekendPrice: 350000 }] },

        // ======================== QUẬN NGŨ HÀNH SƠN (2 Sân/Môn) ========================
        // --- Pickleball ---
        { id: 33, ownerId: owner1.Id, name: 'Nana Pickleball', address: '01 Phan Tứ, Bắc Mỹ An', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 150000 }, { name: 'Sân 2', weekdayPrice: 120000, weekendPrice: 150000 }] },
        { id: 34, ownerId: owner2.Id, name: 'Sân Pickleball Furama Resort', address: '103 - 105 Võ Nguyên Giáp, Khuê Mỹ', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân resort', weekdayPrice: 180000, weekendPrice: 250000 }] },
        // --- Bóng đá ---
        { id: 35, ownerId: owner1.Id, name: 'Sân bóng đá Mini Làng Đại học', address: 'Hòa Quý', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 250000, weekendPrice: 400000 }] },
        { id: 36, ownerId: owner2.Id, name: 'Sân bóng đá Văn Hiến', address: 'Hòa Hải', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 280000, weekendPrice: 420000 }] },
        // --- Cầu lông ---
        { id: 37, ownerId: owner1.Id, name: 'Sân cầu lông Mỹ An', address: '382 Ngũ Hành Sơn, phường Mỹ An', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 70000, weekendPrice: 90000 }] },
        { id: 38, ownerId: owner2.Id, name: 'Sân cầu lông Indexsport 2', address: '81C Lê Văn Hiến, Khuê Mỹ', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 70000, weekendPrice: 90000 }] },
        // --- Tennis ---
        { id: 39, ownerId: owner1.Id, name: 'Cụm sân tennis Ariyana', address: '107 Võ Nguyên Giáp, Khuê Mỹ', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 250000, weekendPrice: 400000 }] },
        { id: 40, ownerId: owner2.Id, name: 'Sân tennis Nam Việt Á', address: 'Hòa Quý', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 300000 }] },

        // ======================== QUẬN LIÊN CHIỂU (2 Sân/Môn) ========================
        // --- Pickleball ---
        { id: 41, ownerId: owner1.Id, name: 'Nguyên Phát Pickleball', address: 'Hòa Minh', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 150000 }] },
        { id: 42, ownerId: owner2.Id, name: 'CLB Pickleball Bách Khoa', address: 'Hòa Khánh Bắc', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân Sinh viên', weekdayPrice: 90000, weekendPrice: 140000 }] },
        // --- Bóng đá ---
        { id: 43, ownerId: owner1.Id, name: 'Sân bóng đá Ngọc Thạch', address: 'Phường Hòa Khánh Nam', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 250000, weekendPrice: 400000 }] },
        { id: 44, ownerId: owner2.Id, name: 'Sân bóng đá mini Hòa Khánh', address: 'Hòa Khánh Bắc', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 240000, weekendPrice: 380000 }] },
        // --- Cầu lông ---
        { id: 45, ownerId: owner1.Id, name: 'Sân cầu lông Win Win', address: '642 Tôn Đức Thắng, Hoà Khánh Nam', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 60000, weekendPrice: 80000 }] },
        { id: 46, ownerId: owner2.Id, name: 'Sân cầu lông Liên Chiểu', address: 'Hòa Minh', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 65000, weekendPrice: 85000 }] },
        // --- Tennis ---
        { id: 47, ownerId: owner1.Id, name: 'Sân tennis Trung tâm TDTT Liên Chiểu', address: 'Hòa Minh', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 160000, weekendPrice: 220000 }] },
        { id: 48, ownerId: owner2.Id, name: 'Sân tennis Nam Ô', address: 'Hòa Hiệp Nam', city: 'Đà Nẵng', district: 'Liên Chiểu', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 150000, weekendPrice: 210000 }] },

        // ======================== QUẬN CẨM LỆ (2 Sân/Môn) ========================
        // --- Pickleball ---
        { id: 49, ownerId: owner1.Id, name: 'CLB Pickleball Hòa Xuân', address: 'Hòa Xuân', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 140000 }] },
        { id: 50, ownerId: owner2.Id, name: 'Sân Pickleball Cẩm Lệ Center', address: 'Hòa Thọ Đông', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 110000, weekendPrice: 150000 }] },
        // --- Bóng đá ---
        { id: 51, ownerId: owner1.Id, name: 'Sân bóng đá Hòa Xuân', address: 'Hòa Xuân', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 11 người', weekdayPrice: 800000, weekendPrice: 1200000 }] },
        { id: 52, ownerId: owner2.Id, name: 'Sân bóng đá mini Cẩm Lệ', address: 'Khuê Trung', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân C', weekdayPrice: 260000, weekendPrice: 400000 }] },
        // --- Cầu lông ---
        { id: 53, ownerId: owner1.Id, name: 'Sân cầu lông Hiếu Con', address: '172 Đỗ Quỳ, Phường Hòa Xuân', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 60000, weekendPrice: 80000 }] },
        { id: 54, ownerId: owner2.Id, name: 'Sân Cầu lông Phúc Đăng', address: '39 Thanh Lương 19, Phường Hòa Xuân', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 70000, weekendPrice: 90000 }] },
        // --- Tennis ---
        { id: 55, ownerId: owner1.Id, name: 'Sân tennis Hòa An', address: 'Đường Nguyễn Công Hoan, phường Hòa An', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 250000 }] },
        { id: 56, ownerId: owner2.Id, name: 'Cụm sân tennis Cẩm Lệ', address: 'Hòa Thọ Đông', city: 'Đà Nẵng', district: 'Cẩm Lệ', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 160000, weekendPrice: 260000 }] },
        { id: 57, ownerId: owner3.Id, name: 'VSA Pickleball Cầu Giấy', address: 'Trần Quý Kiên, Dịch Vọng Hậu', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 150000, weekendPrice: 220000 }] },
        { id: 58, ownerId: owner4.Id, name: 'Pickleball Club Nghĩa Tân', address: 'Khu đô thị Nghĩa Tân', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 140000, weekendPrice: 200000 }] },
        // --- Bóng đá ---
        { id: 59, ownerId: owner3.Id, name: 'Sân bóng đá Thành Đồng', address: 'Khu đô thị Dịch Vọng', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7A', weekdayPrice: 500000, weekendPrice: 850000 }] },
        { id: 60, ownerId: owner4.Id, name: 'Sân bóng An Khánh', address: 'Ngõ 217 Trần Cung, Cổ Nhuế 1', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7B', weekdayPrice: 450000, weekendPrice: 800000 }] },
        { id: 61, ownerId: owner3.Id, name: 'Sân bóng đá Học viện Báo chí', address: '36 Xuân Thủy, Dịch Vọng Hậu', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1526233139288-53c5c510c5a2?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 11', weekdayPrice: 1000000, weekendPrice: 1500000 }] },
        // --- Cầu lông ---
        { id: 62, ownerId: owner4.Id, name: 'Sân cầu lông Cầu Giấy', address: 'Số 35 Trần Quý Kiên', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 80000, weekendPrice: 120000 }] },
        { id: 63, ownerId: owner3.Id, name: 'Sân cầu lông Thành Thái', address: 'Ngõ 103, Dịch Vọng Hậu', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 90000, weekendPrice: 130000 }, { name: 'Sân 3', weekdayPrice: 90000, weekendPrice: 130000 }] },
        // --- Tennis ---
        { id: 64, ownerId: owner4.Id, name: 'Sân tennis Nghĩa Tân', address: '128a Hoàng Quốc Việt, Nghĩa Tân', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 300000, weekendPrice: 500000 }] },
        { id: 65, ownerId: owner3.Id, name: 'Sân tennis trong nhà - Mỹ Đình', address: 'Khu Liên Hợp Thể Thao Quốc Gia', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân trong nhà', weekdayPrice: 600000, weekendPrice: 900000 }] },

        // ======================== QUẬN BA ĐÌNH ========================
        // --- Pickleball ---
        { id: 66, ownerId: owner4.Id, name: 'Ba Dinh Pickleball Court', address: 'Đường ven hồ Ba Mẫu', city: 'Hà Nội', district: 'Ba Đình', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 160000, weekendPrice: 230000 }] },
        { id: 67, ownerId: owner3.Id, name: 'Capital Pickleball', address: 'Gần công viên Thủ Lệ', city: 'Hà Nội', district: 'Ba Đình', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 210000 }] },
        // --- Bóng đá ---
        { id: 68, ownerId: owner4.Id, name: 'Sân bóng Vạn Phúc', address: 'Số 7, ngõ 1 Vạn Phúc', city: 'Hà Nội', district: 'Ba Đình', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7', weekdayPrice: 550000, weekendPrice: 900000 }] },
        { id: 69, ownerId: owner3.Id, name: 'Sân bóng Quần Ngựa', address: 'Văn Cao, Liễu Giai', city: 'Hà Nội', district: 'Ba Đình', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 600000, weekendPrice: 1000000 }] },
        // --- Cầu lông ---
        { id: 70, ownerId: owner4.Id, name: 'Sân cầu lông Ba Đình', address: '115 Quán Thánh', city: 'Hà Nội', district: 'Ba Đình', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 4', weekdayPrice: 100000, weekendPrice: 140000 }] },
        { id: 71, ownerId: owner3.Id, name: 'CLB Cầu lông Phan Đình Phùng', address: '7 Hàng Bún, Nguyễn Trung Trực', city: 'Hà Nội', district: 'Ba Đình', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 5', weekdayPrice: 110000, weekendPrice: 150000 }] },
        // --- Tennis ---
        { id: 72, ownerId: owner4.Id, name: 'Sân tennis Hoàng Diệu', address: '19C Hoàng Diệu', city: 'Hà Nội', district: 'Ba Đình', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 350000, weekendPrice: 550000 }] },
        { id: 73, ownerId: owner3.Id, name: 'Sân tennis Khách sạn La Thành', address: '226 Vạn Phúc', city: 'Hà Nội', district: 'Ba Đình', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 320000, weekendPrice: 520000 }] },

        // ======================== QUẬN HAI BÀ TRƯNG ========================
        // --- Pickleball ---
        { id: 74, ownerId: owner3.Id, name: 'Hai Ba Trung Pickleball', address: 'Công viên Thống Nhất', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 200000 }] },
        { id: 75, ownerId: owner4.Id, name: 'Times City Pickleball Club', address: 'Khu đô thị Times City', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 170000, weekendPrice: 240000 }] },
        // --- Bóng đá ---
        { id: 76, ownerId: owner3.Id, name: 'Sân bóng Bách Khoa', address: '40 Tạ Quang Bửu', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 11', weekdayPrice: 1200000, weekendPrice: 1800000 }] },
        { id: 77, ownerId: owner4.Id, name: 'Sân bóng mini Thủy Lợi', address: 'Ngõ 95 Chùa Bộc', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7A', weekdayPrice: 500000, weekendPrice: 800000 }] },
        // --- Cầu lông ---
        { id: 78, ownerId: owner3.Id, name: 'Sân Cầu Lông Bách Khoa', address: 'Ngõ 17 Tạ Quang Bửu', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 180000 }, { name: 'Sân 2', weekdayPrice: 120000, weekendPrice: 180000 }] },
        { id: 79, ownerId: owner4.Id, name: 'Sân Cầu Lông Ký Túc Xá Kinh Tế', address: 'Trần Đại Nghĩa', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân KTQD', weekdayPrice: 100000, weekendPrice: 150000 }] },
        // --- Tennis ---
        { id: 80, ownerId: owner3.Id, name: 'Sân Tennis Bách Khoa', address: 'Trong ĐH Bách Khoa', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 3', weekdayPrice: 300000, weekendPrice: 500000 }] },
        { id: 81, ownerId: owner4.Id, name: 'Sân Tennis Công viên Thống Nhất', address: 'Đại Cồ Việt', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 280000, weekendPrice: 480000 }] },
             // ======================== TP. THỦ ĐỨC ========================
        { id: 82, ownerId: owner5.Id, name: 'CLB Pickleball Thủ Đức', address: '200 Võ Văn Ngân, Bình Thọ', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
        { id: 83, ownerId: owner6.Id, name: 'Sân Pickleball Vòng Xoay', address: 'Đường Kha Vạn Cân', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 160000, weekendPrice: 230000 }] },
        { id: 84, ownerId: owner5.Id, name: 'Sân bóng đá mini ĐH Nông Lâm', address: 'Linh Trung', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7A', weekdayPrice: 400000, weekendPrice: 650000 }] },
        { id: 85, ownerId: owner6.Id, name: 'Sân bóng đá Rạch Chiếc', address: 'Đường Song Hành, An Phú', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7B', weekdayPrice: 450000, weekendPrice: 700000 }] },
        { id: 86, ownerId: owner5.Id, name: 'Sân bóng Kha Vạn Cân', address: 'Kha Vạn Cân, Linh Đông', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1526233139288-53c5c510c5a2?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 5', weekdayPrice: 300000, weekendPrice: 450000 }] },
        { id: 87, ownerId: owner6.Id, name: 'Sân cầu lông Làng Đại Học', address: 'Thủ Đức', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 80000, weekendPrice: 110000 }] },
        { id: 88, ownerId: owner5.Id, name: 'Sân cầu lông Nguyễn Xiển', address: 'Nguyễn Xiển, Long Thạnh Mỹ', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 75000, weekendPrice: 105000 }] },
        { id: 89, ownerId: owner6.Id, name: 'Sân Tennis Thủ Đức', address: 'Bình Thọ', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 300000, weekendPrice: 450000 }] },
        { id: 90, ownerId: owner5.Id, name: 'CLB Tennis Thảo Điền', address: 'Thảo Điền', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 350000, weekendPrice: 500000 }] },

        // ======================== QUẬN 1 ========================
        { id: 91, ownerId: owner5.Id, name: 'Tao Đàn Pickleball', address: 'Nguyễn Thị Minh Khai', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân Giao Lưu', weekdayPrice: 200000, weekendPrice: 300000 }] },
        { id: 92, ownerId: owner6.Id, name: 'Sân Pickleball Premium Quận 1', address: 'Phạm Ngũ Lão', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 220000, weekendPrice: 330000 }] },
        { id: 93, ownerId: owner5.Id, name: 'Sân bóng đá Tao Đàn', address: 'Huyền Trân Công Chúa', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân Mini A', weekdayPrice: 600000, weekendPrice: 1000000 }] },
        { id: 94, ownerId: owner6.Id, name: 'Sân bóng đá ĐH KHTN', address: 'Nguyễn Văn Cừ', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân Trường', weekdayPrice: 550000, weekendPrice: 950000 }] },
        { id: 95, ownerId: owner5.Id, name: 'Sân Cầu lông Nguyễn Du', address: 'Nguyễn Du', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 160000 }] },
        { id: 96, ownerId: owner6.Id, name: 'Sân Cầu lông Lương Định Của', address: 'Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân C', weekdayPrice: 130000, weekendPrice: 170000 }] },
        { id: 97, ownerId: owner5.Id, name: 'CLB Tennis Tao Đàn', address: 'Huyền Trân Công Chúa', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 400000, weekendPrice: 600000 }] },
        { id: 98, ownerId: owner6.Id, name: 'Sân Tennis Dinh Thống Nhất', address: 'Nam Kỳ Khởi Nghĩa', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 450000, weekendPrice: 650000 }] },

        // ======================== QUẬN BÌNH THẠNH ========================
        { id: 99, ownerId: owner5.Id, name: 'Pickleball Thanh Đa', address: 'Bình Quới, Thanh Đa', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 150000, weekendPrice: 200000 }] },
        { id: 100, ownerId: owner6.Id, name: 'CLB Pickleball Gia Định', address: 'Công viên Gia Định', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 160000, weekendPrice: 210000 }] },
        { id: 101, ownerId: owner5.Id, name: 'Sân bóng đá Chuyên Việt', address: '220/66 Xô Viết Nghệ Tĩnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 450000, weekendPrice: 700000 }] },
        { id: 102, ownerId: owner6.Id, name: 'Sân bóng đá mini Thanh Đa', address: 'Đường Thanh Đa', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 400000, weekendPrice: 650000 }] },
        { id: 103, ownerId: owner5.Id, name: 'Sân cầu lông Bình Thạnh', address: 'Phường 25', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 3', weekdayPrice: 85000, weekendPrice: 120000 }] },
        { id: 104, ownerId: owner6.Id, name: 'CLB Cầu lông Phan Chu Trinh', address: 'Phan Chu Trinh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 4', weekdayPrice: 90000, weekendPrice: 125000 }] },
        { id: 105, ownerId: owner5.Id, name: 'CLB Tennis Thanh Đa', address: 'Thanh Đa', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 300000, weekendPrice: 480000 }] },
        { id: 106, ownerId: owner6.Id, name: 'Sân tennis Văn Thánh', address: 'Điện Biên Phủ', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 320000, weekendPrice: 500000 }] },

        // ======================== QUẬN 7 ========================
        { id: 107, ownerId: owner5.Id, name: 'Phu My Hung Pickleball', address: 'Khu đô thị Phú Mỹ Hưng', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 180000, weekendPrice: 250000 }] },
        { id: 108, ownerId: owner6.Id, name: 'CLB Pickleball Quận 7', address: 'Nguyễn Thị Thập', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 170000, weekendPrice: 240000 }] },
        { id: 109, ownerId: owner5.Id, name: 'Sân bóng đá mini Phú Mỹ Hưng', address: 'Tân Phong', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }] },
        { id: 110, ownerId: owner6.Id, name: 'Sân bóng đá Quận 7', address: 'Huỳnh Tấn Phát, Tân Thuận Đông', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 480000, weekendPrice: 750000 }] },
        { id: 111, ownerId: owner5.Id, name: 'Nhà thi đấu Đa Năng Quận 7', address: '504-506 Huỳnh Tấn Phát', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 140000 }] },
        { id: 112, ownerId: owner6.Id, name: 'Sân cầu lông Sky Garden', address: 'Phú Mỹ Hưng', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 110000, weekendPrice: 150000 }] },
        { id: 113, ownerId: owner5.Id, name: 'CLB Quần Vợt Phú Mỹ Hưng', address: 'Tân Phú', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 380000, weekendPrice: 550000 }] },
        { id: 114, ownerId: owner6.Id, name: 'Sân tennis Nam Sài Gòn', address: 'Nguyễn Hữu Thọ', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 350000, weekendPrice: 520000 }] },

        // ======================== QUẬN TÂN BÌNH ========================
        { id: 115, ownerId: owner5.Id, name: 'CLB Pickleball Tân Bình', address: 'Hoàng Văn Thụ', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 160000, weekendPrice: 220000 }] },
        { id: 116, ownerId: owner6.Id, name: 'Sân Pickleball K300', address: 'Khu K300, Phường 12', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 150000, weekendPrice: 210000 }] },
        { id: 117, ownerId: owner5.Id, name: 'Sân bóng đá K34', address: 'Cộng Hòa, Phường 13', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7', weekdayPrice: 450000, weekendPrice: 700000 }] },
        { id: 118, ownerId: owner6.Id, name: 'Sân bóng đá Trung tâm TDTT Tân Bình', address: 'Xuân Hồng', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân C', weekdayPrice: 500000, weekendPrice: 750000 }] },
        { id: 119, ownerId: owner5.Id, name: 'Nhà thi đấu Tân Bình', address: '448 Hoàng Văn Thụ', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 110000, weekendPrice: 150000 }] },
        { id: 120, ownerId: owner6.Id, name: 'Sân cầu lông K334', address: 'Hoàng Hoa Thám', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 100000, weekendPrice: 140000 }] },
        { id: 121, ownerId: owner5.Id, name: 'CLB Tennis Hàng không', address: 'A75/6B/11 Bạch Đằng', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 350000, weekendPrice: 550000 }] },
        { id: 122, ownerId: owner6.Id, name: 'Sân tennis Hoàng Văn Thụ', address: 'Công viên Hoàng Văn Thụ', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 330000, weekendPrice: 530000 }] },

        // ======================== QUẬN 10 ========================
        { id: 123, ownerId: owner5.Id, name: 'Pickleball Phú Thọ', address: 'Lý Thường Kiệt', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 170000, weekendPrice: 230000 }] },
        { id: 124, ownerId: owner6.Id, name: 'CLB Pickleball Quận 10', address: 'Thành Thái', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 160000, weekendPrice: 220000 }] },
        { id: 125, ownerId: owner5.Id, name: 'Sân bóng đá mini Phú Thọ', address: 'Nhà thi đấu Phú Thọ', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7', weekdayPrice: 550000, weekendPrice: 850000 }] },
        { id: 126, ownerId: owner6.Id, name: 'Sân bóng đá Kỳ Hòa', address: 'Sư Vạn Hạnh', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 5', weekdayPrice: 450000, weekendPrice: 700000 }] },
        { id: 127, ownerId: owner5.Id, name: 'Nhà thi đấu Phú Thọ', address: '219 Lý Thường Kiệt', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 130000, weekendPrice: 180000 }] },
        { id: 128, ownerId: owner6.Id, name: 'Sân cầu lông Tám ri', address: '367 Sư Vạn Hạnh', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 120000, weekendPrice: 170000 }] },
        { id: 129, ownerId: owner5.Id, name: 'CLB Quần vợt Phú Thọ', address: 'Lý Thường Kiệt', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 380000, weekendPrice: 580000 }] },
        { id: 130, ownerId: owner6.Id, name: 'Sân tennis Kỳ Hòa', address: 'Sư Vạn Hạnh', city: 'TP. Hồ Chí Minh', district: 'Quận 10', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 350000, weekendPrice: 550000 }] },

        // ======================== QUẬN GÒ VẤP ========================
        { id: 131, ownerId: owner5.Id, name: 'CLB Pickleball Gò Vấp', address: 'Phan Văn Trị', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1621051122233-2a813e314545?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 140000, weekendPrice: 190000 }] },
        { id: 132, ownerId: owner6.Id, name: 'Gia Dinh Park Pickleball', address: 'Công viên Gia Định', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 200000 }] },
        { id: 133, ownerId: owner5.Id, name: 'Sân bóng đá Country House', address: 'Phan Văn Trị', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7', weekdayPrice: 400000, weekendPrice: 600000 }] },
        { id: 134, ownerId: owner6.Id, name: 'Sân bóng đá Đạt Đức', address: 'Nguyễn Văn Lượng', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 420000, weekendPrice: 620000 }] },
        { id: 135, ownerId: owner5.Id, name: 'Sân cầu lông An Hội', address: 'Phạm Văn Chiêu', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 80000, weekendPrice: 110000 }] },
        { id: 136, ownerId: owner6.Id, name: 'CLB Cầu lông BAV', address: 'Thống Nhất', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 2', weekdayPrice: 85000, weekendPrice: 115000 }] },
        { id: 137, ownerId: owner5.Id, name: 'Sân tennis Khang An', address: 'Phan Huy Ích', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 280000, weekendPrice: 450000 }] },
        { id: 138, ownerId: owner6.Id, name: 'CLB tennis Gò Vấp', address: 'Nguyễn Oanh', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d_f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân B', weekdayPrice: 290000, weekendPrice: 460000 }] },
    ];


    // Non-destructive seeding: do not delete existing courts to avoid FK violations
    for (const sf of sportFieldsData) {
      // 1) Upsert SportField itself (without nested court mutations)
      const field = await this.prisma.sportField.upsert({
        where: { id: sf.id },
        update: {
          name: sf.name,
          address: sf.address,
          city: sf.city,
          district: sf.district,
          sport: sf.sport,
          ownerId: sf.ownerId,
        },
        create: {
          id: sf.id,
          name: sf.name,
          address: sf.address,
          city: sf.city,
          district: sf.district,
          sport: sf.sport,
          ownerId: sf.ownerId,
        },
      });

      // 2) Upsert courts one-by-one by (sportFieldId, name)
      for (const c of sf.courts) {
        const existing = await this.prisma.court.findFirst({
          where: { sportFieldId: field.id, name: c.name },
        });

        if (existing) {
          await this.prisma.court.update({
            where: { id: existing.id },
            data: {
              weekdayPrice: c.weekdayPrice,
              weekendPrice: c.weekendPrice,
            },
          });
        } else {
          await this.prisma.court.create({
            data: {
              sportFieldId: field.id,
              name: c.name,
              weekdayPrice: c.weekdayPrice,
              weekendPrice: c.weekendPrice,
            },
          });
        }
      }
    }
  }

  // <-- Thêm phương thức seed cho posts
  private async seedPosts() {
    const cr7 = await this.prisma.account.findUnique({ where: { User_name: 'cr7' } });
    const neymar = await this.prisma.account.findUnique({ where: { User_name: 'neymar' } });
    const pogba = await this.prisma.account.findUnique({ where: { User_name: 'pogba' } });

    if (!cr7 || !neymar || !pogba) {
      console.error('Không tìm thấy tài khoản để gieo dữ liệu bài đăng.');
      return;
    }

    await this.prisma.post.upsert({
      where: { Id: 3 },
      update: {},
      create: {
        User_id: cr7.Id,
        Type: 'video',
        Time: new Date(),
        Title: 'Trận đấu ngày đó thật tuyệt vời!',
        Mode: 'public',
        Content: '#football #revenge',
        Heart_count: 125,
        Video: '/uploads/videos/Ronaldo’s Revenge.mp4',
      },
    });

    await this.prisma.post.upsert({
      where: { Id: 4 },
      update: {},
      create: {
        User_id: neymar.Id,
        Type: 'video',
        Time: new Date(),
        Title: 'nghệ sĩ sân cỏ',
        Mode: 'public',
        Content: '#football #skills',
        Heart_count: 100,
        Video: '/uploads/videos/Prime Neymar Skills.mp4',
      },
    });

    await this.prisma.post.upsert({
      where: { Id: 5 },
      update: {},
      create: {
        User_id: pogba.Id,
        Type: 'video',
        Time: new Date(),
        Title: 'Tình bạn trên sân cỏ',
        Mode: 'public',
        Content: '#football #love',
        Heart_count: 100,
        Video: '/uploads/videos/Pogba Might Hate Maguire.mp4',
      },
    });
  }
}