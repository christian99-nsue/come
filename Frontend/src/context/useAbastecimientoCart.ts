import { useContext } from "react";
import { AbastecimientoCartContext } from "./AbastecimientoCartContextValue";

export function useAbastecimientoCart() {
  const ctx = useContext(AbastecimientoCartContext);

  if (!ctx) {
    throw new Error(
      "useAbastecimientoCart debe usarse dentro de AbastecimientoCartProvider",
    );
  }

  return ctx;
}
