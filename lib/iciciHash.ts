import crypto from "crypto";

interface HashMessage {
  merchantId: string;
  merchantTxnNo: string;
  amount: string;
  currencyCode: string;
  payType: string;
  customerEmailID: string;
  transactionType: string;
  returnURL: string;
  txnDate: string;
  customerMobileNo: string;
  customerName: string;
  aggregatorID:string;
}

const keyString = process.env.ICICI_KEY

export function generateTxnDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function IciciHash({
  merchantId, merchantTxnNo,
  amount, currencyCode,
  payType, customerEmailID, customerMobileNo,
  transactionType,
  returnURL, txnDate,customerName, aggregatorID

}: HashMessage) {
  const message = aggregatorID +amount + currencyCode + customerEmailID + customerMobileNo
    + customerName + merchantId + merchantTxnNo + payType + returnURL + transactionType + txnDate;

  console.log("Hash Message", message);

  if (!keyString) {
    return { status: false, message: 'Key String is missing' }
  }
  console.log(keyString)
  const hmac = crypto.createHmac('sha256', keyString);
  hmac.update(message);

  return { status: true, message: hmac.digest('hex') }
}

export function generateMerchantTxnNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}${random}`;
}
