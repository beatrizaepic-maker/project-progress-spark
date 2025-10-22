import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold neon-text">Profile</h1>
        <p className="text-muted-foreground">Your account information</p>
      </div>

      <Card className="space-card">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your personal details and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name || 'Commander'}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className="mt-2" variant="outline">{user.role}</Badge>
            </div>
          </div>

          <div className="grid gap-4 pt-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Member Since</label>
              <p className="text-muted-foreground">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Recently joined'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="space-card">
        <CardHeader>
          <CardTitle>Activity Stats</CardTitle>
          <CardDescription>Your performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Activity stats will appear when backend is connected</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
