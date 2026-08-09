W3BC MEDIA — MULTI-PAGE + CRYPTO WALLET UPDATE
================================================

WHAT THIS ZIP IS
----------------
This is an OVERLAY package for the existing GitHub repository:
jchainsonsol/w3bcmedia-site

Upload these files/folders into the repository root and allow GitHub to replace
matching files. Keep the existing assets/ folder and existing shared CSS/JS files
that are already in the repo.

NEW / UPDATED SITE PAGES
------------------------
index.html
media.html
jchains.html
network.html
better.html
shop.html
about.html
bullpen.html

NEW / UPDATED CSS
-----------------
css/site-split.css
css/subpages.css
css/shop-page.css

NEW / UPDATED SHOP JS
---------------------
js/shop.js
js/shop-config.js

IMPORTANT — MERCHANT WALLET
----------------------------
Checkout is intentionally LOCKED until the receiving wallet is configured.

Open:
  js/shop-config.js

Change:
  merchantWallet: "",

To:
  merchantWallet: "YOUR_PUBLIC_SOLANA_ADDRESS",

Use ONLY a public Solana address. NEVER put a seed phrase or private key in the
website/repository.

CURRENT CHECKOUT FLOW
---------------------
- Connect Phantom on the hosted HTTPS site.
- Add the 1% Better Tee to cart.
- Enter shipping details.
- Checkout creates a Solana USDC SPL-token transfer.
- Phantom displays the transaction and the buyer must approve it.
- The configured W3BC receiving wallet must already have a Solana USDC token account.
- Buyer needs a small amount of SOL for the normal Solana network fee.
- A local receipt/order code is stored in the buyer's browser after confirmation.

IMPORTANT — ORDER FULFILLMENT
------------------------------
The static GitHub site does NOT yet send the shipping details to W3BC.
Do not turn live payments on for customers until an order backend/form endpoint
is added, unless you have another explicit process for collecting the shipping
information.

HOSTING NOTE
------------
Phantom's injected provider is intended for HTTPS (or localhost during testing).
Test the wallet button from the deployed site, not by double-clicking shop.html
from your computer.
