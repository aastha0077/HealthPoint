import type React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiClient } from "@/apis/apis";

function SignupForm() {
  const inputStyle = {
    width: "375px",
  };

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    try{
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const formValues = {
            email: formData.get("email"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            district: formData.get("district"),
            municipality: formData.get("municipality"),
            wardNo: formData.get("wardNo"),
      };
       const result = await apiClient.post('/auth/signup',formValues)
       console.log(result)
       alert("singup successfull")
    }catch(error){
      console.log(error)
      alert("Error occured")
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
          name="confirmPassword"
          style={inputStyle}
          placeholder="Enter  password"
        ></Input>
        <Button style={inputStyle}>Signup</Button>
      </form>
    </div>
  );
}

export { SignupForm };
