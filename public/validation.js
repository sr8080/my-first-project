function validateName() {
    const nameField = document.getElementById("name");
    const nameValue = nameField.value.trim();
    const errorMessage5 = document.getElementById("errorMessage5");
  
    if (nameValue === "") {
      errorMessage5.textContent = "Name is required.";
      nameField.focus();
      return false;
    } else {
      errorMessage5.textContent = "";
      return true;
    }
  }
  
  function validateEmail() {
    const emailField = document.getElementById("email");
    const emailValue = emailField.value.trim();
    const errorMessage4 = document.getElementById("errorMessage4");
  
    // Add your email validation logic here (e.g., regular expression).
  
    if (emailValue === "") {
      errorMessage4.textContent = "Email is required.";
      emailField.focus();
      return false;
    } else {
      errorMessage4.textContent = "";
      return true;
    }
  }
  
  function validateMobile() {
    const mobileField = document.getElementById("mobile");
    const mobileValue = mobileField.value.trim();
    const errorMessage3 = document.getElementById("errorMessage3");
  
    // Add your mobile validation logic here (e.g., length check).
  
    if (mobileValue === "") {
      errorMessage3.textContent = "Mobile is required.";
      mobileField.focus();
      return false;
    } else {
      errorMessage3.textContent = "";
      return true;
    }
  }
  
  function validatePassword() {
    const pass1Field = document.getElementById("pass1");
    const pass2Field = document.getElementById("pass2");
    const pass1Value = pass1Field.value;
    const pass2Value = pass2Field.value;
    const errorMessage1 = document.getElementById("errorMessage1");
    const errorMessage2 = document.getElementById("errorMessage2");
  
    if (pass1Value === "") {
      errorMessage1.textContent = "Password is required.";
      pass1Field.focus();
      return false;
    } else if (pass1Value.length < 6) {
      errorMessage1.textContent = "Password must be at least 6 characters.";
      pass1Field.focus();
      return false;
    } else {
      errorMessage1.textContent = "";
    }
  
    if (pass2Value === "") {
      errorMessage2.textContent = "Please re-enter your password.";
      pass2Field.focus();
      return false;
    } else if (pass1Value !== pass2Value) {
      errorMessage2.textContent = "Passwords do not match.";
      pass2Field.focus();
      return false;
    } else {
      errorMessage2.textContent = "";
    }
  
    return true;
  }
  