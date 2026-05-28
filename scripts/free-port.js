const { execFileSync } = require('child_process');

const port = process.env.PORT || '5000';

let output = '';

try {
  output = execFileSync('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN'], {
    encoding: 'utf8',
  });
} catch (error) {
  console.log(`Port ${port} is already free.`);
  process.exit(0);
}

const pids = output
  .split('\n')
  .map((pid) => pid.trim())
  .filter(Boolean)
  .map(Number)
  .filter((pid) => pid && pid !== process.pid);

if (!pids.length) {
  console.log(`Port ${port} is already free.`);
  process.exit(0);
}

pids.forEach((pid) => {
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`Freed port ${port} by stopping process: ${pid}`);
  } catch (error) {
    console.warn(`Could not stop process ${pid}: ${error.message}`);
  }
});
