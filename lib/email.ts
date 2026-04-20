import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
}

interface SendOrderConfirmationOptions {
  to: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  phone: string;
  subtotal: number;
  discount: number;
  total: number;
  discountCode?: string | null;
  items: OrderItem[];
  bankAccountInfo?: string | null;
}

const DEFAULT_BANK_ACCOUNT_INFO = [
  "ธนาคาร: ไทยพาณิชย์ (SCB)",
  "ชื่อบัญชี: บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด(มหาชน)",
  "เลขที่บัญชี: 366-415149-5",
].join("\n");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultilineForHtml(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br/>");
}

export async function sendOrderConfirmationEmail(opts: SendOrderConfirmationOptions) {
  const {
    to,
    orderNumber,
    firstName,
    lastName,
    address,
    subdistrict,
    district,
    province,
    postcode,
    phone,
    subtotal,
    discount,
    total,
    discountCode,
    items,
    bankAccountInfo,
  } = opts;

  const bankInfoHtml = formatMultilineForHtml(
    (bankAccountInfo && bankAccountInfo.trim()) || DEFAULT_BANK_ACCOUNT_INFO
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const encodedOrderNumber = encodeURIComponent(orderNumber);
  const paymentNotificationUrl = `${baseUrl}/payment-notification?order=${encodedOrderNumber}`;
  const trackOrderUrl = `${baseUrl}/track-order?order=${encodedOrderNumber}`;

  // Read logo as base64 for email embedding (works on localhost + production)
  let logoSrc = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    // logo not found — skip image
  }

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          ${item.productImage ? `<img src="${item.productImage}" alt="${item.productName}" width="50" height="50" style="object-fit:contain; border-radius:6px; border:1px solid #eee; vertical-align:middle; margin-right:10px;" />` : ""}
          <span style="font-weight:600;">${item.productName}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align:center;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align:right; font-weight:700;">฿${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ยืนยันคำสั่งซื้อ ${orderNumber}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <tr>
            <td style="background:#d71414; padding: 32px 40px; text-align:center;">
              ${logoSrc ? `<img src="${logoSrc}" alt="SNNP AT HOME" width="120" height="38" style="object-fit:contain; margin-bottom:8px; display:block; margin-left:auto; margin-right:auto;" />` : `<h1 style="margin:0; color:#fff; font-size:22px; font-weight:900; letter-spacing:0.5px;">SNNP AT HOME</h1>`}
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">ยืนยันคำสั่งซื้อของคุณ</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">

              <h2 style="margin: 0 0 6px; font-size:18px; color:#1a1a1a;">สวัสดีคุณ ${firstName} ${lastName} 🎉</h2>
              <p style="margin: 0 0 28px; color:#555; font-size:14px; line-height:1.6;">เราได้รับคำสั่งซื้อของคุณแล้ว กรุณาชำระเงินตามรายละเอียดด้านล่างเพื่อดำเนินการต่อ</p>

              <div style="margin: 0 0 28px;">
                <a href="${trackOrderUrl}" style="display:inline-block; background:#fff6de; color:#8a6a18; font-size:14px; font-weight:800; text-decoration:none; padding:12px 18px; border-radius:999px; border:1px solid #f0dda0;">ติดตามสถานะคำสั่งซื้อทันที</a>
                <p style="margin:10px 0 0; color:#777; font-size:12px; line-height:1.6;">ลิงก์นี้จะพาคุณไปยังหน้าติดตามสถานะพร้อมกรอกหมายเลขคำสั่งซื้อให้แล้ว จากนั้นยืนยันด้วยอีเมลหรือเบอร์โทร 4 หลักท้ายเพื่อดูสถานะล่าสุด</p>
              </div>

              <!-- Order Number -->
              <div style="background:#fff9f9; border:1px solid #ffd5d5; border-radius:8px; padding:14px 20px; margin-bottom:28px; display:flex; align-items:center; gap:12px;">
                <span style="font-size:13px; color:#888;">หมายเลขคำสั่งซื้อ</span>
                <span style="font-size:18px; font-weight:900; color:#d71414; letter-spacing:1px;">${orderNumber}</span>
              </div>

              <!-- Items -->
              <h3 style="font-size:15px; font-weight:800; margin:0 0 12px; color:#333;">รายการสินค้า</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <thead>
                  <tr style="border-bottom:2px solid #eee;">
                    <th style="text-align:left; padding-bottom:8px; font-size:13px; color:#888; font-weight:600;">สินค้า</th>
                    <th style="text-align:center; padding-bottom:8px; font-size:13px; color:#888; font-weight:600;">จำนวน</th>
                    <th style="text-align:right; padding-bottom:8px; font-size:13px; color:#888; font-weight:600;">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:5px 0; font-size:14px; color:#555;">ยอดรวม</td>
                  <td style="padding:5px 0; font-size:14px; text-align:right;">฿${subtotal.toLocaleString()}</td>
                </tr>
                ${discount > 0 ? `
                <tr>
                  <td style="padding:5px 0; font-size:14px; color:#22aa44;">ส่วนลด${discountCode ? ` (${discountCode})` : ""}</td>
                  <td style="padding:5px 0; font-size:14px; color:#22aa44; text-align:right;">-฿${discount.toLocaleString()}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:10px 0 0; font-size:16px; font-weight:900; border-top:2px solid #eee;">ยอดสุทธิ</td>
                  <td style="padding:10px 0 0; font-size:16px; font-weight:900; color:#d71414; text-align:right; border-top:2px solid #eee;">฿${total.toLocaleString()}</td>
                </tr>
              </table>

              <!-- Shipping Info -->
              <h3 style="font-size:15px; font-weight:800; margin:0 0 12px; color:#333;">ที่อยู่จัดส่ง</h3>
              <div style="background:#f9f9f9; border-radius:8px; padding:14px 18px; margin-bottom:28px; font-size:14px; color:#444; line-height:1.8;">
                ${firstName} ${lastName}<br/>
                ${address}<br/>
                ต.${subdistrict} อ.${district} จ.${province} ${postcode}<br/>
                โทร: ${phone}
              </div>

              <!-- Payment Instructions -->
              <h3 style="font-size:15px; font-weight:800; margin:0 0 12px; color:#333;">วิธีการชำระเงิน</h3>
              <div style="background:#fff9f9; border:1px solid #ffd5d5; border-radius:8px; padding:14px 18px; margin-bottom:28px; font-size:14px; line-height:1.8;">
                <strong>โอนเงินเข้าบัญชีธนาคาร</strong><br/>
                ${bankInfoHtml}<br/>
                <br/>
                หลังโอนเงินแล้ว กรุณาแนบสลิปที่
                <a href="${paymentNotificationUrl}" style="color:#d71414; font-weight:700;">แจ้งชำระเงิน</a>
                <br/>
                หรือตรวจสอบสถานะล่าสุดที่
                <a href="${trackOrderUrl}" style="color:#8a6a18; font-weight:700;">ติดตามสถานะคำสั่งซื้อ</a>
              </div>

              <p style="font-size:13px; color:#999; margin:0;">หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายบริการลูกค้าของเรา</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9; padding:20px 40px; text-align:center; border-top:1px solid #eee;">
              <p style="margin:0; font-size:12px; color:#aaa;">© 2026 Srinanaporn Marketing Public Company Limited. สงวนลิขสิทธิ์</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "SNNP AT HOME <noreply@snnpathome.com>",
    to,
    subject: `ยืนยันคำสั่งซื้อ ${orderNumber} — SNNP AT HOME`,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  let logoSrc = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    // logo not found
  }

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>ตั้งรหัสผ่านใหม่ — SNNP AT HOME</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family: sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" style="background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#d71414; padding: 30px; text-align:center;">
              ${logoSrc ? `<img src="${logoSrc}" alt="SNNP AT HOME" width="120" style="display:block; margin:auto;" />` : `<h1 style="color:#fff; margin:0;">SNNP AT HOME</h1>`}
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin:0 0 20px;">สวัสดีคุณ ${name} 👋</h2>
              <p style="color:#555; line-height:1.6; margin-bottom:25px;">เราได้รับคำขอเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ สามารถข้ามอีเมลฉบับนี้ไปได้เลย</p>
              
              <div style="text-align:center; margin-bottom:30px;">
                <a href="${resetUrl}" style="display:inline-block; background:#d71414; color:#fff; text-decoration:none; padding:14px 30px; border-radius:8px; font-weight:bold;">ตั้งรหัสผ่านใหม่</a>
              </div>

              <p style="color:#777; font-size:13px; line-height:1.6;">หากปุ่มด้านบนใช้งานไม่ได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณ:</p>
              <p style="color:#d71414; font-size:12px; word-break:break-all;">${resetUrl}</p>
              
              <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />
              <p style="color:#aaa; font-size:12px;">ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัยของบัญชีคุณ</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "SNNP AT HOME <noreply@snnpathome.com>",
    to: email,
    subject: "ตั้งรหัสผ่านใหม่ — SNNP AT HOME",
    html,
  });
}
