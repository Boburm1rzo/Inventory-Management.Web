import axiosInstance from "./axiosInstance";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<{ url: string }>(
    "/images/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.url;
}
