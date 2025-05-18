import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import KeyIcon from "@mui/icons-material/Key";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const backgrounds = [
  "/assets/image-1.jpg",
  "/assets/second-2.jpg",
  "/assets/third.jpg",
];

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000); // Change background every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(username, password);
      if (response.status === 200) {
        navigate("/");
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است");
      }
    } catch (err) {
      setError("خطایی رخ داد. لطفا دوباره تلاش کنید");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Images */}
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: currentBg === index ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "2.5rem",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          backdropFilter: "blur(10px)",
          zIndex: 2,
          transform: "translateY(0)",
          transition: "transform 0.3s ease",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "-50px",
            width: "100px",
            height: "100px",
            background: "linear-gradient(45deg, #3498db, #2980b9)",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            right: "-30px",
            width: "60px",
            height: "60px",
            background: "linear-gradient(45deg, #e74c3c, #c0392b)",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <ErrorOutlineIcon style={{ fontSize: "1.2rem" }} /> {error}
          </div>
        )}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                paddingLeft: "2.5rem",
                marginBottom: "1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                textAlign: "right",
                "&:focus": {
                  borderColor: "#3498db",
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.1)",
                },
              }}
              disabled={isLoading}
            />
            <PersonIcon
              style={{
                position: "absolute",
                left: "10px",
                top: "calc(100% - 40px)",
                transform: "translateY(-50%)",
                color: "#64748b",
                fontSize: "1.2rem",
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                paddingLeft: "2.5rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                textAlign: "right",
                "&:focus": {
                  borderColor: "#3498db",
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.1)",
                },
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "#3498db",
                },
              }}
            >
              {showPassword ? (
                <VisibilityOffIcon style={{ fontSize: "1.2rem" }} />
              ) : (
                <VisibilityIcon style={{ fontSize: "1.2rem" }} />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: isLoading ? "#93c5fd" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            fontSize: "1rem",
            fontWeight: "600",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            "&:hover": {
              backgroundColor: "#2980b9",
              transform: "translateY(-2px)",
            },
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <HourglassEmptyIcon style={{ fontSize: "1.2rem" }} /> ورود...
            </>
          ) : (
            <>
              <KeyIcon style={{ fontSize: "1.2rem" }} /> ورود
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
