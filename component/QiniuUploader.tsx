"use client";

import React, { useState, useRef } from "react";

interface UploadResponse {
  key: string;
  hash: string;
  fsize: number;
  bucket: string;
  name: string;
  url: string;
}

interface QiniuUploaderProps {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
  onProgress?: (percent: number) => void;
  accept?: string;
  maxSize?: number; // 单位：MB
  chunkSize?: number; // 分片大小，单位：MB，默认4MB
  className?: string;
  children?: React.ReactNode;
}

/**
 * 七牛云文件上传组件
 * 支持单文件上传和大文件分片上传
 */
export default function QiniuUploader({
  onSuccess,
  onError,
  onProgress,
  accept,
  maxSize = 100, // 默认最大100MB
  chunkSize = 4, // 默认4MB分片
  className = "",
  children,
}: QiniuUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 上传进度，0-100
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 点击上传按钮
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      const error = new Error(`文件大小不能超过 ${maxSize}MB`);
      onError?.(error);
      return;
    }

    // 根据文件大小选择上传方式
    const chunkSizeBytes = chunkSize * 1024 * 1024;
    if (file.size > chunkSizeBytes) {
      await uploadLargeFile(file);
    } else {
      await uploadSingleFile(file);
    }

    // 清空input，允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * 单文件直传
   */
  const uploadSingleFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      // 获取上传凭证
      //fetch是浏览器提供的API，用于发起HTTP请求。它返回一个Promise，当请求完成时，会解析为Response对象。
      const tokenRes = await fetch("/api/upload/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `${Date.now()}-${file.name}`,
        }),
      });

      if (!tokenRes.ok) {
        throw new Error("获取上传凭证失败");
      }

      const { token, key, domain, uploadUrl } = await tokenRes.json();

      // 创建FormData
      const formData = new FormData();
      //append方法用于添加一个键值对到FormData对象中。
      formData.append("key", key);
      formData.append("token", token);
      formData.append("file", file);
      formData.append("x:name", file.name);

      // 创建AbortController用于取消上传
      abortControllerRef.current = new AbortController();

      // 使用XMLHttpRequest以支持进度监听
      const xhr = new XMLHttpRequest();

      // 监听上传进度
      xhr.upload.addEventListener("progress", (e) => {
        //lengthComputable属性用于检查上传进度是否可计算。如果为true，则可以根据e.loaded和e.total计算上传进度。
        //Math.round方法用于将浮点数四舍五入为最接近的整数。
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
          //调用onProgress回调函数，将上传进度percent作为参数传递。
          onProgress?.(percent);
        }
      });

      // 创建Promise包装XMLHttpRequest
      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              ...response,
              url: `${domain}/${response.key}`,
            });
          } else {
            reject(new Error(`上传失败: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("上传失败"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("上传已取消"));
        });
        //open方法用于初始化一个请求。它接受三个参数：请求方法、请求URL和是否异步。默认是异步。同步上传需要将第三个参数设为false。
        xhr.open("POST", uploadUrl);
        //send方法用于发送请求。它接受一个参数：请求体。如果是GET请求，请求体可以为空。
        xhr.send(formData);
      });

      // 支持取消上传
      abortControllerRef.current.signal.addEventListener("abort", () => {
        xhr.abort();
      });

      const response = await uploadPromise;
      //调用onSuccess回调函数，将上传成功的响应response作为参数传递。
      onSuccess?.(response);
    } catch (error) {
      console.error("上传失败:", error);
      onError?.(error as Error);
    } finally {
      setUploading(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  };

  /**
   * 大文件分片上传
   */
  const uploadLargeFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      // 获取上传凭证
      const tokenRes = await fetch("/api/upload/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `${Date.now()}-${file.name}`,
        }),
      });

      if (!tokenRes.ok) {
        throw new Error("获取上传凭证失败");
      }

      const { token, key, domain, uploadUrl } = await tokenRes.json();

      // 初始化分片上传
      const chunkSizeBytes = chunkSize * 1024 * 1024;
      //chunks变量用于存储文件总共有多少个分片。Math.ceil方法用于将浮点数向上取整为最接近的整数。
      const chunks = Math.ceil(file.size / chunkSizeBytes);
      const uploadedChunks: string[] = [];

      abortControllerRef.current = new AbortController();

      // 上传每个分片
      for (let i = 0; i < chunks; i++) {
        if (abortControllerRef.current.signal.aborted) {
          throw new Error("上传已取消");
        }

        const start = i * chunkSizeBytes;
        //end变量用于存储当前分片的结束位置。Math.min方法用于返回多个参数中的最小值。这里用于确保不超过文件总大小。
        const end = Math.min(start + chunkSizeBytes, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("token", token);
        formData.append("key", key);
        formData.append("chunk", chunk);
        //chunk_index参数用于指定当前分片的索引。
        formData.append("chunk_index", i.toString());
        formData.append("total_chunks", chunks.toString());

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`分片 ${i + 1} 上传失败`);
        }

        const result = await response.json();
        //ctx参数用于存储当前分片的上传上下文。后续合并分片时需要用到这些上下文。
        uploadedChunks.push(result.ctx);

        // 更新进度
        const percent = Math.round(((i + 1) / chunks) * 100);
        setProgress(percent);
        onProgress?.(percent);
      }

      // 合并分片
      const mergeRes = await fetch(
        uploadUrl + "/mkfile/" + file.size + "/key/" + btoa(key),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            Authorization: `UpToken ${token}`,
          },
          body: uploadedChunks.join(","),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!mergeRes.ok) {
        throw new Error("合并分片失败");
      }

      const result = await mergeRes.json();
      const response: UploadResponse = {
        ...result,
        url: `${domain}/${result.key}`,
      };

      onSuccess?.(response);
    } catch (error) {
      console.error("上传失败:", error);
      onError?.(error as Error);
    } finally {
      setUploading(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  };

  // 取消上传
  const cancelUpload = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {children ? (
        <div onClick={handleClick}>{children}</div>
      ) : (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "上传中..." : "选择文件"}
        </button>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">上传进度: {progress}%</span>
            <button
              onClick={cancelUpload}
              className="text-sm text-red-500 hover:text-red-700"
            >
              取消
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
