import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPermitExpiryEmail(
    to: string,
    employeeName: string,
    endDate: Date | undefined,
  ) {
    const formattedDate = endDate?.toLocaleDateString('en-GB');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2 style="color:#d9534f"> ${employeeName} تنبية انتهاء التصريح الخاص ب </h2>
        
        <p>
          ينتهي تصريح العمل بتاريخ 
          <strong>${formattedDate}</strong>.
        </p>
    
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to:process.env.ADMIN_EMAIL,
        subject: '⚠️ تذكير بموعد انتهاء تصريح العمل',
        html,
      });

      this.logger.log(`📧 Permit expiry email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send permit expiry email to ${to}`,
        error.stack,
      );
    }
  }


async sendNewReservationNotification(
  reservation: any,
) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl">
      <h2 style="color:#d9534f">📢 حجز جديد - عملاء VIP</h2>

      <table style="border-collapse: collapse; width: 100%; margin-top: 20px">
        <tr>
          <td style="padding:8px; border:1px solid #ddd">اسم العميل</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${reservation.guestName}
          </td>
        </tr>

        <tr>
          <td style="padding:8px; border:1px solid #ddd">رقم الهاتف</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${reservation.phone

            }
          </td>
        </tr>

        <tr>
          <td style="padding:8px; border:1px solid #ddd">تاريخ الوصول</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${this.formatDateEG(reservation.expectedArrivalDate)}
          </td>
        </tr>

        <tr>
          <td style="padding:8px; border:1px solid #ddd">اتجاه العبور</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${this.formatDateEG(reservation.directionOfTravel)}
          </td>
        </tr>

        <tr>
          <td style="padding:8px; border:1px solid #ddd">عدد الأفراد</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${reservation.numberOfCompanions}
          </td>
        </tr>

        <tr>
          <td style="padding:8px; border:1px solid #ddd">الباقة</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${reservation.package?.ar?.name}
          </td>
        </tr>

          <tr>
          <td style="padding:8px; border:1px solid #ddd">ااجمالي السعر</td>
          <td style="padding:8px; border:1px solid #ddd">
            ${reservation.package?.price * reservation.numberOfCompanions} $
          </td>
        </tr>

        ${
          reservation.notes
            ? `
            <tr>
              <td style="padding:8px; border:1px solid #ddd">ملاحظات</td>
              <td style="padding:8px; border:1px solid #ddd">
                ${reservation.notes}
              </td>
            </tr>
          `
            : ''
        }
      </table>

      <p style="margin-top:20px">
        تم إنشاء هذا الحجز بتاريخ: <strong>${new Date().toLocaleString(
          'ar-EG',
        )}</strong>
      </p>
    </div>
  `;

  try {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.ADMIN_EMAIL, // إيميلك أنت
      subject: '📢 حجز جديد - VIP',
      html,
    });

    this.logger.log(`📧 New reservation notification sent`);
  } catch (error) {
    this.logger.error(
      `❌ Failed to send new reservation notification`,
      error.stack,
    );
  }
}

private formatDateEG(date: Date | string) {
  return new Date().toLocaleString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}


}
