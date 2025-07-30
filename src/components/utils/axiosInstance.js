import axios from "axios";

// const baseAPI = "http://192.168.0.175:8000";
//  axios instance
export const axiosInstance = axios.create({
  baseURL: "https://wh4r7n48-8000.inc1.devtunnels.ms/",
  headers: {
    "Content-Type": "application/json",
  },
});
