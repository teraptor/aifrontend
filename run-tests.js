#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jestCommand = 'npx jest';

console.log('Запуск тестов API...');

exec(jestCommand, { cwd: __dirname }, (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  
  if (error) {
    console.error(`Ошибка выполнения тестов: ${error.message}`);
    process.exit(1);
  }
  
  console.log('Тесты успешно завершены');
}); 