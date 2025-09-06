import { CardMedia, Skeleton } from "@mui/material";
import { useState } from "react";

interface ExternalImageProps {
  width?: string|number;  // 이미지 가로 크기
  height?: string|number; // 이미지 세로 크기
  image: string;          // 이미지 링크 URL
  alt: string;            // 이미지가 없을 경우 문구
  className?: string;     // 커스텀 클래스
}

const ExternalImage = ({ width="100%", height="auto", image, alt, className }: ExternalImageProps) => {
  // state
  const [imageLoaded, setImageLoaded] = useState(false)

  // event
  const onImageLoad = () => {
    setImageLoaded(true)
  }

  return (
    <>
      { !imageLoaded && <Skeleton variant={"rectangular"} width={width} height={height} /> }
      <CardMedia 
        sx={{ display: imageLoaded ? "block" : "none !important" }}
        component={"img"}
        height={height}
        image={image}
        alt={alt}
        onLoad={onImageLoad}
        className={className}
      />
    </>
  )
}

export default ExternalImage