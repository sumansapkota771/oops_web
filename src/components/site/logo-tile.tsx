import { Img } from "@/components/ui/img";
import type { ImageData } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Partner logos sit on white tiles so every brand colour reads correctly on the dark site. */
export function LogoTile({ image, name, className }: { image: ImageData; name?: string | null; className?: string }) {
  return (
    <div
      className={cn("flex h-20 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 sm:h-24 sm:w-44", className)}
      title={name ?? undefined}
    >
      <Img image={image} sizes="176px" placeholder={false} alt={name ? `${name} logo` : image.alt} className="max-h-full w-auto max-w-full object-contain" />
    </div>
  );
}
