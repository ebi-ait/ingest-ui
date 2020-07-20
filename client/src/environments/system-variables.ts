import {systemEnvironment} from "./system-environment";

declare let ENV_VARS: {[key: string]: string};

export const Environment = Object.assign(systemEnvironment, ENV_VARS);
