import { Address, BigInt, ethereum, store } from "@graphprotocol/graph-ts";
import { Option, User, OptionUnitsMapping } from "../generated/schema";
import { 
  OptionClaimed, 
  OptionBought, 
  OptionCreated, 
  Response,
  TransferBatch,
  TransferSingle,
  CustomOptionCreated, 
  erroredClaimed, 
  OptionDeleted
} from "../generated/Opto/Opto";

const rpcCallNames = [
  "None",
  "Apple",
  "Amazon",
  "Coinbase",
  "Alphabet",
  "Microsoft",
  "Nvidia",
  "Tesla",
  "Gold",
  "Silver"
];

export function handleTransferBatch(event: TransferBatch): void {
    // non me va 
}

export function handleTransferSingle(event: TransferSingle): void {
  let oldUser = User.load(event.params.from.toHexString());
  if (oldUser) {
    let optionId = event.params.id.toString();
    if (oldUser.options && oldUser.options!.includes(optionId)) {
      let index = oldUser.options!.indexOf(optionId);
      if (index !== -1) {
        oldUser.options!.splice(index, 1);
        oldUser.save();
      }
    }
    let oldUserMappingId = `${oldUser.id}-${event.params.id.toString()}`;
    let oldUserMapping = OptionUnitsMapping.load(oldUserMappingId);
    if (oldUserMapping){
      oldUserMapping.units = oldUserMapping.units.minus(event.params.value)
      oldUserMapping.save();
    }
  }
  
  let newUser = User.load(event.params.to.toHexString());
  if (!newUser) {
    newUser = new User(event.params.to.toHexString());
    newUser.options = [event.params.id.toString()]; 

    let mappingId = `${newUser.id}-${event.params.id.toString()}`;
    let mapping = OptionUnitsMapping.load(mappingId);
    if (!mapping) {
      mapping = new OptionUnitsMapping(mappingId);
    }
    mapping.user = newUser.id!; // Ensure newUser.id is not null
    mapping.option = event.params.id.toString();
    mapping.units = event.params.value; // Assign units from the Option entity
    mapping.save();

    newUser.save();

  } else  if (newUser && newUser.options) {
    // Add the option to the new user
    newUser.options!.push(event.params.id.toString());
    newUser.save();
    
    // Create or update the OptionUnitsMapping for the new user and option
    let option = Option.load(event.params.id.toString());
    if (option) {
      let mappingId = `${newUser.id}-${option.id}`;
      let mapping = OptionUnitsMapping.load(mappingId);
      if (!mapping) {
        mapping = new OptionUnitsMapping(mappingId);
      }
      mapping.user = newUser.id!; // Ensure newUser.id is not null
      mapping.option = option.id;
      mapping.units = option.units; // Assign units from the Option entity
      mapping.save();
    }
  }
}


export function handleOptionBought(event: OptionBought): void {
    let option = Option.load(event.params.optionId.toString());
    if (option){
      if (option.premiumCollected && option.unitsLeft){
        option.premiumCollected = (option.premiumCollected!).plus(option.premium);
        option.unitsLeft = option.unitsLeft!.minus(event.params.units);
      }
      option.save();
    }
}

export function handleOptionClaimed(event: OptionClaimed): void {
    let user = event.params.claimer.toHexString();
    let option = event.params.optionId.toString();
    
    let mappingId = `${user}-${option}`;
    let mapping = OptionUnitsMapping.load(mappingId);
    if (mapping) {
      mapping.claimed = true;
      mapping.save();  
    }
}

export function handleErroredClaimed(event: erroredClaimed): void {
    let user = event.params.claimer.toHexString();
    let option = event.params.optionId.toString();
    
    let mappingId = `${user}-${option}`;
    let mapping = OptionUnitsMapping.load(mappingId);
    if (mapping) {
      mapping.errorClaim = true;
      mapping.save();
    }
  
}

export function handleResponse(event: Response): void {
  let option = Option.load(event.params.optionId.toString());
  if (option) {
    if (event.params.response && event.params.response.toString().length > 0){
      option.responseValue = BigInt.fromByteArray(event.params.response);
      option.hasToPay = event.params.hasToPay;
    } 
    if (!option.responseValue){
      option.isErrored = true;
    }
    option.save();
  }
}


export function handleOptionDeleted(event: OptionDeleted): void {
  let option = Option.load(event.params.optionId.toString());
  if (option){
    option.isDeleted = true;
    option.save();
  }
}


export function handleCustomOptionCreated(event: CustomOptionCreated): void {
  let option = Option.load(event.params.optionId.toString());
  if (!option){
    option = new Option(event.params.optionId.toString());
    option.writer = event.params.writer.toHexString();
    option.isCall = event.params.isCall;
    option.premium = event.params.premium;
    option.strikePrice = event.params.strikePrice;
    option.expirationDate = event.params.expirationDate;
    option.units = event.params.units;
    option.unitsLeft = event.params.units;
    option.capPerUnit = event.params.capPerUnit;
    option.countervalue = (event.params.capPerUnit).times(event.params.units);
    option.premiumCollected = BigInt.fromI32(0);
    option.name = event.params.name;
    option.desc = event.params.desc;
    option.save();
  }
}


export function handleOptionCreated(event: OptionCreated): void {
  let option = Option.load(event.params.optionId.toString());
  if (!option){
    option = new Option(event.params.optionId.toString());
    option.writer = event.params.writer.toHexString();
    option.isCall = event.params.isCall;
    option.premium = event.params.premium;
    option.strikePrice = event.params.strikePrice;
    option.expirationDate = event.params.expirationDate;
    option.units = event.params.units;
    option.unitsLeft = event.params.units;
    option.capPerUnit = event.params.capPerUnit;
    option.countervalue = (event.params.capPerUnit).times(event.params.units);
    option.premiumCollected = BigInt.fromI32(0);
    if (event.params.optionType == 0){
      option.name = rpcCallNames[event.params.assetId.toI32()]
    }
    if (event.params.optionType == 1){
      if (event.params.optionQueryId.gt(BigInt.fromI32(2))){
        option.name = "Ethereum Blob Gas"
      } else {
        if (event.params.optionQueryId.equals(BigInt.fromI32(2))){
          option.name = "AVAX gas price";
        }
        if (event.params.optionQueryId.equals(BigInt.fromI32(3))){
          option.name = "BSC gas price";
        }
        if (event.params.optionQueryId.equals(BigInt.fromI32(1))){
          option.name = "ETH gas price";
        }
      }
      
    }
   
    option.save();
  }
}
