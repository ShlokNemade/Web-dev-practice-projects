document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quiz-form");
  const noOfQuestions = document.getElementById("no-of-questions");
  const quizCategory = document.getElementById("quiz-category");
  const quizDifficulty = document.getElementById("quiz-difficulty");
  const quizContainer = document.getElementById("quiz-container");
  const currentQuestionNumber = document.getElementById(
    "current-question-number"
  );
  const totalNumberOfQuestions = document.getElementById(
    "total-number-of-questions"
  );
  const questionTextDisplay = document.getElementById("question-text");
  const quizOptionForm = document.getElementById("quiz-option-form");
  const option1Text = document.getElementById("option-1-text");
  const option2Text = document.getElementById("option-2-text");
  const option3Text = document.getElementById("option-3-text");
  const option4Text = document.getElementById("option-4-text");
  const option1Input = document.getElementById("option-1-input");
  const option2Input = document.getElementById("option-2-input");
  const option3Input = document.getElementById("option-3-input");
  const option4Input = document.getElementById("option-4-input");
  const nextBtn = document.getElementById("next-btn");
  const resultContainer = document.getElementById("result-container");
  const totalScoreDisplay = document.getElementById("total-score");
  const totalQuestionsDisplay = document.getElementById("total-questions");
  const percentageDisplay = document.getElementById("percentage");
  const reviewDisplay = document.getElementById("review");
  const playAgainBtn = document.getElementById("play-again-btn");

  fetchCategories();
  let questionIndex = 0;
  let correctAnswer = "";
  let totalQuestions = null;
  let quizQuestions = null;
  let score = 0;

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    totalQuestions = noOfQuestions.value.trim();
    const categoryId = quizCategory.value.trim();
    const difficulty = quizDifficulty.value.trim();

    fetchQuizQuestions(totalQuestions, categoryId, difficulty);

    totalNumberOfQuestions.textContent = `${totalQuestions}`;
    //clear input
    noOfQuestions.value = "";
  });

  quizOptionForm.addEventListener("change", (e) => {
    nextBtn.classList.remove("hidden");
  });

  quizOptionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedOption = quizOptionForm.querySelector(
      'input[name="option"]:checked'
    );
    const selectedLabel = selectedOption.closest("label");
    const selectedValue = selectedOption.value;

    const correctInput = quizOptionForm.querySelector(
      `input[name="option"][value="${CSS.escape(correctAnswer)}"]`
    );

    const correctLabel = correctInput.closest("label");

    if (selectedValue === correctAnswer) {
      selectedLabel.classList.add("correct");
      score++;
    } else {
      selectedLabel.classList.add("incorrect");
      correctLabel.classList.add("correct");
    }

    questionIndex++;
    setTimeout(() => {
      if (questionIndex < totalQuestions) {
        displayQuizQuestions();
      } else {
        displayResult();
      }
    }, 700);
  });

  playAgainBtn.addEventListener("click", () => {
    resultContainer.classList.add("hidden");
    quizContainer.classList.add("hidden");
    quizForm.classList.remove("hidden");
    score = 0;
    totalQuestions = null;
    questionIndex = 0;
    quizQuestions = null;
  });

  async function fetchQuizQuestions(totalQuestions, categoryId, difficulty) {
    const url = `https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Some error occured in fetching questions...");
      }
      quizQuestions = await response.json();
      displayQuizQuestions();
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchCategories() {
    const url = `https://opentdb.com/api_category.php`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Some error occured in fetching categories...");
      }
      const responseJson = await response.json();
      displayCategories(responseJson);
    } catch (error) {
      console.error("Some error occured in fetching categories...");
    }
  }

  function displayCategories(categories) {
    categories.trivia_categories.forEach((category) => {
      const option = document.createElement("option");
      option.textContent = category.name;
      option.setAttribute("value", category.id);
      quizCategory.appendChild(option);
    });
  }

  function displayQuizQuestions() {
    quizOptionForm.reset();
    document
      .querySelectorAll(".option-form-inputs")
      .forEach((label) => label.classList.remove("correct", "incorrect"));
    nextBtn.classList.add("hidden");
    quizForm.classList.add("hidden");
    resultContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    currentQuestionNumber.textContent = questionIndex + 1;
    questionTextDisplay.textContent = decodeHTML(
      quizQuestions.results[questionIndex].question
    );
    const optionsArray = [];
    correctAnswer = decodeHTML(
      quizQuestions.results[questionIndex].correct_answer
    );
    optionsArray.push(correctAnswer);
    quizQuestions.results[questionIndex].incorrect_answers.forEach((opt) => {
      optionsArray.push(decodeHTML(opt));
    });
    shuffleArray(optionsArray);

    option1Input.setAttribute("value", optionsArray[0]);
    option2Input.setAttribute("value", optionsArray[1]);
    option3Input.setAttribute("value", optionsArray[2]);
    option4Input.setAttribute("value", optionsArray[3]);

    option1Text.textContent = optionsArray[0];
    option2Text.textContent = optionsArray[1];
    option3Text.textContent = optionsArray[2];
    option4Text.textContent = optionsArray[3];
  }

  function decodeHTML(string) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = string;
    return textarea.value.trim();
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function displayResult() {
    resultContainer.classList.remove("hidden");
    quizContainer.classList.add("hidden");
    quizForm.classList.add("hidden");

    let percentage = parseFloat((score / totalQuestions) * 100).toFixed(2);
    totalScoreDisplay.textContent = score;
    totalQuestionsDisplay.textContent = totalQuestions;
    percentageDisplay.textContent = percentage;

    if (percentage < 50) {
      reviewDisplay.textContent =
        "Poor performance. You need focused practice.";
    } else if (percentage < 70) {
      reviewDisplay.textContent = "Average. Revise weak areas.";
    } else if (percentage < 90) {
      reviewDisplay.textContent = "Good work. A bit more consistency needed.";
    } else {
      reviewDisplay.textContent =
        "Excellent. You clearly understand the concepts.";
    }
  }
});
