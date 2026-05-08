"use client";

import dynamic from "next/dynamic";

const BackgroundBlob = dynamic(() => import("@/components/BackgroundBlob"), { ssr: false });
const GrainOverlay = dynamic(() => import("@/components/GrainOverlay"), { ssr: false });
const CursorGlow = dynamic(() => import("@/components/CursorGlow"), { ssr: false });

export default function ClientLayers() {
  return (
    <>
      <BackgroundBlob />
      <CursorGlow />
      <GrainOverlay />
    </>
  );
}
