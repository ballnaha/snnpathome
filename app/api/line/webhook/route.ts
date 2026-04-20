import { NextRequest, NextResponse } from "next/server";

/**
 * LINE Webhook for catching Group ID or User ID
 * Set this URL in LINE Developers Console: https://yourdomain.com/api/line/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      if (event.type === "message" || event.type === "join") {
        const source = event.source;
        let idInfo = "";

        if (source.type === "group") {
          idInfo = `Group ID: ${source.groupId}`;
        } else if (source.type === "room") {
          idInfo = `Room ID: ${source.roomId}`;
        } else if (source.type === "user") {
          idInfo = `User ID: ${source.userId}`;
        }

        console.log("=============== LINE ID TRACKER ===============");
        console.log(idInfo);
        console.log("===============================================");

        // If you have Messaging Access Token set, you can try to reply back automatically
        const token = process.env.LINE_MESSAGING_ACCESS_TOKEN;
        if (token && event.replyToken && idInfo) {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [
                {
                  type: "text",
                  text: `คัดลอก ID นี้ไปใส่ใน .env นะครับ:\n\n${idInfo}`,
                },
              ],
            }),
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
