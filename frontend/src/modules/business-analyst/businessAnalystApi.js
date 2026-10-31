import { createChatApi } from "../ai/services/aiChatApi";
import { readBusinessMessage } from "./contracts";

// Same authenticated HTTP, timeout, model options and error handling as Mentor;
// independent backend URLs and evidence schema. No provider key or orchestration here.
export const businessAnalystApi = createChatApi({ basePath: "/business-analyst", messageReader: readBusinessMessage });
