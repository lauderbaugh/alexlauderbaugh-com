import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          color: "#1A1A1A",
          padding: "96px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            fontFamily: "serif",
            fontSize: 112,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {SITE.name}
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 28,
            color: "#5A5A55",
            marginTop: 28,
            letterSpacing: "0.02em",
          }}
        >
          {SITE.whereLine}
        </div>
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 96,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "#2D4A3E",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
