// import React, { useState } from "react";
// import { toast } from "react-toastify";

// const EmailVerify = () => {
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);

//   const handleChange = (event, index) => {
//     const newOtp = [...otp];
//     const value = event.target.value;

//     if (value.length === 1 && value.match(/[0-9]/)) {
//       newOtp[index] = value;
//       setOtp(newOtp);

//       if (index < otp.length - 1) {
//         document.getElementById(`otp-input-${index + 1}`).focus();
//       }
//     } else if (value === "") {
//       newOtp[index] = "";
//       setOtp(newOtp);
//     }
//   };

//   const handleKeyDown = (event, index) => {
//     if (event.key === "Backspace" && otp[index] === "") {
//       if (index > 0) {
//         document.getElementById(`otp-input-${index - 1}`).focus();
//       }
//     }
//   };

//   const handlePaste = (event) => {
//     event.preventDefault();
//     const pastedData = event.clipboardData.getData("text").trim();

//     if (pastedData.length === otp.length && /^[0-9]+$/.test(pastedData)) {
//       setOtp(pastedData.split(""));
//       document.getElementById(`otp-input-${otp.length - 1}`).focus();
//     }
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const enteredOtp = otp.join("");

//     console.log("Entered OTP:", enteredOtp);
//     toast.success("OTP verified successfully!");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
//       <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Email Verification
//           </h2>
//           <p className="text-sm text-gray-500 mt-2">
//             Enter the 6-digit code sent to your email
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="flex flex-col items-center">
//           {/* OTP Inputs */}
//           <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
//             {otp.map((value, index) => (
//               <input
//                 key={index}
//                 id={`otp-input-${index}`}
//                 type="text"
//                 maxLength={1}
//                 value={value}
//                 onChange={(e) => handleChange(e, index)}
//                 onKeyDown={(e) => handleKeyDown(e, index)}
//                 autoComplete="off"
//                 className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl
//                            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none
//                            transition-all duration-200 shadow-sm"
//               />
//             ))}
//           </div>

//           {/* Button */}
//           <button
//             type="submit"
//             className="w-full py-3 rounded-xl text-white font-semibold
//                        bg-gradient-to-r from-indigo-500 to-purple-600
//                        hover:from-indigo-600 hover:to-purple-700
//                        transition-all duration-300 shadow-lg hover:shadow-xl"
//           >
//             Verify Now →
//           </button>

//           {/* Footer hint */}
//           <p className="text-xs text-gray-400 mt-4 text-center">
//             Didn’t receive code? Try again in a few seconds.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EmailVerify;

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "./api/api"; // Assuming you have an api.js file for axios instance

const EmailVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || localStorage.getItem("verifyEmail");

  const handleChange = (event, index) => {
    const newOtp = [...otp];
    const value = event.target.value;

    if (value.length === 1 && value.match(/[0-9]/)) {
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    } else if (value === "") {
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").trim();

    if (pastedData.length === otp.length && /^[0-9]+$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      document.getElementById(`otp-input-${otp.length - 1}`).focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const enteredOtp = otp.join("");

    if (!email) {
      toast.error("Email not found. Please register again.");
      return;
    }

    if (enteredOtp.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      const res = await api.post("/api/auth/verify-email", {
        email,
        otp: enteredOtp,
      });

      toast.success(res.data.message);

      // optional cleanup
      localStorage.removeItem("verifyEmail");

      // redirect to login
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Email Verification
          </h2>

          {email && (
            <p className="text-sm text-gray-600 mt-2">
              Verifying: <span className="font-semibold">{email}</span>
            </p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((value, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoComplete="off"
                className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none
                           transition-all duration-200 shadow-sm"
              />
            ))}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold
                       bg-linear-to-r from-indigo-500 to-purple-600
                       hover:from-indigo-600 hover:to-purple-700
                       transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
          >
            Verify Now →
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            Didn’t receive code? Try registering again or check spam folder.
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
