import * as core from '@actions/core'
import * as semver from 'semver'
import {
  installIonic,
  logInstalledInfo
} from './installer'

async function run(): Promise<void> {
  try {
    checkPlatform()

 

    // install ionic-cli
    const ionicVersion = core.getInput('ionic-version')
    if (checkVersion(ionicVersion)) {
      await installIonic(ionicVersion)
    }
 

    // run `ionic info`
    await logInstalledInfo()
  } catch (error) {
    core.setFailed(error.message)
  }
}

function checkPlatform(): void {
  if (process.platform !== 'linux' && process.platform !== 'darwin') {
    throw new Error(
      '@coturiv/setup-ionic only supports either Ubuntu Linux or MacOS at this time'
    )
  }
}

function checkVersion(version: string): boolean {
  if (!version || semver.valid(version) || semver.validRange(version)) {
    return true
  }

  throw new Error(`Error, ${version} is not a valid format.`)
}

run()
