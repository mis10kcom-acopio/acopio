import { headers } from "next/headers";

export async function getSiteBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "https://tudominio.com";
}

export function buildEditUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/editar/${token}`;
}
