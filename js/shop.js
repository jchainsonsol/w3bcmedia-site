(() => {
  "use strict";

  const CONFIG = Object.assign({
    merchantWallet: "",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    usdcMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    usdcDecimals: 6,
    shippingUsd: 5,
    storeName: "W3BC Media Shop"
  }, window.W3BC_SHOP_CONFIG || {});

  const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
  const ASSOCIATED_TOKEN_PROGRAM_ID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

  let cart = [];
  let provider = null;
  let connectedPublicKey = null;
  let paymentBusy = false;
  let lastPayment = null;

  const $ = (selector) => document.querySelector(selector);
  const money = (value) => `$${Number(value).toFixed(2)}`;
  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function setHint(message, tone = "") {
    const el = $("#walletHint");
    if (!el) return;
    el.textContent = message;
    el.dataset.tone = tone;
  }

  function setCheckoutNote(message, tone = "") {
    const el = $("#checkoutNote");
    if (!el) return;
    el.textContent = message;
    el.dataset.tone = tone;
  }

  function web3Ready() {
    return Boolean(window.solanaWeb3?.PublicKey && window.solanaWeb3?.Transaction);
  }

  function validPublicKey(value) {
    if (!value || !web3Ready()) return false;
    try {
      // eslint-disable-next-line no-new
      new window.solanaWeb3.PublicKey(value);
      return true;
    } catch (_) {
      return false;
    }
  }

  function merchantReady() {
    return validPublicKey(CONFIG.merchantWallet);
  }

  function getPhantomProvider() {
    const injected = window.phantom?.solana;
    if (injected?.isPhantom) return injected;
    if (window.solana?.isPhantom) return window.solana;
    return null;
  }

  function phantomBrowseUrl() {
    const page = encodeURIComponent(window.location.href);
    const ref = encodeURIComponent(window.location.origin);
    return `https://phantom.app/ul/browse/${page}?ref=${ref}`;
  }

  function shortAddress(address) {
    if (!address) return "NOT CONNECTED";
    return `${address.slice(0, 4)}…${address.slice(-4)}`;
  }

  async function connect() {
    provider = getPhantomProvider();

    if (!provider) {
      if (isMobile()) {
        setHint("Opening this shop inside Phantom so you can connect securely.");
        window.location.href = phantomBrowseUrl();
      } else {
        setHint("Phantom was not detected. Install/open Phantom, then reload this page.", "error");
        window.open("https://phantom.com/", "_blank", "noopener,noreferrer");
      }
      return;
    }

    try {
      const response = await provider.connect();
      connectedPublicKey = response.publicKey || provider.publicKey;
      const address = connectedPublicKey?.toString?.() || "";

      $("#walletLabel").textContent = shortAddress(address);
      $("#connectWallet").textContent = "WALLET CONNECTED";
      setHint("Phantom connected on Solana. You will approve any payment inside your wallet.", "success");
      render();
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setHint("Wallet connection was cancelled or failed.", "error");
    }
  }

  function totals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = cart.length ? Number(CONFIG.shippingUsd || 0) : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function shippingComplete() {
    return ["shipName", "shipEmail", "shipAddress", "shipCity", "shipState", "shipZip"]
      .every((id) => $("#" + id)?.value.trim());
  }

  function shippingData() {
    return {
      name: $("#shipName")?.value.trim() || "",
      email: $("#shipEmail")?.value.trim() || "",
      address: $("#shipAddress")?.value.trim() || "",
      city: $("#shipCity")?.value.trim() || "",
      state: $("#shipState")?.value.trim() || "",
      zip: $("#shipZip")?.value.trim() || "",
      country: $("#shipCountry")?.value || "United States"
    };
  }

  function render() {
    const t = totals();
    const cartItems = $("#cartItems");

    cartItems.innerHTML = cart.length
      ? cart.map((item) => `
          <div class="cart-item">
            <span>${item.qty}× ${item.name}<br><small>Size ${item.size}</small></span>
            <strong>${money(item.price * item.qty)}</strong>
          </div>`).join("")
      : "<p>Your cart is empty.</p>";

    $("#subtotal").textContent = money(t.subtotal);
    $("#shipping").textContent = money(t.shipping);
    $("#total").textContent = money(t.total);

    const payButton = $("#payCrypto");
    if (paymentBusy) {
      payButton.disabled = true;
      payButton.textContent = "WAITING FOR WALLET…";
      return;
    }

    if (lastPayment) {
      payButton.disabled = true;
      payButton.textContent = "PAYMENT CONFIRMED";
      setCheckoutNote(`PAYMENT CONFIRMED — ${lastPayment.orderCode}. Keep this code and your Solana transaction signature for your records.`, "success");
    } else if (!merchantReady()) {
      payButton.disabled = true;
      payButton.textContent = "CHECKOUT SETUP IN PROGRESS";
      setCheckoutNote("Wallet connection is live. Payments stay locked until the W3BC merchant public address is added to js/shop-config.js.");
    } else if (!cart.length) {
      payButton.disabled = true;
      payButton.textContent = "ADD SOMETHING TO CART";
      setCheckoutNote("Add an item, enter shipping details, then connect Phantom to pay in USDC on Solana.");
    } else if (!shippingComplete()) {
      payButton.disabled = true;
      payButton.textContent = "ENTER SHIPPING INFO";
      setCheckoutNote("Complete the shipping form before checkout.");
    } else {
      payButton.disabled = false;
      payButton.textContent = connectedPublicKey
        ? `PAY ${t.total.toFixed(2)} USDC`
        : `CONNECT + PAY ${t.total.toFixed(2)} USDC`;
      setCheckoutNote("USDC payment is sent on Solana. Your wallet will show the transaction for approval before anything is signed.");
    }
  }

  function deriveAta(owner, mint) {
    const web3 = window.solanaWeb3;
    const tokenProgram = new web3.PublicKey(TOKEN_PROGRAM_ID);
    const associatedProgram = new web3.PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID);

    return web3.PublicKey.findProgramAddressSync(
      [owner.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()],
      associatedProgram
    )[0];
  }

  function u64LittleEndian(value) {
    let n = BigInt(value);
    const out = new Uint8Array(8);
    for (let i = 0; i < 8; i += 1) {
      out[i] = Number(n & 255n);
      n >>= 8n;
    }
    return out;
  }

  function createTransferCheckedInstruction(source, mint, destination, owner, rawAmount, decimals) {
    const web3 = window.solanaWeb3;
    const data = new Uint8Array(10);
    data[0] = 12; // SPL Token TransferChecked
    data.set(u64LittleEndian(rawAmount), 1);
    data[9] = decimals;

    return new web3.TransactionInstruction({
      programId: new web3.PublicKey(TOKEN_PROGRAM_ID),
      keys: [
        { pubkey: source, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false }
      ],
      data
    });
  }

  function makeOrderCode() {
    return `W3BC-${Date.now().toString(36).toUpperCase()}`;
  }

  function saveLocalReceipt(signature, orderCode) {
    const receipt = {
      orderCode,
      signature,
      paidAt: new Date().toISOString(),
      payment: { asset: "USDC", network: "Solana", amount: totals().total },
      cart,
      shipping: shippingData()
    };

    try {
      localStorage.setItem("w3bc_last_order", JSON.stringify(receipt));
    } catch (_) {
      // Receipt storage is helpful, but payment success must not depend on it.
    }
  }

  async function payWithConnectedPhantom() {
    if (!web3Ready()) throw new Error("Solana library did not load. Please reload the page.");
    if (!merchantReady()) throw new Error("W3BC merchant wallet is not configured.");

    provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom is not available in this browser.");

    if (!connectedPublicKey) {
      const response = await provider.connect();
      connectedPublicKey = response.publicKey || provider.publicKey;
    }

    if (!connectedPublicKey) throw new Error("Could not read the connected wallet address.");

    const web3 = window.solanaWeb3;
    const owner = new web3.PublicKey(connectedPublicKey.toString());
    const merchant = new web3.PublicKey(CONFIG.merchantWallet);
    const mint = new web3.PublicKey(CONFIG.usdcMint);
    const senderAta = deriveAta(owner, mint);
    const merchantAta = deriveAta(merchant, mint);
    const connection = new web3.Connection(CONFIG.rpcUrl, "confirmed");

    const [senderAccount, merchantAccount] = await Promise.all([
      connection.getAccountInfo(senderAta),
      connection.getAccountInfo(merchantAta)
    ]);
    if (!senderAccount) {
      throw new Error("This wallet does not have a Solana USDC token account. Add USDC and try again.");
    }
    if (!merchantAccount) {
      throw new Error("W3BC checkout is not ready yet: the receiving wallet needs a Solana USDC token account.");
    }

    const total = totals().total;
    const rawAmount = BigInt(Math.round(total * (10 ** CONFIG.usdcDecimals)));
    const latest = await connection.getLatestBlockhash("confirmed");
    const transaction = new web3.Transaction({
      feePayer: owner,
      recentBlockhash: latest.blockhash
    });

    transaction.add(createTransferCheckedInstruction(
      senderAta,
      mint,
      merchantAta,
      owner,
      rawAmount,
      CONFIG.usdcDecimals
    ));

    const result = await provider.signAndSendTransaction(transaction);
    const signature = result?.signature || result;
    if (!signature) throw new Error("Wallet returned no transaction signature.");

    await connection.confirmTransaction({
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight
    }, "confirmed");

    return signature;
  }

  async function checkout() {
    if (paymentBusy || !cart.length || !shippingComplete() || !merchantReady()) return;

    paymentBusy = true;
    render();
    setCheckoutNote("Building your USDC transaction. Confirm the amount and recipient inside Phantom before approving.");

    try {
      const signature = await payWithConnectedPhantom();
      const orderCode = makeOrderCode();
      saveLocalReceipt(signature, orderCode);
      lastPayment = { orderCode, signature };

      setCheckoutNote(`PAYMENT CONFIRMED — ${orderCode}. Keep this order code and transaction signature for your records.`, "success");
      setHint("Payment confirmed on Solana.", "success");
      cart = [];
    } catch (error) {
      console.error("Checkout failed:", error);
      const message = error?.message || "Payment was cancelled or failed.";
      setCheckoutNote(message, "error");
    } finally {
      paymentBusy = false;
      render();
    }
  }

  $("#connectWallet")?.addEventListener("click", connect);
  $("#addTee")?.addEventListener("click", () => {
    lastPayment = null;
    cart = [{
      name: "1% Better Tee",
      price: 25,
      qty: Number($("#teeQty").value),
      size: $("#teeSize").value
    }];
    render();
    window.location.hash = "checkout";
  });
  $("#clearCart")?.addEventListener("click", () => {
    cart = [];
    render();
  });
  ["shipName", "shipEmail", "shipAddress", "shipCity", "shipState", "shipZip"]
    .forEach((id) => $("#" + id)?.addEventListener("input", render));
  $("#payCrypto")?.addEventListener("click", checkout);

  const injected = getPhantomProvider();
  if (injected?.isConnected && injected.publicKey) {
    provider = injected;
    connectedPublicKey = injected.publicKey;
    $("#walletLabel").textContent = shortAddress(connectedPublicKey.toString());
    $("#connectWallet").textContent = "WALLET CONNECTED";
  }

  render();
})();
