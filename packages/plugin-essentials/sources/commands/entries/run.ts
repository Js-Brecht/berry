import {CommandContext} from '@berry/core';
import {NodeFS, ppath}  from '@berry/fslib';
import {Command}        from 'clipanion';

// eslint-disable-next-line arca/no-default-export
export default class EntryCommand extends Command<CommandContext> {
  @Command.String()
  leadingArgument!: string;

  @Command.Proxy()
  args: Array<string> = [];

  async execute() {
    if (this.leadingArgument.match(/[\\\/]/)) {
      const newCwd = ppath.resolve(this.context.cwd, NodeFS.toPortablePath(this.leadingArgument));
      return await this.cli.run(this.args.slice(1), {cwd: newCwd});
    } else {
      return await this.cli.run([`run`, this.leadingArgument, ...this.args]);
    }
  }
}