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
    await this.seedPosts(); // <-- thêm gọi seed cho posts
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
        Fullname: 'Chủ Sân Ba', User_name: 'chusan3', Password: hashedPassword, Role: 'OWNER', Email: 'owner3@sportnet.com', Story: 'Cung cấp trải nghiệm thể thao tuyệt vời.', Avatar: '/uploads/avatars/1756353564614-542770643.jpg',
      },
    });

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

    if (!owner1 || !owner2 || !owner3) {
      console.error('Không tìm thấy tài khoản chủ sân để gieo dữ liệu sân.');
      return;
    }

    const sportFieldsData = [
      // 5 sân của Chủ sân 1
      { id: 1, ownerId: owner1.Id, name: 'Nana Pickleball', address: '01 Phan Tứ, Bắc Mỹ An', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1560007236-39a8afd14d3a?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 150000 }, { name: 'Sân 2', weekdayPrice: 120000, weekendPrice: 150000 }] },
      { id: 2, ownerId: owner1.Id, name: 'Sân bóng đá Mỹ Đình 2', address: '150 Lê Quang Đạo', city: 'Hà Nội', district: 'Cầu Giấy', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1551952237-954a01c67568?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 3, ownerId: owner1.Id, name: 'CLB Tennis Tao Đàn', address: '01 Huyền Trân Công Chúa, Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1559427958-00a469a45695?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân Đất nện 1', weekdayPrice: 250000, weekendPrice: 400000 }] },
      { id: 4, ownerId: owner1.Id, name: 'Sân cầu lông Tuyên Sơn', address: '02 Phan Đăng Lưu, Hải Châu', city: 'Đà Nẵng', district: 'Hải Châu', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 150000 }, { name: 'Sân 2', weekdayPrice: 100000, weekendPrice: 150000 }] },
      { id: 5, ownerId: owner1.Id, name: 'Khu thể thao Celadon City', address: '88 N1, Sơn Kỳ, Tân Phú', city: 'TP. Hồ Chí Minh', district: 'Tân Phú', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1596328492210-3d5f49b1efc8?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân Tennis 1', weekdayPrice: 300000, weekendPrice: 450000 }, { name: 'Sân Tennis 2', weekdayPrice: 300000, weekendPrice: 450000 }] },

      // 5 sân của Chủ sân 2
      { id: 6, ownerId: owner2.Id, name: 'Sân bóng An Dương', address: '12 ngõ 76 An Dương, Ba Đình', city: 'Hà Nội', district: 'Ba Đình', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 400000, weekendPrice: 600000 }] },
      { id: 7, ownerId: owner2.Id, name: 'CLB Pickleball Thủ Đức', address: '200 Võ Văn Ngân, Bình Thọ', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Pickleball', image: 'https://plus.unsplash.com/premium_photo-1681390234898-4c8f5a60aed1?q=80&w=2071&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 8, ownerId: owner2.Id, name: 'Sân cầu lông Bách Khoa', address: '17 Tạ Quang Bửu, Hai Bà Trưng', city: 'Hà Nội', district: 'Hai Bà Trưng', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1594499456244-a9b739626453?q=80&w=1974&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 120000, weekendPrice: 180000 }, { name: 'Sân 2', weekdayPrice: 120000, weekendPrice: 180000 }] },
      { id: 9, ownerId: owner2.Id, name: 'Sân bóng đá Chuyên Việt', address: '220/66 Xô Viết Nghệ Tĩnh, Bình Thạnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1526233139288-53c5c510c5a2?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 450000, weekendPrice: 700000 }] },
      { id: 10, ownerId: owner2.Id, name: 'Sân Tennis Sơn Trà', address: '99 Ngô Quyền, An Hải Bắc', city: 'Đà Nẵng', district: 'Sơn Trà', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },

      // sân của chủ sân 3
      { id: 11, ownerId: owner3.Id, name: 'Court one Club at New World Saigon hotel', address: '76 Lê Lai, Phường Bến Thành, Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1509228627152-3f1b9f1a5f4e?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 12, ownerId: owner3.Id, name: 'Sân banh Tao Đàn', address: 'Huyền Trân Công Chúa, Phường Bến Thành, Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 400000, weekendPrice: 600000 }] },
      { id: 13, ownerId: owner3.Id, name: 'Sân Bóng Đá Nguyễn Du', address: '116 Nguyễn Du, Phường Bến Thành, Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 14, ownerId: owner3.Id, name: 'Sân cầu lông Tao Đàn', address: '01 Huyền Trân Công Chúa, Phường Bến Thành, Quận 1', city: 'TP. Hồ Chí Minh', district: 'Quận 1', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 150000 }, { name: 'Sân 2', weekdayPrice: 100000, weekendPrice: 150000 }] },
      { id: 15, ownerId: owner3.Id, name: 'Sân cầu lông THPT MARIE CURIE', address: '26 Lê Quý Đôn, Phường Võ Thị Sáu, Quận 3', city: 'TP. Hồ Chí Minh', district: 'Quận 3', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1521587524332-9cff536aa66d?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 1', weekdayPrice: 100000, weekendPrice: 150000 }, { name: 'Sân 2', weekdayPrice: 100000, weekendPrice: 150000 }] },
      { id: 16, ownerId: owner3.Id, name: 'Sân Bóng Đá Mini Cỏ Nhân Tạo Trương Quyền', address: 'Số 946 Trường Sa, Phường 12, Quận 3', city: 'TP. Hồ Chí Minh', district: 'Quận 3', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 17, ownerId: owner3.Id, name: 'Pickleball nhà thiếu nhi', address: '36 Lê Quý Đôn, Phường Võ Thị Sáu, Quận 3', city: 'TP. Hồ Chí Minh', district: 'Quận 3', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1509228627152-3f1b9f1a5f4e?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 18, ownerId: owner3.Id, name: 'BUDDY’S CLUB PICKLEBALL', address: '143b Cách Mạng Tháng Tám, Phường 5, Quận 3', city: 'TP. Hồ Chí Minh', district: 'Quận 3', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1509228627152-3f1b9f1a5f4e?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 19, ownerId: owner3.Id, name: 'Sân Tennis Ga Sài Gòn', address: '1 Nguyễn Thông, Phường 6, Quận 3', city: 'TP. Hồ Chí Minh', district: 'Quận 3', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },
      { id: 20, ownerId: owner3.Id, name: 'SÂN TENNIS TẤN TRƯỜNG', address: '96 Đ. Đào Trí, Phú Mỹ, Quận 7', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },
      { id: 21, ownerId: owner3.Id, name: 'Sân Tennis Phú Mỹ Hưng', address: 'Khu đô thị Phú Mỹ Hưng, Quận 7', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },
      { id: 22, ownerId: owner3.Id, name: 'Sân Bóng đá Nguyễn Văn Linh', address: 'PPVF+WC4, Đ. Lý Phục Man, Bình Thuận, Quận 7', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 400000, weekendPrice: 600000 }] },
      { id: 23, ownerId: owner3.Id, name: 'Sân Bóng ARENA Quận 7', address: '1135/45/60D, Huynh Tan Phat, Phú Thuận, Quận 7', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 24, ownerId: owner3.Id, name: 'Sân Cầu Lông D’Ni Sports', address: '85 Nguyễn Văn Quỳ, Tân Thuận Đông, Quận 7', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 25, ownerId: owner3.Id, name: 'Sân pickleball ERAPICK', address: '78/1 Phạm Hữu Lầu, Phú Mỹ, Quận 7', city: 'TP. Hồ Chí Minh', district: 'Quận 7', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1509228627152-3f1b9f1a5f4e?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 26, ownerId: owner3.Id, name: 'Sân Bóng Đá An Phú Arena', address: 'RR65+QXM, 306 Võ Văn Hát, Long Trường, Thủ Đức', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân 7 người', weekdayPrice: 400000, weekendPrice: 600000 }] },
      { id: 27, ownerId: owner3.Id, name: 'Sân đá banh Toàn Thắng', address: 'Đường 40, Hiệp Bình Chánh, Thủ Đức', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Bóng đá', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 28, ownerId: owner3.Id, name: 'Sân Cầu Lông Sói Badminton', address: '315 Đ. Liên Phường, Phường Phú Hữu, Thủ Đức', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 29, ownerId: owner3.Id, name: 'SÂN CẦU LÔNG LÊ ĐỨC SPORT', address: '306 Võ Văn Hát, Long Trường, Thủ Đức', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },
      { id: 30, ownerId: owner3.Id, name: 'Sân Tennis Lê Gia', address: '26 Đường Số 22, Linh Đông, Thủ Đức', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },
      { id: 31, ownerId: owner3.Id, name: 'Sân Tennis Tư Hồng', address: '618/5A, Xô Viết nghệ Tĩnh, Quận Bình Thạnh, Phường 26, Bình Thạnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },
      { id: 32, ownerId: owner3.Id, name: 'Sân tennis Nhật Nguyệt', address: '149/4 Bình Quới, Phường 27, Bình Thạnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Tennis', image: 'https://images.unsplash.com/photo-1574287482996-03c081e59b62?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 200000, weekendPrice: 350000 }, { name: 'Sân B', weekdayPrice: 200000, weekendPrice: 350000 }] },
      { id: 33, ownerId: owner3.Id, name: 'Sân Thanh Đa Pickleball', address: '186/3 Bình Quới, Phường 27, Bình Thạnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1509228627152-3f1b9f1a5f4e?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 34, ownerId: owner3.Id, name: 'Sân D-T Pickleball', address: '67 Bình Lợi, Phường 13, Bình Thạnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Pickleball', image: 'https://images.unsplash.com/photo-1509228627152-3f1b9f1a5f4e?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 150000, weekendPrice: 220000 }, { name: 'Sân B', weekdayPrice: 150000, weekendPrice: 220000 }] },
      { id: 35, ownerId: owner3.Id, name: 'Sân Cầu Lông Thanh Đa', address: '353/7A Bình Quới, Phường 28, Bình Thạnh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', sport: 'Cầu lông', image: 'https://images.unsplash.com/photo-1599335345980-dd22868285c5?q=80&w=2070&auto=format=fit=crop', courts: [{ name: 'Sân A', weekdayPrice: 500000, weekendPrice: 800000 }, { name: 'Sân B', weekdayPrice: 550000, weekendPrice: 850000 }] },



    ];

    for (const sf of sportFieldsData) {
      await this.prisma.sportField.upsert({
        where: { id: sf.id },
        update: {
          name: sf.name,
          address: sf.address,
          city: sf.city,
          district: sf.district,
          sport: sf.sport,
          ownerId: sf.ownerId,
        },
        create: { id: sf.id, name: sf.name, address: sf.address, city: sf.city, district: sf.district, sport: sf.sport, ownerId: sf.ownerId, courts: { create: sf.courts } },
      });
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