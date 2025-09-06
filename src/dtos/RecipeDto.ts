import { CategoryListResDto, CategoryResDto } from "./CategoryDto";
import { PictureResDto } from "./PictureDto";

interface RecipeListResDto {
  id: number;                   // 아이디
  title: string;                // 제목
  category: CategoryListResDto; // 카테고리 정보
}

interface RecipeInfoResDto {
  id: number;               // 아이디  
  title: string;            // 제목
  ingredients: string;      // 재료
  contents: string;         // 레시피
  tip: string;              // 팁
  reference: string;        // 참조 링크
  picture: PictureResDto;   // 사진 정보
  category: CategoryResDto; // 카테고리 정보
}

interface RecipeDeleteReqDto {
  id: number; // 아이디
}

export type { RecipeDeleteReqDto, RecipeInfoResDto, RecipeListResDto };

