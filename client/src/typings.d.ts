/* SystemJS module definition */
declare var module: NodeModule;
declare var process: Process;

interface NodeModule {
  id: string;
}

interface Process {
  env: Environment;
}

interface Environment {
  DFEATURES: string;
}

interface GlobalEnvironment {
  process: Process;
}
