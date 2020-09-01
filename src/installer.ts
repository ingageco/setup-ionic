import * as child from 'child_process'
import * as tc from '@actions/tool-cache'
import * as core from '@actions/core'

/**
 * Install Ionic Cli
 *
 * https://www.npmjs.com/package/@ionic/cli
 */
export async function installIonic(version?: string): Promise<void> {
  await installNpmPkg('@ionic/cli', version)

  // Fix access permissions
  await exec2(`sudo chown -R $USER:$GROUP ~/.npm`)
  await exec2(`sudo chown -R $USER:$GROUP ~/.config`)
}

/**
 * Logs installed information
 *
 */
export async function logInstalledInfo(command = 'ionic info'): Promise<void> {
  core.info('Cordova/Ionic environment has been setup successfully.')
  core.info((await exec2(command)) as string)
}

/**
 * Install NPM Package
 *
 * @param pkg     : name of package
 * @param version : version
 */
export async function installNpmPkg(
  pkg: string,
  version?: string
): Promise<void> {
  // attach cached package
  if (version) {
    const packageDir = tc.find(pkg, version)
    if (packageDir) {
      core.addPath(packageDir)
      return
    }
  }

  // install npm package
  await exec2(`sudo npm install -g ${pkg}${version ? `@${version}` : ''}`)

  let installedPath = (await exec2(`echo $(npm root -g)/${pkg}`)) as string
  if (!installedPath) {
    return
  }

  // remove linebreak in the command
  installedPath = installedPath.replace(/(\r\n|\n|\r)/gm, '')

  if (!version) {
    // installed version
    version = (await exec2(
      `node -p "require('${installedPath}/package.json').version"`
    )) as string

    // cache installed package
    const cachedPath = await tc.cacheDir(installedPath, pkg, version)
    core.addPath(cachedPath)
  }
}

async function exec2(command: string): Promise<any> {
  return new Promise((resolve, reject) => {
    child.exec(command, (err: any, stdout: any, stderr: any) => {
      if (stderr) {
        resolve(stdout)
      }

      if (err) {
        core.setFailed(JSON.stringify(err))
        reject(err)
      }

      resolve(stdout)
    })
  })
}
