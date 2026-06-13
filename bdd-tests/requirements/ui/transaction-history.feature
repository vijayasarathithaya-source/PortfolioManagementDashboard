Feature: View Transaction History UI

  As an Investor
  I want to review and filter my transactions in the UI
  So that I can easily track my portfolio history

  Scenario: Display Transactions and Filter by Type
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has standard transactions seeded in database
    And the user navigates to the transactions page
    Then the transactions list table should show transactions
    When the user selects transaction type filter "BUY"
    Then the transactions list table should only display "BUY" transaction rows
    When the user selects transaction type filter "SELL"
    Then the transactions list table should only display "SELL" transaction rows

  Scenario: Filter by Asset Type
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has standard transactions seeded in database
    And the user navigates to the transactions page
    When the user selects asset type filter "Bonds"
    Then the transactions list table should only display "Bonds" rows
