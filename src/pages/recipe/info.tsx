import ExternalImage from "@/components/ExternalImage";
import Loading from "@/components/Loading";
import { RecipeInfoResDto } from "@/dtos/RecipeDto";
import { QueryKeyEnum } from "@/enums/QueryKeyEnum";
import { useGetQueryEx } from "@/queries/useQueryEx";
import styles from "@/styles/recipe/Info.module.css";
import { Box, Button, Grid, Link, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

interface InfoProps {
  id: string;
}

const Info = ({ id }: InfoProps) => {
  // router
  const router = useRouter()

  // query
  const { data, isLoading } = useGetQueryEx<RecipeInfoResDto>({
    queryKey: QueryKeyEnum.READ_RECIPE_INFO,
    url: "/api/v1/recipe/info",
    params: {
      id: id
    }
  })

  // events
  const onUpdateClick = (id : string) => {
    router.push({ pathname: "/recipe/edit", query: { id: id } })
  }
  
  useEffect(() => {
    if (id.trim().length === 0) {
      toast.error("잘못된 접근 입니다.", { autoClose: 1000, onClose: () => router.back() })
    }
  }, [id, router])

  return (
    <>
      <Box className={styles.recipeInfoContainer}>
        <Box className={styles.titleContainer}>
          <Typography className={styles.titleText}>{data?.title}</Typography>
          { data?.picture && 
            <Box>
              <ExternalImage 
                image={`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/v1/recipe/picture/preview?id=${data.picture.id}`} 
                alt={"recipe image"} 
                className={styles.picture}
              />
            </Box>
          }
        </Box>
        <Grid container>
          <Grid size={{ xs: 12, sm: 4 }} className={styles.ingredientsContainer}>
            <Typography className={styles.ingredientsTitleText}>재료</Typography>
            <Typography className={styles.ingredientsText}>{data?.ingredients}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }} className={styles.recipeContainer}>
            <Typography className={styles.recipeTitleText}>레시피</Typography>
            <Typography className={styles.recipeText}>{data?.contents}</Typography>
          </Grid>
        </Grid>
        { data?.tip &&  
          <Box className={styles.tipContainer}>
            <Typography>{data.tip}</Typography>
          </Box>
        }
        { data?.reference && 
          <Box className={styles.linkContainer}>
            <Link href={data.reference} className={styles.referenceLink}>레시피 보러 가기</Link>
          </Box>
        }
        <Box className={styles.actionContainer}>
          <Button variant={"contained"} onClick={() => onUpdateClick(id)}>수정</Button>
        </Box>
      </Box>
      <Loading open={isLoading} />
      <ToastContainer position={"top-center"} />
    </>
  )
}

export const getServerSideProps = async ({ query } : { query: { id?: string } }) => {
  const id = query.id || ""
  return { props: { id } }
}
export default Info