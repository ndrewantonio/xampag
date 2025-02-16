'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Hero() {
  return (
    <section className="bg-gray-primary flex h-[700px] w-full flex-col justify-between rounded-[32px] p-12">
      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-4xl font-semibold">xamPAG</h1>
        <ConnectButton />
      </div>

      {/* Hero Section */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col gap-4 text-center text-[75px] font-semibold text-black">
          <h1 className="">Trusted</h1>
          <h1 className="">Reliable</h1>
          <h1 className="">Secure</h1>
        </div>
      </div>
    </section>
  )
}
