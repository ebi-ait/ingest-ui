import {systemEnvironment} from "./system-environment";

declare let ENV_VARS: {[key: string]: string};

export const System = Object.assign(systemEnvironment, ENV_VARS);
