import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.innerHTML = `
    <div class="page">
      <header class="app-header">
        <img
          src="/landbank-logo.png"
          alt="Land Bank logo"
          class="logo"
        />
        <div class="app-header-text">
          <h1>LAND BANK LOAN SERVICES</h1>
          <p>Supporting individuals and businesses through accessible financial solutions.</p>
        </div>
      </header>

      <main class="frames" aria-live="polite">
        <!-- 1. Welcome Screen -->
        <section
          class="frame frame--active"
          id="frame-welcome"
          aria-label="Welcome"
        >
          <div class="frame-body frame-body--center">
            <div class="welcome-intro">
              <h2 class="frame-title">Welcome</h2>
              <p class="frame-subtitle">
                Choose a loan program or tool to begin the presentation.
              </p>
            </div>

            <div class="welcome-grid">
              <button class="nav-card" data-target="frame-home-loan">
                <span class="nav-card-icon nav-card-icon--home" aria-hidden="true"></span>
                <span class="nav-card-text">
                  <span class="nav-card-label">Home Loan</span>
                  <span class="nav-card-caption">Purchase, build, or renovate your home.</span>
                </span>
              </button>

              <button class="nav-card" data-target="frame-small-business">
                <span class="nav-card-icon nav-card-icon--business" aria-hidden="true"></span>
                <span class="nav-card-text">
                  <span class="nav-card-label">Small Business Loan</span>
                  <span class="nav-card-caption">Support for entrepreneurs and MSMEs.</span>
                </span>
              </button>

              <button class="nav-card" data-target="frame-auto-loan">
                <span class="nav-card-icon nav-card-icon--auto" aria-hidden="true"></span>
                <span class="nav-card-text">
                  <span class="nav-card-label">Auto Loan</span>
                  <span class="nav-card-caption">Finance a brand-new or pre-owned vehicle.</span>
                </span>
              </button>

              <button class="nav-card" data-target="frame-calculator">
                <span class="nav-card-icon nav-card-icon--calculator" aria-hidden="true"></span>
                <span class="nav-card-text">
                  <span class="nav-card-label">Loan Calculator</span>
                  <span class="nav-card-caption">Estimate monthly payments in real time.</span>
                </span>
              </button>

              <button class="nav-card" data-target="frame-faq">
                <span class="nav-card-icon nav-card-icon--faq" aria-hidden="true"></span>
                <span class="nav-card-text">
                  <span class="nav-card-label">Frequently Asked Questions</span>
                  <span class="nav-card-caption">Address common borrower concerns.</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <!-- 2. Home Loan Page -->
        <section class="frame" id="frame-home-loan" aria-label="Home Loan">
          <div class="frame-body">
            <div class="frame-header">
              <h2 class="frame-title">Home Loan</h2>
              <p class="frame-subtitle">
                A financing solution to help individuals purchase, construct, or renovate residential properties.
              </p>
            </div>

            <div class="frame-columns">
              <div class="frame-column">
                <h3 class="section-heading">Overview</h3>
                <p>
                  This program allows borrowers to pay for their homes through manageable installment payments
                  over an agreed loan term.
                </p>

                <h3 class="section-heading">Loan Purposes</h3>
                <ul class="bullet-list">
                  <li>Purchase of residential property</li>
                  <li>House construction</li>
                  <li>Home renovation</li>
                  <li>Refinancing of existing housing loans</li>
                </ul>
              </div>

              <div class="frame-column">
                <h3 class="section-heading">Basic Requirements</h3>
                <ul class="bullet-list">
                  <li>Valid Government ID</li>
                  <li>Proof of Income</li>
                  <li>Loan Application Form</li>
                  <li>Property Documents</li>
                </ul>

                <h3 class="section-heading">Application Process</h3>
                <ol class="stepper">
                  <li>
                    <span class="stepper-badge">1</span>
                    <span class="stepper-text">Submit Application</span>
                  </li>
                  <li>
                    <span class="stepper-badge">2</span>
                    <span class="stepper-text">Document Evaluation</span>
                  </li>
                  <li>
                    <span class="stepper-badge">3</span>
                    <span class="stepper-text">Loan Approval</span>
                  </li>
                  <li>
                    <span class="stepper-badge">4</span>
                    <span class="stepper-text">Release of Loan</span>
                  </li>
                </ol>
              </div>
            </div>

            <div class="frame-actions">
              <button class="btn btn--ghost" data-target="frame-welcome">Back to Home</button>
              <button class="btn btn--primary" data-target="frame-small-business">Next</button>
            </div>
          </div>
        </section>

        <!-- 3. Small Business Loan Page -->
        <section
          class="frame"
          id="frame-small-business"
          aria-label="Small Business Loan"
        >
          <div class="frame-body">
            <div class="frame-header">
              <h2 class="frame-title">Small Business Loan</h2>
              <p class="frame-subtitle">
                Financial assistance for entrepreneurs and small business owners who need capital to grow and sustain operations.
              </p>
            </div>

            <div class="frame-columns">
              <div class="frame-column">
                <h3 class="section-heading">Overview</h3>
                <p>
                  This program supports economic growth by empowering businesses with accessible and structured
                  financing options.
                </p>

                <h3 class="section-heading">Who Can Apply</h3>
                <ul class="bullet-list">
                  <li>Registered small business owners</li>
                  <li>Entrepreneurs with operational businesses</li>
                  <li>Individuals planning business expansion</li>
                  <li>Businesses with stable income records</li>
                </ul>
              </div>

              <div class="frame-column">
                <h3 class="section-heading">Loan Purposes</h3>
                <ul class="bullet-list">
                  <li>Business expansion</li>
                  <li>Purchase of equipment or machinery</li>
                  <li>Inventory procurement</li>
                  <li>Working capital for daily operations</li>
                </ul>

                <h3 class="section-heading">Basic Requirements</h3>
                <ul class="bullet-list">
                  <li>Valid Government ID</li>
                  <li>Business Registration Documents</li>
                  <li>Financial Statements or Proof of Income</li>
                  <li>Loan Application Form</li>
                  <li>Supporting Business Documents</li>
                </ul>

                <h3 class="section-heading">Application Process</h3>
                <ol class="stepper">
                  <li>
                    <span class="stepper-badge">1</span>
                    <span class="stepper-text">Submit Loan Application</span>
                  </li>
                  <li>
                    <span class="stepper-badge">2</span>
                    <span class="stepper-text">Business and Credit Evaluation</span>
                  </li>
                  <li>
                    <span class="stepper-badge">3</span>
                    <span class="stepper-text">Loan Approval</span>
                  </li>
                  <li>
                    <span class="stepper-badge">4</span>
                    <span class="stepper-text">Release of Funds</span>
                  </li>
                </ol>
              </div>
            </div>

            <div class="frame-actions">
              <button class="btn btn--ghost" data-target="frame-welcome">Back to Home</button>
              <button class="btn btn--primary" data-target="frame-auto-loan">Next</button>
            </div>
          </div>
        </section>

        <!-- 4. Auto Loan Page -->
        <section class="frame" id="frame-auto-loan" aria-label="Auto Loan">
          <div class="frame-body">
            <div class="frame-header">
              <h2 class="frame-title">Auto Loan</h2>
              <p class="frame-subtitle">
                A loan facility that helps individuals finance the purchase of a brand-new or selected second-hand vehicle.
              </p>
            </div>

            <div class="frame-columns">
              <div class="frame-column">
                <h3 class="section-heading">Eligible Vehicles</h3>
                <ul class="bullet-list">
                  <li>Brand-new vehicles</li>
                  <li>Selected second-hand vehicles</li>
                  <li>Passenger cars</li>
                  <li>Utility vehicles</li>
                </ul>

                <h3 class="section-heading">Requirements</h3>
                <ul class="bullet-list">
                  <li>Valid Government ID</li>
                  <li>Proof of Income</li>
                  <li>Vehicle Quotation</li>
                  <li>Loan Application Form</li>
                </ul>
              </div>

              <div class="frame-column">
                <h3 class="section-heading">Process</h3>
                <ol class="stepper">
                  <li>
                    <span class="stepper-badge">1</span>
                    <span class="stepper-text">Loan Application</span>
                  </li>
                  <li>
                    <span class="stepper-badge">2</span>
                    <span class="stepper-text">Document Review</span>
                  </li>
                  <li>
                    <span class="stepper-badge">3</span>
                    <span class="stepper-text">Loan Approval</span>
                  </li>
                  <li>
                    <span class="stepper-badge">4</span>
                    <span class="stepper-text">Vehicle Release</span>
                  </li>
                </ol>
              </div>
            </div>

            <div class="frame-actions">
              <button class="btn btn--ghost" data-target="frame-welcome">Back to Home</button>
            </div>
          </div>
        </section>

        <!-- 5. Loan Calculator Page -->
        <section
          class="frame"
          id="frame-calculator"
          aria-label="Loan Calculator"
        >
          <div class="frame-body">
            <div class="frame-header">
              <h2 class="frame-title">Loan Calculator</h2>
              <p class="frame-subtitle">
                Enter sample values to estimate the monthly payment, total amount, and interest.
              </p>
            </div>

            <div class="calculator-layout">
              <form class="calculator-form" id="loan-calculator-form">
                <div class="field-group">
                  <label for="loan-amount">Loan Amount (₱)</label>
                  <input
                    type="number"
                    id="loan-amount"
                    name="loanAmount"
                    min="0"
                    step="1000"
                    placeholder="e.g., 1000000"
                    required
                  />
                </div>

                <div class="field-group">
                  <label for="interest-rate">Interest Rate (% per year)</label>
                  <input
                    type="number"
                    id="interest-rate"
                    name="interestRate"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 6"
                    required
                  />
                </div>

                <div class="field-group">
                  <label for="loan-term">Loan Term (Years)</label>
                  <input
                    type="number"
                    id="loan-term"
                    name="loanTerm"
                    min="1"
                    step="1"
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                <button type="submit" class="btn btn--primary btn--full">
                  COMPUTE
                </button>
              </form>

              <div class="calculator-result" id="calculator-result" aria-live="polite">
                <h3 class="section-heading">Result</h3>
                <p class="result-placeholder">
                  Enter a loan amount, interest rate, and term to see the estimated payment.
                </p>
                <dl class="result-grid hidden" id="calculator-result-values">
                  <div class="result-item">
                    <dt>Estimated Monthly Payment</dt>
                    <dd id="result-monthly">—</dd>
                  </div>
                  <div class="result-item">
                    <dt>Total Loan Amount</dt>
                    <dd id="result-total">—</dd>
                  </div>
                  <div class="result-item">
                    <dt>Estimated Interest</dt>
                    <dd id="result-interest">—</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div class="frame-actions">
              <button class="btn btn--ghost" data-target="frame-welcome">Back to Home</button>
              <button class="btn btn--primary" data-target="frame-loan-example">
                Next
              </button>
            </div>
          </div>
        </section>

        <!-- 6. Sample Borrower Scenario -->
        <section
          class="frame"
          id="frame-loan-example"
          aria-label="Loan Example"
        >
          <div class="frame-body">
            <div class="frame-header">
              <h2 class="frame-title">Loan Example: Juan Dela Cruz</h2>
              <p class="frame-subtitle">
                Use this scenario during the presentation to walk the audience through a sample computation.
              </p>
            </div>

            <div class="frame-columns">
              <div class="frame-column">
                <h3 class="section-heading">Client Profile</h3>
                <ul class="bullet-list">
                  <li>Client: Juan Dela Cruz</li>
                  <li>Purpose: Purchase of Residential House</li>
                </ul>

                <h3 class="section-heading">Loan Details</h3>
                <ul class="bullet-list">
                  <li>Loan Amount: ₱1,500,000</li>
                  <li>Interest Rate: 6% per year</li>
                  <li>Loan Term: 10 years</li>
                </ul>

                <div class="callout">
                  <p class="callout-question">
                    “What would be the estimated monthly payment?”
                  </p>
                </div>
              </div>

              <div class="frame-column">
                <h3 class="section-heading">Show Computation</h3>
                <p class="text-muted">
                  Click the button below during the presentation to reveal the estimated monthly payment for Juan.
                </p>
                <button
                  class="btn btn--outline"
                  type="button"
                  id="btn-show-example-computation"
                >
                  Show Computation
                </button>

                <div
                  class="example-result hidden"
                  id="example-computation-panel"
                  aria-live="polite"
                >
                  <h4>Estimated Monthly Payment</h4>
                  <p id="example-monthly-payment">—</p>
                  <p class="text-muted">
                    Based on the same computation logic used in the Loan Calculator.
                  </p>
                </div>
              </div>
            </div>

            <div class="frame-actions">
              <button class="btn btn--ghost" data-target="frame-welcome">Back to Home</button>
              <button class="btn btn--primary" data-target="frame-faq">Next</button>
            </div>
          </div>
        </section>

        <!-- 7. FAQ Section -->
        <section class="frame" id="frame-faq" aria-label="Frequently Asked Questions">
          <div class="frame-body">
            <div class="frame-header">
              <h2 class="frame-title">Frequently Asked Questions</h2>
              <p class="frame-subtitle">
                Address common borrower questions to manage expectations and clarify policies.
              </p>
            </div>

            <div class="faq-list">
              <article class="faq-item">
                <h3>How long does loan approval take?</h3>
                <p>
                  Loan approval may take several banking days depending on the completeness of
                  the submitted documents and the results of credit evaluation.
                </p>
              </article>

              <article class="faq-item">
                <h3>Can borrowers pay their loan earlier than the agreed term?</h3>
                <p>
                  Yes, early payment may be allowed subject to bank policies and applicable
                  charges. Borrowers are encouraged to coordinate with their servicing branch.
                </p>
              </article>

              <article class="faq-item">
                <h3>Are interest rates fixed?</h3>
                <p>
                  Interest rates may vary depending on the loan program and prevailing market
                  conditions. The bank will explain whether the rate is fixed or variable
                  during loan application.
                </p>
              </article>
            </div>

            <div class="frame-actions">
              <button class="btn btn--ghost" data-target="frame-welcome">Back to Home</button>
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        Land Bank Loan Services &mdash; Presentation View
      </footer>
    </div>
  `

  // entry animation
  window.requestAnimationFrame(() => {
    document.body.classList.add('is-ready')
  })

  const frames = Array.from(document.querySelectorAll<HTMLElement>('.frame'))

  function showFrame(id: string) {
    frames.forEach((frame) => {
      frame.classList.toggle('frame--active', frame.id === id)
    })
  }

  // Navigation buttons (Welcome cards + Back / Next)
  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-target]')
    if (!target) return

    const frameId = target.getAttribute('data-target')
    if (!frameId) return

    event.preventDefault()
    showFrame(frameId)
  })

  // Loan calculator logic
  const calculatorForm = document.getElementById('loan-calculator-form') as HTMLFormElement | null
  const resultWrapper = document.getElementById('calculator-result-values')
  const resultPlaceholder = document.querySelector<HTMLElement>(
    '#calculator-result .result-placeholder',
  )

  const resultMonthly = document.getElementById('result-monthly')
  const resultTotal = document.getElementById('result-total')
  const resultInterest = document.getElementById('result-interest')

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 2,
    }).format(value)
  }

  function computeMonthlyPayment(principal: number, annualRatePercent: number, years: number) {
    const months = years * 12
    const monthlyRate = annualRatePercent / 100 / 12

    if (monthlyRate === 0) {
      return principal / months
    }

    const factor = Math.pow(1 + monthlyRate, months)
    return (principal * monthlyRate * factor) / (factor - 1)
  }

  if (calculatorForm && resultMonthly && resultTotal && resultInterest) {
    calculatorForm.addEventListener('submit', (event) => {
      event.preventDefault()

      const amount = Number((calculatorForm.elements.namedItem('loanAmount') as HTMLInputElement).value)
      const rate = Number((calculatorForm.elements.namedItem('interestRate') as HTMLInputElement).value)
      const termYears = Number((calculatorForm.elements.namedItem('loanTerm') as HTMLInputElement).value)

      if (!amount || !rate || !termYears) {
        return
      }

      const monthly = computeMonthlyPayment(amount, rate, termYears)
      const totalPaid = monthly * termYears * 12
      const interest = totalPaid - amount

      resultMonthly.textContent = formatCurrency(monthly)
      resultTotal.textContent = formatCurrency(totalPaid)
      resultInterest.textContent = formatCurrency(interest)

      if (resultPlaceholder) {
        resultPlaceholder.classList.add('hidden')
      }
      if (resultWrapper) {
        resultWrapper.classList.remove('hidden')
      }
    })
  }

  // Example scenario: Juan Dela Cruz
  const exampleButton = document.getElementById(
    'btn-show-example-computation',
  ) as HTMLButtonElement | null
  const examplePanel = document.getElementById('example-computation-panel')
  const exampleMonthly = document.getElementById('example-monthly-payment')

  if (exampleButton && examplePanel && exampleMonthly) {
    exampleButton.addEventListener('click', () => {
      const principal = 1_500_000
      const annualRate = 6
      const years = 10

      const monthly = computeMonthlyPayment(principal, annualRate, years)
      exampleMonthly.textContent = formatCurrency(monthly)

      examplePanel.classList.remove('hidden')
    })
  }
}
