import { PageDto } from "@/dtos/CommonDto";
import axios, { AxiosProgressEvent, AxiosRequestConfig } from "axios";

interface AxiosGetProps {
  url: string;
  params?: Record<string, string>|PageDto;
}

interface AxiosPostProps<T> {
  url: string;
  contentType?: string;
  reqData: T;
  onProgress?: (progressEvent: AxiosProgressEvent) => void;
}

interface AxiosPutProps<T> {
  url: string;
  contentType?: string;
  reqData: T;
  onProgress?: (progressEvent: AxiosProgressEvent) => void;
}

interface AxiosDeleteProps<T> {
  url: string;
  params: T;
}

const axiosGet = async <T>({ url, params }: AxiosGetProps): Promise<T> => {
  const axiosConfig: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST,
    params: params
  }

  const response = await axios.get<T>(url, axiosConfig)
  return response.data
}

const axiosPost = async <T, U>({ url, contentType, reqData, onProgress }: AxiosPostProps<T>): Promise<U> => {
  const axiosConfig: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST,
    headers: {
      "Content-Type": contentType || "application/json"
    },
    onUploadProgress(progressEvent) {
      if (onProgress) {
        onProgress(progressEvent)
      }
    },
  }

  const response = await axios.post<U>(url, reqData, axiosConfig)
  return response.data
}

const axiosPut = async <T, U>({ url, contentType, reqData, onProgress }: AxiosPutProps<T>): Promise<U> => {
  const axiosConfig: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST,
    headers: {
      "Content-Type": contentType || "application/json"
    },
    onUploadProgress(progressEvent) {
      if (onProgress) {
        onProgress(progressEvent)
      }
    },
  }

  const response = await axios.put<U>(url, reqData, axiosConfig)
  return response.data
}

const axiosDelete = async <T, U>({ url, params }: AxiosDeleteProps<T>): Promise<U> => {
  const axiosConfig: AxiosRequestConfig = {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST,
    params: params
  }

  const response = await axios.delete<U>(url, axiosConfig)
  return response.data
}

export { axiosDelete, axiosGet, axiosPost, axiosPut };

