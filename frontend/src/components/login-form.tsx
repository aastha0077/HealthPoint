import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function LoginForm() {
  const inputStyle = {
    width: "375px",
  };
  return (
    <div className="flex justify-center mt-20 mb-56">
      <div className="flex flex-col justify-center items-center gap-y-6  w-1/3  border-2 border-red-200 p-24 rounded-lg">
        <h1>Enter your credentials to login</h1>
        <Input style={inputStyle} placeholder="enter your email"></Input>
        <Input style={inputStyle} placeholder="enter your password"></Input>
        <Button style={{ width: "375px" }}>Login</Button>
      </div>
    </div>
  );
}
