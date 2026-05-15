// import axios from "axios";

// const API = "http://localhost:5000/api/auth";

// export const useAuth = () => {
//   const register = async (name, email, password) => {
//     try {
//       const res = await axios.post(`${API}/register`, {
//         name,
//         email,
//         password,
//       });

//       return {
//         success: true,
//         data: res.data,
//       };
//     } catch (err) {
//       return {
//         success: false,
//         error: err.response?.data?.message || "Registration failed",
//       };
//     }
//   };

//   return { register };
// };

import api from "../api/api";

export const useAuth = () => {
  const register = async (name, email, password) => {
    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      return {
        success: true,
        data: res.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Registration failed",
      };
    }
  };

  return { register };
};
