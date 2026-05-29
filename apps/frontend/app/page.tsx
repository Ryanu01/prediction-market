"use client";

import { useEffect, useState } from "react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const wallet = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function authenticate() {
      try {
        if(!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
          return;
        }
  
        const message = `Login to Prediction Market: ${Date.now()}`
  
        const encodedMessage = new TextEncoder().encode(message);
  
        const signature = await wallet.signMessage(encodedMessage);
  
        const response = await fetch("http://localhost:3001/auth/wallet", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            publicKey: wallet.publicKey.toString(),
            message,
            signature: bs58.encode(signature)
          })
        })
  
        const data = await response.json()
  
        localStorage.setItem("token", data.token);
  
      } catch (error) {
        console.error(error)
      }
      
    }

    authenticate()
  }, [
    wallet.connected,
    wallet.publicKey,
    wallet.signMessage
  ])

  if (!mounted) return null;
  console.log(wallet.wallet?.adapter.name);
  
  return (
    <div>
      <div>
        
        {JSON.stringify(wallet.publicKey)}
        {wallet.publicKey ? (
          <div>
            <WalletDisconnectButton onClick={() => {
            localStorage.clear()
            localStorage.removeItem("token")
          }} />
          </div>
        ) : (
          <WalletMultiButton  />
        )}
      </div>
    </div >
  );
}
