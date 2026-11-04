import ListaReportes from "../../components/common/ListaReportes";

export default function MisReportesRepartidor() {
  return (
    <ListaReportes
      endpoint="/api/repartidor/soporte/reportes"
      rutaDetalle={(id) => `/repartidor/ayuda/reportes/${id}`}
      rutaNuevo="/repartidor/ayuda/reportar"
      rutaVolver="/repartidor/centro-ayuda"
    />
  );
}
