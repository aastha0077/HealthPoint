import type React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiClient } from "@/apis/apis";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useEffect } from "react";

function SignupForm() {

  const navigate = useNavigate()

  const auth = useAuth()

  useEffect(function () {
    if (auth?.token) {
      navigate('/')
    }
  })

  const inputStyle = {
    width: "375px",
  };

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formValues = {
      email: String(formData.get("email") || ""),
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      district: String(formData.get("district") || ""),
      municipality: String(formData.get("municipality") || ""),
      wardNo: String(formData.get("wardNo") || ""),
      contactNumber: String(formData.get("contactNumber") || ""),
      password: formData.get("password")
    };

    try {
      const res = await apiClient.post('/api/auth/signup', formValues);
      if (res.status == 201) {
        alert("Signup successfull")
        navigate("/login")
        return
      }

      alert("User with this email already exists")
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  }
  return (
    <div className="flex justify-center mt-5 ">
      <form
        onSubmit={submitForm}
        className="flex flex-col justify-center items-center gap-y-6  w-1/3 p-10  border-2 border-red-200  rounded-lg"
      >
        <h1>Welcome to PLU</h1>
        <Input
          name={"email"}
          style={inputStyle}
          placeholder="Enter your email"
        ></Input>
        <Input
          name="firstName"
          style={inputStyle}
          placeholder="Enter your firstname"
        ></Input>
        <Input
          name="lastName"
          style={inputStyle}
          placeholder="Enter your lastname"
        ></Input>
        <Input
          name="district"
          style={inputStyle}
          placeholder="Enter your district"
        ></Input>
        <Input
          name="municipality"
          style={inputStyle}
          placeholder="Enter your Municipality"
        ></Input>
        <Input
          name="wardNo"
          inputMode="numeric"
          style={inputStyle}
          placeholder="Enter your ward no"
        ></Input>

        <Input
          name="contactNumber"
          inputMode="text"
          style={inputStyle}
          placeholder="Enter your contact no"
        ></Input>

        <Input
          name="password"
          style={inputStyle}
          placeholder="Enter  password"
        ></Input>
        <Button style={inputStyle}>Signup</Button>
      </form>
    </div>
  );
}

export { SignupForm };
