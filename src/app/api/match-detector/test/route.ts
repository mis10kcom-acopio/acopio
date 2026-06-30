import { NextResponse } from "next/server";

const TEST_MESSAGE =
  "✅ Huellas a Salvo — Sistema de matches activo y funcionando correctamente.";

export async function GET() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { ok: false, error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: TEST_MESSAGE }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { ok: false, error: "Telegram rechazó el mensaje", detail },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, message: TEST_MESSAGE });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido al enviar prueba";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
