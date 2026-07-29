import type { ReactNode } from "react";
import "./MobileFrame.css";

export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-frame-outer">
      <div className="mobile-frame-inner">{children}</div>
    </div>
  );
}
