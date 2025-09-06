interface CategoryCreateForm {
  name: string; // 카테고리 명
}

interface CategorySearchForm {
  categoryId: string;   // 카테고리 아이디
  categoryName: string; // 카테고리 명
}

export type { CategoryCreateForm, CategorySearchForm }