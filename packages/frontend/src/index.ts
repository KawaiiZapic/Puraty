import "./style.css";

import "mutationobserver-shim";
import vc from "vconsole";
import Navigo from "navigo";
import main from "./pages/main";

const AppHome = document.getElementById("app")!;
const router = new Navigo("/", {
  hash: true
});

router.on("/", () => {
  AppHome.innerHTML = "";
  AppHome.appendChild(main());
});

router.navigate("/");

if (import.meta.env.MODE !== "production") {
  new vc();
}