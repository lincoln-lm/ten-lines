import { wrap, type Remote } from "comlink";
import type { MainModule } from "./generated";
import Worker from "./worker?worker";

const fetchTestLibrary: () => Promise<Remote<MainModule>> = async () => {
    return await new Promise((resolve) => {
        const worker = new Worker();
        worker.addEventListener("message", (message) => {
            if (message?.data?.ready == true) {
                resolve(wrap(worker) as Remote<MainModule>);
            }
        });
    });
};

export default fetchTestLibrary;
