import styles from '@/styles/WeekNavigation.module.css';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton, Modal, Stack, Typography } from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { addDays, format, getDay, startOfWeek } from 'date-fns';
import { useState } from "react";

interface WeekNavigationProps {
  pivotDate: Date;
  onDateChange: (date: Date) => void;
}

const WeekNavigation = ({ pivotDate, onDateChange }: WeekNavigationProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // 1. 주차 이동 함수
  const moveWeek = (amount: number) => {
    onDateChange(addDays(pivotDate, amount));
  };

  // 2. 특정 날짜 선택 시 해당 주차로 이동
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      const monday = startOfWeek(newDate, { weekStartsOn: 1 });
      onDateChange(monday);
      setIsPickerOpen(false);
    }
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" className={styles.weekNavigation}>
          {/* 이전 주 이동 */}
          <IconButton onClick={() => moveWeek(-7)}>
            <ArrowBackIosNewIcon />
          </IconButton>

          {/* 클릭 시 주차 선택 (달력) 노출 */}
          <Box onClick={() => setIsPickerOpen(!isPickerOpen)} className={styles.weekNaviTextContainer}>
            <Typography variant="h6" fontWeight={'bold'}>
              {format(pivotDate, 'yyyy년 M월')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(pivotDate, 'd일')} ~ {format(addDays(pivotDate, 6), 'd일')}
            </Typography>
          </Box>

          {/* 다음 주 이동 */}
          <IconButton onClick={() => moveWeek(7)}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Stack>

        {/* 날짜 선택 팝업 */}
        <Modal
          open={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          slotProps={{
            backdrop: {
              sx: {
                // 1. 배경을 투명하게 하되, 블러를 살짝 주면 훨씬 고급스럽습니다.
                backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                backdropFilter: 'blur(8px)', 
                transition: 'all 0.3s ease-in-out',
              }
            }
          }}
        >
          <Box className={styles.calendarPopup}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={pivotDate}
              onChange={handleDateChange}
              slotProps={{
                toolbar: { hidden: true },
                actionBar: {
                  actions: ['today'], // 'today' 버튼만 표시
                },
                // 4. 달력 내부의 날짜들 스타일 조정
                day: (ownerState) => ({
                  sx: {
                    // 일요일 (0) -> 빨간색
                    ...(getDay(ownerState.day) === 0 && {
                      color: '#d32f2f', // 또는 'error.main'
                    }),
                    // 토요일 (6) -> 파란색
                    ...(getDay(ownerState.day) === 6 && {
                      color: '#1976d2', // 또는 'primary.main'
                    }),
                    '&.MuiPickersDay-today': {
                      border: '2px solid !important', // 테두리 두께 증가
                      borderColor: '#ffeb3b !important', // 블랙 테마에서 가장 잘 보이는 노란색/골드
                      backgroundColor: 'rgba(255, 235, 59, 0.08)', // 배경에 은은한 광택
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main', // 강조색
                      '&:hover': { backgroundColor: 'primary.dark' },
                    },
                    borderRadius: '10px', // 날짜 선택 원형을 살짝 각지게 (선택사항)
                  }
                })
              }}
            />
          </Box>
        </Modal>
      </LocalizationProvider>
    </>
  )
}

export default WeekNavigation;