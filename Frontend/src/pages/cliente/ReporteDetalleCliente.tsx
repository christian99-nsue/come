import DetalleReporte from "../../components/common/DetalleReporte";

export default function ReporteDetalleCliente() {
  return (
    <DetalleReporte
      endpoint="/api/cliente/soporte/reportes"
      rutaLista="/cliente/mis-reportes"
      rutaNuevo="/cliente/contactanos"
    />
  );
}
