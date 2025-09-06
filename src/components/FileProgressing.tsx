import styles from "@/styles/FileProgressing.module.css";
import { Backdrop, Box, LinearProgress, Typography } from "@mui/material";

interface FileProgressingProps {
  open: boolean;
  progress: number;
}

const FileProgressing = ({ open, progress }: FileProgressingProps) => {
  return (
    <>
      <Backdrop sx={{ zIndex: "1301"}} open={open}>
        <Box className={styles.progressContainer}>
          <Typography className={styles.titleText}>파일 업로드</Typography>
          <Box className={styles.progressBarContainer}>
            <LinearProgress 
              variant={"determinate"} 
              color={"primary"} 
              value={progress} 
              className={styles.progressBar}
            />
            <Typography className={styles.progressText}>{progress}%</Typography>
          </Box>
        </Box>
      </Backdrop>
    </>
  )
}

export default FileProgressing