import ListaReportes from "../../components/common/ListaReportes";

export default function MisReportes() {
  return (
    <ListaReportes
      endpoint="/api/cliente/soporte/reportes"
      rutaDetalle={(id) => `/cliente/mis-reportes/${id}`}
      rutaNuevo="/cliente/contactanos"
      rutaVolver="/cliente/perfil"
    />
  );
}
