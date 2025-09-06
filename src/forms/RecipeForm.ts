interface RecipeCreateForm {
  title: string;            // 제목
  picture: File|undefined;  // 사진
  categoryId: string;       // 카테고리 아이디
  ingredients: string;      // 식재료
  contents: string;         // 레시피
  tip: string;              // 팁
  reference: string;        // 링크 주소
}

interface RecipeUpdateForm {
  id: number;               // 아이디
  title: string;            // 제목
  picture: File|undefined;  // 사진
  categoryId: string;       // 카테고리 아이디
  ingredients: string;      // 식재료
  contents: string;         // 레시피
  tip: string;              // 팁
  reference: string;        // 링크 주소
}

export type { RecipeCreateForm, RecipeUpdateForm };
