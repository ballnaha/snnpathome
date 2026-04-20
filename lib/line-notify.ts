/**
 * Send a notification via LINE Messaging API (Push Message)
 * LINE Notify is ending its service on March 31, 2025.
 * @param message The text message to send
 * @param imageUrl Optional public image URL to send along with the message
 */
export async function sendLineNotify(message: string, imageUrl?: string) {
  const token = process.env.LINE_MESSAGING_ACCESS_TOKEN;
  const adminUserId = process.env.LINE_ADMIN_USER_ID;

  if (!token || !adminUserId) {
    console.warn("[sendLineNotify] LINE_MESSAGING_ACCESS_TOKEN or LINE_ADMIN_USER_ID is not set");
    return;
  }

  try {
    const messages: any[] = [
      {
        type: "text",
        text: message,
      }
    ];

    if (imageUrl) {
      messages.push({
        type: "image",
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl,
      });
    }

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminUserId,
        messages: messages
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to send LINE notification");
    }

    return data;
  } catch (error: any) {
    console.error("[sendLineNotify] Error:", error.message);
    throw error;
  }
}
