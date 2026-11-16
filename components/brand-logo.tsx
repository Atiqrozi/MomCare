import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <Image src="/momcare-logo-tagline.png" alt="MomCare — Maternal Care and Assistance" width={1244} height={1265} className={className} priority />;
}

export function BrandMark({ className = "" }: { className?: string }) {
  return <Image src="/momcare-mark.png" alt="MomCare" width={1211} height={1299} className={className} priority />;
}
