import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <Image src="/momcare-logo.svg" alt="MomCare — Maternal Care and Assistance" width={440} height={390} className={className} priority />;
}
