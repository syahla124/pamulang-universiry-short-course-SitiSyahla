import { Injectable } from '@nestjs/common';
import { createPublicClient, http, PublicClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
    });

    this.contractAddress =
      '0x4fe8677b19e7908fd4898a10d2bf687dd0dcb5f7' as `0x${string}`;
  }

  // 🔹 Read latest value
  async getLatestValue() {
    const value = (await this.client.readContract({
      address: this.contractAddress,
      abi: SIMPLE_STORAGE.abi,
      functionName: 'getValue',
    })) as bigint;

    return {
      value: value.toString(),
    };
  }

  // 🔹 Read ValueUpdated events (RAPI & FIX)
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    const logs = await this.client.getLogs({
      address: this.contractAddress,
      event: {
        type: 'event',
        name: 'ValueUpdated',
        inputs: [{ indexed: false, name: 'value', type: 'uint256' }],
      },
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
    });

    return logs.map((log) => ({
      blockNumber: Number(log.blockNumber),
      value: log.args?.value?.toString(),
    }));
  }
}
