import {WorkspaceRequiredError}                               from '@berry/cli';
import {CommandContext, Configuration, Project, StreamReport} from '@berry/core';
import {miscUtils}                                            from '@berry/core';
import {Command}                                              from 'clipanion';
import {inspect}                                              from 'util';

// eslint-disable-next-line arca/no-default-export
export default class RunCommand extends Command<CommandContext> {
  @Command.Path(`run`)
  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    const {workspace} = await Project.find(configuration, this.context.cwd);

    if (!workspace)
      throw new WorkspaceRequiredError(this.context.cwd);

    const report = await StreamReport.start({
      configuration,
      stdout: this.context.stdout,
    }, async report => {
      const scripts = workspace!.manifest.scripts
      const keys = miscUtils.sortMap(scripts.keys(), key => key);
      const inspectConfig = {
        breakLength: Infinity,
        colors: configuration.get(`enableColors`),
        maxArrayLength: 2,
      };

      const maxKeyLength = keys.reduce((max, key) => {
        return Math.max(max, key.length);
      }, 0);

      for (const [key, value] of scripts.entries()) {
        report.reportInfo(null, `${key.padEnd(maxKeyLength, ` `)}   ${inspect(value, inspectConfig)}`);
      }
    });

    return report.exitCode();
  }
}
