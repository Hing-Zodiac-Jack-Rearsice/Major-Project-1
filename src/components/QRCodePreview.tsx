import React from "react";
import QRCode from "react-qr-code";

const getQRCodeOptions = (theme: string) => {
  switch (theme) {
    case "neon":
      return {
        fgColor: "#00FFFF",
        bgColor: "#000000",
      };
    case "sunset":
      return {
        fgColor: "#FF6B6B",
        bgColor: "#FFFFFF",
      };
    case "forest":
      return {
        fgColor: "#2ECC71",
        bgColor: "#FFFFFF",
      };
    case "ocean":
      return {
        fgColor: "#3498DB",
        bgColor: "#FFFFFF",
      };
    case "galaxy":
      return {
        fgColor: "#8E44AD",
        bgColor: "#FFFFFF",
      };
    default: // default theme (black and white)
      return {
        fgColor: "#000000",
        bgColor: "#FFFFFF",
      };
  }
};

const QRCodePreview = ({ theme }: { theme: string }) => {
  const options = getQRCodeOptions(theme);

  return (
    <div className="flex flex-col items-center">
      <QRCode
        value="Preview"
        size={128}
        fgColor={options.fgColor}
        bgColor={options.bgColor}
        level="L"
      />
      <p className="mt-2 text-sm text-gray-500">
        {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
      </p>
    </div>
  );
};

export default QRCodePreview;
