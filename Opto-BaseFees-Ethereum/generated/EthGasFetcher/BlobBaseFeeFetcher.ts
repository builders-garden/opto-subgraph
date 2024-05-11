// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class BlobBaseFeeFetcher extends ethereum.SmartContract {
  static bind(address: Address): BlobBaseFeeFetcher {
    return new BlobBaseFeeFetcher("BlobBaseFeeFetcher", address);
  }

  getBlobBaseFeeSolidity(): BigInt {
    let result = super.call(
      "getBlobBaseFeeSolidity",
      "getBlobBaseFeeSolidity():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_getBlobBaseFeeSolidity(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getBlobBaseFeeSolidity",
      "getBlobBaseFeeSolidity():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getBlobBaseFeeYul(): BigInt {
    let result = super.call(
      "getBlobBaseFeeYul",
      "getBlobBaseFeeYul():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_getBlobBaseFeeYul(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getBlobBaseFeeYul",
      "getBlobBaseFeeYul():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}