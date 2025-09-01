import * as path from "path";
import Mocha from "mocha";
import { glob } from "glob";

export function run(): Promise<void> {
  // eslint-disable-next-line prefer-rest-params
  console.log("_root", ...arguments);

  const mocha = new Mocha({
    ui: "bdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "../../..");

  return new Promise((c, e) => {
    glob("out/**/!(*.unit).test.js", { cwd: testsRoot })
      .then((files) => {
        // Add files to the test suite
        files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha.run((failures) => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`));
            } else {
              c();
            }
          });
        } catch (err) {
          e(err);
        }
      })
      .catch((err) => {
        return e(err);
      });
  });
}
