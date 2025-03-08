import { NavLink, Route, Routes } from "react-router-dom";
import RecordFive from "./components/share/RecordFive";
import RecordOne from "./components/share/Recordone";
import RecordThree from "./components/share/RecordThree";

export default function Home() {
  return (
    <>
      <ul className="flex py-2 gap-[20px] justify-center mt-2">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-blue-500 font-bold" : "text-black"
            }
          >
            Page 1
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/page-2"
            className={({ isActive }) =>
              isActive ? "text-blue-500 font-bold" : "text-black"
            }
          >
            Page 2
          </NavLink>
        </li>
        {/* <li>
          <NavLink
            to="/page-3"
            className={({ isActive }) =>
              isActive ? "text-blue-500 font-bold" : "text-black"
            }
          >
            Page 3
          </NavLink>
        </li> */}
      </ul>
      <Routes>
        <Route path="/" element={<RecordThree />} />
        <Route path="/page-2" element={<RecordOne />} />
        <Route path="/page-3" element={<RecordFive />} />
      </Routes>
    </>
  );
}
