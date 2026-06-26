import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FOTO_SIZE_BYTES = 5 * 1024 * 1024;
const STORAGE_BUCKET = "mascotas";

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function buildStorageFileName(originalName: string): string {
  const parts = originalName.split(".");
  const extension =
    parts.length > 1 ? parts.pop()?.toLowerCase() ?? "jpg" : "jpg";
  const baseName = parts.join(".") || "foto";
  const cleanBase = sanitizeFileName(baseName) || "foto";
  return `${Date.now()}-${cleanBase}.${extension}`;
}

export async function uploadImagenStorage(
  supabase: SupabaseClient,
  file: File,
  folder: string,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen (JPG, PNG, WebP, etc.).");
  }

  if (file.size > MAX_FOTO_SIZE_BYTES) {
    throw new Error("La foto no puede superar 5 MB. Intenta con una imagen más liviana.");
  }

  const fileName = `${folder}/${buildStorageFileName(file.name)}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, { upsert: false, contentType: file.type });

  if (error) {
    throw new Error(`Error al subir la foto: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function resolveOptionalFotoUrl(
  supabase: SupabaseClient,
  formData: FormData,
  folder: string,
  fieldName = "foto",
): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  try {
    return await uploadImagenStorage(supabase, file, folder);
  } catch {
    return null;
  }
}
