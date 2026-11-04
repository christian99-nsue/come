import DetalleReporte from "../../components/common/DetalleReporte";

export default function ReporteDetalleRepartidor() {
  return (
    <DetalleReporte
      endpoint="/api/repartidor/soporte/reportes"
      rutaLista="/repartidor/ayuda/reportes"
      rutaNuevo="/repartidor/ayuda/reportar"
    />
  );
}
