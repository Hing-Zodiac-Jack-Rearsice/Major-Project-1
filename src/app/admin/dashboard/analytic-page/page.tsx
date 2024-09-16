import React from "react";

import dynamic from "next/dynamic";

const AnalyticsPage = dynamic(() => import("@/components/AnalyticsPage"), {
  ssr: false,
});

const Analytic = () => {
  return (
    <div>
      <AnalyticsPage />
    </div>
  );
};

export default Analytic;
