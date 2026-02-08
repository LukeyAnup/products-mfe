import React, { useState } from "react";

interface ImageComponentProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onClick?: () => void;
}

export default function ImageComponent({
  src,
  alt,
  fallbackSrc,
  className,
  onClick,
  ...props
}: ImageComponentProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onClick={onClick}
      className={className}
      onError={() => fallbackSrc && setImgSrc(fallbackSrc)}
      {...props}
    />
  );
}
