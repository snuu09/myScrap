import { useState } from "react";
import { Globe } from "lucide-react";
import { siteIconUrl } from "../lib/siteIcons";

type Props = {
  domain: string;
  favicon?: string;
  className?: string;
  size?: number;
};

/** Favicon → domain map → /favicon.ico, then Lucide Globe when the image fails or is missing. */
export function SiteIcon({ domain, favicon, className = "size-4", size = 16 }: Props) {
  const src = siteIconUrl(domain, favicon);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <Globe className={className} size={size} strokeWidth={1.8} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
