

// import React, { createContext, useState, useEffect, useContext } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export const AuthContext = createContext();


// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // ✅ Check auth state on app load
//   // ✅ In context/AuthContext.jsx

//   useEffect(() => {
//     console.log("TOKEN:", localStorage.getItem("token"));
//     const initAuth = async () => {
//       try {
//         const res = await api.get("/api/auth/is-auth");

//         if (res.data.success) {
//           setUser(res.data.user);
//         } else {
//           setUser(null);
//         }
//       } catch (err) {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initAuth();
//   }, []);

//   // ✅ Login
//   const login = async (email, password) => {
//     try {
//       setError(null);

//       const res = await api.post("/api/auth/login", {
//         email,
//         password,
//       });

//       const { token, user } = res.data;

//       // ✅ Save token
//       if (token) {
//         localStorage.setItem("token", token);
//       }

//       // ✅ Set user in context
//       setUser(user);

//       return { success: true, user };
//     } catch (err) {
//       const message = err.response?.data?.message || "Login failed";
//       setError(message);
//       return { success: false, error: message };
//     }
//   };

//   // ✅ Register
//   const register = async (name, email, password) => {
//     try {
//       setError(null);

//       const res = await api.post("/api/auth/register", {
//         name,
//         email,
//         password,
//       });

//       const { token, user } = res.data;

//       if (token) {
//         localStorage.setItem("token", token);
//       }

//       setUser(user);
//       return { success: true, user };
//     } catch (err) {
//       const message = err.response?.data?.message || "Registration failed";
//       setError(message);
//       return { success: false, error: message };
//     }
//   };

//   // ✅ Logout
//   const logout = async () => {
//     try {
//       await api.post("/api/auth/logout"); // optional (if backend supports)
//     } catch (err) {
//       console.log("Logout API error:", err.message);
//     }

//     localStorage.removeItem("token");
//     setUser(null);
//     navigate("/login");
//   };

//   // ✅ Get latest user data (optional but useful)
//   const getUserData = async () => {
//     try {
//       const res = await api.get("/api/user/data");
//       if (res.data.success) {
//         setUser(res.data.user);
//       }
//     } catch (err) {
//       console.error("Failed to fetch user data");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         error,
//         login,
//         register,
//         logout,
//         getUserData,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };



import React, {
  createContext,
  useState,
  useEffect,
} from "react";

import api from "../api/api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ Check auth on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get("/api/auth/is-auth");

        if (res.data.success) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    try {
      setError(null);

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { user } = res.data;

      // ✅ No localStorage token needed anymore
      setUser(user);

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed";

      setError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  // ✅ Register
  const register = async (name, email, password) => {
    try {
      setError(null);

      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const { user } = res.data;

      setUser(user);

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Registration failed";

      setError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.log("Logout error:", err.message);
    }

    setUser(null);

    navigate("/login");
  };

  // ✅ Refresh user data
  const getUserData = async () => {
    try {
      const res = await api.get("/api/user/data");

      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.log("Failed to fetch user data");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        getUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};