import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Privacidad | Huellas a Salvo",
  description:
    "Términos y condiciones y política de privacidad de Huellas a Salvo, plataforma solidaria de emergencia animal en Venezuela.",
};

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-amber-800 transition hover:text-amber-900"
        >
          ← Volver al inicio
        </Link>

        <header className="mb-10 border-b border-zinc-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Términos y Condiciones / Política de Privacidad
          </h1>
          <p className="mt-3 text-base text-zinc-600">Huellas a Salvo</p>
        </header>

        <div className="space-y-10 text-base leading-relaxed text-zinc-700">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              1. Naturaleza de la Plataforma
            </h2>
            <p className="mt-3">
              Huellas a Salvo es una plataforma digital de información, 100%
              gratuita y sin fines de lucro, creada exclusivamente para atender
              la emergencia generada por el terremoto del 24 de junio de 2026 en
              Venezuela. Nuestro único objetivo es servir como un puente de
              comunicación para conectar a los dueños de animales extraviados
              con rescatistas, voluntarios, hogares temporales y clínicas
              veterinarias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              2. Cero Manejo de Fondos (No pedimos donaciones)
            </h2>
            <p className="mt-3">
              Esta plataforma NO solicita, NO recauda y NO recibe dinero,
              criptomonedas, ni donaciones de ningún tipo. No tenemos cuentas
              bancarias asociadas ni personal autorizado para pedir fondos en
              nuestro nombre. Cualquier ayuda material o financiera debe
              coordinarse de manera directa y bajo su propio riesgo con las
              fundaciones, centros de acopio o clínicas verificadas por usted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              3. No somos un refugio físico
            </h2>
            <p className="mt-3">
              Huellas a Salvo es una herramienta tecnológica. NO contamos con
              instalaciones físicas, NO ofrecemos servicios de hospedaje para
              mascotas y NO realizamos rescates en el terreno. La logística de
              traslado y resguardo recae enteramente en la red de voluntarios y
              dueños que utilizan esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              4. Privacidad y Uso de la Información
            </h2>
            <p className="mt-3">
              Al registrar una mascota, ofrecerte como voluntario o registrar
              una clínica, aceptas que la información proporcionada (incluyendo
              números de teléfono, nombres, ubicaciones y fotografías) será
              pública con el único fin de facilitar la ayuda y el rescate
              durante la emergencia.
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-5">
              <li>
                <strong className="font-semibold text-zinc-800">
                  Responsabilidad:
                </strong>{" "}
                Los datos son suministrados por la comunidad de buena fe.
                Huellas a Salvo no puede verificar la veracidad de cada
                reporte y no se hace responsable por el uso indebido que
                terceros puedan darle a la información pública de contacto.
              </li>
              <li>
                <strong className="font-semibold text-zinc-800">
                  Gestión de datos:
                </strong>{" "}
                Te instamos a utilizar el enlace de edición secreto que se
                genera al momento de tu reporte para cambiar el estado a
                &quot;En Casa&quot; o eliminar tus datos una vez que la
                emergencia de tu mascota haya sido resuelta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              6. No Verificación de Usuarios
            </h2>
            <p className="mt-3">
              Huellas a Salvo no realiza ningún tipo de verificación de
              identidad, antecedentes ni idoneidad de las personas registradas
              en la plataforma, ya sean dueños de mascotas, voluntarios,
              rescatistas, hogares temporales o centros de acopio. Cualquier
              persona puede registrarse libremente para ayudar durante la
              emergencia.
            </p>
            <p className="mt-3">
              El hecho de que un usuario aparezca listado como &quot;Hogar
              Temporal&quot;, &quot;Rescatista&quot; o cualquier otra categoría
              no constituye una garantía, aval ni recomendación por parte de
              Huellas a Salvo sobre su confiabilidad, capacidad o buenas
              intenciones. Recomendamos a todos los usuarios tomar precauciones
              razonables antes de entregar una mascota o coordinar un encuentro
              presencial: verificar identidad, solicitar referencias, acordar
              encuentros en lugares públicos y de ser posible acompañados, y
              confiar en su propio criterio.
            </p>
            <p className="mt-3">
              Huellas a Salvo actúa exclusivamente como canal de difusión de
              información y no participa, supervisa ni se hace responsable de los
              acuerdos, traslados o entregas de animales que se coordinen entre
              los usuarios de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">
              7. Uso Aceptable
            </h2>
            <p className="mt-3">
              Nos reservamos el derecho de eliminar cualquier reporte que
              contenga información falsa, spam, o que intente utilizar la
              plataforma para fines comerciales, fraudes o extorsiones.
            </p>
          </section>

          <p className="border-t border-zinc-200 pt-8 text-sm text-zinc-600">
            Al utilizar Huellas a Salvo, confirmas que entiendes y aceptas estas
            condiciones de uso solidario y de emergencia.
          </p>
        </div>
      </article>
    </main>
  );
}
