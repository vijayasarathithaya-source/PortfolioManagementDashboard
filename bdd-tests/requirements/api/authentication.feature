Feature: User Login
  As an Investor
  I want to login securely
  So that I can access my portfolio

  Scenario: Successful Login
    Given the user exists with email "investor@deepsea.com" and password "Password123!" and name "Captain Nemo"
    When the user enters email "investor@deepsea.com" and password "Password123!"
    Then the system should generate JWT token
    And the user should get a successful response

  Scenario: Invalid Password
    Given the user exists with email "investor@deepsea.com" and password "Password123!" and name "Captain Nemo"
    When the user enters email "investor@deepsea.com" and password "wrongpassword"
    Then login should fail with error "Invalid email or password"

  Scenario: Invalid Email
    Given the email "nonexistent@deepsea.com" does not exist
    When the user enters email "nonexistent@deepsea.com" and password "Password123!"
    Then login should fail with error "Invalid email or password"

  Scenario: Empty Credentials
    When the user attempts login with empty email and empty password
    Then validation error should be returned with status 400
