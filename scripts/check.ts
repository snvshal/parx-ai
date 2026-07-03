import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  boldGreen: "\x1b[1m\x1b[32m",
  boldRed: "\x1b[1m\x1b[31m",
}

interface Check {
  name: string
  command: string
}

interface CheckResult {
  name: string
  status: "PASSED" | "FAILED"
  icon: string
  stdout: string
  stderr: string
}

const checks: Check[] = [
  {
    name: "TypeScript Type Verification",
    command: "bun x tsc --noEmit",
  },
  {
    name: "Prettier Code Formatting Check",
    command: "bun run format:check",
  },
  {
    name: "ESLint Code Quality Scan",
    command: "bun run lint",
  },
  {
    name: "Next.js Production Build Validation",
    command: "bun run build",
  },
]

console.log(
  `${colors.cyan}[RUN]${colors.reset} Running Project Validation Checks in Parallel...\n`,
)

async function runChecks() {
  const promises: Promise<CheckResult>[] = checks.map(async (check) => {
    try {
      const { stdout, stderr } = await execPromise(check.command)
      return {
        name: check.name,
        status: "PASSED" as const,
        icon: `${colors.green}[PASS]${colors.reset}`,
        stdout: stdout || "",
        stderr: stderr || "",
      }
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string }
      return {
        name: check.name,
        status: "FAILED" as const,
        icon: `${colors.red}[FAIL]${colors.reset}`,
        stdout: err.stdout || "",
        stderr: err.stderr || "",
      }
    }
  })

  const results = await Promise.all(promises)
  let overallFailed = false

  for (const res of results) {
    if (res.status === "FAILED") {
      overallFailed = true
      console.log(`--------------------------------------------------`)
      console.log(`${colors.red}[FAIL]${colors.reset} ${res.name}`)
      console.log(`--------------------------------------------------`)
      if (res.stdout) console.log(res.stdout.trim())
      if (res.stderr) console.error(res.stderr.trim())
      console.log("\n")
    }
  }

  console.log(`==================================================`)
  console.log(`SUMMARY:\n`)
  for (const res of results) {
    console.log(`${res.icon} ${res.name}`)
  }
  console.log(`==================================================`)

  if (overallFailed) {
    console.log(
      `\n${colors.boldRed}[ERROR]${colors.reset} Validation failed. Please fix the errors listed above before committing.\n`,
    )
    process.exit(1)
  } else {
    console.log(
      `\n${colors.boldGreen}[SUCCESS]${colors.reset} All checks passed! The codebase is ready and healthy.\n`,
    )
  }
}

runChecks()
