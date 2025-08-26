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
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    AuthModule, 
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        transport: {
        host: 'smtp.gmail.com',
        port: 465,
        //ignoreTLS: true,
        secure: true,
        auth: {
          user: ConfigService.get<string>('EMAIL_USER'),
          pass: ConfigService.get<string>('EMAIL_PASS'),
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: true,
      template: {
        dir: process.cwd() + '/template/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
      }),
      inject: [ConfigService],
      
    }),
    ProfileModule,
    VideoModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
