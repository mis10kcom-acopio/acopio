export type TipoReporte = "PERDIDO" | "ENCONTRADO";
export type EstadoMascota = "ACTIVO" | "RESUELTO";
export type TipoAyuda = "VETERINARIO" | "HOGAR_TEMPORAL" | "RESCATISTA" | "TRANSPORTE";
export type DisponibilidadVoluntario = "DISPONIBLE" | "LLENO/NO_DISPONIBLE";
export type EstadoStock = "CRITICO" | "MODERADO" | "ABASTECIDO";

export interface MascotaReportada {
  id: string;
  tipo_reporte: TipoReporte;
  especie: string;
  nombre_mascota: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  contacto_whatsapp: string | null;
  foto_url: string | null;
  estado: EstadoMascota;
  token_edicion: string;
  creado_el: string;
}

export interface RedVoluntario {
  id: string;
  tipo_ayuda: TipoAyuda;
  nombre_o_clinica: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  contacto_whatsapp: string | null;
  disponibilidad: DisponibilidadVoluntario;
  token_edicion: string;
  creado_el: string;
}

export interface AcopioMascota {
  id: string;
  nombre_centro: string;
  ubicacion_zona: string;
  direccion_exacta: string;
  contacto_telefono: string;
  contacto_whatsapp: string | null;
  necesidades_urgentes: string;
  estado_stock: EstadoStock;
  token_edicion: string;
  creado_el: string;
}

export interface HomePageData {
  mascotas: MascotaReportada[];
  voluntarios: RedVoluntario[];
  acopios: AcopioMascota[];
}
