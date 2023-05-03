const inquirer = require("inquirer");

const {
  createData,
  updateData,
  deleteData,
  getData,
} = require("./operations.js");

const cliStart = async () => {
  const prompt = inquirer.createPromptModule();

  const dBOperationQuestion = {
    type: "list",
    name: "DB Operations",
    message: "\n Please select the operation you want to perform on DB",
    choices: ["Get Data", "Write Data", "Delete Data", "Update Data"],
  };

  const functionCalls = [getData, createData, deleteData, updateData];
  const answers = await prompt(dBOperationQuestion);
  console.log(answers[dBOperationQuestion.name]);
  const index = dBOperationQuestion.choices.indexOf(
    answers[dBOperationQuestion.name]
  );
  if (index === -1) return console.log("It's undefined");
  await functionCalls[index]();
  cliStart();
};

cliStart();
