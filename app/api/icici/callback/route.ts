import crypto from "crypto";

import { NextResponse, NextRequest } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const HashKey = process.env.ICICI_KEY!
    let formData: Record<string, any> = {};
  
    for (const [key, value] of form.entries()) {
      console.log(key, value)
      formData[key] = value;
    }
  
    const merchantTxnNo = formData["merchantTxnNo"]
    let transactionId = formData["txnID"];
    let responseCode = formData["responseCode"]
    let responseMessage = formData["respDescription"];
    let amount = formData["amount"]
    let rawResponse = formData;
    let paymentMode = formData["paymentMode"]

    const success = ["000", "0000", "R1000"].includes(responseCode);
    const redirectUrl = `/payment/status?status=${success}&merchantTxnNo=${merchantTxnNo}`

    const responseForUser = `
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `
  
    //Dynamic Hash String Generation.
    const sortedKeys = Object.keys(formData)
      .filter(k => k !== "secureHash" && formData[k] !== undefined && formData[k] !== "")
      .sort()
  
    const KeyString = sortedKeys.map(k => formData[k]).join("");
    const hmac = crypto.createHmac("sha256", HashKey);
    hmac.update(KeyString);
    const hashedValue = hmac.digest("hex").toLowerCase();
  
  
    //This portion handles If the Hash Value doesnot match
    if (formData["secureHash"] && hashedValue !== formData["secureHash"]) {
      console.log("Hash mismatched! Possible tampering. ", {
        received: formData["secureHash"],
        calculated: hashedValue,
        formData
      });
     const status = "pending"
     const redirectUrl = `/payment/status?status=${status}&merchantTxnNo=${merchantTxnNo}`
     return new NextResponse(`
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `, {headers: { "Content-Type": "text/html" }})
    }

    const updateTables = await fetch(`${process.env.NEXT_APP_URL}/api/icici/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchantTxnNo,
        transactionId: transactionId || null,
        responseMessage: responseMessage,
        responseCode: responseCode,
        isSuccess: success,
        rawResponse: rawResponse,
        amount: amount || 0,
        paymentMode
      })
    })
    
    const response = await updateTables.json();
    if (response.status === 200) {
      return new NextResponse(responseForUser, {
        headers: { "Content-Type": "text/html" }
      });
    } else {
      console.log("Error in updating Tables")
      console.log(response.error);
      return new NextResponse(responseForUser, {
        headers: { "Content-Type": "text/html" }
      });
    }
  } catch (error) {
    console.log("Error in Callback Route", error);
    const status = "error"
     const redirectUrl = `/payment/status?status=${status}`
     return new NextResponse(`
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `, {headers: { "Content-Type": "text/html" }})
  }
}
