import React from "react";
import QRCode from "react-qr-code";

const getQRCodeOptions = (theme: string) => {
  switch (theme) {
    case "neon":
      return {
        fgColor: "#00FFFF",
        bgColor: "#000000",
        gradientType: "radial",
        gradientColors: ["#00FFFF", "#FF00FF", "#0000FF"],
      };
    case "sunset":
      return {
        fgColor: "#FF6B6B",
        bgColor: "#FFD93D",
        gradientType: "linear",
        gradientColors: ["#FF6B6B", "#FFA06B", "#FFD93D"],
      };
    case "forest":
      return {
        fgColor: "#2ECC71",
        bgColor: "#E8F6EF",
        gradientType: "linear",
        gradientColors: ["#2ECC71", "#27AE60", "#1E8449"],
      };
    case "ocean":
      return {
        fgColor: "#3498DB",
        bgColor: "#E0F7FA",
        gradientType: "radial",
        gradientColors: ["#3498DB", "#2980B9", "#1ABC9C"],
      };
    case "galaxy":
      return {
        fgColor: "#8E44AD",
        bgColor: "#F3E5F5",
        gradientType: "radial",
        gradientColors: ["#8E44AD", "#9B59B6", "#3498DB"],
      };
    default: // modern
      return {
        fgColor: "#34495E",
        bgColor: "#ECF0F1",
        gradientType: "linear",
        gradientColors: ["#34495E", "#2C3E50", "#1ABC9C"],
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
