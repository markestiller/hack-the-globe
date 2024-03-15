import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-blue-500 text-3xl font-bold underline">
      hello<h1 className="font-red-500">hi</h1>
    </div>
  );
}

export default App;
