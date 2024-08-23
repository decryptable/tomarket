import chalk from "chalk";
import clear from "console-clear";
import inquirer from "inquirer";
import ora from "ora";
import finishGame from "./utils/finishGame.js";
import { parseInitData } from "./utils/parseInitData.js";
import startGame from "./utils/startGame.js";
import userInfo from "./utils/userInfo.js";
import userLogin from "./utils/userLogin.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const version = "2.0.0";

const program_name = "Tomarket Bot Tool";

/**
 * Function to show a banner with header and subheader information.
 */
const showBanner = () => {
  const header = chalk.magentaBright.bold(program_name);

  let subheader =
    chalk.yellow.bold("Author: ") + chalk.magenta.underline("@decryptable\n");

  subheader +=
    chalk.yellow.bold("Version: ") + chalk.yellowBright(`${version}\n`);

  clear();
  console.log(header);
  console.log(subheader);
};

showBanner();

const spinner = ora().start();

const getInitData = async () => {
  spinner.stop();
  const { init_data } = await inquirer.prompt([
    {
      name: "init_data",
      type: "input",
      message: "Enter your init data:",
      required: true,
      validate: (input) => {
        if (typeof parseInitData(input) !== "string") {
          return "Invalid init data";
        }

        if (String(parseInitData(input)).length === 0) {
          return "Invalid init data";
        }

        return true;
      },
    },
  ]);

  spinner.start(chalk.gray("Validating your init data..."));

  return parseInitData(init_data);
};

const getUsedTickets = async (defaultTickets) => {
  spinner.stop();
  const { usedTickets } = await inquirer.prompt([
    {
      name: "usedTickets",
      type: "number",
      message: "Enter the number of tickets you want to use:",
      default: defaultTickets,
      min: 1,
      max: defaultTickets,
      validate: (input) => {
        if (isNaN(input) || input <= 0) {
          return "Invalid number of tickets";
        }

        return true;
      },
    },
  ]);

  spinner.start();

  return usedTickets;
};

const main = async () => {
  let remainingTickets;
  let balance;
  let access_token;

  spinner.text = chalk.gray("Starting...");

  const init_data = await getInitData().catch(() => {
    process.exit(0);
  });

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

    access_token = validateAuth.access_token;

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

    await showRemainingTicketsAndCheckRemainingTickets();
  };

  const showRemainingTicketsAndCheckRemainingTickets = async () => {
    if (remainingTickets === 0) {
      spinner.fail("The remaining number of tickets has been exhausted!");
      process.exit(0);
    }

    spinner
      .info(
        `Account info:\n- Remaining tickets: ${remainingTickets}\n- Points: ${Intl.NumberFormat(
          "en-US"
        ).format(balance)}`
      )
      .start();
  };

  const validatedAuth = await validateAuthAndStartGame();

  const usedTickets = await getUsedTickets(remainingTickets).catch(() => {
    process.exit(0);
  }); // integer number

  for (let i = 1; i <= usedTickets; i++) {
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

    if (i >= usedTickets) {
      spinner.stop();
    }
  }
};

main();
