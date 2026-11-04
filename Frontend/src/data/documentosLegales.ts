// ⚠️ TEXTO BORRADOR basado en cómo funciona la app hoy.
// Reemplázalo por tus términos reales, revisados por quien corresponda.
export interface DocumentoLegal {
  slug: string;
  titulo: string;
  subtitulo: string;
  secciones: { titulo: string; texto: string }[];
}

export const documentosLegales: DocumentoLegal[] = [
  {
    slug: "terminos-de-uso",
    titulo: "Términos de uso",
    subtitulo: "Lee nuestros términos de uso",
    secciones: [
      {
        titulo: "Aceptación",
        texto:
          "Al usar la aplicación como repartidor aceptas estos términos. Si no estás de acuerdo, no la utilices.",
      },
      {
        titulo: "Tu cuenta",
        texto:
          "Tu cuenta es personal e intransferible. Eres responsable de mantener tu contraseña en secreto y de la actividad realizada con tu cuenta.",
      },
      {
        titulo: "Uso adecuado",
        texto:
          "Debes usar la aplicación solo para gestionar entregas reales, sin intentar acceder a datos de otros usuarios ni alterar el funcionamiento del servicio.",
      },
      {
        titulo: "Suspensión",
        texto: "Podemos suspender las cuentas que incumplan estos términos.",
      },
    ],
  },
  {
    slug: "politica-de-privacidad",
    titulo: "Política de privacidad",
    subtitulo: "Cómo protegemos tus datos",
    secciones: [
      {
        titulo: "Datos que guardamos",
        texto:
          "Tu nombre, teléfono, correo, foto, los datos de documento y vehículo que registres, tus preferencias y el historial de entregas que realizas.",
      },
      {
        titulo: "Para qué los usamos",
        texto:
          "Para identificarte al iniciar sesión, asignarte pedidos, mostrarte tu historial y tus ganancias, y permitir que restaurantes y clientes se coordinen contigo en cada entrega.",
      },
      {
        titulo: "Quién puede verlos",
        texto:
          "Los restaurantes para los que entregas pueden ver tu nombre, tu foto y cuántas entregas has hecho para ellos.",
      },
      {
        titulo: "Tus derechos",
        texto:
          "Puedes corregir tus datos desde Editar perfil y pedir que los eliminemos escribiendo a soporte.",
      },
    ],
  },
  {
    slug: "condiciones-repartidores",
    titulo: "Condiciones para repartidores",
    subtitulo: "Normas y responsabilidades",
    secciones: [
      {
        titulo: "Disponibilidad",
        texto:
          "Solo recibes pedidos mientras estés disponible. Puedes cambiar tu estado cuando quieras, salvo que tengas una entrega en curso.",
      },
      {
        titulo: "Una entrega a la vez",
        texto:
          "Debes completar la entrega en curso antes de tomar otro pedido.",
      },
      {
        titulo: "Recoger y entregar",
        texto:
          "Marca un pedido como recogido solo cuando lo tengas contigo, y como entregado solo cuando el cliente lo haya recibido.",
      },
      {
        titulo: "Trato",
        texto:
          "Debes tratar con respeto a los clientes y al personal de los restaurantes.",
      },
    ],
  },
  {
    slug: "uso-de-la-aplicacion",
    titulo: "Uso de la aplicación",
    subtitulo: "Información importante",
    secciones: [
      {
        titulo: "Pedidos disponibles",
        texto:
          "La lista se actualiza automáticamente. Otro repartidor puede tomar un pedido antes que tú.",
      },
      {
        titulo: "Distancias y tiempos",
        texto:
          "Son estimaciones calculadas en línea recta entre el restaurante y el cliente. El recorrido real puede ser distinto.",
      },
      {
        titulo: "Mapas",
        texto:
          "Las rutas se abren en la aplicación de mapas que elijas en Configuración.",
      },
      {
        titulo: "Notificaciones",
        texto:
          "Recibes avisos de pedidos nuevos y de entregas registradas. Puedes desactivarlos en Información de la cuenta.",
      },
    ],
  },
];
