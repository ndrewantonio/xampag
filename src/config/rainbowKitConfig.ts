import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mantaSepoliaTestnet } from 'viem/chains'

export const config = getDefaultConfig({
  appName: 'xamPAG',
  projectId: '5ed3b7b79e7b6068a12d33636fa78503',
  chains: [mantaSepoliaTestnet],
  ssr: true,
})
