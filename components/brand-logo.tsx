import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <Image src="/momcare-logo-tagline.jpeg" alt="MomCare — Maternal Care and Assistance" width={1536} height={1024} className={className} priority />;
}

export function BrandMark({ className = "" }: { className?: string }) {
  return <Image src="/momcare-mark.png" alt="MomCare" width={1300} height={1300} className={className} priority />;
}
