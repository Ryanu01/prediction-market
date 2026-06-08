"use client";

import { useEffect, useState } from "react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

export default function Home() {
  const wallet = useWallet();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  const authenticate = async () => {
    try {
      if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
        alert("Please connect your wallet first.");
        return;
      }

      if (loading) return;

      setLoading(true);

      const message = `Login to Prediction Market: ${Date.now()}`;

      const encodedMessage = new TextEncoder().encode(message);

      const signature = await wallet.signMessage(encodedMessage);

      const response = await fetch(
        "http://localhost:3001/auth/wallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey: wallet.publicKey.toString(),
            message,
            signature: bs58.encode(signature),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);

      setAuthenticated(true);

      alert("Successfully authenticated!");
    } catch (error: any) {

      if (
        error?.message?.includes("User rejected") ||
        error?.name === "WalletSignMessageError"
      ) {
        alert("You cancelled the signature request.");
        return;
      }

      alert("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Prediction Market</h1>

      <p>
        Wallet:{" "}
        {wallet.publicKey
          ? wallet.publicKey.toString()
          : "Not Connected"}
      </p>

      {!wallet.connected ? (
        <WalletMultiButton />
      ) : (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <WalletDisconnectButton
            onClick={() => {
              logout();
            }}
          />

          {!authenticated ? (
            <button
              onClick={authenticate}
              disabled={loading}
            >
              {loading ? "Signing..." : "Sign In"}
            </button>
          ) : (
            <p>✅ Authenticated</p>
          )}
        </div>
      )}
    </div>
  );
}