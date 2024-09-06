declare module "react-qr-scanner" {
  import * as React from "react";

  interface QrScannerProps {
    delay?: number | false;
    onError?: (error: any) => void;
    onScan?: (result: { text: string } | null) => void;
    style?: React.CSSProperties;
    className?: string;
    facingMode?: "user" | "environment";
    legacyMode?: boolean;
    showViewFinder?: boolean;
    constraints?: MediaTrackConstraints;
  }

  const QrScanner: React.FC<QrScannerProps>;
  export default QrScanner;
}
