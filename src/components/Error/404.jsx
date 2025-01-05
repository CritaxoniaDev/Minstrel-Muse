import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center -mt-40">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground">
            The page you're looking for might require authentication or doesn't exist.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Authentication
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
