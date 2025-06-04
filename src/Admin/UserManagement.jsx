import { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import { collection, query, getDocs, updateDoc, doc } from "firebase/firestore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Users2, Crown, Shield } from "lucide-react";

const UserManagement = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"));
            const querySnapshot = await getDocs(q);
            const usersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        // Find the user to check if they're an owner
        const user = users.find(u => u.id === userId);
        
        // Prevent role changes for owner accounts
        if (user?.role === "owner") {
            toast({
                title: "Access Denied",
                description: "Owner role cannot be modified",
                variant: "destructive",
            });
            return;
        }

        // If current user is admin (not owner), prevent them from assigning owner role
        if (currentUser?.role === "admin" && newRole === "owner") {
            toast({
                title: "Access Denied",
                description: "Only owners can assign owner role",
                variant: "destructive",
            });
            return;
        }

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                role: newRole,
            });

            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));

            toast({
                title: "Role Updated",
                description: "User role has been successfully updated",
                duration: 3000,
            });
        } catch (error) {
            console.error("Error updating role:", error);
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            });
        }
    };

    const handleApprovalChange = async (userId, isApproved) => {
        // Find the user to check if they're an owner
        const user = users.find(u => u.id === userId);
        
        // Prevent approval status changes for owner accounts
        if (user?.role === "owner") {
            toast({
                title: "Access Denied",
                description: "Owner approval status cannot be modified",
                variant: "destructive",
            });
            return;
        }

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                isApproved: isApproved
            });
    
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isApproved } : user
            ));
    
            toast({
                title: "Status Updated",
                description: `User ${isApproved ? 'approved' : 'pending approval'}`,
                duration: 3000,
            });
        } catch (error) {
            console.error("Error updating approval status:", error);
            toast({
                title: "Error",
                description: "Failed to update user status",
                variant: "destructive",
            });
        }
    };

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case "owner":
                return "default";
            case "admin":
                return "destructive";
            case "moderator":
                return "secondary";
            default:
                return "outline";
        }
    };

    const canModifyUser = (user) => {
        // Owner accounts cannot be modified by anyone
        if (user.role === "owner") {
            return false;
        }
        // If current user is admin, they can modify non-owner accounts
        if (currentUser?.role === "admin" || currentUser?.role === "owner") {
            return true;
        }
        return false;
    };

    const getAvailableRoles = () => {
        // If current user is owner, they can assign any role except owner to others
        if (currentUser?.role === "owner") {
            return [
                { value: "user", label: "User" },
                { value: "moderator", label: "Moderator" },
                { value: "admin", label: "Admin" },
                { value: "owner", label: "Owner" }
            ];
        }
        // If current user is admin, they can only assign user, moderator, and admin roles
        if (currentUser?.role === "admin") {
            return [
                { value: "user", label: "User" },
                { value: "moderator", label: "Moderator" },
                { value: "admin", label: "Admin" }
            ];
        }
        return [];
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                User Management
                                {currentUser?.role === "owner" && (
                                    <Crown className="h-6 w-6 text-yellow-500" />
                                )}
                                {currentUser?.role === "admin" && (
                                    <Shield className="h-6 w-6 text-red-500" />
                                )}
                            </CardTitle>
                            <CardDescription>
                                Manage user roles and permissions
                                {currentUser?.role === "owner" && " - Owner Access"}
                                {currentUser?.role === "admin" && " - Admin Access"}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Users2 className="h-4 w-4" />
                            {users.length} Users
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Approval Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>
                                                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{user.displayName}</p>
                                                        {user.role === "owner" && (
                                                            <Crown className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                        {user.role === "admin" && (
                                                            <Shield className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{user.name || user.displayName || 'Anonymous User'}</span>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.isOnline ? "success" : "secondary"}>
                                                {user.isOnline ? "Online" : "Offline"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {user.role === "owner" ? (
                                                <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                                                    <Crown className="h-3 w-3" />
                                                    Owner
                                                </Badge>
                                            ) : canModifyUser(user) ? (
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(value) => handleRoleChange(user.id, value)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableRoles().map((role) => (
                                                            <SelectItem key={role.value} value={role.value}>
                                                                {role.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                                                    {user.role === "admin" && <Shield className="h-3 w-3" />}
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.role === "owner" ? (
                                                <Badge variant="default">
                                                    Always Approved
                                                </Badge>
                                            ) : canModifyUser(user) ? (
                                                <Select
                                                    defaultValue={user.isApproved ? "approved" : "pending"}
                                                    onValueChange={(value) => handleApprovalChange(user.id, value === "approved")}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={user.isApproved ? "default" : "secondary"}>
                                                    {user.isApproved ? "Approved" : "Pending"}
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
