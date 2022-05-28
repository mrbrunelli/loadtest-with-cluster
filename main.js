import { performance } from "node:perf_hooks";
import cluster from "node:cluster";
import { cpus } from "node:os";
import express from "express";

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running.`);

    for (let i = 0; i < cpus().length; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died!`, "Forking new worker!");
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started!`);

    const app = express();

    app.get("/", (req, res) => {
        const start = performance.now();

        let count = 0;
        while (count < 100_000_000) {
            count++;
        }

        if (Math.floor(Math.random() * 10) + 1 === 5) {
            process.exit(1);
        }

        const end = performance.now();
        const duration = (end - start).toFixed(2).concat(" ms");

        const response = {
            message: "End of blocking operation",
            worker: process.pid,
            duration
        };

        console.log(response);

        res.send(response);
    });

    app.listen(3000, () => {
        console.log(`App listening on Port ${3000}`);
    });
}
