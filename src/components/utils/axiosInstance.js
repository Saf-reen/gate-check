import axios from "axios";

const baseAPI = "https://gate-check.onrender.com";
// const baseAPI = "https://wh4r7n48-8000.inc1.devtunnels.ms/";
//  axios instance
export const axiosInstance = axios.create({
  baseURL: baseAPI,
  headers: {
    "Content-Type": "application/json",
  },
});
