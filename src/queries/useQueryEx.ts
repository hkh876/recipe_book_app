import { PageDto } from "@/dtos/CommonDto";
import { QueryKeyEnum } from "@/enums/QueryKeyEnum";
import { ErrorCode } from "@/errors/ErrorCode";
import { axiosDelete, axiosGet, axiosPost, axiosPut } from "@/queries/axiosEx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosProgressEvent, isAxiosError } from "axios";
import { useEffect } from "react";

interface ErrorRes {
  errorCode: string;
  message: string;
}

interface UseGetQueryExProps {
  queryKey: QueryKeyEnum;
  url: string;
  params?: Record<string, string>|PageDto;
  enabled?: boolean;
  onError?: (resData: ErrorRes) => void;
}

interface UsePostQueryExProps<U> {
  url: string;
  contentType?: string;
  onSuccess?: (resData: U) => void;
  onError?: (resData: ErrorRes) => void;
  onProgress?: (progressEvent: AxiosProgressEvent) => void;
}

interface UsePutQueryExProps<U> {
  url: string;
  contentType?: string;
  onSuccess?: (resData: U) => void;
  onError?: (resData: ErrorRes) => void;
  onProgress?: (progressEvent: AxiosProgressEvent) => void;
}

interface UseDeleteQueryExProps<U> {
  url: string;
  onSuccess?: (resData: U) => void;
  onError?: (resData: ErrorRes) => void;
}

const useGetQueryEx = <T>({ queryKey, url, params, enabled = true, onError }: UseGetQueryExProps) => {
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => axiosGet<T>({ url: url, params: params }),
    retry: false,
    enabled: enabled
  })

  // To Do : 오류 핸들링
  useEffect(() => {
    if (isAxiosError(error)) {
      console.error(`code : ${error.code}, message: ${error.message}`)
      console.error(error.response?.data)

      if (error.code === ErrorCode.ERR_NETWORK) {
        alert("네트워크 연결 실패")
      } else if (onError) {
        onError(error.response?.data)
      }
    }
  }, [error, onError])

  return { data, isLoading, refetch }
}

const usePostQueryEx = <T, U>({ url, contentType, onSuccess, onError, onProgress }: UsePostQueryExProps<U>) => {
  const { mutate, error, status } = useMutation({
    mutationFn: (reqData: T) => axiosPost<T, U>({ 
      url: url, 
      contentType: contentType, 
      reqData: reqData, 
      onProgress: onProgress 
    }),
    onSuccess: (data: U) => onSuccess && onSuccess(data),
    retry: false
  })

  // To Do : 오류 핸들링
  useEffect(() => {
    if (isAxiosError(error)) {
      console.error(`code : ${error.code}, message: ${error.message}`)
      console.error(error.response?.data)

      if (onError) {
        onError(error.response?.data)
      }
    }
  }, [error, onError])

  return { mutate, isLoading: status === "pending" }
}

const usePutQueryEx = <T, U>({ url, contentType, onSuccess, onError, onProgress }: UsePutQueryExProps<U>) => {
  const { mutate, error, status } = useMutation({
    mutationFn: (reqData: T) => axiosPut<T, U>({ 
      url: url, 
      contentType: contentType, 
      reqData: reqData, 
      onProgress: onProgress
    }),
    onSuccess: (data: U) => onSuccess && onSuccess(data),
    retry: false
  })

  // To Do : 오류 핸들링
  useEffect(() => {
    if (isAxiosError(error)) {
      console.error(`code : ${error.code}, message: ${error.message}`)
      console.error(error.response?.data)

      if (onError) {
        onError(error.response?.data)
      }
    }
  }, [error, onError])

  return { mutate, isLoading: status === "pending" }
}

const useDeleteQueryEx = <T, U>({ url, onSuccess, onError }: UseDeleteQueryExProps<U>) => {
  const { mutate, error, status } = useMutation({
    mutationFn: (params: T) => axiosDelete<T, U>({ url: url, params: params }),
    onSuccess: (data: U) => onSuccess && onSuccess(data),
    retry: false
  })

  // To Do : 오류 핸들링
  useEffect(() => {
    if (isAxiosError(error)) {
      console.error(`code : ${error.code}, message: ${error.message}`)
      console.error(error.response?.data)

      if (onError) {
        onError(error.response?.data)
      }
    }
  }, [error, onError])

  return { mutate, isLoading: status === "pending" }
}

export { useDeleteQueryEx, useGetQueryEx, usePostQueryEx, usePutQueryEx };
export type { ErrorRes };

