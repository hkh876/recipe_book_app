import Loading from "@/components/Loading";
import WeekNavigation from "@/components/WeekNavigation";
import { EmptyDto } from "@/dtos/CommonDto";
import { MealListResDto } from "@/dtos/MealDto";
import { QueryKeyEnum } from "@/enums/QueryKeyEnum";
import { MealModifyForm } from "@/forms/MealModifyForm";
import { ErrorRes, useGetQueryEx, usePostQueryEx } from "@/queries/useQueryEx";
import styles from "@/styles/meal/Meal.module.css";
import { Box, Button, Card, CardContent, Fab, Link, Stack, TextField, Typography } from "@mui/material";
import classNames from 'classnames';
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

const Meal = () => {
  // router
  const router = useRouter();
  const { date } = router.query;

  // states
  const [pivotDate, setPivotDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // 1. 네비게이션에서 관리하는 기준 날짜 (월요일)
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // query
  const { data: meals = [], isLoading: isMealReading } = useGetQueryEx<MealListResDto[]>({
    queryKey: QueryKeyEnum.READ_MEAL_LIST,
    url: "/api/v1/meal/list",
    params: {
      startDate: format(pivotDate, 'yyyy-MM-dd'),
      endDate: format(addDays(pivotDate, 6), 'yyyy-MM-dd')
    }
  })

  const onMealModifySuccess = () => {
    toast.success(
      "저장 되었습니다.",
      { onClose: () => router.reload(), autoClose: 500 }
    )
  }

  const onMealModifyError = useCallback((error: ErrorRes) => {
    alert("Not implement : " + error.errorCode);
  }, []);

  const { mutate, isLoading: isCreateLoading } = usePostQueryEx<MealModifyForm, EmptyDto>({
    url: "/api/v1/meal/modify",
    onSuccess: onMealModifySuccess,
    onError: onMealModifyError,
  })

  // forms
  const { control, handleSubmit, reset } = useForm<MealModifyForm>({
    defaultValues: {
      mealDate: "",
      morning: "",
      lunch: "",
      dinner: ""    
    }
  })

  // events
  const handleSave = handleSubmit((formData: MealModifyForm) => {
    if (confirm("저장 하시겠습니까?")) {
      mutate(formData);
      setEditingDate(null); // 수정 모드 종료
    }
  });

  const handleCancel = () => {
    setEditingDate(null); // 수정 모드 종료 (입력창 닫기)
  };

  const handleEditStart = (currentMeal: MealListResDto) => {
    setEditingDate(currentMeal.mealDate);
    reset({
      mealDate: currentMeal.mealDate,
      morning: currentMeal.morning,
      lunch: currentMeal.lunch,
      dinner: currentMeal.dinner
    });
  };

  const handleNavigationChange = (newDate: Date) => {
    const dateStr = format(newDate, 'yyyy-MM-dd');
    router.push({
      query: { ...router.query, date: dateStr }
    }, undefined, { shallow: true });
  }

  // 해당 주차의 7일 배열 생성
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(pivotDate, i));

  useEffect(() => {
    if (!router.isReady) return;

    if (date && typeof date === 'string') {
      setPivotDate(parseISO(date));
    }
  }, [router.isReady, date]);

  return (
    <>
      <Box className={styles.mealContainer}>
        {/* 주간 내비게이션 헤더 */}
        <WeekNavigation pivotDate={pivotDate} onDateChange={handleNavigationChange}/>

        {/* 식단 리스트 영역 */}
        <Stack spacing={2} className={styles.mealContents}>
          {weekDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            
            // 1. 오늘 날짜 여부 확인
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
            const isEditing = editingDate === dateStr;
            const meal: MealListResDto = meals.find(m => m.mealDate === dateStr) || { 
              id: 0,
              mealDate: dateStr,
              morning: "", 
              lunch: "", 
              dinner: "" 
            };

            return (
              <Card 
                key={dateStr} 
                variant="outlined" 
                className={classNames(styles.mealCard, { [styles.today]: isToday, [styles.editing]: isEditing })}
              >
                <Stack direction="row">
                  {/* 날짜 표시 영역 */}
                  <Box className={classNames(styles.mealCardDayContainer, { [styles.today]: isToday })}>
                    <Typography variant="caption" className={classNames(styles.mealDayNameText, { [styles.today]: isToday })}>
                      {format(date, 'eee')}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {format(date, 'd')}
                    </Typography>
                    {/* 4. '오늘' 뱃지 추가 (선택 사항) */}
                    {isToday && (
                      <Typography variant="caption" className={styles.mealTodayText}>오늘</Typography>
                    )}
                  </Box>

                  <CardContent className={styles.mealCardContent}>
                    {isEditing ? (
                      /* [수정 모드] */
                      <Stack spacing={1.5}>
                        <Controller 
                          control={control}
                          name={"morning"}
                          rules={{ maxLength: 30 }}
                          render={({ field }) => 
                            <TextField
                              { ...field } 
                              label={"아침"} 
                              variant={"standard"}
                              size={"small"} 
                              slotProps={{ htmlInput: { maxLength: 30 } }}
                              inputRef={(element) => field.ref(element)}
                              fullWidth
                              autoFocus // 수정 시작 시 첫 번째 필드에 포커스
                            />
                          }
                        />
                        <Controller 
                          control={control}
                          name={"lunch"}
                          rules={{ maxLength: 30 }}
                          render={({ field }) => 
                            <TextField
                              { ...field } 
                              label={"점심"} 
                              variant={"standard"} 
                              size={"small"} 
                              slotProps={{ htmlInput: { maxLength: 30 } }}
                              inputRef={(element) => field.ref(element)}
                              fullWidth
                            />
                          }
                        />
                        <Controller 
                          control={control}
                          name={"dinner"}
                          rules={{ maxLength: 30 }}
                          render={({ field }) => 
                            <TextField 
                              { ...field }
                              label={"저녁"}
                              variant={"standard"}
                              size={"small"}
                              slotProps={{ htmlInput: { maxLength: 30 } }}
                              inputRef={(element) => field.ref(element)}
                              fullWidth
                            />
                          }
                        />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" onClick={handleCancel} className={styles.mealCancelButton}>취소</Button>
                          <Button size="small" variant="contained" onClick={() => handleSave()}>저장</Button>
                        </Stack>
                      </Stack>
                    ) : (
                      /* [보기 모드] */
                      <Box 
                        onClick={() => handleEditStart(meal)} 
                        className={styles.mealContentContainer}
                      >
                        <Typography variant="body2" className={styles.mealIconTextContainer}>
                          <Box component="span" className={styles.mealIcon}>☀️</Box> 
                          {meal.morning || <Box component="span" className={styles.mealText}>아침 식단 비어있음</Box>}
                        </Typography>
                        <Typography variant="body2" className={styles.mealIconTextContainer}>
                          <Box component="span" className={styles.mealIcon}>🍴</Box> 
                          {meal.lunch || <Box component="span" className={styles.mealText}>점심 식단 비어있음</Box>}
                        </Typography>
                        <Typography variant="body2" className={classNames(styles.mealIconTextContainer, styles.last)}>
                          <Box component="span" className={styles.mealIcon}>🌙</Box> 
                          {meal.dinner || <Box component="span" className={styles.mealText}>저녁 식단 비어있음</Box>}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Stack>
              </Card>
            );
          })}
        </Stack>
        {/* 🌟 MUI Fab를 이용한 우측 하단 고정 플로팅 버튼 */}
        <Fab
          component={Link}
          href="/" 
          color="primary"
          className={styles.recipeFloatingButton}
        >
          레시피
        </Fab>
      </Box>
      <Loading open={isMealReading || isCreateLoading} />
      <ToastContainer position={"top-center"} />
    </>
  )
}

export default Meal