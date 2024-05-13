import { Address, BigInt, ethereum, store} from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/AvaxGasFetcher/USDC";
import { Block, FeeAggregator } from "../generated/schema";

const DAY: BigInt = BigInt.fromI32(24 * 60 * 60);
const WEEK: BigInt = BigInt.fromI32(7 * 24 * 60 * 60);
const MONTH: BigInt = BigInt.fromI32(30 * 24 * 60 * 60);


// Define a constant for the time interval (in blocks) over which to calculate the average base fee
//0x0F259D1224D161657A8E06622c13565920Ea673e
export function handleTransfer(event: Transfer): void {
  // current baseFeePerGas 
  let blockBaseFee = event.block.baseFeePerGas;

  

  // load current event's block and later check if it exist
  let block = Block.load(event.block.timestamp.toI32().toString());
  if (!block) {

  
      // adds objects as entities with given id
      block = new Block(event.block.timestamp.toI32().toString());
      // update base fee in entities
      block.baseFee = blockBaseFee!;
      block.blockId = event.block.number;
      // update base timestamp related to entity Block
      block.timestamp = event.block.timestamp;
     
      block.save();

      // load FeeAggregator entity with id "init" or initialize it if it doesn't exist
      let feeAggregator = FeeAggregator.load("init");
      if (!feeAggregator) { 
        feeAggregator = new FeeAggregator("init");
        feeAggregator.daily = [];
      }
      
      // add the current block's timestamp to the daily array
      feeAggregator.daily = feeAggregator.daily!.concat([event.block.timestamp.toI32().toString()]);
      let newDaily: string[] = [];
        let thresholdTimestamp = event.block.timestamp.minus(DAY);
      
        for (let i = 0; i < feeAggregator.daily.length; i++) {
          let blockId = feeAggregator.daily[i];
          let block = Block.load(blockId);
          if (block && block.timestamp.ge(thresholdTimestamp)) {
            newDaily = newDaily!.concat([block.timestamp.toI32().toString()]);
          }
        }
        
        feeAggregator.daily = newDaily;
        
        let dailyTotBaseFee = BigInt.fromI32(0);
     
        for (let i = 0; i < newDaily.length; i++) {
          let blockId = newDaily[i];
          let block = Block.load(blockId);
          dailyTotBaseFee = dailyTotBaseFee.plus(block!.baseFee);

        }
        
        let gasdailyAverage = dailyTotBaseFee.div(BigInt.fromI32(newDaily.length)); 
       
        feeAggregator.gas_average_daily = gasdailyAverage;
        
        
      feeAggregator.save();
  }
}
