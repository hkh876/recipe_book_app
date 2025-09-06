class EmptyDto {}

interface PageDto {
  page: number; // 페이지 번호
  size: number; // 페이지 크기
}

export type { EmptyDto, PageDto };
