import 'babel-polyfill'
import test from 'ava'
import { tempDir } from '../src/util'

global.NSTemporaryDirectory = function () {
  return '/tmp/abc/'
}

test('default tmpDir', t => {
  t.deepEqual(tempDir(), '/tmp/abc/jira-sketch-plugin/')
})
