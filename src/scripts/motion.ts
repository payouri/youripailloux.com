import { runIntro } from "./intro";
import { initReveals } from "./reveal";

// Plain page load, no router: initialise once, here.
runIntro().then(initReveals);
