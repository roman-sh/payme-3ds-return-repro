# PayMe Google Pay 3D Secure return test

[Open the HTTPS demo](https://roman-sh.github.io/payme-3ds-return-repro/).

## Observed behavior

In PayMe's hosted Multi checkout embedded in an iframe, closing the Google Pay 3D Secure prompt without entering the verification code redirects the iframe to `sale_return_url`. We expected the checkout to stay open so the buyer could retry.

## Reproduce

Use a live PayMe seller ID with Google Pay enabled and a payment method that triggers a 3D Secure code prompt. Completing payment can charge ₪5.00.

1. Enter your seller ID and select **Create test sale**.
2. Choose **Google Pay** in the checkout and wait for the 3D Secure code prompt.
3. Close the verification window without entering the code.
4. Check whether **Return URL reached** appears. That page records its load time in UTC and whether it opened in the checkout iframe or in a full tab. The demo displays the PayMe sale ID under the create button for correlation.

The demo makes the generate-sale request directly to PayMe from the browser. The seller ID field starts empty and the demo clears it when submitting. The configured return URL points to this project's `return.html`. A visit to that page shows browser navigation only. It does not verify the sale status, and this demo has no webhook endpoint.
