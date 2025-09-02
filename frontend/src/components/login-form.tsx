import { apiClient } from "@/apis/apis";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function LoginForm() {
  const inputStyle = {
    width: "375px",
  };

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")
    const response = await apiClient.post('/api/auth/login', { email, password },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    console.log(response)

  }
  return (
    <div className="flex justify-center mt-20 mb-56">
      <form onSubmit={handleLogin} className="flex flex-col justify-center items-center gap-y-6  w-1/3  border-2 border-red-200 p-24 rounded-lg">
        <h1>Enter your credentials to login</h1>
        <Input name="email" style={inputStyle} placeholder="enter your email"></Input>
        <Input name="password" style={inputStyle} placeholder="enter your password"></Input>
        <Button style={{ width: "375px" }}>Login</Button>
      </form>
    </div>
  );
}
