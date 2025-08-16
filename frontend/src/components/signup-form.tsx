import { Button } from "./ui/button";
import { Input } from "./ui/input";

function SignupForm() {
  const inputStyle = {
    width: "375px",
  };
  return (
    <div className="flex justify-center mt-7 ">
      <div className="flex flex-col justify-center items-center gap-y-6  w-1/3 p-24  border-2 border-red-100 ">
        <Input style={inputStyle} placeholder="enter your email"></Input>
        <Input style={inputStyle} placeholder="enter your firstname"></Input>
        <Input style={inputStyle} placeholder="enter your lastname"></Input>
        <Input style={inputStyle} placeholder="enter your password"></Input>
        <Input style={inputStyle} placeholder="confirm password"></Input>
        <Button style={inputStyle}>Singup</Button>
      </div>
    </div>
  );
}

export { SignupForm };
