Feature: User Login UI

  As an Investor
  I want to login securely via the User Interface
  So that I can access my dashboard visually

  Scenario: Successful Login
    Given the user exists in database with email "investor@deepsea.com" and password "Password123!" and name "Captain Nemo"
    And the user navigates to the login page
    When the user fills the email field with "investor@deepsea.com"
    And the user fills the password field with "Password123!"
    And the user clicks the "Sign In" button
    Then the user should be redirected to the dashboard page
    And a welcome greeting "Captain Nemo" should be visible

  Scenario: Invalid Password
    Given the user exists in database with email "investor@deepsea.com" and password "Password123!" and name "Captain Nemo"
    And the user navigates to the login page
    When the user fills the email field with "investor@deepsea.com"
    And the user fills the password field with "wrongpassword"
    And the user clicks the "Sign In" button
    Then an auth error alert "Invalid email or password" should be displayed

  Scenario: Invalid Email
    Given the email "nonexistent@deepsea.com" does not exist in database
    And the user navigates to the login page
    When the user fills the email field with "nonexistent@deepsea.com"
    And the user fills the password field with "Password123!"
    And the user clicks the "Sign In" button
    Then an auth error alert "Invalid email or password" should be displayed

  Scenario: Empty Credentials Validation
    Given the user navigates to the login page
    When the user clicks the "Sign In" button
    Then the email validation error "Please enter a valid email address" should be displayed
    And the password validation error "Password must be at least 6 characters" should be displayed
