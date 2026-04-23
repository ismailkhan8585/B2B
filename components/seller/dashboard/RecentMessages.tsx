import { MessageSquare, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RecentMessage } from "@/types/seller/dashboard.types";

interface RecentMessagesProps {
  messages: RecentMessage[];
}

export function RecentMessages({ messages }: RecentMessagesProps) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Messages from buyers will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-3 p-4 border rounded-lg ${!message.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">{message.senderName}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {message.senderRole}
                  </Badge>
                  {!message.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{message.preview}</p>
                <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(message.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Reply
              </Button>
            </div>
          ))}
        </div>
        {messages.length >= 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Messages
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}