import { wrap, type Remote } from "comlink";
import type { MainModule } from "./generated";
import Worker from "./worker?worker";

let TenLines: Remote<MainModule> | null = null;

const fetchTenLines: () => Promise<Remote<MainModule>> = async () => {
    return await new Promise((resolve) => {
        if (TenLines) {
            resolve(TenLines);
        }
        const worker = new Worker();
        worker.addEventListener("message", (message) => {
            if (message?.data?.ready == true) {
                TenLines = wrap(worker);
                resolve(TenLines);
            }
        });
    });
};

export default fetchTenLines;
