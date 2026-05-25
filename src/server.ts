import "./lib/error-capture";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

export default createStartHandler(defaultStreamHandler);
