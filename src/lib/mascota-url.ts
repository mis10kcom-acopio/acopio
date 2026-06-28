import { SITE_URL } from "@/lib/site-config";

export function buildMascotaPublicPath(id: string): string {
  return `/mascota/${id}`;
}

export function buildMascotaPublicUrl(id: string): string {
  return `${SITE_URL}${buildMascotaPublicPath(id)}`;
}
