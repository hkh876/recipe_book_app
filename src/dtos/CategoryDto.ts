interface CategoryListResDto {
  id: number;   // 아이디
  name: string; // 카테고리 명
}

interface CategoryResDto {
  id: number;   // 아이디
  name: string; // 카테고리 명
}

interface CategoryDeleteReqDto {
  id: number; // 아이디
}

export type { CategoryDeleteReqDto, CategoryListResDto, CategoryResDto };

