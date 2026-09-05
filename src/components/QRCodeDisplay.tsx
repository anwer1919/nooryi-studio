"use client";
import QRCode from "react-qr-code";
export default function QRCodeDisplay({ value, size = 95 }: { value: string; size?: number }) {
  return <QRCode value={value} size={size} level="H" bgColor="#FFFFFF" fgColor="#0a0a0a" />;
}