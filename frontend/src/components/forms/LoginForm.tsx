export default function LoginForm() {
  return (
    <>
      <div>
        <div className="flex flex-col">
          <p className="bg-red-500">Public Limitd United Hospital</p>
          <p className="bg-amber-500">Enter your credenatils for login</p>
          <div className="bg-amber-500">
            <input type="email" placeholder="Enter your email" />
          </div>
          <div className="bg-amber-500">
            <input type="password" placeholder="Enter your password" />
          </div>
          <button className="bg-amber-500">Login</button>
          <p className="bg-black">
            Doesnot have an account? <link href="/signup"></link>
          </p>
        </div>
      </div>
    </>
  );
}
