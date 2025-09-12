import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfileService } from './profile/profile.service';
import { ProfileController } from './profile/profile.controller';
import { ProfileModule } from './profile/profile.module';
import { VideoModule } from './video/video.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { SearchModule } from './search/search.module';
import { BookingModule } from './booking/booking.module';
import { DataInitModule } from './data-init/data-init.module';
import { SportFieldModule } from './sport-field/sport-field.module';
import { OwnerModule } from './owner/owner.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, 
    PrismaModule,
    PostModule,
    CommentModule,
    NotificationModule,
    SearchModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,            // use STARTTLS port
          secure: false,        // upgrade later with STARTTLS
          auth: {
            user: config.get<string>('EMAIL_USER'),
            pass: config.get<string>('EMAIL_PASS'),
          },
          pool: true,
          maxConnections: 3,
          maxMessages: 50,
          socketTimeout: 15000,
          greetingTimeout: 8000,
          connectionTimeout: 10000,
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('EMAIL_USER') || 'no-reply@example.com'}>` ,
        },
        preview: false,
        template: {
          dir: process.cwd() + '/template/',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),
    ProfileModule,
    VideoModule,
    ChatModule,
    BookingModule,
    DataInitModule,
  SportFieldModule,
  OwnerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
