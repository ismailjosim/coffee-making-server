const { execFileSync } = require('child_process');

const currentPid = process.pid;
const parentPid = process.ppid;

const output = execFileSync('ps', ['-eo', 'pid=,ppid=,args='], {
  encoding: 'utf8',
});

const pids = output
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (!match) return null;

    return {
      pid: Number(match[1]),
      ppid: Number(match[2]),
      args: match[3],
    };
  })
  .filter(Boolean)
  .filter((processInfo) => {
    if (processInfo.pid === currentPid || processInfo.pid === parentPid) {
      return false;
    }

    return (
      processInfo.args.includes('nodemon index.js') ||
      processInfo.args.includes('nodemon ./index.js')
    );
  })
  .map((processInfo) => processInfo.pid);

if (!pids.length) {
  console.log('No old nodemon dev process found.');
  process.exit(0);
}

pids.forEach((pid) => {
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`Stopped old dev process: ${pid}`);
  } catch (error) {
    console.warn(`Could not stop process ${pid}: ${error.message}`);
  }
});
