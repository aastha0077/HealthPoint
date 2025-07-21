import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./routes/userRoutes";
import Header from "./components/layout/Header";
function App() {
  return (
    <>
      <Header></Header>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
