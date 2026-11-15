const paymeOrigin = "https://live.payme.io";
const endpoint = `${paymeOrigin}/api/generate-sale`;
const saleFields = {
  sale_price: 500,
  currency: "ILS",
  product_name: "PayMe Google Pay 3D Secure return test",
  transaction_id: "3ds-<generated on submit>",
  sale_type: "sale",
  sale_payment_method: "multi",
  sale_return_url: new URL("return.html", window.location.href).href,
};

const form = document.querySelector("#sale-form");
const sellerInput = document.querySelector("#seller-id");
const submitButton = form.querySelector("button");
const status = document.querySelector("#status");
const checkout = document.querySelector("#checkout");
const checkoutFrame = document.querySelector("#checkout-frame");

const requestFields = document.querySelector("#request-fields");

function showRequestFields() {
  // The form renders the opening brace and seller ID field separately.
  requestFields.textContent = JSON.stringify(saleFields, null, 2).replace(/^\{\n/, "");
}

document.querySelector("#request-line").textContent = `POST ${endpoint}`;
showRequestFields();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;

  const sellerId = sellerInput.value.trim();
  if (!sellerId) {
    status.textContent = "Enter your PayMe seller ID.";
    sellerInput.focus();
    return;
  }

  submitButton.disabled = true;
  sellerInput.value = "";
  checkout.hidden = true;
  checkoutFrame.removeAttribute("src");
  status.textContent = "Creating sale…";

  try {
    saleFields.transaction_id = `3ds-${crypto.randomUUID()}`;
    showRequestFields();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seller_payme_id: sellerId, ...saleFields }),
    });
    const sale = await response.json().catch(() => null);

    if (!response.ok || sale?.status_code !== 0) {
      const errorCode = sale?.status_error_code;
      const code = Number.isSafeInteger(errorCode) ? `, PayMe code ${errorCode}` : "";
      status.textContent = `Sale creation failed (HTTP ${response.status}${code}).`;
      return;
    }

    const checkoutUrl = URL.canParse(sale.sale_url) ? new URL(sale.sale_url) : null;
    if (!checkoutUrl || checkoutUrl.origin !== paymeOrigin ||
        checkoutUrl.username || checkoutUrl.password) {
      status.textContent = "PayMe returned an unexpected checkout URL.";
      return;
    }

    checkoutFrame.src = checkoutUrl.href;
    status.textContent = `Sale created: ${sale.payme_sale_id}.`;
    checkout.hidden = false;
  } catch {
    status.textContent = "Could not read the checkout response. Check the browser’s Network tab before retrying. PayMe may already have created the sale.";
  } finally {
    submitButton.disabled = false;
  }
});
