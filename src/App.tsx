import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { CircleButton } from "./components/circle-button/circle-button";
import { FloatWrapper } from "./components";
import { motion } from "framer-motion";

function App() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  return (
    <motion.div >
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <FloatWrapper >
        <CircleButton title={"potato"} />
      </FloatWrapper>
    </motion.div>
  );
}

export default App;
