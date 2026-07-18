interface MealListResDto {
  id: number;       // 아이디
  mealDate: string; // 식단표 날짜
  morning: string;  // 아침 식단
  lunch: string;    // 점심 식단
  dinner: string;   // 저녁 식단
}

export type { MealListResDto }