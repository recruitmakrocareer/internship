const LINE_API_URL = "https://api.line.me/v2/bot/message/push";

interface LineMessage {
  type: "text";
  text: string;
}

export async function sendLineMessage(
  lineUserId: string,
  message: string
): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUserId) return false;

  try {
    const body = {
      to: lineUserId,
      messages: [{ type: "text", text: message }] as LineMessage[],
    };

    const res = await fetch(LINE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return res.ok;
  } catch {
    console.error("Failed to send LINE message");
    return false;
  }
}

export async function sendLineNotification(
  userId: string,
  title: string,
  message: string
): Promise<boolean> {
  const { prisma } = await import("./prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lineUserId: true },
  });

  if (!user?.lineUserId) return false;

  const fullMessage = `📢 ${title}\n\n${message}`;
  return sendLineMessage(user.lineUserId, fullMessage);
}
