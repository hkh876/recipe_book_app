import Loading from "@/components/Loading"
import { CategoryListResDto } from "@/dtos/CategoryDto"
import { EmptyDto } from "@/dtos/CommonDto"
import { RecipeDeleteReqDto, RecipeListResDto } from "@/dtos/RecipeDto"
import { QueryKeyEnum } from "@/enums/QueryKeyEnum"
import { SearchForm } from "@/forms/CommonForms"
import { useDeleteQueryEx, useGetQueryEx } from "@/queries/useQueryEx"
import styles from "@/styles/recipe/List.module.css"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { Box, Button, Divider, IconButton, ListItem, ListItemButton, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast, ToastContainer } from "react-toastify"

interface ListProps {
  searchType: string;
  searchKeyword: string;
}

const List = ({ searchType, searchKeyword }: ListProps) => {
  // router
  const router = useRouter()

  // query
  const onDeleteResSuccess = () => {
    toast.success(
      "삭제 되었습니다.",
      { onClose: () => router.reload(), autoClose: 500 }
    )
  }

  const { data: categoryData, isLoading: isCategoryReading } = useGetQueryEx<CategoryListResDto[]>({
    queryKey: QueryKeyEnum.READ_CATEGORY_LIST,
    url: "/api/v1/recipe/category/list"
  })

  const { data: recipes, isLoading: isRecipeReading } = useGetQueryEx<RecipeListResDto[]>({
    queryKey: QueryKeyEnum.READ_RECIPE_LIST,
    url: "/api/v1/recipe/list",
    params: {
      searchType: searchType,
      searchKeyword: searchKeyword
    }
  })

  const { mutate: deleteRecipe, isLoading: isRecipeDeleting } = useDeleteQueryEx<RecipeDeleteReqDto, EmptyDto>({
    url: "/api/v1/recipe/delete",
    onSuccess: onDeleteResSuccess
  })

  // forms
  const { control, getValues, setValue } = useForm<SearchForm>({
    defaultValues: {
      searchType: "all",
      searchKeyword: ""
    }
  })

  // events
  const onSearchTypeChange = (event: SelectChangeEvent) => {
    setValue("searchType", event.target.value)
  }

  const onCreateClick = () => {
    if (categoryData && categoryData.length === 0) {
      toast.error("카테고리를 먼저 생성해 주세요.", { autoClose: 1000 })
    } else {
      router.push({ pathname: "/recipe/create" })
    }
  }

  const onSearchClick = () => {
    router.push({ query: { ...router.query, searchType: getValues("searchType"), searchKeyword: getValues("searchKeyword") } })  
  }

  const onBackClick = () => {
    router.back()
  } 

  const onItemClick = (id: number) => {
    router.push({ pathname: "/recipe/info", query: { id: id } })
  }

  const onEditClick = (id: number) => {
    router.push({ pathname: "/recipe/edit", query: { id: id } })
  }

  const onDeleteClick = (id: number) => {
    if (confirm("삭제 하시겠습니까?")) {
      deleteRecipe({id : id})
    }
  }

  useEffect(() => {
    setValue("searchKeyword", searchKeyword)
  }, [searchKeyword, setValue])

  useEffect(() => {
    if (categoryData) {
      setValue("searchType", searchType)
    }
  }, [categoryData, searchType, setValue])

  return (
    <>
      <Box className={styles.recipeContainer}>
        <Typography className={styles.titleText}>목 차</Typography>
        <Box>
          <Box className={styles.actionContainer}>
            <Button variant={"contained"} className={styles.backButton} onClick={onBackClick}>이전</Button>
          </Box>
          <Box className={styles.searchContainer}>
            <Controller 
              control={control}
              name={"searchType"}
              render={({ field }) => 
                <Select 
                  { ...field }
                  variant={"outlined"}
                  size={"small"}
                  value={getValues("searchType")} 
                  onChange={onSearchTypeChange}
                >
                  <MenuItem value="all">전체</MenuItem>
                  { categoryData && categoryData.length > 0 && (
                    categoryData.map((category) => <MenuItem value={category.name} key={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              }
            />
            <Controller 
              control={control}
              name={"searchKeyword"}
              render={({ field }) => 
                <TextField 
                  { ...field }
                  variant={"outlined"}
                  size={"small"}
                />
              }
            />
            <IconButton className={styles.searchButton} onClick={onSearchClick}>
              <SearchOutlinedIcon />
            </IconButton>
            <IconButton 
              onClick={onCreateClick} 
              className={styles.createButton}
              disabled={categoryData && categoryData.length === 0} 
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
        <Box className={styles.recipeListContainer}>
          { isRecipeReading ? <></> : recipes && recipes.length > 0 ?
            recipes.map(recipe => 
              <ListItem key={recipe.id}>
                <ListItemButton onClick={() => onItemClick(recipe.id)}>
                  <FiberManualRecordIcon className={styles.fiberIcon}/>
                  { recipe.category && 
                    <>
                      <Typography>{`[${recipe.category.name}]`}</Typography>
                      <Typography className={styles.recipeTitleText}>{recipe.title}</Typography>
                    </>
                  }
                </ListItemButton>
                <IconButton onClick={() => onEditClick(recipe.id)}>
                  <EditIcon />
                </IconButton>
                <Divider orientation={"vertical"} className={styles.divider} flexItem />
                <IconButton onClick={() => onDeleteClick(recipe.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ) : <Typography className={styles.emptyText}>레시피가 존재 하지 않습니다.</Typography>
          }
        </Box>
      </Box>
      <Loading open={isCategoryReading || isRecipeReading || isRecipeDeleting} />
      <ToastContainer position={"top-center"} />
    </>
  )
}

export const getServerSideProps = async ({ query } : { query: { searchType?: string, searchKeyword?: string } }) => {
  const searchType = query.searchType || "all"
  const searchKeyword = query.searchKeyword || ""

  return { props: { searchType, searchKeyword } }
}
export default List