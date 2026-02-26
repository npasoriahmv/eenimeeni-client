"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const PeopleSelector = ({workShopId, amount}:{workShopId:string, amount:number}) => {
  const [count, setCount] = useState(1);
  const [amountCalculated, setamountCalculated] = useState(amount);
  const [blockPayButton, setBlockPayButton] = useState(false)
  const router = useRouter()

  const {status} = useSession();
  const increase = () => {
    setCount((p) => p + 1)
    setamountCalculated((prev)=> prev+amount)
  };
  const decrease = () =>
    {
      setCount((p) => (p > 1 ? p - 1 : p))
      setamountCalculated((prev)=> prev-amount)
    };

  
  const handlePaymentButton = async() => {
    setBlockPayButton(true)
    if(status === "unauthenticated"){
        console.log("Hey I am not Authenticated")
    } else{
      await handlePayment()
    }
  }


  const handlePayment = async() => {
    //Here We will handle if User is Logged In Already
    try {
      const response = await fetch(`/api/workshop/initiate`,{
        method:"POST",
        headers:{'Content-Type':"application/json"},
        body:JSON.stringify({count, workShopId, amount:amountCalculated})
      });
  
      const data = await response.json();
      const {status} = data;
      if(status == 200){
          router.push(data.url)
      }
      else if(status!==200){
          toast.error(data.error)
          setBlockPayButton(false)
      } else{
          toast.error("Something Unexpected")
          setBlockPayButton(false)
      }
    } catch (error) {
      toast.error('Something Went Wrong')
      setBlockPayButton(false)
    }
  }

  return (
    <Card className="border border-border shadow-md rounded-2xl">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6">

        {/* Left Section */}
        <div className="text-left space-y-1">
          <h2 className="text-xl font-semibold">Select Number of Participants</h2>
          <p className="text-muted-foreground text-sm">
            Choose how many kids will attend the workshop
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={decrease}
            disabled={count <= 1}
          >
            –
          </Button>

          <div className="h-10 w-14 flex items-center justify-center border rounded-xl text-lg font-semibold">
            {count}
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={increase}
          >
            +
          </Button>
        </div>

        {/* Pay Button */}
        <Button
          size="lg"
          onClick={handlePaymentButton}
          disabled={blockPayButton}
          className="rounded-xl px-8 text-base font-semibold"
        >
          Proceed to Pay
        </Button>
        {amountCalculated}
      </CardContent>
    </Card>
  );
};
