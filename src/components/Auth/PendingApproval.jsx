import { useMediaQuery } from 'react-responsive';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const PendingConfirmation = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  return (
    <Card className={`
      w-full 
      mx-auto 
      ${isMobile ? 'max-w-[95%] mt-10 p-4' : isTablet ? 'max-w-xl mt-16 p-6' : 'max-w-2xl mt-20 p-8'}
    `}>
      <CardHeader className="text-center">
        <CardTitle className={`
          font-bold 
          bg-gradient-to-r from-purple-600 to-blue-600 
          bg-clip-text text-transparent
          ${isMobile ? 'text-2xl' : isTablet ? 'text-2xl' : 'text-3xl'}
        `}>
          Account Pending Confirmation
        </CardTitle>
        <CardDescription className={`
          ${isMobile ? 'mt-2 text-base' : 'mt-4 text-lg'}
        `}>
          Thank you for registering! Your account is currently pending administrator approval.
        </CardDescription>
      </CardHeader>
      <div className={`
        text-center text-muted-foreground
        ${isMobile ? 'mt-4 space-y-2' : 'mt-6 space-y-4'}
      `}>
        <p className={isMobile ? 'text-sm' : 'text-base'}>
          We'll notify you via email once your account has been approved.
        </p>
      </div>
    </Card>
  )
}

export default PendingConfirmation
