import { SITE, type BjjBelt } from "@/lib/site";

const BELT_COLORS: Record<BjjBelt, string> = {
  white: "#F5F5F0",
  blue: "#1E3A8A",
  purple: "#5B2C8F",
  brown: "#4A2C0A",
  black: "#1A1A1A",
};

const STRIPE_COLOR = "#F5F5F0";
const BLACK_RANK = "#1A1A1A";
const RED_RANK = "#B91C1C";

const SVG_W = 24;
const SVG_H = 6;
const RANK_X = 16;
const RANK_W = 8;

export function Belt({ className }: { className?: string }) {
  const bjj = SITE.bjj;
  if (!bjj) return null;
  if (!(bjj.belt in BELT_COLORS)) return null;

  let stripes = Math.floor(bjj.stripes);
  if (stripes > 4) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Belt: stripes capped at 4 (got ${bjj.stripes})`);
    }
    stripes = 4;
  }
  if (stripes < 0) stripes = 0;

  const belt = bjj.belt;
  const bodyColor = BELT_COLORS[belt];
  const rankColor = belt === "black" ? RED_RANK : BLACK_RANK;

  // Stripe block: each stripe 1px wide, 1px gap → total width = 2N - 1, centered in rank bar
  const blockWidth = stripes > 0 ? 2 * stripes - 1 : 0;
  const stripeStartX = RANK_X + (RANK_W - blockWidth) / 2;

  const beltLabel = belt.charAt(0).toUpperCase() + belt.slice(1);
  const stripePart =
    stripes === 0
      ? ""
      : `, ${stripes} ${stripes === 1 ? "stripe" : "stripes"}`;
  const title = `${beltLabel} belt${stripePart} · BJJ`;

  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      focusable="false"
      shapeRendering="crispEdges"
      className={`inline-block align-middle ${className ?? ""}`}
    >
      <title>{title}</title>
      <rect width={SVG_W} height={SVG_H} fill={bodyColor} />
      <rect x={RANK_X} width={RANK_W} height={SVG_H} fill={rankColor} />
      {Array.from({ length: stripes }).map((_, i) => (
        <rect
          key={i}
          x={stripeStartX + i * 2}
          width={1}
          height={SVG_H}
          fill={STRIPE_COLOR}
        />
      ))}
      {belt === "white" && (
        <rect
          width={SVG_W}
          height={SVG_H}
          fill="none"
          stroke="#5A5A55"
          strokeWidth={0.5}
        />
      )}
      <rect
        className="belt-outline"
        width={SVG_W}
        height={SVG_H}
        fill="none"
        strokeWidth={0.5}
      />
    </svg>
  );
}
