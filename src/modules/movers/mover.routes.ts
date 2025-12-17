import express from "express";
import moverController from "./mover.controller";

const moverRouter = express.Router();

moverRouter.get("/movers", moverController.getMovers);

export default moverRouter;