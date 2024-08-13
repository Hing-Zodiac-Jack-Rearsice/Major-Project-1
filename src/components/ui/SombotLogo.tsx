import React from "react";

const SombotLogo = ({ width = 1000, height = 1000 }: { width?: number; height?: number }) => {
  return (
    <div>
      <img
        src="/logo-light.svg"
        alt=""
        width={width}
        height={height}
        className="block dark:hidden"
      />
      <img
        src="/logo-dark.svg"
        alt=""
        width={width}
        height={height}
        className="hidden dark:block"
      />
    </div>
  );
};

export default SombotLogo;
