import express from "express";
import moverController from "./mover.controller";

const moverRouter = express.Router();

moverRouter.get("/", moverController.getMovers);

export default moverRouter;