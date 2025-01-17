import { Avatar } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4, 5].map((_, i) => (
        <div key={i} className="flex items-center">
          <Avatar className="h-9 w-9">
            <img
              src={`https://i.pravatar.cc/150?img=${i}`}
              alt="Avatar"
              className="rounded-full"
            />
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium">User Activity</p>
            <p className="text-sm text-muted-foreground">
              {`${i + 1} minute${i !== 0 ? 's' : ''} ago`}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {['Played track', 'Created playlist', 'Shared music', 'Added favorite', 'Updated profile'][i]}
          </div>
        </div>
      ))}
    </div>
  );
}
