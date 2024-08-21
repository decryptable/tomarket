import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import clear from "console-clear";
import userLogin from "./utils/userLogin.js";
import userInfo from "./utils/userInfo.js";
import startGame from "./utils/startGame.js";
import finishGame from "./utils/finishGame.js";
import { parseInitData } from "./utils/parseInitData.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const version = "1.0.0-beta";

const program_name = "Tomarket Bot Tool";

/**
 * Function to show a banner with header and subheader information.
 */
const showBanner = () => {
  const header = chalk.redBright(figlet.textSync(program_name));

  let subheader =
    chalk.yellow.bold("Author: ") +
    chalk.magenta.underline("@decryptable\n");

  subheader +=
    chalk.yellow.bold("Source: ") +
    chalk.underline.magenta("https://t.me/hackability\n");

  subheader +=
    chalk.yellow.bold("Version: ") + chalk.yellowBright(`${version}\n`);

  clear();
  console.log(header);
  console.log(subheader);
};

showBanner();

program.name(program_name);
program.version(version);
program.requiredOption(
  "-i, --init_data <your_init_data>",
  "`init_data` of your Telegram account"
);
program.showHelpAfterError();

program.parse();

const options = program.opts();

const init_data = parseInitData(options.init_data);

const spinner = ora(chalk.gray("Validating your init_data")).start();

const main = async () => {
  let remainingTickets;
  let balance;

  const updateUserInfo = async (access_token) => {
    const user_info = await userInfo(access_token);
    if (user_info.error) {
      spinner.fail(
        user_info.message ??
          `Failed to getting information for your account! Error: ${user_info.message}`
      );
      process.exit(0);
    }

    remainingTickets = user_info.play_passes;
    balance = user_info.available_balance;
  };

  const validateAuthAndStartGame = async () => {
    const validateAuth = await userLogin(init_data);

    if (validateAuth.error) {
      spinner.fail(
        validateAuth.message ??
          `Failed to authenticating using your init_data! Error: ${validateAuth.message}`
      );
      process.exit(0);
    }

    const access_token = validateAuth.access_token;

    showBanner();

    await updateUserInfo(access_token);

    return {
      access_token,
      remainingTickets,
      balance,
    };
  };

  const finishGameAndUpdateUserInfo = async ({ access_token }) => {
    spinner.start(chalk.yellow("Finishing game..."));
    const gameFinished = await finishGame(access_token);

    if (gameFinished.error) {
      spinner.fail(`Failed to finishing game. Error: ${gameFinished.message}`);
      process.exit(0);
    }

    spinner.succeed(chalk.green("Game finished successfully!"));

    await updateUserInfo(access_token);
  };

  const showRemainingTicketsAndCheckRemainingTickets = async () => {
    if (remainingTickets === 0) {
      spinner.fail("The remaining number of tickets has been exhausted!");
      process.exit(0);
    }

    spinner
      .info(
        `You have ${remainingTickets} remaining number of tickets. You have ${Intl.NumberFormat(
          "en-US"
        ).format(balance)} coins`
      )
      .start();
  };

  while (true) {
    const validatedAuth = await validateAuthAndStartGame();

    await showRemainingTicketsAndCheckRemainingTickets();

    // delay 30 seconds
    for (let i = 0; i < 3; i++) {
      spinner.text = chalk.gray(
        `Waiting for ${chalk.yellowBright(
          `${3 - i} seconds`
        )} before starting game...`
      );
      await delay(1000);
    }

    spinner.start(chalk.yellow("Starting game..."));
    const gameStarted = await startGame(access_token);

    if (gameStarted.error) {
      spinner.fail(`Failed to starting game. Error: ${gameStarted.message}`);
      process.exit(0);
    }

    spinner.succeed(chalk.green("Game started successfully!")).start();

    // delay 30 seconds
    for (let i = 0; i < 30; i++) {
      spinner.text = chalk.gray(
        `Waiting for ${chalk.yellowBright(
          `${30 - i} seconds`
        )} before claiming point...`
      );
      await delay(1000);
    }

    await finishGameAndUpdateUserInfo({
      access_token: validatedAuth.access_token,
    });
  }
};

main();
