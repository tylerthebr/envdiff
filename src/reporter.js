const chalk = require('chalk');

/**
 * Prints a human-readable colored diff report to stdout.
 * @param {Object} diff - Result from compareEnvs
 */
function printReport(diff) {
  const { baseName, targetName, missingInTarget, missingInBase, mismatched, hasDiff } = diff;

  console.log(chalk.bold(`\nComparing ${chalk.cyan(baseName)} → ${chalk.cyan(targetName)}\n`));

  if (!hasDiff) {
    console.log(chalk.green('✔ No differences found. Envs are in sync.\n'));
    return;
  }

  if (missingInTarget.length > 0) {
    console.log(chalk.red(`✖ Keys in [${baseName}] missing from [${targetName}]:`));
    for (const key of missingInTarget) {
      console.log(chalk.red(`  - ${key}`));
    }
    console.log();
  }

  if (missingInBase.length > 0) {
    console.log(chalk.yellow(`⚠ Extra keys in [${targetName}] not in [${baseName}]:`));
    for (const key of missingInBase) {
      console.log(chalk.yellow(`  + ${key}`));
    }
    console.log();
  }

  if (mismatched.length > 0) {
    console.log(chalk.magenta('~ Mismatched values:'));
    for (const entry of mismatched) {
      console.log(chalk.magenta(`  ${entry.key}:`));
      console.log(chalk.red(`    [${baseName}]: ${entry[baseName] ?? '(empty)'}`)  );
      console.log(chalk.green(`    [${targetName}]: ${entry[targetName] ?? '(empty)'}`)  );
    }
    console.log();
  }

  const total = missingInTarget.length + missingInBase.length + mismatched.length;
  console.log(chalk.bold.red(`${total} issue(s) found.\n`));
}

module.exports = { printReport };
