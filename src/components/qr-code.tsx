"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QRCodeCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
    }
  }, [url]);

  return <canvas ref={canvasRef} className="mx-auto rounded-lg" />;
}
