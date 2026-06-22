import Image from "next/image"

interface PactumMarkProps {
  height?: number
  variant?: "dark" | "light"
}

export function PactumMark({ height = 40, variant = "dark" }: PactumMarkProps) {
  const src = variant === "light" ? "/logo-mark-light.svg" : "/logo-mark-dark.svg"
  // Mark is ~2:1 wide, derived from the 288×142 cropped viewBox
  const width = Math.round(height * (288 / 142))
  return (
    <Image
      src={src}
      alt="Pactum"
      width={width}
      height={height}
      priority
    />
  )
}
