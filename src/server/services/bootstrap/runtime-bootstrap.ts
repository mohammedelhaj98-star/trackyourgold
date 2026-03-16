import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type BootstrapStep = {
  label: string;
  command: string;
  args: string[];
  stdout: string;
  stderr: string;
};

function binPath(name: "prisma" | "tsx") {
  const suffix = process.platform === "win32" ? ".cmd" : "";
  return path.join(process.cwd(), "node_modules", ".bin", `${name}${suffix}`);
}

async function runStep(label: string, command: string, args: string[]): Promise<BootstrapStep> {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: process.cwd(),
    shell: process.platform === "win32",
    env: process.env,
    timeout: 5 * 60 * 1000,
    maxBuffer: 1024 * 1024 * 10
  });

  return {
    label,
    command,
    args,
    stdout: stdout.trim(),
    stderr: stderr.trim()
  };
}

export async function runRuntimeBootstrap() {
  const cwd = process.cwd();
  const seedScript = path.join(cwd, "prisma", "seed.ts");

  const steps = [
    await runStep("db-push", binPath("prisma"), ["db", "push", "--skip-generate"]),
    await runStep("db-seed", binPath("tsx"), [seedScript])
  ];

  return {
    ok: true,
    cwd,
    steps
  };
}
