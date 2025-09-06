import FileProgressing from "@/components/FileProgressing"
import Loading from "@/components/Loading"
import { CategoryListResDto } from "@/dtos/CategoryDto"
import { EmptyDto } from "@/dtos/CommonDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { ErrorCode } from "@/errors/ErrorCode"
import { RecipeCreateForm } from "@/forms/RecipeForm"
import { ErrorRes, useGetQueryEx, usePostQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/recipe/Create.module.css"
import { Box, Button, InputBase, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material"
import { AxiosProgressEvent } from "axios"
import Image from "next/image"
import { useRouter } from "next/router"
import { ChangeEvent, useCallback, useState } from "react"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form"
import { toast, ToastContainer } from "react-toastify"

const Create = () => {
  // router
  const router = useRouter()

  // states
  const [picturePreview, setPicturePreview] = useState("")
  const [fileUploadEnable, setFileUploadEnabled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressOpen, setProgressOpen] = useState(false)
  

  // query
  const onRecipeCreateSuccess = () => {
    toast.success(
      "저장 되었습니다.",
      { onClose: () => router.back(), autoClose: 500 }
    )
  }

  const onRecipeCreateError = useCallback((error: ErrorRes) => {
    if (error.errorCode === ErrorCode.UPLOAD_SIZE_ERROR) {
      toast.error(error.message, { autoClose: 1000 })
    } else if (error.errorCode === ErrorCode.NOT_VALID_ERROR) {
      toast.error(error.message, { autoClose: 1000})
    } else {
      alert("Not implement : " + error.errorCode)
    }
  }, [])

  const onRecipeProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setProgress(percent)
    }
  }

  const { data: categoryData, isLoading: isCategoryReading } = useGetQueryEx<CategoryListResDto[]>({
    queryKey: QueryKeyEnum.READ_CATEGORY_LIST,
    url: "/api/v1/recipe/category/list"
  })

  const { mutate, isLoading: isCreateLoading } = usePostQueryEx<RecipeCreateForm, EmptyDto>({
    url: "/api/v1/recipe/create",
    contentType: "multipart/form-data",
    onSuccess: onRecipeCreateSuccess,
    onError: onRecipeCreateError,
    onProgress: onRecipeProgress
  })

  // forms
  const { control, handleSubmit, setValue, getValues } = useForm<RecipeCreateForm>({
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

  const onCreateSubmit: SubmitHandler<RecipeCreateForm> = (formData) => {
    if (confirm("저장 하시겠습니까?")) {
      if (formData.picture)  {
          setFileUploadEnabled(true)
          setProgressOpen(true)
      } else {
        setFileUploadEnabled(false)
        setProgressOpen(false)
      }
      
      mutate(formData)
    }
  }

  const onCreateSubmitError: SubmitErrorHandler<RecipeCreateForm> = (errors) => {
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

  const onCategoryChange = (event: SelectChangeEvent) => {
    setValue("categoryId", event.target.value)
  }

  const onCancelClick = () => {
    router.back()
  }

  return (
    <>
      <Box className={styles.recipeCreateContainer}>
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
          <Button variant={"contained"} color={"success"} onClick={handleSubmit(onCreateSubmit, onCreateSubmitError)}>저장</Button>
          <Button variant={"contained"} className={styles.cancelButton} onClick={onCancelClick}>취소</Button>
        </Box>
      </Box>
      { fileUploadEnable ? <FileProgressing open={progressOpen} progress={progress} /> : <Loading open={isCategoryReading || isCreateLoading} /> } 
      <ToastContainer position={"top-center"}/>
    </>
  )
}

export default Create