import Loading from "@/components/Loading"
import { CategoryDeleteReqDto, CategoryListResDto } from "@/dtos/CategoryDto"
import { EmptyDto } from "@/dtos/CommonDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { ErrorCode } from "@/errors/ErrorCode"
import { CategoryCreateForm } from "@/forms/CategoryForm"
import { ErrorRes, useDeleteQueryEx, useGetQueryEx, usePostQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/Home.module.css"
import AddIcon from "@mui/icons-material/Add"
import SearchIcon from "@mui/icons-material/Search"
import { Box, Grid, IconButton, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form"
import { toast, ToastContainer } from "react-toastify"
import { LongPressCallbackMeta, LongPressReactEvents, useLongPress } from "use-long-press"

const Home = () => {
  // router
  const router = useRouter()

  // states
  const [categoryId, setCategoryId] = useState(0)

  // query
  const onCategoryCreateResSuccess = () => {
    toast.success(
      "생성 되었습니다.",
      { onClose: () => router.reload(), autoClose: 500 }
    )
  }

  const onCategoryCreateResError = useCallback((error: ErrorRes) => {
    if (error.errorCode === ErrorCode.NOT_VALID_ERROR) {
      toast.error(error.message, { autoClose: 1000 })
    } else {
      alert("Not implement : " + error.errorCode)
    }
  }, [])

  const onCategoryDeleteResSuccess = () => {
    toast.error(
      "삭제 되었습니다.",
      { onClose: () => router.reload(), autoClose: 500 }
    )
  }

  const onCategoryDeleteResError = useCallback((error: ErrorRes) => {
    if (error.errorCode === ErrorCode.CATEGORY_DELETE_ERROR) {
      toast.error(error.message, { autoClose: 1000 })
    } else {
      alert("Not implement : " + error.errorCode)
    }
  }, [])

  const { mutate: createCategory, isLoading: isCategoryCreating } = usePostQueryEx<CategoryCreateForm, EmptyDto>({
    url: "/api/v1/recipe/category/create",
    onSuccess: onCategoryCreateResSuccess,
    onError: onCategoryCreateResError
  })

  const { mutate: deleteCategory, isLoading: isCategoryDeleting } = useDeleteQueryEx<CategoryDeleteReqDto, EmptyDto>({
    url: "/api/v1/recipe/category/delete",
    onSuccess: onCategoryDeleteResSuccess,
    onError: onCategoryDeleteResError
  })

  const { data, isLoading: isCategoryReading } = useGetQueryEx<CategoryListResDto[]>({
    queryKey: QueryKeyEnum.READ_CATEGORY_LIST,
    url: "/api/v1/recipe/category/list",
  })

  // forms
  const { control, handleSubmit } = useForm<CategoryCreateForm>({
    defaultValues: {
      name: ""
    }
  })

  const onCategoryCreateSubmit: SubmitHandler<CategoryCreateForm> = (formData) => {
    if (confirm(`카테고리 "${formData.name}" 를 생성 하시겠습니까?`)) {
      createCategory(formData)
    }
  }

  const onCategoryCreateSubmitError: SubmitErrorHandler<CategoryCreateForm> = (errors) => {
    if (errors.name) {
      toast.error(errors.name.message, { autoClose: 1000 })
    }
  }

  // events
  const onSearchClick = () => {
    router.push({ pathname: "/recipe/list" })
  }

  const onCategoryClick = (name: string) => {
    router.push({ pathname: "/recipe/list", query: { searchType: name }})
  }

  const onCategoryLongClick = useLongPress(() => {
    if (categoryId) {
      if (confirm("카테고리를 삭제 하시겠습니까?")) {
        deleteCategory({ id: categoryId })
      }
    }
  }, {
    onStart: (_: LongPressReactEvents<Element>, meta: LongPressCallbackMeta<unknown>) => setCategoryId(meta.context as number),
    threshold: 500,
    captureEvent: true
  })

  return (
    <>
      <Box className={styles.homeContainer}>
        <Typography className={styles.titleText}>레시피북</Typography>
        <Box>
          <Box className={styles.actionContainer}>
            <Controller 
              control={control}
              name={"name"}
              rules={{
                required: "카테고리 명을 입력해 주세요.", maxLength: 20,
                validate: {
                  noWhiteSpace: (value) => value.trim() !== "" || "카테고리 명을 입력해 주세요."
                }
              }}
              render={({ field }) => 
                <TextField 
                  { ...field }
                  label={"카테고리"}
                  variant={"outlined"}
                  size={"small"}
                  slotProps={{ htmlInput: { maxLength: 20 } }}
                  inputRef={(element) => field.ref(element)}
                />
              }
            />
            <IconButton className={styles.iconButton} onClick={handleSubmit(onCategoryCreateSubmit, onCategoryCreateSubmitError)}>
              <AddIcon />
            </IconButton>
            <IconButton className={styles.iconButton} onClick={onSearchClick}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
        { data && data.length > 0 ?
          <Grid className={styles.categoryGridContainer} spacing={1} container>
            { data.map(category => 
              <Grid size={4} className={styles.categoryGrid} key={category.id}>
                <Typography 
                  className={styles.categoryName} 
                  onClick={() => onCategoryClick(category.name)}
                  {...onCategoryLongClick(category.id)}
                >
                  {category.name}
                </Typography>
              </Grid>
            )}
          </Grid> : <Typography className={styles.categoryEmptyText}>카테고리가 존재 하지 않습니다.</Typography>
        }
      </Box>
      <Loading open={isCategoryCreating || isCategoryReading || isCategoryDeleting} />
      <ToastContainer position={"top-center"}/>
    </>
  )
}

export default Home