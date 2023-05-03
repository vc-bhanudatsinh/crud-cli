const fs = require("fs");
const fsPromise = require("fs/promises");
const inquirer = require("inquirer");

const prompt = inquirer.createPromptModule();

const dbFilePath = "./db/user.json";
// get data by email
// server should not stop
const getFileData = async () => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      await fsPromise.writeFile(dbFilePath, "[]", { encoding: "utf-8" });
    }
    return await fsPromise.readFile(dbFilePath, { encoding: "utf-8" });
  } catch (error) {
    console.log("getFileData error", error.message);
  }
};
const getSingleUser = async () => {
  try {
    const getEmailQuestion = {
      type: "input",
      name: "Get Email",
      message: "Please enter the email of the user",
    };

    const emailAnswer = await prompt(getEmailQuestion);
    const emailOfUser = emailAnswer[getEmailQuestion.name];
    let fileData = await getFileData();
    fileData = JSON.parse(fileData);
    const user = fileData.find((user) => user.email === emailOfUser);
    return console.log("User --", user);
  } catch (error) {
    console.log("error", error);
  }
};

const getAllUsersData = async () => {
  try {
    let fileData = await getFileData();
    console.log("file read");
    return console.log("DB Data ---", JSON.parse(fileData));
  } catch (error) {
    console.error("error catch --", error);
  }
};
const getData = async () => {
  try {
    const getUserQuestion = {
      type: "list",
      name: "getUserOption",
      message: "Please select the option",
      choices: ["Get All Users", "Get Single Users"],
    };
    const getDataOption = [getAllUsersData, getSingleUser];
    const answer = await prompt(getUserQuestion);
    const getOption = answer[getUserQuestion.name];
    const index = getUserQuestion.choices.indexOf(getOption);
    if (index === -1) return console.log("Option not found");
    await getDataOption[index]();
  } catch (error) {
    console.error("error catch --", error);
  }
};

const updateData = async () => {
  try {
    let fileData = await getFileData();
    fileData = JSON.parse(fileData);
    const updateDataQuestion = {
      type: "input",
      name: "Update Data",
      message:
        "Please Enter email address of the person you want to update details --",
    };
    const getEmailOfUser = await prompt(updateDataQuestion);
    const findUser = fileData.find(
      (user) => user.email === getEmailOfUser[updateDataQuestion.name]
    );
    if (!findUser) return console.log("No user found with this email");
    console.log("User to be update --", findUser);
    const updateDetailsPropertyQuestion = {
      type: "checkbox",
      name: "updateDetailsProperty",
      message: "What properties you want to update?",
      choices: ["name", "email", "age"],
    };
    const updateDetailPropertyAnswer = await prompt(
      updateDetailsPropertyQuestion
    );
    console.log("DB Data ---", updateDetailPropertyAnswer);
    return await getUpdateDetailsPropertyValue(
      updateDetailPropertyAnswer[updateDetailsPropertyQuestion.name],
      fileData,
      getEmailOfUser[updateDataQuestion.name]
    );
  } catch (error) {
    console.error("error catch --", error);
  }
};

const getUpdateDetailsPropertyValue = async (
  updateProperties,
  fileData,
  userEmail
) => {
  try {
    let updatedUser = {};
    if (updateProperties.includes("email")) {
      const updateEmailQuestion = {
        type: "input",
        name: "Update Email",
        message: "Please Enter Updated email address --",
      };
      const emailUpdateData = await prompt(updateEmailQuestion);
      const isEmailDuplicate = fileData.find(
        (user) => user.email === emailUpdateData[updateEmailQuestion.name]
      );
      if (isEmailDuplicate) {
        console.log("Email is Duplicate");
        return getUpdateDetailsPropertyValue(updateProperties, fileData);
      }
      updatedUser.email = emailUpdateData[updateEmailQuestion.name];
      updateProperties = updateProperties.filter(
        (property) => property !== "email"
      );
      if (updateProperties.length === 0)
        return writeUpdatedDataInDb(updatedUser, fileData, userEmail);
    }
    if (updateProperties.length === 2) {
      updatedUser = await askPropertyQuestion(updateProperties[0], updatedUser);
      updatedUser = await askPropertyQuestion(updateProperties[1], updatedUser);
      console.log("getUpdateDetailsPropertyValue called", updatedUser);
      return writeUpdatedDataInDb(updatedUser, fileData, userEmail);
    }
    updatedUser = await askPropertyQuestion(updateProperties[0], updatedUser);
    console.log("getUpdateDetailsPropertyValue called", updatedUser);
    return writeUpdatedDataInDb(updatedUser, fileData, userEmail);

    async function askPropertyQuestion(property, updatedUser) {
      const updatePropertyQuestion = {
        type: "input",
        name: `Update ${property}`,
        message: `Please Enter Updated ${property} --`,
      };
      const updatePropertyAnswer = await prompt(updatePropertyQuestion);
      updatedUser[property] = updatePropertyAnswer[updatePropertyQuestion.name];
      return updatedUser;
    }

    async function writeUpdatedDataInDb(updatedUser, fileData, email) {
      console.log("writeUpdatedDataInDb called ");
      fileData.find((user) => {
        if (user.email === email) {
          user.name = updatedUser.name ? updatedUser.name : user.name;
          user.email = updatedUser.email ? updatedUser.email : user.email;
          user.age = updatedUser.age ? updatedUser.age : user.age;
          console.log("user", user);
        }
      });
      return await fsPromise.writeFile(
        dbFilePath,
        JSON.stringify(fileData),
        "utf-8"
      );
    }
  } catch (error) {
    console.log("error", error);
  }
};

const createData = async () => {
  try {
    let fileData = await getFileData();
    fileData = JSON.parse(fileData);
    const createDataQuestions = [
      {
        type: "input",
        name: "name",
        message: "Please Enter Name of user",
      },
      {
        type: "input",
        name: "email",
        message: "Please Enter email address of user",
      },
      {
        type: "input",
        name: "age",
        message: "Please Enter age of user",
      },
    ];
    const nameAnswer = await prompt(createDataQuestions[0]);
    let ageAnswer, emailAnswer;
    if (!nameAnswer || nameAnswer[createDataQuestions[0].name] === "") {
      console.log("Name should not empty or undefined");
      return createData();
    }
    emailAnswer = await prompt(createDataQuestions[1]);
    const isUnique = fileData.find((user) => user.email === emailAnswer.email);
    if (isUnique) {
      console.log("This email is already exist in DB");
      return createData();
    }
    if (!emailAnswer || emailAnswer[createDataQuestions[1].name] === "") {
      console.log("Email should not empty or undefined");
      return createData();
    }
    const isEmailDuplicate = fileData.find(
      (user) => user.email === emailAnswer[createDataQuestions[1].name]
    );
    if (isEmailDuplicate) {
      console.log("This Email Already Exist");
      return createData();
    }
    ageAnswer = await prompt(createDataQuestions[2]);
    if (ageAnswer || ageAnswer[createDataQuestions[2].name] !== "")
      console.log("name", nameAnswer.name);
    console.log("email", emailAnswer.email);
    console.log("age", ageAnswer.age);
    fileData.push({
      name: nameAnswer.name,
      email: emailAnswer.email,
      age: ageAnswer.age,
    });

    const writeDataInFile = await fsPromise.writeFile(
      dbFilePath,
      JSON.stringify(fileData),
      "utf-8"
    );
    if (!writeDataInFile) {
      console.log("User added Successfully");
    }
  } catch (error) {
    console.error("error catch --", error);
  }
};

const deleteData = async () => {
  try {
    const deleteDataQuestion = {
      type: "input",
      name: "Delete Data",
      message: "Please Enter email address of the person you want to delete",
    };
    const confirmDeleteDataQuestion = {
      type: "confirm",
      name: "Confirm Delete",
      message: "Do You want to Delete this User from DB?",
    };
    const getEmailOfUser = await prompt(deleteDataQuestion);
    let fileData = await getFileData();
    fileData = JSON.parse(fileData);
    const findUser = fileData.find(
      (user) => user.email === getEmailOfUser[deleteDataQuestion.name]
    );
    if (!findUser) {
      console.log("User not found");
      return await deleteData();
    }
    console.log("User to be deleted --", findUser);
    const confirmToDelete = await prompt(confirmDeleteDataQuestion);
    if (confirmToDelete[confirmDeleteDataQuestion.name])
      return await deleteDataFromDb(findUser.email, fileData);
  } catch (error) {
    console.error("error catch --", error);
  }
};

const deleteDataFromDb = async (email, dbData) => {
  try {
    dbData = dbData.filter((user) => user.email !== email);
    fsPromise.writeFile(dbFilePath, JSON.stringify(dbData), {
      encoding: "utf-8",
    });
    console.log("User deleted Successfully");
  } catch (error) {
    console.error("error", error);
  }
};

module.exports = {
  getData,
  deleteData,
  createData,
  updateData,
};
