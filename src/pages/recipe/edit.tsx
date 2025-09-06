import ExternalImage from "@/components/ExternalImage";
import FileProgressing from "@/components/FileProgressing";
import Loading from "@/components/Loading";
import { CategoryListResDto } from "@/dtos/CategoryDto";
import { EmptyDto } from "@/dtos/CommonDto";
import { PictureDeleteReqDto } from "@/dtos/PictureDto";
import { RecipeInfoResDto } from "@/dtos/RecipeDto";
import { QueryKeyEnum } from "@/enums/QueryKeyEnum";
import { ErrorCode } from "@/errors/ErrorCode";
import { RecipeUpdateForm } from "@/forms/RecipeForm";
import { ErrorRes, useDeleteQueryEx, useGetQueryEx, usePutQueryEx } from "@/queries/useQueryEx";
import styles from "@/styles/recipe/Edit.module.css";
import { Box, Button, InputBase, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { AxiosProgressEvent } from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { LongPressCallbackMeta, LongPressReactEvents, useLongPress } from "use-long-press";

interface EditProps {
  id: string;
}

const Edit = ({ id }: EditProps) => {
  // router
  const router = useRouter()

  // states
  const [picturePreview, setPicturePreview] = useState("")
  const [pictureId, setPictureId] = useState(0)
  const [fileUploadEnable, setFileUploadEnabled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)

  // query
  const onPictureDeleteResSuccess = () => {
    toast.success(
      "삭제 되었습니다.",
      { onClose: () => router.reload(), autoClose: 500 }
    )
  }

  const onUpdateResSuccess = () => {
    toast.success(
      "수정 되었습니다.",
      { onClose: () => router.back(), autoClose: 500 }
    )
  }

  const onUpdateResError = useCallback((error: ErrorRes) => {
    if (error.errorCode === ErrorCode.UPLOAD_SIZE_ERROR) {
      toast.error(error.message, { autoClose: 1000 })
    } else if (error.errorCode === ErrorCode.NOT_VALID_ERROR) {
      toast.error(error.message, { autoClose: 1000 })
    } else {
      console.error("Not implement : ", error.errorCode)
    }

    setProgressOpen(false)
  }, [])

  const onProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setProgress(percent)
    }
  }

  const { data: categoryData, isLoading: isCategoryReading } = useGetQueryEx<CategoryListResDto[]>({
    queryKey: QueryKeyEnum.READ_CATEGORY_LIST,
    url: "/api/v1/recipe/category/list"
  })

  const { data: recipeData, isLoading: isRecipeReading } = useGetQueryEx<RecipeInfoResDto>({
    queryKey: QueryKeyEnum.READ_RECIPE_INFO,
    url: "/api/v1/recipe/info",
    params: {
      id: id
    }
  }) 

  const { mutate: updateRecipe, isLoading: isRecipeUpdating } = usePutQueryEx<RecipeUpdateForm, EmptyDto>({
    url: "/api/v1/recipe/update",
    contentType: "multipart/form-data",
    onSuccess: onUpdateResSuccess,
    onError: onUpdateResError,
    onProgress: onProgress
  })

  const { mutate: deletePicture, isLoading: isPictureDeleting } = useDeleteQueryEx<PictureDeleteReqDto, EmptyDto>({
    url: "/api/v1/recipe/picture/delete",
    onSuccess: onPictureDeleteResSuccess
  })

  // forms
  const { control, handleSubmit, setValue, getValues } = useForm<RecipeUpdateForm>({
    defaultValues: {
      title: "",
      picture: undefined,
      categoryId: "",
      ingredients: "",
      contents: "",
      tip: "",
      reference: ""
    }
  })

  const onUpdateSubmit: SubmitHandler<RecipeUpdateForm> = (formData) => {
    if (confirm("수정 하시겠습니까?")) {
      if (formData.picture) {
        setFileUploadEnabled(true)
        setProgressOpen(true)
      } else {
        setFileUploadEnabled(false)
        setProgressOpen(false)
      }

      updateRecipe(formData)
    }
  }

  const onUpdateSubmitError: SubmitErrorHandler<RecipeUpdateForm> = (errors) => {
    if (errors.title) {
      toast.error(errors.title.message, { autoClose: 1000 })
    } else if (errors.categoryId) {
      toast.error(errors.categoryId.message, { autoClose: 1000 })
    } else if (errors.ingredients) {
      toast.error(errors.ingredients.message, { autoClose: 1000 })
    } else if (errors.contents) {
      toast.error(errors.contents.message, { autoClose: 1000 })
    }
  }

  // events
  const onCategoryChange = (event: SelectChangeEvent) => {
    setValue("categoryId", event.target.value)
  }

  const onPictureChange = async (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement
    if (target.files?.length === 1) {
      const file = target.files[0]
      setValue("picture", file)

      // preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)      
    } else {
      setPicturePreview("")
    }
  }

  const onPictureLongClick = useLongPress(() => {
    if (pictureId) {
      if (confirm("사진을 삭제 하시겠습니까?")) {
        deletePicture({id : pictureId})
      }
    }
  }, {
    onStart: (_: LongPressReactEvents<Element>, meta: LongPressCallbackMeta<unknown>) => setPictureId(meta.context as number),
    threshold: 500,
    captureEvent: true
  })

  const onCancelClick = () => {
    router.back()
  }

  // values
  const pictureUrl = recipeData?.picture?.id ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/v1/recipe/picture/preview?id=${recipeData.picture.id}` : ""

  useEffect(() => {
    if (id.trim().length === 0) {
      toast.error("잘못된 접근 입니다.", { autoClose: 1000, onClose: () => router.back() })
    }
  }, [id, router])

  useEffect(() => {
    if (recipeData) {
      setValue("id", recipeData.id)
      setValue("title", recipeData.title)
      setValue("ingredients", recipeData.ingredients)
      setValue("contents", recipeData.contents)
      setValue("tip", recipeData.tip)
      setValue("reference", recipeData.reference)
      setValue("categoryId", recipeData.category ? recipeData.category.id.toString() : "0")
    }
  }, [recipeData, setValue])

  return (
    <>
      <Box className={styles.recipeUpdateContainer}>
        <Box className={styles.titleInputContainer}>
          <Controller 
            control={control}
            name={"title"}
            rules={{ 
              required: "제목을 입력해 주세요.", maxLength: 30,
              validate: {
                noWhiteSpace: (value) => value.trim() !== "" || "제목을 입력해 주세요."
              }
            }}
            render={({ field }) => 
              <TextField 
                { ...field }
                label={"제목"}
                variant={"outlined"}
                size={"small"}
                slotProps={{ htmlInput: { maxLength: 30 } }}
                inputRef={(element) => field.ref(element)}
                fullWidth
              />
            }
          /> 
          <Box className={styles.pictureContainer}>
            { pictureUrl ? (
              <Box {...onPictureLongClick(recipeData?.picture?.id)}>
                <ExternalImage 
                  image={pictureUrl} 
                  alt={"picture image"}
                  width={"fit-content"}
                />
              </Box>
            ) : (
              <>
                <InputBase 
                  type={"file"}
                  inputProps={{ accept: "image/*" }}
                  onChange={onPictureChange}
                />
                { picturePreview && (
                  <Box className={styles.previewContainer}>
                    <Image 
                      src={picturePreview} 
                      alt={"picture preview"}                
                      layout={"fill"}
                      unoptimized
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
        <Box className={styles.contentsInputContainer}>
          <Box className={styles.categoryContainer}>
            <Typography>카테고리 : </Typography>
            <Controller 
              control={control}
              name={"categoryId"}
              rules={{ required: "카테고리를 선택해 주세요." }}
              render={({ field }) => 
                <Select 
                  { ...field }
                  variant={"outlined"}
                  size={"small"}
                  value={getValues("categoryId")} 
                  onChange={onCategoryChange}
                >
                  { categoryData && categoryData.length > 0 && (
                    categoryData.map((category) => <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              }
            />
          </Box>
          <Controller 
            control={control}
            name={"ingredients"}
            rules={{
              required: "재료를 입력해 주세요.",
              validate: {
                noWhiteSpace: (value) => value.trim() !== "" || "재료를 입력해 주세요."
              }
            }}
            render={({ field }) => 
              <TextField 
                { ...field }
                label={"재료"}
                variant={"outlined"}
                size={"small"}
                rows={5}
                inputRef={(element) => field.ref(element)}
                multiline
                fullWidth
              />
            }
          />
          <Controller 
            control={control}
            name={"contents"}
            rules={{
              required: "레시피를 입력해 주세요.",
              validate: {
                noWhiteSpace: (value) => value.trim() !== "" || "레시피를 입력해 주세요."
              }
            }}
            render={({ field }) => 
              <TextField 
                { ...field }
                label={"레시피"}
                variant={"outlined"}
                size={"small"}
                rows={10}
                inputRef={(element) => field.ref(element)}
                multiline
                fullWidth
              />
            }
          />
          <Controller 
            control={control}
            name={"tip"}
            render={({ field }) => 
              <TextField 
                { ...field }
                label={"Tip"}
                variant={"outlined"}
                size={"small"}
                rows={3}
                inputRef={(element) => field.ref(element)}
                multiline
                fullWidth
              />
            }
          />
          <Controller 
            control={control}
            name={"reference"}
            rules={{ maxLength: 100 }}
            render={({ field }) => 
              <TextField 
                { ...field }
                label={"참조 링크"}
                variant={"outlined"}
                size={"small"}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                inputRef={(element) => field.ref(element)}
                fullWidth
              />
            }
          />
        </Box>
        <Box className={styles.actionContainer}>
          <Button variant={"contained"} color={"success"} onClick={handleSubmit(onUpdateSubmit, onUpdateSubmitError)}>수정</Button>
          <Button variant={"contained"} className={styles.cancelButton} onClick={onCancelClick}>취소</Button>
        </Box>
      </Box>
      { fileUploadEnable ? <FileProgressing open={progressOpen} progress={progress} /> 
        : <Loading open={isCategoryReading || isRecipeReading || isRecipeUpdating || isPictureDeleting} /> }
      <ToastContainer position={"top-center"} />
    </>
  )
}

export const getServerSideProps = async ({ query } : { query: { id?: string } }) => {
  const id = query.id || ""
  return { props: { id } }
}
export default Edit