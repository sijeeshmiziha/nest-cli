import { Command, CommanderStatic } from 'commander';
import { ERROR_PREFIX, INFO_PREFIX } from '../lib/ui';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';

export class BuildCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
      .command('build [app]')
      .option('-c, --config [path]', 'Path to nest-cli configuration file.')
      .option('-p, --path [path]', 'Path to tsconfig file.')
      .option('-w, --watch', 'Run in watch mode (live-reload).')
      .option('-b, --builder [name]', 'Builder to be used (tsc, webpack, swc).')
      .option('--watchAssets', 'Watch non-ts (e.g., .graphql) files mode.')
      .option(
        '--webpack',
        'Use webpack for compilation (deprecated option, use --builder instead).',
      )
      .option('--type-check', 'Enable type checking (when SWC is used).')
      .option('--webpackPath [path]', 'Path to webpack configuration.')
      .option('--tsc', 'Use tsc for compilation.')
      .description('Build Nest application.')
      .action(async (app: string, command: Command) => {
        const options: Input[] = [];

        options.push({
          name: 'config',
          value: command.config,
        });

        const isWebpackEnabled = command.tsc ? false : command.webpack;
        options.push({ name: 'webpack', value: isWebpackEnabled });
        options.push({ name: 'watch', value: !!command.watch });
        options.push({ name: 'watchAssets', value: !!command.watchAssets });
        options.push({
          name: 'path',
          value: command.path,
        });
        options.push({
          name: 'webpackPath',
          value: command.webpackPath,
        });

        const availableBuilders = ['tsc', 'webpack', 'swc'];
        if (command.builder && !availableBuilders.includes(command.builder)) {
          console.error(
            ERROR_PREFIX +
              ` Invalid builder option: ${
                command.builder
              }. Available builders: ${availableBuilders.join(', ')}`,
          );
          return;
        }
        options.push({
          name: 'builder',
          value: command.builder,
        });

        if (command.typeCheck && command.builder !== 'swc') {
          console.warn(
            INFO_PREFIX +
              ` "typeCheck" will not have any effect when "builder" is not "swc".`,
          );
        }
        options.push({
          name: 'typeCheck',
          value: command.typeCheck,
        });

        const inputs: Input[] = [];
        inputs.push({ name: 'app', value: app });
        await this.action.handle(inputs, options);
      });
  }
}
