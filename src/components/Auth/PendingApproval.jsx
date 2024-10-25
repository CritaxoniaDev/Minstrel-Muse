import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const PendingConfirmation = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-20 p-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Account Pending Confirmation
        </CardTitle>
        <CardDescription className="mt-4 text-lg">
          Thank you for registering! Your account is currently pending administrator approval.
        </CardDescription>
      </CardHeader>
      <div className="mt-6 space-y-4 text-center text-muted-foreground">
        <p>We'll notify you via email once your account has been approved.</p>
        <p>This usually takes 24-48 hours.</p>
      </div>
    </Card>
  )
}

export default PendingConfirmation
