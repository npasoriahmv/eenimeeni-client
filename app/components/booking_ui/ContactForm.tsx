import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Phone, CheckCircle2, RefreshCw } from "lucide-react"

interface ContactFormCompactProps {
    phoneNumber: string
    sendingOTP: boolean
    otp: string
    isVerified: boolean
    resendTimer: number
    isVerifying: boolean
    onPhoneChange: (value: string) => void
    onOtpChange: (value: string) => void
    onSendOTP: () => void
    onVerifyOTP: () => void
    onResendOTP: () => void
    onChangePhone: () => void
}

export function ContactFormCompact({
    phoneNumber,
    sendingOTP,
    otp,
    isVerified,
    resendTimer,
    isVerifying,
    onPhoneChange,
    onOtpChange,
    onSendOTP,
    onVerifyOTP,
    onResendOTP,
    onChangePhone,
}: ContactFormCompactProps) {
    return (
        <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Verification
            </h3>
            
            <div className="space-y-3">
                {/* Phone Number Input */}
                {isVerified ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Verified
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    +91 {phoneNumber}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onChangePhone}
                            className="text-green-700 hover:text-green-900"
                        >
                            Change
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={phoneNumber}
                            onChange={(e) => onPhoneChange(e.target.value)}
                            className="flex-1"
                            disabled={sendingOTP}
                            maxLength={10}
                        />
                        <Button
                            onClick={onSendOTP}
                            variant="default"
                            disabled={!phoneNumber || phoneNumber.length < 10 || sendingOTP}
                            className="shrink-0"
                        >
                            Send OTP
                        </Button>
                    </div>
                )}

                {/* OTP Input Section */}
                {sendingOTP && !isVerified && (
                    <div className="animate-in slide-in-from-top-2 space-y-3">
                        <div className="text-xs text-muted-foreground">
                            Enter 6-digit OTP sent to +91 {phoneNumber}
                        </div>
                        
                        <InputOTP 
                            maxLength={6} 
                            value={otp} 
                            onChange={onOtpChange}
                            disabled={isVerifying}
                        >
                            <InputOTPGroup className="gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <InputOTPSlot 
                                        key={i} 
                                        index={i} 
                                        className="w-10 h-10" 
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={onVerifyOTP}
                                className="flex-1"
                                disabled={otp.length !== 6 || isVerifying}
                            >
                                {isVerifying ? "Verifying..." : "Verify OTP"}
                            </Button>
                            
                            <Button
                                onClick={onResendOTP}
                                variant="outline"
                                disabled={resendTimer > 0}
                                className="shrink-0"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                {resendTimer > 0 ? `${resendTimer}s` : "Resend"}
                            </Button>
                        </div>

                        {/* Resend Info */}
                        {resendTimer > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                Resend available in {resendTimer} seconds
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}