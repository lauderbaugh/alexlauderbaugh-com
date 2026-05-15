import Image from "next/image";

interface PortraitProps {
  size?: number;
  shape?: "circle" | "rounded" | "square";
  priority?: boolean;
}

export function Portrait({ size = 112, shape = "rounded", priority }: PortraitProps) {
  const radius =
    shape === "circle" ? "9999px" : shape === "square" ? "2px" : "6px";

  return (
    <div
      className="relative shrink-0 overflow-hidden bg-rule dark:bg-d-rule"
      style={{ width: size, height: size, borderRadius: radius }}
      aria-label="Portrait of Alex Lauderbaugh"
    >
      <Image
        src="/portrait-duotone-light.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="block w-full h-full object-cover dark:hidden"
        draggable={false}
      />
      <Image
        src="/portrait-duotone-dark.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="hidden w-full h-full object-cover dark:block"
        draggable={false}
      />
    </div>
  );
}
